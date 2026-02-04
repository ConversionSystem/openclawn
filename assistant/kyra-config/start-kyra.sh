#!/bin/bash
# Kyra AI Assistant - OpenClaw Gateway Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "✨ Starting Kyra AI Assistant..."
echo "================================"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Error: Node.js 22+ required (found: $(node -v))"
    echo "   Install with: fnm install 22 && fnm use 22"
    exit 1
fi
echo "✓ Node.js $(node -v)"

# Check for required environment variables
if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: No AI provider API key found"
    echo "   Set ANTHROPIC_API_KEY or OPENAI_API_KEY"
fi

# Set defaults for optional variables
export KYRA_PUBLIC_URL="${KYRA_PUBLIC_URL:-http://localhost:3000}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export TELEGRAM_ENABLED="${TELEGRAM_ENABLED:-false}"

echo ""
echo "Configuration:"
echo "  Public URL: $KYRA_PUBLIC_URL"
echo "  Log Level: $LOG_LEVEL"
echo "  Telegram: $TELEGRAM_ENABLED"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if built
if [ ! -d "dist" ]; then
    echo "🔨 Building OpenClaw..."
    npm run build 2>/dev/null || echo "Build step skipped (using source)"
fi

# Copy Kyra config if not exists
if [ ! -f "$PROJECT_ROOT/openclaw.json" ]; then
    echo "📝 Creating Kyra configuration..."
    cp "$SCRIPT_DIR/openclaw.config.json" "$PROJECT_ROOT/openclaw.json"
fi

# Start the gateway
echo ""
echo "🚀 Starting OpenClaw Gateway with Kyra extensions..."
echo "================================"

# Use npx tsx to run directly from source
exec npx tsx src/entry.ts gateway run \
    --port "${GATEWAY_PORT:-3000}" \
    --bind "0.0.0.0" \
    --verbose \
    "$@"
