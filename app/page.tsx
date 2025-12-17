'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

// Suggested Questions Component
function SuggestedQuestions({ onQuestionClick }: { onQuestionClick: (question: string) => void }) {
  const questions = [
    "What is Suraj's experience?",
    "What technical skills does Suraj have?",
    "What is Suraj's education background?",
    "Tell me about Suraj's recent projects"
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(question)}
          className="p-3 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-slate-700 font-medium"
        >
          {question}
        </button>
      ))}
    </div>
  )
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Message Component
function ChatMessage({ message, isUser }: { message: Message; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-slate-500'} mt-2 block`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// Welcome Card Component
function WelcomeCard() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-100 p-6 text-center mb-6">
      <div className="flex justify-center mb-4">
        <MessageCircle className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome to Resume Assistant</h2>
      <p className="text-slate-600">Ask me anything about Suraj's professional background</p>
    </Card>
  )
}

// Header Component
function Header() {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <h1 className="text-xl font-semibold text-slate-800">Resume Assistant</h1>
        </div>
      </div>
    </div>
  )
}

// Main Chat Component
function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }, 0)
    }
  }, [messages, isLoading])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    // Hide welcome card after first message
    setShowWelcome(false)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Show loading state
    setIsLoading(true)

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Parse the agent response
      let botContent = 'I could not process your request. Please try again.'

      if (data.response) {
        try {
          const parsed = JSON.parse(data.response)
          botContent = parsed.result?.answer || parsed.message || data.response
        } catch {
          // If not JSON, use the response directly
          botContent = data.response
        }
      } else if (data.message) {
        botContent = data.message
      }

      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div ref={scrollAreaRef} className="p-6 max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-8">
                <WelcomeCard />
                {showWelcome && (
                  <div className="w-full">
                    <p className="text-slate-600 text-sm font-medium mb-4 text-center">Try asking:</p>
                    <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.type === 'user'}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg rounded-bl-none">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything about Suraj's background..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function HomePage() {
  return <ChatInterface />
}
