import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string | null
  messages: Message[]
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isStreaming: boolean
  
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (id: string | null) => void
  addConversation: (conversation: Conversation) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, content: string) => void
  setMessageStreaming: (conversationId: string, messageId: string, isStreaming: boolean) => void
  setIsStreaming: (isStreaming: boolean) => void
  clearConversations: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isStreaming: false,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      ),
    })),

  updateMessage: (conversationId, messageId, content) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
              ),
            }
          : conv
      ),
    })),

  setMessageStreaming: (conversationId, messageId, isStreaming) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, isStreaming } : msg
              ),
            }
          : conv
      ),
    })),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  clearConversations: () =>
    set({ conversations: [], currentConversationId: null }),
}))
