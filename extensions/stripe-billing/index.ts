/**
 * Stripe Billing Extension for OpenClaw
 * 
 * Provides subscription management, usage tracking, and tier enforcement
 * for the Kyra AI Assistant platform.
 */

import type { OpenClawPluginApi, OpenClawPluginDefinition } from "../../src/plugins/types.js";
import { initializeStripeService } from "./src/stripe-service.js";
import { createSubscriptionTool } from "./src/subscription-tool.js";
import { createUsageTool } from "./src/usage-tool.js";
import { createWebhookHandler } from "./src/webhook-handler.js";
import type { PluginConfig, TierName } from "./src/types.js";

// Default tier configuration
const DEFAULT_TIERS = {
  trial: { messagesPerMonth: 50, memoryDays: 3, channels: 1, priceId: "" },
  solo: { messagesPerMonth: 1000, memoryDays: 7, channels: 2, priceId: "" },
  pro: { messagesPerMonth: 3000, memoryDays: 30, channels: 5, priceId: "" },
  business: { messagesPerMonth: 10000, memoryDays: 90, channels: -1, priceId: "" },
};

const plugin: OpenClawPluginDefinition = {
  id: "stripe-billing",
  name: "Stripe Billing",
  description: "Subscription management and usage tracking for Kyra AI",
  version: "1.0.0",

  configSchema: {
    jsonSchema: {
      type: "object",
      properties: {
        stripeSecretKey: { type: "string", description: "Stripe secret key" },
        stripeWebhookSecret: { type: "string", description: "Stripe webhook signing secret" },
        trialDays: { type: "number", default: 7 },
        tiers: {
          type: "object",
          properties: {
            solo: { type: "object" },
            pro: { type: "object" },
            business: { type: "object" },
          },
        },
      },
      required: ["stripeSecretKey"],
    },
    uiHints: {
      stripeSecretKey: { label: "Stripe Secret Key", sensitive: true },
      stripeWebhookSecret: { label: "Webhook Secret", sensitive: true },
      trialDays: { label: "Trial Days", help: "Number of free trial days" },
    },
  },

  async register(api: OpenClawPluginApi) {
    const config = api.pluginConfig as PluginConfig;
    
    // Check if Stripe is configured
    if (!config?.stripeSecretKey) {
      api.logger.warn("[stripe-billing] No Stripe key configured - running in demo mode");
      registerDemoMode(api);
      return;
    }

    try {
      // Initialize Stripe service
      const stripeService = initializeStripeService(api);
      
      // Register subscription management tool
      api.registerTool(createSubscriptionTool(api, stripeService), {
        name: "subscription",
        optional: false,
      });

      // Register usage tracking tool
      api.registerTool(createUsageTool(api, stripeService), {
        name: "usage",
        optional: false,
      });

      // Register webhook HTTP route for Stripe events
      const webhookHandler = createWebhookHandler(api, stripeService);
      api.registerHttpRoute({
        path: "/webhooks/stripe",
        handler: webhookHandler,
      });

      // Register message hook for usage tracking
      api.on("message_received", async (event, ctx) => {
        const userId = ctx.accountId || ctx.conversationId;
        if (userId) {
          await stripeService.incrementUsage(userId);
        }
      });

      // Register hook to check tier limits before processing
      api.on("before_agent_start", async (event, ctx) => {
        const userId = ctx.sessionKey;
        if (userId) {
          const withinLimits = await stripeService.isWithinLimits(userId);
          if (!withinLimits) {
            return {
              prependContext: `[SYSTEM: User has exceeded their message limit. Inform them about upgrading their plan.]`,
            };
          }
        }
        return {};
      });

      // Register status command
      api.registerCommand({
        name: "billing",
        description: "Check subscription status and billing",
        acceptsArgs: true,
        handler: async (ctx) => {
          const userId = ctx.senderId;
          if (!userId) {
            return { text: "Unable to identify user for billing lookup." };
          }
          
          const status = await stripeService.getSubscriptionStatus(userId);
          const tierConfig = stripeService.getTierConfig(status.tier);
          
          return {
            text: `📊 **Subscription Status**

**Plan:** ${status.tier.charAt(0).toUpperCase() + status.tier.slice(1)}
**Status:** ${status.status}

**Usage This Period:**
- Messages: ${status.messagesUsed} / ${status.messagesLimit}
- Remaining: ${status.messagesRemaining}

**Memory:** ${tierConfig.memoryDays} days
**Period Ends:** ${status.periodEnd.toLocaleDateString()}

Use \`/upgrade\` to see plan options.`,
          };
        },
      });

      api.logger.info("[stripe-billing] Extension registered successfully");
    } catch (error) {
      api.logger.error(`[stripe-billing] Failed to initialize: ${error}`);
      registerDemoMode(api);
    }
  },
};

/**
 * Register demo mode when Stripe is not configured
 */
function registerDemoMode(api: OpenClawPluginApi) {
  // Demo subscription tool
  api.registerTool({
    name: "subscription",
    description: "Check subscription status (demo mode)",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["status", "upgrade", "portal"] },
      },
    },
    execute: async () => ({
      content: [{
        type: "text",
        text: `**Demo Mode** - Stripe not configured.

To enable billing:
1. Set STRIPE_SECRET_KEY environment variable
2. Configure Stripe webhook secret
3. Restart the gateway

Current demo limits:
- Messages: Unlimited (demo)
- Memory: 7 days
- Channels: All available`,
      }],
    }),
  }, { optional: false });

  // Demo usage tool  
  api.registerTool({
    name: "usage",
    description: "Check usage statistics (demo mode)",
    parameters: {
      type: "object",
      properties: {
        detail: { type: "string", enum: ["summary", "detailed"] },
      },
    },
    execute: async () => ({
      content: [{
        type: "text",
        text: `**Usage (Demo Mode)**

Messages today: --
Total this period: --

Demo mode - no limits enforced.`,
      }],
    }),
  }, { optional: false });

  api.logger.info("[stripe-billing] Running in demo mode (no Stripe configured)");
}

export default plugin;
