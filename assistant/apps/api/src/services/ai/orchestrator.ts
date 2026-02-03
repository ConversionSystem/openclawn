import type { Message } from '../../db/schema'
import type { Tier, StreamChunk } from '@assistant/shared'
import { streamChat, type ChatResponse } from './providers/anthropic'
import { routeToModel } from './router'
import { buildContextWindow, extractKeyFacts } from './context'

export interface OrchestratorInput {
  userMessage: string
  conversationMessages: Message[]
  userId: string
  userTier: Tier
  userName?: string
}

export interface OrchestratorResult {
  content: string
  tokensIn: number
  tokensOut: number
  modelUsed: 'haiku' | 'sonnet' | 'opus'
  costCents: number
  cached: boolean
}

/**
 * Main AI orchestrator - coordinates model selection, context building, and response generation
 */
export async function* orchestrate(
  input: OrchestratorInput
): AsyncGenerator<StreamChunk, OrchestratorResult> {
  const { userMessage, conversationMessages, userTier, userName } = input

  // Route to appropriate model based on query complexity
  const routerDecision = routeToModel({
    message: userMessage,
    conversationLength: conversationMessages.length,
    tier: userTier,
  })

  console.log(`[AI Router] Selected ${routerDecision.model}: ${routerDecision.reason}`)

  // Build optimized context window
  const contextWindow = await buildContextWindow(conversationMessages)

  // Extract key facts for personalization
  const keyFacts = extractKeyFacts(conversationMessages)

  // Build system prompt with personalization
  const systemPrompt = buildSystemPrompt(userName, keyFacts)

  // Add the new user message to context
  const messages = [
    ...contextWindow.messages,
    { role: 'user' as const, content: userMessage },
  ]

  // Stream the response
  let finalResponse: ChatResponse | undefined

  for await (const chunk of streamChat({
    model: routerDecision.model,
    messages,
    systemPrompt,
  })) {
    if (chunk.type === 'text' && chunk.content) {
      yield { type: 'text', content: chunk.content }
    } else if (chunk.type === 'done' && chunk.response) {
      finalResponse = chunk.response
    }
  }

  if (!finalResponse) {
    throw new Error('No response received from AI')
  }

  yield { type: 'done' }

  return {
    content: finalResponse.content,
    tokensIn: finalResponse.tokensIn,
    tokensOut: finalResponse.tokensOut,
    modelUsed: finalResponse.model,
    costCents: finalResponse.costCents,
    cached: false,
  }
}

/**
 * Non-streaming version for simple queries
 */
export async function orchestrateSync(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  let result: OrchestratorResult | undefined

  for await (const chunk of orchestrate(input)) {
    // Consume the stream
  }

  // The generator returns the result
  const generator = orchestrate(input)
  let next = await generator.next()

  while (!next.done) {
    next = await generator.next()
  }

  return next.value
}

function buildSystemPrompt(userName?: string, keyFacts: string[] = []): string {
  const greeting = userName ? `The user's name is ${userName}.` : ''
  const facts = keyFacts.length > 0 ? `\nKnown facts:\n${keyFacts.map((f) => `- ${f}`).join('\n')}` : ''

  return `You are a helpful, friendly AI assistant. Be direct and concise in your responses.

${greeting}${facts}

Guidelines:
- Answer questions directly and helpfully
- If you don't know something, say so honestly
- Keep responses focused and relevant
- Use a warm but professional tone
- Format responses with markdown when it helps readability
- Remember context from the conversation

You're having a real conversation. Be natural and helpful.`
}
