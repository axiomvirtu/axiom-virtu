/**
 * lib/telegram/validate.ts
 *
 * Validasi server-side Telegram initData.
 * Dijalankan di Route Handler / Server Action untuk memastikan
 * request benar-benar berasal dari Telegram (bukan spoofed).
 *
 * Algoritma: HMAC-SHA256 sesuai dokumentasi resmi Telegram.
 * Ref: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
import { createHmac } from 'crypto'
import type { TelegramInitData } from './types'

export function validateTelegramInitData(
  initDataRaw: string,
): TelegramInitData | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? ''
  if (!initDataRaw || !botToken) return null

  try {
    const params     = new URLSearchParams(initDataRaw)
    const hash       = params.get('hash')
    if (!hash) return null

    // Buat data-check-string: semua field kecuali 'hash', diurutkan alfabet
    params.delete('hash')
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    // Secret key = HMAC-SHA256("WebAppData", BOT_TOKEN)
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Hitung HMAC dari data-check-string menggunakan secret key
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (expectedHash !== hash) {
      console.warn('[Telegram] initData hash mismatch — possible spoofing attempt')
      return null
    }

    // Cek apakah initData sudah kadaluarsa (> 1 jam)
    const authDate  = Number(params.get('auth_date'))
    const now       = Math.floor(Date.now() / 1000)
    const MAX_AGE   = 60 * 60 // 1 jam dalam detik

    if (now - authDate > MAX_AGE) {
      console.warn('[Telegram] initData expired — auth_date terlalu lama')
      return null
    }

    // Parse field user
    const userStr = params.get('user')
    const user    = userStr ? JSON.parse(decodeURIComponent(userStr)) : undefined

    return {
      query_id:       params.get('query_id')       ?? undefined,
      user,
      receiver:       params.get('receiver')       ? JSON.parse(decodeURIComponent(params.get('receiver')!)) : undefined,
      chat_type:      (params.get('chat_type')     as TelegramInitData['chat_type']) ?? undefined,
      chat_instance:  params.get('chat_instance')  ?? undefined,
      start_param:    params.get('start_param')    ?? undefined,
      can_send_after: params.get('can_send_after') ? Number(params.get('can_send_after')) : undefined,
      auth_date:      authDate,
      hash,
    }
  } catch (err) {
    console.error('[Telegram] Error validating initData:', err)
    return null
  }
}
