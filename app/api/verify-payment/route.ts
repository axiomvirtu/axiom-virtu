import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amountTon, adminWallet } = await req.json();

    if (!orderId || !amountTon || !adminWallet) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Tunggu 8 detik untuk memberi waktu TonAPI mengindeks transaksi di blockchain
    await new Promise(resolve => setTimeout(resolve, 8000));

    const response = await fetch(`https://tonapi.io/v2/accounts/${adminWallet}/transactions?limit=20`);
    if (!response.ok) {
      throw new Error('Failed to fetch from TonAPI');
    }
    const data = await response.json();

    let verified = false;
    for (const tx of data.transactions) {
      // Cari pesan masuk (in_msg) dengan teks memo yang cocok dengan orderId
      if (tx.in_msg && tx.in_msg.decoded_body && tx.in_msg.decoded_body.text === orderId) {
        // Cek jumlah TON yang diterima (konversi dari nanoTON)
        const receivedTon = Number(tx.in_msg.value) / 1e9;
        
        // Mentoleransi sedikit selisih jika ada fee jaringan, tapi harus setidaknya 98% dari tagihan
        if (receivedTon >= amountTon * 0.98) {
          verified = true;
          break;
        }
      }
    }

    if (verified) {
      // Catat di database (Firestore) bahwa order ini sudah dibayar lunas
      const db = getAdminDb();
      await db.collection('orders').doc(orderId).set({
        order_id: orderId,
        amount_ton: amountTon,
        status: 'PAID',
        verified_at: new Date()
      });
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan di blockchain atau jumlah kurang' }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
