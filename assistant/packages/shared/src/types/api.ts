// API response types and error handling

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TIER_LIMIT_EXCEEDED'
  | 'PAYMENT_REQUIRED'
  | 'INTERNAL_ERROR'
  | 'AI_ERROR'
  | 'CHANNEL_ERROR'

// Standard error messages for user-friendly display
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: "You're sending messages too quickly. Please wait a moment.",
  TIER_LIMIT_EXCEEDED:
    "You've reached your monthly message limit. Upgrade your plan for more.",
  PAYMENT_REQUIRED: 'Please update your payment method to continue.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again.',
  AI_ERROR: "I'm having trouble thinking right now. Please try again.",
  CHANNEL_ERROR: 'There was a problem connecting to this channel.',
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  services: {
    database: boolean
    redis: boolean
    ai: boolean
  }
}
