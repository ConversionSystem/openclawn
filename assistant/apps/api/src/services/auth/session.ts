import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { db, sessions, type Session, type User } from '../../db'
import { SESSION } from '@assistant/shared'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'development-secret')

export interface SessionPayload {
  sessionId: string
  userId: string
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<{
  session: Session
  token: string
}> {
  const expiresAt = new Date(Date.now() + SESSION.maxAge)

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      expiresAt,
    })
    .returning()

  const token = await new SignJWT({
    sessionId: session!.id,
    userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(secret)

  return { session: session!, token }
}

/**
 * Verify a session token and return the session data
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)

    const sessionId = payload.sessionId as string
    const userId = payload.userId as string

    // Verify session exists in database
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)

    if (!session) {
      return null
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await deleteSession(sessionId)
      return null
    }

    return { sessionId, userId }
  } catch {
    return null
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

/**
 * Extend session expiration
 */
export async function extendSession(sessionId: string): Promise<void> {
  const newExpiry = new Date(Date.now() + SESSION.maxAge)
  await db
    .update(sessions)
    .set({ expiresAt: newExpiry })
    .where(eq(sessions.id, sessionId))
}
