import { and, desc, eq, sql } from 'drizzle-orm'
import {
  db,
  conversations,
  messages,
  type Conversation,
  type NewConversation,
  type Message,
  type NewMessage,
} from '../index'

// Conversation queries

export async function getConversationById(id: string): Promise<Conversation | undefined> {
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1)
  return result[0]
}

export async function getConversationsByUserId(
  userId: string,
  limit = 20
): Promise<Conversation[]> {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit)
}

export async function createConversation(data: NewConversation): Promise<Conversation> {
  const result = await db.insert(conversations).values(data).returning()
  return result[0]!
}

export async function updateConversation(
  id: string,
  data: Partial<Omit<NewConversation, 'id' | 'userId'>>
): Promise<Conversation | undefined> {
  const result = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning()
  return result[0]
}

export async function deleteConversation(id: string, userId: string): Promise<void> {
  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
}

// Message queries

export async function getMessagesByConversationId(
  conversationId: string,
  limit = 50
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit)
}

export async function getRecentMessages(conversationId: string, limit = 20): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
}

export async function createMessage(data: NewMessage): Promise<Message> {
  const result = await db.insert(messages).values(data).returning()

  // Update conversation's updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId))

  return result[0]!
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string
): Promise<{ conversation: Conversation; messages: Message[] } | null> {
  const conversation = await getConversationById(conversationId)

  if (!conversation || conversation.userId !== userId) {
    return null
  }

  const msgs = await getMessagesByConversationId(conversationId)

  return { conversation, messages: msgs }
}

export async function getMessageCountForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        eq(conversations.userId, userId),
        sql`${messages.createdAt} >= ${startDate}`,
        sql`${messages.createdAt} < ${endDate}`
      )
    )

  return result[0]?.count ?? 0
}
