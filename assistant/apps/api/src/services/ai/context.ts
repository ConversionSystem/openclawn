import type { Message } from '../../db/schema'
import { CONTEXT } from '@assistant/shared'
import { chat } from './providers/anthropic'

/**
 * Context window management for efficient AI interactions
 */
export interface ContextWindow {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  summary?: string
}

/**
 * Build context window from conversation messages
 * Implements context pruning and summarization for efficiency
 */
export async function buildContextWindow(
  messages: Message[],
  existingSummary?: string
): Promise<ContextWindow> {
  // If we have few messages, return them all
  if (messages.length <= CONTEXT.maxMessagesInContext) {
    return {
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      summary: existingSummary,
    }
  }

  // For longer conversations, take recent messages and summarize older ones
  const recentMessages = messages.slice(-CONTEXT.maxMessagesInContext)
  const olderMessages = messages.slice(0, -CONTEXT.maxMessagesInContext)

  // Generate summary of older messages if needed
  let summary = existingSummary
  if (olderMessages.length >= CONTEXT.summaryThreshold) {
    summary = await summarizeMessages(olderMessages, existingSummary)
  }

  const contextMessages: ContextWindow['messages'] = []

  // Add summary as context if we have one
  if (summary) {
    contextMessages.push({
      role: 'user',
      content: `[Previous conversation summary: ${summary}]`,
    })
    contextMessages.push({
      role: 'assistant',
      content:
        'I understand the context from our previous conversation. How can I help you now?',
    })
  }

  // Add recent messages
  for (const msg of recentMessages) {
    if (msg.role !== 'system') {
      contextMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    }
  }

  return { messages: contextMessages, summary }
}

/**
 * Summarize a batch of messages into a concise summary
 */
async function summarizeMessages(
  messages: Message[],
  existingSummary?: string
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n')

  const prompt = existingSummary
    ? `Previous summary: ${existingSummary}\n\nNew messages:\n${conversationText}\n\nUpdate the summary to include the key points from the new messages. Keep it under 200 words.`
    : `Summarize this conversation, focusing on key facts, decisions, and context that would be important for continuing the conversation:\n\n${conversationText}\n\nKeep the summary under 200 words.`

  const response = await chat({
    model: 'haiku', // Use cheapest model for summarization
    messages: [{ role: 'user', content: prompt }],
    systemPrompt: 'You are a summarization assistant. Be concise and factual.',
    maxTokens: 300,
  })

  return response.content
}

/**
 * Extract key facts from recent messages for quick context
 */
export function extractKeyFacts(messages: Message[]): string[] {
  const facts: string[] = []

  for (const msg of messages) {
    // Look for explicit information sharing
    const nameMatch = msg.content.match(/my name is (\w+)/i)
    if (nameMatch) facts.push(`User's name: ${nameMatch[1]}`)

    const jobMatch = msg.content.match(/I (work as|am) a[n]? ([\w\s]+)/i)
    if (jobMatch) facts.push(`User's occupation: ${jobMatch[2]}`)

    const locationMatch = msg.content.match(/I('m| am) (in|from) ([\w\s,]+)/i)
    if (locationMatch) facts.push(`User's location: ${locationMatch[3]}`)
  }

  // Return unique facts
  return [...new Set(facts)]
}
