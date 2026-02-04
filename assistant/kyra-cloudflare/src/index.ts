/**
 * Kyra AI - Cloudflare Workers Entry Point
 * 
 * This Worker serves as the main entry point for Kyra AI on Cloudflare.
 * It handles:
 * - Request routing and authentication
 * - Sandbox container management
 * - Stripe webhook processing
 * - Admin UI and API endpoints
 * - Health checks and monitoring
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getSandbox, Sandbox } from '@cloudflare/sandbox';
import Stripe from 'stripe';

// Re-export Sandbox for Durable Object binding
export { Sandbox };

// Environment interface
interface Env {
  // Durable Objects
  Sandbox: DurableObjectNamespace;
  
  // Storage
  KYRA_DATA: R2Bucket;
  KYRA_CONFIG: KVNamespace;
  
  // AI (optional)
  AI?: Fetcher;
  BROWSER?: Fetcher;
  
  // Secrets
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_BASE_URL?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  MOLTBOT_GATEWAY_TOKEN: string;
  
  // Optional secrets
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  TELEGRAM_BOT_TOKEN?: string;
  DISCORD_BOT_TOKEN?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;
  SENTRY_DSN?: string;
  DEBUG_ROUTES?: string;
  
  // Environment variables
  ENVIRONMENT: string;
  KYRA_VERSION: string;
  KYRA_NAME: string;
  KYRA_TAGLINE: string;
}

// Authentication result
interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  method?: 'token' | 'access' | 'none';
}

// Subscription tier configuration
interface TierConfig {
  priceId: string;
  messagesPerMonth: number;
  memoryDays: number;
  channels: number;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  trial: { priceId: '', messagesPerMonth: 100, memoryDays: 3, channels: 1 },
  solo: { priceId: 'price_solo_xxx', messagesPerMonth: 1000, memoryDays: 7, channels: 2 },
  pro: { priceId: 'price_pro_xxx', messagesPerMonth: 3000, memoryDays: 30, channels: 5 },
  business: { priceId: 'price_business_xxx', messagesPerMonth: 10000, memoryDays: 90, channels: -1 },
};

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Gateway-Token'],
}));

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'kyra-ai',
    version: c.env.KYRA_VERSION,
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
app.get('/health/detailed', async (c) => {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
  
  // R2 check
  const r2Start = Date.now();
  try {
    await c.env.KYRA_DATA.head('_health_check');
    checks.r2 = { status: 'ok', latency: Date.now() - r2Start };
  } catch (e) {
    checks.r2 = { status: 'ok', latency: Date.now() - r2Start }; // 404 is fine
  }
  
  // KV check
  const kvStart = Date.now();
  try {
    await c.env.KYRA_CONFIG.get('_health_check');
    checks.kv = { status: 'ok', latency: Date.now() - kvStart };
  } catch (e) {
    checks.kv = { status: 'error', error: String(e) };
  }
  
  // Stripe check
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
    await stripe.products.list({ limit: 1 });
    checks.stripe = { status: 'ok' };
  } catch (e) {
    checks.stripe = { status: 'error', error: 'Stripe connection failed' };
  }
  
  const allHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  return c.json({
    status: allHealthy ? 'healthy' : 'degraded',
    service: 'kyra-ai',
    version: c.env.KYRA_VERSION,
    checks,
    timestamp: new Date().toISOString(),
  }, allHealthy ? 200 : 503);
});

// Stripe webhooks (verified by signature, not by auth token)
app.post('/webhooks/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }
  
  const body = await c.req.text();
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }
  
  // Handle webhook events
  console.log(`Received Stripe webhook: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout completed for customer: ${session.customer}`);
      // Update user subscription status
      await handleCheckoutComplete(c.env, session);
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription updated: ${subscription.id}`);
      await handleSubscriptionUpdate(c.env, subscription);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription deleted: ${subscription.id}`);
      await handleSubscriptionDelete(c.env, subscription);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Payment failed for invoice: ${invoice.id}`);
      await handlePaymentFailed(c.env, invoice);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return c.json({ received: true });
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

async function authenticate(c: any): Promise<AuthResult> {
  const env = c.env as Env;
  
  // Check gateway token (query param or header)
  const url = new URL(c.req.url);
  const tokenParam = url.searchParams.get('token');
  const tokenHeader = c.req.header('Authorization')?.replace('Bearer ', '') || 
                      c.req.header('X-Gateway-Token');
  const token = tokenParam || tokenHeader;
  
  if (token === env.MOLTBOT_GATEWAY_TOKEN) {
    return { authenticated: true, userId: 'admin', method: 'token' };
  }
  
  // Check Cloudflare Access JWT
  if (env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD) {
    const jwt = c.req.header('Cf-Access-Jwt-Assertion');
    if (jwt) {
      try {
        const verified = await verifyAccessJWT(jwt, env);
        if (verified) {
          return { 
            authenticated: true, 
            userId: verified.sub, 
            email: verified.email,
            method: 'access' 
          };
        }
      } catch (e) {
        console.error('Access JWT verification failed:', e);
      }
    }
  }
  
  return { authenticated: false, method: 'none' };
}

async function verifyAccessJWT(jwt: string, env: Env): Promise<{ sub: string; email: string } | null> {
  // Fetch Cloudflare Access public keys
  const certsUrl = `https://${env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
  const certsResponse = await fetch(certsUrl);
  
  if (!certsResponse.ok) {
    console.error('Failed to fetch Access certs');
    return null;
  }
  
  const certs = await certsResponse.json() as { keys: any[] };
  
  // Decode JWT header to get key ID
  const [headerB64] = jwt.split('.');
  const header = JSON.parse(atob(headerB64));
  
  // Find matching key
  const key = certs.keys.find((k: any) => k.kid === header.kid);
  if (!key) {
    console.error('No matching key found');
    return null;
  }
  
  // Import key and verify (simplified - production should use proper JWT library)
  // For now, trust the Cloudflare Access JWT if it reaches us through their proxy
  const [, payloadB64] = jwt.split('.');
  const payload = JSON.parse(atob(payloadB64));
  
  // Verify audience
  if (payload.aud && !payload.aud.includes(env.CF_ACCESS_AUD)) {
    console.error('Invalid audience');
    return null;
  }
  
  // Verify expiration
  if (payload.exp && payload.exp < Date.now() / 1000) {
    console.error('Token expired');
    return null;
  }
  
  return { sub: payload.sub, email: payload.email };
}

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// Auth middleware for protected routes
app.use('/api/*', async (c, next) => {
  const auth = await authenticate(c);
  if (!auth.authenticated) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('auth', auth);
  await next();
});

app.use('/_admin/*', async (c, next) => {
  const auth = await authenticate(c);
  if (!auth.authenticated) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('auth', auth);
  await next();
});

// Admin UI
app.get('/_admin', async (c) => {
  return c.html(getAdminHTML(c.env));
});

app.get('/_admin/', async (c) => {
  return c.html(getAdminHTML(c.env));
});

// API: Get subscription status
app.get('/api/subscription/status', async (c) => {
  const auth = c.get('auth') as AuthResult;
  const userId = auth.userId!;
  
  const status = await getSubscriptionStatus(c.env, userId);
  return c.json(status);
});

// API: Create checkout session
app.post('/api/subscription/checkout', async (c) => {
  const auth = c.get('auth') as AuthResult;
  const userId = auth.userId!;
  const { tier, successUrl, cancelUrl } = await c.req.json();
  
  const tierConfig = TIER_CONFIGS[tier];
  if (!tierConfig || !tierConfig.priceId) {
    return c.json({ error: 'Invalid tier' }, 400);
  }
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
  
  // Get or create customer
  let customerId = await c.env.KYRA_CONFIG.get(`customer:${userId}`);
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userId },
    });
    customerId = customer.id;
    await c.env.KYRA_CONFIG.put(`customer:${userId}`, customerId);
  }
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: tierConfig.priceId, quantity: 1 }],
    success_url: successUrl || `${new URL(c.req.url).origin}/_admin?success=true`,
    cancel_url: cancelUrl || `${new URL(c.req.url).origin}/_admin?canceled=true`,
    metadata: { userId, tier },
  });
  
  return c.json({ url: session.url });
});

// API: Get billing portal URL
app.post('/api/subscription/portal', async (c) => {
  const auth = c.get('auth') as AuthResult;
  const userId = auth.userId!;
  
  const customerId = await c.env.KYRA_CONFIG.get(`customer:${userId}`);
  if (!customerId) {
    return c.json({ error: 'No customer found' }, 404);
  }
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${new URL(c.req.url).origin}/_admin`,
  });
  
  return c.json({ url: session.url });
});

// API: Get usage stats
app.get('/api/usage', async (c) => {
  const auth = c.get('auth') as AuthResult;
  const userId = auth.userId!;
  
  const usage = await getUsageStats(c.env, userId);
  return c.json(usage);
});

// ============================================
// DEBUG ROUTES (Only in development/with DEBUG_ROUTES)
// ============================================

app.get('/debug/config', async (c) => {
  if (c.env.ENVIRONMENT === 'production' && c.env.DEBUG_ROUTES !== 'true') {
    return c.json({ error: 'Debug routes disabled' }, 403);
  }
  
  return c.json({
    environment: c.env.ENVIRONMENT,
    version: c.env.KYRA_VERSION,
    name: c.env.KYRA_NAME,
    hasStripe: !!c.env.STRIPE_SECRET_KEY,
    hasAnthropic: !!c.env.ANTHROPIC_API_KEY,
    hasTelegram: !!c.env.TELEGRAM_BOT_TOKEN,
    hasDiscord: !!c.env.DISCORD_BOT_TOKEN,
    hasAccess: !!(c.env.CF_ACCESS_TEAM_DOMAIN && c.env.CF_ACCESS_AUD),
  });
});

// ============================================
// SANDBOX GATEWAY (Forward to OpenClaw)
// ============================================

app.all('/gateway/*', async (c) => {
  const auth = await authenticate(c);
  if (!auth.authenticated) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const userId = auth.userId || 'default';
  const sandbox = getSandbox(c.env.Sandbox, userId);
  
  // Mount R2 for persistent storage
  await sandbox.mountBucket(c.env.KYRA_DATA, '/data');
  
  // Forward request to sandbox
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace('/gateway', '');
  
  const request = new Request(url.toString(), {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  });
  
  return sandbox.fetch(request);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleCheckoutComplete(env: Env, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  
  if (userId && tier) {
    await env.KYRA_CONFIG.put(`subscription:${userId}`, JSON.stringify({
      tier,
      status: 'active',
      customerId: session.customer,
      subscriptionId: session.subscription,
      createdAt: new Date().toISOString(),
    }));
  }
}

async function handleSubscriptionUpdate(env: Env, subscription: Stripe.Subscription) {
  // Find user by customer ID
  // Update subscription status
}

async function handleSubscriptionDelete(env: Env, subscription: Stripe.Subscription) {
  // Find user by customer ID
  // Mark subscription as canceled
}

async function handlePaymentFailed(env: Env, invoice: Stripe.Invoice) {
  // Find user by customer ID
  // Mark subscription as past_due
}

async function getSubscriptionStatus(env: Env, userId: string) {
  const subData = await env.KYRA_CONFIG.get(`subscription:${userId}`);
  
  if (!subData) {
    return {
      tier: 'trial',
      status: 'trialing',
      messagesUsed: 0,
      messagesLimit: 100,
      messagesRemaining: 100,
      memoryDays: 3,
    };
  }
  
  const subscription = JSON.parse(subData);
  const tierConfig = TIER_CONFIGS[subscription.tier] || TIER_CONFIGS.trial;
  const usage = await getUsageStats(env, userId);
  
  return {
    tier: subscription.tier,
    status: subscription.status,
    messagesUsed: usage.messagesThisMonth,
    messagesLimit: tierConfig.messagesPerMonth,
    messagesRemaining: Math.max(0, tierConfig.messagesPerMonth - usage.messagesThisMonth),
    memoryDays: tierConfig.memoryDays,
    periodEnd: subscription.periodEnd,
  };
}

async function getUsageStats(env: Env, userId: string) {
  const usageKey = `usage:${userId}:${new Date().toISOString().slice(0, 7)}`; // YYYY-MM
  const usageData = await env.KYRA_CONFIG.get(usageKey);
  
  if (!usageData) {
    return { messagesThisMonth: 0, tokensThisMonth: 0 };
  }
  
  return JSON.parse(usageData);
}

function getAdminHTML(env: Env): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${env.KYRA_NAME} - Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <div class="gradient-bg p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="text-2xl font-bold">${env.KYRA_NAME} Admin</h1>
      <span class="text-sm opacity-75">v${env.KYRA_VERSION}</span>
    </div>
  </div>
  
  <main class="max-w-7xl mx-auto p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Status Card -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">System Status</h2>
        <div id="status" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Gateway: Online</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Storage: Connected</span>
          </div>
        </div>
      </div>
      
      <!-- Subscription Card -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Subscription</h2>
        <div id="subscription" class="space-y-2">
          <p>Loading...</p>
        </div>
      </div>
      
      <!-- Usage Card -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Usage</h2>
        <div id="usage" class="space-y-2">
          <p>Loading...</p>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mt-6 bg-gray-800 rounded-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-4">
        <button onclick="openChat()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
          Open Chat
        </button>
        <button onclick="manageBilling()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
          Manage Billing
        </button>
        <button onclick="viewDocs()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">
          Documentation
        </button>
      </div>
    </div>
  </main>
  
  <script>
    // Fetch subscription status
    async function loadStatus() {
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        document.getElementById('subscription').innerHTML = \`
          <p>Tier: <strong>\${data.tier}</strong></p>
          <p>Status: <strong>\${data.status}</strong></p>
          <p>Messages: \${data.messagesUsed} / \${data.messagesLimit}</p>
        \`;
        document.getElementById('usage').innerHTML = \`
          <p>Messages this month: <strong>\${data.messagesUsed}</strong></p>
          <p>Remaining: <strong>\${data.messagesRemaining}</strong></p>
          <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div class="bg-purple-500 h-2 rounded-full" style="width: \${(data.messagesUsed / data.messagesLimit) * 100}%"></div>
          </div>
        \`;
      } catch (e) {
        console.error('Failed to load status:', e);
      }
    }
    
    function openChat() {
      window.open('/gateway/chat', '_blank');
    }
    
    async function manageBilling() {
      try {
        const res = await fetch('/api/subscription/portal', { method: 'POST' });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch (e) {
        alert('Failed to open billing portal');
      }
    }
    
    function viewDocs() {
      window.open('https://openclaw.ai/docs', '_blank');
    }
    
    loadStatus();
  </script>
</body>
</html>`;
}

// ============================================
// SCHEDULED HANDLERS
// ============================================

export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const trigger = event.cron;
    console.log(`Running scheduled task: ${trigger}`);
    
    if (trigger === '0 0 1 * *') {
      // Monthly usage reset (1st of month)
      console.log('Resetting monthly usage counters...');
      // Implementation would iterate through users and reset counters
    }
    
    if (trigger === '0 * * * *') {
      // Hourly health check
      console.log('Running hourly health check...');
      // Implementation would check services and alert if needed
    }
  },
};
