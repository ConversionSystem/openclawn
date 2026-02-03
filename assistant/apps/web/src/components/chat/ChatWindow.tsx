import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'

export function ChatWindow() {
  const { user } = useAuth()
  const {
    currentConversation,
    isStreaming,
    sendMessage,
    createConversation,
    loadingConversations,
  } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Welcome state - no conversation selected
  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-primary-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-gray-600 mb-6">
            How can I help you today? Start a new conversation or select one from the sidebar.
          </p>
          <button
            onClick={() => createConversation()}
            disabled={loadingConversations}
            className="btn-primary"
          >
            Start New Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {currentConversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Start the conversation by sending a message below.
              </p>
            </div>
          ) : (
            currentConversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <InputBar
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder={isStreaming ? 'Waiting for response...' : 'Message...'}
      />
    </div>
  )
}
