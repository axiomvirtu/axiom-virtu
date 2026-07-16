/**
 * app/api/auth/telegram/route.ts
 *
 * Route Handler: POST /api/auth/telegram
 *
 * Alur (Placeholder untuk Firebase):
 * 1. Terima initData dari client
 * 2. Validasi HMAC-SHA256 (anti-spoofing)
 * 3. (Akan diganti menjadi Firebase Auth / Custom Token Sign-in)
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { validateTelegramInitData } from '@/lib/telegram/validate'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import { sendAdminLog } from '@/lib/telegram/logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { initData } = body as { initData: string }

    if (!initData) {
      return NextResponse.json(
        { error: 'initData wajib disertakan' },
        { status: 400 },
      )
    }

    // Dev mode bypass for local testing outside Telegram
    if (initData === 'dev-bypass' && process.env.NODE_ENV === 'development') {
      const adminAuth = getAdminAuth()
      const adminDb = getAdminDb()
      const telegramId = 'dev-user'
      const userRef = adminDb.collection('users').doc(telegramId)
      const snapshot = await userRef.get()
      const existingUser = snapshot.exists ? snapshot.data() : {}

      const userData = {
        telegram_id: telegramId,
        first_name: 'Developer',
        last_name: 'Local',
        username: 'dev',
        photo_url: '',
        wallet_address: existingUser?.wallet_address ?? null,
        updated_at: new Date(),
        created_at: snapshot.exists ? existingUser?.created_at ?? new Date() : new Date(),
      }

      await userRef.set(userData, { merge: true })

      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS || '';
      const isAdmin = adminIds.split(',').includes(telegramId) || telegramId === 'dev-user';
      const customToken = await adminAuth.createCustomToken(telegramId, {
        telegram_id: telegramId,
        admin: isAdmin
      })

      return NextResponse.json({ ok: true, userId: telegramId, token: customToken })
    }

    // Rate limiting (per IP) backed by Firestore to work across instances
    const adminDb = getAdminDb()
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    const clientIp = forwarded.split(',')[0].trim() || 'unknown'
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000)
    const maxPerWindow = Number(process.env.RATE_LIMIT_MAX ?? 20)

    try {
      const rlRef = adminDb.collection('telegram_rate_limits').doc(clientIp)
      const rlSnap = await rlRef.get()
      const now = Date.now()

      if (rlSnap.exists) {
        interface RateLimitData {
          windowStart?: number
          count?: number
        }
        const data = rlSnap.data() as RateLimitData
        const windowStart = data.windowStart ?? 0
        const count = data.count ?? 0

        if (now - windowStart < windowMs) {
          if (count >= maxPerWindow) {
            return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 })
          }
          await rlRef.update({ count: count + 1 })
        } else {
          await rlRef.set({ windowStart: now, count: 1 })
        }
      } else {
        await rlRef.set({ windowStart: now, count: 1 })
      }
    } catch (e) {
      console.warn('[Auth] rate limit check failed, continuing', e)
    }

    // ── 1. Validasi Telegram signature ─────────────────────────
    const telegramData = validateTelegramInitData(initData)
    if (!telegramData || !telegramData.user) {
      return NextResponse.json(
        { error: 'initData tidak valid atau sudah kadaluarsa' },
        { status: 401 },
      )
    }

    const tgUser = telegramData.user
    const telegramId = String(tgUser.id)
    const adminAuth = getAdminAuth()

    // Replay protection: store hash of initData and reject duplicates
    try {
      const hash = crypto.createHash('sha256').update(initData).digest('hex')
      const nonceRef = adminDb.collection('telegram_init_nonces').doc(hash)
      const nonceSnap = await nonceRef.get()
      if (nonceSnap.exists) {
        // Reject replayed initData
        return NextResponse.json({ error: 'replayed_initdata' }, { status: 409 })
      }

      const ttlMs = Number(process.env.INIT_NONCE_TTL_MS ?? 5 * 60 * 1000) // default 5 minutes
      const expiresAt = new Date(Date.now() + ttlMs)

      // Store nonce with expiresAt for Firestore TTL automatic deletion (enable TTL on `expiresAt` field in Console)
      await nonceRef.set({ telegramId, createdAt: new Date(), expiresAt })
    } catch (e) {
      console.warn('[Auth] nonce check failed, continuing', e)
    }
    const userRef = adminDb.collection('users').doc(telegramId)
    const snapshot = await userRef.get()
    const existingUser = snapshot.exists ? snapshot.data() : {}

    const userData = {
      telegram_id: telegramId,
      first_name: tgUser.first_name ?? '',
      last_name: tgUser.last_name ?? '',
      username: tgUser.username ?? '',
      photo_url: tgUser.photo_url ?? '',
      wallet_address: existingUser?.wallet_address ?? null,
      updated_at: new Date(),
      created_at: snapshot.exists ? existingUser?.created_at ?? new Date() : new Date(),
    }

    await userRef.set(userData, { merge: true })

    await sendAdminLog(
      `👤 <b>User Authenticated</b>\n` +
      `• Telegram ID: <code>${telegramId}</code>\n` +
      `• Name: <b>${tgUser.first_name} ${tgUser.last_name ?? ''}</b>\n` +
      `• Username: @${tgUser.username || '-'}\n` +
      `• Status: ${snapshot.exists ? 'Login Kembali' : 'Registrasi Baru'}`
    )

    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS || '';
    const isAdmin = adminIds.split(',').includes(telegramId) || false;
    const customToken = await adminAuth.createCustomToken(telegramId, {
      telegram_id: telegramId,
      admin: isAdmin
    })

    return NextResponse.json({ ok: true, userId: telegramId, token: customToken })
  } catch (err) {
    console.error('[Auth] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
