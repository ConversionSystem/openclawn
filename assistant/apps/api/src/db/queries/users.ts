import { eq } from 'drizzle-orm'
import { db, users, type NewUser, type User } from '../index'

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return result[0]
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0]
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1)
  return result[0]
}

export async function createUser(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning()
  return result[0]!
}

export async function updateUser(
  id: string,
  data: Partial<Omit<NewUser, 'id'>>
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return result[0]
}

export async function upsertUserByGoogleId(
  googleId: string,
  data: { email: string; name?: string }
): Promise<User> {
  // Try to find existing user
  const existing = await getUserByGoogleId(googleId)
  if (existing) {
    // Update last login info
    return (await updateUser(existing.id, { name: data.name })) ?? existing
  }

  // Create new user
  return createUser({
    email: data.email,
    name: data.name ?? null,
    googleId,
    tier: 'trial',
    preferences: {},
  })
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}
