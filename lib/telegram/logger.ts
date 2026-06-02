export async function sendAdminLog(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_LOG_CHANNEL_ID
  
  if (!botToken || !channelId) {
    console.warn('[Logger] Bot Token atau Channel ID tidak dikonfigurasi.')
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      console.error('[Logger] Gagal mengirim log ke Telegram:', data.description)
    }
  } catch (error) {
    console.error('[Logger] Gagal menembak API Telegram:', error)
  }
}
