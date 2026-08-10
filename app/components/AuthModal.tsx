import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifiedBadge, UnverifiedBadge } from './VerifiedBadge';
import {
  X,
  Phone,
  MessageSquare,
  ShieldCheck,
  Fingerprint,
  Lock,
  Unlock,
  DollarSign,
  Ticket,
  Copy,
  CheckCircle2,
  Building2,
  AlertTriangle,
  QrCode,
  Upload,
  Image as ImageIcon,
  Save,
  Zap,
  LifeBuoy,
  Send,
} from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setCurrentUser,
    performInitialDeposit,
    topUpPaymentConfig,
    updateTopUpPaymentConfig,
    setIsTicketModalOpen,
    setIsSupportModalOpen,
  } = useApp();

  const [phoneInput, setPhoneInput] = useState(currentUser.phone);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletAddressInput, setWalletAddressInput] = useState(
    currentUser.walletAddress || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  );
  const [bankName, setBankName] = useState(currentUser.bankAccount?.bankName || topUpPaymentConfig.bankName);
  const [bankAcc, setBankAcc] = useState(currentUser.bankAccount?.accountNumber || topUpPaymentConfig.accountNumber);
  const [bankHolder, setBankHolder] = useState(currentUser.bankAccount?.accountHolder || topUpPaymentConfig.accountHolder);

  // QRIS Payment Config States
  const [qrisMerchantName, setQrisMerchantName] = useState(topUpPaymentConfig.qrisMerchantName);
  const [qrisNmid, setQrisNmid] = useState(topUpPaymentConfig.qrisNmid);
  const [qrisImageUrl, setQrisImageUrl] = useState(topUpPaymentConfig.qrisImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [savedNotify, setSavedNotify] = useState(false);

  if (!isOpen) return null;

  // TRC20 Address Validator: Must start with uppercase 'T' and be 34 characters long
  const isTrc20AddressValid = (addr: string): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) return false;
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed) || /^T[a-zA-Z0-9]{33}$/.test(trimmed);
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap unggah file berupa gambar (PNG, JPG, WEBP, GIF)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setQrisImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleSaveProfileAndPayment = () => {
    // Validate TRC20 address for non-admin user mode
    if (currentUser.role !== 'admin') {
      const trimmedWallet = walletAddressInput.trim();
      if (!isTrc20AddressValid(trimmedWallet)) {
        alert(
          "GAGAL MENYIMPAN ALAMAT WALLET!\n\nAlamat wallet USDT Anda HARUS menggunakan Jaringan TRC20 (Harus diawali huruf 'T' dan terdiri dari tepat 34 karakter kode unik).\n\nJaringan selain TRC20 (seperti ERC20, BEP20, Polygon, Solana) TIDAK DAPAT DIGUNAKAN!"
        );
        return;
      }
    }

    setCurrentUser((prev) => ({
      ...prev,
      phone: phoneInput,
      walletAddress: currentUser.role !== 'admin' ? walletAddressInput.trim() : prev.walletAddress,
      bankAccount: {
        bankName,
        accountNumber: bankAcc,
        accountHolder: bankHolder,
      },
    }));

    if (currentUser.role === 'admin') {
      updateTopUpPaymentConfig({
        bankName,
        accountNumber: bankAcc,
        accountHolder: bankHolder,
        qrisMerchantName,
        qrisNmid,
        qrisImageUrl,
      });
    }

    setSavedNotify(true);
    setTimeout(() => {
      setSavedNotify(false);
      onClose();
    }, 1000);
  };

  const handleSendOtp = () => {
    if (!phoneInput) return;
    setOtpSent(true);
    // Simulate auto-filling OTP code for convenience
    setTimeout(() => {
      setOtpInput('789123');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpInput === '789123' || otpInput.length === 6) {
      setOtpVerified(true);
      setCurrentUser((prev) => ({
        ...prev,
        phone: phoneInput,
        bankAccount: {
          bankName,
          accountNumber: bankAcc,
          accountHolder: bankHolder,
        },
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/80 p-5 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-mono text-base text-slate-100">Axiom Virtu Security Center</h3>
              <p className="text-xs text-slate-400 font-mono">WhatsApp Auth, Biometric & Deposit Lock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card & Verification Badge Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              {currentUser.isDepositDone ? (
                <VerifiedBadge size="sm" text="Verified" />
              ) : (
                <UnverifiedBadge size="sm" onClick={() => { onClose(); setIsTicketModalOpen(true); }} />
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{currentUser.phone}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsTicketModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-fuchsia-950/50 transition cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Beli Tiket</span>
          </button>
        </div>

        {/* 1. Account Lock / Minimum Deposit Status */}
        <div
          className={`p-4 rounded-xl border font-mono space-y-3 ${
            currentUser.isDepositDone
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentUser.isDepositDone ? (
                <Unlock className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400 animate-pulse" />
              )}
              <div>
                <div className="font-bold text-sm uppercase flex items-center gap-2">
                  <span>{currentUser.isDepositDone ? 'Status Akun: Terverifikasi (Aktif)' : 'Status Akun: Belum Verifikasi'}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {currentUser.isDepositDone
                    ? 'Akses penuh ke seluruh pasar sekunder, transaksi P2P, undian & exchange IDR.'
                    : 'Wajib melakukan pembelian minimal 1 Tiket ($1 USDT) untuk memverifikasi akun Anda.'}
                </div>
              </div>
            </div>
          </div>

          {!currentUser.isDepositDone && (
            <div className="pt-2 border-t border-amber-500/20 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsTicketModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-950/50 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Beli Tiket &amp; Verifikasi Akun Sekarang ($1 USDT)</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Telegram Account Connection & OTP Verification */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
            <Send className="w-4 h-4 text-sky-400" />
            <span>Koneksi Akun Telegram &amp; Verifikasi OTP</span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-slate-400">Akun / Handle Telegram Terhubung (@username)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Send className="w-4 h-4 absolute left-3 top-2.5 text-sky-400" />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="@username_telegram"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-sky-300 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                onClick={handleSendOtp}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {otpSent ? 'Kirim Ulang' : 'Kirim Kode'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="space-y-2 pt-1 border-t border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400">Kode OTP Telegram (6 Digit)</label>
                <span className="text-[10px] text-sky-400 font-mono">Simulasi OTP: 789123</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="789123"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-center tracking-widest text-sky-300 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Verifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Pengaturan Wallet USDT TRC20 & Rekening Bank (MODE USER & ADMIN) */}
        {currentUser.role !== 'admin' ? (
          /* USER MODE: WALLET TRC20 & REKENING BANK MEMBER */
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Wallet TRC20 & Rekening</span>
              </div>
              {savedNotify && (
                <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                  ✓ Tersimpan!
                </span>
              )}
            </div>

            {/* WALLET ADDRESS USDT JARINGAN TRC20 BOX */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Alamat Wallet USDT (Khusus Jaringan TRC20 / TRON):
                </label>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-extrabold uppercase">
                  TRC20 ONLY
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={walletAddressInput}
                  onChange={(e) => setWalletAddressInput(e.target.value)}
                  placeholder="Contoh: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                  className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-mono transition focus:outline-none ${
                    walletAddressInput.trim() === ''
                      ? 'border-slate-700 text-slate-100'
                      : isTrc20AddressValid(walletAddressInput)
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20 focus:border-emerald-400'
                      : 'border-red-500 text-red-300 bg-red-950/30 focus:border-red-400'
                  }`}
                />
              </div>

              {/* REALTIME TRC20 VALIDATION STATUS */}
              {walletAddressInput.trim() !== '' && (
                <div>
                  {isTrc20AddressValid(walletAddressInput) ? (
                    <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-[11px] text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold">✓ Alamat Wallet TRC20 Valid & Terverifikasi</div>
                        <div className="text-[10px] text-emerald-200/80">
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-[11px] text-red-200 space-y-2">
                      <div className="font-bold text-red-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>⚠️ DILARANG: ALAMAT TIDAK VALID / BUKAN TRC20!</span>
                      </div>
                      <p className="text-[10px] text-red-200/90 leading-tight">
                        Penarikan USDT hanya mendukung <strong>Jaringan TRC20 (TRON Network)</strong>. Jaringan selain TRC20 tidak dapat digunakan.
                      </p>
                      <div className="p-2 rounded-lg bg-slate-950/90 border border-red-500/40 text-[10px] font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Awalan Huruf Kapital 'T':</span>
                          <span
                            className={
                              walletAddressInput.trim().startsWith('T')
                                ? 'text-emerald-400 font-bold'
                                : 'text-red-400 font-bold'
                            }
                          >
                            {walletAddressInput.trim().startsWith('T')
                              ? '✓ Ya (Diawali T)'
                              : `❌ Salah (Diawali '${walletAddressInput.trim().charAt(0) || '-'}')`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">• Panjang Tepat 34 Karakter:</span>
                          <span
                            className={
                              walletAddressInput.trim().length === 34
                                ? 'text-emerald-400 font-bold'
                                : 'text-red-400 font-bold'
                            }
                          >
                            {walletAddressInput.trim().length === 34
                              ? '✓ 34 Karakter'
                              : `❌ ${walletAddressInput.trim().length}/34 Karakter`}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-amber-300 font-bold italic">
                        *Jaringan selain TRC20 (seperti ERC20, BEP20, Polygon, Solana) DILARANG!
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MEMBER REKENING BANK FOR IDR EXCHANGE */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Data Rekening Bank (Penarikan Rupiah IDR)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA / Mandiri / BRI"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Nomor Rekening</label>
                  <input
                    type="text"
                    value={bankAcc}
                    onChange={(e) => setBankAcc(e.target.value)}
                    placeholder="8830129481"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="A/N Pemilik Rekening"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfileAndPayment}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-200" />
              <span>Simpan Wallet TRC20 & Rekening Bank</span>
            </button>

            {/* PUSAT PENGADUAN & TIKET SUPPORT TRIGGER */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsSupportModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition flex items-center justify-between group cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-900/80 border border-indigo-500/50 text-indigo-300 group-hover:scale-110 transition">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-100">Pusat Pengaduan &amp; Tiket Support</div>
                    <div className="text-[10px] text-slate-400">Lapor user curang, bug sistem, atau kendala transaksi</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold group-hover:bg-indigo-500 group-hover:text-slate-950 transition">
                  Buka Helpdesk ➔
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ADMIN MODE: GLOBAL REKENING & BARCODE QRIS ADMIN CONFIG */
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
                <Building2 className="w-4 h-4 text-fuchsia-400" />
                <span>Pengaturan Rekening & Barcode QRIS Admin</span>
              </div>
              {savedNotify && (
                <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                  ✓ Tersimpan!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Nama Bank Admin</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BCA / Mandiri / BRI"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Nomor Rekening Admin</label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  placeholder="8830129481"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Nama Pemilik Rekening Admin</label>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="A/N Pemilik Rekening Admin"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* QRIS Configuration & Drag and Drop Image Box */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Barcode QRIS Admin</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-900/60 text-amber-300 border border-amber-500/40">
                  Global Admin QRIS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Nama Merchant QRIS</label>
                  <input
                    type="text"
                    value={qrisMerchantName}
                    onChange={(e) => setQrisMerchantName(e.target.value)}
                    placeholder="AXIOM DIGITAL QRIS"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">NMID QRIS</label>
                  <input
                    type="text"
                    value={qrisNmid}
                    onChange={(e) => setQrisNmid(e.target.value)}
                    placeholder="ID1020394820192"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* DRAG AND DROP QRIS IMAGE UPLOADER BOX */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold block">
                  Unggah / Drag & Drop Gambar Barcode QRIS:
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative p-3 rounded-xl border-2 border-dashed transition text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    isDragging
                      ? 'border-amber-400 bg-amber-500/20 scale-[1.02]'
                      : 'border-slate-700 bg-slate-900/90 hover:border-amber-500/50 hover:bg-slate-900'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {qrisImageUrl ? (
                    <div className="space-y-1.5 flex flex-col items-center">
                      <img
                        src={qrisImageUrl}
                        alt="QRIS Preview"
                        className="w-28 h-28 object-contain rounded-lg border border-amber-400/50 p-1.5 bg-white shadow-md mx-auto"
                      />
                      <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Gambar QRIS Siap Dipakai (Klik/Drag untuk ganti)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                      <div className="text-xs font-bold text-slate-200">
                        Tarik & Lepas File Gambar QRIS di sini
                      </div>
                      <div className="text-[9px] text-slate-400">
                        atau <span className="text-cyan-400 underline">Klik untuk Pilih Gambar</span> (PNG, JPG, WEBP)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfileAndPayment}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-cyan-200" />
              <span>Simpan Profil, Rekening & Barcode QRIS Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
