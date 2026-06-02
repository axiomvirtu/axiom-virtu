import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

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
      // Mocked price response pending Firebase migration
      text = `💱 Harga TON terbaru (Simulasi):\n` +
        `Asset: THE-OPEN-NETWORK\n` +
        `Currency: IDR\n` +
        `Market: 80000\n` +
        `Buy: 82000\n` +
        `Sell: 78000\n` +
        `Sumber: mock\n` +
        `Updated: ${new Date().toLocaleString('id-ID')}`;
    } else {
      text = `Ketik /price atau tulis "harga" untuk melihat kurs terbaru.\n\nAnda menulis: ${messageText}`;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 200 });
  }
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
