import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT', {
      next: { revalidate: 60 } // Cache selama 60 detik agar tidak terlalu sering memanggil Binance
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Binance');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TON price:', error);
    return NextResponse.json({ error: 'Failed to fetch TON price' }, { status: 500 });
  }
}
