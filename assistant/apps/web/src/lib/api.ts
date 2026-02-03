const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code ?? 'UNKNOWN_ERROR',
      data.error?.message ?? 'An error occurred'
    )
  }

  return data.data
}

export const api = {
  // Auth
  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })
    return handleResponse<{
      id: string
      email: string
      name: string | null
      tier: string
      preferences: Record<string, unknown>
    }>(response)
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    return handleResponse<void>(response)
  },

  // Conversations
  async getConversations() {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      credentials: 'include',
    })
    return handleResponse<
      Array<{
        id: string
        title: string | null
        updatedAt: string
      }>
    >(response)
  },

  async getConversation(id: string) {
    const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
      credentials: 'include',
    })
    return handleResponse<{
      conversation: {
        id: string
        title: string | null
        createdAt: string
        updatedAt: string
      }
      messages: Array<{
        id: string
        role: 'user' | 'assistant'
        content: string
        createdAt: string
      }>
    }>(response)
  },

  async createConversation() {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: 'POST',
      credentials: 'include',
    })
    return handleResponse<{
      id: string
      title: string | null
    }>(response)
  },

  async deleteConversation(id: string) {
    const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return handleResponse<void>(response)
  },

  // Streaming chat
  streamMessage(conversationId: string, content: string) {
    const url = `${API_URL}/chat/conversations/${conversationId}/messages`

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    })
  },

  // User
  async getUsage() {
    const response = await fetch(`${API_URL}/user/usage`, {
      credentials: 'include',
    })
    return handleResponse<{
      currentPeriod: { start: string; end: string }
      messagesUsed: number
      messagesLimit: number
      percentUsed: number
      tier: string
      features: string[]
    }>(response)
  },

  async updatePreferences(preferences: Record<string, unknown>) {
    const response = await fetch(`${API_URL}/user/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(preferences),
    })
    return handleResponse<Record<string, unknown>>(response)
  },

  async deleteAccount() {
    const response = await fetch(`${API_URL}/user/data`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return handleResponse<void>(response)
  },
}
