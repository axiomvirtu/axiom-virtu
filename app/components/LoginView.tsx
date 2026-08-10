import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { ConnectWithTelegram } from './ConnectWithTelegram';
import {
  ShieldCheck,
  Send,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    users,
    setCurrentUser,
    setIsLoggedIn,
    setActiveTab,
    addNotification,
    setUsers,
    addMutation,
  } = useApp();

  // Mode: TELEGRAM_CONNECT (default) or ADMIN_LOGIN
  const [authMode, setAuthMode] = useState<'TELEGRAM_CONNECT' | 'ADMIN_LOGIN'>('TELEGRAM_CONNECT');

  // Telegram Username handle state
  const [telegramHandle, setTelegramHandle] = useState('@trader_telegram');

  // Admin Login state
  const [adminUsername, setAdminUsername] = useState('Sacodaha');
  const [adminPassword, setAdminPassword] = useState('sacodaha123');
  const [showPassword, setShowPassword] = useState(false);

  // Status messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-detect Telegram WebApp Context
  const telegramWebAppUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;

  // Set default Telegram handle from Telegram WebApp SDK if available & reset admin session on user login view
  useEffect(() => {
    if (telegramWebAppUser?.username) {
      setTelegramHandle(`@${telegramWebAppUser.username}`);
    } else if (telegramWebAppUser?.first_name) {
      setTelegramHandle(`@${telegramWebAppUser.first_name.toLowerCase().replace(/\s+/g, '_')}`);
    }
  }, []);

  // Ensure current user is reset to normal user role if on Telegram Connect mode
  useEffect(() => {
    if (authMode === 'TELEGRAM_CONNECT') {
      const normalUser = users.find((u) => u.role === 'user');
      if (normalUser) {
        setCurrentUser(normalUser);
      }
    }
  }, [authMode]);

  const handleLoginSuccess = (targetUser: UserProfile) => {
    setErrorMessage(null);
    setCurrentUser(targetUser);
    setIsLoggedIn(true);

    if (targetUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('market');
    }

    addNotification({
      type: 'SYSTEM',
      title: 'Koneksi Telegram Berhasil',
      message: `Selamat datang kembali, ${targetUser.name} (${targetUser.phone}).`,
    });
  };

  // Connect Telegram Account Handler
  const handleTelegramConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const rawInput = telegramHandle.trim();
    if (!rawInput) {
      setErrorMessage('Harap masukkan username / handle Telegram Anda.');
      return;
    }

    const cleanHandle = rawInput.startsWith('@') ? rawInput : `@${rawInput}`;

    if (cleanHandle.length < 3) {
      setErrorMessage('Username Telegram tidak valid! Contoh: @username_anda');
      return;
    }

    // Check if user already exists with this handle (ensure only user accounts are matched)
    const existingUser = users.find(
      (u) =>
        u.role === 'user' &&
        (u.phone.toLowerCase() === cleanHandle.toLowerCase() ||
          u.name.toLowerCase() === cleanHandle.toLowerCase())
    );

    if (existingUser) {
      if (existingUser.isBanned) {
        setErrorMessage(
          `AKUN TERBLOKIR PERMANEN! Alasan: ${existingUser.banReason || 'Pelanggaran Aturan Market'}`
        );
        return;
      }

      setSuccessMessage(`Akun Telegram ${cleanHandle} terhubung! Mengalihkan ke website...`);
      setTimeout(() => {
        handleLoginSuccess(existingUser);
      }, 400);
      return;
    }

    // Provision new user instantly connected via Telegram (NO REGISTRATION FORM)
    const displayName = telegramWebAppUser?.first_name
      ? `${telegramWebAppUser.first_name} ${telegramWebAppUser.last_name || ''}`.trim()
      : `Trader ${cleanHandle.replace('@', '')}`;

    const newUser: UserProfile = {
      id: `usr_tg_${Date.now()}`,
      name: displayName,
      phone: cleanHandle, // Telegram Username / handle
      role: 'user',
      usdtBalance: 0,
      ticketBalance: 0,
      walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      isDepositDone: false,
      isLocked: true,
      isBanned: false,
      isVerified: true,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: '8830129481',
        accountHolder: displayName,
      },
      createdAt: new Date().toISOString(),
    };

    setUsers([newUser, ...users]);

    addMutation({
      type: 'USER_REGISTER',
      title: 'Koneksi Telegram Baru',
      description: `Akun ${displayName} (${cleanHandle}) berhasil dikoneksikan via Telegram.`,
      amount: 0,
      currency: 'USD',
      userId: newUser.id,
      userName: newUser.name,
      status: 'SUCCESS',
    });

    setSuccessMessage(`🎉 Akun Telegram ${cleanHandle} Berhasil Terkonek! Masuk ke website...`);

    setTimeout(() => {
      handleLoginSuccess(newUser);
    }, 500);
  };

  // Admin Login Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanInput = adminUsername.trim().toLowerCase();

    const adminUser = users.find(
      (u) =>
        u.role === 'admin' &&
        (u.name.toLowerCase() === cleanInput ||
          u.phone.toLowerCase() === cleanInput ||
          cleanInput === 'sacodaha')
    );

    if (adminUser) {
      const validPass = adminUser.password || 'sacodaha123';
      if (adminPassword.trim() !== validPass) {
        setErrorMessage('Password Administrator salah!');
        return;
      }
      setSuccessMessage('Login Administrator berhasil! Mengalihkan...');
      setTimeout(() => {
        handleLoginSuccess(adminUser);
      }, 400);
    } else {
      setErrorMessage('Username Administrator tidak ditemukan.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-mono selection:bg-sky-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-950/50 backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950 border border-sky-500/40 text-sky-400 text-xs font-bold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Axiom Virtu Telegram Auth API</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-slate-100">
              AXIOM<span className="text-sky-400">VIRTU</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans">
              Pasar Sekunder Aset Digital P2P Terenkripsi
            </p>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="font-mono">{errorMessage}</div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-mono">{successMessage}</div>
          </div>
        )}

        {/* TELEGRAM CONNECT MODE (DEFAULT) */}
        {authMode === 'TELEGRAM_CONNECT' ? (
          <div className="space-y-4">
            <ConnectWithTelegram />

            {/* Toggle link to Admin Login */}
            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAuthMode('ADMIN_LOGIN');
                }}
                className="text-xs text-slate-400 hover:text-sky-300 underline font-mono transition inline-flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Masuk sebagai Administrator</span>
              </button>
            </div>
          </div>
        ) : (
          /* ADMIN LOGIN MODE */
          <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>PORTAL LOG IN ADMINISTRATOR</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ADMIN ONLY
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">Username Administrator</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">Password Administrator</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer"
            >
              MASUK ADMINISTRATOR
            </button>

            <div className="pt-2 text-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAuthMode('TELEGRAM_CONNECT');
                }}
                className="text-xs text-sky-400 hover:underline font-mono inline-flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kembali ke Koneksi Telegram</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export { LoginScreen } from './LoginScreen';
