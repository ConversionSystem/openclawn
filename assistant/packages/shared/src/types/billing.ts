// Billing and subscription types

import type { Tier } from './user'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  tier: Tier
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Usage {
  id: string
  userId: string
  periodStart: Date
  periodEnd: Date
  messagesCount: number
  tokensUsed: number
  costCents: number
  tier: Tier
}

// API types

export interface UsageSummary {
  currentPeriod: {
    start: Date
    end: Date
  }
  messagesUsed: number
  messagesLimit: number
  tokensUsed: number
  estimatedCostCents: number
  percentUsed: number
}

export interface BillingInfo {
  subscription: {
    tier: Tier
    status: SubscriptionStatus
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
  } | null
  usage: UsageSummary
}

export interface CheckoutRequest {
  tier: Exclude<Tier, 'trial'>
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  checkoutUrl: string
}
