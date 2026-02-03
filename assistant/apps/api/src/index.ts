import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth, chat, user, health } from './routes'
import { errorHandler, notFoundHandler } from './middleware/errors'

// Create the main app
const app = new Hono()

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.APP_URL ?? 'http://localhost:5173',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

// Mount routes
app.route('/auth', auth)
app.route('/chat', chat)
app.route('/user', user)
app.route('/health', health)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'AI Personal Assistant API',
    version: '0.1.0',
    docs: '/health',
  })
})

// Error handling
app.onError(errorHandler)
app.notFound(notFoundHandler)

// Start server
const port = parseInt(process.env.PORT ?? '3000', 10)

console.log(`

  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🤖 AI Personal Assistant API            ║
  ║                                           ║
  ║   Server running on port ${port}            ║
  ║   Environment: ${process.env.NODE_ENV ?? 'development'}             ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝

`)

serve({
  fetch: app.fetch,
  port,
})

export default app
