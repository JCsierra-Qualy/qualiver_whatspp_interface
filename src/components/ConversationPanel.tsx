import { useEffect, useRef, useState } from 'react'
import { Message, Conversation } from '../types/database.types'
import { MessageBubble } from './MessageBubble'
import { supabase } from '../lib/supabase'
import { Switch } from '@headlessui/react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { sendBotStatusWebhook, sendMessageWebhook } from '../lib/webhooks'

interface ConversationPanelProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => Promise<void>
  onToggleBot: (active: boolean) => Promise<void>
}

export const ConversationPanel = ({
  conversation,
  messages,
  onSendMessage,
  onToggleBot,
}: ConversationPanelProps) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)
  const [isTogglingBot, setIsTogglingBot] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      // Primero enviamos el mensaje a través del webhook
      await sendMessageWebhook(
        conversation.id,
        newMessage,
        conversation.phone_number,
        !conversation.bot_active // true si está en modo manual
      )
      
      // Luego actualizamos la base de datos
      await onSendMessage(newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleBotToggle = async (checked: boolean) => {
    if (isTogglingBot) return

    // Si se está desactivando el bot, pedir confirmación
    if (!checked) {
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas desactivar el bot? Los mensajes serán manejados manualmente.'
      )
      if (!confirmed) return
    }

    setIsTogglingBot(true)

    try {
      // Primero notificamos a n8n sobre el cambio de estado
      await sendBotStatusWebhook(
        conversation.id,
        checked,
        conversation.phone_number
      )
      
      // Luego actualizamos el estado en la base de datos
      await onToggleBot(checked)
    } catch (error) {
      console.error('Error toggling bot status:', error)
    } finally {
      setIsTogglingBot(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-dark p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {conversation.contact_name || conversation.phone_number}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              conversation.bot_active 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-yellow-600 dark:text-yellow-500 font-medium'
            }`}>
              {conversation.bot_active ? 'Bot activo' : 'Modo manual'}
            </span>
            <Switch
              checked={conversation.bot_active}
              onChange={handleBotToggle}
              disabled={isTogglingBot}
              className={`${
                conversation.bot_active ? 'bg-secondary' : 'bg-yellow-500'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isTogglingBot ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span
                className={`${
                  conversation.bot_active ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
        {!conversation.bot_active && (
          <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            <span className="font-medium">Bot desactivado</span> - Los mensajes serán manejados manualmente.
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isBot={message.message_type === 'bot' || message.sender_type === 'bot'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!conversation.bot_active && (
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Modo manual - Escribe tu respuesta..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-[#004F4F] text-white rounded-lg px-4 py-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 