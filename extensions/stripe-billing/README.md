# Stripe Billing Extension for OpenClaw

Subscription management, usage tracking, and tier enforcement for hosted OpenClaw deployments.

## Features

- **Subscription Management**: Stripe-powered subscriptions with Solo, Pro, and Business tiers
- **Usage Tracking**: Per-user message counting and limit enforcement
- **Agent Tools**: Built-in tools for users to check status, upgrade, and manage billing
- **Webhook Handling**: Automatic subscription status updates from Stripe
- **Tier Enforcement**: Middleware that enforces message limits by tier

## Installation

```bash
# From the OpenClaw root directory
openclaw extensions install ./extensions/stripe-billing
```

## Configuration

### Required Environment Variables

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Optional, for client-side
```

### OpenClaw Config

```bash
# Set Stripe keys
openclaw config set extensions.stripe-billing.stripeSecretKey "$STRIPE_SECRET_KEY"
openclaw config set extensions.stripe-billing.stripeWebhookSecret "$STRIPE_WEBHOOK_SECRET"

# Configure tiers
openclaw config set extensions.stripe-billing.tiers.solo.priceId "price_..."
openclaw config set extensions.stripe-billing.tiers.pro.priceId "price_..."
openclaw config set extensions.stripe-billing.tiers.business.priceId "price_..."

# Trial configuration
openclaw config set extensions.stripe-billing.trialDays 7
openclaw config set extensions.stripe-billing.trialTier "pro"
```

## Pricing Tiers

| Tier | Price | Messages/Month | Memory | Channels |
|------|-------|----------------|--------|----------|
| **Trial** | Free (7 days) | 100 | 30 days | 5 |
| **Solo** | $39/month | 1,000 | 7 days | 2 |
| **Pro** | $79/month | 3,000 | 30 days | 5 |
| **Business** | $149/month | 10,000 | 90 days | Unlimited |

## Agent Tools

### subscription

Manage subscriptions from chat:

```
User: Check my subscription
Assistant: [uses subscription tool with action="status"]

User: I want to upgrade to Pro
Assistant: [uses subscription tool with action="upgrade" tier="pro"]

User: Cancel my subscription
Assistant: [uses subscription tool with action="cancel"]
```

### usage

Check usage statistics:

```
User: How many messages have I used?
Assistant: [uses usage tool]

User: Show detailed usage
Assistant: [uses usage tool with detail="detailed"]
```

## Stripe Setup

### 1. Create Products

In Stripe Dashboard, create three products:

1. **AI Assistant Solo** - $39/month
2. **AI Assistant Pro** - $79/month  
3. **AI Assistant Business** - $149/month

### 2. Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the signing secret to `stripeWebhookSecret`

### 3. Customer Portal

Enable the Customer Portal in Stripe Dashboard for self-service subscription management.

## Architecture

```
extensions/stripe-billing/
├── package.json              # Dependencies
├── openclaw.plugin.json      # Plugin configuration schema
├── index.ts                  # Plugin registration
├── README.md                 # Documentation
└── src/
    ├── types.ts              # TypeScript types
    ├── stripe-service.ts     # Stripe API wrapper
    ├── subscription-tool.ts  # Agent tool for subscriptions
    ├── usage-tool.ts         # Agent tool for usage stats
    ├── tier-middleware.ts    # Limit enforcement
    └── webhook-handler.ts    # Stripe webhook processing
```

## Development

```bash
cd extensions/stripe-billing

# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests
npm test
```

## Production Deployment

### Database

For production, replace the in-memory store in `stripe-service.ts` with a database:

```typescript
// Example with PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

const getSubscription = async (userId: string) => {
  const result = await pool.query(
    'SELECT * FROM subscriptions WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};
```

### Scaling Considerations

- Use Redis for usage tracking to handle high throughput
- Implement rate limiting at the gateway level
- Consider message queues for webhook processing

## License

MIT - Part of OpenClaw
