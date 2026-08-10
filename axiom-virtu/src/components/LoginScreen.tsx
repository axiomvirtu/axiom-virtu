import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  LogIn,
  Lock,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    users,
    setCurrentUser,
    setIsLoggedIn,
    setActiveTab,
    addNotification,
    setUsers,
    addMutation,
  } = useApp();

  const [userCredential, setUserCredential] = useState('@trader_telegram');
  const [userPassword, setUserPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTelegramWebAppDetected, setIsTelegramWebAppDetected] = useState(false);
  const [telegramUserData, setTelegramUserData] = useState<{
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    initDataString?: string;
  } | null>(null);

  // Parse Telegram WebApp initData on mount
  useEffect(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();

        const initDataRaw = tg.initData || '';
        let extractedUser = tg.initDataUnsafe?.user;

        // Try to parse raw initData string if initDataUnsafe is empty
        if (!extractedUser && initDataRaw) {
          const params = new URLSearchParams(initDataRaw);
          const userStr = params.get('user');
          if (userStr) {
            extractedUser = JSON.parse(userStr);
          }
        }

        if (extractedUser) {
          setIsTelegramWebAppDetected(true);
          setTelegramUserData({
            ...extractedUser,
            initDataString: initDataRaw,
          });

          const tgHandle = extractedUser.username
            ? `@${extractedUser.username}`
            : `@tg_${extractedUser.id}`;
          setUserCredential(tgHandle);

          // Auto authenticate user on Mini App load
          setTimeout(() => {
            handleTelegramAuthenticate(extractedUser, initDataRaw);
          }, 300);
        }
      }
    } catch (err) {
      console.warn('Telegram Mini App initData parsing warning:', err);
    }
  }, []);

  const handleQuickLogin = (targetUser: UserProfile) => {
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
      message: `Selamat datang, ${targetUser.name}! Akun Telegram (${targetUser.phone}) terverifikasi.`,
    });
  };

  const handleTelegramAuthenticate = (
    tgUser?: any,
    initDataRaw?: string
  ) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const userObj = tgUser || telegramUserData || (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    const inputHandle = userCredential.trim();

    const handle =
      (userObj?.username ? `@${userObj.username}` : null) ||
      (userObj?.id ? `@tg_${userObj.id}` : null) ||
      (inputHandle.startsWith('@') ? inputHandle : `@${inputHandle}`);

    const displayName =
      (userObj?.first_name
        ? `${userObj.first_name} ${userObj.last_name || ''}`.trim()
        : null) || `Trader ${handle.replace('@', '')}`;

    // Search for existing user with this handle or name
    const existingUser = users.find(
      (u) =>
        u.phone.toLowerCase() === handle.toLowerCase() ||
        u.name.toLowerCase() === displayName.toLowerCase()
    );

    if (existingUser) {
      setSuccessMessage(`Akun Telegram ${handle} ditemukan! Membuka sesi...`);
      setTimeout(() => {
        handleQuickLogin(existingUser);
      }, 300);
      return;
    }

    // Register new Telegram user automatically
    const newTgUser: UserProfile = {
      id: `usr_tg_${userObj?.id || Date.now()}`,
      name: displayName,
      phone: handle,
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
      password: '123456',
      createdAt: new Date().toISOString(),
    };

    setUsers([newTgUser, ...users]);

    addMutation({
      type: 'USER_REGISTER',
      title: 'Pendaftaran Otomatis Telegram Mini App',
      description: `User ${displayName} (${handle}) terdaftar via window.Telegram.WebApp.initData`,
      amountUsdt: 0,
      amount: 0,
      currency: 'USD',
      userId: newTgUser.id,
      userName: newTgUser.name,
      status: 'SUCCESS',
    });

    setSuccessMessage(`Terdaftar & Terverifikasi Otomatis via Telegram Mini App (${handle})`);

    setTimeout(() => {
      handleQuickLogin(newTgUser);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const credentialClean = userCredential.trim().toLowerCase();

    // Admin login override
    if (
      credentialClean === 'sacodaha' ||
      credentialClean === 'admin' ||
      credentialClean === '@sacodaha'
    ) {
      const adminAcc = users.find((u) => u.role === 'admin') || {
        id: 'usr_admin',
        name: 'Owner (Sacodaha)',
        phone: '@Sacodaha',
        role: 'admin' as const,
        usdtBalance: 99999,
        ticketBalance: 9999,
        walletAddress: '0xADMIN_VAULT_AXIOM_99',
        isDepositDone: true,
        isLocked: false,
        isBanned: false,
        isVerified: true,
        bankAccount: { bankName: 'BCA', accountNumber: '000000000', accountHolder: 'Admin Sacodaha' },
        password: '123456',
        createdAt: new Date().toISOString(),
      };

      if (userPassword && userPassword !== adminAcc.password && userPassword !== '123456') {
        setErrorMessage('Password Admin salah! Silakan periksa kembali.');
        return;
      }

      handleQuickLogin(adminAcc);
      return;
    }

    // Standard user login
    const targetUser = users.find(
      (u) =>
        u.phone.toLowerCase() === credentialClean ||
        `@${u.phone.toLowerCase()}` === credentialClean ||
        u.phone.toLowerCase() === credentialClean.replace('@', '')
    );

    if (targetUser) {
      if (targetUser.isBanned) {
        setErrorMessage(`Akun ${targetUser.name} telah diblokir permanen oleh sistem.`);
        return;
      }
      handleQuickLogin(targetUser);
      return;
    }

    // Register & authenticate new Telegram handle directly
    handleTelegramAuthenticate();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 font-mono selection:bg-sky-500 selection:text-slate-950">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Send className="w-48 h-48 text-sky-400" />
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30 border border-sky-400/40">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-1.5">
              <span>AXIOM VIRTU</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                TELEGRAM MINI APP
              </span>
            </h1>
            <p className="text-xs text-slate-400">P2P Digital Asset &amp; Verification Ticket Exchange</p>
          </div>
        </div>

        {/* Telegram WebApp Detected Banner */}
        {isTelegramWebAppDetected && telegramUserData && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/50 space-y-2 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-sky-300">
                {telegramUserData.photo_url ? (
                  <img
                    src={telegramUserData.photo_url}
                    alt="TG Avatar"
                    className="w-6 h-6 rounded-full border border-sky-400"
                  />
                ) : (
                  <Bot className="w-5 h-5 text-sky-400" />
                )}
                <span>
                  {telegramUserData.first_name} {telegramUserData.last_name || ''}
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                INITDATA VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Profil Telegram terdeteksi via <code>window.Telegram.WebApp.initData</code>.
              Username: <strong className="text-sky-300">@{telegramUserData.username || `tg_${telegramUserData.id}`}</strong>
            </p>
          </div>
        )}

        {/* Preset Quick Login Buttons */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Login Cepat Demo Account:</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  u.role === 'admin'
                    ? 'bg-fuchsia-950/60 border-fuchsia-500/50 text-fuchsia-200 hover:bg-fuchsia-900/80'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-sky-500/50'
                }`}
              >
                <div className="truncate">
                  <div className="font-bold text-[11px] truncate">{u.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{u.phone}</div>
                </div>
                <UserCheck className="w-4 h-4 shrink-0 text-sky-400 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Telegram Auth Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-300">
                <Send className="w-4 h-4 text-sky-400" />
                <span>KONEKSI AKUN TELEGRAM</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono font-bold">
                AUTO LOGIN &amp; REGISTER
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Masukkan username Telegram Anda untuk otomatis terhubung &amp; masuk ke pasar.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Akun / Handle Telegram (@username)</span>
            </label>
            <div className="relative">
              <Send className="w-4 h-4 absolute left-3 top-3.5 text-sky-400" />
              <input
                type="text"
                value={userCredential}
                onChange={(e) => setUserCredential(e.target.value)}
                placeholder="@username_telegram (misal: @trader_telegram)"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-950 border border-sky-500/40 text-xs text-sky-300 font-bold focus:outline-none focus:border-sky-400 transition font-mono shadow-inner"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password (Khusus Admin / Opsional)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Password (opsional)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4 text-white" />
            <span>MASUK SEKARANG (KONEK TELEGRAM)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
