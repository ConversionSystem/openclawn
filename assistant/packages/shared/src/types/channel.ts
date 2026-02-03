// Channel connection types

import type { ChannelType } from './message'

export interface Channel {
  id: string
  userId: string
  type: ChannelType
  config: ChannelConfig
  active: boolean
  createdAt: Date
}

export type ChannelConfig = TelegramConfig | SlackConfig | DiscordConfig | WebConfig

export interface TelegramConfig {
  chatId: string
  username?: string
}

export interface SlackConfig {
  teamId: string
  channelId: string
  userId: string
}

export interface DiscordConfig {
  guildId: string
  channelId: string
  userId: string
}

export interface WebConfig {
  // Web chat is always available, minimal config needed
  lastActiveAt?: Date
}

// API types

export interface ConnectChannelRequest {
  type: ChannelType
  token?: string // For verification codes
}

export interface ChannelStatus {
  type: ChannelType
  connected: boolean
  identifier?: string // e.g., @username for Telegram
  lastActiveAt?: Date
}
