// Application constants

export const APP_NAME = 'Assistant'

// AI Model configuration
export const AI_MODELS = {
  haiku: {
    name: 'claude-3-5-haiku-20241022',
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    maxTokens: 8192,
    useCase: 'Simple queries, quick responses',
  },
  sonnet: {
    name: 'claude-3-5-sonnet-20241022',
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    maxTokens: 8192,
    useCase: 'General assistance, balanced quality/cost',
  },
  opus: {
    name: 'claude-3-opus-20240229',
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    maxTokens: 4096,
    useCase: 'Complex reasoning, important decisions',
  },
} as const

// Rate limiting
export const RATE_LIMITS = {
  messagesPerMinute: 10,
  messagesPerHour: 60,
} as const

// Session configuration
export const SESSION = {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  cookieName: 'assistant_session',
} as const

// Context window management
export const CONTEXT = {
  maxMessagesInContext: 20,
  summaryThreshold: 10,
  maxContextTokens: 100000,
} as const

// Caching
export const CACHE = {
  semanticCacheTTL: 60 * 60, // 1 hour
  sessionCacheTTL: 24 * 60 * 60, // 24 hours
} as const
