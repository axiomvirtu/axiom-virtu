import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.ADMIN_SECRET ?? ''}`
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    const now = new Date()
    const collection = db.collection('telegram_init_nonces')
    const expiredQuery = collection.where('expiresAt', '<=', now).limit(500)
    const snapshot = await expiredQuery.get()

    if (snapshot.empty) {
      return NextResponse.json({ ok: true, deleted: 0 })
    }

    const batch = db.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()

    return NextResponse.json({ ok: true, deleted: snapshot.size })
  } catch (error) {
    console.error('[NonceCleanup] failed', error)
    return NextResponse.json({ error: 'cleanup_failed', details: (error as Error).message }, { status: 500 })
  }
}
