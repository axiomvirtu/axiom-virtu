import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd', {
      next: { revalidate: 60 } // Cache selama 60 detik
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from TonAPI');
    }
    
    const data = await response.json();
    const price = data.rates?.TON?.prices?.USD;
    
    if (!price) {
      throw new Error('Invalid response format from TonAPI');
    }

    return NextResponse.json({ price: price.toString() });
  } catch (error) {
    console.error('Error fetching TON price:', error);
    return NextResponse.json({ error: 'Failed to fetch TON price' }, { status: 500 });
  }
}
