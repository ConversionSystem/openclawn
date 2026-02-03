import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const health = new Hono()

/**
 * GET /health - Basic health check
 */
health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
  })
})

/**
 * GET /health/ready - Readiness check (includes dependencies)
 */
health.get('/ready', async (c) => {
  const services = {
    database: false,
    redis: false,
    ai: false,
  }

  // Check database
  try {
    await db.execute(sql`SELECT 1`)
    services.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  // Check Redis (if configured)
  try {
    if (process.env.REDIS_URL) {
      // Simple Redis ping would go here
      services.redis = true
    } else {
      services.redis = true // Not configured = not required
    }
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  // Check AI provider (verify API key is set)
  services.ai = !!process.env.ANTHROPIC_API_KEY

  const allHealthy = Object.values(services).every(Boolean)

  return c.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    },
    allHealthy ? 200 : 503
  )
})

export { health }
