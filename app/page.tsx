'use client'

import { useTelegramContext } from '@/app/providers'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { UserRow, AssetRow, AssetCatalogRow } from '@/lib/supabase/types'
import { formatIDR, formatTon } from '@/lib/constants'

export default function Dashboard() {
  const { tg, user, isReady } = useTelegramContext()
  const [dbUser, setDbUser] = useState<UserRow | null>(null)
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [catalogs, setCatalogs] = useState<AssetCatalogRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return
      
      const supabase = createClient() as any
      
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.id)
        .single()
        
      if (userData) {
        setDbUser(userData)
        
        const { data: assetData } = await supabase
          .from('assets')
          .select('*')
          .eq('owner_id', userData.id)
          .neq('status', 'cancelled')
          
        if (assetData) {
          setAssets(assetData)
        }

        const { data: catalogData, error: catalogError } = await supabase
          .from('asset_catalogs')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          
        if (catalogError || !catalogData || catalogData.length === 0) {
          // Fallback mock data jika tabel belum ada
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
            } as AssetCatalogRow,
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
              updated_at: new Date().toISOString()
            } as AssetCatalogRow
          ])
        } else {
          setCatalogs(catalogData)
        }
      }
      
      setLoading(false)
    }

    if (isReady && user) {
      fetchDashboardData()
    } else if (isReady) {
      setLoading(false) 
    }
  }, [isReady, user])

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
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-border shadow-lg">
            {user?.photo_url ? (
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
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-success"></span>
              <p className="text-xs font-medium text-secondary">
                Online
              </p>
            </div>
          </div>
        </div>
        <Link href="/admin/catalog" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-xl shadow-sm transition-colors hover:bg-surface-hover active:scale-95">
          ⚙️
        </Link>
      </header>

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
