import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { streamSSE } from 'hono/streaming'

// Demo server - works without database or external APIs
const app = new Hono()

// In-memory storage for demo
const users = new Map<string, { id: string; email: string; name: string; tier: string }>()
const sessions = new Map<string, string>() // token -> userId
const conversations = new Map<string, { id: string; userId: string; title: string; messages: any[] }>()

// Create demo user
const demoUser = {
  id: 'demo-user-123',
  email: 'demo@assistant.ai',
  name: 'Demo User',
  tier: 'solo',
}
users.set(demoUser.id, demoUser)
sessions.set('demo-token', demoUser.id)

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: (origin) => {
    // Allow any origin for demo purposes
    return origin || '*'
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// Auth middleware for demo
const getUser = (c: any) => {
  // Always return demo user for testing
  return demoUser
}

// Health check
app.get('/health', (c) => c.json({ status: 'healthy', mode: 'demo' }))

// Auth routes
app.get('/auth/me', (c) => {
  const user = getUser(c)
  return c.json({ success: true, data: user })
})

app.post('/auth/logout', (c) => {
  return c.json({ success: true })
})

// Demo login - auto-login
app.get('/auth/demo', (c) => {
  return c.json({ success: true, data: { token: 'demo-token', user: demoUser } })
})

// Conversations
app.get('/chat/conversations', (c) => {
  const user = getUser(c)
  const userConvs = Array.from(conversations.values())
    .filter(conv => conv.userId === user.id)
    .map(conv => ({ id: conv.id, title: conv.title, updatedAt: new Date() }))
  return c.json({ success: true, data: userConvs })
})

app.post('/chat/conversations', (c) => {
  const user = getUser(c)
  const id = `conv-${Date.now()}`
  const conv = { id, userId: user.id, title: 'New conversation', messages: [] }
  conversations.set(id, conv)
  return c.json({ success: true, data: { id, title: conv.title, createdAt: new Date() } })
})

app.get('/chat/conversations/:id', (c) => {
  const id = c.req.param('id')
  const conv = conversations.get(id)
  if (!conv) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, 404)
  }
  return c.json({
    success: true,
    data: {
      conversation: { id: conv.id, title: conv.title, createdAt: new Date(), updatedAt: new Date() },
      messages: conv.messages,
    },
  })
})

app.delete('/chat/conversations/:id', (c) => {
  const id = c.req.param('id')
  conversations.delete(id)
  return c.json({ success: true })
})

// Send message with streaming response
app.post('/chat/conversations/:id/messages', async (c) => {
  const id = c.req.param('id')
  let conv = conversations.get(id)
  
  if (!conv) {
    // Create conversation if doesn't exist
    conv = { id, userId: demoUser.id, title: 'New conversation', messages: [] }
    conversations.set(id, conv)
  }

  const body = await c.req.json()
  const userMessage = body.content

  // Save user message
  const userMsg = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: userMessage,
    createdAt: new Date(),
  }
  conv.messages.push(userMsg)

  // Update title if first message
  if (conv.messages.length === 1) {
    conv.title = userMessage.slice(0, 50)
  }

  // Generate AI response
  const aiResponse = generateDemoResponse(userMessage)

  return streamSSE(c, async (stream) => {
    // Stream the response word by word
    const words = aiResponse.split(' ')
    let fullContent = ''

    for (const word of words) {
      fullContent += (fullContent ? ' ' : '') + word
      await stream.writeSSE({
        event: 'text',
        data: JSON.stringify({ content: word + ' ' }),
      })
      await new Promise(resolve => setTimeout(resolve, 50)) // Simulate typing
    }

    // Save assistant message
    const assistantMsg = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      createdAt: new Date(),
    }
    conv!.messages.push(assistantMsg)

    await stream.writeSSE({
      event: 'done',
      data: JSON.stringify({ messageId: assistantMsg.id, modelUsed: 'demo' }),
    })
  })
})

// Quick chat endpoint
app.post('/chat', async (c) => {
  const body = await c.req.json()
  const userMessage = body.content
  let convId = body.conversationId

  if (!convId) {
    convId = `conv-${Date.now()}`
    const conv = { id: convId, userId: demoUser.id, title: userMessage.slice(0, 50), messages: [] }
    conversations.set(convId, conv)
  }

  let conv = conversations.get(convId)!

  // Save user message
  conv.messages.push({
    id: `msg-${Date.now()}`,
    role: 'user',
    content: userMessage,
    createdAt: new Date(),
  })

  const aiResponse = generateDemoResponse(userMessage)

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: 'conversation',
      data: JSON.stringify({ conversationId: convId }),
    })

    const words = aiResponse.split(' ')
    let fullContent = ''

    for (const word of words) {
      fullContent += (fullContent ? ' ' : '') + word
      await stream.writeSSE({
        event: 'text',
        data: JSON.stringify({ content: word + ' ' }),
      })
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    conv.messages.push({
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      createdAt: new Date(),
    })

    await stream.writeSSE({
      event: 'done',
      data: JSON.stringify({ conversationId: convId }),
    })
  })
})

// User routes
app.get('/user/usage', (c) => {
  return c.json({
    success: true,
    data: {
      currentPeriod: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      messagesUsed: 42,
      messagesLimit: 1000,
      percentUsed: 4,
      tier: 'solo',
      features: ['web_chat', 'telegram'],
    },
  })
})

app.get('/user/preferences', (c) => {
  return c.json({ success: true, data: { responseStyle: 'professional' } })
})

app.patch('/user/preferences', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, data: body })
})

// Generate demo AI response
function generateDemoResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm your AI assistant. I'm here to help you with anything you need. This is a demo version running without external APIs. What would you like to know?"
  }

  if (message.includes('how are you')) {
    return "I'm doing great, thank you for asking! As an AI assistant, I'm always ready to help. This demo showcases the chat interface with streaming responses. How can I assist you today?"
  }

  if (message.includes('help')) {
    return "I'd be happy to help! In the full version, I can assist with:\n\n• Writing and editing content\n• Answering questions\n• Brainstorming ideas\n• Code review and debugging\n• Research and analysis\n• And much more!\n\nThis demo shows the UI with simulated responses. What would you like to try?"
  }

  if (message.includes('pricing') || message.includes('cost') || message.includes('plan')) {
    return "Great question about pricing! Our plans are designed for professionals:\n\n**Solo Plan - $39/month**\n• 1,000 messages/month\n• Web + 1 channel\n• 7-day memory\n\n**Pro Plan - $79/month**\n• 3,000 messages/month\n• All channels\n• 30-day memory\n\n**Business Plan - $149/month**\n• 10,000 messages/month\n• Team features\n• 90-day memory\n\nOur utility-style pricing delivers 84%+ gross margins while providing exceptional value!"
  }

  if (message.includes('feature') || message.includes('what can you do')) {
    return "This AI assistant MVP includes:\n\n**Core Features:**\n• Real-time streaming chat\n• Intelligent model routing (Haiku/Sonnet/Opus)\n• Conversation memory & context\n• Google OAuth authentication\n\n**Coming Soon:**\n• Telegram integration\n• Stripe billing\n• Multiple channels\n\nThe architecture is designed for 84% gross margins with a break-even at just 15 users!"
  }

  if (message.includes('code') || message.includes('programming')) {
    return "I can help with code! Here's an example:\n\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet('Developer'))\n```\n\nIn the full version with Anthropic Claude, I can:\n• Write and explain code\n• Debug issues\n• Review pull requests\n• Suggest optimizations\n\nWhat programming challenge can I help with?"
  }

  // Default response
  const responses = [
    `Thanks for your message! You said: "${userMessage.slice(0, 50)}..."\n\nThis is a demo response showing the streaming chat interface. In the production version with Anthropic Claude, I would provide intelligent, contextual responses using the best model for your query (Haiku for simple questions, Sonnet for general tasks, Opus for complex reasoning).`,
    
    `Interesting question! In this demo, I'm simulating AI responses to showcase the chat interface.\n\nThe full MVP includes:\n• Intelligent model routing\n• Context-aware responses\n• Conversation memory\n• Real-time streaming\n\nTry asking about pricing, features, or just say hello!`,
    
    `I appreciate you testing the assistant! This demo runs without external APIs to showcase the UI.\n\n**What's working:**\n✅ Streaming responses\n✅ Conversation history\n✅ Mobile-responsive design\n✅ User authentication flow\n\nThe backend is ready for Anthropic Claude integration!`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// Root
app.get('/', (c) => {
  return c.json({
    name: 'AI Personal Assistant API (Demo Mode)',
    version: '0.1.0',
    mode: 'demo',
    docs: '/health',
  })
})

// Start server
const port = parseInt(process.env.PORT ?? '3000', 10)

console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🤖 AI Assistant API (Demo Mode)         ║
  ║                                           ║
  ║   Server running on port ${port}            ║
  ║   No external APIs required               ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
`)

serve({ fetch: app.fetch, port })

export default app
