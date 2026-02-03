import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChatStore, type Message } from '@/stores/chatStore'
import { api } from '@/lib/api'

export function useChat() {
  const queryClient = useQueryClient()
  const {
    conversations,
    currentConversationId,
    isStreaming,
    setConversations,
    setCurrentConversation,
    addConversation,
    addMessage,
    updateMessage,
    setMessageStreaming,
    setIsStreaming,
  } = useChatStore()

  // Fetch conversations
  const { isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const convs = await api.getConversations()
      setConversations(
        convs.map((c) => ({
          id: c.id,
          title: c.title,
          messages: [],
        }))
      )
      return convs
    },
  })

  // Load conversation messages
  const loadConversation = useCallback(
    async (conversationId: string) => {
      setCurrentConversation(conversationId)

      const data = await api.getConversation(conversationId)

      // Update messages in store
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) {
        const updatedConv = {
          ...conv,
          messages: data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })),
        }
        setConversations(
          conversations.map((c) => (c.id === conversationId ? updatedConv : c))
        )
      }
    },
    [conversations, setConversations, setCurrentConversation]
  )

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: api.createConversation,
    onSuccess: (data) => {
      addConversation({
        id: data.id,
        title: data.title,
        messages: [],
      })
      setCurrentConversation(data.id)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Send message with streaming
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentConversationId || isStreaming) return

      // Add user message
      const userMessageId = crypto.randomUUID()
      addMessage(currentConversationId, {
        id: userMessageId,
        role: 'user',
        content,
      })

      // Add placeholder for assistant message
      const assistantMessageId = crypto.randomUUID()
      addMessage(currentConversationId, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      })

      setIsStreaming(true)

      try {
        const response = await api.streamMessage(currentConversationId, content)

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  updateMessage(currentConversationId, assistantMessageId, assistantContent)
                }
              } catch {
                // Ignore parse errors for non-JSON lines
              }
            }
          }
        }

        setMessageStreaming(currentConversationId, assistantMessageId, false)
      } catch (error) {
        console.error('Stream error:', error)
        updateMessage(
          currentConversationId,
          assistantMessageId,
          'Sorry, I encountered an error. Please try again.'
        )
        setMessageStreaming(currentConversationId, assistantMessageId, false)
      } finally {
        setIsStreaming(false)
      }
    },
    [
      currentConversationId,
      isStreaming,
      addMessage,
      updateMessage,
      setMessageStreaming,
      setIsStreaming,
    ]
  )

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: api.deleteConversation,
    onSuccess: (_, conversationId) => {
      setConversations(conversations.filter((c) => c.id !== conversationId))
      if (currentConversationId === conversationId) {
        setCurrentConversation(null)
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Get current conversation
  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isStreaming,
    loadingConversations,
    loadConversation,
    createConversation: createConversation.mutate,
    sendMessage,
    deleteConversation: deleteConversation.mutate,
    setCurrentConversation,
  }
}
