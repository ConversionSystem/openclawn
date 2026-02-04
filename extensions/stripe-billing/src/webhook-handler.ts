/**
 * Webhook Handler - Processes Stripe webhook events
 */

import type Stripe from "stripe";
import type { OpenClawPluginApi } from "../../../src/plugins/types.js";
import type { StripeService } from "./stripe-service.js";
import type { PluginConfig } from "./types.js";

interface WebhookRequest {
  body: string | Buffer;
  headers: Record<string, string>;
}

interface WebhookResponse {
  status: number;
  body?: string;
}

export function createWebhookHandler(api: OpenClawPluginApi, stripeService: StripeService) {
  const config = api.pluginConfig as PluginConfig;
  
  return {
    name: "stripe-webhook",
    path: config.webhookPath || "/stripe/webhook",
    method: "POST" as const,
    
    async handle(request: WebhookRequest): Promise<WebhookResponse> {
      const signature = request.headers["stripe-signature"];
      
      if (!signature) {
        console.error("[stripe-billing] Missing stripe-signature header");
        return {
          status: 400,
          body: JSON.stringify({ error: "Missing stripe-signature header" }),
        };
      }
      
      try {
        // Verify webhook signature
        const event = stripeService.stripe.webhooks.constructEvent(
          request.body,
          signature,
          config.stripeWebhookSecret
        );
        
        console.log(`[stripe-billing] Received webhook: ${event.type}`);
        
        // Process the event
        await stripeService.handleWebhookEvent(event);
        
        return {
          status: 200,
          body: JSON.stringify({ received: true }),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[stripe-billing] Webhook error:`, message);
        
        return {
          status: 400,
          body: JSON.stringify({ error: `Webhook Error: ${message}` }),
        };
      }
    },
  };
}

/**
 * Utility to handle common Stripe webhook scenarios
 */
export const webhookEventTypes = {
  // Subscription lifecycle
  CHECKOUT_COMPLETED: "checkout.session.completed",
  SUBSCRIPTION_CREATED: "customer.subscription.created",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  
  // Payment events
  INVOICE_PAID: "invoice.paid",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
  INVOICE_UPCOMING: "invoice.upcoming",
  
  // Customer events
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  CUSTOMER_DELETED: "customer.deleted",
  
  // Subscription schedule
  SUBSCRIPTION_SCHEDULE_CREATED: "subscription_schedule.created",
  SUBSCRIPTION_SCHEDULE_UPDATED: "subscription_schedule.updated",
  SUBSCRIPTION_SCHEDULE_CANCELED: "subscription_schedule.canceled",
} as const;

/**
 * Events that should be handled for billing functionality
 */
export const requiredWebhookEvents = [
  webhookEventTypes.CHECKOUT_COMPLETED,
  webhookEventTypes.SUBSCRIPTION_UPDATED,
  webhookEventTypes.SUBSCRIPTION_DELETED,
  webhookEventTypes.INVOICE_PAYMENT_FAILED,
] as const;
