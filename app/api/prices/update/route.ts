/**
 * app/api/prices/update/route.ts
 *
 * Route Handler: GET /api/prices/update
 *
 * Cron Job endpoint — dipanggil oleh Cloudflare Workers Cron
 * (atau Vercel Cron / Supabase Edge Function) setiap 1 menit.
 *
 * Alur:
 * 1. Verifikasi header Authorization (cron secret)
 * 2. Fetch kurs TON/IDR dari CoinGecko
 * 3. Hitung harga Beli & Jual dengan spread flat Rp2.000
 * 4. Upsert ke tabel public.prices
 * 5. Hapus data harga yang sudah > 1 hari (cleanup)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const COINGECKO_API_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=idr'

const SPREAD_IDR = Number(process.env.NEXT_PUBLIC_MC_SPREAD_IDR ?? 2000)
const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function GET(req: NextRequest) {
  // ── 1. Verifikasi cron secret ───────────────────────────────
  const authHeader = req.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── 2. Fetch harga dari CoinGecko ───────────────────────────
    const cgRes = await fetch(COINGECKO_API_URL, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY ?? '',
        'Accept':            'application/json',
      },
      // Tidak di-cache agar selalu fresh
      cache: 'no-store',
    })

    if (!cgRes.ok) {
      throw new Error(`CoinGecko error: ${cgRes.status} ${cgRes.statusText}`)
    }

    const cgData = await cgRes.json() as {
      'the-open-network': { idr: number }
    }

    const marketPrice = cgData['the-open-network']?.idr
    if (!marketPrice || typeof marketPrice !== 'number') {
      throw new Error('Format respons CoinGecko tidak valid')
    }

    // ── 3. Hitung harga dengan spread flat ─────────────────────
    // Beli TON (user beli dari admin): market + spread = Rp81.000
    // Jual TON (user jual ke admin):   market - spread = Rp79.000
    const buyPrice  = marketPrice + SPREAD_IDR
    const sellPrice = marketPrice - SPREAD_IDR

    // ── 4. Insert ke tabel prices ───────────────────────────────
    const supabase = (await createAdminClient()) as any

    const { error: insertError } = await supabase
      .from('prices')
      .insert({
        ton_idr_market: marketPrice.toString(),
        ton_idr_buy:    buyPrice.toString(),
        ton_idr_sell:   sellPrice.toString(),
        source:         'coingecko',
      })

    if (insertError) {
      throw new Error(`Supabase insert error: ${insertError.message}`)
    }

    // ── 5. Cleanup harga > 1 hari ───────────────────────────────
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('prices')
      .delete()
      .lt('fetched_at', oneDayAgo)

    return NextResponse.json({
      ok:         true,
      market:     marketPrice,
      buy:        buyPrice,
      sell:       sellPrice,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Prices/Update] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
