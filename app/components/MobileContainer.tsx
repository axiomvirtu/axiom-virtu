import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Header } from './Header';
import { Marketplace } from './Marketplace';
import { WalletView } from './WalletView';
import { UndianView } from './UndianView';
import { ExchangeView } from './ExchangeView';
import { AnnouncementsView } from './AnnouncementsView';
import { CommunityChatView } from './CommunityChatView';
import { AdminPanel } from './AdminPanel';
import { AuthModal } from './AuthModal';
import { TicketPurchaseModal } from './TicketPurchaseModal';
import { OutOfTicketsModal } from './OutOfTicketsModal';
import { PaymentModal } from './PaymentModal';
import { SupportTicketModal } from './SupportTicketModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { DigitalAsset } from '../types';
import { LoginView } from './LoginView';
import { BottomNav } from './BottomNav';
import {
  ShoppingBag,
  Wallet,
  ArrowRightLeft,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  Lock,
  Battery,
  Wifi,
  Signal,
  XCircle,
  Globe,
  Smartphone,
  Fingerprint,
  KeyRound,
  UserCheck,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const MobileContainer: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isLoggedIn,
    isMobilePreviewMode,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isTicketModalOpen,
    setIsTicketModalOpen,
    isOutOfTicketsModalOpen,
    setIsOutOfTicketsModalOpen,
    activeWinningAsset,
    setActiveWinningAsset,
    switchUserRole,
    unbanUser,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedPaymentAsset, setSelectedPaymentAsset] = useState<DigitalAsset | null>(null);

  // Telegram Mini App WebApp Initialization & Auto-Expand
  useEffect(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const isAtLeast61 = typeof tg.isVersionAtLeast === 'function' ? tg.isVersionAtLeast('6.1') : false;
        if (isAtLeast61 && typeof tg.setHeaderColor === 'function') {
          tg.setHeaderColor('#020617');
        }
        if (isAtLeast61 && typeof tg.setBackgroundColor === 'function') {
          tg.setBackgroundColor('#020617');
        }
      }
    } catch (e) {
      console.warn('Telegram WebApp context warning:', e);
    }
  }, []);

  // Auto-enforce Exchange mode for newly registered users (unverified deposit)
  React.useEffect(() => {
    if (isLoggedIn && currentUser.role === 'user' && !currentUser.isDepositDone) {
      if (activeTab !== 'exchange') {
        setActiveTab('exchange');
      }
    }
  }, [isLoggedIn, currentUser, activeTab, setActiveTab]);

  const handleOpenPayment = (asset: DigitalAsset) => {
    setSelectedPaymentAsset(asset);
  };

  // If not logged in -> Show Login Page
  if (!isLoggedIn) {
    return <LoginView />;
  }

  // If user is banned due to payment default or violation -> Hard Ban
  if (currentUser.isBanned) {
    const details = currentUser.banDetails || {
      ipAddress: currentUser.ipAddress || '180.252.31.99',
      deviceId: currentUser.deviceId || `DEV-HW-${currentUser.id.toUpperCase()}-LOCKED`,
      whatsappNumber: currentUser.phone,
      bannedAt: Date.now(),
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 font-mono text-slate-100 selection:bg-red-500 selection:text-white">
        <div className="max-w-lg w-full bg-slate-900/90 border-2 border-red-500 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-2xl shadow-red-950/80 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Badge */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/60 flex items-center justify-center mx-auto text-red-400 animate-pulse shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/10 border border-red-500/40 text-[10px] font-black text-red-400 uppercase tracking-widest">
              <Lock className="w-3 h-3 text-red-400" /> SANKSI HARD BAN PERMANEN
            </div>
            <h2 className="font-black text-lg sm:text-xl text-slate-100 tracking-tight">
              AKUN DIBLOKIR TOTAL SECARA PERMANEN
            </h2>
            <p className="text-xs text-red-300">
              Sistem keamanan E2E Axiom Virtu telah memblokir 3 Identitas Keamanan Utama Anda.
            </p>
          </div>

          {/* 3-Point Security Lock Box */}
          <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-red-500/40 space-y-2 text-left text-xs font-mono">
            <div className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>Status 3 Parameter Terblokir:</span>
              <span className="text-[9px] text-slate-500">
                {new Date(details.bannedAt || Date.now()).toLocaleDateString('id-ID')}
              </span>
            </div>

            {/* 1. Telegram Account */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Akun Telegram</div>
                  <div className="font-bold text-slate-100">{details.whatsappNumber}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                TG BLACKLISTED
              </span>
            </div>

            {/* 2. IP Address */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">IP Address Jaringan</div>
                  <div className="font-bold text-slate-100">{details.ipAddress}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                IP BANNED
              </span>
            </div>

            {/* 3. Device Hardware ID */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Hardware Device Signature</div>
                  <div className="font-bold text-slate-100">{details.deviceId}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                HARDWARE LOCKED
              </span>
            </div>

            {/* Reason */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Alasan Pemblokiran: </span>
              <span className="font-bold text-red-400">{currentUser.banReason || 'Batas waktu pembayaran 3 jam telah kedaluwarsa / Pelanggaran aturan pasar.'}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left">
            ⚠️ <strong>Catatan Keamanan:</strong> Seluruh permintaan koneksi dari alamat IP, perangkat, ataupun nomor WhatsApp yang terkait dengan identitas ini akan ditolak secara otomatis oleh firewall node Axiom.
          </p>

          {/* Admin Override Unban Control */}
          {currentUser.role === 'admin' && (
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => unbanUser(currentUser.id)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>Unban Akun Ini (Admin)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start selection:bg-cyan-500 selection:text-slate-950 ${
        isMobilePreviewMode ? 'p-0 sm:p-4' : 'p-0'
      }`}
    >
      {/* Container Wrapper (Mobile Frame or Fullscreen) */}
      <div
        className={`w-full transition-all duration-300 bg-slate-950 border-slate-800 relative flex flex-col overflow-x-hidden min-h-screen ${
          isMobilePreviewMode
            ? 'max-w-md min-h-[92vh] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900 sm:shadow-2xl sm:shadow-cyan-950/60'
            : 'max-w-full rounded-none'
        }`}
      >
        {/* Simulated Phone Top Status Bar (Only in Mobile Mode) */}
        {isMobilePreviewMode && (
          <div className="bg-slate-950 px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900/60">
            <span className="font-bold text-slate-200">09:41</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3 text-cyan-400" />
              <Wifi className="w-3 h-3 text-cyan-400" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Global Header */}
        <Header onOpenNotifs={() => setIsNotifOpen(true)} />

        {/* Main Content Viewport */}
        <main className="flex-1 p-3 pb-20 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {activeTab === 'market' && <Marketplace onOpenPayment={handleOpenPayment} />}
              {activeTab === 'wallet' && (currentUser.role === 'admin' ? <WalletView /> : <UndianView />)}
              {activeTab === 'exchange' && <ExchangeView />}
              {activeTab === 'announcements' && <AnnouncementsView />}
              {activeTab === 'chat' && <CommunityChatView />}
              {activeTab === 'admin' && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Glassmorphism Cyber Navigation Bar */}
        <BottomNav />
      </div>

      {/* Auth & Security Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Ticket Purchase & Account Verification Modal */}
      <TicketPurchaseModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />

      {/* Out of Tickets Warning & Fast Top Up Modal */}
      <OutOfTicketsModal isOpen={isOutOfTicketsModalOpen} onClose={() => setIsOutOfTicketsModalOpen(false)} />

      {/* Support Ticket & Helpdesk Modal */}
      <SupportTicketModal />

      {/* Payment Modal for Winning Assets */}
      <PaymentModal
        asset={selectedPaymentAsset || activeWinningAsset}
        onClose={() => {
          setSelectedPaymentAsset(null);
          setActiveWinningAsset(null);
        }}
      />

      {/* Realtime Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
