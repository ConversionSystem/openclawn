# Building the MVP: A Clean, Streamlined Architecture

## The Core Insight

The MVP isn't about building everything—it's about building the **thinnest possible slice** that proves the value proposition:

> **"AI assistance that works instantly, everywhere you already communicate."**

---

## MVP Scope: The 80/20 Rule

### What We Build (20% of features, 80% of value)

```
┌─────────────────────────────────────────────────────────────────┐
│                         MVP SCOPE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ IN SCOPE                        ❌ OUT OF SCOPE              │
│  ───────────                        ────────────────             │
│  • Web chat interface               • Mobile apps (V2)           │
│  • Social login (Google)            • Voice input/output         │
│  • Core AI conversation             • Browser automation         │
│  • Telegram channel                 • Calendar integration       │
│  • Utility-style subscription       • File handling              │
│  • Basic memory/context             • Custom skills              │
│  • Usage dashboard                  • Team features              │
│  • Human-friendly errors            • API access                 │
│                                                                  │
│  WHY THIS SCOPE:                                                │
│  • Web = zero friction entry point                              │
│  • Google login = 70%+ of users covered                         │
│  • Telegram = stable API, easy connection, large user base      │
│  • Premium pricing = sustainable unit economics from day one    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Business Model: The Utility Approach

### Philosophy: Essential Infrastructure, Not Software

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE UTILITY MODEL                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TRADITIONAL SOFTWARE             vs.        UTILITY MODEL                  │
│  ────────────────────                        ─────────────                  │
│  "Nice to have"                              "Essential infrastructure"     │
│  Price sensitivity high                      Price anchored to value        │
│  Easy to cancel                              Painful to disconnect          │
│  Features compete on price                   Service competes on reliability│
│  Race to bottom                              Premium positioning            │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  UTILITY PRICING ANCHORS (What people already pay monthly)                  │
│  ─────────────────────────────────────────────────────────                  │
│                                                                              │
│  Electric bill           $100-200/month                                     │
│  Internet                $60-100/month                                      │
│  Phone plan              $50-100/month                                      │
│  Streaming (combined)    $50-80/month                                       │
│  Cloud storage           $10-20/month                                       │
│  ───────────────────────────────────────                                    │
│  Total "digital utilities"   $170-400/month                                 │
│                                                                              │
│  OUR POSITION: "Your AI utility" — as essential as internet                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pricing Tiers: Premium from Day One

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRICING STRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐       │
│  │     ESSENTIAL     │  │    PROFESSIONAL   │  │     UNLIMITED     │       │
│  │                   │  │                   │  │                   │       │
│  │    $39/month      │  │    $79/month      │  │    $149/month     │       │
│  │    ($32/mo annual)│  │    ($66/mo annual)│  │    ($124/mo annual│       │
│  │                   │  │                   │  │                   │       │
│  │  ─────────────    │  │  ─────────────    │  │  ─────────────    │       │
│  │                   │  │                   │  │                   │       │
│  │  • Unlimited chat │  │  Everything in    │  │  Everything in    │       │
│  │  • Web + 1 channel│  │  Essential, plus: │  │  Professional,    │       │
│  │  • 7-day memory   │  │                   │  │  plus:            │       │
│  │  • Basic AI       │  │  • All channels   │  │                   │       │
│  │    (Sonnet)       │  │  • 30-day memory  │  │  • Priority       │       │
│  │                   │  │  • Web browsing   │  │    processing     │       │
│  │                   │  │  • File analysis  │  │  • 90-day memory  │       │
│  │                   │  │  • Priority       │  │  • Advanced AI    │       │
│  │                   │  │    support        │  │    (Opus when     │       │
│  │                   │  │                   │  │    beneficial)    │       │
│  │                   │  │                   │  │  • Dedicated      │       │
│  │                   │  │                   │  │    support        │       │
│  │                   │  │                   │  │  • Early features │       │
│  │                   │  │                   │  │                   │       │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘       │
│                                                                              │
│  WHY THESE PRICES:                                                          │
│  ─────────────────                                                          │
│  • $39 = Less than daily coffee habit ($1.30/day)                          │
│  • $79 = Less than phone plan, more valuable                               │
│  • $149 = Business expense, easily justified ROI                           │
│  • All prices = 70%+ gross margin target                                   │
│                                                                              │
│  NO FREE TIER                                                               │
│  ────────────                                                               │
│  • Free users don't convert at rates that justify CAC                      │
│  • 7-day free trial instead (full Professional features)                   │
│  • Credit card required upfront (filters tire-kickers)                     │
│  • If you need free, this isn't for you (yet)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Updated Cost Structure: Utility-Grade AI Assistance

### Positioning

- **Target:** Professional AI assistance billed like a utility — reliable, indispensable, predictably priced
- **Starting price:** $39/month (Solo tier)
- **Margin target:** ≥ 70% gross margin to attract investors

### Tier Structure

| Tier | Price | Target | Message Limit | Features |
|------|-------|--------|---------------|----------|
| **Solo** | $39/mo | Individuals | 1,000 msgs/mo | Web + 1 channel, basic memory |
| **Pro** | $79/mo | Power users | 3,000 msgs/mo | + 3 channels, longer memory, priority |
| **Business** | $149/mo | Teams (up to 5) | 10,000 msgs/mo | + All channels, shared context, admin |

---

## Unit Economics (per 1,000 users at Solo tier)

| Category | Monthly Cost | Notes |
|----------|-------------|-------|
| **Infrastructure** | | |
| Compute (Fly.io) | $100 | App servers, workers |
| Database (Neon) | $50 | PostgreSQL, per-user data |
| Cache (Upstash) | $20 | Redis for sessions |
| CDN (Cloudflare) | $20 | Static assets, security |
| **Subtotal Infra** | **$190** | |
| **AI (optimized)** | | |
| Avg 500 msgs/user/mo | | |
| With caching (30% hit) | | |
| With Haiku for simple (40%) | | |
| Effective AI cost | $4,500 | Down from $10,000 unoptimized |
| **Services** | | |
| Stripe (2.9% + $0.30) | $1,431 | On $39,000 revenue |
| Monitoring (Sentry, Axiom) | $55 | Error + logs |
| **Subtotal Services** | **$1,486** | |
| **Total Cost** | **$6,176** | |
| **Revenue** | **$39,000** | 1,000 × $39 |
| **Gross Profit** | **$32,824** | |
| **Gross Margin** | **84.2%** | ✅ Exceeds 70% target |

---

## Margin Levers

| Optimization | Savings | Implementation |
|--------------|---------|----------------|
| Response caching | 20-30% AI cost | Redis cache for common queries |
| Model tiering | 30-40% AI cost | Haiku for simple, Sonnet for complex |
| Context pruning | 15-25% AI cost | Summarize old context |
| Batch operations | 10-15% infra | Queue non-urgent work |

---

## Pricing Psychology (Utility Model)

| Utility | Monthly | Perception |
|---------|---------|------------|
| Internet | $50-100 | Essential |
| Electricity | $100-200 | Can't live without |
| Phone | $40-80 | Always-on connectivity |
| **AI Assistant** | **$39-149** | Productivity multiplier |

### Key Messaging

- "Less than $2/day for a personal AI assistant"
- "The cost of one business lunch per month"
- "Your AI handles the work of a part-time assistant"

---

## Investor Appeal

- **84% gross margin** (SaaS benchmark: 70-80%)
- **Recurring revenue** (monthly utility model)
- **Clear path to profitability** at ~200 users
- **Expansion revenue** via tier upgrades
- **Low CAC** via word-of-mouth (utility = recommendations)

---

## Break-Even Analysis

| Metric | Value |
|--------|-------|
| Fixed costs (infra baseline) | ~$500/mo |
| Variable cost per user | ~$5.69/mo |
| Revenue per user | $39/mo |
| Contribution margin | $33.31/user |
| Break-even | ~15 paying users |
| Profitable at scale | 200+ users = $6,600+/mo profit |

---

## Cost Optimization Strategies (Protect Margins)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MARGIN PROTECTION STRATEGIES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. INTELLIGENT MODEL ROUTING                                               │
│  ════════════════════════════                                               │
│                                                                              │
│  Not all queries need the best model:                                       │
│                                                                              │
│  │ Query Type          │ Model           │ Cost/1M tokens │ Usage %  │      │
│  ├─────────────────────┼─────────────────┼────────────────┼──────────┤      │
│  │ Simple Q&A          │ Claude Haiku    │ $0.25/$1.25    │ 30%      │      │
│  │ General assistance  │ Claude Sonnet   │ $3/$15         │ 60%      │      │
│  │ Complex reasoning   │ Claude Opus     │ $15/$75        │ 10%      │      │
│  └─────────────────────┴─────────────────┴────────────────┴──────────┘      │
│                                                                              │
│  Impact: 35-45% reduction in AI costs                                       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  2. AGGRESSIVE CACHING                                                      │
│  ═════════════════════                                                      │
│                                                                              │
│  • Semantic cache for similar queries                                       │
│  • Cache common responses (greetings, FAQs)                                 │
│  • User-specific response patterns                                          │
│                                                                              │
│  Impact: 15-25% reduction in AI calls                                       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  3. CONTEXT WINDOW OPTIMIZATION                                             │
│  ══════════════════════════════                                             │
│                                                                              │
│  • Summarize conversations beyond N messages                                │
│  • Compress context with key facts only                                     │
│  • Lazy-load context (only when needed)                                     │
│                                                                              │
│  Impact: 20-40% reduction in tokens per request                             │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  4. PROMPT ENGINEERING                                                      │
│  ═════════════════════                                                      │
│                                                                              │
│  • Concise system prompts                                                   │
│  • Efficient response formatting                                            │
│  • Avoid redundant instructions                                             │
│                                                                              │
│  Impact: 10-20% reduction in tokens                                         │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  COMBINED IMPACT ON UNIT ECONOMICS:                                         │
│  ══════════════════════════════════                                         │
│                                                                              │
│  Original AI cost (Essential):    $7.20/user/month                          │
│  Optimized AI cost:               $4.00/user/month  (-44%)                  │
│                                                                              │
│  New Essential margin:            78.5% (up from 74.2%)                     │
│  New Blended margin:              75.8% (up from 70.1%)                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Investor-Ready Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEY METRICS DASHBOARD                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  UNIT ECONOMICS                                                             │
│  ══════════════                                                             │
│                                                                              │
│  │ Metric                    │ Target    │ Comparable SaaS │               │
│  ├───────────────────────────┼───────────┼─────────────────┤               │
│  │ Gross Margin              │ 70-75%    │ 65-80%          │               │
│  │ Blended ARPU              │ $69.50    │ $30-150         │               │
│  │ CAC Payback               │ <3 months │ 6-18 months     │               │
│  │ LTV:CAC Ratio             │ >5:1      │ 3:1 minimum     │               │
│  │ Net Revenue Retention     │ >100%     │ 90-120%         │               │
│  │ Monthly Churn             │ <3%       │ 3-7%            │               │
│  └───────────────────────────┴───────────┴─────────────────┘               │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  GROWTH PROJECTIONS                                                         │
│  ══════════════════                                                         │
│                                                                              │
│  │ Milestone    │ Users  │ MRR      │ ARR       │ Gross Profit │           │
│  ├──────────────┼────────┼──────────┼───────────┼──────────────┤           │
│  │ Month 6      │ 200    │ $13,900  │ $166,800  │ $116,760     │           │
│  │ Month 12     │ 1,000  │ $69,500  │ $834,000  │ $584,220     │           │
│  │ Month 18     │ 3,000  │ $208,500 │ $2.5M     │ $1.75M       │           │
│  │ Month 24     │ 7,500  │ $521,250 │ $6.3M     │ $4.4M        │           │
│  │ Month 36     │ 25,000 │ $1.74M   │ $20.9M    │ $14.6M       │           │
│  └──────────────┴────────┴──────────┴───────────┴──────────────┘           │
│                                                                              │
│  Assumptions:                                                               │
│  • 15% MoM growth months 1-12                                               │
│  • 10% MoM growth months 13-24                                              │
│  • 7% MoM growth months 25-36                                               │
│  • 3% monthly churn                                                         │
│  • 70% blended gross margin                                                 │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  WHY INVESTORS SHOULD CARE                                                  │
│  ═════════════════════════                                                  │
│                                                                              │
│  ✓ 70%+ gross margins = capital-efficient scaling                          │
│  ✓ Utility model = predictable, recurring revenue                          │
│  ✓ Low churn = high LTV                                                    │
│  ✓ Premium pricing = attracts serious users, not tire-kickers              │
│  ✓ Multi-channel = switching cost moat                                     │
│  ✓ AI costs decreasing = margins improve over time                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## System Architecture: Three Clean Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                              LAYER 1: INTERFACE                              │
│                                                                              │
│    ┌────────────────────────────────────────────────────────────────────┐   │
│    │                                                                     │   │
│    │   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐  │   │
│    │   │   WEB APP   │         │  TELEGRAM   │         │   FUTURE    │  │   │
│    │   │             │         │   BRIDGE    │         │  CHANNELS   │  │   │
│    │   │  • Chat UI  │         │             │         │             │  │   │
│    │   │  • Auth     │         │  • Webhook  │         │  • Slack    │  │   │
│    │   │  • Settings │         │  • Polling  │         │  • Discord  │  │   │
│    │   │  • Billing  │         │             │         │  • WhatsApp │  │   │
│    │   │             │         │             │         │             │  │   │
│    │   └──────┬──────┘         └──────┬──────┘         └─────────────┘  │   │
│    │          │                       │                                  │   │
│    └──────────┼───────────────────────┼──────────────────────────────────┘   │
│               │                       │                                      │
│               └───────────┬───────────┘                                      │
│                           │                                                  │
│                           ▼                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              LAYER 2: CORE                                   │
│                                                                              │
│    ┌────────────────────────────────────────────────────────────────────┐   │
│    │                         API GATEWAY                                 │   │
│    │                    (Single Entry Point)                             │   │
│    │                                                                     │   │
│    │    /auth    /chat    /channels    /user    /billing    /health     │   │
│    └────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│               ┌────────────────────┼────────────────────┐                   │
│               │                    │                    │                   │
│               ▼                    ▼                    ▼                   │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │   AUTH SERVICE  │  │  CHAT SERVICE   │  │ CHANNEL SERVICE │           │
│    │                 │  │                 │  │                 │           │
│    │ • Google OAuth  │  │ • Message proc  │  │ • Telegram bot  │           │
│    │ • Session mgmt  │  │ • AI routing    │  │ • Webhook mgmt  │           │
│    │ • User prefs    │  │ • Context mgmt  │  │ • Message relay │           │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                    │                                         │
│                                    ▼                                         │
│    ┌────────────────────────────────────────────────────────────────────┐   │
│    │                       AI ORCHESTRATOR                               │   │
│    │                                                                     │   │
│    │  • Intelligent model routing (Haiku/Sonnet/Opus)                   │   │
│    │  • Context window management                                        │   │
│    │  • Response streaming                                               │   │
│    │  • Semantic caching                                                 │   │
│    │  • Usage tracking + tier enforcement                                │   │
│    └────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           LAYER 3: DATA                                      │
│                                                                              │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │    POSTGRES     │  │     REDIS       │  │   BLOB STORE    │           │
│    │                 │  │                 │  │                 │           │
│    │ • Users         │  │ • Sessions      │  │ • Attachments   │           │
│    │ • Conversations │  │ • Rate limits   │  │ • Exports       │           │
│    │ • Billing       │  │ • Semantic cache│  │                 │           │
│    │ • Channels      │  │ • Model routing │  │                 │           │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure: Monorepo with Clear Boundaries

```
assistant/
│
├── apps/
│   │
│   ├── web/                          # React SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── ChatWindow.tsx
│   │   │   │   │   ├── MessageBubble.tsx
│   │   │   │   │   ├── InputBar.tsx
│   │   │   │   │   └── TypingIndicator.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginButton.tsx
│   │   │   │   │   └── AuthGuard.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   │   ├── ChannelConnect.tsx
│   │   │   │   │   └── UsageDisplay.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Card.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── Toast.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useChannels.ts
│   │   │   ├── stores/
│   │   │   │   ├── chatStore.ts
│   │   │   │   └── userStore.ts
│   │   │   ├── pages/
│   │   │   │   ├── index.tsx           # Chat (main)
│   │   │   │   ├── login.tsx
│   │   │   │   ├── settings.tsx
│   │   │   │   └── onboarding.tsx
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                           # Backend API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── chat.ts
│       │   │   ├── channels.ts
│       │   │   ├── user.ts
│       │   │   └── health.ts
│       │   ├── services/
│       │   │   ├── ai/
│       │   │   │   ├── orchestrator.ts
│       │   │   │   ├── router.ts        # Model selection logic
│       │   │   │   ├── cache.ts         # Semantic caching
│       │   │   │   ├── context.ts
│       │   │   │   └── providers/
│       │   │   │       └── anthropic.ts
│       │   │   ├── auth/
│       │   │   │   ├── google.ts
│       │   │   │   └── session.ts
│       │   │   ├── channels/
│       │   │   │   ├── telegram.ts
│       │   │   │   └── base.ts
│       │   │   └── billing/
│       │   │       ├── stripe.ts
│       │   │       └── tiers.ts         # Tier enforcement
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── rateLimit.ts
│       │   │   ├── tierCheck.ts         # Feature gating
│       │   │   └── errors.ts
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   ├── migrations/
│       │   │   └── queries/
│       │   │       ├── users.ts
│       │   │       ├── conversations.ts
│       │   │       └── messages.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   │
│   ├── shared/                        # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── user.ts
│   │   │   │   ├── message.ts
│   │   │   │   ├── channel.ts
│   │   │   │   ├── billing.ts
│   │   │   │   └── api.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── ui/                            # Shared UI components (future)
│       └── package.json
│
├── infra/                             # Infrastructure as code
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── fly.toml                       # Fly.io deployment
│
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   └── deploy.sh
│
├── package.json                       # Workspace root
├── pnpm-workspace.yaml
├── turbo.json                         # Turborepo config
└── README.md
```

---

## Data Model: Simple and Extensible

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                              USERS                                   │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  id              UUID PRIMARY KEY                                    │    │
│  │  email           VARCHAR(255) UNIQUE NOT NULL                        │    │
│  │  name            VARCHAR(100)                                        │    │
│  │  google_id       VARCHAR(255) UNIQUE                                 │    │
│  │  preferences     JSONB DEFAULT '{}'                                  │    │
│  │  tier            VARCHAR(20) DEFAULT 'trial'                         │    │
│  │  created_at      TIMESTAMP DEFAULT NOW()                             │    │
│  │  updated_at      TIMESTAMP DEFAULT NOW()                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    │ 1:N                                     │
│                    ┌───────────────┼───────────────┐                        │
│                    │               │               │                        │
│                    ▼               ▼               ▼                        │
│  ┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────────┐       │
│  │   CONVERSATIONS     │ │    CHANNELS     │ │    SUBSCRIPTIONS    │       │
│  ├─────────────────────┤ ├─────────────────┤ ├─────────────────────┤       │
│  │ id          UUID PK │ │ id       UUID PK│ │ id          UUID PK │       │
│  │ user_id     UUID FK │ │ user_id  UUID FK│ │ user_id     UUID FK │       │
│  │ title       VARCHAR │ │ type     VARCHAR│ │ stripe_id   VARCHAR │       │
│  │ summary     TEXT    │ │ config   JSONB  │ │ tier        VARCHAR │       │
│  │ context     JSONB   │ │ active   BOOLEAN│ │ status      VARCHAR │       │
│  │ created_at  TS      │ │ created_at TS   │ │ current_period_end  │       │
│  │ updated_at  TS      │ └─────────────────┘ │ created_at  TS      │       │
│  └──────────┬──────────┘                     └─────────────────────┘       │
│             │                                                               │
│             │ 1:N                                                           │
│             ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            MESSAGES                                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  id                UUID PRIMARY KEY                                  │   │
│  │  conversation_id   UUID FOREIGN KEY                                  │   │
│  │  role              VARCHAR(20)  -- 'user' | 'assistant'             │   │
│  │  content           TEXT NOT NULL                                     │   │
│  │  channel           VARCHAR(50)  -- 'web' | 'telegram' | etc.        │   │
│  │  model_used        VARCHAR(50)  -- 'haiku' | 'sonnet' | 'opus'      │   │
│  │  tokens_in         INTEGER                                           │   │
│  │  tokens_out        INTEGER                                           │   │
│  │  cost_cents        INTEGER      -- Track actual cost                 │   │
│  │  cached            BOOLEAN DEFAULT FALSE                             │   │
│  │  created_at        TIMESTAMP DEFAULT NOW()                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                             USAGE                                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  id                UUID PRIMARY KEY                                  │   │
│  │  user_id           UUID FOREIGN KEY                                  │   │
│  │  period_start      DATE                                              │   │
│  │  period_end        DATE                                              │   │
│  │  messages_count    INTEGER DEFAULT 0                                 │   │
│  │  tokens_used       INTEGER DEFAULT 0                                 │   │
│  │  cost_cents        INTEGER DEFAULT 0                                 │   │
│  │  tier              VARCHAR(20)                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Design: RESTful and Predictable

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AUTHENTICATION                                                             │
│  ──────────────                                                             │
│  POST   /auth/google           # Initiate Google OAuth                      │
│  GET    /auth/google/callback  # OAuth callback                             │
│  POST   /auth/logout           # End session                                │
│  GET    /auth/me               # Current user + tier                        │
│                                                                              │
│  CHAT                                                                       │
│  ────                                                                       │
│  GET    /conversations              # List conversations                    │
│  POST   /conversations              # Create conversation                   │
│  GET    /conversations/:id          # Get conversation with messages        │
│  DELETE /conversations/:id          # Delete conversation                   │
│  POST   /conversations/:id/messages # Send message (returns stream)         │
│                                                                              │
│  CHANNELS                                                                   │
│  ────────                                                                   │
│  GET    /channels                   # List connected channels               │
│  POST   /channels/telegram          # Connect Telegram                      │
│  DELETE /channels/:id               # Disconnect channel                    │
│  GET    /channels/telegram/status   # Connection status                     │
│                                                                              │
│  USER                                                                       │
│  ────                                                                       │
│  GET    /user/preferences           # Get preferences                       │
│  PATCH  /user/preferences           # Update preferences                    │
│  GET    /user/usage                 # Current period usage + costs          │
│  GET    /user/tier                  # Current tier + features               │
│  DELETE /user/data                  # Delete all user data                  │
│                                                                              │
│  BILLING                                                                    │
│  ───────                                                                    │
│  GET    /billing/subscription       # Current subscription                  │
│  GET    /billing/tiers              # Available tiers + pricing             │
│  POST   /billing/checkout           # Create Stripe checkout                │
│  POST   /billing/portal             # Stripe customer portal                │
│  POST   /billing/webhook            # Stripe webhook handler                │
│                                                                              │
│  HEALTH                                                                     │
│  ──────                                                                     │
│  GET    /health                     # Service health                        │
│  GET    /health/ready               # Readiness check                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack: Boring but Bulletproof

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TECH STACK                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND                                                                   │
│  ────────                                                                   │
│  • React 18 + TypeScript      Why: Industry standard, huge ecosystem        │
│  • Vite                       Why: Fast builds, great DX                    │
│  • Tailwind CSS               Why: Rapid styling, consistent design         │
│  • Zustand                    Why: Simple state management                  │
│  • React Query                Why: Server state, caching, streaming         │
│                                                                              │
│  BACKEND                                                                    │
│  ───────                                                                    │
│  • Node.js + TypeScript       Why: Same language as frontend, fast I/O     │
│  • Hono                       Why: Fast, lightweight, edge-ready            │
│  • Drizzle ORM                Why: Type-safe, lightweight, SQL-first        │
│  • Zod                        Why: Runtime validation, type inference       │
│                                                                              │
│  DATABASE                                                                   │
│  ────────                                                                   │
│  • PostgreSQL (Neon)          Why: Reliable, scalable, serverless option   │
│  • Redis (Upstash)            Why: Sessions, rate limiting, caching        │
│                                                                              │
│  AI                                                                         │
│  ──                                                                         │
│  • Anthropic API              Why: Best reasoning, good streaming          │
│  • Claude 3.5 Haiku/Sonnet/Opus  Why: Model tiering for cost optimization  │
│                                                                              │
│  INFRASTRUCTURE                                                             │
│  ──────────────                                                             │
│  • Fly.io                     Why: Simple deployment, global, affordable   │
│  • Cloudflare (CDN/DNS)       Why: Fast, DDoS protection                   │
│  • Stripe                     Why: Industry standard payments              │
│                                                                              │
│  MONITORING                                                                 │
│  ──────────                                                                 │
│  • Sentry                     Why: Error tracking                          │
│  • Axiom                      Why: Logging, cost analytics                 │
│                                                                              │
│  DEVELOPMENT                                                                │
│  ───────────                                                                │
│  • pnpm                       Why: Fast, efficient                         │
│  • Turborepo                  Why: Monorepo tooling                        │
│  • Biome                      Why: Fast linting/formatting                 │
│  • Vitest                     Why: Fast testing                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## UI Design: Premium and Professional

### Main Chat Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────┐                                    ┌────────────────┐  │
│  │ ☰   │  Assistant                         │ ⚡ Professional │  │
│  └─────┘                                    └────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                    ┌─────────────────────────┐                  │
│                    │  Hi Sarah! 👋            │                  │
│                    │                          │                  │
│                    │  How can I help you      │                  │
│                    │  today?                  │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Can you help me write a professional email to          │    │
│  │  decline a meeting invitation?                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                                                  │
│                    ┌─────────────────────────┐                  │
│                    │  Of course! Here's a    │                  │
│                    │  polite way to decline: │                  │
│                    │                          │                  │
│                    │  "Hi [Name],             │                  │
│                    │                          │                  │
│                    │  Thank you for the       │                  │
│                    │  invitation to..."       │                  │
│                    │                          │                  │
│                    │  ░░░░░░░░                │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Message...                                         📎 ▶│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Settings Panel with Tier Display

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          ✕ Close│
│  Settings                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACCOUNT                                                        │
│  ───────────────────────────────────────────                    │
│  Sarah Johnson                                                  │
│  sarah@example.com                                              │
│                                                                  │
│  ───────────────────────────────────────────────────────────── │
│                                                                  │
│  YOUR PLAN                                                      │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚡ PROFESSIONAL                            $79/month   │   │
│  │                                                          │   │
│  │  ✓ All channels          ✓ 30-day memory               │   │
│  │  ✓ Web browsing          ✓ Priority support            │   │
│  │  ✓ File analysis                                        │   │
│  │                                                          │   │
│  │  Renews: March 3, 2026                                   │   │
│  │                                                          │   │
│  │  [Change plan]  [Manage billing]                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ───────────────────────────────────────────────────────────── │
│                                                                  │
│  THIS BILLING PERIOD                                            │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  Messages sent:          847                                    │
│  AI processing cost:     $18.42  (included in plan)            │
│                                                                  │
│  ───────────────────────────────────────────────────────────── │
│                                                                  │
│  CONNECTED CHANNELS                                             │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Web Chat                              Always on      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Telegram                              @sarahj        │   │
│  │                                          [Disconnect]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + Connect Slack                      (Professional+)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ───────────────────────────────────────────────────────────── │
│                                                                  │
│  PREFERENCES                                                    │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  Response style                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Professional and concise                         ▼     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Remember conversations (30 days)      [████████] On            │
│                                                                  │
│  ───────────────────────────────────────────────────────────── │
│                                                                  │
│  [Download my data]        [Delete all data]                    │
│                                                                  │
│  [Log out]                                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Development Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT PHASES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: Foundation (Week 1-2)                                             │
│  ══════════════════════════════                                             │
│  □ Project setup (monorepo, configs, CI)                                    │
│  □ Database schema + migrations                                             │
│  □ Auth service (Google OAuth)                                              │
│  □ Basic API structure                                                      │
│  □ Health endpoints                                                         │
│                                                                              │
│  Deliverable: Can sign in, session persists                                 │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PHASE 2: Core Chat (Week 3-4)                                              │
│  ═════════════════════════════                                              │
│  □ Chat UI (messages, input, streaming)                                     │
│  □ AI orchestrator (Anthropic integration)                                  │
│  □ Intelligent model routing (Haiku/Sonnet/Opus)                           │
│  □ Context management                                                       │
│  □ Conversation CRUD                                                        │
│  □ Usage tracking with cost attribution                                     │
│                                                                              │
│  Deliverable: Full chat experience via web                                  │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PHASE 3: Billing + Tiers (Week 5-6)                                        │
│  ═══════════════════════════════════                                        │
│  □ Stripe integration                                                       │
│  □ Subscription management                                                  │
│  □ Tier enforcement middleware                                              │
│  □ Feature gating by tier                                                   │
│  □ Usage dashboard                                                          │
│  □ 7-day trial flow                                                         │
│                                                                              │
│  Deliverable: Full billing, users can subscribe                             │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PHASE 4: Telegram + Polish (Week 7-8)                                      │
│  ════════════════════════════════════                                       │
│  □ Telegram bot setup                                                       │
│  □ Channel linking flow                                                     │
│  □ Message relay (Telegram ↔ Core)                                         │
│  □ Connection status UI                                                     │
│  □ Onboarding flow                                                          │
│  □ Error handling polish                                                    │
│  □ Mobile responsiveness                                                    │
│                                                                              │
│  Deliverable: Complete MVP ready for beta users                             │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PHASE 5: Launch Prep (Week 9-10)                                           │
│  ════════════════════════════════                                           │
│  □ Load testing                                                             │
│  □ Security audit                                                           │
│  □ Semantic caching implementation                                          │
│  □ Documentation                                                            │
│  □ Landing page                                                             │
│  □ Beta user onboarding                                                     │
│                                                                              │
│  Deliverable: Production launch                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: What Makes This Clean

| Principle | Implementation |
|-----------|----------------|
| **Single responsibility** | Each service does one thing well |
| **Clear boundaries** | Layers don't leak into each other |
| **Minimal dependencies** | Only what's absolutely needed |
| **Type safety** | TypeScript end-to-end, Zod validation |
| **Predictable patterns** | Same structure across all features |
| **Margin-first design** | Cost optimization built into architecture |
| **Premium positioning** | Pricing reflects value, attracts serious users |

**The MVP in one sentence:**

> A web app where you sign in with Google, chat with an intelligently-routed AI that remembers you, and optionally connect Telegram—starting at $39/month with 84%+ gross margins.

**Why investors love this:**

1. **84% gross margin** — Well above SaaS benchmark (70-80%)
2. **Utility pricing model** — Predictable, sticky revenue like gas/electricity/internet  
3. **Premium positioning** — No race to bottom, attracts serious users
4. **Cost optimization built-in** — Margins improve over time with caching & model tiering
5. **Clear path to profitability** — Break-even at just ~15 paying users
6. **Expansion revenue** — Natural tier upgrades (Solo → Pro → Business)

Everything else is V2.
