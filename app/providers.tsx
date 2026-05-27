/**
 * app/providers.tsx
 *
 * Root Client Providers — wrapper 'use client' yang membungkus
 * seluruh aplikasi untuk menyediakan context global.
 *
 * Karena React Context tidak bisa dipakai di Server Components,
 * kita buat wrapper ini dan import di app/layout.tsx (Server Component).
 */
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useTelegram, type UseTelegramReturn } from '@/hooks/useTelegram'

// ─── Telegram Context ─────────────────────────────────────────────
const TelegramContext = createContext<UseTelegramReturn | null>(null)

export function useTelegramContext(): UseTelegramReturn {
  const ctx = useContext(TelegramContext)
  if (!ctx) {
    throw new Error('useTelegramContext harus dipakai di dalam <Providers>')
  }
  return ctx
}

// ─── Root Providers ───────────────────────────────────────────────
export function Providers({ children }: { children: ReactNode }) {
  const telegram = useTelegram()

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  )
}
