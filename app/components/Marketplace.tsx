import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DigitalAsset, AssetTheme } from '../types';
import { AssetTradeHistoryView } from './AssetTradeHistoryView';
import { CyberpunkTransitionOverlay, CyberOverlayData } from './CyberpunkTransitionOverlay';
import { AssetGridSkeleton } from './AssetSkeleton';
import {
  Clock,
  Ticket,
  Lock,
  Unlock,
  Users,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Cpu,
  Activity,
  ShieldCheck,
  Key,
  Sparkles,
  ArrowRight,
  Flame,
  History,
  ShoppingBag,
  BarChart3,
  RefreshCw,
  Send,
} from 'lucide-react';
import { CycleSimulationTable } from './CycleSimulationTable';

export const Marketplace: React.FC<{
  onOpenPayment: (asset: DigitalAsset) => void;
}> = ({ onOpenPayment }) => {
  const {
    assets,
    schedules,
    currentUser,
    bookAssetSlot,
    runGrabProcess,
    setIsAuthModalOpen,
  } = useApp();

  const [marketSubTab, setMarketSubTab] = useState<'MARKET' | 'HISTORY'>('MARKET');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedSimAsset, setSelectedSimAsset] = useState<DigitalAsset | null>(null);
  const [cyberOverlay, setCyberOverlay] = useState<CyberOverlayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load shimmer effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleBookSlot = (ast: DigitalAsset) => {
    const success = bookAssetSlot(ast.id);
    if (success) {
      setCyberOverlay({
        type: 'BOOK_SLOT',
        assetName: ast.name,
        amountUsdt: ast.priceUsdt,
        message: `Slot aset digital ${ast.name} berhasil dipesan dengan 1 tiket. Menunggu jam jual beli resmi (${ast.customSchedule?.tradingStartHour || schedules.tradingStartHour} WIB).`,
      });
    }
  };

  const handleRunGrab = (ast: DigitalAsset) => {
    const isWinner = runGrabProcess(ast.id);
    if (isWinner) {
      setCyberOverlay({
        type: 'TRADE_WIN',
        assetName: ast.name,
        amountUsdt: ast.priceUsdt,
        message: `🎉 SELAMAT! Anda berhasil memenangkan perebutan ${ast.name} ($${ast.priceUsdt} USDT)! Lakukan pembayaran dalam batas waktu 3 jam.`,
      });
    } else {
      setCyberOverlay({
        type: 'TRADE_LOSS',
        assetName: ast.name,
        amountUsdt: ast.priceUsdt,
        message: `⚠️ Slot ${ast.name} tidak berhasil didapatkan. Coba lagi pada sesi berikutnya!`,
      });
    }
  };

  // Helper to render dynamic icon
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

  const filteredAssets = assets.filter((ast) => {
    if (ast.status === 'BURNED') return false;
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CUSTOM_SCHEDULE') return !!ast.customSchedule;
    return ast.theme === selectedFilter;
  });

  return (
    <div className="space-y-4 font-mono pb-20">
      {/* Navigation Sub-Tabs: Pasar Sekunder vs History Transaksi Jual Beli */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setMarketSubTab('MARKET')}
          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            marketSubTab === 'MARKET'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-cyan-400" />
          <span>Pasar Sekunder Aset</span>
        </button>

        <button
          onClick={() => setMarketSubTab('HISTORY')}
          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
            marketSubTab === 'HISTORY'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 shadow-md shadow-fuchsia-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-fuchsia-400" />
          <span>History Jual Beli (Menang/Kalah)</span>
        </button>
      </div>

      {marketSubTab === 'HISTORY' ? (
        <AssetTradeHistoryView />
      ) : (
        <>
          {/* 1. Schedule & Rules Information Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/30 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-cyan-300">
              Jadwal Operasional Pasar Sekunder
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
          </span>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          💡 Setiap aset digital memiliki <strong>Jam Pesan Tiket yang ditentukan & Jam Jual Beli</strong> yang berbeda.
        </p>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-1 text-center sm:text-left">
          <div className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
            <Ticket className="w-4 h-4 text-cyan-400" />
            <span>Jam Pesan Tiket Global</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tracking-wide">
            {schedules.bookingStartHour} - {schedules.bookingEndHour} WIB
          </div>
          <p className="text-[10px] text-slate-400">
            Pesan slot aset digital pilihan Anda menggunakan 1 tiket
          </p>
        </div>
      </div>

      {/* 2. Account Locked Alert ($5 Mandatory Deposit) */}
      {currentUser.isLocked ? (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500/60 shadow-xl shadow-amber-950/50 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 animate-bounce">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-amber-300">
              Akses Pasar Sekunder Terkunci!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Sesuai aturan sistem Axiom Virtu, Anda wajib melakukan deposit awal sebesar{' '}
              <span className="font-bold text-amber-400">$5 USD</span> untuk mendapatkan 5 Tiket dan membuka daftar aset digital di pasar sekunder.
            </p>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 transition inline-flex items-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Lakukan Deposit $5 Sekarang</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filters Bar with Refresh Action */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar scrollbar-none touch-pan-x flex-1">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'CYBERPUNK', label: 'CYBERPUNK' },
                { id: 'SYNTHWAVE', label: 'SYNTHWAVE' },
                { id: 'QUANTUM', label: 'QUANTUM' },
                { id: 'BIOTECH', label: 'BIOTECH' },
                { id: 'NEON_MATRIX', label: 'NEON_MATRIX' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleFilterChange(th.id)}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] whitespace-nowrap transition cursor-pointer ${
                    selectedFilter === th.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>

            {/* Manual Refresh Market Data Button */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 transition cursor-pointer active:scale-95 shrink-0"
              title="Refresh Data Pasar Sekunder"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-300' : ''}`} />
            </button>
          </div>

          {/* Assets Grid or Shimmer Skeleton */}
          {isLoading ? (
            <AssetGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredAssets.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">Tidak ada aset digital dalam filter ini.</p>
              </div>
            ) : (
              filteredAssets.map((ast) => {
                const isBookedByMe = ast.bookedUsers.includes(currentUser.id);
                const isWinnerMe = ast.currentWinnerId === currentUser.id;
                const isGrabbedPending = ast.status === 'GRABBED_PAYMENT_PENDING';
                const isPaidByMe =
                  Boolean(ast.isPaid || ast.status === 'ACTIVE_HOLDING' || ast.proofTxHash) &&
                  (isWinnerMe || isBookedByMe || ast.currentWinnerId === currentUser.id);
                const isLostByMe =
                  isGrabbedPending && !isWinnerMe && isBookedByMe && !isPaidByMe;

                const sched = ast.customSchedule || {
                  bookingStartHour: schedules.bookingStartHour,
                  bookingEndHour: schedules.bookingEndHour,
                  tradingStartHour: schedules.tradingStartHour,
                  tradingEndHour: schedules.tradingEndHour,
                };

                return (
                  <div
                    key={ast.id}
                    className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-200 relative flex flex-col justify-between space-y-3 ${
                      isPaidByMe
                        ? 'border-emerald-500/80 shadow-xl shadow-emerald-950/40'
                        : isWinnerMe && isGrabbedPending
                        ? 'border-emerald-500 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                        : isBookedByMe
                        ? 'border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/40'
                        : ast.customSchedule
                        ? 'border-amber-500/40 shadow-md shadow-amber-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Theme Badge & Logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getThemeBadge(
                            ast.theme
                          )}`}
                        >
                          {ast.theme}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {getAssetIcon(ast.logo)}
                      </div>
                    </div>

                    {/* Custom Schedule Hours Bar */}
                    <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Ticket className="w-3 h-3 text-cyan-400" />
                          Pesan: <strong>{sched.bookingStartHour}-{sched.bookingEndHour} WIB</strong>
                        </span>
                        <span className="flex items-center gap-1 text-fuchsia-300">
                          <Zap className="w-3 h-3 text-fuchsia-400" />
                          Jual Beli: <strong>{sched.tradingStartHour}-{sched.tradingEndHour} WIB</strong>
                        </span>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-slate-100">{ast.name}</h4>

                      {/* Harga Range Aset (Positioned directly under Asset Name) */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Range Harga:
                          </div>
                          <div className="text-base font-black text-cyan-400 font-mono tracking-tight">
                            ${(ast.minPriceUsdt || ast.priceUsdt).toFixed(2)} - ${(ast.maxPriceUsdt || (ast.minPriceUsdt || ast.priceUsdt) * 2).toFixed(2)}{' '}
                            <span className="text-xs font-normal text-slate-400">USDT</span>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-950/50 px-2 py-1 rounded-xl border border-emerald-500/30">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          +{ast.dailyProfitPercent}% / Hari
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-xs flex items-center gap-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-400 text-[10px] font-bold">Masa Kontrak:</span>
                          <span className="text-amber-300 font-black text-[11px] font-mono">{ast.contractDays} Hari</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedSimAsset(ast)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] hover:bg-cyan-900/80 transition flex items-center gap-1"
                        >
                          <BarChart3 className="w-3 h-3 text-cyan-400" />
                          Simulasi 15x
                        </button>
                      </div>

                      {/* Max Price Action Badge */}
                      <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800/90 text-[10px] font-mono">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-slate-400">Tindakan Max Price:</span>
                          {ast.maxPriceAction === 'UPGRADE_NEXT_TIER' ? (
                            <span className="text-fuchsia-300 font-extrabold flex items-center gap-1 bg-fuchsia-950/60 px-1.5 py-0.5 rounded border border-fuchsia-500/40">
                              <TrendingUp className="w-2.5 h-2.5 text-fuchsia-400" />
                              <span>🚀 Naik Tier Selanjutnya</span>
                            </span>
                          ) : ast.maxPriceAction === 'SPLIT_SAME_TIER' ? (
                            <span className="text-amber-300 font-extrabold flex items-center gap-1 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              <span>⚡ Split 2x Stok</span>
                            </span>
                          ) : (
                            <span className="text-cyan-300 font-extrabold flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">
                              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                              <span>🤖 Smart Defisit Auto</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seller Telegram Contact Info & Direct Chat Button */}
                      <div className="p-2 rounded-xl bg-slate-950/90 border border-sky-500/30 text-[10px] flex items-center justify-between gap-2 shadow-inner">
                        <div className="flex items-center gap-1.5 truncate">
                          <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-400">Penjual: </span>
                            <span className="text-slate-200 font-bold">{ast.sellerName}</span>{' '}
                            <span className="text-sky-400 font-semibold font-mono">
                              ({ast.sellerPhone.startsWith('@') ? ast.sellerPhone : `@${ast.sellerPhone}`})
                            </span>
                          </div>
                        </div>

                        <a
                          href={`https://t.me/${ast.sellerPhone.replace('@', '').trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-bold text-[10px] transition flex items-center gap-1 shrink-0 active:scale-95"
                          title="Chat langsung penjual di Telegram"
                        >
                          <Send className="w-3 h-3 text-sky-400" />
                          <span>Chat Penjual</span>
                        </a>
                      </div>
                    </div>

                    {/* Status Tags / Messages */}
                    {isPaidByMe ? (
                      <div className="p-2 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-[11px] text-emerald-300 font-bold space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>✓ PEMBAYARAN SELESAI & DIKONFIRMASI</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-normal">
                          Aset digital ini telah resmi dibayar & dimenangkan oleh Anda. TRX Hash terverifikasi.
                        </p>
                      </div>
                    ) : isWinnerMe && isGrabbedPending ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-[11px] text-emerald-300 font-bold space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>🎉 SELAMAT! ANDA MEMENANGKAN ASET</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-normal">
                          Segera bayar sebelum batas waktu 3 jam berakhir.
                        </p>
                      </div>
                    ) : isLostByMe ? (
                      <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-900/80 text-xs text-red-300 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Anda tidak mendapatkan aset ini. Silakan coba lagi besok!</span>
                      </div>
                    ) : isBookedByMe && !isGrabbedPending ? (
                      <div className="p-2 rounded-xl bg-fuchsia-950/50 border border-fuchsia-500/40 text-[10px] text-fuchsia-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Aset telah dipesan — Menunggu jam jual beli ({sched.tradingStartHour} WIB)</span>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="pt-1">
                      {isPaidByMe ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-default shadow-md shadow-emerald-950/50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Sudah Dibayarkan</span>
                        </button>
                      ) : isWinnerMe && isGrabbedPending ? (
                        <button
                          onClick={() => onOpenPayment(ast)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 transition flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <span>Bayar Aset ($3 Jam Limit)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : isLostByMe ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center"
                        >
                          Aset Sedang Diproses
                        </button>
                      ) : isBookedByMe && !isGrabbedPending ? (
                        <button
                          onClick={() => handleRunGrab(ast)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-slate-100 font-bold text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-600/20 hover:brightness-110 transition flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>Rebut Sekarang (Grab)</span>
                        </button>
                      ) : ast.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => handleBookSlot(ast)}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-4 h-4 text-fuchsia-400" />
                          <span>Pesan Slot (1 Tiket)</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
                        >
                          Aset Sedang Diproses
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        </>
      )}

      {/* 15-Cycle Simulation Table Modal */}
      {selectedSimAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4 font-mono text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-cyan-300 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Simulasi 15x Perputaran Harga & Split Stok</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Aset: <strong className="text-slate-200">{selectedSimAsset.name}</strong> &bull; Profit: <strong className="text-emerald-400">+{selectedSimAsset.dailyProfitPercent}% / Hari</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedSimAsset(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <CycleSimulationTable
              startPrice={selectedSimAsset.priceUsdt}
              profitPercent={selectedSimAsset.dailyProfitPercent}
              minPrice={selectedSimAsset.minPriceUsdt}
              maxPrice={selectedSimAsset.maxPriceUsdt}
              maxPriceAction={selectedSimAsset.maxPriceAction}
            />

            <button
              type="button"
              onClick={() => setSelectedSimAsset(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider"
            >
              Tutup Simulasi
            </button>
          </div>
        </div>
      )}

      {/* Cyberpunk Transition HUD Overlay */}
      <CyberpunkTransitionOverlay
        data={cyberOverlay}
        onClose={() => {
          if (cyberOverlay?.type === 'TRADE_WIN' && cyberOverlay.assetName) {
            const winAsset = assets.find((a) => a.name === cyberOverlay.assetName);
            if (winAsset) {
              onOpenPayment(winAsset);
            }
          }
          setCyberOverlay(null);
        }}
      />
    </>
  )}
</div>
  );
};
