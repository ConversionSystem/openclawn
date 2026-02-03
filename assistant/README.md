# AI Personal Assistant MVP

A clean, streamlined AI personal assistant with 84%+ gross margins.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
pnpm db:push

# Start development
pnpm dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERFACE LAYER                          │
│                                                                  │
│    ┌─────────────┐         ┌─────────────┐                      │
│    │   WEB APP   │         │  TELEGRAM   │                      │
│    │  (React)    │         │   (Future)  │                      │
│    └──────┬──────┘         └──────┬──────┘                      │
│           │                       │                              │
└───────────┼───────────────────────┼──────────────────────────────┘
            │                       │
            └───────────┬───────────┘
                        │
┌───────────────────────┼──────────────────────────────────────────┐
│                       ▼                                          │
│                  API GATEWAY                                     │
│                   (Hono)                                         │
│                                                                  │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│    │   AUTH   │  │   CHAT   │  │   USER   │  │  HEALTH  │      │
│    └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘      │
│         │             │             │                            │
│         └─────────────┼─────────────┘                            │
│                       │                                          │
│              ┌────────┴────────┐                                │
│              │  AI ORCHESTRATOR │                                │
│              │                  │                                │
│              │ • Model routing  │                                │
│              │ • Context mgmt   │                                │
│              │ • Streaming      │                                │
│              └────────┬─────────┘                                │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────────────┐
│                       ▼                                          │
│                  DATA LAYER                                      │
│                                                                  │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │   POSTGRES   │  │    REDIS     │  │   ANTHROPIC  │        │
│    │   (Neon)     │  │  (Upstash)   │  │     API      │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
assistant/
├── apps/
│   ├── api/                    # Backend API (Hono + Drizzle)
│   │   └── src/
│   │       ├── routes/         # API endpoints
│   │       ├── services/       # Business logic
│   │       │   ├── ai/         # AI orchestration
│   │       │   ├── auth/       # Authentication
│   │       │   └── billing/    # Stripe integration
│   │       ├── middleware/     # Auth, rate limiting
│   │       └── db/             # Database schema & queries
│   │
│   └── web/                    # Frontend (React + Vite)
│       └── src/
│           ├── components/     # UI components
│           ├── hooks/          # React hooks
│           ├── stores/         # Zustand stores
│           └── pages/          # Page components
│
├── packages/
│   └── shared/                 # Shared types & utilities
│
└── infra/                      # Docker & deployment configs
```

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 18, Vite, Tailwind | Fast, modern, great DX |
| Backend | Hono, Node.js | Lightweight, fast, edge-ready |
| Database | PostgreSQL (Neon) | Reliable, serverless |
| Cache | Redis (Upstash) | Sessions, rate limiting |
| AI | Anthropic Claude | Best reasoning, good streaming |
| Auth | Google OAuth | Covers 70%+ of users |
| Payments | Stripe | Industry standard |
| Deployment | Fly.io | Simple, global |

## Pricing Tiers

| Tier | Price | Messages/mo | Features |
|------|-------|-------------|----------|
| Solo | $39 | 1,000 | Web + 1 channel, 7-day memory |
| Pro | $79 | 3,000 | + All channels, 30-day memory |
| Business | $149 | 10,000 | + Team features, 90-day memory |

**Target Gross Margin: 84%+**

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL (or Neon account)
- Anthropic API key
- Google OAuth credentials

### Environment Variables

See `.env.example` for all required variables.

### Commands

```bash
# Development
pnpm dev              # Start all services
pnpm dev --filter api # Start API only
pnpm dev --filter web # Start web only

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio

# Build
pnpm build            # Build all packages
pnpm typecheck        # Type check
pnpm lint             # Lint code
pnpm test             # Run tests
```

## Deployment

### Fly.io (Recommended)

```bash
cd infra
fly launch
fly secrets set DATABASE_URL=... ANTHROPIC_API_KEY=...
fly deploy
```

### Docker

```bash
docker-compose up -d
```

## License

Private - All rights reserved.
