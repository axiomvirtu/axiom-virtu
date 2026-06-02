import { NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.ADMIN_SECRET ?? ''}`
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { uid, admin } = body as { uid?: string; admin?: boolean }
    if (!uid) {
      return NextResponse.json({ error: 'missing uid' }, { status: 400 })
    }

    const adminAuth = getAdminAuth()
    await adminAuth.setCustomUserClaims(uid, { admin: Boolean(admin) })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? 'error' }, { status: 500 })
  }
}
