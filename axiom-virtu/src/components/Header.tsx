import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifiedBadge, UnverifiedBadge } from './VerifiedBadge';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Ticket,
  Wallet,
  Bell,
  UserCheck,
  ShieldAlert,
  Fingerprint,
  LogOut,
  PlusCircle,
  LifeBuoy,
} from 'lucide-react';

export const Header: React.FC<{ onOpenNotifs: () => void }> = ({ onOpenNotifs }) => {
  const {
    currentUser,
    switchUserRole,
    notifications,
    setIsAuthModalOpen,
    setIsTicketModalOpen,
    setIsSupportModalOpen,
    setIsLoggedIn,
    logout,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-slate-950/95 border-b border-cyan-500/30 backdrop-blur-md px-2.5 py-2 sticky top-0 z-30 w-full overflow-x-auto no-scrollbar scrollbar-none touch-pan-x">
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        {/* Brand & Security Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            title="Buka Pusat Keamanan Profil"
            className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer hover:scale-105 transition"
          >
            <div className="w-full h-full bg-slate-950 rounded-[6px] sm:rounded-[7px] flex items-center justify-center">
              <span className="font-extrabold text-[10px] sm:text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-tighter">
                AXM
              </span>
            </div>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-mono whitespace-nowrap">
              <span className="font-bold text-xs sm:text-sm tracking-wider text-slate-100 uppercase">
                AXIOM<span className="text-cyan-400 font-extrabold">VIRTU</span>
              </span>

              {/* Verified Blue Badge Indicator */}
              {currentUser.isDepositDone ? (
                <VerifiedBadge size="sm" text="Verified" />
              ) : (
                <UnverifiedBadge size="sm" onClick={() => setIsTicketModalOpen(true)} />
              )}
            </div>

            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-mono whitespace-nowrap">
              {currentUser.biometricEnabled && (
                <span className="flex items-center gap-0.5 text-cyan-400 font-semibold whitespace-nowrap">
                  <Fingerprint className="w-2.5 h-2.5 shrink-0" />
                  Bio-Active
                </span>
              )}
              <span className="opacity-50">•</span>
              <span
                className={`font-semibold whitespace-nowrap ${
                  currentUser.isLocked ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {currentUser.isLocked ? 'Status: Terkunci' : 'Status: Aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Badges & Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Ticket Pill & Buy Ticket Trigger */}
          <button
            type="button"
            onClick={() => setIsTicketModalOpen(true)}
            title="Beli Tiket Verifikasi Akun"
            className="cursor-pointer flex items-center gap-1 px-1.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-950 to-slate-900 border border-fuchsia-500/50 text-[10px] sm:text-xs font-mono text-fuchsia-300 hover:border-fuchsia-400 hover:scale-105 transition whitespace-nowrap shrink-0 shadow-md shadow-fuchsia-950/50"
          >
            <Ticket className="w-3 h-3 text-fuchsia-400 shrink-0" />
            <span className="font-bold">{currentUser.ticketBalance}</span>
            <span className="text-[9px] text-slate-400">TKT</span>
            <PlusCircle className="w-3 h-3 text-amber-400 shrink-0 ml-0.5 animate-pulse" />
          </button>

          {/* Static Admin Badge if logged in as Admin */}
          {currentUser.role === 'admin' && (
            <div className="px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-semibold flex items-center gap-1 bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-500/50 whitespace-nowrap shrink-0">
              <ShieldAlert className="w-3 h-3 text-fuchsia-400 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </div>
          )}

          {/* Support Ticket / Helpdesk Button */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            title="Pusat Pengaduan & Tiket Support"
            className="p-1 sm:p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 hover:text-indigo-200 hover:scale-105 transition shrink-0 flex items-center gap-1 shadow-sm"
          >
            <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
            <span className="hidden md:inline text-[10px] font-bold">Support</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifs}
            title="Notifikasi"
            className="relative p-1 sm:p-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition shrink-0"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-fuchsia-600 text-white font-mono text-[8px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Log Out / Login Page Button */}
          <button
            onClick={() => logout()}
            title="Keluar / Halaman Login"
            className="p-1 sm:p-1.5 rounded-lg bg-slate-900 border border-red-500/30 text-slate-400 hover:text-red-400 hover:border-red-500/60 transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

