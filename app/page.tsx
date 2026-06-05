'use client'

import { useTelegramContext } from '@/app/providers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTonConnect } from '@/hooks/useTonConnect'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'

// Tipe statis sementara
type AssetCatalogRow = {
  id: string
  name: string
  image_url: string
  level_name: string
  capital_min: number
  capital_max: number
  ticket_time_start: string
  ticket_time_end: string
  trading_time_start: string
  trading_time_end: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DbUser {
  id: string
  telegram_id: string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  wallet_address?: string | null
}

interface FirestoreCatalog {
  name?: string
  image_url?: string
  level_name?: string
  capital_min?: number | string
  capital_max?: number | string
  ticket_time_start?: string
  ticket_time_end?: string
  trading_time_start?: string
  trading_time_end?: string
  order_index?: number | string
  is_active?: boolean
  created_at?: unknown
  updated_at?: unknown
}

function formatFirestoreDate(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && 'toDate' in val) {
    const toDate = (val as { toDate: unknown }).toDate
    if (typeof toDate === 'function') {
      return (toDate.call(val) as Date).toISOString()
    }
  }
  return new Date().toISOString()
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isReady, firebaseReady, isAuthenticated, isTelegram } = useTelegramContext()
  const { walletAddress, connectTonkeeper, error: walletError } = useTonConnect()
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [walletConnectError, setWalletConnectError] = useState<string | null>(null)
  const connectedWallet = walletAddress ?? dbUser?.wallet_address ?? null
  const isDevBypass = !isTelegram && process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isReady || !firebaseReady) return

    if (!isAuthenticated && !isDevBypass) {
      router.replace('/auth')
      return
    }

    if (!user && !isDevBypass) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    const loadDashboardData = async () => {
      try {
        if (!db) {
          throw new Error('Firebase Firestore tidak tersedia di browser')
        }

        const activeUser = user ?? {
          id: 'dev-user',
          first_name: 'Developer',
          last_name: 'Local',
          username: 'dev',
          photo_url: '',
        }

        const telegramId = String(activeUser.id)
        const userRef = doc(db, 'users', telegramId)
        const userSnapshot = await getDoc(userRef)
        const userData = userSnapshot.exists() ? userSnapshot.data() : {}

        setDbUser({
          id: telegramId,
          telegram_id: telegramId,
          first_name: userData?.first_name ?? activeUser.first_name ?? '',
          last_name: userData?.last_name ?? activeUser.last_name ?? '',
          username: userData?.username ?? activeUser.username ?? '',
          photo_url: userData?.photo_url ?? activeUser.photo_url ?? '',
          wallet_address: userData?.wallet_address ?? null,
        })

        const snapshot = await getDocs(collection(db, 'asset_catalogs'))
        const loadedCatalogs = snapshot.docs.map((docSnapshot, i) => {
          const data = docSnapshot.data() as FirestoreCatalog
          return {
            id: docSnapshot.id,
            name: data.name ?? `Asset ${i + 1}`,
            image_url: data.image_url ?? '/images/default.png',
            level_name: data.level_name ?? 'Level 1 Warehouse',
            capital_min: Number(data.capital_min ?? 0),
            capital_max: Number(data.capital_max ?? 0),
            ticket_time_start: data.ticket_time_start ?? '09:00',
            ticket_time_end: data.ticket_time_end ?? '12:00',
            trading_time_start: data.trading_time_start ?? '14:00',
            trading_time_end: data.trading_time_end ?? '16:00',
            order_index: Number(data.order_index ?? i),
            is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
            created_at: formatFirestoreDate(data.created_at),
            updated_at: formatFirestoreDate(data.updated_at),
          }
        })

        setCatalogs(loadedCatalogs.length > 0 ? loadedCatalogs : [
          {
            id: 'mock-1',
            name: 'Virtu Spark V1',
            image_url: '/images/virtu-spark.png',
            level_name: 'Level 1 Warehouse',
            capital_min: 6.5,
            capital_max: 26,
            ticket_time_start: '09:00',
            ticket_time_end: '12:00',
            trading_time_start: '14:00',
            trading_time_end: '16:00',
            order_index: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-2',
            name: 'Virtu Spark V2',
            image_url: '/images/virtu-spark-v2.png',
            level_name: 'Level 2 Warehouse',
            capital_min: 6.5,
            capital_max: 26,
            ticket_time_start: '09:00',
            ticket_time_end: '12:00',
            trading_time_start: '20:00',
            trading_time_end: '22:00',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      } catch (error) {
        console.error('[Dashboard] Firestore load error:', error)
        const fallbackId = user?.id ? String(user.id) : 'dev-user'
        setDbUser({ id: fallbackId, telegram_id: fallbackId })
        setCatalogs([
          {
            id: 'mock-1',
            name: 'Virtu Spark V1',
            image_url: '/images/virtu-spark.png',
            level_name: 'Level 1 Warehouse',
            capital_min: 6.5,
            capital_max: 26,
            ticket_time_start: '09:00',
            ticket_time_end: '12:00',
            trading_time_start: '14:00',
            trading_time_end: '16:00',
            order_index: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-2',
            name: 'Virtu Spark V2',
            image_url: '/images/virtu-spark-v2.png',
            level_name: 'Level 2 Warehouse',
            capital_min: 6.5,
            capital_max: 26,
            ticket_time_start: '09:00',
            ticket_time_end: '12:00',
            trading_time_start: '20:00',
            trading_time_end: '22:00',
            order_index: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    async function runLoadDashboardData() {
      await loadDashboardData()
    }

    runLoadDashboardData()
  }, [isReady, firebaseReady, isAuthenticated, isDevBypass, user, router])

  async function handleConnectWallet() {
    if (!dbUser) return

    setConnectingWallet(true)
    setWalletConnectError(null)

    try {
      const address = await connectTonkeeper()
      if (!address) {
        throw new Error('Wallet connection canceled atau tidak ditemukan.')
      }

      if (!db) {
        throw new Error('Firebase Firestore tidak tersedia di browser')
      }
      if (!user) {
        throw new Error('Telegram user belum tersedia')
      }

      const telegramId = String(user.id)
      const userRef = doc(db, 'users', telegramId)
      await updateDoc(userRef, {
        wallet_address: address,
        updated_at: new Date(),
      })

      setDbUser({ ...dbUser, wallet_address: address })
    } catch (error: unknown) {
      setWalletConnectError(error instanceof Error ? error.message : 'Gagal menghubungkan wallet')
    } finally {
      setConnectingWallet(false)
    }
  }

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-2 border-t-accent-start"></div>
      </div>
    )
  }



  return (
    <main className="min-h-screen bg-app p-5 text-primary safe-top safe-bottom overflow-x-hidden">
      {/* Header Profile */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-border shadow-lg">
            {user?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-accent text-xl font-bold text-white">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight tracking-wide text-primary">
              Hello, {user?.first_name || 'User'}!
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-secondary">
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-success"></span>
                Online
              </div>
              <div className="rounded-full border border-surface-2 bg-surface-2 px-2 py-1 text-[11px] text-primary">
                {isAuthenticated ? 'Firebase signed in' : isDevBypass ? 'Dev mode' : 'Not signed in'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connectedWallet ? (
            <div className="rounded-2xl border border-surface-2 bg-surface px-3 py-2 text-sm text-primary shadow-sm">
              {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-6)}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectWallet}
              disabled={connectingWallet}
              className="rounded-2xl bg-accent-start px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-end active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connectingWallet ? 'Connecting...' : 'Connect TON'
              }
            </button>
          )}
          <Link href="/admin/catalog" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-xl shadow-sm transition-colors hover:bg-surface-hover active:scale-95">
            ⚙️
          </Link>
        </div>
      </header>

      {(walletConnectError || walletError) && (
        <div className="mb-6 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {walletConnectError || walletError}
        </div>
      )}

      {/* Header Profile */}

      {/* Quick Actions */}
      <div className="mb-10 flex justify-center gap-8">
        {[
          { icon: '💱', label: 'Swap IDR' },
          { icon: '📜', label: 'History' },
        ].map((action, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <button className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-surface-2 text-2xl shadow-sm transition-transform hover:bg-surface-hover active:scale-90">
              {action.icon}
            </button>
            <span className="text-[11px] font-semibold tracking-wide text-secondary">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Katalog Aset */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between px-1">
          <h3 className="text-lg font-bold tracking-wide text-primary">Asset Catalog</h3>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 px-1 -mx-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {catalogs.length > 0 ? catalogs.map((cat, i) => (
            <div key={cat.id} className="relative min-w-[85vw] sm:min-w-[300px] shrink-0 snap-center overflow-hidden rounded-[24px] p-[1px] glow-accent">
              <div className={`absolute inset-0 ${i % 2 === 0 ? 'gradient-accent' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
              <div className="relative h-full w-full rounded-[23px] bg-surface p-1">
                <div className={`absolute -left-6 -top-6 h-32 w-32 rounded-full ${i % 2 === 0 ? 'bg-accent-end/20' : 'bg-blue-500/20'} blur-2xl`}></div>
                <div className={`absolute -right-6 bottom-10 h-32 w-32 rounded-full ${i % 2 === 0 ? 'bg-accent-start/20' : 'bg-purple-500/20'} blur-2xl`}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-full rounded-t-[22px] bg-surface-2/60 py-3 text-center border-b border-border/50 backdrop-blur-sm">
                    <h4 className="text-xl font-extrabold tracking-widest text-primary uppercase drop-shadow-md">{cat.name}</h4>
                  </div>
                  
                  <div className="w-full px-4 py-8 flex justify-center">
                    <div className="relative w-[70%] max-w-[220px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 glow-accent group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={cat.image_url} 
                        alt={cat.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute bottom-3 left-0 right-0 text-center z-20">
                        <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">{cat.level_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full px-5 pb-5 pt-2 flex flex-col items-center">
                    <div className="mb-4 flex flex-col items-center w-full rounded-2xl bg-surface-2/40 border border-white/5 p-4 backdrop-blur-sm">
                       <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1">Est. Starting Capital</p>
                       <p className="text-lg font-black text-primary">
                         <span className={i % 2 === 0 ? 'text-info' : 'text-purple-400'}>{cat.capital_min}</span> 
                         <span className="text-sm font-medium text-secondary mx-2">to</span> 
                         <span className={i % 2 === 0 ? 'text-accent-end' : 'text-blue-400'}>{cat.capital_max}</span> 
                         <span className="text-base ml-1">TON</span>
                       </p>
                    </div>

                    <div className="mb-5 w-full rounded-2xl bg-surface-2/40 border border-white/5 p-4 backdrop-blur-sm">
                       <h5 className="text-[11px] font-bold uppercase tracking-widest text-secondary mb-3 text-center border-b border-white/5 pb-2">Trading Schedule</h5>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-medium text-secondary">Ticket Purchase</span>
                         <span className={`text-xs font-bold ${i % 2 === 0 ? 'text-info' : 'text-purple-400'}`}>{cat.ticket_time_start} - {cat.ticket_time_end} (UTC+7)</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-medium text-secondary">Asset Trading</span>
                         <span className={`text-xs font-bold ${i % 2 === 0 ? 'text-accent-end' : 'text-blue-400'}`}>{cat.trading_time_start} - {cat.trading_time_end} (UTC+7)</span>
                       </div>
                    </div>

                    <button className={`w-full rounded-xl py-4 text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:brightness-110 active:scale-95 ${i % 2 === 0 ? 'gradient-accent' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}>
                      Buy Ticket Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="w-full text-center py-10 text-secondary">No active catalog found.</div>
          )}
        </div>
      </section>

    </main>
  )
}
