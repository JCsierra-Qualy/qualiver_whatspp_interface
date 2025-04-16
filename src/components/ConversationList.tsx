import { useState } from 'react'
import { Conversation } from '../types/database.types'
import { format } from 'date-fns'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation?: Conversation
  onSelectConversation: (conversation: Conversation) => void
}

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConversations = conversations.filter((conversation) => {
    const searchText = (conversation.contact_name || conversation.phone_number || '').toLowerCase()
    return searchText.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full border-r dark:border-gray-700">
      <div className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedConversation?.id === conversation.id
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {conversation.contact_name || conversation.phone_number || 'Sin identificación'}
                  </h3>
                  {conversation.last_message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conversation.last_message}
                    </p>
                  )}
                </div>
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {format(new Date(conversation.last_message_at), 'HH:mm')}
                  </span>
                )}
              </div>
              {!conversation.bot_active && (
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Bot inactivo
                </span>
              )}
            </button>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
          </div>
        )}
      </div>
    </div>
  )
} 