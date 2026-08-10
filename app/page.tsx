'use client'

import React from 'react'
import { AppProvider } from './context/AppContext'
import { MobileContainer } from './components/MobileContainer'

export default function Dashboard() {
  return (
    <AppProvider>
      <MobileContainer />
    </AppProvider>
  )
}
