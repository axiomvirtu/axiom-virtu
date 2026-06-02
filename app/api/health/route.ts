import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'

export async function GET() {
  try {
    const db = getAdminDb()
    // quick read check: try to fetch one doc from asset_catalogs (if exists)
    const snapshot = await db.collection('asset_catalogs').limit(1).get()
    return NextResponse.json({ ok: true, assetCatalogsCount: snapshot.size })
  } catch (err) {
    console.error('[Health] check failed', err)
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
