/**
 * app/api/auth/telegram/route.ts
 *
 * Route Handler: POST /api/auth/telegram
 *
 * Alur:
 * 1. Terima initData dari client
 * 2. Validasi HMAC-SHA256 (anti-spoofing)
 * 3. Upsert user ke tabel public.users
 * 4. Sign-in ke Supabase Auth (anonymous sign-in linked ke telegram_id)
 * 5. Return session cookie
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateTelegramInitData } from '@/lib/telegram/validate'

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

    // ── 1. Validasi Telegram signature ─────────────────────────
    const telegramData = validateTelegramInitData(initData)
    if (!telegramData || !telegramData.user) {
      return NextResponse.json(
        { error: 'initData tidak valid atau sudah kadaluarsa' },
        { status: 401 },
      )
    }

    const tgUser = telegramData.user
    const supabase = (await createClient()) as any

    // ── 2. Sign-in anonim ke Supabase Auth ─────────────────────
    // Gunakan email sintetis berbasis telegram_id agar unik & deterministik
    const syntheticEmail    = `tg_${tgUser.id}@axiom-virtu.internal`
    const syntheticPassword = `tg_${tgUser.id}_${process.env.TELEGRAM_BOT_TOKEN!.slice(-8)}`

    // Coba sign-in dulu, kalau gagal baru sign-up
    let authResult: any = await supabase.auth.signInWithPassword({
      email:    syntheticEmail,
      password: syntheticPassword,
    })

    if (authResult.error) {
      // User belum ada di Supabase Auth → buat baru
      authResult = await supabase.auth.signUp({
        email:    syntheticEmail,
        password: syntheticPassword,
        options:  { emailRedirectTo: undefined },
      })

      if (authResult.error) {
        console.error('[Auth] Supabase signUp error:', authResult.error)
        return NextResponse.json(
          { error: 'Gagal membuat akun' },
          { status: 500 },
        )
      }
    }

    const authUser = authResult.data.user
    if (!authUser) {
      return NextResponse.json({ error: 'Auth user tidak ditemukan' }, { status: 500 })
    }

    // ── 3. Upsert ke public.users ───────────────────────────────
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          id:          authUser.id,
          telegram_id: tgUser.id,
          username:    tgUser.username   ?? null,
          first_name:  tgUser.first_name ?? null,
          last_name:   tgUser.last_name  ?? null,
          avatar_url:  tgUser.photo_url  ?? null,
          status:      'active',
        },
        {
          onConflict:        'telegram_id',
          ignoreDuplicates:  false,
        },
      )

    if (upsertError) {
      console.error('[Auth] Upsert user error:', upsertError)
      return NextResponse.json(
        { error: 'Gagal menyimpan data user' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, userId: authUser.id })
  } catch (err) {
    console.error('[Auth] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
