# AI Personal Assistant MVP - Implementation Roadmap v2.0

> **Version:** 2.0 (OpenClaw Pivot)  
> **Last Updated:** 2026-02-04  
> **Project Timeline:** 4 weeks (previously 10 weeks)  
> **Target Launch:** Q1 2026  
> **Change:** Pivoted from custom build to OpenClaw extension

---

## Executive Summary

### The Pivot Decision

**Before:** Build custom infrastructure from scratch (622 hours, 10 weeks)  
**After:** Extend OpenClaw with billing (144 hours, 4 weeks)  
**Savings:** 478 hours (77% reduction)

This roadmap reflects our decision to build on OpenClaw rather than recreating existing functionality. We now focus on:

1. **Stripe Billing Extension** - The only significant new code
2. **OpenClaw Deployment** - Configuration and hosting
3. **Channel Setup** - Telegram + WebChat configuration

### Goals Unchanged

- **84%+ gross margins** through intelligent cost optimization
- **Break-even at ~15 users**, profitable at 200+ users
- **Premium positioning** ($39-149/month utility-style pricing)
- **Multi-channel readiness** (Web + Telegram) from day one

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [What OpenClaw Provides](#2-what-openclaw-provides)
3. [What We Build](#3-what-we-build)
4. [Revised Milestones](#4-revised-milestones)
5. [Technical Implementation](#5-technical-implementation)
6. [Resource Requirements](#6-resource-requirements)
7. [Risk Mitigation](#7-risk-mitigation)
8. [Success Metrics](#8-success-metrics)

---

## 1. Architecture Overview

### OpenClaw-Based Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AI PERSONAL ASSISTANT (OpenClaw-Based)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER INTERFACES (OpenClaw Built-in)                                        │
│  ═══════════════════════════════════                                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  WebChat  │  │ Telegram  │  │  Discord  │  │   Slack   │               │
│  │ (Built-in)│  │(Built-in) │  │(Extension)│  │(Built-in) │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        └──────────────┴──────────────┴──────────────┘                       │
│                              │                                              │
│                              ▼                                              │
│  OPENCLAW GATEWAY                                                           │
│  ════════════════                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │  │
│  │  │  Sessions   │  │   Routing   │  │   Pairing   │                   │  │
│  │  │  & Memory   │  │  & Agents   │  │  & Security │                   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │  │
│  │  │  Pi Agent   │  │   Skills    │  │      STRIPE BILLING         │   │  │
│  │  │  Runtime    │  │   System    │  │      (NEW EXTENSION)        │   │  │
│  │  └─────────────┘  └─────────────┘  │  ┌───────────────────────┐  │   │  │
│  │                                     │  │ • Subscription mgmt   │  │   │  │
│  │                                     │  │ • Usage tracking      │  │   │  │
│  │                                     │  │ • Tier enforcement    │  │   │  │
│  │                                     │  │ • Agent tools         │  │   │  │
│  │                                     │  └───────────────────────┘  │   │  │
│  │                                     └─────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  AI PROVIDERS (OpenClaw Multi-Provider Support)                             │
│  ══════════════════════════════════════════════                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ Anthropic │  │  OpenAI   │  │  Google   │  │  Ollama   │               │
│  │  Claude   │  │  GPT-4    │  │  Gemini   │  │  Local    │               │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. What OpenClaw Provides

### Already Built (Zero Development Needed)

| Feature | OpenClaw Component | Complexity Saved |
|---------|-------------------|------------------|
| **Web Chat** | WebChat channel | 40h |
| **Telegram** | Telegram plugin | 32h |
| **AI Orchestration** | Pi agent runtime | 80h |
| **Model Routing** | Model selection & failover | 24h |
| **Model Providers** | Anthropic, OpenAI, Google, Ollama | 40h |
| **Sessions** | Session management | 24h |
| **Memory** | Context & compaction | 24h |
| **Security** | DM pairing, allowlists | 16h |
| **CLI** | `openclaw` commands | 40h |
| **Onboarding** | Wizard-driven setup | 16h |
| **Discord** | Discord.js integration | 24h |
| **Slack** | Bolt integration | 24h |
| **Voice** | VoiceWake + Talk Mode | 32h |
| **Canvas** | Live visual workspace | 40h |

**Total Saved: ~456 hours**

### OpenClaw Directory Structure

```
openclaw/
├── src/
│   ├── agents/           # Pi agent runtime, model selection
│   ├── channels/         # WebChat, Telegram, Discord, Slack
│   ├── cli/              # CLI commands
│   ├── commands/         # Gateway commands
│   ├── config/           # Configuration management
│   ├── wizard/           # Onboarding wizard
│   └── plugins/          # Extension system
├── extensions/           # Our billing extension goes here
│   ├── stripe-billing/   # ← NEW
│   └── ...
└── skills/               # Bundled skills
```

---

## 3. What We Build

### Stripe Billing Extension (Only New Code)

```
extensions/stripe-billing/
├── package.json              # Dependencies (stripe)
├── openclaw.plugin.json      # Plugin config schema
├── index.ts                  # Plugin registration
├── README.md                 # Documentation
└── src/
    ├── types.ts              # TypeScript types
    ├── stripe-service.ts     # Stripe API wrapper
    ├── subscription-tool.ts  # Agent tool for billing
    ├── usage-tool.ts         # Agent tool for usage stats
    ├── tier-middleware.ts    # Limit enforcement
    └── webhook-handler.ts    # Stripe webhook processing
```

### Configuration & Deployment

| Item | Effort | Notes |
|------|--------|-------|
| OpenClaw config | 4h | Hosted mode, tiers, channels |
| Fly.io deployment | 8h | Docker, secrets, domains |
| Stripe setup | 4h | Products, prices, webhooks |
| Domain & SSL | 2h | DNS, certificates |
| Monitoring | 4h | Sentry, logs |

---

## 4. Revised Milestones

### Timeline Comparison

| Approach | Weeks | Hours | Cost (@$100/h) |
|----------|-------|-------|----------------|
| Custom Build (v1) | 10 | 622h | $62,200 |
| **OpenClaw Extension (v2)** | **4** | **144h** | **$14,400** |
| **Savings** | **6 weeks** | **478h** | **$47,800** |

### Phase 1: Setup & Config (Week 1)

| Task | Hours | Owner | Status |
|------|-------|-------|--------|
| Deploy OpenClaw to Fly.io | 8h | DevOps | ⏳ |
| Configure hosted mode | 4h | DevOps | ⏳ |
| Set up Telegram channel | 4h | DevOps | ⏳ |
| Configure WebChat | 2h | DevOps | ⏳ |
| Domain & SSL setup | 2h | DevOps | ⏳ |
| Environment variables | 2h | DevOps | ⏳ |
| **Phase 1 Total** | **22h** | | |

**Decision Gate:**
- [ ] OpenClaw gateway running on Fly.io
- [ ] WebChat accessible at production URL
- [ ] Telegram bot responding

### Phase 2: Billing Extension (Weeks 1-2)

| Task | Hours | Owner | Status |
|------|-------|-------|--------|
| Extension scaffold | 4h | Backend | ✅ Done |
| Stripe service implementation | 12h | Backend | ⏳ |
| Subscription tool | 8h | Backend | ✅ Done |
| Usage tool | 4h | Backend | ✅ Done |
| Tier middleware | 8h | Backend | ✅ Done |
| Webhook handler | 4h | Backend | ✅ Done |
| Unit tests | 8h | Backend | ⏳ |
| **Phase 2 Total** | **48h** | | |

**Decision Gate:**
- [ ] Extension installs in OpenClaw
- [ ] Subscription tool works via chat
- [ ] Webhooks process correctly
- [ ] Tier limits enforced

### Phase 3: Integration & Testing (Weeks 2-3)

| Task | Hours | Owner | Status |
|------|-------|-------|--------|
| Install extension in production | 4h | DevOps | ⏳ |
| Configure Stripe products | 4h | Business | ⏳ |
| End-to-end testing | 16h | QA | ⏳ |
| Fix integration issues | 8h | Backend | ⏳ |
| Documentation | 4h | All | ⏳ |
| **Phase 3 Total** | **36h** | | |

**Decision Gate:**
- [ ] New user can sign up and subscribe
- [ ] Existing user can check usage
- [ ] Limits enforced correctly
- [ ] Webhooks update status

### Phase 4: Launch (Weeks 3-4)

| Task | Hours | Owner | Status |
|------|-------|-------|--------|
| Beta user recruitment | 8h | Product | ⏳ |
| Beta testing (10 users) | 16h | All | ⏳ |
| Bug fixes from feedback | 8h | Backend | ⏳ |
| Monitoring setup | 4h | DevOps | ⏳ |
| Launch checklist | 2h | All | ⏳ |
| **Phase 4 Total** | **38h** | | |

**Launch Criteria:**
- [ ] 10 beta users validated product
- [ ] < 2s response latency
- [ ] 99.5% uptime in beta
- [ ] All critical bugs fixed

---

## 5. Technical Implementation

### 5.1 OpenClaw Deployment

```bash
# Initial setup
cd /path/to/openclaw
pnpm install
pnpm build

# Configure for hosted mode
openclaw config set gateway.mode "hosted"
openclaw config set gateway.publicUrl "https://assistant.yourdomain.com"

# Set up auth (Anthropic API)
openclaw config set agents.defaults.model.primary "anthropic/claude-3-5-sonnet"
# Add API key via environment or secure config

# Enable channels
openclaw config set channels.webchat.enabled true
openclaw config set channels.telegram.enabled true
openclaw config set channels.telegram.botToken "$TELEGRAM_BOT_TOKEN"
```

### 5.2 Fly.io Configuration

```toml
# fly.toml
app = "ai-assistant-prod"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  OPENCLAW_MODE = "hosted"

[http_service]
  internal_port = 18789
  force_https = true
  auto_start_machines = true
  min_machines_running = 1

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

### 5.3 Extension Installation

```bash
# Install billing extension
cd extensions/stripe-billing
pnpm install

# Register with OpenClaw
openclaw extensions install ./extensions/stripe-billing

# Configure
openclaw config set extensions.stripe-billing.stripeSecretKey "$STRIPE_SECRET_KEY"
openclaw config set extensions.stripe-billing.stripeWebhookSecret "$STRIPE_WEBHOOK_SECRET"
openclaw config set extensions.stripe-billing.tiers.solo.priceId "price_solo_xxx"
openclaw config set extensions.stripe-billing.tiers.pro.priceId "price_pro_xxx"
openclaw config set extensions.stripe-billing.tiers.business.priceId "price_business_xxx"
```

### 5.4 Stripe Products Setup

| Product | Price ID | Amount | Interval |
|---------|----------|--------|----------|
| AI Assistant Solo | `price_solo_xxx` | $39 | month |
| AI Assistant Pro | `price_pro_xxx` | $79 | month |
| AI Assistant Business | `price_business_xxx` | $149 | month |

**Webhook Events to Enable:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## 6. Resource Requirements

### 6.1 Team (Reduced from Original)

| Role | Allocation | Hours/Week | Total (4 wks) |
|------|------------|------------|---------------|
| Backend Developer | 75% | 30h | 120h |
| DevOps | 25% | 10h | 40h |
| **Total** | | **40h** | **160h** |

*Note: Previously required Frontend developer no longer needed (using OpenClaw WebChat)*

### 6.2 Infrastructure Costs

| Stage | Monthly Cost | Notes |
|-------|--------------|-------|
| **Development** | ~$50 | Free tiers + minimal Anthropic |
| **Beta** | ~$150 | Fly.io + Stripe test + Anthropic |
| **Launch (100 users)** | ~$600 | Scaled Fly.io + production Stripe |

### 6.3 Third-Party Services

| Service | Purpose | Cost | Fallback |
|---------|---------|------|----------|
| Fly.io | Hosting | $20-100/mo | Railway |
| Anthropic | AI | Variable | OpenAI |
| Stripe | Billing | 2.9% + 30¢ | Paddle |
| Sentry | Errors | Free-$26/mo | - |

---

## 7. Risk Mitigation

### Reduced Risks (Due to Pivot)

| Risk | Original | Now | Why |
|------|----------|-----|-----|
| Chat UI bugs | High | None | Using OpenClaw WebChat |
| AI integration | High | None | Using OpenClaw Pi agent |
| Telegram issues | Medium | Low | Using proven plugin |
| Auth problems | Medium | None | Using OpenClaw auth |
| Timeline slip | High | Low | 77% less work |

### Remaining Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe integration | Medium | High | Follow Stripe docs exactly |
| OpenClaw updates | Low | Medium | Pin version, test updates |
| Extension compatibility | Low | Medium | Follow plugin API |
| Webhook failures | Medium | Medium | Idempotency, retries |

### Contingency Plan

If the billing extension proves more complex than expected:
1. **Week 2 slip:** Cut advanced features (detailed usage analytics)
2. **Week 3 slip:** Launch with manual billing temporarily
3. **Critical blocker:** Use Stripe Payment Links directly

---

## 8. Success Metrics

### Launch Readiness (Unchanged)

- [ ] User can sign in via Telegram or WebChat
- [ ] User can chat with AI
- [ ] User can subscribe via Stripe
- [ ] Tier limits enforced
- [ ] Usage tracking works

### Quantitative Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| First response latency | < 2s | OpenClaw logs |
| Uptime | > 99.5% | Fly.io metrics |
| Checkout completion | > 80% | Stripe dashboard |
| Error rate | < 1% | Sentry |

### Beta Validation (10 users, 7 days)

- [ ] 8/10 complete onboarding without help
- [ ] 8/10 rate experience 7+/10
- [ ] 0 data loss incidents
- [ ] NPS > 30 (nice to have)

---

## Appendix A: Migration from Custom Code

The `assistant/` directory contains deprecated custom code:

| Directory | Status | Action |
|-----------|--------|--------|
| `apps/api/` | Deprecated | Archive to `_archived/` |
| `apps/web/` | Deprecated | Archive to `_archived/` |
| `packages/shared/` | Deprecated | Archive to `_archived/` |
| `infra/` | Partial use | Keep Fly.io config |
| Documentation | Active | Update for OpenClaw |

---

## Appendix B: Commands Reference

```bash
# OpenClaw Gateway
openclaw gateway run --port 18789 --verbose

# Channel Status
openclaw channels status --probe

# Extension Management
openclaw extensions list
openclaw extensions install <path>
openclaw extensions uninstall <id>

# Configuration
openclaw config get <key>
openclaw config set <key> <value>
openclaw config list

# Diagnostics
openclaw doctor
openclaw logs --follow
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | AI | Initial custom build roadmap |
| 2.0 | 2026-02-04 | AI | Pivoted to OpenClaw extension |

---

*This roadmap supersedes IMPLEMENTATION_ROADMAP.md (v1.0)*
