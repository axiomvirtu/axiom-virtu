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

const DEFAULT_COINGECKO_ASSET_ID = process.env.COINGECKO_ASSET_ID ?? 'the-open-network'
const DEFAULT_COINGECKO_CURRENCY = process.env.COINGECKO_CURRENCY ?? 'idr'
const DEFAULT_MC_SPREAD = Number(process.env.MC_SPREAD ?? process.env.NEXT_PUBLIC_MC_SPREAD_IDR ?? 2000)
const CRON_SECRET = process.env.CRON_SECRET ?? ''

function getQuoteUrl(assetId: string, currency: string) {
  const params = new URLSearchParams({
    ids: assetId,
    vs_currencies: currency,
  })
  return `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`
}

export async function GET(req: NextRequest) {
  // ── 1. Verifikasi cron secret ───────────────────────────────
  const authHeader = req.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assetId = req.nextUrl.searchParams.get('asset') ?? DEFAULT_COINGECKO_ASSET_ID
  const currency = req.nextUrl.searchParams.get('currency') ?? DEFAULT_COINGECKO_CURRENCY
  const spread = Number(req.nextUrl.searchParams.get('spread') ?? DEFAULT_MC_SPREAD)

  try {
    // ── 2. Fetch harga dari CoinGecko ───────────────────────────
    const cgRes = await fetch(getQuoteUrl(assetId, currency), {
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

    const cgData = await cgRes.json() as Record<string, Record<string, number>>
    const marketPrice = cgData[assetId]?.[currency]
    if (!marketPrice || typeof marketPrice !== 'number') {
      throw new Error('Format respons CoinGecko tidak valid')
    }

    // ── 3. Hitung harga dengan spread flat ─────────────────────
    const buyPrice  = marketPrice + spread
    const sellPrice = marketPrice - spread

    // ── 4. Insert ke tabel prices ───────────────────────────────
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Prices/Update] Missing SUPABASE_SERVICE_ROLE_KEY in runtime env')
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in runtime env')
    }

    const supabase = (await createAdminClient()) as any

    const { error: insertError } = await supabase
      .from('prices')
      .insert({
        asset_id:       assetId,
        currency,
        ton_market:     marketPrice.toString(),
        ton_buy:        buyPrice.toString(),
        ton_sell:       sellPrice.toString(),
        spread_amount:  spread.toString(),
        source:         'coingecko',
        ton_idr_market: currency === 'idr' ? marketPrice.toString() : null,
        ton_idr_buy:    currency === 'idr' ? buyPrice.toString() : null,
        ton_idr_sell:   currency === 'idr' ? sellPrice.toString() : null,
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
      asset:      assetId,
      currency,
      market:     marketPrice,
      buy:        buyPrice,
      sell:       sellPrice,
      spread,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Prices/Update] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
