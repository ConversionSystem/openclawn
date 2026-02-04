# =============================================================================
# Kyra AI - Production Dockerfile
# =============================================================================
# Multi-stage build for optimized image size
# =============================================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Create non-root user
RUN addgroup -g 1001 -S kyra && \
    adduser -S kyra -u 1001 -G kyra

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/openclaw.mjs ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy extensions
COPY --from=builder /app/extensions ./extensions

# Set ownership
RUN chown -R kyra:kyra /app

# Switch to non-root user
USER kyra

# Expose ports
EXPOSE 8080 18789

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV GATEWAY_PORT=18789

# Start the application
CMD ["node", "openclaw.mjs", "gateway", "run", "--port", "18789", "--bind", "0.0.0.0"]
