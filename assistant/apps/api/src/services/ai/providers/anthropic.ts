import Anthropic from '@anthropic-ai/sdk'
import type { ModelType, Message } from '@assistant/shared'
import { AI_MODELS } from '@assistant/shared'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  model: ModelType
  systemPrompt?: string
  maxTokens?: number
}

export interface ChatResponse {
  content: string
  tokensIn: number
  tokensOut: number
  model: ModelType
  costCents: number
}

export async function* streamChat(
  request: ChatRequest
): AsyncGenerator<{ type: 'text' | 'done'; content?: string; response?: ChatResponse }> {
  const modelConfig = AI_MODELS[request.model]

  const stream = await client.messages.stream({
    model: modelConfig.name,
    max_tokens: request.maxTokens ?? modelConfig.maxTokens,
    system: request.systemPrompt ?? getDefaultSystemPrompt(),
    messages: request.messages,
  })

  let fullContent = ''

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text
      yield { type: 'text', content: event.delta.text }
    }
  }

  const finalMessage = await stream.finalMessage()

  const tokensIn = finalMessage.usage.input_tokens
  const tokensOut = finalMessage.usage.output_tokens

  // Calculate cost in cents
  const costCents = Math.ceil(
    (tokensIn * modelConfig.inputCostPer1M) / 1_000_000 * 100 +
      (tokensOut * modelConfig.outputCostPer1M) / 1_000_000 * 100
  )

  yield {
    type: 'done',
    response: {
      content: fullContent,
      tokensIn,
      tokensOut,
      model: request.model,
      costCents,
    },
  }
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const modelConfig = AI_MODELS[request.model]

  const response = await client.messages.create({
    model: modelConfig.name,
    max_tokens: request.maxTokens ?? modelConfig.maxTokens,
    system: request.systemPrompt ?? getDefaultSystemPrompt(),
    messages: request.messages,
  })

  const content =
    response.content[0]?.type === 'text' ? response.content[0].text : ''

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  const costCents = Math.ceil(
    (tokensIn * modelConfig.inputCostPer1M) / 1_000_000 * 100 +
      (tokensOut * modelConfig.outputCostPer1M) / 1_000_000 * 100
  )

  return {
    content,
    tokensIn,
    tokensOut,
    model: request.model,
    costCents,
  }
}

function getDefaultSystemPrompt(): string {
  return `You are a helpful, friendly AI assistant. You are direct and concise in your responses.

Key guidelines:
- Be helpful and answer questions directly
- If you don't know something, say so
- Keep responses focused and relevant
- Use a warm but professional tone
- Format responses with markdown when helpful

Remember: You're having a conversation with a real person who values their time.`
}
