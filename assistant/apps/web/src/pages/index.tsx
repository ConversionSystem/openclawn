import { useState } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-900">Assistant</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Chat window */}
        <ChatWindow />
      </div>
    </div>
  )
}
