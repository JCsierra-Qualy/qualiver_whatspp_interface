import { format } from 'date-fns'
import { Message } from '../types/database.types'
import { CheckIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface MessageBubbleProps {
  message: Message
  isBot: boolean
}

export const MessageBubble = ({ message, isBot }: MessageBubbleProps) => {
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

  return (
    <div className={`flex ${isBot ? 'justify-end' : 'justify-start'} mb-4 message-bubble`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isBot
            ? 'bg-[#004F4F] text-white rounded-br-none'
            : 'bg-gray-light text-gray-dark rounded-bl-none'
        }`}
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
          <div className="text-xs mt-1 opacity-75">
            Modo manual
          </div>
        )}
      </div>
    </div>
  )
} 