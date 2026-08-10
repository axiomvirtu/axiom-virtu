import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  ShoppingBag,
  Wallet,
  User,
  ArrowRightLeft,
  MessageSquare,
  Megaphone,
  ShieldAlert,
  ChevronUp,
  Sparkles,
  Gift,
  Lock,
  LifeBuoy,
  Ticket,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAuthModalOpen,
    setIsSupportModalOpen,
    currentUser,
    notifications,
    addNotification,
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const isNewUserRestricted = currentUser.role === 'user' && !currentUser.isDepositDone;

  // Ringkas mode for Admin: Hide bottom navigation bar completely in admin mode
  if (currentUser.role === 'admin' || activeTab === 'admin') {
    return null;
  }

  const handleRestrictedTabClick = (tabName: string) => {
    if (isNewUserRestricted) {
      addNotification({
        type: 'SYSTEM',
        title: '⚠️ AKSES DIBATASI (MEMBER BARU)',
        message:
          'Pengguna baru hanya dapat mengakses menu Exchange untuk menukarkan Rupiah (IDR) ke USDT hingga deposit dikonfirmasi oleh Admin.',
      });
      setActiveTab('exchange');
      setIsMoreOpen(false);
      return;
    }
    setActiveTab(tabName);
    setIsMoreOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none flex flex-col items-center justify-end font-mono">
      {/* Secondary Cyber Popover Menu for Exchange, Chat, Admin */}
      {isMoreOpen && (
        <div className="pointer-events-auto mb-2 w-full max-w-sm p-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] animate-fade-in flex items-center justify-around gap-1 text-xs">
          {/* Exchange */}
          <button
            onClick={() => {
              setActiveTab('exchange');
              setIsMoreOpen(false);
            }}
            className={`flex-1 py-2 px-1 rounded-xl border transition flex flex-col items-center gap-1 ${
              activeTab === 'exchange'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold">Exchange</span>
          </button>

          {/* Komunitas / Chat */}
          <button
            onClick={() => handleRestrictedTabClick('chat')}
            className={`flex-1 py-2 px-1 rounded-xl border transition flex flex-col items-center gap-1 ${
              isNewUserRestricted
                ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : activeTab === 'chat'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              {isNewUserRestricted && <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />}
            </div>
            <span className="text-[10px] font-bold">Komunitas</span>
          </button>

          {/* Pengumuman / Notif */}
          <button
            onClick={() => handleRestrictedTabClick('announcements')}
            className={`flex-1 py-2 px-1 rounded-xl border transition flex flex-col items-center gap-1 relative ${
              isNewUserRestricted
                ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : activeTab === 'announcements'
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.4)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-500/30'
            }`}
          >
            <div className="relative">
              <Megaphone className="w-4 h-4 text-fuchsia-400" />
              {isNewUserRestricted && <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />}
            </div>
            <span className="text-[10px] font-bold">Pengumuman</span>
            {unreadNotifs > 0 && !isNewUserRestricted && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Support Ticket / Pengaduan */}
          <button
            onClick={() => {
              setIsSupportModalOpen(true);
              setIsMoreOpen(false);
            }}
            className="flex-1 py-2 px-1 rounded-xl border border-indigo-500/40 bg-indigo-950/80 text-indigo-300 hover:text-indigo-200 transition flex flex-col items-center gap-1"
          >
            <LifeBuoy className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold">Support</span>
          </button>

          {/* Admin Panel (If Role is Admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMoreOpen(false);
              }}
              className={`flex-1 py-2 px-1 rounded-xl border transition flex flex-col items-center gap-1 ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Cyber Floating Glassmorphism Navigation Bar */}
      <nav className="pointer-events-auto w-full max-w-md bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl p-1.5 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Subtle top neon ambient bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {isNewUserRestricted ? (
          /* Specialized Navigation Layout for Restricted New Users */
          <div className="flex items-center justify-between gap-1 px-1">
            {/* 1. TOP UP TIKET (MAIN ACCESS FOR UNVERIFIED USERS) */}
            <button
              type="button"
              onClick={() => setActiveTab('exchange')}
              className="flex-1 py-2 px-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/30 via-fuchsia-500/20 to-amber-500/30 text-amber-300 border border-amber-400/80 shadow-[0_0_18px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
              <div className="text-left">
                <div className="text-xs font-black tracking-wider text-amber-300 uppercase">TOP UP TIKET</div>
                <div className="text-[9px] text-amber-200/90 font-bold">Akses Membalas Verifikasi Akun</div>
              </div>
            </button>

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2 px-3 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 flex flex-col items-center justify-center transition"
            >
              <User className="w-5 h-5 text-slate-300" />
              <span className="text-[9px] font-bold mt-0.5">Profile</span>
            </button>
          </div>
        ) : (
          /* Standard Full Navigation for Active Users / Admins */
          <div className="flex items-center justify-between gap-1 px-1">
            {/* 1. HOME */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('announcements');
                setIsMoreOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl sm:rounded-2xl transition-all duration-300 relative group ${
                activeTab === 'announcements'
                  ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative">
                <Home className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === 'announcements' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''
                }`} />
                {activeTab === 'announcements' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight ${
                activeTab === 'announcements' ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : ''
              }`}>
                Home
              </span>
            </button>

            {/* 2. MARKET */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('market');
                setIsMoreOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl sm:rounded-2xl transition-all duration-300 relative group ${
                activeTab === 'market'
                  ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative">
                <ShoppingBag className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  activeTab === 'market' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''
                }`} />
                {activeTab === 'market' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight ${
                activeTab === 'market' ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : ''
              }`}>
                Market
              </span>
            </button>

            {/* QUICK TOGGLE MORE ACTION / CYBER CENTER BADGE */}
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`p-2 rounded-2xl border transition-all duration-300 shrink-0 shadow-lg ${
                isMoreOpen || ['exchange', 'chat', 'admin'].includes(activeTab)
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.5)] rotate-180 scale-110'
                  : 'bg-slate-900 border-cyan-500/40 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400'
              }`}
              title="Menu Lainnya (Exchange, Chat, Admin)"
            >
              <ChevronUp className="w-5 h-5 transition-transform duration-300" />
            </button>

            {/* 3. UNDIAN HADIAH (USER) / HISTORI DEPOSIT MEMBER (ADMIN) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('wallet');
                setIsMoreOpen(false);
              }}
              title={currentUser.role === 'admin' ? 'Histori Deposit Member' : 'Undian Hadiah'}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl sm:rounded-2xl transition-all duration-300 relative group ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-b from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300 border border-fuchsia-400/50 shadow-[0_0_15px_rgba(217,70,239,0.4)] scale-105'
                  : 'text-slate-400 hover:text-fuchsia-400 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative">
                {currentUser.role === 'admin' ? (
                  <Wallet className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === 'wallet' ? 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]' : ''
                  }`} />
                ) : (
                  <Gift className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === 'wallet' ? 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]' : ''
                  }`} />
                )}
                {activeTab === 'wallet' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#d946ef]" />
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold mt-1 tracking-tight text-center leading-none ${
                activeTab === 'wallet' ? 'text-fuchsia-300 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]' : ''
              }`}>
                {currentUser.role === 'admin' ? 'Histori Deposit' : 'Undian'}
              </span>
            </button>

            {/* 4. PROFILE */}
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(true);
                setIsMoreOpen(false);
              }}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl sm:rounded-2xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60 transition-all duration-300 relative group"
            >
              <div className="relative">
                <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">
                Profile
              </span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

