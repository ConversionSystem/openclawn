// User types for the AI Personal Assistant

export type Tier = 'trial' | 'solo' | 'pro' | 'business'

export interface User {
  id: string
  email: string
  name: string | null
  googleId: string | null
  preferences: UserPreferences
  tier: Tier
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  responseStyle: 'concise' | 'detailed' | 'professional' | 'casual'
  timezone?: string
  language?: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  trial: {
    messagesPerMonth: 50,
    channels: 1,
    memoryDays: 7,
    features: ['web_chat'],
  },
  solo: {
    messagesPerMonth: 1000,
    channels: 1,
    memoryDays: 7,
    features: ['web_chat', 'telegram'],
  },
  pro: {
    messagesPerMonth: 3000,
    channels: 3,
    memoryDays: 30,
    features: ['web_chat', 'telegram', 'slack', 'discord', 'web_browsing', 'file_analysis'],
  },
  business: {
    messagesPerMonth: 10000,
    channels: -1, // unlimited
    memoryDays: 90,
    features: [
      'web_chat',
      'telegram',
      'slack',
      'discord',
      'whatsapp',
      'web_browsing',
      'file_analysis',
      'team_sharing',
      'priority_support',
    ],
  },
}

export interface TierLimits {
  messagesPerMonth: number
  channels: number
  memoryDays: number
  features: string[]
}

export const TIER_PRICES: Record<Exclude<Tier, 'trial'>, number> = {
  solo: 39,
  pro: 79,
  business: 149,
}
