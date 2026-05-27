import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

/**
 * Telegram webhook handler.
 *
 * Telegram sends a POST request with a JSON body containing an `update` object.
 * We echo back a simple acknowledgment and optionally reply to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // If the update contains a message with text, reply with a simple echo.
    if (update.message?.text && update.message.chat?.id) {
      const chatId = update.message.chat.id;
      const text = `✅ Anda menulis: ${update.message.text}`;

      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) throw new Error('Telegram bot token not set');

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    }

    // Telegram expects a 200 response with JSON { ok: true }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    // Return a generic error but still 200 so Telegram does not retry endlessly
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 200 });
  }
}

// Optional: reject other HTTP methods
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
