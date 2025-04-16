import { useEffect, useState } from 'react'
import { ConversationList } from './components/ConversationList'
import { ConversationPanel } from './components/ConversationPanel'
import { Conversation, Message } from './types/database.types'
import { supabase } from './lib/supabase'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation>()
  const [messages, setMessages] = useState<Message[]>([])
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode')
      if (savedMode !== null) {
        return JSON.parse(savedMode)
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false })

        if (error) {
          throw error
        }

        setConversations(data || [])
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar las conversaciones')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()

    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations((prev) => [payload.new as Conversation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === payload.new.id
                  ? (payload.new as Conversation)
                  : conv
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      conversationsSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true })

        if (error) {
          throw error
        }

        setMessages(data || [])
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar los mensajes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message])
          }
        }
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
    }
  }, [selectedConversation])

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      const message = {
        conversation_id: selectedConversation.id,
        content,
        message_type: 'user',
        status: 'sent',
        bot_active: selectedConversation.bot_active,
      }

      const { error } = await supabase.from('messages').insert([message])

      if (error) {
        throw error
      }

      // Send webhook to n8n
      const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          message: content,
          contact_name: selectedConversation.contact_name,
          bot_active: selectedConversation.bot_active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send webhook')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje')
    }
  }

  const handleToggleBot = async (active: boolean) => {
    if (!selectedConversation) return

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ bot_active: active })
        .eq('id', selectedConversation.id)

      if (error) {
        throw error
      }

      setSelectedConversation((prev) =>
        prev ? { ...prev, bot_active: active } : undefined
      )
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado del bot')
    }
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-8 rounded-lg bg-red-50 dark:bg-red-900">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#004F4F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-[#004F4F] text-white py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-lg font-bold">Qualiver Chat</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r dark:border-gray-800">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          {selectedConversation ? (
            <ConversationPanel
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onToggleBot={handleToggleBot}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Selecciona una conversación para comenzar
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
