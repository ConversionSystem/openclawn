/**
 * Subscription Tool - Agent tool for managing subscriptions
 */

import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "../../../src/plugins/types.js";
import type { StripeService } from "./stripe-service.js";
import type { TierName } from "./types.js";

export function createSubscriptionTool(api: OpenClawPluginApi, stripeService: StripeService) {
  return {
    name: "subscription",
    description: `Manage user subscription and billing. Actions:
- "status": Get current subscription tier, usage, and renewal date
- "upgrade": Get a link to upgrade to a higher tier
- "portal": Get a link to the Stripe billing portal to manage payment methods
- "cancel": Cancel subscription at end of billing period`,
    
    parameters: Type.Object({
      action: Type.Union([
        Type.Literal("status"),
        Type.Literal("upgrade"),
        Type.Literal("portal"),
        Type.Literal("cancel"),
      ], { description: "The subscription action to perform" }),
      tier: Type.Optional(
        Type.Union([
          Type.Literal("solo"),
          Type.Literal("pro"),
          Type.Literal("business"),
        ], { description: "Target tier for upgrade action" })
      ),
    }),

    async execute(_id: string, params: { action: string; tier?: TierName }) {
      // Get user ID from context
      const userId = api.context?.userId || api.context?.sessionKey;
      
      if (!userId) {
        return {
          content: [{ 
            type: "text", 
            text: "Unable to identify user. Please ensure you're logged in." 
          }],
        };
      }

      try {
        switch (params.action) {
          case "status": {
            const status = await stripeService.getSubscriptionStatus(userId);
            const tierConfig = stripeService.getTierConfig(status.tier);
            
            const statusText = [
              `**Subscription Status**`,
              ``,
              `**Tier:** ${status.tier.charAt(0).toUpperCase() + status.tier.slice(1)}`,
              `**Status:** ${status.status}`,
              ``,
              `**Usage This Period:**`,
              `- Messages: ${status.messagesUsed} / ${status.messagesLimit}`,
              `- Remaining: ${status.messagesRemaining}`,
              ``,
              `**Period Ends:** ${status.periodEnd.toLocaleDateString()}`,
              `**Days Remaining:** ${status.daysRemaining}`,
              ``,
              `**Features:**`,
              `- Memory: ${tierConfig.memoryDays} days`,
              `- Channels: ${tierConfig.channels === -1 ? 'Unlimited' : tierConfig.channels}`,
              status.cancelAtPeriodEnd ? `\n⚠️ Your subscription will cancel at period end.` : '',
            ].filter(Boolean).join('\n');
            
            return {
              content: [{ type: "text", text: statusText }],
              details: { status },
            };
          }

          case "upgrade": {
            const targetTier = params.tier || "pro";
            const currentStatus = await stripeService.getSubscriptionStatus(userId);
            
            // Tier hierarchy
            const tierOrder: TierName[] = ["trial", "solo", "pro", "business"];
            const currentIndex = tierOrder.indexOf(currentStatus.tier);
            const targetIndex = tierOrder.indexOf(targetTier);
            
            if (targetIndex <= currentIndex && currentStatus.status === "active") {
              return {
                content: [{ 
                  type: "text", 
                  text: `You're already on the ${currentStatus.tier} tier or higher. Use the billing portal to manage your subscription.` 
                }],
              };
            }
            
            // Generate checkout URL
            const baseUrl = api.config?.gateway?.publicUrl || "https://assistant.example.com";
            const successUrl = `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${baseUrl}/billing/cancel`;
            
            const checkout = await stripeService.createCheckoutSession(
              userId,
              targetTier,
              successUrl,
              cancelUrl
            );
            
            const tierConfig = stripeService.getTierConfig(targetTier);
            const prices: Record<string, string> = {
              solo: "$39/month",
              pro: "$79/month",
              business: "$149/month",
            };
            
            return {
              content: [{ 
                type: "text", 
                text: [
                  `**Upgrade to ${targetTier.charAt(0).toUpperCase() + targetTier.slice(1)}**`,
                  ``,
                  `**Price:** ${prices[targetTier]}`,
                  ``,
                  `**Includes:**`,
                  `- ${tierConfig.messagesPerMonth.toLocaleString()} messages/month`,
                  `- ${tierConfig.memoryDays}-day memory`,
                  `- ${tierConfig.channels === -1 ? 'Unlimited' : tierConfig.channels} channels`,
                  ``,
                  `**Checkout URL:**`,
                  checkout.url,
                  ``,
                  `Click the link above to complete your upgrade securely via Stripe.`,
                ].join('\n')
              }],
              details: { checkout },
            };
          }

          case "portal": {
            const subscription = await stripeService.getSubscription(userId);
            
            if (!subscription) {
              return {
                content: [{ 
                  type: "text", 
                  text: "You don't have an active subscription. Use 'upgrade' to subscribe." 
                }],
              };
            }
            
            const baseUrl = api.config?.gateway?.publicUrl || "https://assistant.example.com";
            const portal = await stripeService.createBillingPortalSession(
              userId,
              `${baseUrl}/billing`
            );
            
            return {
              content: [{ 
                type: "text", 
                text: [
                  `**Billing Portal**`,
                  ``,
                  `Manage your subscription, update payment methods, and view invoices:`,
                  ``,
                  portal.url,
                ].join('\n')
              }],
              details: { portal },
            };
          }

          case "cancel": {
            const subscription = await stripeService.getSubscription(userId);
            
            if (!subscription || subscription.status === "canceled") {
              return {
                content: [{ 
                  type: "text", 
                  text: "You don't have an active subscription to cancel." 
                }],
              };
            }
            
            if (subscription.cancelAtPeriodEnd) {
              return {
                content: [{ 
                  type: "text", 
                  text: `Your subscription is already scheduled to cancel on ${subscription.currentPeriodEnd.toLocaleDateString()}. You can continue using the service until then.` 
                }],
              };
            }
            
            await stripeService.cancelSubscription(userId, true);
            
            return {
              content: [{ 
                type: "text", 
                text: [
                  `**Subscription Canceled**`,
                  ``,
                  `Your subscription will remain active until ${subscription.currentPeriodEnd.toLocaleDateString()}.`,
                  ``,
                  `You can continue using all features until then.`,
                  ``,
                  `Changed your mind? Use 'portal' to reactivate.`,
                ].join('\n')
              }],
            };
          }

          default:
            return {
              content: [{ 
                type: "text", 
                text: `Unknown action: ${params.action}. Use status, upgrade, portal, or cancel.` 
              }],
            };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[stripe-billing] Subscription tool error:`, error);
        
        return {
          content: [{ 
            type: "text", 
            text: `Error processing subscription request: ${message}` 
          }],
        };
      }
    },
  };
}
