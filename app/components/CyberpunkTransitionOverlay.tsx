import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Ticket,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Activity,
  Terminal,
  Radio,
  Clock,
  TrendingUp,
} from 'lucide-react';

export type CyberAnimationType = 'SWAP_EXCHANGE' | 'BOOK_SLOT' | 'TRADE_WIN' | 'TRADE_LOSS' | null;

export interface CyberOverlayData {
  type: CyberAnimationType;
  assetName?: string;
  amountUsdt?: number;
  idrAmount?: number;
  message?: string;
  txHash?: string;
}

interface CyberpunkTransitionOverlayProps {
  data: CyberOverlayData | null;
  onClose: () => void;
}

export const CyberpunkTransitionOverlay: React.FC<CyberpunkTransitionOverlayProps> = ({
  data,
  onClose,
}) => {
  const [phase, setPhase] = useState<'PROCESSING' | 'SUCCESS' | 'FAILED'>('PROCESSING');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!data || !data.type) return;

    setPhase('PROCESSING');
    setProgress(0);

    // Simulated high-speed cyber scan animation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 120);

    const timer = setTimeout(() => {
      if (data.type === 'TRADE_LOSS') {
        setPhase('FAILED');
      } else {
        setPhase('SUCCESS');
      }
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [data]);

  if (!data || !data.type) return null;

  const isWin = data.type === 'TRADE_WIN';
  const isLoss = data.type === 'TRADE_LOSS';
  const isBook = data.type === 'BOOK_SLOT';
  const isSwap = data.type === 'SWAP_EXCHANGE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 font-mono text-slate-100">
      {/* Background Matrix Glow & Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Cyber Ambient Lighting based on outcome */}
      <div
        className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isWin || (isBook && phase === 'SUCCESS')
            ? 'bg-emerald-500/20'
            : isLoss
            ? 'bg-red-500/20'
            : isSwap
            ? 'bg-cyan-500/20'
            : 'bg-fuchsia-500/20'
        }`}
      />

      <div
        className={`relative w-full max-w-md rounded-3xl p-6 border-2 shadow-2xl space-y-5 overflow-hidden transition-all duration-300 ${
          isWin
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/80 border-emerald-500/80 shadow-emerald-500/30'
            : isLoss
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-red-950/80 border-red-500/80 shadow-red-500/30'
            : isBook
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-fuchsia-950/80 border-fuchsia-500/80 shadow-fuchsia-500/30'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950/80 border-cyan-500/80 shadow-cyan-500/30'
        }`}
      >
        {/* Cyberpunk Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.03)_51%)] bg-[size:100%_4px] pointer-events-none" />

        {/* Top HUD Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Cpu className={`w-5 h-5 animate-pulse ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-cyan-400'}`} />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
              AXIOM // CYBER_NEURAL_PROTOCOL_v4.2
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[9px] text-cyan-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-ping" />
            <span>ENCRYPTED</span>
          </div>
        </div>

        {/* Main Animated Icon & Status Indicator */}
        <div className="text-center space-y-3 relative z-10 my-2">
          {phase === 'PROCESSING' ? (
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Outer rotating cyber ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border border-fuchsia-500/60 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="p-4 rounded-full bg-slate-950 border border-cyan-500/60 text-cyan-400 shadow-lg shadow-cyan-500/30">
                {isSwap ? (
                  <ArrowRightLeft className="w-8 h-8 animate-pulse" />
                ) : isBook ? (
                  <Ticket className="w-8 h-8 animate-bounce text-fuchsia-400" />
                ) : (
                  <Zap className="w-8 h-8 text-amber-400 animate-bounce" />
                )}
              </div>
            </div>
          ) : phase === 'SUCCESS' ? (
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
              <div className="p-3.5 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-500/40 animate-in zoom-in-75 duration-300">
                {isWin ? (
                  <Sparkles className="w-10 h-10 text-emerald-300 fill-emerald-300/30" />
                ) : isBook ? (
                  <CheckCircle2 className="w-10 h-10 text-fuchsia-300" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-300" />
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
              <div className="p-3.5 rounded-full bg-red-950 border-2 border-red-400 text-red-300 shadow-xl shadow-red-500/40 animate-in zoom-in-75 duration-300">
                <ShieldAlert className="w-10 h-10 text-red-400" />
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          <div>
            <h3
              className={`text-lg font-black tracking-wider uppercase ${
                phase === 'PROCESSING'
                  ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : isWin
                  ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : isLoss
                  ? 'text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : isBook
                  ? 'text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                  : 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]'
              }`}
            >
              {phase === 'PROCESSING'
                ? isSwap
                  ? 'MEMPROSES PERTUKARAN IDR / USDT...'
                  : isBook
                  ? 'VERIFIKASI TIKET & RESERVASI SLOT...'
                  : 'VERIFIKASI & MEMENANGKAN ASET...'
                : isWin
                ? '🎉 ASET BERHASIL DIMENANGKAN!'
                : isLoss
                ? '⚠️ SLOT UNMATCHED (TIDAK MENANG)'
                : isBook
                ? '🎟️ PESAN SLOT BERHASIL DIKUNCI!'
                : '✅ SWAP PERTUKARAN IDR / USDT DIKIRIM!'}
            </h3>

            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              {phase === 'PROCESSING'
                ? isSwap
                  ? 'Mengirim instruksi penukaran untuk akun Anda...'
                  : isBook
                  ? `Memeriksa saldo tiket dan mengunci slot ${data.assetName || ''}...`
                  : `Mohon tunggu, sistem sedang memverifikasi alokasi perebutan aset ${data.assetName || ''}...`
                : data.message ||
                  (isWin
                    ? `Selamat! Anda berhasil merebut slot aset digital ${data.assetName || ''}.`
                    : isLoss
                    ? `User lain lebih cepat memenangkan slot ${data.assetName || ''}. Kupon / deposit tidak berkurang.`
                    : isBook
                    ? `Slot aset ${data.assetName || ''} berhasil dipesan. Menunggu jam perdagangan resmi.`
                    : `Permintaan tukar Rp ${(data.idrAmount || 0).toLocaleString('id-ID')} ke $${data.amountUsdt || 0} USDT telah dikirim.`)}
            </p>
          </div>
        </div>

        {/* Progress Bar for Cyberpunk feel */}
        {phase === 'PROCESSING' && (
          <div className="space-y-1 relative z-10">
            <div className="flex justify-between text-[10px] text-cyan-300 font-bold">
              <span>SYNCHRONIZING NETWORK...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Transaction Summary Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2 text-xs relative z-10">
          {data.assetName && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Aset:</span>
              <span className="font-extrabold text-slate-100">{data.assetName}</span>
            </div>
          )}
          {data.amountUsdt !== undefined && data.amountUsdt > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nilai Crypto USDT:</span>
              <span className="font-black text-cyan-300 font-mono">${data.amountUsdt} USDT</span>
            </div>
          )}
          {data.idrAmount !== undefined && data.idrAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nilai Rupiah (IDR):</span>
              <span className="font-black text-emerald-400 font-mono">
                Rp {Math.round(data.idrAmount).toLocaleString('id-ID')}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400">Status Node:</span>
            <span
              className={`font-bold uppercase px-2 py-0.5 rounded-full ${
                phase === 'SUCCESS' || isWin
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isLoss
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
              }`}
            >
              {phase === 'PROCESSING' ? '⚙️ Executing' : isLoss ? '❌ Unmatched' : '✓ Confirmed'}
            </span>
          </div>
        </div>

        {/* Close Button when Finished */}
        {phase !== 'PROCESSING' && (
          <div className="pt-2 relative z-10 animate-in fade-in duration-300">
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-xl cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                isWin
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-emerald-500/30'
                  : isLoss
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : isBook
                  ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:brightness-110 shadow-fuchsia-600/30'
                  : 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-slate-950 hover:brightness-110 shadow-cyan-500/30'
              }`}
            >
              <span>{isWin ? 'Lanjut Ke Pembayaran Aset ➔' : 'Kembali Ke Pasar Sekunder'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
