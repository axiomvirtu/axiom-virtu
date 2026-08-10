import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifiedBadge, UnverifiedBadge } from './VerifiedBadge';
import {
  X,
  Ticket,
  DollarSign,
  QrCode,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  Send,
  Clock,
  Wallet,
  Building2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    topUpTickets,
    exchangeRateUsdtToIdr,
    topUpPaymentConfig,
    createExchangeRequest,
  } = useApp();

  const [ticketCount, setTicketCount] = useState<number>(1);
  const [userProofInput, setUserProofInput] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [successStatus, setSuccessStatus] = useState<'ON_PROCESS' | 'INSTANT_SUCCESS'>('ON_PROCESS');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const costUsdt = Math.max(1, ticketCount);
  const costIdr = Math.round(costUsdt * exchangeRateUsdtToIdr);

  const adminWalletAddress = topUpPaymentConfig.adminUsdtTrc20Address || 'TY3v7x89K2m9pL1aN4sQ8wZ5eX7rT6uV9w';

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(adminWalletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handlePayUsdtTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const proofText = userProofInput.trim() || 'Transfer USDT TRC20 ke Wallet Admin';
    createExchangeRequest(
      'IDR_TO_CRYPTO',
      costUsdt,
      true,
      currentUser.walletAddress,
      undefined,
      proofText,
      true,
      ticketCount
    );

    setSuccessStatus('ON_PROCESS');
    setIsSuccessState(true);
    setSuccessMessage(
      `Permintaan Top Up ${ticketCount} Tiket ($${costUsdt} USDT) telah berhasil terkirim ke Admin. Status saat ini ON PROCESS (Menunggu Verifikasi). Setelah Admin memeriksa bukti/TX Hash transfer Anda, tiket akan otomatis ditambahkan ke akun Anda dan Lencana Centang Biru diaktifkan!`
    );
  };

  const handleResetAndClose = () => {
    setIsSuccessState(false);
    setUserProofInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-fuchsia-500/60 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl shadow-fuchsia-950/80 p-5 space-y-4 text-slate-100 relative">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300">
              <Ticket className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <span>Pembelian Tiket Verifikasi</span>
              </h3>
              <p className="text-xs text-fuchsia-300 font-mono">1 Tiket = $1.00 USDT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Market Benchmark Info */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Patokan Rate: www.coingecko.com</span>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-black">
              $1 USDT = Rp {exchangeRateUsdtToIdr.toLocaleString('id-ID')}
            </div>
            <div className="text-[9px] text-slate-400">Live CoinGecko API</div>
          </div>
        </div>

        {/* User Account Verification Status Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Status Akun Anda Saat Ini:</span>
            {currentUser.isDepositDone ? (
              <VerifiedBadge size="md" text="TERVERIFIKASI" />
            ) : (
              <UnverifiedBadge size="md" />
            )}
          </div>
          {!currentUser.isDepositDone ? (
            <p className="text-[11px] text-amber-200/90 leading-relaxed bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
              ⚡ <strong>Syarat Verifikasi Akun:</strong> Pembelian minimal <strong>1 Tiket ($1 USDT / Rp {exchangeRateUsdtToIdr.toLocaleString('id-ID')})</strong> secara otomatis mengubah status akun Anda menjadi <strong>VERIFIED (Terverifikasi)</strong> dan membuka seluruh fitur Pasar Sekunder &amp; Undian.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-300/90 leading-relaxed bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
              ✓ Akun Anda sudah TERVERIFIKASI. Anda dapat membeli tiket tambahan kapan saja untuk berpartisipasi dalam transaksi pasar dan undian.
            </p>
          )}
        </div>

        {/* Success Overlay View */}
        {isSuccessState ? (
          <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/70 text-center space-y-4 animate-fade-in shadow-2xl">
            {successStatus === 'ON_PROCESS' ? (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 animate-pulse shadow-lg shadow-amber-500/30">
                <Clock className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {successStatus === 'ON_PROCESS' ? '⏳ STATUS: ON PROCESS (MENUNGGU VERIFIKASI ADMIN)' : '✓ TRANSAKSI TIKET SUKSES'}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900 p-3 rounded-xl border border-slate-800">
                {successMessage}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Tiket Diorder:</span>
                <strong className="text-fuchsia-300 font-extrabold">{ticketCount} Tiket (${costUsdt} USDT)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Status Verifikasi:</span>
                <span className="text-amber-400 font-bold">
                  {successStatus === 'ON_PROCESS' ? 'ON PROCESS (Menunggu Admin)' : 'TERVERIFIKASI'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-950/50 cursor-pointer"
            >
              Tutup &amp; Cek Status Transaksi
            </button>
          </div>
        ) : (
          <>
            {/* Ticket Quantity Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Pilih Jumlah Tiket:</span>
                <span className="text-fuchsia-300 text-[11px] font-mono">Total: ${costUsdt} USDT (Rp {costIdr.toLocaleString('id-ID')})</span>
              </label>

              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {[1, 3, 5, 10, 20].map((num) => {
                  const isSelected = ticketCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTicketCount(num)}
                      className={`py-2.5 rounded-xl border font-black transition relative cursor-pointer ${
                        isSelected
                          ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/40 scale-105'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm">{num}</div>
                      <div className="text-[9px] opacity-80">${num}</div>
                      {num === 1 && (
                        <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded text-[7px] bg-amber-500 text-slate-950 font-black uppercase">
                          Min Ver
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Quantity Input */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Atau Jumlah Custom:</span>
                <input
                  type="number"
                  min={1}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl px-3 py-1.5 text-xs text-fuchsia-300 font-extrabold focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>

            {/* Payment Method Notice - Strictly USDT TRC20 */}
            <div className="pt-2 space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-200 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-extrabold text-xs">Pembayaran Khusus: USDT TRC20</div>
                    <div className="text-[10px] text-emerald-300/80 font-mono">Direct Wallet Transfer ke Admin</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                  USDT TRC20 ONLY
                </span>
              </div>

              {/* Payment Details Form */}
              <form onSubmit={handlePayUsdtTransfer} className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold text-slate-300">Alamat Wallet USDT TRC20 Admin Resmi:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold">
                    TRC20 / TRON Network
                  </span>
                </div>

                {/* Admin Wallet Display & Copy Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-2">
                  <div className="text-[10px] text-slate-400">Kirimkan Tepat ${costUsdt} USDT TRC20 ke Address:</div>
                  <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="font-mono text-xs text-emerald-300 font-extrabold break-all">
                      {adminWalletAddress}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shrink-0 flex items-center gap-1 text-[10px]"
                      title="Salin Wallet Address Admin"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200/90 leading-tight flex items-start gap-1.5 font-sans">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Catatan:</strong> Setelah mentransfer ${costUsdt} USDT TRC20 ke wallet admin di atas, masukkan <strong>TX Hash / ID Transaksi</strong> Anda di bawah ini agar admin dapat memverifikasinya. Status transaksi Anda akan bernilai <strong>ON PROCESS</strong> hingga diverifikasi admin.
                  </span>
                </div>

                {/* Proof Input Field */}
                <div className="space-y-1 font-sans">
                  <label className="text-[11px] text-slate-300 font-bold block">
                    TX Hash / Bukti Transfer TRC20 Anda:
                  </label>
                  <input
                    type="text"
                    required
                    value={userProofInput}
                    onChange={(e) => setUserProofInput(e.target.value)}
                    placeholder="e.g. TXID: a1b2c3d4e5f6... / Nama Pengirim"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Kirim Konfirmasi Transfer USDT (${costUsdt} USDT)</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
