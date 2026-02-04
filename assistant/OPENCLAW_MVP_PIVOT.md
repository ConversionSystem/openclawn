# MVP Pivot: Building on OpenClaw

> **Decision Date:** 2026-02-04  
> **Status:** Approved  
> **Impact:** Major architecture change - leverages existing OpenClaw infrastructure

---

## Executive Summary

**Previous Approach:** Build custom infrastructure (Hono API, React frontend, custom AI orchestrator)  
**New Approach:** Extend OpenClaw with billing extension and deploy as a hosted service

### Why Pivot?

| What We Were Building | What OpenClaw Already Has |
|----------------------|---------------------------|
| Hono API server | Gateway WebSocket control plane |
| React chat frontend | WebChat + Control UI |
| Custom AI orchestrator | Pi agent runtime with model routing |
| Session management | Sessions with memory, context, compaction |
| Telegram integration | Full Telegram channel plugin |
| Google OAuth | Auth profiles for multiple providers |
| Rate limiting | Built-in rate limiting and pairing |

**Estimated savings: 400+ development hours**

---

## Architecture Comparison

### Before (Custom Build)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOM ARCHITECTURE (Deprecated)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │  React Web  │────▶│  Hono API   │────▶│  Anthropic  │                  │
│   │  (Custom)   │     │  (Custom)   │     │    API      │                  │
│   └─────────────┘     └──────┬──────┘     └─────────────┘                  │
│                              │                                              │
│                       ┌──────▼──────┐                                       │
│                       │  PostgreSQL │                                       │
│                       │   (Neon)    │                                       │
│                       └─────────────┘                                       │
│                                                                              │
│   Status: ❌ Duplicates OpenClaw functionality                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### After (OpenClaw Extension)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OPENCLAW-BASED ARCHITECTURE (New)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   INTERFACE LAYER                                                           │
│   ═══════════════                                                           │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│   │   WebChat   │  │  Telegram   │  │   Discord   │  │   Slack     │      │
│   │ (Built-in)  │  │ (Built-in)  │  │ (Extension) │  │ (Built-in)  │      │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│          │                │                │                │              │
│          └────────────────┴────────────────┴────────────────┘              │
│                                    │                                        │
│                                    ▼                                        │
│   GATEWAY LAYER (OpenClaw Core)                                            │
│   ═════════════════════════════                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      OpenClaw Gateway                                │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │  │
│   │  │  Sessions   │  │  Routing    │  │  Channels   │                  │  │
│   │  │  & Memory   │  │  & Pairing  │  │  & DM Policy│                  │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                  │  │
│   │                                                                      │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │  │
│   │  │  Pi Agent   │  │   Skills    │  │  Extensions │                  │  │
│   │  │  Runtime    │  │   System    │  │   (Billing) │ ◄── NEW          │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   AI LAYER                                                                  │
│   ════════                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Model Selection & Failover                        │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │  │
│   │  │  Anthropic  │  │   OpenAI    │  │   Google    │                  │  │
│   │  │   Claude    │  │   GPT-4     │  │   Gemini    │                  │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Status: ✅ Leverages proven infrastructure                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What We Need to Build

### 1. Stripe Billing Extension (New)

The **only major new component** - an OpenClaw extension for subscription management:

```
extensions/
└── stripe-billing/
    ├── package.json
    ├── openclaw.plugin.json
    ├── index.ts                    # Plugin registration
    └── src/
        ├── stripe-service.ts       # Stripe API wrapper
        ├── subscription-tool.ts    # Agent tool for billing queries
        ├── webhook-handler.ts      # Stripe webhook processing
        ├── tier-middleware.ts      # Usage enforcement
        └── types.ts                # TypeScript definitions
```

### 2. Configuration & Deployment

- **OpenClaw config** for hosted multi-tenant mode
- **Fly.io deployment** configuration
- **Environment variables** for Stripe, database, etc.

### 3. Minimal Customization

- Landing page / marketing site (optional, could use WebChat directly)
- Custom welcome message / system prompt
- Tier-specific model routing rules

---

## OpenClaw Components We Use (Zero Custom Code Needed)

| Component | OpenClaw Feature | Location |
|-----------|-----------------|----------|
| **Web Chat** | WebChat channel | `src/channels/web/` |
| **Telegram** | Telegram channel plugin | `src/channels/plugins/onboarding/telegram.ts` |
| **AI Orchestration** | Pi agent runtime | `src/agents/pi-embedded-runner.ts` |
| **Model Routing** | Model selection & failover | `src/agents/model-selection.ts` |
| **Sessions** | Session management | `src/agents/` |
| **Memory** | Context & compaction | `src/agents/compaction.ts` |
| **Auth** | Auth profiles | `src/agents/auth-profiles/` |
| **CLI** | `openclaw` CLI | `src/cli/`, `src/commands/` |
| **Onboarding** | Wizard | `src/wizard/` |

---

## Stripe Billing Extension Design

### Plugin Structure

```json
// extensions/stripe-billing/openclaw.plugin.json
{
  "id": "stripe-billing",
  "name": "Stripe Billing",
  "description": "Subscription management and usage tracking for hosted OpenClaw deployments",
  "configSchema": {
    "type": "object",
    "properties": {
      "stripeSecretKey": { "type": "string" },
      "stripeWebhookSecret": { "type": "string" },
      "tiers": {
        "type": "object",
        "properties": {
          "solo": {
            "type": "object",
            "properties": {
              "priceId": { "type": "string" },
              "messagesPerMonth": { "type": "number" },
              "memoryDays": { "type": "number" }
            }
          },
          "pro": { "$ref": "#/properties/tiers/properties/solo" },
          "business": { "$ref": "#/properties/tiers/properties/solo" }
        }
      },
      "trialDays": { "type": "number", "default": 7 }
    },
    "required": ["stripeSecretKey", "stripeWebhookSecret"]
  }
}
```

### Agent Tool

```typescript
// extensions/stripe-billing/src/subscription-tool.ts
import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

export function createSubscriptionTool(api: OpenClawPluginApi) {
  return {
    name: "subscription",
    description: "Check subscription status, usage, or manage billing",
    parameters: Type.Object({
      action: Type.Union([
        Type.Literal("status"),
        Type.Literal("usage"),
        Type.Literal("upgrade"),
        Type.Literal("portal")
      ])
    }),
    async execute(_id: string, params: { action: string }) {
      const userId = api.context?.userId;
      if (!userId) {
        return { content: [{ type: "text", text: "User not identified" }] };
      }
      
      switch (params.action) {
        case "status":
          return getSubscriptionStatus(userId);
        case "usage":
          return getCurrentUsage(userId);
        case "upgrade":
          return getUpgradeUrl(userId);
        case "portal":
          return getBillingPortalUrl(userId);
      }
    }
  };
}
```

### Tier Enforcement Middleware

```typescript
// extensions/stripe-billing/src/tier-middleware.ts
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

export function createTierMiddleware(api: OpenClawPluginApi) {
  return {
    name: "tier-check",
    priority: 100, // Run early
    
    async beforeMessage(context: MessageContext) {
      const userId = context.userId;
      const subscription = await getSubscription(userId);
      
      if (!subscription || subscription.status !== 'active') {
        if (!isWithinTrial(userId)) {
          return {
            block: true,
            response: "Your trial has ended. Please subscribe to continue."
          };
        }
      }
      
      const usage = await getCurrentMonthUsage(userId);
      const limit = getTierLimit(subscription?.tier || 'trial');
      
      if (usage.messages >= limit.messagesPerMonth) {
        return {
          block: true,
          response: `You've reached your ${limit.messagesPerMonth} message limit. Upgrade for more.`
        };
      }
      
      return { block: false };
    },
    
    async afterMessage(context: MessageContext) {
      await incrementUsage(context.userId);
    }
  };
}
```

---

## Deployment Architecture

### Single-Tenant (Personal Use)

```bash
# Standard OpenClaw installation
npm install -g openclaw@latest
openclaw onboard --install-daemon

# Add Stripe billing extension
openclaw extensions install stripe-billing
openclaw config set extensions.stripe-billing.stripeSecretKey "sk_..."
```

### Multi-Tenant (Hosted Service)

```yaml
# fly.toml
app = "ai-assistant-prod"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile.hosted"

[env]
  NODE_ENV = "production"
  OPENCLAW_MODE = "hosted"

[http_service]
  internal_port = 18789
  force_https = true

[[services]]
  protocol = "tcp"
  internal_port = 18789
  
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[mounts]
  source = "openclaw_data"
  destination = "/data"
```

### Docker Configuration

```dockerfile
# Dockerfile.hosted
FROM node:22-slim

WORKDIR /app

# Install OpenClaw
RUN npm install -g openclaw@latest

# Install billing extension
COPY extensions/stripe-billing /app/extensions/stripe-billing
RUN cd /app/extensions/stripe-billing && npm install

# Configuration
COPY openclaw.hosted.json /app/openclaw.json

# Start gateway
CMD ["openclaw", "gateway", "run", "--bind", "0.0.0.0", "--port", "18789"]
```

---

## Revised Timeline

### Before Pivot (10 weeks)

| Phase | Weeks | Hours | What |
|-------|-------|-------|------|
| Foundation | 1-2 | 82h | Build from scratch |
| Core Chat | 3-4 | 152h | Custom AI orchestrator |
| Billing | 5-6 | 124h | Custom Stripe integration |
| Telegram | 7-8 | 124h | Custom Telegram bot |
| Launch | 9-10 | 140h | Testing & deploy |
| **Total** | **10** | **622h** | |

### After Pivot (4 weeks)

| Phase | Weeks | Hours | What |
|-------|-------|-------|------|
| Setup | 1 | 24h | OpenClaw deployment, config |
| Billing Extension | 1-2 | 48h | Stripe extension |
| Integration | 2-3 | 32h | Channels, testing |
| Launch | 3-4 | 40h | Production deploy, beta |
| **Total** | **4** | **144h** | |

**Savings: 478 hours (77% reduction)**

---

## Migration Plan

### Phase 1: Setup (Week 1)

1. **Deploy OpenClaw to Fly.io**
   ```bash
   cd /home/user/webapp
   openclaw onboard --install-daemon
   fly launch --name ai-assistant-prod
   ```

2. **Configure Telegram channel**
   ```bash
   openclaw channels add telegram
   # Follow prompts for bot token
   ```

3. **Configure WebChat**
   ```bash
   openclaw config set channels.webchat.enabled true
   ```

### Phase 2: Billing Extension (Weeks 1-2)

1. **Create extension structure**
   ```
   extensions/stripe-billing/
   ```

2. **Implement core functionality**
   - Stripe service wrapper
   - Subscription tool
   - Webhook handler
   - Tier middleware

3. **Test locally**
   ```bash
   cd extensions/stripe-billing
   npm test
   ```

### Phase 3: Integration (Weeks 2-3)

1. **Install extension in OpenClaw**
   ```bash
   openclaw extensions install ./extensions/stripe-billing
   ```

2. **Configure tiers**
   ```bash
   openclaw config set extensions.stripe-billing.tiers.solo.priceId "price_..."
   openclaw config set extensions.stripe-billing.tiers.solo.messagesPerMonth 1000
   ```

3. **Test end-to-end**
   - New user signup
   - Trial flow
   - Payment flow
   - Usage enforcement

### Phase 4: Launch (Weeks 3-4)

1. **Production deployment**
2. **Beta user onboarding**
3. **Monitoring setup**
4. **Documentation**

---

## What Happens to assistant/ Directory

The `assistant/` directory contains code that is **no longer needed**:

| Directory | Status | Action |
|-----------|--------|--------|
| `apps/api/` | Deprecated | Archive or delete |
| `apps/web/` | Deprecated | Archive or delete |
| `packages/shared/` | Deprecated | Archive or delete |
| `infra/` | Partially useful | Migrate Fly.io config |
| Documentation | Keep | Update for OpenClaw approach |

**Recommendation:** Archive to `assistant/_archived/` and create new `extensions/stripe-billing/` in the main repo.

---

## Cost Comparison

### Development Cost

| Approach | Hours | Cost (@$100/h) |
|----------|-------|----------------|
| Custom Build | 622h | $62,200 |
| OpenClaw Extension | 144h | $14,400 |
| **Savings** | **478h** | **$47,800** |

### Ongoing Maintenance

| Aspect | Custom Build | OpenClaw Extension |
|--------|--------------|-------------------|
| Security updates | Manual | OpenClaw handles |
| New channels | Build each | Already available |
| Model updates | Manual integration | Automatic |
| Bug fixes | Full responsibility | Community + core team |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OpenClaw API changes | Medium | Medium | Pin versions, follow changelog |
| Extension limitations | Low | Medium | Contribute upstream if needed |
| Performance at scale | Low | High | OpenClaw already handles multi-channel |
| Feature gaps | Low | Low | Most features already exist |

---

## Next Steps

1. **Archive `assistant/` custom code**
2. **Create `extensions/stripe-billing/` structure**
3. **Implement billing extension**
4. **Deploy OpenClaw to Fly.io**
5. **Configure channels (Telegram, WebChat)**
6. **Beta launch**

---

## Conclusion

Pivoting to OpenClaw reduces development time by **77%** while gaining:

- ✅ Battle-tested multi-channel support
- ✅ Proven AI orchestration
- ✅ Active community and updates
- ✅ Documented deployment paths
- ✅ Skills/extensions ecosystem

The **only custom code needed** is the Stripe billing extension (~48 hours of work).
