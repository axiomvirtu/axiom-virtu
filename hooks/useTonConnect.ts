'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TonConnect, type WalletInfo } from '@tonconnect/sdk'

export interface UseTonConnectReturn {
  isReady: boolean
  status: 'idle' | 'connecting' | 'connected' | 'error'
  walletAddress: string | null
  error: string | null
  connectTonkeeper: () => Promise<string | null>
}

export function useTonConnect(): UseTonConnectReturn {
  const [isReady, setIsReady] = useState(false)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tonConnect = useMemo(() => {
    if (typeof window === 'undefined') return null
    return new TonConnect()
  }, [])

  useEffect(() => {
    if (!tonConnect) return

    const unsubscribe = tonConnect.onStatusChange(
      (wallet) => {
        const address = wallet?.account?.address ?? null
        setWalletAddress(address)
        setStatus(address ? 'connected' : 'idle')
      },
      (err) => {
        setError(err.message)
        setStatus('error')
      },
    )

    tonConnect.restoreConnection().catch(() => {
      // ignore restore failures
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true)

    return () => {
      unsubscribe()
    }
  }, [tonConnect])

  const connectTonkeeper = useCallback(async () => {
    if (!tonConnect) {
      throw new Error('TonConnect belum siap')
    }

    setStatus('connecting')
    setError(null)

    const wallets = await TonConnect.getWallets()
    const targetWallet = wallets.find(
      (wallet) =>
        ('jsBridgeKey' in wallet && wallet.jsBridgeKey === 'tonkeeper') ||
        /tonkeeper/i.test(wallet.name),
    )

    if (!targetWallet) {
      throw new Error('Tonkeeper tidak ditemukan. Pastikan Anda menginstal atau membuka aplikasi Tonkeeper.')
    }

    const connectResult = await tonConnect.connect(targetWallet as WalletInfo)
    if (typeof connectResult === 'string') {
      window.location.href = connectResult
      return null
    }

    const address = tonConnect.account?.address ?? null
    setWalletAddress(address)
    setStatus(address ? 'connected' : 'idle')
    return address
  }, [tonConnect])

  return {
    isReady,
    status,
    walletAddress,
    error,
    connectTonkeeper,
  }
}
