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
    
    const host = req.headers.get('host') || 'axiom-virtu.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const webAppUrl = `${protocol}://${host}`;

    let text = '';
    let replyMarkup = undefined;

    const isStart = /^\/start\b/i.test(messageText);
    const isPriceRequest = /(^\/price\b)|\bharga\b|\bprice\b|\bkurs\b|\bton\b/i.test(messageText);

    if (isStart) {
      text = `👋 <b>Selamat datang di Axiom Virtu!</b>\n\n` +
        `Bursa P2P Virtual terintegrasi TON terpercaya.\n\n` +
        `Silakan ketuk tombol <b>Buka Aplikasi</b> di bawah ini untuk memulai perdagangan Anda secara instan!`;
      
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: 'Buka Aplikasi 🚀',
              web_app: {
                url: webAppUrl
              }
            }
          ]
        ]
      };
    } else if (isPriceRequest) {
      // Mocked price response pending Firebase migration
      text = `💱 <b>Harga TON terbaru (Simulasi)</b>:\n\n` +
        `• Asset: <code>THE-OPEN-NETWORK</code>\n` +
        `• Currency: <code>IDR</code>\n` +
        `• Market Price: <b>Rp 80.000</b>\n` +
        `• Buy Price (+Spread): <b>Rp 82.000</b>\n` +
        `• Sell Price (-Spread): <b>Rp 78.000</b>\n\n` +
        `• Updated: <i>${new Date().toLocaleString('id-ID')}</i>`;
    } else {
      text = `Ketik /price atau tulis "harga" untuk melihat kurs terbaru.\n\nAnda menulis: ${messageText}`;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        }),
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
