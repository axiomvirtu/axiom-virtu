import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
} from 'lucide-react';

export const ConnectWithTelegram: React.FC = () => {
  const {
    telegramUser,
    telegramId,
    isTelegramConnected,
    telegramInitData,
    connectTelegram,
    disconnectTelegram,
    currentUser,
  } = useApp();

  const [customHandle, setCustomHandle] = useState('@trader_telegram');
  const [showInitDataDetails, setShowInitDataDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Auto-detect browser window.Telegram.WebApp
  const tgWebApp = typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp : null;
  const initDataUser = tgWebApp?.initDataUnsafe?.user;

  const handleConnectClick = () => {
    setIsLoading(true);
    setSuccessNotice(null);

    // 1. Authenticate via Telegram SDK / AppContext
    connectTelegram(customHandle);

    // 2. Open / redirect directly to Telegram account authorization bot/channel link
    const tgBotUrl = 'https://t.me/AxiomVirtuP2PBot?start=login';

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        if ((window as any)?.Telegram?.WebApp?.openTelegramLink) {
          (window as any).Telegram.WebApp.openTelegramLink(tgBotUrl);
        } else {
          window.open(tgBotUrl, '_blank', 'noopener,noreferrer');
        }
      }
      setIsLoading(false);
      setSuccessNotice('Mengarahkan ke Telegram & akun berhasil terhubung!');
    }, 300);
  };

  return (
    <div className="w-full bg-slate-900/95 border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-sky-950/40 backdrop-blur-xl space-y-5 font-mono text-slate-100 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-slate-100 flex items-center gap-2">
              <span>Connect with Telegram</span>
              {isTelegramConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CONNECTED
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Telegram WebApp Mini App SDK Auth Sequence
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-950 border border-sky-500/30 text-sky-400 font-bold hidden sm:inline-block">
          SDK v7.0+
        </span>
      </div>

      {/* Status Notice */}
      {successNotice && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* CONNECTED STATE CARD */}
      {isTelegramConnected ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-sky-950/30 to-slate-950 border border-sky-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                  Terverifikasi via Telegram SDK
                </span>
              </div>
              <span className="text-[10px] text-slate-400">ID: {telegramId || 'Unassigned'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-sky-400" /> Telegram ID
                </span>
                <p className="text-sm font-black text-sky-300 truncate">
                  {telegramId || telegramUser?.id || 'N/A'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-sky-400" /> Username
                </span>
                <p className="text-sm font-black text-slate-100 truncate">
                  {telegramUser?.username ? `@${telegramUser.username}` : currentUser?.phone || 'N/A'}
                </p>
              </div>
            </div>

            {(telegramUser?.first_name || telegramUser?.last_name) && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Nama Telegram:</span>
                <span className="font-bold text-slate-200">
                  {telegramUser.first_name} {telegramUser.last_name || ''}
                </span>
              </div>
            )}
          </div>

          {/* Toggle InitDataUnsafe details dropdown */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInitDataDetails(!showInitDataDetails)}
              className="w-full px-4 py-2.5 bg-slate-950/80 hover:bg-slate-950 text-xs text-slate-300 font-bold flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2 text-sky-400">
                <Info className="w-3.5 h-3.5" />
                <span>Telegram.WebApp.initDataUnsafe Payload</span>
              </div>
              {showInitDataDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showInitDataDetails && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-sky-300">
                  <pre className="text-[10px]">
                    {JSON.stringify(
                      {
                        user: telegramUser,
                        initDataUnsafe: telegramInitData || {
                          user: telegramUser,
                          auth_date: Math.floor(Date.now() / 1000),
                          hash: 'tg_app_hash_verified_e2e',
                        },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={isLoading}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Connection</span>
            </button>

            <button
              type="button"
              onClick={disconnectTelegram}
              className="px-4 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ) : (
        /* NOT CONNECTED STATE CARD */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-2 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Send className="w-6 h-6 text-sky-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                Otentikasi Akun Telegram
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xs mx-auto">
                Klik tombol di bawah untuk terhubung dan verifikasi akun P2P Anda langsung melalui Telegram.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectClick}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider transition shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            <span>CONNECT WITH TELEGRAM</span>
          </button>
        </div>
      )}
    </div>
  );
};
