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

import { createContext, useContext, type ReactNode, useEffect, useState } from 'react'
import { useTelegram, type UseTelegramReturn } from '@/hooks/useTelegram'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'

// ─── App context type ─────────────────────────────────────────────
export interface AppContextValue extends UseTelegramReturn {
  firebaseUser: User | null
  firebaseReady: boolean
  isAuthenticated: boolean
  signOutUser: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function useTelegramContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useTelegramContext harus dipakai di dalam <Providers>')
  }
  return ctx
}

export function Providers({ children }: { children: ReactNode }) {
  const telegram = useTelegram()
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirebaseReady(true)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setIsAuthenticated(Boolean(user))
      setFirebaseReady(true)
    })

    return unsubscribe
  }, [])

  const signOutUser = async () => {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AppContext.Provider
      value={{
        ...telegram,
        firebaseUser,
        firebaseReady,
        isAuthenticated,
        signOutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
