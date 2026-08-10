import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DigitalAsset } from '../types';
import {
  X,
  Clock,
  AlertTriangle,
  Upload,
  Send,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Hash,
  CheckCircle2,
  Copy,
  Check,
  Wallet,
} from 'lucide-react';

export const PaymentModal: React.FC<{
  asset: DigitalAsset | null;
  onClose: () => void;
}> = ({ asset, onClose }) => {
  const { completePaymentProof, triggerSanctionAutoBan, currentUser, users } = useApp();

  const [txHash, setTxHash] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [timeLeftStr, setTimeLeftStr] = useState('03:00:00');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Reset form states whenever a new asset is opened
  useEffect(() => {
    if (asset) {
      setTxHash(asset.proofTxHash || '');
      setProofUrl(asset.proofImageUrl || '');
      setNote('');
      setIsSubmitted(Boolean(asset.isPaid));
      setCopiedWallet(false);
    }
  }, [asset?.id, asset?.isPaid]);

  useEffect(() => {
    if (!asset || !asset.paymentDeadline) {
      setTimeLeftStr('03:00:00');
      return;
    }

    const updateTimer = () => {
      const remainingMs = asset.paymentDeadline! - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr('00:00:00');
      } else {
        const hours = Math.floor(remainingMs / 3600000);
        const mins = Math.floor((remainingMs % 3600000) / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeftStr(
          `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [asset?.id, asset?.paymentDeadline]);

  if (!asset) return null;

  // Find seller's TRC20 wallet address from user profile database or asset config
  const sellerUser = users?.find(
    (u) => (asset.sellerId && u.id === asset.sellerId) || (asset.sellerName && u.name === asset.sellerName)
  );
  const isAdminSeller =
    asset.sellerId === 'usr_admin' ||
    asset.sellerName.toLowerCase().includes('admin') ||
    sellerUser?.role === 'admin';

  const adminWalletFallback =
    users?.find((u) => u.role === 'admin')?.walletAddress ||
    '0xADMIN_VAULT_AXIOM_99';

  const sellerWalletAddress =
    asset.sellerWalletAddress ||
    (isAdminSeller ? adminWalletFallback : sellerUser?.walletAddress) ||
    adminWalletFallback;

  const phoneClean = asset.sellerPhone.replace(/[^0-9]/g, '');
  const waMessage = `Halo ${asset.sellerName}, saya (${currentUser.name}) memenangkan Aset Digital ${asset.name} seharga $${asset.priceUsdt} USDT di Axiom Virtu. Saya ingin mengonfirmasi pembayaran dan mengirim bukti TRX Hash. Mohon diperiksa. Terima kasih!`;
  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(waMessage)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) return;

    completePaymentProof(
      asset.id,
      txHash.trim(),
      proofUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=400&auto=format&fit=crop&q=80'
    );
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-fuchsia-500/40 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-fuchsia-950/80 p-5 space-y-4 text-slate-100 font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Pembayaran Aset Dimenangkan</h3>
              <p className="text-xs text-slate-400">Wajib Transfer USDT & Unggah Bukti Transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown Timer Warning Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/60 to-amber-950/60 border border-red-500/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-300">
            <Clock className="w-5 h-5 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <div className="text-[10px] text-red-200/80 uppercase tracking-wider font-bold">
                Batas Waktu Pembayaran (Sanksi 3 Jam)
              </div>
              <div className="text-lg font-black text-red-400 tracking-widest">{timeLeftStr}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-1 rounded bg-red-900/80 text-red-200 text-[10px] border border-red-500/40 font-bold">
              PERMANENT BAN JIKA EXPIRED
            </span>
          </div>
        </div>

        {/* Asset Summary */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Nama Aset Digital:</span>
            <span className="font-bold text-cyan-300">{asset.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Harus Dibayar:</span>
            <span className="font-bold text-emerald-400 text-sm">${asset.priceUsdt} USDT</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Kontrak Profit:</span>
            <span className="text-fuchsia-300">{asset.dailyProfitPercent}% / Hari ({asset.contractDays} Hari)</span>
          </div>
        </div>

        {/* Seller Info & Direct WhatsApp Chat */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
            <span>Data Penjual Aset (P2P Direct)</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> E2E Encrypted
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-slate-500">Nama Penjual</div>
              <div className="font-semibold text-slate-200">{asset.sellerName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Akun Telegram</div>
              <div className="font-semibold text-sky-400">{asset.sellerPhone}</div>
            </div>
          </div>

          {/* Seller TRC20 Wallet Address for Direct Payment */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Alamat Wallet USDT Penjual (Jaringan TRC20):
              </span>
              <div className="flex items-center gap-1">
                {isAdminSeller && (
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <span>👑 WALLET KAS ADMIN</span>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider">
                  TRC20 ONLY
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-xs text-emerald-300 font-bold break-all flex-1 tracking-tight">
                {sellerWalletAddress}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sellerWalletAddress);
                  setCopiedWallet(true);
                  setTimeout(() => setCopiedWallet(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 transition shadow-md shadow-emerald-600/30 active:scale-95"
              >
                {copiedWallet ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Wallet</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-amber-300 font-medium leading-relaxed">
              💡 Transfer tepat <strong>${asset.priceUsdt} USDT</strong> ke Alamat Wallet TRC20 Penjual di atas, lalu masukkan TRX Hash / TxID di bawah ini.
            </p>
          </div>

          {/* Direct Telegram Chat Button */}
          <a
            href={asset.sellerPhone?.startsWith('@') ? `https://t.me/${asset.sellerPhone.replace('@', '')}` : 'https://t.me'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Chat Pribadi Penjual via Telegram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Payment Submission Form */}
        {isSubmitted ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center space-y-2 text-emerald-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm">Bukti Pembayaran Sukses Terkirim!</div>
            <div className="text-xs text-slate-300">Penjual dan Admin sedang memverifikasi transaksi TRX Hash Anda.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bukti Transaksi Crypto (TRX Hash / TxID) *</span>
              </label>
              <input
                type="text"
                required
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Unggah Foto Bukti Transfer (Opsional)</span>
              </label>
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Link Foto Receipt / URL Bukti Transfer"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Pesan Konfirmasi untuk Penjual</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Saya sudah mentransfer $50 USDT, mohon dikonfirmasi."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Bukti Pembayaran</span>
              </button>

              {/* Demo Trigger Sanction Button */}
              <button
                type="button"
                onClick={() => {
                  triggerSanctionAutoBan(currentUser.id, 'Simulasi Gagal Bayar 3 Jam');
                  onClose();
                }}
                title="Simulasi Telat Bayar / Ban System"
                className="px-3 py-3 rounded-xl bg-red-950/60 border border-red-500/50 hover:bg-red-900 text-red-300 text-[10px] font-bold"
              >
                Simulasi Ban
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
