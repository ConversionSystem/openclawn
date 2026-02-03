import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { streamSSE } from 'hono/streaming'
import { authMiddleware } from '../middleware/auth'
import { rateLimitMiddleware } from '../middleware/rateLimit'
import {
  getConversationsByUserId,
  getConversationWithMessages,
  createConversation,
  createMessage,
  deleteConversation,
  getMessagesByConversationId,
} from '../db/queries/conversations'
import { orchestrate, type OrchestratorResult } from '../services/ai/orchestrator'

const chat = new Hono()

// Apply auth to all chat routes
chat.use('*', authMiddleware)

/**
 * GET /conversations - List user's conversations
 */
chat.get('/conversations', async (c) => {
  const user = c.get('user')

  const conversations = await getConversationsByUserId(user.id)

  return c.json({
    success: true,
    data: conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updatedAt,
    })),
  })
})

/**
 * POST /conversations - Create a new conversation
 */
chat.post('/conversations', async (c) => {
  const user = c.get('user')

  const conversation = await createConversation({
    userId: user.id,
    title: null,
    context: {},
  })

  return c.json({
    success: true,
    data: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
    },
  })
})

/**
 * GET /conversations/:id - Get conversation with messages
 */
chat.get('/conversations/:id', async (c) => {
  const user = c.get('user')
  const conversationId = c.req.param('id')

  const result = await getConversationWithMessages(conversationId, user.id)

  if (!result) {
    throw new HTTPException(404, { message: 'Conversation not found' })
  }

  return c.json({
    success: true,
    data: {
      conversation: {
        id: result.conversation.id,
        title: result.conversation.title,
        createdAt: result.conversation.createdAt,
        updatedAt: result.conversation.updatedAt,
      },
      messages: result.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    },
  })
})

/**
 * DELETE /conversations/:id - Delete a conversation
 */
chat.delete('/conversations/:id', async (c) => {
  const user = c.get('user')
  const conversationId = c.req.param('id')

  await deleteConversation(conversationId, user.id)

  return c.json({ success: true })
})

// Message schema
const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  conversationId: z.string().uuid().optional(),
})

/**
 * POST /conversations/:id/messages - Send a message and get AI response (streaming)
 */
chat.post(
  '/conversations/:id/messages',
  rateLimitMiddleware(),
  zValidator('json', sendMessageSchema),
  async (c) => {
    const user = c.get('user')
    const conversationId = c.req.param('id')
    const { content } = c.req.valid('json')

    // Verify conversation ownership
    const result = await getConversationWithMessages(conversationId, user.id)
    if (!result) {
      throw new HTTPException(404, { message: 'Conversation not found' })
    }

    // Save user message
    await createMessage({
      conversationId,
      role: 'user',
      content,
      channel: 'web',
    })

    // Stream AI response
    return streamSSE(c, async (stream) => {
      try {
        const generator = orchestrate({
          userMessage: content,
          conversationMessages: result.messages,
          userId: user.id,
          userTier: user.tier,
          userName: user.name ?? undefined,
        })

        let fullContent = ''
        let aiResult: OrchestratorResult | undefined

        // Consume the generator
        let iterResult = await generator.next()
        while (!iterResult.done) {
          const chunk = iterResult.value
          if (chunk.type === 'text' && chunk.content) {
            fullContent += chunk.content
            await stream.writeSSE({
              event: 'text',
              data: JSON.stringify({ content: chunk.content }),
            })
          }
          iterResult = await generator.next()
        }

        // Get the return value
        aiResult = iterResult.value

        // Save assistant message
        if (aiResult) {
          const assistantMessage = await createMessage({
            conversationId,
            role: 'assistant',
            content: aiResult.content,
            channel: 'web',
            modelUsed: aiResult.modelUsed,
            tokensIn: aiResult.tokensIn,
            tokensOut: aiResult.tokensOut,
            costCents: aiResult.costCents,
            cached: aiResult.cached,
          })

          await stream.writeSSE({
            event: 'done',
            data: JSON.stringify({
              messageId: assistantMessage.id,
              modelUsed: aiResult.modelUsed,
            }),
          })
        }
      } catch (error) {
        console.error('Streaming error:', error)
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({
            error: 'An error occurred while generating the response',
          }),
        })
      }
    })
  }
)

/**
 * POST /chat - Quick message without explicit conversation (creates one)
 */
chat.post(
  '/',
  rateLimitMiddleware(),
  zValidator('json', sendMessageSchema),
  async (c) => {
    const user = c.get('user')
    const { content, conversationId: existingConvId } = c.req.valid('json')

    let conversationId = existingConvId
    let existingMessages: Awaited<ReturnType<typeof getMessagesByConversationId>> = []

    // Create conversation if needed
    if (!conversationId) {
      const conversation = await createConversation({
        userId: user.id,
        title: content.slice(0, 50),
        context: {},
      })
      conversationId = conversation.id
    } else {
      // Verify ownership and get messages
      const result = await getConversationWithMessages(conversationId, user.id)
      if (!result) {
        throw new HTTPException(404, { message: 'Conversation not found' })
      }
      existingMessages = result.messages
    }

    // Save user message
    await createMessage({
      conversationId,
      role: 'user',
      content,
      channel: 'web',
    })

    // Stream AI response
    return streamSSE(c, async (stream) => {
      // Send conversation ID first
      await stream.writeSSE({
        event: 'conversation',
        data: JSON.stringify({ conversationId }),
      })

      try {
        const generator = orchestrate({
          userMessage: content,
          conversationMessages: existingMessages,
          userId: user.id,
          userTier: user.tier,
          userName: user.name ?? undefined,
        })

        let fullContent = ''
        let aiResult: OrchestratorResult | undefined

        // Consume the generator
        let iterResult = await generator.next()
        while (!iterResult.done) {
          const chunk = iterResult.value
          if (chunk.type === 'text' && chunk.content) {
            fullContent += chunk.content
            await stream.writeSSE({
              event: 'text',
              data: JSON.stringify({ content: chunk.content }),
            })
          }
          iterResult = await generator.next()
        }

        // Get the return value
        aiResult = iterResult.value

        // Save assistant message
        if (aiResult) {
          await createMessage({
            conversationId: conversationId!,
            role: 'assistant',
            content: aiResult.content,
            channel: 'web',
            modelUsed: aiResult.modelUsed,
            tokensIn: aiResult.tokensIn,
            tokensOut: aiResult.tokensOut,
            costCents: aiResult.costCents,
            cached: aiResult.cached,
          })
        }

        await stream.writeSSE({
          event: 'done',
          data: JSON.stringify({ conversationId }),
        })
      } catch (error) {
        console.error('Chat error:', error)
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({ error: 'Failed to generate response' }),
        })
      }
    })
  }
)

export { chat }
