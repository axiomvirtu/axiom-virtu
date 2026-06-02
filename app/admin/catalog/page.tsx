'use client'

import { useState, useEffect } from 'react'
import { useTelegramContext } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, doc, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

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
  created_at?: string
  updated_at?: string
}

interface FirestoreCatalogData {
  name?: string
  image_url?: string
  level_name?: string
  capital_min?: number
  capital_max?: number
  ticket_time_start?: string
  ticket_time_end?: string
  trading_time_start?: string
  trading_time_end?: string
  order_index?: number
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

export default function AdminCatalogPage() {
  const { isReady, firebaseReady, isAuthenticated, isTelegram } = useTelegramContext()
  const router = useRouter()
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const isDevBypass = !isTelegram && process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isReady || !firebaseReady) return

    if (!isAuthenticated && !isDevBypass) {
      router.replace('/auth')
      return
    }

    async function fetchCatalogs() {
      if (!db) {
        setCatalogs([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const snapshot = await getDocs(collection(db, 'asset_catalogs'))
        const loaded = snapshot.docs.map((catalogDoc) => {
          const data = catalogDoc.data() as FirestoreCatalogData
          return {
            id: catalogDoc.id,
            name: data.name ?? '',
            image_url: data.image_url ?? '/images/default.png',
            level_name: data.level_name ?? '',
            capital_min: Number(data.capital_min ?? 0),
            capital_max: Number(data.capital_max ?? 0),
            ticket_time_start: data.ticket_time_start ?? '09:00',
            ticket_time_end: data.ticket_time_end ?? '12:00',
            trading_time_start: data.trading_time_start ?? '14:00',
            trading_time_end: data.trading_time_end ?? '16:00',
            order_index: Number(data.order_index ?? 0),
            is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
            created_at: formatFirestoreDate(data.created_at),
            updated_at: formatFirestoreDate(data.updated_at),
          } as AssetCatalogRow
        })

        setCatalogs(loaded)
      } catch (error) {
        console.error('[AdminCatalog] fetchCatalogs error', error)
        setCatalogs([])
      } finally {
        setLoading(false)
      }
    }

    async function checkAdminAndFetchData() {
      if (!db) {
        setLoading(false)
        return
      }

      await fetchCatalogs()
    }

    checkAdminAndFetchData()
  }, [isReady, firebaseReady, isAuthenticated, isDevBypass, router])

  const handleInputChange = (id: string, field: keyof AssetCatalogRow, value: AssetCatalogRow[keyof AssetCatalogRow]) => {
    setCatalogs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSave = async (catalog: AssetCatalogRow) => {
    if (!db) {
      alert('Firebase Firestore tidak tersedia')
      return
    }

    setSaving(true)

    try {
      if (catalog.id.startsWith('mock-')) {
        const newDoc = await addDoc(collection(db, 'asset_catalogs'), {
          name: catalog.name,
          image_url: catalog.image_url,
          level_name: catalog.level_name,
          capital_min: catalog.capital_min,
          capital_max: catalog.capital_max,
          ticket_time_start: catalog.ticket_time_start,
          ticket_time_end: catalog.ticket_time_end,
          trading_time_start: catalog.trading_time_start,
          trading_time_end: catalog.trading_time_end,
          order_index: catalog.order_index,
          is_active: catalog.is_active,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })

        setCatalogs((prev) => prev.map((item) => item.id === catalog.id ? {
          ...item,
          id: newDoc.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : item))
      } else {
        const catalogRef = doc(db, 'asset_catalogs', catalog.id)
        await updateDoc(catalogRef, {
          name: catalog.name,
          image_url: catalog.image_url,
          level_name: catalog.level_name,
          capital_min: catalog.capital_min,
          capital_max: catalog.capital_max,
          ticket_time_start: catalog.ticket_time_start,
          ticket_time_end: catalog.ticket_time_end,
          trading_time_start: catalog.trading_time_start,
          trading_time_end: catalog.trading_time_end,
          order_index: catalog.order_index,
          is_active: catalog.is_active,
          updated_at: serverTimestamp(),
        })

        setCatalogs((prev) => prev.map((item) => item.id === catalog.id ? {
          ...item,
          updated_at: new Date().toISOString(),
        } : item))
      }

      alert('Catalog berhasil disimpan')
    } catch (error) {
      console.error('[AdminCatalog] handleSave error', error)
      alert('Gagal menyimpan catalog. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNew = async () => {
    const placeholder: Omit<AssetCatalogRow, 'id' | 'created_at' | 'updated_at'> = {
      name: 'New Asset',
      image_url: '/images/default.png',
      level_name: 'Level X',
      capital_min: 0,
      capital_max: 0,
      ticket_time_start: '09:00',
      ticket_time_end: '12:00',
      trading_time_start: '14:00',
      trading_time_end: '16:00',
      order_index: catalogs.length,
      is_active: true,
    }

    const mockNew = {
      ...placeholder,
      id: 'mock-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as AssetCatalogRow

    setCatalogs((prev) => [...prev, mockNew])
  }

  if (!isReady || loading) {
    return <div className="p-8 text-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-app p-5 text-primary safe-top safe-bottom pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Manage Asset Catalog</h1>
        <button onClick={() => router.push('/')} className="text-sm text-secondary underline">Back to Dashboard</button>
      </div>

      <button 
        onClick={handleAddNew}
        className="mb-6 w-full rounded-xl gradient-accent py-3 font-bold text-white shadow-lg"
      >
        + Add New Asset Catalog
      </button>

      <div className="space-y-6">
        {catalogs.map((catalog) => (
          <div key={catalog.id} className="bg-surface rounded-2xl p-4 border border-white/10">
            <div className="grid gap-4 mb-4">
              <div>
                <label className="text-xs text-secondary mb-1 block">Asset Name</label>
                <input 
                  type="text" 
                  value={catalog.name} 
                  onChange={(e) => handleInputChange(catalog.id, 'name', e.target.value)}
                  className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">Min Capital (TON)</label>
                  <input 
                    type="number" 
                    value={catalog.capital_min} 
                    onChange={(e) => handleInputChange(catalog.id, 'capital_min', parseFloat(e.target.value))}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Max Capital (TON)</label>
                  <input 
                    type="number" 
                    value={catalog.capital_max} 
                    onChange={(e) => handleInputChange(catalog.id, 'capital_max', parseFloat(e.target.value))}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">Ticket Start (WIB/UTC+7)</label>
                  <input 
                    type="time" 
                    value={catalog.ticket_time_start} 
                    onChange={(e) => handleInputChange(catalog.id, 'ticket_time_start', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Ticket End (WIB/UTC+7)</label>
                  <input 
                    type="time" 
                    value={catalog.ticket_time_end} 
                    onChange={(e) => handleInputChange(catalog.id, 'ticket_time_end', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">Trading Start (WIB/UTC+7)</label>
                  <input 
                    type="time" 
                    value={catalog.trading_time_start} 
                    onChange={(e) => handleInputChange(catalog.id, 'trading_time_start', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Trading End (WIB/UTC+7)</label>
                  <input 
                    type="time" 
                    value={catalog.trading_time_end} 
                    onChange={(e) => handleInputChange(catalog.id, 'trading_time_end', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-1 block">Image URL</label>
                  <input 
                    type="text" 
                    value={catalog.image_url} 
                    onChange={(e) => handleInputChange(catalog.id, 'image_url', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-1 block">Level Name</label>
                  <input 
                    type="text" 
                    value={catalog.level_name} 
                    onChange={(e) => handleInputChange(catalog.id, 'level_name', e.target.value)}
                    className="w-full bg-surface-2 p-2 rounded border border-white/5 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={catalog.is_active} 
                  onChange={(e) => handleInputChange(catalog.id, 'is_active', e.target.checked)}
                />
                <label className="text-sm text-secondary">Is Active</label>
              </div>
            </div>

            <button 
              onClick={() => handleSave(catalog)}
              disabled={saving}
              className="w-full bg-success text-white py-2 rounded-lg font-bold text-sm hover:brightness-110"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ))}
        {catalogs.length === 0 && (
          <p className="text-center text-secondary">No catalogs found. Add one above.</p>
        )}
      </div>
    </div>
  )
}
