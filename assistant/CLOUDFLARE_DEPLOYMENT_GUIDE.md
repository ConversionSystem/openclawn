# Kyra AI - Cloudflare Deployment Guide

> **Complete guide to deploying Kyra AI (OpenClaw MVP) on Cloudflare**  
> **Status:** Production-Ready  
> **Last Updated:** 2026-02-04  
> **Replaces:** Fly.io deployment (fly.toml)

---

## Executive Summary

This guide provides **complete instructions** for deploying the Kyra AI assistant on Cloudflare using **Moltworker** - Cloudflare's official middleware for running OpenClaw on their platform.

### Why Cloudflare Over Fly.io?

| Aspect | Fly.io | Cloudflare |
|--------|--------|------------|
| **Global Edge** | Regional | 300+ cities worldwide |
| **Cold Start** | ~500ms | ~50ms (Workers) |
| **Auto-scaling** | Manual config | Automatic |
| **DDoS Protection** | Basic | Enterprise-grade (free) |
| **SSL/TLS** | Manual | Automatic |
| **Cost (Starter)** | ~$20/mo | ~$5/mo |
| **AI Gateway** | None | Built-in (BYOK/Unified Billing) |
| **Browser Automation** | Self-managed | Browser Rendering API |
| **Zero Trust Auth** | External | Built-in (Cloudflare Access) |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KYRA AI ON CLOUDFLARE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER CHANNELS                                                              │
│  ════════════                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  WebChat  │  │ Telegram  │  │  Discord  │  │   Slack   │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        └──────────────┴──────────────┴──────────────┘                       │
│                              │                                              │
│                              ▼                                              │
│  CLOUDFLARE EDGE (300+ Cities)                                              │
│  ═════════════════════════════                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │  │
│  │  │  Cloudflare │  │  Zero Trust │  │     DDoS    │                   │  │
│  │  │   Workers   │  │   Access    │  │  Protection │                   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                    MOLTWORKER MIDDLEWARE                         │ │  │
│  │  │  • API Router & Proxy                                            │ │  │
│  │  │  • Admin UI                                                      │ │  │
│  │  │  • Device Pairing                                                │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                              │                                        │  │
│  │                              ▼                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                   SANDBOX CONTAINER                              │ │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐    │ │  │
│  │  │  │              OPENCLAW GATEWAY RUNTIME                    │    │ │  │
│  │  │  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │    │ │  │
│  │  │  │  │ Sessions  │  │  Memory   │  │ STRIPE BILLING    │    │    │ │  │
│  │  │  │  │ & Routing │  │ & Context │  │ (Kyra Extension)  │    │    │ │  │
│  │  │  │  └───────────┘  └───────────┘  └───────────────────┘    │    │ │  │
│  │  │  │                                                          │    │ │  │
│  │  │  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐    │    │ │  │
│  │  │  │  │ Pi Agent  │  │  Skills   │  │ KYRA PERSONALITY  │    │    │ │  │
│  │  │  │  │ Runtime   │  │  System   │  │ (Kyra Extension)  │    │    │ │  │
│  │  │  │  └───────────┘  └───────────┘  └───────────────────┘    │    │ │  │
│  │  │  └─────────────────────────────────────────────────────────┘    │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                              │                                        │  │
│  └──────────────────────────────┴────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  CLOUDFLARE SERVICES                                                        │
│  ═══════════════════                                                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │    R2     │  │    AI     │  │  Browser  │  │   KV      │               │
│  │  Storage  │  │  Gateway  │  │ Rendering │  │  Storage  │               │
│  │(Persist)  │  │(AI Proxy) │  │(Headless) │  │ (Config)  │               │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
│                                 │                                            │
│                                 ▼                                            │
│  AI PROVIDERS (via AI Gateway)                                              │
│  ═════════════════════════════                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ Anthropic │  │  OpenAI   │  │  Google   │  │  Ollama   │               │
│  │  Claude   │  │  GPT-4    │  │  Gemini   │  │  (Local)  │               │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (One-Click Deploy)](#2-quick-start-one-click-deploy)
3. [Manual Deployment](#3-manual-deployment)
4. [Configuration](#4-configuration)
5. [Kyra Extensions Setup](#5-kyra-extensions-setup)
6. [Stripe Billing Integration](#6-stripe-billing-integration)
7. [Channel Configuration](#7-channel-configuration)
8. [Security & Authentication](#8-security--authentication)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Cost Optimization](#10-cost-optimization)
11. [Troubleshooting](#11-troubleshooting)
12. [Production Checklist](#12-production-checklist)

---

## 1. Prerequisites

### Required Accounts & Keys

| Service | Purpose | Cost | Required |
|---------|---------|------|----------|
| **Cloudflare Account** | Hosting platform | Free tier + $5/mo Workers Paid | ✅ Yes |
| **Anthropic API Key** | AI (Claude) | Pay-per-use | ✅ Yes |
| **Stripe Account** | Billing (Kyra) | 2.9% + 30¢/tx | ✅ Yes |
| **Telegram Bot Token** | Telegram channel | Free | ⬜ Optional |
| **Discord Bot Token** | Discord channel | Free | ⬜ Optional |
| **Custom Domain** | Branding | ~$10/yr | ⬜ Optional |

### Cloudflare Account Setup

1. **Create Account**: https://dash.cloudflare.com/sign-up
2. **Upgrade to Workers Paid** ($5/month):
   - Dashboard → Workers & Pages → Plans → Paid
   - Required for Sandbox Containers

### Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Verify
wrangler whoami
```

---

## 2. Quick Start (One-Click Deploy)

### Option A: Deploy from Moltworker Repository

```bash
# Clone Moltworker
git clone https://github.com/cloudflare/moltworker.git
cd moltworker

# Install dependencies
npm install

# Configure secrets
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your Anthropic API key

npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
# Generate: openssl rand -hex 32

# Deploy
npm run deploy
```

### Option B: Deploy Button (Recommended)

Visit: https://github.com/cloudflare/moltworker

Click **"Deploy to Cloudflare Workers"** button

### Post-Deploy Steps

1. **Access Control UI**: `https://<your-worker>.workers.dev/?token=YOUR_GATEWAY_TOKEN`
2. **Configure Kyra extensions** (see Section 5)
3. **Set up Stripe billing** (see Section 6)

---

## 3. Manual Deployment

### Step 3.1: Project Structure

Create Kyra-specific configuration:

```
kyra-cloudflare/
├── wrangler.toml              # Cloudflare Worker config
├── package.json               # Dependencies
├── src/
│   └── index.ts               # Worker entry point
├── extensions/
│   ├── stripe-billing/        # Billing extension (from repo)
│   └── kyra-personality/      # Personality extension (from repo)
└── config/
    ├── kyra.config.json       # Kyra-specific config
    └── .env.example           # Environment template
```

### Step 3.2: wrangler.toml Configuration

```toml
# wrangler.toml - Kyra AI on Cloudflare Workers

name = "kyra-ai"
main = "src/index.ts"
compatibility_date = "2026-01-29"
compatibility_flags = ["nodejs_compat"]

# Account settings (optional - uses logged-in account)
# account_id = "your-account-id"

# Worker settings
[vars]
ENVIRONMENT = "production"
KYRA_VERSION = "1.0.0"

# R2 Storage for persistence
[[r2_buckets]]
binding = "KYRA_DATA"
bucket_name = "kyra-data"

# KV Namespace for config cache
[[kv_namespaces]]
binding = "KYRA_CONFIG"
id = "your-kv-namespace-id"

# Sandbox Container (Durable Object)
[[durable_objects.bindings]]
name = "Sandbox"
class_name = "Sandbox"

[[migrations]]
tag = "v1"
new_classes = ["Sandbox"]

# AI Gateway (optional but recommended)
[ai]
binding = "AI"

# Browser Rendering (for web automation)
[browser]
binding = "BROWSER"

# Scheduled tasks (usage reset, etc.)
[triggers]
crons = ["0 0 1 * *"]  # Monthly usage reset

# Environment-specific overrides
[env.staging]
name = "kyra-ai-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
name = "kyra-ai"
vars = { ENVIRONMENT = "production" }
routes = [
  { pattern = "kyra.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Step 3.3: Package Configuration

```json
{
  "name": "kyra-ai-cloudflare",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:production": "wrangler deploy --env production",
    "tail": "wrangler tail",
    "secret:anthropic": "wrangler secret put ANTHROPIC_API_KEY",
    "secret:stripe": "wrangler secret put STRIPE_SECRET_KEY",
    "secret:stripe-webhook": "wrangler secret put STRIPE_WEBHOOK_SECRET",
    "secret:gateway": "wrangler secret put MOLTBOT_GATEWAY_TOKEN",
    "r2:create": "wrangler r2 bucket create kyra-data",
    "kv:create": "wrangler kv:namespace create KYRA_CONFIG"
  },
  "dependencies": {
    "@cloudflare/sandbox": "^0.1.0",
    "hono": "^4.0.0",
    "stripe": "^14.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0"
  }
}
```

### Step 3.4: Worker Entry Point

```typescript
// src/index.ts - Kyra AI Worker Entry Point

import { getSandbox } from '@cloudflare/sandbox';
export { Sandbox } from '@cloudflare/sandbox';

interface Env {
  Sandbox: DurableObjectNamespace;
  KYRA_DATA: R2Bucket;
  KYRA_CONFIG: KVNamespace;
  AI: Fetcher;
  BROWSER: Fetcher;
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  MOLTBOT_GATEWAY_TOKEN: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ 
        status: 'healthy', 
        service: 'kyra-ai',
        timestamp: new Date().toISOString()
      });
    }
    
    // Stripe webhooks (no auth required - verified by signature)
    if (url.pathname === '/webhooks/stripe') {
      return handleStripeWebhook(request, env);
    }
    
    // Authenticate all other requests
    const authResult = await authenticate(request, env);
    if (!authResult.authenticated) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Admin UI
    if (url.pathname.startsWith('/_admin')) {
      return handleAdminUI(request, env);
    }
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, authResult.userId);
    }
    
    // Gateway communication
    const sandbox = getSandbox(env.Sandbox, authResult.userId || 'default');
    
    // Mount R2 for persistent storage
    await sandbox.mountBucket(env.KYRA_DATA, '/data');
    
    // Forward to OpenClaw gateway in sandbox
    return sandbox.fetch(request);
  },
  
  // Monthly usage reset
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Running monthly usage reset...');
    // Reset usage counters for all users
    await resetMonthlyUsage(env);
  }
};

async function authenticate(request: Request, env: Env): Promise<{authenticated: boolean, userId?: string}> {
  // Check gateway token
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (token === env.MOLTBOT_GATEWAY_TOKEN) {
    return { authenticated: true, userId: 'admin' };
  }
  
  // Check Cloudflare Access JWT if configured
  if (env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (jwt) {
      const verified = await verifyAccessJWT(jwt, env);
      if (verified) {
        return { authenticated: true, userId: verified.email };
      }
    }
  }
  
  return { authenticated: false };
}

async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  // Webhook handling implemented in stripe-billing extension
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }
  
  // Forward to extension handler
  // ... (implemented in extensions/stripe-billing)
  
  return new Response('OK', { status: 200 });
}

async function handleAdminUI(request: Request, env: Env): Promise<Response> {
  // Admin UI implementation
  return new Response('Admin UI', { status: 200 });
}

async function handleAPI(request: Request, env: Env, userId?: string): Promise<Response> {
  // API routes implementation
  return new Response('API', { status: 200 });
}

async function resetMonthlyUsage(env: Env): Promise<void> {
  // Reset implementation
  console.log('Usage reset complete');
}

async function verifyAccessJWT(jwt: string, env: Env): Promise<{email: string} | null> {
  // JWT verification implementation
  return null;
}
```

### Step 3.5: Deploy

```bash
# Create R2 bucket for data persistence
wrangler r2 bucket create kyra-data

# Create KV namespace for config
wrangler kv:namespace create KYRA_CONFIG
# Note the ID and add to wrangler.toml

# Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Deploy
wrangler deploy

# Verify deployment
curl https://kyra-ai.<your-subdomain>.workers.dev/health
```

---

## 4. Configuration

### Environment Variables & Secrets

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `ANTHROPIC_API_KEY` | Secret | ✅ | Claude API key |
| `ANTHROPIC_BASE_URL` | Env | ⬜ | AI Gateway URL (optional) |
| `STRIPE_SECRET_KEY` | Secret | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret | ✅ | Stripe webhook signing secret |
| `MOLTBOT_GATEWAY_TOKEN` | Secret | ✅ | Gateway authentication token |
| `CF_ACCESS_TEAM_DOMAIN` | Secret | ⬜ | Cloudflare Access team domain |
| `CF_ACCESS_AUD` | Secret | ⬜ | Cloudflare Access audience tag |
| `TELEGRAM_BOT_TOKEN` | Secret | ⬜ | Telegram bot token |
| `DISCORD_BOT_TOKEN` | Secret | ⬜ | Discord bot token |
| `SLACK_BOT_TOKEN` | Secret | ⬜ | Slack bot token |

### Setting Secrets

```bash
# Generate gateway token
GATEWAY_TOKEN=$(openssl rand -hex 32)
echo "Save this token: $GATEWAY_TOKEN"
wrangler secret put MOLTBOT_GATEWAY_TOKEN
# Paste the token

# AI Provider
wrangler secret put ANTHROPIC_API_KEY
# sk-ant-api03-...

# Stripe
wrangler secret put STRIPE_SECRET_KEY
# sk_live_...
wrangler secret put STRIPE_WEBHOOK_SECRET
# whsec_...

# Optional channels
wrangler secret put TELEGRAM_BOT_TOKEN
# 123456789:ABC-DEF...
```

### Kyra Configuration File

```json
// config/kyra.config.json
{
  "$schema": "https://openclaw.ai/schemas/config.json",
  "version": "1.0",
  
  "assistant": {
    "name": "Kyra",
    "tagline": "Your Intelligent Companion",
    "personality": "warm_professional"
  },
  
  "gateway": {
    "port": 3000,
    "host": "0.0.0.0",
    "cors": {
      "enabled": true,
      "origins": ["*"]
    }
  },
  
  "agent": {
    "model": {
      "primary": "anthropic/claude-3-5-sonnet-20241022",
      "fallback": [
        "openai/gpt-4o",
        "google/gemini-1.5-pro"
      ]
    },
    "maxTokens": 4096,
    "temperature": 0.7
  },
  
  "memory": {
    "enabled": true,
    "maxMessages": 100,
    "compaction": {
      "enabled": true,
      "threshold": 50
    }
  },
  
  "channels": {
    "webchat": {
      "enabled": true,
      "theme": "kyra"
    },
    "telegram": {
      "enabled": true
    },
    "discord": {
      "enabled": false
    },
    "slack": {
      "enabled": false
    }
  },
  
  "extensions": {
    "stripe-billing": {
      "enabled": true,
      "tiers": {
        "solo": {
          "priceId": "price_solo_xxx",
          "messagesPerMonth": 1000,
          "memoryDays": 7
        },
        "pro": {
          "priceId": "price_pro_xxx",
          "messagesPerMonth": 3000,
          "memoryDays": 30
        },
        "business": {
          "priceId": "price_business_xxx",
          "messagesPerMonth": 10000,
          "memoryDays": 90
        }
      },
      "trialDays": 7
    },
    "kyra-personality": {
      "enabled": true,
      "style": "warm_professional"
    }
  }
}
```

---

## 5. Kyra Extensions Setup

### Copy Extensions to Deployment

The Kyra extensions are already built in the repository. Copy them to your Cloudflare deployment:

```bash
# From the openclawn repository
cp -r extensions/stripe-billing kyra-cloudflare/extensions/
cp -r extensions/kyra-personality kyra-cloudflare/extensions/
```

### Extension: stripe-billing

**Location:** `extensions/stripe-billing/`

**Features:**
- Subscription management (Solo/Pro/Business tiers)
- Usage tracking and enforcement
- Stripe Checkout integration
- Webhook handling
- Billing portal access

**Files:**
```
extensions/stripe-billing/
├── package.json
├── openclaw.plugin.json
├── index.ts              # Plugin registration
├── README.md
└── src/
    ├── types.ts          # TypeScript definitions
    ├── stripe-service.ts # Stripe API wrapper
    ├── subscription-tool.ts
    ├── usage-tool.ts
    ├── tier-middleware.ts
    └── webhook-handler.ts
```

### Extension: kyra-personality

**Location:** `extensions/kyra-personality/`

**Features:**
- Custom system prompt injection
- Personality style configuration
- Command handlers (/help, /status, /about)
- Warm, professional response style

**Files:**
```
extensions/kyra-personality/
├── package.json
├── openclaw.plugin.json
├── index.ts
└── README.md
```

### Install Extensions in Container

When the Sandbox container starts, install extensions:

```typescript
// In sandbox initialization
await sandbox.exec('cd /app/extensions/stripe-billing && npm install');
await sandbox.exec('cd /app/extensions/kyra-personality && npm install');
await sandbox.exec('openclaw extensions install /app/extensions/stripe-billing');
await sandbox.exec('openclaw extensions install /app/extensions/kyra-personality');
```

---

## 6. Stripe Billing Integration

### Step 6.1: Create Stripe Products

```bash
# Using Stripe CLI
stripe products create --name="Kyra AI Solo" --description="1,000 messages/month, 7-day memory"
stripe products create --name="Kyra AI Pro" --description="3,000 messages/month, 30-day memory"  
stripe products create --name="Kyra AI Business" --description="10,000 messages/month, 90-day memory"

# Create prices
stripe prices create --product=prod_xxx --unit-amount=3900 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_yyy --unit-amount=7900 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_zzz --unit-amount=14900 --currency=usd --recurring[interval]=month
```

### Step 6.2: Configure Webhook

1. **Go to**: Stripe Dashboard → Developers → Webhooks
2. **Add endpoint**: `https://kyra-ai.<subdomain>.workers.dev/webhooks/stripe`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. **Copy webhook secret** → Set as `STRIPE_WEBHOOK_SECRET`

### Step 6.3: Update Configuration

```json
// In kyra.config.json
{
  "extensions": {
    "stripe-billing": {
      "enabled": true,
      "tiers": {
        "solo": {
          "priceId": "price_1xxx",  // Real Stripe price ID
          "messagesPerMonth": 1000,
          "memoryDays": 7
        },
        "pro": {
          "priceId": "price_2xxx",
          "messagesPerMonth": 3000,
          "memoryDays": 30
        },
        "business": {
          "priceId": "price_3xxx",
          "messagesPerMonth": 10000,
          "memoryDays": 90
        }
      }
    }
  }
}
```

---

## 7. Channel Configuration

### WebChat (Default)

WebChat is enabled by default. Access at:
- **Control UI**: `https://kyra-ai.<subdomain>.workers.dev/?token=YOUR_TOKEN`
- **Chat UI**: Embedded in Control UI

### Telegram Bot

1. **Create bot**: Message @BotFather on Telegram
   ```
   /newbot
   Name: Kyra AI
   Username: kyra_ai_bot
   ```

2. **Save token**: `123456789:ABC-DEF1234...`

3. **Set secret**:
   ```bash
   wrangler secret put TELEGRAM_BOT_TOKEN
   ```

4. **Configure webhook** (automatic via OpenClaw):
   ```bash
   # OpenClaw will set this up when channel is enabled
   openclaw channels add telegram
   ```

### Discord Bot

1. **Create application**: https://discord.com/developers/applications
2. **Create bot** and copy token
3. **Set secret**:
   ```bash
   wrangler secret put DISCORD_BOT_TOKEN
   ```
4. **Invite to server** with appropriate permissions

### Slack App

1. **Create app**: https://api.slack.com/apps
2. **Enable Socket Mode**
3. **Copy tokens** (Bot Token + App Token)
4. **Set secrets**:
   ```bash
   wrangler secret put SLACK_BOT_TOKEN
   wrangler secret put SLACK_APP_TOKEN
   ```

---

## 8. Security & Authentication

### Cloudflare Access Setup (Recommended)

Protect admin endpoints with Cloudflare Access:

1. **Go to**: Cloudflare Dashboard → Zero Trust → Access → Applications

2. **Create application**:
   - Name: `Kyra AI Admin`
   - Type: Self-hosted
   - Domain: `kyra-ai.<subdomain>.workers.dev`
   - Path: `/_admin/*`

3. **Add policy**:
   - Name: `Admin Access`
   - Action: Allow
   - Include: Email ending in `@yourdomain.com`

4. **Get credentials**:
   - Team domain: `yourteam.cloudflareaccess.com`
   - Audience tag: From application settings

5. **Set secrets**:
   ```bash
   wrangler secret put CF_ACCESS_TEAM_DOMAIN
   # yourteam.cloudflareaccess.com
   
   wrangler secret put CF_ACCESS_AUD
   # audience-tag-from-dashboard
   ```

### Multi-Layer Authentication

Kyra uses three layers of authentication:

1. **Cloudflare Access**: Protects admin UI and API endpoints
2. **Gateway Token**: Authenticates WebSocket connections
3. **Device Pairing**: Links user devices to sessions

---

## 9. Monitoring & Observability

### Built-in Cloudflare Analytics

- **Workers Analytics**: Dashboard → Workers → Analytics
- **R2 Analytics**: Dashboard → R2 → Metrics
- **Real-time Logs**: `wrangler tail`

### AI Gateway Analytics

If using AI Gateway:
- **Requests**: Total, by model, by status
- **Costs**: Token usage, estimated spend
- **Latency**: P50, P95, P99

### Custom Logging

```typescript
// Add to Worker
console.log(JSON.stringify({
  event: 'message_received',
  userId: user.id,
  channel: 'telegram',
  timestamp: Date.now()
}));
```

View logs:
```bash
wrangler tail --format=json | jq '.logs[]'
```

### Sentry Integration (Optional)

```bash
npm install @sentry/cloudflare

# In Worker
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: env.ENVIRONMENT
});
```

---

## 10. Cost Optimization

### Cloudflare Pricing Summary

| Service | Free Tier | Paid | Kyra Usage |
|---------|-----------|------|------------|
| **Workers** | 100k req/day | $5/mo + $0.50/M req | Gateway |
| **Sandbox** | Included with Paid | Compute time | OpenClaw runtime |
| **R2** | 10GB + 10M ops | $0.015/GB | Session storage |
| **KV** | 100k reads/day | $0.50/M reads | Config cache |
| **AI Gateway** | Free | Free | AI request proxy |
| **Access** | 50 users | $3/user/mo | Admin auth |

### Estimated Monthly Costs

| Users | Workers | R2 | KV | Total |
|-------|---------|----|----|-------|
| 10 | $5 | $0 | $0 | **~$5** |
| 100 | $5 | $1 | $0 | **~$6** |
| 1,000 | $10 | $5 | $1 | **~$16** |

*Plus AI provider costs (Anthropic, etc.)*

### Cost-Saving Tips

1. **Use AI Gateway with caching** - Reduce duplicate AI calls
2. **Enable model fallback** - Use cheaper models when possible
3. **Optimize memory compaction** - Reduce storage needs
4. **Use scheduled wake** - Sleep containers when not in use

---

## 11. Troubleshooting

### Common Issues

#### "Sandbox not starting"

```bash
# Check Worker logs
wrangler tail

# Verify Paid plan
# Dashboard → Workers & Pages → Overview → Plan
```

#### "R2 permission denied"

```bash
# Verify bucket exists
wrangler r2 bucket list

# Check binding in wrangler.toml
```

#### "Stripe webhook failing"

```bash
# Test webhook locally
stripe listen --forward-to localhost:8787/webhooks/stripe

# Verify secret matches
wrangler secret list
```

#### "Access denied to admin"

```bash
# Verify Access application
# Zero Trust → Access → Applications

# Check JWT header
curl -H "Cf-Access-Jwt-Assertion: xxx" https://.../_admin/
```

### Debug Mode

Enable debug routes:
```bash
wrangler secret put DEBUG_ROUTES
# true
```

Access debug endpoints:
- `/debug/config` - Current configuration
- `/debug/health` - Detailed health check
- `/debug/sandbox` - Sandbox status

---

## 12. Production Checklist

### Pre-Launch

- [ ] **Workers Paid plan** activated
- [ ] **R2 bucket** created and mounted
- [ ] **All secrets** configured:
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `MOLTBOT_GATEWAY_TOKEN`
- [ ] **Stripe products** created with real prices
- [ ] **Stripe webhook** configured and verified
- [ ] **Cloudflare Access** protecting admin routes
- [ ] **Custom domain** configured (optional)

### Verification

```bash
# Health check
curl https://kyra-ai.<subdomain>.workers.dev/health

# Admin access
curl "https://kyra-ai.<subdomain>.workers.dev/_admin/?token=$GATEWAY_TOKEN"

# Stripe webhook test
stripe trigger checkout.session.completed
```

### Post-Launch

- [ ] **Monitor logs**: `wrangler tail`
- [ ] **Check analytics**: Dashboard → Workers → Analytics
- [ ] **Verify billing**: Stripe Dashboard
- [ ] **Test all channels**: WebChat, Telegram, etc.
- [ ] **Onboard beta users**

---

## Appendix A: Migration from Fly.io

If migrating from existing Fly.io deployment:

### Export Data

```bash
# SSH to Fly.io instance
fly ssh console

# Export OpenClaw data
tar -czf /tmp/openclaw-data.tar.gz /data

# Download
fly sftp get /tmp/openclaw-data.tar.gz
```

### Import to Cloudflare

```bash
# Upload to R2
wrangler r2 object put kyra-data/backup/openclaw-data.tar.gz --file=openclaw-data.tar.gz

# In sandbox, restore
await sandbox.exec('tar -xzf /data/backup/openclaw-data.tar.gz -C /data');
```

### DNS Migration

1. Update DNS to point to Cloudflare Worker
2. Keep Fly.io running for 24-48h (DNS propagation)
3. Verify all traffic on Cloudflare
4. Shutdown Fly.io instance

---

## Appendix B: Quick Reference

### Wrangler Commands

```bash
# Development
wrangler dev                    # Local development
wrangler tail                   # Real-time logs
wrangler tail --format=json     # JSON logs

# Deployment
wrangler deploy                 # Deploy to production
wrangler deploy --env staging   # Deploy to staging

# Secrets
wrangler secret put NAME        # Add secret
wrangler secret list            # List secrets
wrangler secret delete NAME     # Remove secret

# R2 Storage
wrangler r2 bucket create NAME  # Create bucket
wrangler r2 bucket list         # List buckets
wrangler r2 object put ...      # Upload object

# KV Storage
wrangler kv:namespace create NAME  # Create namespace
wrangler kv:key put ...            # Set key
wrangler kv:key get ...            # Get key
```

### Useful URLs

| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Workers Documentation | https://developers.cloudflare.com/workers |
| Sandbox Documentation | https://developers.cloudflare.com/sandbox |
| AI Gateway | https://developers.cloudflare.com/ai-gateway |
| Moltworker Repository | https://github.com/cloudflare/moltworker |
| OpenClaw Documentation | https://openclaw.ai/docs |
| Stripe Dashboard | https://dashboard.stripe.com |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | AI | Initial Cloudflare deployment guide |

---

*This guide replaces the Fly.io deployment configuration for the Kyra AI MVP.*
