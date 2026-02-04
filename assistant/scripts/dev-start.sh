#!/bin/bash
# =============================================================================
# Kyra AI - Development Start Script
# =============================================================================
# Usage: ./scripts/dev-start.sh
# =============================================================================

set -e

echo "✨ Starting Kyra AI Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}Error: Node.js 22+ required. Current: $(node -v)${NC}"
    echo "Install with: fnm install 22 && fnm use 22"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check for .env file
if [ ! -f "../kyra-config/.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Copy .env.example to .env and configure your keys:"
    echo "  cp kyra-config/.env.example kyra-config/.env"
    echo ""
fi

# Navigate to project root
cd "$(dirname "$0")/../.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for required environment variables
check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${YELLOW}Warning: $1 is not set${NC}"
        return 1
    fi
    return 0
}

echo ""
echo "🔑 Checking environment variables..."
check_env "ANTHROPIC_API_KEY" || true
check_env "STRIPE_SECRET_KEY" || true

# Start the gateway
echo ""
echo "🚀 Starting Kyra Gateway..."
echo "   Port: ${GATEWAY_PORT:-18789}"
echo "   Mode: Development"
echo ""

# Set development environment
export NODE_ENV=development
export OPENCLAW_SKIP_CHANNELS=${OPENCLAW_SKIP_CHANNELS:-1}
export GATEWAY_PORT=${GATEWAY_PORT:-18789}

# Start with verbose logging
exec node openclaw.mjs gateway run \
    --port ${GATEWAY_PORT} \
    --bind 0.0.0.0 \
    --dev \
    --verbose
