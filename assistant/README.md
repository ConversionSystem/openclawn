# ✨ Kyra - Your Intelligent AI Companion

A premium AI personal assistant with multi-channel support, powered by advanced AI models and built on the OpenClaw platform.

## Brand

| Element | Value |
|---------|-------|
| **Name** | Kyra (KY-rah) |
| **Tagline** | Your Intelligent Companion |
| **Wake Phrase** | "Hey Kyra" |

See [KYRA_BRAND_GUIDE.md](./KYRA_BRAND_GUIDE.md) for complete brand guidelines.

---

## Architecture

**Built on OpenClaw for 77% faster time-to-market.**

| Approach | Timeline | Hours | Savings |
|----------|----------|-------|---------|
| Custom Build | 10 weeks | 622h | - |
| **OpenClaw Extension** | **4 weeks** | **144h** | **77%** |

See [OPENCLAW_MVP_PIVOT.md](./OPENCLAW_MVP_PIVOT.md) for the full decision rationale.

---

## Features

### What Kyra Offers

- ✨ **Always Available** - Chat via web, Telegram, or your favorite platform
- 🧠 **Smart & Adaptive** - Powered by Claude, GPT-4, and Gemini
- 💭 **Remembers You** - Persistent memory across conversations
- 🔒 **Privacy First** - Your data stays yours
- 📱 **Multi-Channel** - One AI, everywhere you are

### Built-in (via OpenClaw)

- ✅ **WebChat** - Beautiful web interface
- ✅ **Telegram** - Native channel integration
- ✅ **AI Orchestration** - Model routing & failover
- ✅ **Sessions** - Memory, context, compaction
- ✅ **Multi-Provider** - Anthropic, OpenAI, Google, Ollama

### Custom Extension

- ✅ **Stripe Billing** - Subscription management & usage tracking

---

## Pricing

| Tier | Price | Messages/mo | Memory | Best For |
|------|-------|-------------|--------|----------|
| **Solo** | $39 | 1,000 | 7 days | Individuals |
| **Pro** | $79 | 3,000 | 30 days | Power users |
| **Business** | $149 | 10,000 | 90 days | Teams |

**Target Gross Margin: 84%+**  
**Break-even: ~15 users**

---

## Quick Start

### 1. Deploy OpenClaw

```bash
# Install OpenClaw
npm install -g openclaw@latest

# Run onboarding wizard
openclaw onboard --install-daemon

# Deploy to Fly.io
fly launch --name kyra-prod
```

### 2. Configure Channels

```bash
# Enable WebChat
openclaw config set channels.webchat.enabled true

# Add Telegram
openclaw config set channels.telegram.enabled true
openclaw config set channels.telegram.botToken "$TELEGRAM_BOT_TOKEN"
```

### 3. Install Billing Extension

```bash
# Install the extension
openclaw extensions install ./extensions/stripe-billing

# Configure Stripe
openclaw config set extensions.stripe-billing.stripeSecretKey "$STRIPE_SECRET_KEY"
openclaw config set extensions.stripe-billing.stripeWebhookSecret "$STRIPE_WEBHOOK_SECRET"
```

### 4. Start Kyra

```bash
openclaw gateway run --port 18789 --verbose
```

---

## Project Structure

```
assistant/
├── README.md                    # This file
├── KYRA_BRAND_GUIDE.md         # Brand guidelines
├── OPENCLAW_MVP_PIVOT.md       # Architecture decision
├── IMPLEMENTATION_ROADMAP_V2.md # 4-week roadmap
└── NAME_RESEARCH.md            # Naming research

extensions/stripe-billing/
├── package.json                # Dependencies
├── openclaw.plugin.json        # Plugin config
├── index.ts                    # Registration
├── README.md                   # Extension docs
└── src/
    ├── types.ts                # TypeScript types
    ├── stripe-service.ts       # Stripe API wrapper
    ├── subscription-tool.ts    # Billing agent tool
    ├── usage-tool.ts           # Usage statistics tool
    ├── tier-middleware.ts      # Rate limiting
    └── webhook-handler.ts      # Webhook processing

demo/
└── index.html                  # Interactive demo
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [KYRA_BRAND_GUIDE.md](./KYRA_BRAND_GUIDE.md) | Brand identity & guidelines |
| [OPENCLAW_MVP_PIVOT.md](./OPENCLAW_MVP_PIVOT.md) | Architecture decision |
| [IMPLEMENTATION_ROADMAP_V2.md](./IMPLEMENTATION_ROADMAP_V2.md) | 4-week implementation plan |
| [NAME_RESEARCH.md](./NAME_RESEARCH.md) | Naming research & alternatives |

---

## Timeline

| Phase | Week | Deliverable |
|-------|------|-------------|
| Setup | 1 | OpenClaw deployment, channels configured |
| Billing | 1-2 | Stripe extension complete |
| Integration | 2-3 | End-to-end testing |
| Launch | 3-4 | Beta with 10 users |

---

## Commands Reference

```bash
# Gateway
openclaw gateway run --port 18789

# Channels
openclaw channels status --probe
openclaw channels add telegram

# Extensions
openclaw extensions list
openclaw extensions install <path>

# Diagnostics
openclaw doctor
openclaw logs --follow
```

---

## License

Private - All rights reserved.

---

<p align="center">
  <strong>✨ Kyra - Your Intelligent Companion ✨</strong>
</p>
