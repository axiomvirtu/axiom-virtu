'use client'

/**
 * hooks/useTelegram.ts
 *
 * Custom React hook untuk integrasi Telegram Web App SDK.
 *
 * Fitur:
 * - SSR-safe: tidak akan crash di server atau window yang belum ada
 * - Auto-expand: memanggil tg.expand() + tg.ready() saat mount
 * - Membaca profil user dari initDataUnsafe
 * - Mengekspos tg instance untuk manipulasi MainButton, HapticFeedback, dll.
 * - Mendeteksi apakah app berjalan di dalam Telegram atau di browser biasa
 *
 * Penggunaan:
 * ```tsx
 * const { tg, user, isReady, isTelegram } = useTelegram()
 * ```
 */

import { useEffect, useState, useCallback } from 'react'
import type { TelegramWebApp, TelegramUser } from '@/lib/telegram/types'

// ─── Return type hook ─────────────────────────────────────────────
export interface UseTelegramReturn {
  /** Instance Telegram WebApp — null sebelum SDK siap atau di luar Telegram */
  tg:          TelegramWebApp | null
  /** Data user Telegram dari initDataUnsafe */
  user:        TelegramUser   | null
  /** String initData mentah untuk dikirim ke server guna verifikasi */
  initData:    string
  /** True jika SDK sudah terinisialisasi dan siap dipakai */
  isReady:     boolean
  /** True jika app berjalan di dalam Telegram (bukan browser biasa) */
  isTelegram:  boolean
  /** Color scheme saat ini: 'light' | 'dark' */
  colorScheme: 'light' | 'dark'
  /** Shortcut: trigger haptic impact */
  haptic:      (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  /** Shortcut: trigger haptic notification */
  hapticNotify: (type: 'error' | 'success' | 'warning') => void
  /** Shortcut: tampilkan alert bawaan Telegram */
  showAlert:   (message: string, callback?: () => void) => void
  /** Shortcut: tampilkan confirm dialog bawaan Telegram */
  showConfirm: (message: string, callback?: (ok: boolean) => void) => void
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useTelegram(): UseTelegramReturn {
  const [tg, setTg]               = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady]     = useState(false)
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // SSR guard: window tidak tersedia di server
    if (typeof window === 'undefined') return

    const webApp = window.Telegram?.WebApp

    if (!webApp) {
      // Berjalan di browser biasa (development), set ready tanpa SDK
      setIsReady(true)
      return
    }

    // Beritahu Telegram bahwa Mini App sudah siap di-render
    webApp.ready()

    // Perluas tampilan ke full-screen
    webApp.expand()

    // Set warna header & background sesuai branding
    webApp.setHeaderColor('#0d0d14')
    webApp.setBackgroundColor('#0d0d14')

    // Aktifkan konfirmasi saat user coba tutup app
    webApp.enableClosingConfirmation()

    // Sinkronkan color scheme
    setColorScheme(webApp.colorScheme ?? 'dark')

    setTg(webApp)
    setIsReady(true)

    // Listener untuk perubahan tema (user ganti tema Telegram)
    const handleThemeChange = () => {
      if (window.Telegram?.WebApp) {
        setColorScheme(window.Telegram.WebApp.colorScheme ?? 'dark')
      }
    }

    webApp.onEvent('themeChanged', handleThemeChange)

    return () => {
      webApp.offEvent('themeChanged', handleThemeChange)
    }
  }, [])

  // ─── Shortcut helpers ──────────────────────────────────────────
  const haptic = useCallback(
    (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      tg?.HapticFeedback?.impactOccurred(style)
    },
    [tg],
  )

  const hapticNotify = useCallback(
    (type: 'error' | 'success' | 'warning') => {
      tg?.HapticFeedback?.notificationOccurred(type)
    },
    [tg],
  )

  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      if (tg) {
        tg.showAlert(message, callback)
      } else {
        // Fallback untuk development di browser
        window.alert(message)
        callback?.()
      }
    },
    [tg],
  )

  const showConfirm = useCallback(
    (message: string, callback?: (ok: boolean) => void) => {
      if (tg) {
        tg.showConfirm(message, callback)
      } else {
        // Fallback untuk development di browser
        const ok = window.confirm(message)
        callback?.(ok)
      }
    },
    [tg],
  )

  // ─── Derived values ────────────────────────────────────────────
  const user       = tg?.initDataUnsafe?.user ?? null
  const initData   = tg?.initData ?? ''
  // Telegram SDK tetap membuat object WebApp di browser biasa, tapi platform-nya 'unknown'
  const isTelegram = typeof window !== 'undefined' && 
                     Boolean(window.Telegram?.WebApp) && 
                     window.Telegram?.WebApp?.platform !== 'unknown' &&
                     window.Telegram?.WebApp?.platform !== ''

  return {
    tg,
    user,
    initData,
    isReady,
    isTelegram,
    colorScheme,
    haptic,
    hapticNotify,
    showAlert,
    showConfirm,
  }
}
