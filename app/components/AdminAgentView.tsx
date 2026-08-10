import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  ShieldCheck,
  Ticket,
  QrCode,
  Layers,
  Database,
  ArrowRight,
  Zap,
  HelpCircle,
  MessageSquare,
  Activity,
  Award,
} from 'lucide-react';

export const AdminAgentView: React.FC = () => {
  const {
    users = [],
    exchangeRequests = [],
    digitalAssets = [],
    schedules = [],
    topUpPaymentConfig = {},
    supportTickets = [],
    giveawayPrizes = [],
    tradeRecords = [],
    exchangeRateUsdtToIdr = 16000,
    currentUser = { name: 'Owner', id: 'usr_me', role: 'admin' },
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'USER' | 'AGENT'; text: string; timestamp: Date; isAuditReport?: boolean }[]
  >([
    {
      sender: 'AGENT',
      text: `Halo Admin **${currentUser?.name || 'Owner'}**! 🤖 Saya adalah **Agent AI Inspector & System Auditor** Axiom Virtu.

Tugas saya adalah memindai seluruh ekosistem website ini baik dari **Mode User** maupun **Mode Admin** untuk menemukan kekurangan, inkonsistensi alur, atau fitur yang belum sesuai dengan spesifikasi yang Anda harapkan.

Silakan klik **"Jalankan Auditing Sistem Lengkap"** di bawah atau pilih preset pemindaian khusus untuk memulai!`,
      timestamp: new Date(),
    },
  ]);

  // Snapshot generator for AI
  const getSystemStateSnapshot = () => {
    const safeUsers = users || [];
    const safeRequests = exchangeRequests || [];
    const safeAssets = digitalAssets || [];
    const safeSchedules = schedules || [];
    const safeSupport = supportTickets || [];
    const safePrizes = giveawayPrizes || [];
    const safeTrades = tradeRecords || [];

    return {
      timestamp: new Date().toISOString(),
      userStats: {
        totalUsers: safeUsers.length,
        verifiedUsersCount: safeUsers.filter((u) => u.isDepositDone).length,
        unverifiedUsersCount: safeUsers.filter((u) => !u.isDepositDone).length,
        bannedUsersCount: safeUsers.filter((u) => u.isBanned).length,
      },
      paymentGatewayConfig: {
        trc20AddressConfigured: !!topUpPaymentConfig?.adminUsdtTrc20Address,
        trc20Address: topUpPaymentConfig?.adminUsdtTrc20Address || 'Belum diisi',
        qrisRateIdr: exchangeRateUsdtToIdr,
      },
      requestsAndTransactions: {
        pendingExchangeRequests: safeRequests.filter((r) => r.status === 'PENDING').length,
        totalTicketPurchaseRequests: safeRequests.filter((r) => r.isTicketPurchase).length,
        pendingTicketApprovals: safeRequests.filter((r) => r.isTicketPurchase && r.status === 'PENDING').length,
      },
      secondaryMarketAndAssets: {
        totalDigitalAssets: safeAssets.length,
        totalActiveStocks: safeAssets.reduce((sum, a) => sum + (a.totalStock || 0), 0),
        activeSchedules: safeSchedules.filter((s) => s.status === 'ACTIVE').length,
      },
      supportAndGiveaway: {
        openSupportTickets: safeSupport.filter((t) => t.status === 'OPEN').length,
        totalGiveawayPrizes: safePrizes.length,
        totalP2PTradeRecords: safeTrades.length,
      },
      sampleUsers: safeUsers.slice(0, 5).map((u) => ({
        id: u.id,
        name: u.name,
        ticketBalance: u.ticketBalance,
        usdtBalance: u.usdtBalance,
        isDepositDone: u.isDepositDone,
      })),
      recentRequestsSample: safeRequests.slice(0, 5).map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        amountUsdt: r.amountUsdt,
        amountIdr: r.amountIdr,
        isTicketPurchase: r.isTicketPurchase,
        status: r.status,
      })),
    };
  };

  const handleRunAgentScan = async (customQuery?: string, isFullAudit = false) => {
    const q = customQuery || queryInput;
    if (!isFullAudit && !q.trim()) return;

    if (!isFullAudit) {
      setMessages((prev) => [
        ...prev,
        { sender: 'USER', text: q, timestamp: new Date() },
      ]);
      setQueryInput('');
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'USER',
          text: '🔍 Jalankan Audit Pemindaian Sistem Menyeluruh (Mode User & Admin)',
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemState: getSystemStateSnapshot(),
          query: isFullAudit ? undefined : q,
          mode: isFullAudit ? 'FULL_AUDIT' : 'CHAT',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghubungi Agent AI.');
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'AGENT',
          text: data.result || 'Tidak ada respons yang dihasilkan.',
          timestamp: new Date(),
          isAuditReport: isFullAudit,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AGENT',
          text: `⚠️ **Terjadi Kesalahan**: ${err.message || 'Gagal memproses analisis Agent AI.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-fuchsia-950/70 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Bot className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Khusus Mode Admin • Intelligent Inspector Agent</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Bot className="w-7 h-7 text-indigo-400" />
              <span>Agent AI Inspector &amp; System Auditor</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Asisten AI cerdas untuk memeriksa kesehatan alur, validasi fitur, dan menemukan kekurangan yang belum sesuai di seluruh alur <strong>Mode User</strong> dan <strong>Mode Admin</strong>.
            </p>
          </div>

          <button
            onClick={() => handleRunAgentScan(undefined, true)}
            disabled={isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Memindai Sistem...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>Jalankan Audit Sistem Lengkap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Snapshot Indicator Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Member Terverifikasi</div>
            <div className="text-sm font-black text-white">
              {(users || []).filter((u) => u.isDepositDone).length} / {(users || []).length} User
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Top Up Tiket</div>
            <div className="text-sm font-black text-amber-300">
              {(exchangeRequests || []).filter((r) => r.isTicketPurchase && r.status === 'PENDING').length} Permintaan
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Wallet TRC20 Admin</div>
            <div className="text-xs font-mono font-bold text-emerald-300 truncate max-w-[120px]">
              {topUpPaymentConfig?.adminUsdtTrc20Address ? 'Terpasang' : 'Belum diisi'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Aset Digital &amp; Stock</div>
            <div className="text-sm font-black text-white">
              {(digitalAssets || []).length} Aset ({(digitalAssets || []).reduce((s, a) => s + (a.totalStock || 0), 0)} Stock)
            </div>
          </div>
        </div>
      </div>

      {/* Preset Audit Query Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Preset Audit &amp; Inspeksi Cepat Agent:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() =>
              handleRunAgentScan(
                'Audit alur Top Up Tiket dan pastikan tidak ada saldo USDT terendap yang membingungkan user, serta pastikan lencana Centang Biru otomatis aktif saat disetujui.'
              )
            }
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:border-indigo-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Ticket className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Audit Alur Top Up Tiket &amp; Centang Biru</span>
          </button>

          <button
            onClick={() =>
              handleRunAgentScan(
                'Periksa konfigurasi payment gateway QRIS IDR & Wallet TRC20 Admin. Apakah informasi untuk user sudah jelas dan valid?'
              )
            }
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:border-emerald-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cek Gateway TRC20 &amp; QRIS</span>
          </button>

          <button
            onClick={() =>
              handleRunAgentScan(
                'Inspeksi kondisi Pasar Sekunder, stock Aset Digital, dan jadwal Bidding. Apakah ada stok habis atau alur yang terhambat?'
              )
            }
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:border-cyan-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspeksi Pasar Sekunder &amp; Bidding</span>
          </button>

          <button
            onClick={() =>
              handleRunAgentScan(
                'Beri saya daftar 5 rekomendasi terpenting untuk menyempurnakan alur pengguna agar website berjalan optimal tanpa kendala.'
              )
            }
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:border-amber-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>5 Rekomendasi Penyempurnaan Top</span>
          </button>
        </div>
      </div>

      {/* Main Agent Chat & Output Area */}
      <div className="p-4 md:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-2xl min-h-[400px] flex flex-col justify-between">
        {/* Chat Messages Log */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl ${
                msg.sender === 'USER'
                  ? 'bg-indigo-950/60 border border-indigo-500/30 ml-8 text-indigo-100'
                  : 'bg-slate-900 border border-slate-800 mr-4 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/60">
                {msg.sender === 'AGENT' ? (
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-indigo-400">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span>AGENT AI INSPECTOR</span>
                    {msg.isAuditReport && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30 font-mono">
                        Laporan Audit Full
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-fuchsia-400">
                    <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                    <span>ADMIN ({currentUser.name})</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-500 font-mono ml-auto">
                  {msg.timestamp.toLocaleTimeString('id-ID')}
                </span>
              </div>

              <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse flex items-center gap-3">
              <Bot className="w-5 h-5 text-indigo-400 animate-spin" />
              <div className="text-xs text-indigo-300 font-mono">
                Agent AI sedang memindai sistem dan menyusun analisis data...
              </div>
            </div>
          )}
        </div>

        {/* Input Chat Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAgentScan();
          }}
          className="pt-4 border-t border-slate-800/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Tanyakan atau minta Agent AI memeriksa alur website tertentu..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !queryInput.trim()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
