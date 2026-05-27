/**
 * lib/supabase/client.ts
 *
 * Supabase CLIENT-SIDE client.
 * Gunakan di komponen dengan 'use client' directive dan hooks.
 *
 * Menggunakan @supabase/ssr untuk kompatibilitas penuh dengan
 * Next.js App Router dan cookie-based auth.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Singleton browser client.
 * Dipanggil di Client Components (hooks, event handlers, dll).
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data } = await supabase.from('prices').select('*').order('fetched_at', { ascending: false }).limit(1)
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
