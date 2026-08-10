import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CyberpunkTransitionOverlay, CyberOverlayData } from './CyberpunkTransitionOverlay';
import {
  RefreshCw,
  Lock,
  Unlock,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Send,
  DollarSign,
  TrendingUp,
  QrCode,
  Copy,
  XCircle,
  Wallet,
  Eye,
  ExternalLink,
  Ticket,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const ExchangeView: React.FC = () => {
  const {
    currentUser,
    exchangeRateUsdtToIdr,
    rateTickerSeconds,
    togglePriceLock,
    isRateLocked,
    lockedRateValue,
    createExchangeRequest,
    cancelExchangeRequest,
    exchangeRequests,
    topUpPaymentConfig,
    topUpTickets,
    setIsTicketModalOpen,
  } = useApp();

  const [mode, setMode] = useState<'CRYPTO_TO_IDR' | 'IDR_TO_CRYPTO'>('CRYPTO_TO_IDR');
  const [usdtAmountInput, setUsdtAmountInput] = useState<number>(20);
  const [buyTicketCount, setBuyTicketCount] = useState<number>(1);
  const [walletAddressInput, setWalletAddressInput] = useState<string>(currentUser.walletAddress || '');
  const [bankNameInput, setBankNameInput] = useState<string>(currentUser.bankAccount?.bankName || 'Bank BCA');
  const [accountNumberInput, setAccountNumberInput] = useState<string>(currentUser.bankAccount?.accountNumber || '');
  const [accountHolderInput, setAccountHolderInput] = useState<string>(currentUser.bankAccount?.accountHolder || currentUser.name || '');
  const [viewProofModalUrl, setViewProofModalUrl] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<'TICKET_TOPUP' | 'EXCHANGE'>('TICKET_TOPUP');
  const [cyberOverlay, setCyberOverlay] = useState<CyberOverlayData | null>(null);

  useEffect(() => {
    if (currentUser.walletAddress && !walletAddressInput) {
      setWalletAddressInput(currentUser.walletAddress);
    }
  }, [currentUser.walletAddress]);

  useEffect(() => {
    if (currentUser.bankAccount) {
      if (!bankNameInput) setBankNameInput(currentUser.bankAccount.bankName);
      if (!accountNumberInput) setAccountNumberInput(currentUser.bankAccount.accountNumber);
      if (!accountHolderInput) setAccountHolderInput(currentUser.bankAccount.accountHolder);
    }
  }, [currentUser.bankAccount]);

  const activeRate = isRateLocked && lockedRateValue ? lockedRateValue : exchangeRateUsdtToIdr;
  const estimatedIdr = usdtAmountInput * activeRate;
  const commission = estimatedIdr * 0.01; // 1% commission
  const finalIdr = mode === 'CRYPTO_TO_IDR' ? estimatedIdr - commission : estimatedIdr + commission;

  const userRequests = exchangeRequests.filter((r) => r.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usdtAmountInput <= 0) return;
    if (mode === 'IDR_TO_CRYPTO' && !walletAddressInput.trim()) {
      alert('Silakan masukkan alamat wallet USDT penerima terlebih dahulu!');
      return;
    }
    if (mode === 'CRYPTO_TO_IDR') {
      if (!bankNameInput.trim() || !accountNumberInput.trim() || !accountHolderInput.trim()) {
        alert('Silakan lengkapi data rekening bank / e-wallet penerima terlebih dahulu!');
        return;
      }
    }
    const formattedBankDetails = `${bankNameInput.trim()} - ${accountNumberInput.trim()} a/n ${accountHolderInput.trim()}`;
    createExchangeRequest(
      mode,
      usdtAmountInput,
      isRateLocked,
      mode === 'IDR_TO_CRYPTO' ? walletAddressInput.trim() : undefined,
      mode === 'CRYPTO_TO_IDR' ? formattedBankDetails : undefined
    );

    // Trigger Cyberpunk Swap Transition Animation
    setCyberOverlay({
      type: 'SWAP_EXCHANGE',
      amountUsdt: usdtAmountInput,
      idrAmount: finalIdr,
      message: mode === 'CRYPTO_TO_IDR'
        ? `Permintaan penukaran $${usdtAmountInput} USDT ke Rp ${Math.round(finalIdr).toLocaleString('id-ID')} berhasil dikirim ke Admin!`
        : `Permintaan top up Rp ${Math.round(finalIdr).toLocaleString('id-ID')} ke $${usdtAmountInput} USDT berhasil dikirim ke Admin!`,
    });
  };

  return (
    <div className="space-y-4 font-mono pb-20">
      {/* Welcome Banner for Newly Registered Users */}
      {currentUser.role === 'user' && !currentUser.isDepositDone && (
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/80 space-y-2.5 shadow-xl shadow-amber-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>AKUN BELUM TERVERIFIKASI — SYARAT: BELI TIKET AKTIVASI</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Selamat datang! Sebagai pengguna baru, Anda diwajibkan melakukan <strong>Pembelian Tiket (Min. 1 Tiket = $1 USDT / Rp {activeRate.toLocaleString('id-ID')})</strong> agar akun Anda terverifikasi dan seluruh fitur Pasar Sekunder & Undian terbuka.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-[11px] text-slate-300 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span>Status Verifikasi Akun:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-[9px] uppercase animate-pulse">
                ⏳ Menunggu Pembelian Tiket
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              💡 <strong>Petunjuk:</strong> Gunakan widget Pembelian Tiket di bawah ini untuk membeli tiket langsung via saldo USDT atau Transfer USDT TRC20 ke Wallet Admin.
            </div>
          </div>
        </div>
      )}

      {/* 🎟️ Dedicated Ticket Purchase & Account Verification Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-900/20 border-2 border-amber-500/60 shadow-xl space-y-3.5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Ticket className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>PEMBELIAN TIKET (SYARAT VERIFIKASI AKUN)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500 text-slate-950 font-black">
                  1 TIKET = $1 USDT
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Beli tiket untuk memverifikasi akun &amp; membuka akses Pasar Sekunder &amp; Undian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-[11px] flex items-center gap-1.5">
              <span className="text-slate-400">Saldo Tiket:</span>
              <strong className="text-amber-300 font-extrabold text-sm">{currentUser.ticketBalance} Tiket</strong>
            </div>
            {currentUser.isDepositDone ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>TERVERIFIKASI</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-amber-950 border border-amber-500/80 text-amber-300 font-extrabold text-[10px] flex items-center gap-1 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>BELUM VERIFIKASI</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-start gap-1.5 text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Syarat Utama Verifikasi:</strong> Pembelian minimal 1 Tiket ($1 USDT / Rp {activeRate.toLocaleString('id-ID')}) secara otomatis memverifikasi akun Anda dan membuka seluruh fitur platform.
            </div>
          </div>
        </div>

        {/* Preset Ticket Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-200">Pilih Jumlah Tiket yang Ingin Dibeli:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[1, 3, 5, 10].map((count) => {
              const isSelected = buyTicketCount === count;
              const priceUsdt = count;
              const priceIdr = count * activeRate;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBuyTicketCount(count)}
                  className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="font-extrabold text-sm">{count} Tiket</div>
                  <div className={`text-[10px] ${isSelected ? 'text-slate-900 font-bold' : 'text-amber-400 font-mono'}`}>
                    ${priceUsdt} USDT <span className="opacity-80">(Rp {Math.round(priceIdr).toLocaleString('id-ID')})</span>
                  </div>
                  {count === 1 && (
                    <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${isSelected ? 'bg-slate-950 text-amber-300 border border-amber-400' : 'bg-amber-500 text-slate-950'}`}>
                      Min Verifikasi
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="w-full sm:w-1/3">
            <div className="text-[10px] text-slate-400 mb-1">Jumlah Custom Tiket:</div>
            <input
              type="number"
              min={1}
              value={buyTicketCount}
              onChange={(e) => setBuyTicketCount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="w-full sm:w-2/3 pt-2 sm:pt-0">
            {/* USDT TRC20 Wallet Transfer Button - Single Focused Action */}
            <button
              type="button"
              onClick={() => {
                setIsTicketModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/50 cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <Wallet className="w-4 h-4 text-fuchsia-200" />
              <span>TRANSFER USDT TRC20 (${buyTicketCount} USDT)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Feature Section - Only Available For Verified Users or Admins */}
      {(currentUser.isDepositDone || currentUser.role === 'admin') && (
        <>
          {/* 1. Real-Time Market Rate Ticker Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/80 border border-cyan-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-cyan-300">
                  Kurs Realtime Crypto USDT / IDR
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 60s Ticker Timer */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                  <Clock className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Update: {rateTickerSeconds}s</span>
                </div>

                {/* Price Lock Toggle (Cut Harga) */}
                <button
                  onClick={togglePriceLock}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1 transition ${
                    isRateLocked
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'
                  }`}
                >
                  {isRateLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Harga Dikunci</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cut Harga (Lock)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Harga 1 USDT Market Dunia:</span>
                  <a
                    href="https://www.coingecko.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-bold"
                  >
                    www.coingecko.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="text-2xl font-black text-cyan-300">
                  Rp {activeRate.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CoinGecko Market Feed
                </span>
              </div>
            </div>
          </div>

          {/* 2. Exchange Form Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMode('CRYPTO_TO_IDR')}
                className={`py-2.5 rounded-xl font-bold border transition ${
                  mode === 'CRYPTO_TO_IDR'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Crypto (USDT) ➔ IDR Bank
              </button>
              <button
                onClick={() => setMode('IDR_TO_CRYPTO')}
                className={`py-2.5 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 ${
                  mode === 'IDR_TO_CRYPTO'
                    ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>IDR (QRIS Only) ➔ Crypto</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Jumlah USDT yang Ingin Ditukar:</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="number"
                    min={5}
                    value={usdtAmountInput}
                    onChange={(e) => setUsdtAmountInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Bank Account Destination Input for Crypto -> IDR */}
              {mode === 'CRYPTO_TO_IDR' && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-cyan-500/40">
                  <div className="flex items-center justify-between gap-1">
                    <label className="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rekening Bank / E-Wallet Penerima IDR:</span>
                    </label>
                    {currentUser.bankAccount && (
                      <button
                        type="button"
                        onClick={() => {
                          setBankNameInput(currentUser.bankAccount?.bankName || 'Bank BCA');
                          setAccountNumberInput(currentUser.bankAccount?.accountNumber || '');
                          setAccountHolderInput(currentUser.bankAccount?.accountHolder || currentUser.name || '');
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1 shrink-0"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ambil dari Profil</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Nama Bank / E-Wallet:</label>
                      <input
                        type="text"
                        required
                        value={bankNameInput}
                        onChange={(e) => setBankNameInput(e.target.value)}
                        placeholder="Contoh: BCA / Mandiri / DANA"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Nomor Rekening / HP:</label>
                      <input
                        type="text"
                        required
                        value={accountNumberInput}
                        onChange={(e) => setAccountNumberInput(e.target.value)}
                        placeholder="Contoh: 8830129481"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Atas Nama Pemilik:</label>
                      <input
                        type="text"
                        required
                        value={accountHolderInput}
                        onChange={(e) => setAccountHolderInput(e.target.value)}
                        placeholder="Nama Pemilik Rekening"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1 pt-0.5">
                    <span>💡 Admin akan mentransfer pencairan IDR ke rekening yang Anda masukkan di atas.</span>
                    {currentUser.bankAccount &&
                      accountNumberInput === currentUser.bankAccount.accountNumber && (
                        <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                          ✓ Sesuai Rekening Profil
                        </span>
                      )}
                  </div>
                </div>
              )}

              {/* USDT Destination Wallet input for IDR -> Crypto */}
              {mode === 'IDR_TO_CRYPTO' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-fuchsia-500/40">
                  <div className="flex items-center justify-between gap-1">
                    <label className="text-xs text-fuchsia-300 font-bold flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Alamat Wallet USDT Penerima:</span>
                    </label>
                    {currentUser.walletAddress && (
                      <button
                        type="button"
                        onClick={() => setWalletAddressInput(currentUser.walletAddress)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1 shrink-0"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ambil dari Profil ({currentUser.walletAddress.substring(0, 8)}...)</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    value={walletAddressInput}
                    onChange={(e) => setWalletAddressInput(e.target.value)}
                    placeholder="Contoh: 0x71C8a93Bf1D40... / T... (Alamat Wallet USDT Anda)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-fuchsia-300 font-bold focus:outline-none focus:border-fuchsia-400 font-mono"
                  />

                  <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1 pt-0.5">
                    <span>💡 Admin akan mengirimkan USDT ke alamat wallet yang tertera di sini.</span>
                    {currentUser.walletAddress && walletAddressInput === currentUser.walletAddress && (
                      <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        ✓ Sesuai Profil
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Kurs Diterapkan:</span>
                  <span className="text-slate-200">Rp {activeRate.toLocaleString('id-ID')} / USDT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Komisi Admin Exchange (1%):</span>
                  <span className="text-slate-300">Rp {commission.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-200 pt-1 border-t border-slate-800 font-bold">
                  <span>Total {mode === 'CRYPTO_TO_IDR' ? 'Diterima Pengguna' : 'Harus Di-Scan via QRIS'}:</span>
                  <span className="text-emerald-400 text-sm">
                    Rp {Math.round(finalIdr).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Instruksi Pembayaran Top-Up Exchange:</span>
                  {mode === 'IDR_TO_CRYPTO' && (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black uppercase">
                      Khusus Scan QRIS IDR
                    </span>
                  )}
                </div>

                {mode === 'CRYPTO_TO_IDR' ? (
                  <p>
                    Kirim USDT ke Wallet Admin: <strong className="text-cyan-300">0xADMIN_VAULT_AXIOM_99</strong>. Admin akan mentransfer IDR ke rekening registered Anda ({currentUser.bankAccount?.bankName || 'BCA'}).
                  </p>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/30 text-[10px] text-fuchsia-200 font-mono">
                      Transfer USDT Tujuan: <strong className="text-cyan-300 font-bold">{walletAddressInput || currentUser.walletAddress || 'Belum Diisi'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-center space-y-2">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        QRIS Top-Up IDR Resmi ({topUpPaymentConfig.qrisMerchantName})
                      </div>
                      <img
                        src={topUpPaymentConfig.qrisImageUrl}
                        alt="QRIS Code"
                        className="w-40 h-40 mx-auto rounded-xl border border-amber-500/40 p-2 bg-white object-contain shadow-lg"
                      />
                      <div className="text-xs font-bold text-emerald-400">
                        Scan Rp {Math.round(finalIdr).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                        <div>NMID: <strong className="text-slate-200">{topUpPaymentConfig.qrisNmid}</strong></div>
                        <div>Rek. Ref: <strong className="text-cyan-300">{topUpPaymentConfig.bankName} - {topUpPaymentConfig.accountNumber} ({topUpPaymentConfig.accountHolder})</strong></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {topUpPaymentConfig.instructionsNote || 'Scan QRIS di atas untuk melakukan top up IDR ke Crypto USDT.'}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Permintaan Exchange Ke Admin</span>
              </button>
            </form>
          </div>
        </>
      )}

      {/* 3. Dedicated User Transaction History & Top Up Tiket Dashboard */}
      {(() => {
        const ticketRequests = userRequests.filter((r) => r.isTicketPurchase);
        const exchangeOnlyRequests = userRequests.filter((r) => !r.isTicketPurchase);
        const displayedRequests = historyTab === 'TICKET_TOPUP' ? ticketRequests : exchangeOnlyRequests;

        return (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Riwayat &amp; Status Transaksi Saya
                </h3>
              </div>

              {/* Navigation Tabs to strictly separate Top Up Tiket from Exchange */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setHistoryTab('TICKET_TOPUP')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'TICKET_TOPUP'
                      ? 'bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white shadow-md shadow-amber-950/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Dashboard Top Up Tiket ({ticketRequests.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryTab('EXCHANGE')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'EXCHANGE'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Riwayat Exchange ({exchangeOnlyRequests.length})</span>
                </button>
              </div>
            </div>

            {displayedRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                {historyTab === 'TICKET_TOPUP'
                  ? 'Belum ada transaksi Top Up Tiket.'
                  : 'Belum ada riwayat penukaran/exchange USDT.'}
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {displayedRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3 rounded-xl bg-slate-950 border transition space-y-2 ${
                      req.status === 'COMPLETED'
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : req.status === 'PROCESSING'
                        ? 'border-cyan-500/50 bg-cyan-950/20'
                        : req.status === 'REJECTED' || req.status === 'CANCELLED'
                        ? 'border-red-500/30 bg-red-950/10'
                        : 'border-amber-500/40 bg-amber-950/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-black text-slate-100 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>
                            {req.isTicketPurchase
                              ? `Top Up Tiket Verifikasi`
                              : req.type === 'CRYPTO_TO_IDR'
                              ? 'Penukaran USDT ➔ IDR Bank'
                              : 'Pembelian IDR ➔ USDT'}
                          </span>
                          <span className={req.isTicketPurchase ? 'text-fuchsia-300 font-extrabold' : 'text-cyan-300'}>
                            {req.isTicketPurchase
                              ? `(${req.ticketCount || req.amountUsdt} Tiket)`
                              : `($${req.amountUsdt} USDT)`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Metode Bayar: <strong className="text-amber-300">USDT TRC20</strong> • Tanggal: {new Date(req.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                            : req.status === 'PROCESSING'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm shadow-cyan-500/20 animate-pulse'
                            : req.status === 'REJECTED' || req.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {req.status === 'COMPLETED' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>SUKSES</span>
                          </>
                        )}
                        {req.status === 'PROCESSING' && (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            <span>PROSES ADMIN</span>
                          </>
                        )}
                        {req.status === 'PENDING' && (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>PENDING</span>
                          </>
                        )}
                        {(req.status === 'REJECTED' || req.status === 'CANCELLED') && (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>{req.status === 'REJECTED' ? 'DITOLAK' : 'DIBATALKAN'}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Details & Action Controls */}
                    {req.status === 'COMPLETED' ? (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-[11px] space-y-2 font-mono text-slate-300">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>✓ Status: Selesai Disetujui Admin</span>
                          <span className="text-[9px] text-slate-400">
                            {req.approvedAt ? new Date(req.approvedAt).toLocaleTimeString('id-ID') : 'Selesai'}
                          </span>
                        </div>
                        <div>
                          No. Referensi / TxHash: <strong className="text-cyan-300 font-extrabold select-all">{req.adminProofTxHash || 'TRC20_TX_SUCCESS'}</strong>
                        </div>
                        {req.adminNote && (
                          <div className="text-[10px] text-slate-400 italic">
                            Catatan Admin: "{req.adminNote}"
                          </div>
                        )}
                      </div>
                    ) : req.status === 'PROCESSING' ? (
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-[11px] text-cyan-200 font-mono space-y-1">
                        <div className="flex items-center gap-1.5 font-black text-cyan-300 uppercase text-[10px]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>⚡ SEDANG DIPROSES OLEH ADMIN</span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Transaksi ini telah masuk ke antrean verifikasi Admin.
                        </p>
                      </div>
                    ) : req.status === 'PENDING' ? (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="text-amber-300 font-bold">⏳ Menunggu Verifikasi Admin</div>
                          <div className="text-slate-400 text-[9px]">Anda dapat membatalkan sebelum diproses oleh Admin.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Yakin ingin membatalkan transaksi ini?')) {
                              cancelExchangeRequest(req.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-bold text-[10px] shrink-0 transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Batalkan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-red-500/20 text-[10px] text-red-300 font-mono">
                        {req.status === 'REJECTED' ? `❌ Ditolak oleh Admin: ${req.adminNote || 'Bukti transfer tidak valid.'}` : '✕ Transaksi ini telah dibatalkan.'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal Lightbox Preview Foto Bukti Transfer Admin */}
      {viewProofModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Foto Bukti Pengiriman Transfer dari Admin</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewProofModalUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center p-2 min-h-[200px]">
              <img
                src={viewProofModalUrl}
                alt="Bukti Transfer Admin"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <a
                href={viewProofModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Buka Foto Asli di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setViewProofModalUrl(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyberpunk Swap / Exchange Transition Animation Overlay */}
      <CyberpunkTransitionOverlay
        data={cyberOverlay}
        onClose={() => setCyberOverlay(null)}
      />
    </div>
  );
};
