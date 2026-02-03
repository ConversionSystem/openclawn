import type { ModelType, Tier } from '@assistant/shared'
import { estimateTokens } from '@assistant/shared'

/**
 * Intelligent model routing based on query complexity and user tier
 */
export interface RouterInput {
  message: string
  conversationLength: number
  tier: Tier
}

export interface RouterDecision {
  model: ModelType
  reason: string
}

/**
 * Route to the appropriate model based on query characteristics
 *
 * Strategy:
 * - Simple queries (greetings, short questions) → Haiku (cheapest)
 * - General queries → Sonnet (balanced)
 * - Complex queries (long context, reasoning needed) → Opus (best quality)
 * - Business tier gets priority access to Opus
 */
export function routeToModel(input: RouterInput): RouterDecision {
  const { message, conversationLength, tier } = input

  const messageLength = message.length
  const estimatedTokens = estimateTokens(message)

  // Simple greetings and short queries → Haiku
  if (isSimpleQuery(message)) {
    return {
      model: 'haiku',
      reason: 'Simple query detected, using fast model',
    }
  }

  // Short messages with short context → Haiku
  if (messageLength < 100 && conversationLength < 5) {
    return {
      model: 'haiku',
      reason: 'Short message with minimal context',
    }
  }

  // Business tier with complex queries → Opus
  if (tier === 'business' && isComplexQuery(message, conversationLength)) {
    return {
      model: 'opus',
      reason: 'Complex query with business tier access',
    }
  }

  // Long messages or deep conversations → Sonnet (or Opus for business)
  if (estimatedTokens > 500 || conversationLength > 10) {
    return {
      model: tier === 'business' ? 'opus' : 'sonnet',
      reason: 'Extended context requires advanced reasoning',
    }
  }

  // Default → Sonnet
  return {
    model: 'sonnet',
    reason: 'Standard query, using balanced model',
  }
}

function isSimpleQuery(message: string): boolean {
  const simplePatterns = [
    /^(hi|hello|hey|greetings|good (morning|afternoon|evening))[\s!.]*$/i,
    /^thanks?[\s!.]*$/i,
    /^(ok|okay|got it|understood)[\s!.]*$/i,
    /^(yes|no|maybe)[\s!.]*$/i,
    /^what time is it/i,
    /^what('s| is) the date/i,
  ]

  return simplePatterns.some((pattern) => pattern.test(message.trim()))
}

function isComplexQuery(message: string, conversationLength: number): boolean {
  const complexIndicators = [
    /analyze/i,
    /compare/i,
    /explain.*in detail/i,
    /write.*essay/i,
    /help me (think|understand|figure out)/i,
    /what (should|would) (I|you|we)/i,
    /pros and cons/i,
    /step by step/i,
    /code review/i,
    /debug/i,
  ]

  const hasComplexKeywords = complexIndicators.some((pattern) => pattern.test(message))
  const isLongContext = conversationLength > 15
  const isLongMessage = message.length > 500

  return hasComplexKeywords || isLongContext || isLongMessage
}
