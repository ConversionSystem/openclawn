import type { OpenClawPluginApi } from "../../src/plugins/types.js";
import { createSubscriptionTool } from "./src/subscription-tool.js";
import { createUsageTool } from "./src/usage-tool.js";
import { createTierMiddleware } from "./src/tier-middleware.js";
import { createWebhookHandler } from "./src/webhook-handler.js";
import { initializeStripeService } from "./src/stripe-service.js";

export default function register(api: OpenClawPluginApi) {
  // Initialize Stripe service with config
  const stripeService = initializeStripeService(api);

  // Register agent tools
  api.registerTool(createSubscriptionTool(api, stripeService), { optional: false });
  api.registerTool(createUsageTool(api, stripeService), { optional: false });

  // Register middleware for tier enforcement
  api.registerMiddleware(createTierMiddleware(api, stripeService));

  // Register webhook handler for Stripe events
  api.registerWebhook(createWebhookHandler(api, stripeService));

  console.log("[stripe-billing] Extension registered successfully");
}
