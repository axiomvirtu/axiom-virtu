import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import type { PriceRow } from '@/lib/supabase/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function fetchLatestPrice(): Promise<PriceRow | null> {
  const result = await supabase
    .from('prices')
    .select('*')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    console.error('[Telegram] Supabase fetch error:', result.error.message);
    return null;
  }

  return result.data as PriceRow | null;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    if (!update.message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id;
    const messageText = String(update.message.text || '').trim();
    let text = `✅ Anda menulis: ${messageText}`;

    const isPriceRequest = /(^\/price\b)|\bharga\b|\bprice\b|\bkurs\b|\bton\b/i.test(messageText);

    if (isPriceRequest) {
      const price = await fetchLatestPrice();

      if (price?.ton_market) {
        text = `💱 Harga TON terbaru:\n` +
          `Asset: ${price.asset_id.toUpperCase()}\n` +
          `Currency: ${price.currency.toUpperCase()}\n` +
          `Market: ${price.ton_market}\n` +
          `Buy: ${price.ton_buy}\n` +
          `Sell: ${price.ton_sell}\n` +
          `Sumber: ${price.source}\n` +
          `Updated: ${new Date(price.fetched_at).toLocaleString('id-ID')}`;
      } else {
        text = '⚠️ Maaf, data harga terbaru belum tersedia. Silakan coba lagi beberapa saat.';
      }
    } else {
      text = `Ketik /price atau tulis "harga" untuk melihat kurs terbaru.\n\nAnda menulis: ${messageText}`;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('Telegram bot token not set');

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 200 });
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
