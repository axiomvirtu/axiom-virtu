'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Client-only dynamic imports dengan ssr: false
// Ini mencegah Next.js melakukan Server-Side Rendering (SSR) pada komponen SPA Cyberpunk
const AppProvider = dynamic(
  () => import('./context/AppContext').then((mod) => mod.AppProvider),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-cyan-400 tracking-wider uppercase">Loading Axiom Virtu Cyberpunk UI...</p>
        </div>
      </div>
    ),
  }
)

const MobileContainer = dynamic(
  () => import('./components/MobileContainer').then((mod) => mod.MobileContainer),
  { ssr: false }
)

export default function Dashboard() {
  return (
    <AppProvider>
      <MobileContainer />
    </AppProvider>
  )
}
