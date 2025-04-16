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
  const [isSending, setIsSending] = useState(false)
  const [isTogglingBot, setIsTogglingBot] = useState(false)
  const [localBotActive, setLocalBotActive] = useState(conversation.bot_active)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Actualizar el estado local cuando cambia la conversación
  useEffect(() => {
    setLocalBotActive(conversation.bot_active)
  }, [conversation.bot_active])

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
      await sendMessageWebhook(
        conversation.id,
        newMessage,
        conversation.phone_number,
        !localBotActive
      )
      
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

    setIsTogglingBot(true)
    setLocalBotActive(checked) // Actualizar el estado local inmediatamente para mejor UX

    try {
      console.log('Enviando webhook de estado del bot:', {
        conversationId: conversation.id,
        isActive: checked,
        phoneNumber: conversation.phone_number,
      })

      await sendBotStatusWebhook(
        conversation.id,
        checked,
        conversation.phone_number
      )
      
      await onToggleBot(checked)
    } catch (error) {
      console.error('Error toggling bot status:', error)
      setLocalBotActive(!checked) // Revertir el estado local si hay error
    } finally {
      setIsTogglingBot(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {conversation.contact_name || conversation.phone_number}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              localBotActive 
                ? 'text-gray-600 dark:text-gray-300' 
                : 'text-yellow-600 dark:text-yellow-500 font-medium'
            }`}>
              {localBotActive ? 'Bot activo' : 'Modo manual'}
            </span>
            <Switch
              checked={localBotActive}
              onChange={handleBotToggle}
              disabled={isTogglingBot}
              className={`switch-bot ${
                localBotActive ? 'bg-secondary' : 'bg-yellow-500'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isTogglingBot ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span
                className={`${
                  localBotActive ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
        {!localBotActive && (
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            <span className="font-medium">Bot desactivado</span> - Los mensajes serán manejados manualmente.
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            senderType={message.sender_type}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!localBotActive && (
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Modo manual - Escribe tu respuesta..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:border-primary dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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