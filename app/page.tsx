'use client'

import React, { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { MobileContainer } from './components/MobileContainer'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-cyan-400 tracking-wider uppercase">Loading Axiom Virtu...</p>
        </div>
      </div>
    )
  }

  return (
    <AppProvider>
      <MobileContainer />
    </AppProvider>
  )
}
