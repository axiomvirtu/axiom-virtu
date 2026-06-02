/**
 * app/api/prices/update/route.ts
 *
 * Route Handler: GET /api/prices/update
 *
 * Cron Job endpoint — dipanggil oleh Cloudflare Workers Cron
 * (atau Vercel Cron) setiap 1 menit.
 *
 * Alur (Placeholder for Firebase):
 * 1. Verifikasi header Authorization (cron secret)
 * 2. Fetch kurs TON/IDR dari CoinGecko
 * 3. Hitung harga Beli & Jual dengan spread flat Rp2.000
 * 4. (Firebase Insert akan ditambahkan di sini nantinya)
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'

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
    const now = new Date()

    const adminDb = getAdminDb()
    await adminDb.collection('prices').doc().set({
      asset: assetId,
      currency,
      market_price: marketPrice,
      buy_price: buyPrice,
      sell_price: sellPrice,
      spread,
      created_at: now,
    })

    return NextResponse.json({
      ok:         true,
      asset:      assetId,
      currency,
      market:     marketPrice,
      buy:        buyPrice,
      sell:       sellPrice,
      spread,
      fetched_at: now.toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Prices/Update] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
