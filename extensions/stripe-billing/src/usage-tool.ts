/**
 * Usage Tool - Agent tool for checking usage statistics
 */

import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "../../../src/plugins/types.js";
import type { StripeService } from "./stripe-service.js";

export function createUsageTool(api: OpenClawPluginApi, stripeService: StripeService) {
  return {
    name: "usage",
    description: `Check current usage statistics including messages sent, tokens used, and estimated costs.`,
    
    parameters: Type.Object({
      detail: Type.Optional(
        Type.Union([
          Type.Literal("summary"),
          Type.Literal("detailed"),
        ], { description: "Level of detail: summary or detailed" })
      ),
    }),

    async execute(_id: string, params: { detail?: string }) {
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
        const usage = await stripeService.getUsage(userId);
        const status = await stripeService.getSubscriptionStatus(userId);
        const tierConfig = stripeService.getTierConfig(status.tier);
        
        const percentUsed = Math.round((usage.messagesCount / tierConfig.messagesPerMonth) * 100);
        const progressBar = generateProgressBar(percentUsed);
        
        if (params.detail === "detailed") {
          const detailedText = [
            `**Usage Report**`,
            ``,
            `**Period:** ${usage.periodStart.toLocaleDateString()} - ${usage.periodEnd.toLocaleDateString()}`,
            `**Tier:** ${status.tier.charAt(0).toUpperCase() + status.tier.slice(1)}`,
            ``,
            `**Messages**`,
            `${progressBar} ${percentUsed}%`,
            `- Used: ${usage.messagesCount.toLocaleString()}`,
            `- Limit: ${tierConfig.messagesPerMonth.toLocaleString()}`,
            `- Remaining: ${status.messagesRemaining.toLocaleString()}`,
            ``,
            `**Tokens**`,
            `- Total: ${usage.tokensUsed.toLocaleString()}`,
            `- Avg per message: ${usage.messagesCount > 0 ? Math.round(usage.tokensUsed / usage.messagesCount).toLocaleString() : 0}`,
            ``,
            `**Estimated Cost**`,
            `- This period: $${(usage.costCents / 100).toFixed(2)}`,
            `- Per message: $${usage.messagesCount > 0 ? (usage.costCents / usage.messagesCount / 100).toFixed(4) : '0.00'}`,
            ``,
            `**Projection**`,
            `- Daily rate: ${getDailyRate(usage)} messages/day`,
            `- End of period: ~${getProjectedUsage(usage, tierConfig.messagesPerMonth)} messages`,
            percentUsed > 80 ? `\n⚠️ You're approaching your monthly limit. Consider upgrading.` : '',
          ].filter(Boolean).join('\n');
          
          return {
            content: [{ type: "text", text: detailedText }],
            details: { usage, status },
          };
        }
        
        // Summary view (default)
        const summaryText = [
          `**Usage: ${usage.messagesCount} / ${tierConfig.messagesPerMonth} messages**`,
          `${progressBar} ${percentUsed}%`,
          ``,
          `${status.messagesRemaining} messages remaining`,
          `Period ends: ${status.periodEnd.toLocaleDateString()} (${status.daysRemaining} days)`,
          percentUsed > 80 ? `\n⚠️ Consider upgrading for more messages.` : '',
        ].filter(Boolean).join('\n');
        
        return {
          content: [{ type: "text", text: summaryText }],
          details: { usage, status },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[stripe-billing] Usage tool error:`, error);
        
        return {
          content: [{ 
            type: "text", 
            text: `Error retrieving usage data: ${message}` 
          }],
        };
      }
    },
  };
}

function generateProgressBar(percent: number): string {
  const filled = Math.min(10, Math.round(percent / 10));
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

function getDailyRate(usage: { messagesCount: number; periodStart: Date }): number {
  const daysSinceStart = Math.max(1, Math.ceil((Date.now() - usage.periodStart.getTime()) / (24 * 60 * 60 * 1000)));
  return Math.round(usage.messagesCount / daysSinceStart);
}

function getProjectedUsage(usage: { messagesCount: number; periodStart: Date; periodEnd: Date }, limit: number): string {
  const totalDays = Math.ceil((usage.periodEnd.getTime() - usage.periodStart.getTime()) / (24 * 60 * 60 * 1000));
  const dailyRate = getDailyRate(usage);
  const projected = dailyRate * totalDays;
  
  if (projected > limit) {
    return `${projected.toLocaleString()} (over limit!)`;
  }
  return projected.toLocaleString();
}
