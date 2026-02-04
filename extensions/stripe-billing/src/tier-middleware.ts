/**
 * Tier Middleware - Enforces subscription limits on messages
 */

import type { OpenClawPluginApi } from "../../../src/plugins/types.js";
import type { StripeService } from "./stripe-service.js";
import type { PluginConfig } from "./types.js";

interface MessageContext {
  userId?: string;
  sessionKey?: string;
  message?: string;
  channel?: string;
}

interface MiddlewareResult {
  block: boolean;
  response?: string;
}

export function createTierMiddleware(api: OpenClawPluginApi, stripeService: StripeService) {
  const config = api.pluginConfig as PluginConfig;
  
  return {
    name: "tier-enforcement",
    priority: 100, // Run early in the middleware chain
    
    /**
     * Called before processing a user message
     */
    async beforeMessage(context: MessageContext): Promise<MiddlewareResult> {
      const userId = context.userId || context.sessionKey;
      
      if (!userId) {
        // Allow messages without user identification (system messages, etc.)
        return { block: false };
      }
      
      try {
        const status = await stripeService.getSubscriptionStatus(userId);
        
        // Check if subscription is active or trialing
        if (status.status === "canceled") {
          return {
            block: true,
            response: `Your subscription has been canceled. Subscribe again to continue using the assistant.\n\nUse the "subscription upgrade" command to reactivate.`,
          };
        }
        
        if (status.status === "past_due") {
          return {
            block: true,
            response: `Your payment is past due. Please update your payment method to continue.\n\nUse the "subscription portal" command to update billing.`,
          };
        }
        
        // Check trial expiration
        if (status.tier === "trial" && status.daysRemaining <= 0) {
          return {
            block: true,
            response: `Your ${config.trialDays}-day free trial has ended. Subscribe to continue using the assistant.\n\n**Pricing:**\n- Solo: $39/month (1,000 messages)\n- Pro: $79/month (3,000 messages)\n- Business: $149/month (10,000 messages)\n\nUse the "subscription upgrade" command to subscribe.`,
          };
        }
        
        // Check message limit
        if (status.messagesRemaining <= 0) {
          const tierConfig = stripeService.getTierConfig(status.tier);
          const nextTier = getNextTier(status.tier);
          
          if (nextTier) {
            const nextTierConfig = stripeService.getTierConfig(nextTier);
            return {
              block: true,
              response: `You've reached your ${tierConfig.messagesPerMonth.toLocaleString()} message limit for this month.\n\n**Options:**\n1. Wait until ${status.periodEnd.toLocaleDateString()} for your limit to reset\n2. Upgrade to ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} for ${nextTierConfig.messagesPerMonth.toLocaleString()} messages/month\n\nUse "subscription upgrade ${nextTier}" to upgrade.`,
            };
          } else {
            return {
              block: true,
              response: `You've reached your ${tierConfig.messagesPerMonth.toLocaleString()} message limit for this month.\n\nYour limit resets on ${status.periodEnd.toLocaleDateString()}.\n\nContact support if you need additional capacity.`,
            };
          }
        }
        
        // Warn if approaching limit (80% used)
        const percentUsed = Math.round((status.messagesUsed / status.messagesLimit) * 100);
        if (percentUsed >= 80 && percentUsed < 100) {
          // Don't block, but the response can include a warning
          // This is handled by logging; actual warning is shown via usage tool
          console.log(`[stripe-billing] User ${userId} at ${percentUsed}% of message limit`);
        }
        
        return { block: false };
      } catch (error) {
        console.error(`[stripe-billing] Tier middleware error:`, error);
        // On error, allow the message through to avoid blocking users
        return { block: false };
      }
    },
    
    /**
     * Called after processing a user message
     */
    async afterMessage(context: MessageContext): Promise<void> {
      const userId = context.userId || context.sessionKey;
      
      if (!userId) {
        return;
      }
      
      try {
        // Increment usage count
        // TODO: Pass actual token count and cost from AI response
        await stripeService.incrementUsage(userId, 0, 0);
      } catch (error) {
        console.error(`[stripe-billing] Failed to increment usage:`, error);
      }
    },
    
    /**
     * Called to check if a specific model is allowed for the user's tier
     */
    async isModelAllowed(userId: string, model: string): Promise<boolean> {
      try {
        const status = await stripeService.getSubscriptionStatus(userId);
        const tierConfig = stripeService.getTierConfig(status.tier);
        
        // Check if model is in allowed list
        return tierConfig.models.some(allowedModel => 
          model.toLowerCase().includes(allowedModel.toLowerCase()) ||
          allowedModel.toLowerCase().includes(model.toLowerCase())
        );
      } catch (error) {
        console.error(`[stripe-billing] Model check error:`, error);
        return true; // Allow on error
      }
    },
    
    /**
     * Called to check if a channel is allowed for the user's tier
     */
    async isChannelAllowed(userId: string, channelCount: number): Promise<boolean> {
      try {
        const status = await stripeService.getSubscriptionStatus(userId);
        const tierConfig = stripeService.getTierConfig(status.tier);
        
        // -1 means unlimited
        if (tierConfig.channels === -1) {
          return true;
        }
        
        return channelCount <= tierConfig.channels;
      } catch (error) {
        console.error(`[stripe-billing] Channel check error:`, error);
        return true; // Allow on error
      }
    },
  };
}

function getNextTier(currentTier: string): string | null {
  const tierOrder = ["trial", "solo", "pro", "business"];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex >= tierOrder.length - 1) {
    return null;
  }
  
  return tierOrder[currentIndex + 1];
}
