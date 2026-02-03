import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// Enums
export const tierEnum = pgEnum('tier', ['trial', 'solo', 'pro', 'business'])
export const roleEnum = pgEnum('message_role', ['user', 'assistant', 'system'])
export const modelEnum = pgEnum('model_type', ['haiku', 'sonnet', 'opus'])
export const channelEnum = pgEnum('channel_type', [
  'web',
  'telegram',
  'slack',
  'discord',
  'whatsapp',
  'api',
])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
])

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  googleId: varchar('google_id', { length: 255 }).unique(),
  preferences: jsonb('preferences').default({}).notNull(),
  tier: tierEnum('tier').default('trial').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }),
  summary: text('summary'),
  context: jsonb('context').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: roleEnum('role').notNull(),
  content: text('content').notNull(),
  channel: channelEnum('channel').default('web').notNull(),
  modelUsed: modelEnum('model_used'),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  costCents: integer('cost_cents'),
  cached: boolean('cached').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Channels table
export const channels = pgTable('channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: channelEnum('type').notNull(),
  config: jsonb('config').default({}).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  tier: tierEnum('tier').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Usage tracking table
export const usage = pgTable('usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  messagesCount: integer('messages_count').default(0).notNull(),
  tokensUsed: integer('tokens_used').default(0).notNull(),
  costCents: integer('cost_cents').default(0).notNull(),
  tier: tierEnum('tier').notNull(),
})

// Type exports for use with Drizzle
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type Usage = typeof usage.$inferSelect
export type NewUsage = typeof usage.$inferInsert
