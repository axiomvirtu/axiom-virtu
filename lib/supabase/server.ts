/**
 * lib/supabase/server.ts
 *
 * Supabase SERVER-SIDE client.
 * Gunakan di Server Components, Route Handlers, dan Server Actions.
 *
 * Menggunakan @supabase/ssr dengan cookie store dari next/headers
 * agar session auth tetap sinkron antara client dan server.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Server client yang membaca/menulis cookie lewat next/headers.
 * Harus dipanggil di dalam async context (Server Component atau Route Handler).
 *
 * @example
 * ```ts
 * // app/dashboard/page.tsx (Server Component)
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function DashboardPage() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   ...
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll dipanggil dari Server Component — aman diabaikan.
            // Middleware tetap me-refresh session jika diperlukan.
          }
        },
      },
    },
  )
}

/**
 * Admin client menggunakan Service Role Key.
 * HANYA untuk operasi server-side yang butuh bypass RLS:
 * - Distribusi pendapatan tiket (80/20 split)
 * - Pencairan Dana Cadangan (auto-split)
 * - Cron job update harga
 *
 * ⚠️  JANGAN pernah import file ini di komponen 'use client'!
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // intentionally ignored in Server Components
          }
        },
      },
      auth: {
        // Service role tidak perlu auto-refresh token
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
