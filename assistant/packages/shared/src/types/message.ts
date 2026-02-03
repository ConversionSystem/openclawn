// Message and conversation types

export type MessageRole = 'user' | 'assistant' | 'system'

export type ModelType = 'haiku' | 'sonnet' | 'opus'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  channel: ChannelType
  modelUsed: ModelType | null
  tokensIn: number | null
  tokensOut: number | null
  costCents: number | null
  cached: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  title: string | null
  summary: string | null
  context: ConversationContext
  createdAt: Date
  updatedAt: Date
}

export interface ConversationContext {
  keyFacts?: string[]
  userIntent?: string
  lastSummary?: string
  messageCount?: number
}

export type ChannelType = 'web' | 'telegram' | 'slack' | 'discord' | 'whatsapp' | 'api'

// API request/response types

export interface SendMessageRequest {
  content: string
  conversationId?: string
}

export interface SendMessageResponse {
  message: Message
  conversationId: string
}

export interface ConversationListItem {
  id: string
  title: string | null
  lastMessage: string | null
  messageCount: number
  updatedAt: Date
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error'
  content?: string
  messageId?: string
  error?: string
}
