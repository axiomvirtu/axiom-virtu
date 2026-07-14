'use client'

import { useCallback, useState } from 'react'
import { Address, beginCell, toNano } from '@ton/core'
import { TonClient } from '@ton/ton'
// import removed

// Mainnet USDT Master Contract
export const USDT_MASTER_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

let tonClientInstance: any = null
function getTonClient() {
  if (!tonClientInstance) {
    tonClientInstance = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    })
  }
  return tonClientInstance
}

export function useUsdtPayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Karena app ini mungkin pakai TonConnect murni atau UI-React,
  // Kita coba deteksi apakah bisa memanggil sendTransaction dari window atau custom hook.
  // Untuk sementara, kita asumsikan bisa import sendTransaction dari TonConnect UI jika dipakai.
  // Tapi berdasarkan hook useTonConnect.ts di codebase, sepertinya tidak ada useTonConnectUI, 
  // jadi kita butuh meneruskan koneksi dari useTonConnect.
  
  const getJettonWalletAddress = async (
    jettonMasterStr: string,
    ownerAddressStr: string
  ): Promise<string> => {
    try {
      const jettonMaster = Address.parse(jettonMasterStr)
      const ownerAddress = Address.parse(ownerAddressStr)

      // Query ke smart contract untuk mendapatkan alamat jetton wallet
      const client = getTonClient()
      const { stack } = await client.runMethod(
        jettonMaster,
        'get_wallet_address',
        [{ type: 'slice', cell: beginCell().storeAddress(ownerAddress).endCell() }]
      )
      
      const jettonWallet = stack.readAddress()
      return jettonWallet.toString()
    } catch (err) {
      console.error('Failed to get jetton wallet address', err)
      throw new Error('Gagal mendapatkan alamat dompet USDT pengguna')
    }
  }

  const buildJettonTransferPayload = (
    destinationStr: string,
    amountStr: string, // USDT punya 6 desimal. Contoh: 10 USDT = 10000000
    forwardAmount: bigint = 1n
  ) => {
    const destination = Address.parse(destinationStr)
    const amount = BigInt(Math.floor(parseFloat(amountStr) * 1e6))

    const body = beginCell()
      .storeUint(0xf8a7ea5, 32) // opcode for jetton transfer
      .storeUint(0, 64) // query id
      .storeCoins(amount) // amount of jettons to transfer
      .storeAddress(destination) // destination address
      .storeAddress(destination) // response destination (where to send remaining gas)
      .storeBit(0) // no custom payload
      .storeCoins(forwardAmount) // forward amount (TON in nano)
      .storeBit(0) // no forward payload
      .endCell()

    return body.toBoc().toString('base64')
  }

  return {
    isProcessing,
    error,
    getJettonWalletAddress,
    buildJettonTransferPayload,
    setIsProcessing,
    setError
  }
}
