import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { verifySession } from '../services/auth/session'
import { getUserById } from '../db/queries/users'
import type { User } from '../db/schema'

// Extend Hono context with user
declare module 'hono' {
  interface ContextVariableMap {
    user: User
    sessionId: string
  }
}

/**
 * Authentication middleware - requires valid session
 */
export async function authMiddleware(c: Context, next: Next) {
  // Get token from cookie or Authorization header
  const token =
    c.req.header('Authorization')?.replace('Bearer ', '') ||
    getCookie(c, 'assistant_session')

  if (!token) {
    throw new HTTPException(401, { message: 'Authentication required' })
  }

  const session = await verifySession(token)
  if (!session) {
    throw new HTTPException(401, { message: 'Invalid or expired session' })
  }

  const user = await getUserById(session.userId)
  if (!user) {
    throw new HTTPException(401, { message: 'User not found' })
  }

  // Set user in context
  c.set('user', user)
  c.set('sessionId', session.sessionId)

  await next()
}

/**
 * Optional auth middleware - doesn't require auth but populates user if available
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token =
    c.req.header('Authorization')?.replace('Bearer ', '') ||
    getCookie(c, 'assistant_session')

  if (token) {
    const session = await verifySession(token)
    if (session) {
      const user = await getUserById(session.userId)
      if (user) {
        c.set('user', user)
        c.set('sessionId', session.sessionId)
      }
    }
  }

  await next()
}

// Helper to get cookie value
function getCookie(c: Context, name: string): string | undefined {
  const cookies = c.req.header('Cookie')
  if (!cookies) return undefined

  const match = cookies.match(new RegExp(`${name}=([^;]+)`))
  return match?.[1]
}
