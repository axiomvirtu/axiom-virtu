/**
 * proxy.ts
 *
 * Next.js Proxy — dijalankan di Edge Runtime sebelum setiap request.
 *
 * Saat ini merupakan placeholder kosong sebagai persiapan migrasi ke Firebase.
 */
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Hanya pass-through untuk sementara
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
