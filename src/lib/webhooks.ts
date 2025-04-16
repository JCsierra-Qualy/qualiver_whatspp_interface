export const sendBotStatusWebhook = async (
  conversationId: string,
  isActive: boolean,
  phoneNumber: string
) => {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('N8N webhook URL not configured')
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending webhook:', error)
    throw error
  }
} 