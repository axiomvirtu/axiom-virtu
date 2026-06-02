/**
 * app/auth/page.tsx
 *
 * Halaman autentikasi — landing page saat user belum login.
 * Menangani verifikasi Telegram initData sebelum mengarahkan user ke dashboard.
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithCustomToken } from 'firebase/auth'
import { useTelegramContext } from '@/app/providers'
import { auth } from '@/lib/firebase'

export default function AuthPage() {
  const { user, initData, isReady, firebaseReady, isAuthenticated, isTelegram } = useTelegramContext()
  const router  = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!isReady || !firebaseReady) return

    if (isAuthenticated) {
      router.replace('/')
      return
    }

    if (!user || !initData) {
      if (!isTelegram) {
        router.replace('/')
      }
      return
    }

    handleAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, firebaseReady, isAuthenticated, user, initData, isTelegram])

  async function handleAuth() {
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/telegram', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ initData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Autentikasi gagal')
      }

      const data = await res.json()
      if (!data.token) {
        throw new Error('Token Firebase tidak diterima dari server')
      }

      if (!auth) {
        throw new Error('Firebase Auth tidak tersedia di browser')
      }

      await signInWithCustomToken(auth, data.token)
      router.replace('/')
    } catch (err: unknown) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // ─── Dev mode: bypass auth ────────────────────────────────────
  if (!isTelegram && process.env.NODE_ENV === 'development') {
    return (
      <div className="min-h-dvh bg-app flex items-center justify-center p-6">
        <div className="glass p-6 rounded-xl max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🛠️</div>
          <h1 className="text-lg font-semibold mb-2">Dev Mode</h1>
          <p className="text-secondary text-sm mb-4">
            Running outside Telegram. Auth bypassed for development.
          </p>
          <button
            onClick={() => router.replace('/')}
            className="w-full py-3 rounded-lg gradient-accent text-white font-semibold text-sm"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-app flex flex-col items-center justify-center p-6">
      {/* Logo & branding */}
      <div className="mb-10 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl gradient-accent mx-auto mb-4 flex items-center justify-center shadow-lg glow-violet">
          <span className="text-3xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold gradient-text">Axiom Virtu</h1>
        <p className="text-secondary text-sm mt-1">P2P Virtual Exchange · TON ⇄ IDR Swap</p>
      </div>

      {/* Status card */}
      <div className="glass p-6 rounded-xl max-w-sm w-full text-center animate-fade-in-up"
           style={{ animationDelay: '0.1s' }}>

        {status !== 'error' ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-violet-500
                            animate-spin-slow mx-auto mb-4" />
            <p className="text-sm text-secondary">
              {!isReady ? 'Loading Telegram SDK...' : 'Verifying your identity...'}
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-danger text-sm mb-4">{errMsg}</p>
            <button
              onClick={handleAuth}
              className="w-full py-3 rounded-lg gradient-accent text-white font-semibold text-sm"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
