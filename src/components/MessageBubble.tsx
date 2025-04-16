import { format } from 'date-fns'
import { Message } from '../types/database.types'
import { CheckIcon, CheckCircleIcon, ExclamationCircleIcon, ChatBubbleLeftIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface MessageBubbleProps {
  message: Message
  senderType: 'bot' | 'user' | 'agent'
}

export const MessageBubble = ({ message, senderType }: MessageBubbleProps) => {
  const isSystemMessage = senderType === 'bot' || senderType === 'agent'

  const getStatusIcon = () => {
    switch (message.message_status) {
      case 'sent':
        return <CheckIcon className="h-4 w-4 text-gray-400" />
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4 text-secondary" />
      case 'failed':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getIcon = () => {
    switch (senderType) {
      case 'bot':
        return <ChatBubbleLeftIcon className="h-5 w-5" />
      case 'agent':
        return <UserGroupIcon className="h-5 w-5" />
      case 'user':
        return <UserIcon className="h-5 w-5" />
      default:
        return <UserIcon className="h-5 w-5" />
    }
  }

  return (
    <div className={`flex ${isSystemMessage ? 'justify-end' : 'justify-start'} mb-4 message-bubble`}>
      {!isSystemMessage && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white">
          {getIcon()}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isSystemMessage
            ? 'bg-[#004F4F] text-white rounded-br-none'
            : 'bg-gray-light text-gray-dark rounded-bl-none'
        } ${!message.bot_active && message.message_type === 'user' ? 'border-2 border-yellow-500' : ''}`}
      >
        <div className="flex flex-col">
          <div className="break-words whitespace-pre-wrap">{message.message}</div>
          
          {message.media_url && (
            <a
              href={message.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline mt-1"
            >
              Ver archivo adjunto
            </a>
          )}
          
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-75">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {getStatusIcon()}
          </div>
        </div>
        
        {!message.bot_active && message.message_type === 'user' && (
          <div className="text-xs mt-1 text-yellow-600 dark:text-yellow-500 font-medium">
            Modo manual
          </div>
        )}
      </div>
      {isSystemMessage && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#004F4F] flex items-center justify-center text-white">
          {getIcon()}
        </div>
      )}
    </div>
  )
} 