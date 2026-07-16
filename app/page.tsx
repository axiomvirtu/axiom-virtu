'use client'

import { useTelegramContext } from '@/app/providers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTonConnect } from '@/hooks/useTonConnect'
import { beginCell } from '@ton/core'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { Header } from './components/Header'
import { CategoryTabs } from './components/CategoryTabs'
import { CatalogCard } from './components/CatalogCard'
import { AssetCatalogRow, DbUser } from './components/types'

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
  capitalLimit?: number | string
  status?: string
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

// Icons are moved to Header.tsx

// Data structures
// Kategori didapatkan secara dinamis dari data

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

// fallbackCatalogs dihapus (menggunakan real data)
export default function Dashboard() {
  const router = useRouter()
  const { user, isReady, firebaseReady, isAuthenticated, isTelegram } = useTelegramContext()
  const { walletAddress, connectTonkeeper, error: walletError, sendTransaction } = useTonConnect()

  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [walletConnectError, setWalletConnectError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [buyResult, setBuyResult] = useState<'success' | 'fail' | null>(null)
  const [testModalData, setTestModalData] = useState<{ amountUsdt: number, tonPrice: number, amountTon: number } | null>(null)

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
        let userData: any = {}
        try {
          const userSnapshot = await getDoc(userRef)
          userData = userSnapshot.exists() ? userSnapshot.data() : {}
        } catch (userErr) {
          console.warn('[Dashboard] Could not fetch user doc:', userErr)
        }

        setDbUser({
          id: telegramId,
          telegram_id: telegramId,
          first_name: userData?.first_name ?? activeUser.first_name ?? '',
          last_name: userData?.last_name ?? activeUser.last_name ?? '',
          username: userData?.username ?? activeUser.username ?? '',
          photo_url: userData?.photo_url ?? activeUser.photo_url ?? '',
          wallet_address: userData?.wallet_address ?? null,
        })

        const unsubscribe = onSnapshot(collection(db, 'asset_catalogs'), (snapshot) => {
          const loadedCatalogs = snapshot.docs.map((docSnapshot, i) => {
            const data = docSnapshot.data() as FirestoreCatalog
            return {
              id: docSnapshot.id,
              name: data.name ?? `Asset ${i + 1}`,
              image_url: data.image_url ?? '/images/default.png',
              level_name: data.level_name ?? 'Level 1 Warehouse',
              capital_min: Number(data.capital_min ?? data.capitalLimit ?? 0),
              capital_max: Number(data.capital_max ?? data.capitalLimit ?? 0),
              ticket_time_start: data.ticket_time_start ?? '09:00',
              ticket_time_end: data.ticket_time_end ?? '12:00',
              trading_time_start: data.trading_time_start ?? '14:00',
              trading_time_end: data.trading_time_end ?? '16:00',
              order_index: Number(data.order_index ?? i),
              is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.status ? data.status === 'active' : true),
              contract_asset: data.contract_asset ?? '1 Day',
              profit: data.profit ?? '10%',
              is_multi: data.is_multi !== undefined ? Boolean(data.is_multi) : false,
              created_at: formatFirestoreDate(data.created_at),
              updated_at: formatFirestoreDate(data.updated_at),
            }
          })
          setCatalogs(loadedCatalogs)
          setLoading(false)
        }, (error) => {
          console.error('[Dashboard] Firestore onSnapshot error:', error)
          setCatalogs([])
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('[Dashboard] Firestore load error:', error)
        const fallbackId = user?.id ? String(user.id) : 'dev-user'
        setDbUser({ id: fallbackId, telegram_id: fallbackId })
        setCatalogs([])
        setLoading(false)
      }
    }

    let unsubscribeFunc: (() => void) | undefined
    
    async function runLoadDashboardData() {
      unsubscribeFunc = await loadDashboardData()
    }

    runLoadDashboardData()
    
    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc()
      }
    }
  }, [isReady, firebaseReady, isAuthenticated, isDevBypass, user, router])

  useEffect(() => {
    // Only used for processing UI states now
    let timer: NodeJS.Timeout
    if (buyModalOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [buyModalOpen, countdown])

  const handleBuyTicket = async (item: AssetCatalogRow) => {
    if (!connectedWallet) {
      console.log('Mode Testing: Wallet belum terkoneksi, simulasi diaktifkan.');
    }

    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
    if (!adminWallet && connectedWallet) {
      alert('Alamat wallet Admin belum diatur (NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)')
      return
    }

    setBuyModalOpen(true)
    setBuyResult(null)
    setCountdown(10) // Tampilkan UI loading sebentar (opsional)

    try {
      const amountUsdt = item.capital_min

      // 1. Fetch live TON price in USDT via Internal API (Bypass CORS)
      const response = await fetch('/api/ton-price')
      if (!response.ok) {
        throw new Error('Gagal mengambil harga pasar TON.')
      }
      const data = await response.json()
      const tonPrice = parseFloat(data.price)
      
      if (!tonPrice || isNaN(tonPrice)) {
        throw new Error('Gagal memvalidasi harga TON saat ini.')
      }

      // 2. Calculate TON amount
      const amountTon = amountUsdt / tonPrice
      
      // [MODE TESTING] Jika tidak ada wallet yang terkoneksi
      if (!connectedWallet) {
        setTestModalData({ amountUsdt, tonPrice, amountTon });
        setBuyModalOpen(false);
        setCountdown(0);
        return;
      }
      
      // 3. Convert to nanoTON (1 TON = 1,000,000,000 nanoTON)
      const nanoTonAmount = BigInt(Math.floor(amountTon * 1e9)).toString()
      
      // 4. Bangun struktur transaksi TonConnect (Native TON Transfer)
      const orderId = `VIRT-${Date.now().toString().slice(-6)}-${item.id.slice(0, 4)}`
      const body = beginCell()
        .storeUint(0, 32)
        .storeStringTail(orderId)
        .endCell()
      const payloadBase64 = body.toBoc().toString("base64")

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 5, // 5 menit expired
        messages: [
          {
            address: adminWallet, // Dikirim langsung ke wallet Admin
            amount: nanoTonAmount, // Jumlah TON yang setara dengan USDT
            payload: payloadBase64
          }
        ]
      }

      // 5. Kirim ke wallet untuk dikonfirmasi
      setCountdown(15) // Beri waktu countdown lebih lama untuk verifikasi
      const result = await sendTransaction(transaction)
      
      if (!result) {
        throw new Error('Transaksi dibatalkan')
      }

      // 6. Verifikasi ke Backend
      console.log('Memverifikasi transaksi ke blockchain...')
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amountTon: amountTon,
          adminWallet
        })
      });

      if (!verifyRes.ok) {
        throw new Error('Verifikasi gagal, transaksi tidak ditemukan di blockchain.')
      }

      console.log('Transaksi sukses diverifikasi oleh server!')
      setBuyResult('success')

    } catch (err: any) {
      console.error('Transaksi dibatalkan atau gagal', err)
      setBuyResult('fail')
    } finally {
      setCountdown(0)
    }
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

  const categories = Array.from(new Set(catalogs.filter(item => item.is_active).map(item => getCategoryName(item.level_name, item.name))))
  
  // Set default active category if none selected or if current selection is invalid
  useEffect(() => {
    // Note: We use JSON.stringify or length checks if needed, but here simple dependency is fine.
    // However, since `categories` is derived every render, we shouldn't pass it directly as a dependency 
    // unless we memoize it. To avoid infinite loops or stale closures, we can stringify it.
    const catString = JSON.stringify(categories)
    if (categories.length > 0 && (!activeCategory || !categories.includes(activeCategory))) {
      setActiveCategory(categories[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(categories), activeCategory])

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-800 border-t-[#7F00FF]"></div>
      </div>
    )
  }



  const activeItems = catalogs
    .filter((item) => item.is_active && getCategoryName(item.level_name, item.name) === activeCategory)
    .sort((a, b) => a.capital_min - b.capital_min)

  const usernameText = (dbUser?.username || user?.username || dbUser?.first_name || user?.first_name || 'username').toLowerCase()

  return (
    <main className="min-h-screen bg-black px-6 py-6 text-white safe-top safe-bottom overflow-y-auto">
      <Header 
        user={user} 
        dbUser={dbUser}
        connectedWallet={connectedWallet}
        connectingWallet={connectingWallet}
        walletConnectError={walletConnectError}
        walletError={walletError}
        onConnectWallet={handleConnectWallet}
      />

      <CategoryTabs 
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Category Content Cards */}
      <section className="pb-10">
        {activeItems.length > 0 ? (
          // Check layout type (single large card vs split list of cards)
          !activeItems[0].is_multi ? (
            activeItems.map((item) => (
              <CatalogCard 
                key={item.id} 
                item={item} 
                categoryName={getCategoryName(item.level_name, item.name)} 
                onBuy={handleBuyTicket} 
              />
            ))
          ) : (
            <div className="flex flex-col gap-6">
              {activeItems.map((item) => (
                <CatalogCard 
                  key={item.id} 
                  item={item} 
                  categoryName={getCategoryName(item.level_name, item.name)} 
                  onBuy={handleBuyTicket} 
                />
              ))}
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

      {/* Test Mode Modal */}
      {testModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0c] border border-[#7F00FF]/50 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_40px_rgba(127,0,255,0.2)] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-[#7F00FF]"></div>
            
            <h3 className="text-xl font-black text-white mb-2 flex items-center justify-center tracking-widest uppercase drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]">
              <span className="text-cyan-400 mr-2">🧪</span> Mode Simulasi
            </h3>
            <p className="text-cyan-400/80 text-xs mb-6 tracking-wide text-center uppercase">Bypass dompet untuk testing</p>
            
            <div className="space-y-4 mb-8 bg-white/5 rounded-2xl p-5 border border-white/5 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Harga Paket</span>
                <span className="text-white font-bold">{testModalData.amountUsdt} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">1 TON</span>
                <span className="text-cyan-400 font-bold">${testModalData.tonPrice.toFixed(2)}</span>
              </div>
              <div className="w-full h-px bg-white/10 my-1"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Tagihan (TON)</span>
                <span className="text-[#b026ff] font-black text-lg drop-shadow-[0_0_5px_rgba(176,38,255,0.5)]">{testModalData.amountTon.toFixed(4)} TON</span>
              </div>
            </div>
            
            <button 
              onClick={() => setTestModalData(null)}
              className="w-full bg-gradient-to-r from-[#7F00FF] to-cyan-500 text-white font-bold tracking-widest text-xs uppercase px-8 py-3.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(127,0,255,0.4)] relative z-10"
            >
              SELESAI
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
