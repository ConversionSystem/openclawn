/**
 * Stripe Billing Extension Types
 */

export type TierName = "trial" | "solo" | "pro" | "business";

export interface TierConfig {
  priceId?: string;
  messagesPerMonth: number;
  memoryDays: number;
  channels: number;
  models: string[];
  teamSeats?: number;
}

export interface PluginConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePublishableKey?: string;
  tiers: {
    solo: TierConfig;
    pro: TierConfig;
    business: TierConfig;
  };
  trialDays: number;
  trialTier: TierName;
  databaseUrl?: string;
  webhookPath: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: TierName;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Usage {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  messagesCount: number;
  tokensUsed: number;
  costCents: number;
  tier: TierName;
}

export interface SubscriptionStatus {
  tier: TierName;
  status: Subscription["status"];
  messagesUsed: number;
  messagesLimit: number;
  messagesRemaining: number;
  periodEnd: Date;
  cancelAtPeriodEnd: boolean;
  daysRemaining: number;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface BillingPortal {
  url: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

// Default tier configurations
export const DEFAULT_TIERS: Record<Exclude<TierName, "trial">, TierConfig> = {
  solo: {
    messagesPerMonth: 1000,
    memoryDays: 7,
    channels: 2,
    models: ["anthropic/claude-3-5-haiku", "anthropic/claude-3-5-sonnet"],
  },
  pro: {
    messagesPerMonth: 3000,
    memoryDays: 30,
    channels: 5,
    models: ["anthropic/claude-3-5-haiku", "anthropic/claude-3-5-sonnet", "anthropic/claude-3-opus"],
  },
  business: {
    messagesPerMonth: 10000,
    memoryDays: 90,
    channels: -1,
    models: ["anthropic/claude-3-5-haiku", "anthropic/claude-3-5-sonnet", "anthropic/claude-3-opus"],
    teamSeats: 5,
  },
};

// Trial gets Pro tier features
export const TRIAL_CONFIG: TierConfig = {
  ...DEFAULT_TIERS.pro,
  messagesPerMonth: 100, // Limited during trial
};
