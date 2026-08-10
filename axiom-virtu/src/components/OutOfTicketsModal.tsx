import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Ticket,
  AlertTriangle,
  ArrowRight,
  Wallet,
  Sparkles,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';

interface OutOfTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutOfTicketsModal: React.FC<OutOfTicketsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setIsTicketModalOpen,
    setActiveTab,
    exchangeRateUsdtToIdr,
  } = useApp();

  if (!isOpen) return null;

  const handleGoToTopUp = () => {
    onClose();
    // Directly open ticket purchase modal AND navigate to wallet/top-up tab
    setActiveTab('wallet');
    setIsTicketModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-950/80 p-5 space-y-4 text-slate-100 relative overflow-hidden font-sans">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-400 shadow-md">
              <Ticket className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Tiket Pesan Slot Habis</span>
              </div>
              <h3 className="font-black text-base text-slate-100 tracking-wide">
                Pesan Slot Membutuhkan Tiket
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-3 relative z-10 text-xs">
          {/* Ticket Balance Alert Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-red-950/60 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold">Sisa Tiket Anda Saat Ini:</span>
              <span className="px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-black text-sm flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-red-400" />
                <span>{currentUser.ticketBalance || 0} Tiket</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800/80 pt-2">
              <span className="text-slate-400 font-bold">Dibutuhkan Untuk Pesan Slot:</span>
              <span className="text-amber-300 font-extrabold font-mono">1 Tiket / Slot Aset</span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300 text-[11px] leading-relaxed">
            <p className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Setiap pemesanan slot aset digital di Pasar Sekunder membutuhkan <strong>1 Tiket Aktif</strong>. Tiket Anda sudah habis, sehingga pesanan slot belum dapat diproses.
              </span>
            </p>
            <div className="p-2 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-200 text-[10px] font-mono flex items-center justify-between">
              <span>💡 Kurs Resmi Tiket:</span>
              <span className="font-bold text-fuchsia-300">1 Tiket = $1.00 USDT (Rp {exchangeRateUsdtToIdr.toLocaleString('id-ID')})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800 relative z-10">
          <button
            type="button"
            onClick={handleGoToTopUp}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-xl shadow-fuchsia-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-amber-300 fill-amber-300/20" />
            <span>Top Up Tiket Sekarang</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
          >
            Batal / Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
