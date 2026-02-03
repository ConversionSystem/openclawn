import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { updateUser, deleteUser } from '../db/queries/users'
import { deleteUserSessions } from '../services/auth/session'
import { getMessageCountForPeriod } from '../db/queries/conversations'
import { TIER_LIMITS } from '@assistant/shared'

const user = new Hono()

user.use('*', authMiddleware)

/**
 * GET /user/preferences - Get user preferences
 */
user.get('/preferences', (c) => {
  const currentUser = c.get('user')

  return c.json({
    success: true,
    data: currentUser.preferences,
  })
})

const preferencesSchema = z.object({
  responseStyle: z.enum(['concise', 'detailed', 'professional', 'casual']).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

/**
 * PATCH /user/preferences - Update user preferences
 */
user.patch('/preferences', zValidator('json', preferencesSchema), async (c) => {
  const currentUser = c.get('user')
  const updates = c.req.valid('json')

  const updatedUser = await updateUser(currentUser.id, {
    preferences: {
      ...(currentUser.preferences as object),
      ...updates,
    },
  })

  return c.json({
    success: true,
    data: updatedUser?.preferences,
  })
})

/**
 * GET /user/usage - Get current period usage
 */
user.get('/usage', async (c) => {
  const currentUser = c.get('user')

  // Calculate current billing period (start of current month)
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Get message count for this period
  const messagesUsed = await getMessageCountForPeriod(currentUser.id, periodStart, periodEnd)

  const tierLimits = TIER_LIMITS[currentUser.tier]

  return c.json({
    success: true,
    data: {
      currentPeriod: {
        start: periodStart,
        end: periodEnd,
      },
      messagesUsed,
      messagesLimit: tierLimits.messagesPerMonth,
      percentUsed: Math.round((messagesUsed / tierLimits.messagesPerMonth) * 100),
      tier: currentUser.tier,
      features: tierLimits.features,
    },
  })
})

/**
 * GET /user/tier - Get current tier info
 */
user.get('/tier', (c) => {
  const currentUser = c.get('user')
  const tierLimits = TIER_LIMITS[currentUser.tier]

  return c.json({
    success: true,
    data: {
      tier: currentUser.tier,
      limits: tierLimits,
    },
  })
})

/**
 * DELETE /user/data - Delete all user data
 */
user.delete('/data', async (c) => {
  const currentUser = c.get('user')

  // Delete all sessions
  await deleteUserSessions(currentUser.id)

  // Delete user (cascades to conversations, messages, channels, etc.)
  await deleteUser(currentUser.id)

  return c.json({
    success: true,
    message: 'All your data has been deleted.',
  })
})

export { user }
