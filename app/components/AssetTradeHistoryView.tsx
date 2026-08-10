import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AssetTradeRecord, AssetTheme } from '../types';
import {
  Trophy,
  XCircle,
  TrendingUp,
  ShoppingBag,
  Ticket,
  Clock,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  Key,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  Percent,
  DollarSign,
  Upload,
} from 'lucide-react';

export const AssetTradeHistoryView: React.FC<{
  onOpenPayment?: (assetId: string) => void;
}> = () => {
  const {
    tradeRecords,
    currentUser,
    exchangeRateUsdtToIdr,
    simulateTradeResult,
    completeTradeRecordPayment,
    uploadBuyerTradeProof,
    assets,
    setActiveWinningAsset,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'WIN' | 'LOST' | 'JUAL_BELI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Inputs for buyer proof form
  const [buyerProofImageInputs, setBuyerProofImageInputs] = useState<Record<string, string>>({});
  const [buyerProofHashInputs, setBuyerProofHashInputs] = useState<Record<string, string>>({});

  const handleBuyerFileChange = (recordId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap unggah file gambar (PNG, JPG, WEBP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBuyerProofImageInputs((prev) => ({
          ...prev,
          [recordId]: e.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter records for current user
  const userRecords = tradeRecords.filter(
    (r) => r.userId === currentUser.id || r.userId === 'usr_me'
  );

  const totalTrades = userRecords.length;
  const winsCount = userRecords.filter((r) => r.result === 'WIN').length;
  const lostCount = userRecords.filter((r) => r.result === 'LOST').length;
  const winRate = totalTrades > 0 ? Math.round((winsCount / (winsCount + lostCount || 1)) * 100) : 0;
  const totalVolumeUsdt = userRecords
    .filter((r) => r.result === 'WIN' || r.result === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.priceUsdt, 0);

  // Filter list
  const filteredRecords = userRecords.filter((record) => {
    // Tab filter
    if (activeTab === 'WIN' && record.result !== 'WIN') return false;
    if (activeTab === 'LOST' && record.result !== 'LOST') return false;
    if (activeTab === 'JUAL_BELI' && !['BUY_WIN', 'SELL_COMPLETE', 'TRANSFER_PAID'].includes(record.tradeType)) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = record.assetName.toLowerCase().includes(q);
      const matchTx = record.proofTxHash?.toLowerCase().includes(q) || false;
      const matchSeller = record.sellerName.toLowerCase().includes(q);
      const matchNotes = record.notes?.toLowerCase().includes(q) || false;
      return matchName || matchTx || matchSeller || matchNotes;
    }

    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getThemeBadge = (theme: AssetTheme) => {
    switch (theme) {
      case 'CYBERPUNK':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'SYNTHWAVE':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'QUANTUM':
        return 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40';
      case 'BIOTECH':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
    }
  };

  const getAssetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-fuchsia-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <Key className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4 font-mono text-slate-100">
      {/* 1. Header Metrics Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm text-slate-100 tracking-tight flex items-center gap-2">
                <span>History Transaksi Jual Beli Aset</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-500/40 font-bold">
                  MODE USER
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Catatan resmi perebutan, waktu menang, waktu kalah, & mutasi kepemilikan aset digital.
              </p>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <button
              onClick={() => simulateTradeResult('WIN')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 transition shadow-sm"
              title="Simulasi Menang Perebutan Aset"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>+ Test Menang</span>
            </button>
            <button
              onClick={() => simulateTradeResult('SELL_PENDING')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 transition shadow-sm"
              title="Simulasi Aset Terjual Menunggu Pembayaran Pembeli"
            >
              <ShoppingBag className="w-3 h-3 text-amber-400" />
              <span>+ Test Aset Terjual</span>
            </button>
            <button
              onClick={() => simulateTradeResult('LOST')}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1 transition shadow-sm"
              title="Simulasi Kalah Perebutan Aset"
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>- Test Kalah</span>
            </button>
          </div>
        </div>

        {/* Metric Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Total Transaksi */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Total Sesi:</span>
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-black text-sm text-slate-100">{totalTrades} Transaksi</div>
          </div>

          {/* Waktu Menang */}
          <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
            <div className="text-[10px] text-emerald-400 flex items-center justify-between font-bold">
              <span>Waktu Menang:</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-black text-sm text-emerald-300 flex items-baseline gap-1.5">
              <span>{winsCount} Kali</span>
              <span className="text-[10px] text-emerald-400 font-bold">({winRate}%)</span>
            </div>
          </div>

          {/* Waktu Kalah */}
          <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1">
            <div className="text-[10px] text-rose-400 flex items-center justify-between font-bold">
              <span>Waktu Kalah:</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="font-black text-sm text-rose-300">{lostCount} Kali</div>
          </div>

          {/* Volume Nilai Aset */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Nilai Aset Dimenangkan:</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="font-black text-sm text-amber-300">${totalVolumeUsdt.toFixed(2)} USDT</div>
            <div className="text-[9px] text-slate-500">
              ≈ Rp {(totalVolumeUsdt * exchangeRateUsdtToIdr).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Tab Navigation */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Tab Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-none pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition shrink-0 ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-slate-100 border-slate-600 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Semua ({userRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('WIN')}
              className={`px-3 py-1.5 rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'WIN'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Waktu Menang ({winsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('LOST')}
              className={`px-3 py-1.5 rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'LOST'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md shadow-rose-950/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-rose-300'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Waktu Kalah ({lostCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('JUAL_BELI')}
              className={`px-3 py-1.5 rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'JUAL_BELI'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-cyan-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jual Beli Aset</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aset, TRX Hash, penjual..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* 3. Transaction List Cards */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">Belum Ada History Transaksi untuk Filter Ini</p>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              Silakan ikut serta dalam perebutan pasar sekunder di menu Market atau klik tombol test simulasi di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto no-scrollbar scrollbar-none pr-1">
            {filteredRecords.map((record) => {
              const isWin = record.result === 'WIN';
              const isLost = record.result === 'LOST';
              const isPending = record.result === 'PENDING_PAYMENT';
              const isCompleted = record.result === 'COMPLETED' || record.tradeType === 'TRANSFER_PAID';
              const isSeller = record.tradeType === 'SELL_COMPLETE' || record.sellerName.includes('Saya') || record.sellerName === currentUser.name;
              const isSellerPending = isSeller && isPending && !record.proofTxHash;

              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-2xl border text-xs transition space-y-3 relative overflow-hidden ${
                    isSellerPending
                      ? 'bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30'
                      : isWin
                      ? 'bg-gradient-to-r from-slate-950 via-slate-950 to-emerald-950/30 border-emerald-500/50 hover:border-emerald-500/80 shadow-md'
                      : isLost
                      ? 'bg-slate-950/90 border-rose-500/30 hover:border-rose-500/60 opacity-90'
                      : 'bg-slate-950/90 border-cyan-500/40 hover:border-cyan-500/70'
                  }`}
                >
                  {/* Top Bar: Badge Result & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      {/* Status Result Pill */}
                      {isSellerPending ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          ⏳ ASET TERJUAL — MENUNGGU PEMBAYARAN PEMBELI
                        </span>
                      ) : isCompleted || Boolean(record.proofTxHash) ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ✓ SELESAI / PEMBAYARAN DIKONFIRMASI
                        </span>
                      ) : isWin ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                          🎉 WAKTU MENANG (WON)
                        </span>
                      ) : isLost ? (
                        <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          ❌ WAKTU KALAH (LOST)
                        </span>
                      ) : null}

                      {/* Theme Tag */}
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${getThemeBadge(record.theme)}`}>
                        {record.theme}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(record.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                        {getAssetIcon(record.assetLogo)}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                          <span>{record.assetName}</span>
                          <span className="text-slate-500 text-[10px] font-mono">ID: {record.assetId}</span>
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-slate-300">Penjual: <strong className="text-slate-100">{record.sellerName}</strong></span>
                          {record.buyerName && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300">Pembeli: <strong className="text-amber-200">{record.buyerName}</strong></span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Ticket className="w-3 h-3 text-amber-400" />
                            {record.ticketsSpent} Tiket Terpakai
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-emerald-400">${record.priceUsdt.toFixed(2)} USDT</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ≈ Rp {(record.priceUsdt * exchangeRateUsdtToIdr).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Asset Specs Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Profit Harian:</span>
                      <span className="font-extrabold text-cyan-300">+{record.dailyProfitPercent}% / Hari</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Masa Kontrak:</span>
                      <span className="font-bold text-slate-200">{record.contractDays} Hari</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block">Potensi Return Total:</span>
                      <span className="font-black text-emerald-400">
                        +${((record.priceUsdt * (record.dailyProfitPercent / 100)) * record.contractDays).toFixed(2)} USDT
                      </span>
                    </div>
                  </div>

                  {/* Special Form View for Seller Pending Buyer Payment */}
                  {isSellerPending && (
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3 font-mono text-xs text-slate-200 shadow-inner">
                      {/* Buyer Identity */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 pb-2.5">
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-sans">Identitas Pembeli Aset:</div>
                          <div className="font-extrabold text-slate-100 flex items-center gap-2">
                            <span className="text-amber-300">{record.buyerName || 'RookieTrader_88'}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-sans font-bold">
                              ✓ Verified Buyer
                            </span>
                          </div>
                        </div>

                        {record.buyerPhone && (
                          <a
                            href={`https://wa.me/${record.buyerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${record.buyerName || 'Pembeli'}, saya penjual aset ${record.assetName} ($${record.priceUsdt} USDT) di Axiom Virtu.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1.5 transition shadow-sm font-sans"
                          >
                            <span>Chat WA Pembeli</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        )}
                      </div>

                      {/* Wallet TRC20 Penjual */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-sans">Wallet Penerima USDT Anda (TRC20):</span>
                          <button
                            onClick={() => handleCopy(currentUser.walletAddress || 'TR7NHqjekXQxGTCi8q8ZY4pL8otSzgjLj6', 'wallet_copy_' + record.id)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold font-sans"
                          >
                            <span>{copiedId === 'wallet_copy_' + record.id ? 'Tersalin ✓' : 'Salin Wallet'}</span>
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-bold text-cyan-300 text-[10px] break-all select-all flex items-center justify-between gap-2">
                          <span>{currentUser.walletAddress || 'TR7NHqjekXQxGTCi8q8ZY4pL8otSzgjLj6t'}</span>
                          <span className="text-[9px] text-slate-500 shrink-0 font-sans font-normal">(TRC20)</span>
                        </div>
                      </div>

                      {/* Timer Notice */}
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 leading-relaxed flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 font-sans">
                          <strong className="block text-amber-300 font-bold">⏱️ Batas Waktu Transfer Pembeli: 3 Jam (Aktif)</strong>
                          <p className="text-slate-300 text-[10px]">
                            Pembeli sedang melakukan proses transfer ke wallet Anda. Setelah pembeli mengunggah bukti foto / TRX Hash, periksa mutasi dompet Anda lalu lakukan konfirmasi penerimaan pembayaran di bawah ini.
                          </p>
                        </div>
                      </div>

                      {/* SECTION 1: BUKTI PENGIRIMAN BUKTI BAYAR DARI PEMBELI */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-sans">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          {/* CLICKABLE TITLE TO VIEW PROOF */}
                          <button
                            type="button"
                            onClick={() => {
                              const activeImg = record.proofImageUrl || buyerProofImageInputs[record.id];
                              if (activeImg) {
                                setPreviewImage(activeImg);
                              } else {
                                alert('Belum ada foto bukti pengiriman. Silakan upload / gunakan sample foto di bawah terlebih dahulu.');
                              }
                            }}
                            className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 hover:underline text-left cursor-pointer transition"
                            title="Klik tulisan ini untuk melihat foto bukti transfer"
                          >
                            <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-extrabold text-[12px] underline decoration-cyan-500/50">
                              Foto Bukti Pengiriman Transfer dari Pembeli
                            </span>
                          </button>

                          {(record.proofImageUrl || buyerProofImageInputs[record.id]) ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                              ✓ Bukti Terpasang
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/40 font-mono font-bold">
                              Belum Ada Foto
                            </span>
                          )}
                        </div>

                        {/* DISPLAY PROOF IF PRESENT OR UPLOADED */}
                        {(record.proofImageUrl || buyerProofImageInputs[record.id]) ? (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(record.proofImageUrl || buyerProofImageInputs[record.id])}
                                className="group relative overflow-hidden rounded-lg border border-slate-700 bg-black shrink-0 hover:border-cyan-400 transition"
                              >
                                <img
                                  src={record.proofImageUrl || buyerProofImageInputs[record.id]}
                                  alt="Bukti Pengiriman Pembeli"
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <Eye className="w-4 h-4 text-cyan-300" />
                                </div>
                              </button>

                              <div className="space-y-1 text-[10px] font-mono flex-1 min-w-0">
                                <div className="text-emerald-300 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>Pembeli telah mengunggah foto bukti transfer!</span>
                                </div>
                                <div className="text-slate-300 truncate">
                                  TRX Hash: <strong className="text-cyan-300">{record.proofTxHash || buyerProofHashInputs[record.id] || 'TRX_BUYER_PROOF_883921'}</strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(record.proofImageUrl || buyerProofImageInputs[record.id])}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold block"
                                >
                                  🔍 Klik di sini untuk memperbesar foto bukti transfer
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* UPLOAD FORM / ATTACHMENT FOR BUYER PROOF PHOTO */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="text-[10px] text-slate-400 font-sans">
                            {record.proofImageUrl
                              ? 'Ganti / Upload Ulang Foto Bukti Transfer Pembeli:'
                              : 'Upload / Pasang Foto Bukti Transfer dari Pembeli:'}
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={buyerProofImageInputs[record.id] || ''}
                              onChange={(e) =>
                                setBuyerProofImageInputs((prev) => ({
                                  ...prev,
                                  [record.id]: e.target.value,
                                }))
                              }
                              placeholder="URL foto bukti transfer (https://...)"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                            />
                            <label className="px-3 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition">
                              <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleBuyerFileChange(record.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <input
                              type="text"
                              value={buyerProofHashInputs[record.id] || ''}
                              onChange={(e) =>
                                setBuyerProofHashInputs((prev) => ({
                                  ...prev,
                                  [record.id]: e.target.value,
                                }))
                              }
                              placeholder="TRX Hash / TxID Pembeli (Opsional)"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[10px] text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const sampleQR = 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=500&auto=format&fit=crop&q=60';
                                setBuyerProofImageInputs((prev) => ({ ...prev, [record.id]: sampleQR }));
                                setBuyerProofHashInputs((prev) => ({ ...prev, [record.id]: '0xBUYER_PROOF_TRX_998124' }));
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-amber-500/30 transition shrink-0"
                            >
                              + Sample Struk Transfer
                            </button>
                          </div>

                          {(buyerProofImageInputs[record.id] || buyerProofHashInputs[record.id]) && (
                            <button
                              type="button"
                              onClick={() => {
                                uploadBuyerTradeProof(
                                  record.id,
                                  buyerProofHashInputs[record.id] || 'TRX_BUYER_PROOF_883921',
                                  buyerProofImageInputs[record.id] || ''
                                );
                              }}
                              className="w-full py-1.5 rounded-lg bg-cyan-900 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 text-[10px] font-bold transition font-sans"
                            >
                              Simpan Bukti Bayar Pembeli
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SECTION 2: AREA KONFIRMASI PENJUAL */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/50 space-y-2.5 font-sans">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Konfirmasi Penerimaan Pembayaran oleh Penjual:</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                          Silakan periksa wallet/rekening Anda. Jika dana sebesar <strong className="text-emerald-400">${record.priceUsdt.toFixed(2)} USDT</strong> telah masuk & sesuai dengan foto bukti pengiriman di atas, klik tombol di bawah untuk mengkonfirmasi bahwa aset telah terbayarkan.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            const proofImg = record.proofImageUrl || buyerProofImageInputs[record.id] || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=500&auto=format&fit=crop&q=60';
                            const proofHash = record.proofTxHash || buyerProofHashInputs[record.id] || '0x' + Math.random().toString(36).substring(2, 10);
                            completeTradeRecordPayment(record.id, proofHash, proofImg);
                          }}
                          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>✓ Konfirmasi Pembayaran Telah Diterima (Aset Terbayarkan)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes & TRX Hash Row */}
                  {record.notes && !isSellerPending && (
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-300 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{record.notes}</span>
                    </div>
                  )}

                  {/* Proof Tx Hash / Proof Image */}
                  {record.proofTxHash && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-1.5 font-mono text-slate-400">
                        <span className="text-slate-500">TRX Hash:</span>
                        <span className="text-cyan-300 font-bold">{record.proofTxHash}</span>
                        <button
                          onClick={() => handleCopy(record.proofTxHash!, record.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="Salin TRX Hash"
                        >
                          {copiedId === record.id ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {record.proofImageUrl && (
                        <button
                          onClick={() => setPreviewImage(record.proofImageUrl!)}
                          className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 font-bold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Bukti Foto Transfer</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action for Pending Payment Win or Completed Payment */}
                  {isWin && !record.proofTxHash && record.result !== 'COMPLETED' ? (
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Batas waktu pembayaran 3 jam aktif!</span>
                      </div>
                      <button
                        onClick={() => {
                          const targetAsset = assets.find((a) => a.id === record.assetId);
                          if (targetAsset) {
                            setActiveWinningAsset(targetAsset);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Unggah Bukti Bayar TRX</span>
                      </button>
                    </div>
                  ) : record.proofTxHash || record.result === 'COMPLETED' ? (
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800/80">
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Status Pembayaran: Lunas & Dikonfirmasi</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        ✓ Sudah Dibayarkan
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bukti Transfer Pembayaran Aset</span>
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                Tutup [X]
              </button>
            </div>
            <img
              src={previewImage}
              alt="Bukti Transfer"
              className="w-full max-h-[360px] object-contain bg-slate-950 rounded-xl border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
