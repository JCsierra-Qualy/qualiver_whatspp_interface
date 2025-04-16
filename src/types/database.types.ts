export interface Message {
  id: string
  created_at: string
  conversation_id: string
  message_type: 'user' | 'bot'
  message: string
  media_url?: string
  metadata?: any
  message_status?: 'sent' | 'delivered' | 'failed'
  phone_number: string
  sender_type: 'user' | 'bot'
  bot_active: boolean
}

export interface Conversation {
  id: string
  created_at: string
  contact_name?: string
  phone_number: string
  last_message_at?: string
  bot_active: boolean
  metadata?: any
}

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Message>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at'>
        Update: Partial<Conversation>
      }
    }
  }
} 