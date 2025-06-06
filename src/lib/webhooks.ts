export const sendBotStatusWebhook = async (
  conversationId: string,
  isActive: boolean,
  phoneNumber: string
) => {
  const webhookUrl = import.meta.env.VITE_N8N_BOT_STATUS_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('N8N bot status webhook URL not configured')
    return
  }

  try {
    console.log('Intentando enviar webhook a:', webhookUrl)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        event: 'bot_status_changed',
        conversation_id: conversationId,
        is_active: isActive,
        phone_number: phoneNumber,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error en la respuesta del webhook:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending bot status webhook:', error)
    throw error
  }
}

export const sendMessageWebhook = async (
  conversationId: string,
  message: string,
  phoneNumber: string,
  isManualMode: boolean
) => {
  const webhookUrl = import.meta.env.VITE_N8N_MESSAGE_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('N8N message webhook URL not configured')
    return
  }

  try {
    console.log('Intentando enviar webhook a:', webhookUrl)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        event: 'new_message',
        conversation_id: conversationId,
        message,
        phone_number: phoneNumber,
        is_manual_mode: isManualMode,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error en la respuesta del webhook:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending message webhook:', error)
    throw error
  }
} 