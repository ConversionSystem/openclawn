/**
 * Stripe Service - Handles all Stripe API interactions
 */

import Stripe from "stripe";
import type { OpenClawPluginApi } from "../../../src/plugins/types.js";
import type {
  PluginConfig,
  Subscription,
  Usage,
  TierName,
  SubscriptionStatus,
  CheckoutSession,
  BillingPortal,
  DEFAULT_TIERS,
  TRIAL_CONFIG,
} from "./types.js";

export interface StripeService {
  // Subscription management
  getSubscription(userId: string): Promise<Subscription | null>;
  createCheckoutSession(userId: string, tier: TierName, successUrl: string, cancelUrl: string): Promise<CheckoutSession>;
  createBillingPortalSession(userId: string, returnUrl: string): Promise<BillingPortal>;
  cancelSubscription(userId: string, atPeriodEnd?: boolean): Promise<void>;
  
  // Usage tracking
  getUsage(userId: string): Promise<Usage>;
  incrementUsage(userId: string, tokens?: number, costCents?: number): Promise<void>;
  resetUsage(userId: string): Promise<void>;
  
  // Status
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
  
  // Tier helpers
  getTierConfig(tier: TierName): typeof DEFAULT_TIERS.solo;
  isWithinLimits(userId: string): Promise<boolean>;
  
  // Webhook handling
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
  
  // Raw Stripe client for advanced use
  stripe: Stripe;
}

// In-memory store for development (replace with database in production)
const subscriptions = new Map<string, Subscription>();
const usageRecords = new Map<string, Usage>();

export function initializeStripeService(api: OpenClawPluginApi): StripeService {
  const config = api.pluginConfig as PluginConfig;
  
  if (!config?.stripeSecretKey) {
    throw new Error("[stripe-billing] stripeSecretKey is required");
  }
  
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2024-12-18.acacia",
  });

  const getTierConfig = (tier: TierName) => {
    if (tier === "trial") {
      return { ...TRIAL_CONFIG };
    }
    const tierConfig = config.tiers?.[tier as keyof typeof config.tiers];
    return tierConfig || DEFAULT_TIERS[tier as keyof typeof DEFAULT_TIERS];
  };

  const getSubscription = async (userId: string): Promise<Subscription | null> => {
    // TODO: Replace with database query
    return subscriptions.get(userId) || null;
  };

  const getUsage = async (userId: string): Promise<Usage> => {
    let usage = usageRecords.get(userId);
    if (!usage) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      usage = {
        id: `usage_${userId}_${Date.now()}`,
        userId,
        periodStart,
        periodEnd,
        messagesCount: 0,
        tokensUsed: 0,
        costCents: 0,
        tier: "trial",
      };
      usageRecords.set(userId, usage);
    }
    return usage;
  };

  const incrementUsage = async (userId: string, tokens = 0, costCents = 0): Promise<void> => {
    const usage = await getUsage(userId);
    usage.messagesCount += 1;
    usage.tokensUsed += tokens;
    usage.costCents += costCents;
    usageRecords.set(userId, usage);
  };

  const resetUsage = async (userId: string): Promise<void> => {
    usageRecords.delete(userId);
  };

  const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus> => {
    const subscription = await getSubscription(userId);
    const usage = await getUsage(userId);
    
    const tier = subscription?.tier || "trial";
    const tierConfig = getTierConfig(tier);
    const messagesLimit = tierConfig.messagesPerMonth;
    const messagesUsed = usage.messagesCount;
    
    const periodEnd = subscription?.currentPeriodEnd || new Date(Date.now() + config.trialDays * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    
    return {
      tier,
      status: subscription?.status || "trialing",
      messagesUsed,
      messagesLimit,
      messagesRemaining: Math.max(0, messagesLimit - messagesUsed),
      periodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
      daysRemaining,
    };
  };

  const isWithinLimits = async (userId: string): Promise<boolean> => {
    const status = await getSubscriptionStatus(userId);
    return status.messagesRemaining > 0;
  };

  const createCheckoutSession = async (
    userId: string,
    tier: TierName,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> => {
    const tierConfig = getTierConfig(tier);
    const priceId = tierConfig.priceId;
    
    if (!priceId) {
      throw new Error(`No price ID configured for tier: ${tier}`);
    }
    
    // Get or create Stripe customer
    let subscription = await getSubscription(userId);
    let customerId = subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        tier,
      },
    });
    
    return {
      url: session.url!,
      sessionId: session.id,
    };
  };

  const createBillingPortalSession = async (
    userId: string,
    returnUrl: string
  ): Promise<BillingPortal> => {
    const subscription = await getSubscription(userId);
    
    if (!subscription?.stripeCustomerId) {
      throw new Error("No subscription found for user");
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });
    
    return { url: session.url };
  };

  const cancelSubscription = async (userId: string, atPeriodEnd = true): Promise<void> => {
    const subscription = await getSubscription(userId);
    
    if (!subscription?.stripeSubscriptionId) {
      throw new Error("No subscription found for user");
    }
    
    if (atPeriodEnd) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }
  };

  const handleWebhookEvent = async (event: Stripe.Event): Promise<void> => {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as TierName;
        
        if (userId && tier) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const subscription: Subscription = {
            id: `sub_${Date.now()}`,
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            tier,
            status: "active",
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          subscriptions.set(userId, subscription);
          await resetUsage(userId);
          
          console.log(`[stripe-billing] Subscription created for user ${userId}: ${tier}`);
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const customerId = stripeSubscription.customer as string;
        
        // Find user by customer ID
        for (const [userId, sub] of subscriptions) {
          if (sub.stripeCustomerId === customerId) {
            sub.status = stripeSubscription.status as Subscription["status"];
            sub.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
            sub.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
            sub.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
            sub.updatedAt = new Date();
            
            subscriptions.set(userId, sub);
            console.log(`[stripe-billing] Subscription updated for user ${userId}`);
            break;
          }
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const customerId = stripeSubscription.customer as string;
        
        // Find and remove subscription by customer ID
        for (const [userId, sub] of subscriptions) {
          if (sub.stripeCustomerId === customerId) {
            sub.status = "canceled";
            sub.updatedAt = new Date();
            subscriptions.set(userId, sub);
            console.log(`[stripe-billing] Subscription canceled for user ${userId}`);
            break;
          }
        }
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        for (const [userId, sub] of subscriptions) {
          if (sub.stripeCustomerId === customerId) {
            sub.status = "past_due";
            sub.updatedAt = new Date();
            subscriptions.set(userId, sub);
            console.log(`[stripe-billing] Payment failed for user ${userId}`);
            break;
          }
        }
        break;
      }
      
      default:
        console.log(`[stripe-billing] Unhandled webhook event: ${event.type}`);
    }
  };

  return {
    getSubscription,
    createCheckoutSession,
    createBillingPortalSession,
    cancelSubscription,
    getUsage,
    incrementUsage,
    resetUsage,
    getSubscriptionStatus,
    getTierConfig,
    isWithinLimits,
    handleWebhookEvent,
    stripe,
  };
}

// Re-export types
export type { PluginConfig, Subscription, Usage, TierName, SubscriptionStatus };
