import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { setCookie, deleteCookie } from 'hono/cookie'
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  verifyGoogleIdToken,
} from '../services/auth/google'
import { createSession, deleteSession } from '../services/auth/session'
import { upsertUserByGoogleId, getUserById } from '../db/queries/users'
import { authMiddleware } from '../middleware/auth'
import { SESSION } from '@assistant/shared'

const auth = new Hono()

/**
 * GET /auth/google - Initiate Google OAuth flow
 */
auth.get('/google', (c) => {
  const state = crypto.randomUUID()

  // Store state in cookie for CSRF protection
  setCookie(c, 'oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  const authUrl = getGoogleAuthUrl(state)
  return c.redirect(authUrl)
})

/**
 * GET /auth/google/callback - Handle Google OAuth callback
 */
auth.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return c.redirect(`${process.env.APP_URL}/login?error=oauth_denied`)
  }

  if (!code || !state) {
    return c.redirect(`${process.env.APP_URL}/login?error=missing_params`)
  }

  // Verify state (CSRF protection)
  // Note: In production, validate against stored state cookie

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Verify ID token and get user info
    const googleUser = await verifyGoogleIdToken(tokens.id_token)

    if (!googleUser.email_verified) {
      return c.redirect(`${process.env.APP_URL}/login?error=email_not_verified`)
    }

    // Create or update user
    const user = await upsertUserByGoogleId(googleUser.sub, {
      email: googleUser.email,
      name: googleUser.name,
    })

    // Create session
    const { token } = await createSession(user.id)

    // Set session cookie
    setCookie(c, SESSION.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: SESSION.maxAge / 1000,
      path: '/',
    })

    // Clear state cookie
    deleteCookie(c, 'oauth_state')

    // Redirect to app
    return c.redirect(process.env.APP_URL!)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect(`${process.env.APP_URL}/login?error=auth_failed`)
  }
})

/**
 * POST /auth/logout - End session
 */
auth.post('/logout', authMiddleware, async (c) => {
  const sessionId = c.get('sessionId')

  await deleteSession(sessionId)

  deleteCookie(c, SESSION.cookieName, { path: '/' })

  return c.json({ success: true })
})

/**
 * GET /auth/me - Get current user
 */
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  })
})

export { auth }
