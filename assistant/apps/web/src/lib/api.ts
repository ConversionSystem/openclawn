// API URL configuration
const getApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In browser, construct API URL based on current host
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    // If running on sandbox, use the API port URL
    if (host.includes('sandbox')) {
      return window.location.origin.replace('5173', '3000')
    }
    // Local development
    return 'http://localhost:3000'
  }
  
  return 'http://localhost:3000'
}

const API_URL = getApiUrl()

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
    const response = await fetch(`${API_URL}/auth/me`)
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
      // credentials: 'include', // Disabled for demo
    })
    return handleResponse<void>(response)
  },

  // Conversations
  async getConversations() {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      // credentials: 'include', // Disabled for demo
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
      // credentials: 'include', // Disabled for demo
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
      // credentials: 'include', // Disabled for demo
    })
    return handleResponse<{
      id: string
      title: string | null
    }>(response)
  },

  async deleteConversation(id: string) {
    const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
      method: 'DELETE',
      // credentials: 'include', // Disabled for demo
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
      // credentials: 'include', // Disabled for demo
      body: JSON.stringify({ content }),
    })
  },

  // User
  async getUsage() {
    const response = await fetch(`${API_URL}/user/usage`, {
      // credentials: 'include', // Disabled for demo
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
      // credentials: 'include', // Disabled for demo
      body: JSON.stringify(preferences),
    })
    return handleResponse<Record<string, unknown>>(response)
  },

  async deleteAccount() {
    const response = await fetch(`${API_URL}/user/data`, {
      method: 'DELETE',
      // credentials: 'include', // Disabled for demo
    })
    return handleResponse<void>(response)
  },
}
