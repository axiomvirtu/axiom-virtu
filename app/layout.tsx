import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Axiom Virtu — Bursa Virtual P2P',
  description:
    'Decentralized P2P virtual exchange and internal TON ⇄ IDR money changer based on Telegram Mini App.',
  keywords: ['P2P', 'virtual exchange', 'TON', 'IDR', 'Telegram Mini App', 'crypto'],
  robots: { index: false, follow: false }, // Mini App does not need to be indexed
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d0d14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
      </head>
      <body className="bg-app text-white antialiased">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
