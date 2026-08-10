import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Admin AI Agent Inspection Route
app.post('/api/admin-agent', async (req, res) => {
  try {
    const { systemState, query, mode } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY_MISSING',
        message: 'API Key Gemini belum terkonfigurasi di server. Silakan atur GEMINI_API_KEY.',
      });
    }

    const systemInstruction = `
You are Axiom Virtu's AI System Inspector & Platform Auditor ("Agent AI Inspector").
Your sole purpose is to assist the platform owner/admin in auditing, inspecting, and finding shortcomings, bugs, or inconsistencies across both USER MODE and ADMIN MODE of the web application.

Rules & Context of Axiom Virtu App:
1. "Axiom Virtu" is a P2P Digital Asset Trading & Ticket TopUp platform.
2. IMPORTANT BUSINESS RULE: There is NO USDT deposit holding/balance hoarding ("tidak mengendapkan uang/saldo USDT user"). Users pay directly via USDT TRC20 or QRIS IDR ONLY to TopUp Verification Tickets (1 Ticket = $1 USDT or equivalent IDR).
3. Verified Member status (Lencana Centang Biru / Deposit Done) is triggered when users top up verification tickets.
4. Exchange / Payment config uses Admin TRC20 Wallet Address & QRIS IDR.
5. P2P Secondary Market (Sesi Perdagangan) and Scheduled Auction Bidding (Waktu Bidding) operate on tickets / digital assets.
6. The admin can trigger system buyback or manage asset stocks directly.

Your Task:
Analyze the provided system state snapshot (or answer the user's specific query) thoroughly from both User Mode and Admin Mode perspectives.
Be direct, helpful, polite, and structure your output in clean Markdown with clear headings:
- **📊 Ringkasan Kesehatan Sistem** (System Health Score out of 100 & Status)
- **✅ Alur & Fitur yang Sudah Sesuai Aturan**
- **⚠️ Temuan & Potensi Inkonstensi (Mode User & Admin)**
- **💡 Saran Langkah Perbaikan Terarah**

Keep your response in Bahasa Indonesia, clear, professional, and directly actionable.
`;

    const promptText =
      mode === 'FULL_AUDIT'
        ? `Lakukan audit menyeluruh terhadap seluruh sistem (User Mode & Admin Mode) berdasarkan data snapshot berikut:\n\n${JSON.stringify(
            systemState,
            null,
            2
          )}`
        : `Pertanyaan/Perintah Admin: "${query || 'Audit sistem'}"\n\nContext Data Snapshot Sistem:\n${JSON.stringify(
            systemState,
            null,
            2
          )}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || 'Tidak dapat menghasilkan respons dari Agent AI.';
    return res.json({ result: outputText });
  } catch (err: any) {
    console.error('Error in /api/admin-agent:', err);
    return res.status(500).json({
      error: 'Agent Error',
      message: err?.message || 'Gagal memproses analisis Agent AI.',
    });
  }
});

// Firebase Status Route
app.get('/api/firebase-status', (_req, res) => {
  try {
    const firebaseConfig = require('./firebase-applet-config.json');
    return res.json({
      status: 'ONLINE',
      projectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    });
  } catch (e) {
    return res.json({
      status: 'OFFLINE',
      message: 'Firebase configuration not initialized',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
