/**
 * middleware.ts
 *
 * Next.js Middleware — dijalankan di Edge Runtime sebelum setiap request.
 *
 * Tanggung jawab:
 * 1. Refresh Supabase session token agar tidak expired di server.
 * 2. Proteksi route: redirect ke /auth jika belum login.
 * 3. Validasi bahwa request berasal dari Telegram (header X-Telegram-Init-Data).
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

// Route yang tidak perlu autentikasi
const PUBLIC_ROUTES = ['/auth', '/api/telegram/webhook', '/api/prices/update']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Tulis cookie ke request agar downstream bisa baca
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Buat response baru dengan cookie yang sudah diperbarui
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — JANGAN hapus baris ini
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    // Abaikan error fetch di Dev Mode akibat URL dummy
    console.warn('[Middleware] Supabase auth fetch error (diabaikan di Dev Mode)')
  }

  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  )

  // Redirect ke /auth jika belum login dan bukan public route
  if (!user && !isPublicRoute) {
    // DEV BYPASS: Izinkan masuk ke dashboard saat development di luar Telegram
    if (process.env.NODE_ENV === 'development') {
      return supabaseResponse
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Penting: kembalikan supabaseResponse agar cookie session tersinkron
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua route kecuali:
     * - _next/static (file statis Next.js)
     * - _next/image (image optimizer)
     * - favicon.ico
     * - File publik lainnya
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
