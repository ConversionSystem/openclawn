# Kyra AI - Cloudflare Workers Deployment

> **Your Intelligent Companion** - Powered by OpenClaw on Cloudflare

## Quick Start

### Prerequisites

- Node.js 20+
- Cloudflare account with Workers Paid plan ($5/mo)
- Anthropic API key
- Stripe account (for billing)

### Setup

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create storage resources
npm run setup

# Configure secrets
npm run setup:secrets

# Deploy
npm run deploy
```

### Access Your Deployment

- **Health Check**: `https://kyra-ai.<subdomain>.workers.dev/health`
- **Admin UI**: `https://kyra-ai.<subdomain>.workers.dev/_admin?token=YOUR_TOKEN`

## Configuration

### Required Secrets

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `MOLTBOT_GATEWAY_TOKEN` | Gateway auth token (generate with `openssl rand -hex 32`) |

### Optional Secrets

| Secret | Description |
|--------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain |
| `CF_ACCESS_AUD` | Cloudflare Access audience |

## Project Structure

```
kyra-cloudflare/
├── wrangler.toml           # Cloudflare Worker config
├── package.json            # Dependencies & scripts
├── src/
│   └── index.ts            # Worker entry point
├── config/
│   └── kyra.config.json    # Kyra configuration
└── README.md               # This file
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local development |
| `npm run deploy` | Deploy to production |
| `npm run tail` | View real-time logs |
| `npm run setup` | Initial setup (R2 + KV) |
| `npm run setup:secrets` | Configure all secrets |

## API Endpoints

### Public

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/detailed` | GET | Detailed health check |
| `/webhooks/stripe` | POST | Stripe webhooks |

### Protected (Requires Auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/_admin` | GET | Admin UI |
| `/api/subscription/status` | GET | Get subscription status |
| `/api/subscription/checkout` | POST | Create checkout session |
| `/api/subscription/portal` | POST | Get billing portal URL |
| `/api/usage` | GET | Get usage stats |
| `/gateway/*` | ALL | OpenClaw gateway proxy |

## Pricing Tiers

| Tier | Price | Messages | Memory | Channels |
|------|-------|----------|--------|----------|
| Trial | Free | 100/mo | 3 days | 1 |
| Solo | $39/mo | 1,000/mo | 7 days | 2 |
| Pro | $79/mo | 3,000/mo | 30 days | 5 |
| Business | $149/mo | 10,000/mo | 90 days | Unlimited |

## Documentation

- [Cloudflare Deployment Guide](../CLOUDFLARE_DEPLOYMENT_GUIDE.md)
- [OpenClaw Documentation](https://openclaw.ai/docs)
- [Moltworker Repository](https://github.com/cloudflare/moltworker)

## Support

For issues and questions:
- GitHub Issues: https://github.com/ConversionSystem/openclawn/issues
- OpenClaw Discord: https://discord.openclaw.ai

---

*Kyra AI - Your Intelligent Companion*
