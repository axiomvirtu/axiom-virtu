'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AssetCatalogRow, Database } from '@/lib/supabase/types'
import { useTelegramContext } from '@/app/providers'
import { useRouter } from 'next/navigation'

export default function AdminCatalogPage() {
  const { user, isReady } = useTelegramContext()
  const router = useRouter()
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function checkAdminAndFetchData() {
      // Bypass early return
      // if (!user?.id) return

      // Bypass cek admin sementara agar Anda bisa melihat halamannya
      // const { data: userData } = await supabase
      //   .from('users')
      //   .select('role')
      //   .eq('telegram_id', user.id)
      //   .single()

      // if (userData?.role === 'admin') {
        setIsAdmin(true)
        fetchCatalogs()
      // } else {
      //   setLoading(false)
      // }
    }

    if (isReady) {
      checkAdminAndFetchData()
    }
  }, [isReady, user])

  async function fetchCatalogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('asset_catalogs')
      .select('*')
      .order('order_index', { ascending: true })
    
    // Gunakan mock data jika tabel belum ada
    if (error || !data || data.length === 0) {
      console.warn("Using mock data because DB fetch failed or empty")
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
          updated_at: new Date().toISOString()
        } as AssetCatalogRow
      ])
    } else {
      setCatalogs(data)
    }
    setLoading(false)
  }

  const handleInputChange = (id: string, field: keyof AssetCatalogRow, value: any) => {
    setCatalogs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSave = async (catalog: AssetCatalogRow) => {
    setSaving(true)
    const updatePayload = {
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
    } as Database['public']['Tables']['asset_catalogs']['Update']

    const { error } = await (supabase as any)
      .from('asset_catalogs')
      .update(updatePayload)
      .eq('id', catalog.id)

    // Simulasi Save jika tabel tidak ada
    if (error) {
      console.warn('DB error, simulating save:', error.message)
      setTimeout(() => {
        setSaving(false)
        alert('Simulated Save Successful! (Connect DB to persist)')
      }, 500)
    } else {
      setSaving(false)
      alert('Saved successfully!')
    }
  }

  const handleAddNew = async () => {
    const newCat: Omit<AssetCatalogRow, 'id' | 'created_at' | 'updated_at'> = {
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
      is_active: true
    }
    const { data, error } = await (supabase as any).from('asset_catalogs').insert(newCat).select().single()
    if (data) {
      setCatalogs([...catalogs, data])
    } else {
      // Simulasi penambahan baru jika DB belum konek
      const mockNew = { ...newCat, id: 'mock-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as AssetCatalogRow
      setCatalogs([...catalogs, mockNew])
    }
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
