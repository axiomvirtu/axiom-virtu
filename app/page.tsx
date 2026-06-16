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
  contract_asset: string
  profit: string
  is_multi: boolean
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
  contract_asset?: string
  profit?: string
  is_multi?: boolean
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

// Icons
function ExchangeIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Green circular loop arrows */}
      <path d="M12 20C12 14.4772 16.4772 10 22 10C24.3166 10 26.4411 10.7874 28.1428 12.1111" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M16 12L22 10L16 6" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      <path d="M36 28C36 33.5228 31.5228 38 26 38C23.6834 38 21.5589 37.2126 19.8572 35.8889" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 36L26 38L32 42" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Euro Circle (Pink/Purple) */}
      <circle cx="18" cy="18" r="8" fill="#EC4899" />
      <text x="18" y="21.5" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">€</text>

      {/* Dollar Circle (Yellow/Gold) */}
      <circle cx="30" cy="30" r="8" fill="#FBBF24" />
      <text x="30" y="33.5" fill="black" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">$</text>
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Notepad paper */}
      <rect x="14" y="8" width="20" height="32" rx="3" fill="#FDE047" stroke="#374151" strokeWidth="2.5" />
      {/* Horizontal lines on paper */}
      <line x1="18" y1="16" x2="30" y2="16" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="22" x2="30" y2="22" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="28" x2="30" y2="28" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="34" x2="26" y2="34" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      {/* Pencil */}
      <g transform="translate(30, 12) rotate(15)">
        <path d="M0 0 L4 0 L4 18 L2 22 L0 18 Z" fill="#EC4899" stroke="#374151" strokeWidth="1.5" />
        <path d="M0 18 L2 22 L4 18 Z" fill="#F3F4F6" />
        <circle cx="2" cy="21" r="0.8" fill="black" />
      </g>
    </svg>
  )
}

// Data structures
const categories = ['Nova Apex', 'Chrono Shift', 'Aether Pulse', 'Axiom Core', 'Virtu Spark']

function getCategoryName(levelName: string, name: string): string {
  const ln = levelName.toLowerCase()
  const n = name.toLowerCase()
  if (ln.includes('nova apex') || n.includes('apex titan')) return 'Nova Apex'
  if (ln.includes('chrono shift') || n.includes('chronos vortex')) return 'Chrono Shift'
  if (ln.includes('aether pulse') || n.includes('pulse horizon')) return 'Aether Pulse'
  if (ln.includes('axiom core') || n.includes('nexus') || n.includes('prime')) return 'Axiom Core'
  if (ln.includes('virtu spark') || n.includes('alpha') || n.includes('beta')) return 'Virtu Spark'
  return 'Virtu Spark'
}

// CATEGORY_DETAILS has been replaced by dynamic database fields.

const fallbackCatalogs: AssetCatalogRow[] = [
  {
    id: 'mock-spark-alpha',
    name: 'Spark Alpha',
    image_url: '/images/virtu-spark.png',
    level_name: 'Virtu Spark - Sesi 1',
    capital_min: 10.00,
    capital_max: 39.99,
    ticket_time_start: '09:00',
    ticket_time_end: '11:00',
    trading_time_start: '12:00',
    trading_time_end: '14:00',
    order_index: 0,
    is_active: true,
    contract_asset: '1 Day',
    profit: '10%',
    is_multi: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-spark-beta',
    name: 'Spark Beta',
    image_url: '/images/virtu-spark.png',
    level_name: 'Virtu Spark - Sesi 2',
    capital_min: 10.00,
    capital_max: 39.99,
    ticket_time_start: '09:00',
    ticket_time_end: '11:00',
    trading_time_start: '18:00',
    trading_time_end: '20:00',
    order_index: 1,
    is_active: true,
    contract_asset: '1 Day',
    profit: '10%',
    is_multi: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-axiom-nexus',
    name: 'Core Nexus',
    image_url: '/images/axiom-core.png',
    level_name: 'Axiom Core - Sesi 1',
    capital_min: 40.00,
    capital_max: 99.99,
    ticket_time_start: '09:00',
    ticket_time_end: '11:00',
    trading_time_start: '14:00',
    trading_time_end: '16:00',
    order_index: 2,
    is_active: true,
    contract_asset: '1 Day',
    profit: '10%',
    is_multi: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-apex-titan',
    name: 'Apex Titan',
    image_url: '/images/nova-apex.png',
    level_name: 'Nova Apex',
    capital_min: 800.00,
    capital_max: 2500.00,
    ticket_time_start: '09:00',
    ticket_time_end: '11:00',
    trading_time_start: '21:00',
    trading_time_end: '23:00',
    order_index: 6,
    is_active: true,
    contract_asset: '1 Month',
    profit: '8%',
    is_multi: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

export default function Dashboard() {
  const router = useRouter()
  const { user, isReady, firebaseReady, isAuthenticated, isTelegram } = useTelegramContext()
  const { walletAddress, connectTonkeeper, error: walletError } = useTonConnect()
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [walletConnectError, setWalletConnectError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Nova Apex')
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [buyResult, setBuyResult] = useState<'success' | 'fail' | null>(null)

  const connectedWallet = walletAddress ?? dbUser?.wallet_address ?? null
  const isDevBypass = !isTelegram && process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isReady || !firebaseReady) return

    if (!isAuthenticated && !isDevBypass) {
      router.replace('/auth')
      return
    }

    if (!user && !isDevBypass) return

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
            contract_asset: data.contract_asset ?? '1 Day',
            profit: data.profit ?? '10%',
            is_multi: data.is_multi !== undefined ? Boolean(data.is_multi) : false,
            created_at: formatFirestoreDate(data.created_at),
            updated_at: formatFirestoreDate(data.updated_at),
          }
        })

        setCatalogs(loadedCatalogs.length > 0 ? loadedCatalogs : fallbackCatalogs)
      } catch (error) {
        console.error('[Dashboard] Firestore load error:', error)
        const fallbackId = user?.id ? String(user.id) : 'dev-user'
        setDbUser({ id: fallbackId, telegram_id: fallbackId })
        setCatalogs(fallbackCatalogs)
      } finally {
        setLoading(false)
      }
    }

    async function runLoadDashboardData() {
      await loadDashboardData()
    }

    runLoadDashboardData()
  }, [isReady, firebaseReady, isAuthenticated, isDevBypass, user, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (buyModalOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (buyModalOpen && countdown === 0 && buyResult === null) {
      // Simulate war outcome
      const isLucky = Math.random() > 0.5 // 50% chance
      setBuyResult(isLucky ? 'success' : 'fail')
    }
    return () => clearTimeout(timer)
  }, [buyModalOpen, countdown, buyResult])

  const handleBuyTicket = () => {
    setBuyModalOpen(true)
    setCountdown(10)
    setBuyResult(null)
  }

  const closeBuyModal = () => {
    setBuyModalOpen(false)
    setCountdown(0)
    setBuyResult(null)
  }

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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-800 border-t-[#7F00FF]"></div>
      </div>
    )
  }

  // Group and filter items based on the active tab/category, and sort from smallest to largest price
  const activeItems = catalogs
    .filter((item) => getCategoryName(item.level_name, item.name) === activeCategory)
    .sort((a, b) => a.capital_min - b.capital_min)

  const usernameText = (dbUser?.username || user?.username || dbUser?.first_name || user?.first_name || 'username').toLowerCase()

  return (
    <main className="min-h-screen bg-black px-6 py-6 text-white safe-top safe-bottom overflow-y-auto">
      {/* Header Profile */}
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white rounded-full flex-shrink-0 shadow-md">
            {user?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
            ) : null}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-medium tracking-wide text-white leading-none">
              hello, {usernameText} !
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 bg-[#00FF00] rounded-full inline-block"></span>
              <span className="text-xs text-white">Online</span>
            </div>
          </div>
        </div>

        {/* Settings gear link */}
        <Link
          href="/admin/catalog"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white shadow-sm transition-all active:scale-90"
        >
          ⚙️
        </Link>
      </header>

      {/* Wallet Connect Error Display */}
      {(walletConnectError || walletError) && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {walletConnectError || walletError}
        </div>
      )}

      {/* Connect TON Button */}
      <div className="mb-8">
        {connectedWallet ? (
          <div className="w-full bg-[#7F00FF] py-3.5 px-6 rounded-full text-center text-white font-semibold tracking-wide shadow-md shadow-[#7F00FF]/20 flex items-center justify-center gap-2">
            <span>TON Connected:</span>
            <span className="font-bold">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-6)}</span>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={connectingWallet}
            className="w-full bg-[#7F00FF] py-3.5 px-6 rounded-full text-center text-white font-semibold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-98 shadow-md shadow-[#7F00FF]/25 disabled:opacity-60"
          >
            {connectingWallet ? 'Connecting...' : 'Connect TON'}
          </button>
        )}
      </div>

      {/* Quick Actions Row */}
      <div className="flex items-start justify-around mb-8 max-w-sm mx-auto">
        {/* Exchange */}
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <ExchangeIcon />
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center">Exchange</span>
        </div>
        {/* Axiom Virtu Channel */}
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[9px] font-black text-black tracking-tighter">AV</span>
            </div>
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center max-w-[80px] leading-tight">
            Axiom Virtu Channel
          </span>
        </div>
        {/* History */}
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <HistoryIcon />
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center">History</span>
        </div>
      </div>

      {/* Horizontal Category Tabs */}
      <div className="mb-6 overflow-x-auto scrollbar-none -mx-6 px-6">
        <div className="flex gap-2.5 pb-2">
          {categories.map((catName) => {
            const isActive = activeCategory === catName
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${isActive
                    ? 'bg-[#7F00FF] text-white shadow-lg shadow-[#7F00FF]/30 scale-102'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                {catName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Decorative Diamond Section Header */}
      <div className="relative flex items-center mb-6 mt-2 w-full">
        <div className="flex flex-col w-full">
          <div className="text-xl font-semibold tracking-wide text-white mb-2 pl-1">
            {activeCategory}
          </div>
          <div className="relative flex items-center w-[60%]">
            {/* Left empty diamond */}
            <div className="w-2.5 h-2.5 rotate-45 border border-white bg-black shrink-0 -ml-1"></div>
            {/* Horizontal divider line */}
            <div className="flex-grow h-[1px] bg-white"></div>
            {/* Right empty diamond */}
            <div className="w-2.5 h-2.5 rotate-45 border border-white bg-black shrink-0 -mr-1"></div>
          </div>
        </div>
      </div>

      {/* Category Content Cards */}
      <section className="pb-10">
        {activeItems.length > 0 ? (
          // Check layout type (single large card vs split list of cards)
          !activeItems[0].is_multi ? (
            // Layout Kartu Tunggal (Nova Apex, Chrono Shift, Aether Pulse)
            activeItems.map((item) => {
              return (
                <div key={item.id} className="flex flex-col items-center">
                  {/* Cyberpunk 3D Purple Banner Area */}
                  <div className="w-full aspect-[1.8/1] rounded-[32px] mb-6 relative overflow-hidden bg-[#7F00FF] border-2 border-[#b026ff] shadow-[0_0_20px_rgba(176,38,255,0.6),inset_0_0_30px_rgba(255,255,255,0.3)] transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(176,38,255,0.8),inset_0_0_40px_rgba(255,255,255,0.4)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Card Title */}
                  <h2 className="text-xl font-bold tracking-widest text-white mb-5 uppercase text-center drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]">
                    {item.name}
                  </h2>

                  {/* Details Bullet List */}
                  <ul className="text-white text-[13px] font-normal leading-relaxed tracking-wide space-y-2.5 pl-6 list-disc mb-6 max-w-xs self-start sm:self-center">
                    <li>
                      <span className="font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Start Capital :</span> {item.capital_min} - {item.capital_max} TON
                    </li>
                    <li>
                      <span className="font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Ticket Purchase :</span> {item.ticket_time_start} - {item.ticket_time_end} ( UTC+7 )
                    </li>
                    <li>
                      <span className="font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Asset Trading :</span> {item.trading_time_start} - {item.trading_time_end} ( UTC+7 )
                    </li>
                    <li>
                      <span className="font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Contract Asset :</span> {item.contract_asset}
                    </li>
                    <li>
                      <span className="font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Profit :</span> {item.profit}
                    </li>
                  </ul>

                  {/* Buy Button */}
                  <button onClick={handleBuyTicket} className="bg-gradient-to-r from-[#7F00FF] to-[#b026ff] text-white font-bold tracking-widest text-xs uppercase px-12 py-3 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(176,38,255,0.8)] hover:shadow-[0_0_25px_rgba(176,38,255,1)] hover:brightness-125 border border-white/20">
                    BUY TICKET NOW
                  </button>
                </div>
              )
            })
          ) : (
            // Layout Kartu Ganda Bertumpuk (Axiom Core, Virtu Spark)
            <div className="flex flex-col gap-6">
              {activeItems.map((item) => {
                return (
                  <div key={item.id} className="flex gap-4 items-start w-full bg-[#0a0a0c] border border-[#7F00FF]/30 p-4 rounded-[28px] shadow-[0_4px_20px_rgba(127,0,255,0.15)] relative overflow-hidden">
                    {/* Cyberpunk Grid Background */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    
                    {/* Left: Cyberpunk Purple square placeholder */}
                    <div className="w-28 h-28 bg-[#7F00FF] border border-[#b026ff] rounded-[24px] flex-shrink-0 shadow-[0_0_15px_rgba(176,38,255,0.5),inset_0_0_20px_rgba(255,255,255,0.2)] relative z-10"></div>
                    
                    {/* Right: details and button */}
                    <div className="flex flex-col flex-grow min-w-0 relative z-10">
                      <h3 className="text-sm font-bold tracking-wider text-white mb-2 uppercase drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]">
                        {item.name}
                      </h3>
                      
                      <ul className="text-white text-[10px] font-normal leading-relaxed space-y-1.5 pl-4 list-disc mb-3">
                        <li>
                          <span className="font-semibold text-cyan-400">Start Capital :</span> {item.capital_min} - {item.capital_max} TON
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-400">Ticket Purchase :</span> {item.ticket_time_start} - {item.ticket_time_end} ( UTC+7 )
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-400">Asset Trading :</span> {item.trading_time_start} - {item.trading_time_end} ( UTC+7 )
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-400">Contract Asset :</span> {item.contract_asset}
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-400">Profit :</span> {item.profit}
                        </li>
                      </ul>
                      
                      <div>
                        <button onClick={handleBuyTicket} className="bg-gradient-to-r from-[#7F00FF] to-[#b026ff] text-white font-bold tracking-widest text-[9px] uppercase px-5 py-2 rounded-full transition-all active:scale-95 shadow-[0_0_10px_rgba(176,38,255,0.8)] hover:shadow-[0_0_15px_rgba(176,38,255,1)] hover:brightness-125 border border-white/20">
                          BUY TICKET NOW
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div className="w-full text-center py-10 text-secondary">
            No items found in this category.
          </div>
        )}
      </section>

      {/* Countdown / War Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-[#0a0a0c] border border-[#7F00FF] p-8 rounded-[32px] w-full max-w-sm text-center shadow-[0_0_40px_rgba(127,0,255,0.3)] relative overflow-hidden flex flex-col items-center">
            {/* Cyberpunk Grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            {buyResult === null ? (
              <>
                <h3 className="text-xl font-bold text-white mb-6 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]">Waiting for Allocation</h3>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#b026ff] drop-shadow-[0_0_15px_rgba(176,38,255,1)] mb-8">
                  {countdown}
                </div>
                <p className="text-xs text-cyan-400 tracking-wide">Processing your request...</p>
              </>
            ) : buyResult === 'success' ? (
              <>
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">SUCCESS</h3>
                <p className="text-sm text-white/80 mb-8">You successfully got the product!</p>
                <button onClick={closeBuyModal} className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold tracking-widest text-xs uppercase px-8 py-3 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                  CLOSE
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                  <span className="text-4xl">✗</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">SORRY NOT LUCKY</h3>
                <p className="text-sm text-white/80 mb-8">Out of stock or allocation failed.</p>
                <button onClick={closeBuyModal} className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold tracking-widest text-xs uppercase px-8 py-3 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                  CLOSE
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
