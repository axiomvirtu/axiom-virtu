import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  TelegramWebAppUser,
  DigitalAsset,
  ScheduleConfig,
  Announcement,
  ChatMessage,
  ExchangeRequest,
  AppNotification,
  AssetTheme,
  UsdtMutation,
  AssetTradeRecord,
  TopUpPaymentConfig,
  GiveawayPrize,
  GiveawayWinner,
  GiveawayScheduleConfig,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
  SupportTicketPriority,
} from '../types';
import {
  initialUsers,
  initialAssets,
  initialScheduleConfig,
  initialAnnouncements,
  initialChatMessages,
  initialMutations,
  initialTradeRecords,
  initialGiveawayPrizes,
  initialGiveawayWinners,
} from '../data/mockData';
import { calculateNextAssetTradeState, generate15CycleSimulation, roundUsdt } from '../utils/cycleSimulation';
import { AssetManager } from '../services/AssetManager';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  isTicketModalOpen: boolean;
  setIsTicketModalOpen: (val: boolean) => void;
  isOutOfTicketsModalOpen: boolean;
  setIsOutOfTicketsModalOpen: (val: boolean) => void;
  activeTab: 'market' | 'wallet' | 'exchange' | 'announcements' | 'chat' | 'admin';
  setActiveTab: (tab: 'market' | 'wallet' | 'exchange' | 'announcements' | 'chat' | 'admin') => void;
  
  // Mobile Simulator Frame Mode
  isMobilePreviewMode: boolean;
  setIsMobilePreviewMode: (val: boolean) => void;

  // Assets State & Operations
  assets: DigitalAsset[];
  addAsset: (assetData: Omit<DigitalAsset, 'id' | 'createdAt' | 'bookedUsers' | 'status'>) => void;
  updateAssetSchedule: (assetId: string, customSchedule?: DigitalAsset['customSchedule']) => void;
  updateAssetStock: (assetId: string, newStock: number) => void;
  addAdminStockToAsset: (
    assetId: string,
    additionalUnits: number,
    adminWalletAddress?: string,
    adminSellerName?: string,
    adminPhone?: string
  ) => void;
  updateAssetDetails: (assetId: string, details: Partial<DigitalAsset>) => void;
  deleteAsset: (assetId: string) => void;
  burnAsset: (assetId: string, burnAmount?: number) => void;
  bookAssetSlot: (assetId: string) => boolean;
  runGrabProcess: (assetId: string) => boolean;

  // Unsold 2x Stock & Manual Admin Buyback Queue
  processUnsoldAssetSession: (assetId: string) => void;
  executeAdminManualBuyback: (assetId: string) => void;
  declineAdminManualBuyback: (assetId: string) => void;
  triggerAllUnsoldCheck: () => void;

  // Asset Trade Transaction History & System Buyback
  tradeRecords: AssetTradeRecord[];
  addTradeRecord: (record: Omit<AssetTradeRecord, 'id' | 'timestamp'>) => void;
  simulateTradeResult: (resultType: 'WIN' | 'LOST' | 'SELL_PENDING') => void;
  completeTradeRecordPayment: (tradeRecordId: string, proofTxHash?: string, proofImageUrl?: string) => void;
  uploadBuyerTradeProof: (tradeRecordId: string, proofTxHash: string, proofImageUrl: string) => void;
  triggerSystemBuyback: (assetId?: string, customBurnUnits?: number, reason?: 'OVERSUPPLY' | 'UNSOLD_2X' | string) => void;
  paySystemBuyback: (tradeRecordId: string, proofImageUrl?: string, proofTxHash?: string) => void;
  executeAdminBurnForBuyback: (tradeRecordId: string) => void;

  // Schedules
  schedules: ScheduleConfig;
  updateSchedules: (newSched: ScheduleConfig) => void;

  // Wallet & Deposit
  topUpPaymentConfig: TopUpPaymentConfig;
  updateTopUpPaymentConfig: (newConfig: Partial<TopUpPaymentConfig>) => void;
  topUpTickets: (ticketCount: number, paymentMethod: 'USDT' | 'BANK_IDR') => boolean;
  performInitialDeposit: () => void;
  mutations: UsdtMutation[];
  addMutation: (mutation: Omit<UsdtMutation, 'id' | 'timestamp'>) => void;
  simulateIncomingDeposit: (amountUsdt: number) => void;
  approveDepositMutation: (mutationId: string) => void;
  rejectDepositMutation: (mutationId: string, reason?: string) => void;

  // Member Verification Management
  setUserVerificationStatus: (userId: string, isVerified: boolean) => void;
  updateVerificationThreshold: (newMinUsdt: number) => void;

  // Payment & Sanctions
  activeWinningAsset: DigitalAsset | null;
  setActiveWinningAsset: (asset: DigitalAsset | null) => void;
  completePaymentProof: (assetId: string, txHash: string, proofImageUrl: string) => void;
  triggerSanctionAutoBan: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;

  // Exchange Crypto <-> IDR
  exchangeRequests: ExchangeRequest[];
  createExchangeRequest: (
    type: 'CRYPTO_TO_IDR' | 'IDR_TO_CRYPTO',
    usdtAmount: number,
    isLocked: boolean,
    customWalletAddress?: string,
    customBankDetails?: string,
    userPaymentProof?: string,
    isTicketPurchase?: boolean,
    ticketCount?: number
  ) => void;
  markExchangeProcessing: (requestId: string) => void;
  approveExchangeRequest: (requestId: string, proofTxHash?: string, note?: string, proofImage?: string) => void;
  rejectExchangeRequest: (requestId: string, reason?: string) => void;
  cancelExchangeRequest: (requestId: string) => boolean;
  exchangeRateUsdtToIdr: number;
  coingeckoSource: string;
  coingeckoLastUpdated: number;
  rateTickerSeconds: number;
  togglePriceLock: () => void;
  isRateLocked: boolean;
  lockedRateValue: number | null;

  // Giveaway / Undian Hadiah
  giveawayPrizes: GiveawayPrize[];
  giveawayWinners: GiveawayWinner[];
  giveawayParticipants: string[];
  giveawaySchedule: GiveawayScheduleConfig;
  updateGiveawaySchedule: (config: Partial<GiveawayScheduleConfig>) => void;
  addGiveawayPrize: (prize: Omit<GiveawayPrize, 'id'>) => void;
  batchAddGiveawayPrizes: (prizes: Omit<GiveawayPrize, 'id'>[]) => void;
  clearGiveawayPrizes: () => void;
  updateGiveawayPrize: (id: string, prize: Partial<GiveawayPrize>) => void;
  deleteGiveawayPrize: (id: string) => void;
  enterGiveaway: () => void;
  drawGiveawayWinners: (winnerCount?: number) => void;
  resetGiveawayWinners: () => void;
  updateGiveawayWinnerDelivery: (
    winnerId: string,
    proofData: { proofTxHash: string; proofImageUrl?: string; adminNote?: string }
  ) => void;
  grantRaffleTicketForAssetPurchase: (targetUserId: string, assetName: string) => void;

  // Support Tickets & Helpdesk
  supportTickets: SupportTicket[];
  createSupportTicket: (ticketData: {
    category: SupportTicketCategory;
    subject: string;
    description: string;
    reportedUser?: string;
    attachmentUrl?: string;
    priority?: SupportTicketPriority;
  }) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicketStatus, adminReply?: string) => void;
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (val: boolean) => void;

  // Announcements & Community Chat
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'timestamp'>) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Role Switcher
  switchUserRole: (role: 'user' | 'admin') => void;

  // Telegram WebApp Official Auth State
  telegramUser: TelegramWebAppUser | null;
  telegramId: string | number | null;
  isTelegramConnected: boolean;
  telegramInitData: any;
  connectTelegram: (customHandle?: string) => boolean;
  disconnectTelegram: () => void;
  logout: () => void;

  // Helper Random Asset Generator
  generateRandomAssetName: (theme: AssetTheme) => { name: string; logo: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUsers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Telegram WebApp Official State & Init Sequence
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);
  const [telegramId, setTelegramId] = useState<string | number | null>(null);
  const [isTelegramConnected, setIsTelegramConnected] = useState<boolean>(false);
  const [telegramInitData, setTelegramInitData] = useState<any>(null);

  // Official Telegram WebApp Initialization Sequence
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any)?.Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        // Execute official Telegram WebApp initialization methods
        tg.ready();
        tg.expand();

        const initData = tg.initDataUnsafe;
        const tgUser = initData?.user;

        if (tgUser && tgUser.id) {
          setTelegramUser(tgUser);
          setTelegramId(tgUser.id);
          setIsTelegramConnected(true);
          setTelegramInitData(initData);
        }
      } catch (err) {
        console.warn('Telegram WebApp init sequence error:', err);
      }
    }
  }, []);

  const connectTelegram = (customHandle?: string): boolean => {
    let tgUser: TelegramWebAppUser | null = null;
    let tgInit: any = null;

    if (typeof window !== 'undefined' && (window as any)?.Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        tgInit = tg.initDataUnsafe;
        if (tgInit?.user) {
          tgUser = tgInit.user;
        }
      } catch (e) {
        console.warn('Error connecting to Telegram WebApp:', e);
      }
    }

    const rawHandle = customHandle || (tgUser?.username ? `@${tgUser.username}` : null);
    const cleanHandle = rawHandle
      ? (rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`)
      : `@trader_${Math.floor(1000 + Math.random() * 9000)}`;

    const id = tgUser?.id || (telegramId ? telegramId : `tg_${Date.now()}`);

    const activeTgUser: TelegramWebAppUser = tgUser || {
      id: id,
      username: cleanHandle.replace('@', ''),
      first_name: cleanHandle.replace('@', ''),
    };

    setTelegramUser(activeTgUser);
    setTelegramId(id);
    setIsTelegramConnected(true);
    if (tgInit) setTelegramInitData(tgInit);

    // Sync with UserProfile state (exclude admin role so telegram connect always resolves to a user account)
    const existingUser = users.find(
      (u) =>
        u.role === 'user' &&
        (u.phone.toLowerCase() === cleanHandle.toLowerCase() ||
          u.name.toLowerCase() === cleanHandle.toLowerCase())
    );

    if (existingUser) {
      setCurrentUser(existingUser);
      setIsLoggedIn(true);
    } else {
      const displayName = activeTgUser.first_name
        ? `${activeTgUser.first_name} ${activeTgUser.last_name || ''}`.trim()
        : `Trader ${cleanHandle.replace('@', '')}`;

      const newUser: UserProfile = {
        id: `usr_${id}`,
        name: displayName,
        phone: cleanHandle,
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

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
    }

    return true;
  };

  const logout = () => {
    // 1. Reset Telegram WebApp authentication payload
    setTelegramUser(null);
    setTelegramId(null);
    setIsTelegramConnected(false);
    setTelegramInitData(null);

    // 2. Reset currentUser session back to standard non-admin profile
    const normalUser = users.find((u) => u.role === 'user') || initialUsers[0];
    if (normalUser) {
      setCurrentUser(normalUser);
    }

    // 3. Reset application UI state and logout flag
    setIsLoggedIn(false);
    setIsAuthModalOpen(false);
    setActiveTab('market');

    // 4. Clear local/session browser cache if present
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('axiom_session');
        localStorage.removeItem('axiom_user');
        localStorage.removeItem('axiom_role');
        sessionStorage.clear();
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const disconnectTelegram = () => {
    logout();
  };
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [isOutOfTicketsModalOpen, setIsOutOfTicketsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'market' | 'wallet' | 'exchange' | 'announcements' | 'chat' | 'admin'>('market');
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState<boolean>(false);

  const [assets, setAssets] = useState<DigitalAsset[]>(initialAssets);
  const [schedules, setSchedules] = useState<ScheduleConfig>(initialScheduleConfig);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [mutations, setMutations] = useState<UsdtMutation[]>(initialMutations);
  const [tradeRecords, setTradeRecords] = useState<AssetTradeRecord[]>(initialTradeRecords);

  const [giveawayPrizes, setGiveawayPrizes] = useState<GiveawayPrize[]>(initialGiveawayPrizes);
  const [giveawayWinners, setGiveawayWinners] = useState<GiveawayWinner[]>(initialGiveawayWinners);
  const [giveawayParticipants, setGiveawayParticipants] = useState<string[]>(['usr_me', 'u_101', 'u_102', 'u_103', 'u_105']);

  const [giveawaySchedule, setGiveawaySchedule] = useState<GiveawayScheduleConfig>(() => {
    const saved = localStorage.getItem('axiom_giveaway_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const now = new Date();
    const defaultTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0, 0).getTime();
    const finalScheduled = defaultTime > Date.now() ? defaultTime : defaultTime + 24 * 3600 * 1000;
    return {
      scheduledTime: finalScheduled,
      isAutoDrawEnabled: true,
      scheduledWinnerCount: 10,
      note: 'Pengocokan Resmi Hadiah Undian Axiom Virtu',
      updatedAt: Date.now(),
    };
  });

  const updateGiveawaySchedule = (config: Partial<GiveawayScheduleConfig>) => {
    setGiveawaySchedule((prev) => {
      const updated = { ...prev, ...config, updatedAt: Date.now() };
      localStorage.setItem('axiom_giveaway_schedule', JSON.stringify(updated));
      return updated;
    });
    if (config.scheduledTime !== undefined) {
      addNotification({
        type: 'SCHEDULE',
        title: '⏰ JADWAL UNDIAN DIPERBARUI!',
        message: config.scheduledTime
          ? `Admin telah mengatur jam pengocokan undian: ${new Date(config.scheduledTime).toLocaleString('id-ID')}`
          : 'Admin membatalkan jadwal pengocokan undian.',
      });
    }
  };

  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-1001',
      userId: 'u_101',
      userName: 'Budi Santoso',
      userPhone: '+6281298765432',
      category: 'KENDALA_EXCHANGE',
      subject: 'Proses penukaran IDR ke USDT belum masuk',
      description: 'Saya sudah mentransfer IDR senilai Rp 162.800 via BCA pukul 14:00 tapi saldo USDT belum bertambah di wallet.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: Date.now() - 3600000 * 5,
      updatedAt: Date.now() - 3600000 * 2,
      adminReply: 'Halo Budi, tim keuangan sedang melakukan verifikasi mutasi rekening BCA. Harap tunggu 10-15 menit.',
    },
    {
      id: 'TICK-1002',
      userId: 'u_102',
      userName: 'Siti Rahma',
      userPhone: '+6285712345678',
      category: 'LAPOR_KECURANGAN',
      subject: 'Laporan akun terindikasi booking otomatis berantai',
      description: 'Akun id +6281987654322 terindikasi menggunakan script otomatis booking slot lelang dalam milidetik.',
      reportedUser: '+6281987654322 (Rian Hidayat)',
      status: 'OPEN',
      priority: 'URGENT',
      createdAt: Date.now() - 3600000 * 12,
      updatedAt: Date.now() - 3600000 * 12,
    },
    {
      id: 'TICK-1003',
      userId: 'usr_me',
      userName: 'Axiom Member',
      userPhone: '+6281234567890',
      category: 'BUG_SYSTEM',
      subject: 'Penyelarasan grafik kurs feed realtime',
      description: 'Pertanyaan teknis mengenai sinkronisasi ticker harga.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: Date.now() - 3600000 * 24,
      updatedAt: Date.now() - 3600000 * 1,
      adminReply: 'Terima kasih atas laporannya! Ticker harga telah disinkronkan secara realtime dengan Coingecko.',
      resolvedAt: Date.now() - 3600000 * 1,
    },
  ]);
  const [topUpPaymentConfig, setTopUpPaymentConfig] = useState<TopUpPaymentConfig>({
    bankName: 'Bank BCA',
    accountNumber: '8830129481',
    accountHolder: 'PT AXIOM DIGITAL VAULT',
    qrisImageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&auto=format&fit=crop&q=80',
    qrisNmid: 'ID1020394820192',
    qrisMerchantName: 'AXIOM DIGITAL TOP UP (QRIS ALL PAYMENT)',
    adminUsdtTrc20Address: 'TY3v7x89K2m9pL1aN4sQ8wZ5eX7rT6uV9w',
    instructionsNote: 'Scan QRIS dari aplikasi m-Banking (BCA, Mandiri, BRI) atau E-Wallet (GoPay, OVO, Dana) atau Transfer USDT TRC20 ke Wallet Admin.',
  });

  const updateTopUpPaymentConfig = (newConfig: Partial<TopUpPaymentConfig>) => {
    setTopUpPaymentConfig((prev) => ({ ...prev, ...newConfig }));
    addNotification({
      type: 'SYSTEM',
      title: 'Pengaturan Payment Top Up Diperbarui',
      message: 'Nomor Rekening & QRIS pembayaran top up pengguna berhasil diperbarui oleh Admin.',
    });
  };

  const [activeWinningAsset, setActiveWinningAsset] = useState<DigitalAsset | null>(null);

  // Real-Time Ticker for USDT/IDR Rate (Powered by CoinGecko Market Data)
  const [exchangeRateUsdtToIdr, setExchangeRateUsdtToIdr] = useState<number>(16280);
  const [coingeckoSource, setCoingeckoSource] = useState<string>('www.coingecko.com');
  const [coingeckoLastUpdated, setCoingeckoLastUpdated] = useState<number>(Date.now());
  const [rateTickerSeconds, setRateTickerSeconds] = useState<number>(60);
  const [isRateLocked, setIsRateLocked] = useState<boolean>(false);
  const [lockedRateValue, setLockedRateValue] = useState<number | null>(null);

  // Fetch real-time price from CoinGecko & Indodax Live Market APIs
  const fetchCoinGeckoUsdtRate = async () => {
    let fetchedRate: number | null = null;
    let sourceName = 'www.coingecko.com';

    // 1. Try CoinGecko API
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr');
      if (res.ok) {
        const data = await res.json();
        if (data && data.tether && data.tether.idr) {
          fetchedRate = Math.round(data.tether.idr);
          sourceName = 'www.coingecko.com (Live API)';
        }
      }
    } catch {
      // Fallback to secondary source
    }

    // 2. Fallback to Indodax API if CoinGecko is rate limited
    if (!fetchedRate) {
      try {
        const res = await fetch('https://indodax.com/api/ticker/usdtidr');
        if (res.ok) {
          const data = await res.json();
          if (data && data.ticker && data.ticker.last) {
            fetchedRate = Math.round(parseFloat(data.ticker.last));
            sourceName = 'indodax.com / coingecko.com';
          }
        }
      } catch {
        // Keep existing valid rate
      }
    }

    if (fetchedRate && fetchedRate > 10000 && fetchedRate < 30000) {
      if (!isRateLocked) {
        setExchangeRateUsdtToIdr(fetchedRate);
      }
      setCoingeckoLastUpdated(Date.now());
      setCoingeckoSource(sourceName);
    }
  };

  useEffect(() => {
    fetchCoinGeckoUsdtRate();
    const fetchInterval = setInterval(() => {
      fetchCoinGeckoUsdtRate();
    }, 10000); // Sync every 10 seconds
    return () => clearInterval(fetchInterval);
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      type: 'SYSTEM',
      title: 'Selamat Datang di Axiom Virtu',
      message: 'Pastikan melakukan deposit minimal $5 untuk membuka akses penuh ke Pasar Sekunder Aset Digital.',
      timestamp: Date.now(),
      read: false,
    },
  ]);

  // Rate Ticker Interval (10s sync countdown, fetching real price when countdown reaches 0s)
  useEffect(() => {
    const timer = setInterval(() => {
      setRateTickerSeconds((prev) => {
        if (prev <= 1) {
          fetchCoinGeckoUsdtRate();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRateLocked]);

  // Check 3-hour payment deadline timers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      assets.forEach((ast) => {
        if (
          ast.status === 'GRABBED_PAYMENT_PENDING' &&
          ast.paymentDeadline &&
          now > ast.paymentDeadline &&
          !ast.isPaid
        ) {
          if (ast.currentWinnerId) {
            triggerSanctionAutoBan(
              ast.currentWinnerId,
              `Batas waktu pembayaran 3 jam telah habis untuk memenangkan ${ast.name}`
            );
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [assets]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const switchUserRole = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || initialUsers[1];
      setCurrentUser(adminUser);
      addNotification({
        type: 'SYSTEM',
        title: 'Mode Admin Aktif',
        message: 'Anda sekarang mengelola Axiom Virtu sebagai Super Admin.',
      });
    } else {
      const normalUser = users.find((u) => u.id === 'usr_me') || initialUsers[0];
      setCurrentUser(normalUser);
      addNotification({
        type: 'SYSTEM',
        title: 'Mode Pengguna Aktif',
        message: 'Beralih ke tampilan Pengguna.',
      });
    }
  };

  // Real-Time USDT Mutations Handling
  const addMutation = (mutation: Omit<UsdtMutation, 'id' | 'timestamp'>) => {
    const newMut: UsdtMutation = {
      ...mutation,
      id: 'mut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setMutations((prev) => [newMut, ...prev]);
  };

  // Asset Trade Records Handling
  const addTradeRecord = (record: Omit<AssetTradeRecord, 'id' | 'timestamp'>) => {
    const newRecord: AssetTradeRecord = {
      ...record,
      id: 'trd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setTradeRecords((prev) => [newRecord, ...prev]);
  };

  const simulateTradeResult = (resultType: 'WIN' | 'LOST' | 'SELL_PENDING') => {
    const sampleAsset = assets[Math.floor(Math.random() * assets.length)] || initialAssets[0];
    if (resultType === 'WIN') {
      addTradeRecord({
        userId: currentUser.id,
        assetId: sampleAsset.id,
        assetName: sampleAsset.name,
        assetLogo: sampleAsset.logo,
        theme: sampleAsset.theme,
        priceUsdt: sampleAsset.priceUsdt,
        dailyProfitPercent: sampleAsset.dailyProfitPercent,
        contractDays: sampleAsset.contractDays,
        tradeType: 'BUY_WIN',
        result: 'WIN',
        ticketsSpent: 1,
        sellerName: sampleAsset.sellerName,
        sellerPhone: sampleAsset.sellerPhone,
        notes: 'Simulasi Perebutan Berhasil MENANG! Status pending pembayaran.',
      });
      addNotification({
        type: 'WIN',
        title: '🎉 SIMULASI MENANG PEREBUTAN',
        message: `Anda memenangkan perebutan ${sampleAsset.name} ($${sampleAsset.priceUsdt} USDT). Catatan transaksi tercatat di History!`,
      });
    } else if (resultType === 'SELL_PENDING') {
      addTradeRecord({
        userId: currentUser.id,
        assetId: sampleAsset.id,
        assetName: sampleAsset.name,
        assetLogo: sampleAsset.logo,
        theme: sampleAsset.theme,
        priceUsdt: sampleAsset.priceUsdt,
        dailyProfitPercent: sampleAsset.dailyProfitPercent,
        contractDays: sampleAsset.contractDays,
        tradeType: 'SELL_COMPLETE',
        result: 'PENDING_PAYMENT',
        ticketsSpent: 0,
        sellerName: `${currentUser.name} (Saya)`,
        sellerPhone: currentUser.phoneNumber,
        buyerName: 'RookieTrader_88',
        buyerPhone: '+6281398765432',
        notes: `Aset ${sampleAsset.name} Anda berhasil terjual! Menunggu pembeli (RookieTrader_88) mengirimkan pembayaran $${sampleAsset.priceUsdt} USDT.`,
      });
      addNotification({
        type: 'WIN',
        title: '🏷️ ASET ANDA TERJUAL!',
        message: `Aset ${sampleAsset.name} ($${sampleAsset.priceUsdt} USDT) milik Anda berhasil terjual ke RookieTrader_88. Menunggu konfirmasi pembayaran!`,
      });
    } else {
      addTradeRecord({
        userId: currentUser.id,
        assetId: sampleAsset.id,
        assetName: sampleAsset.name,
        assetLogo: sampleAsset.logo,
        theme: sampleAsset.theme,
        priceUsdt: sampleAsset.priceUsdt,
        dailyProfitPercent: sampleAsset.dailyProfitPercent,
        contractDays: sampleAsset.contractDays,
        tradeType: 'BID_LOST',
        result: 'LOST',
        ticketsSpent: 1,
        sellerName: sampleAsset.sellerName,
        sellerPhone: sampleAsset.sellerPhone,
        notes: 'Simulasi Perebutan KALAH. Tiket 1 terpakai.',
      });
      addNotification({
        type: 'SCHEDULE',
        title: '❌ SIMULASI KALAH PEREBUTAN',
        message: `Anda belum beruntung pada perebutan ${sampleAsset.name}. Tiket 1 terpakai dan tercatat di History Kalah.`,
      });
    }
  };

  const completeTradeRecordPayment = (tradeRecordId: string, proofTxHash?: string, proofImageUrl?: string) => {
    const hash = proofTxHash || '0x' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setTradeRecords((prev) =>
      prev.map((r) =>
        r.id === tradeRecordId
          ? {
              ...r,
              result: 'COMPLETED',
              proofTxHash: hash,
              proofImageUrl: proofImageUrl || r.proofImageUrl,
              notes: (r.notes ? r.notes + ' ' : '') + '(✓ Penjual mengkonfirmasi pembayaran LUNAS & DITERIMA!)',
            }
          : r
      )
    );
    addNotification({
      type: 'PAYMENT',
      title: '✅ KONFIRMASI PENJUAL: PEMBAYARAN LUNAS',
      message: `Penjual telah mengkonfirmasi penerimaan pembayaran untuk aset ${tradeRecordId}. Aset terbayarkan & transaksi selesai!`,
    });
  };

  const uploadBuyerTradeProof = (tradeRecordId: string, proofTxHash: string, proofImageUrl: string) => {
    setTradeRecords((prev) =>
      prev.map((r) =>
        r.id === tradeRecordId
          ? {
              ...r,
              proofTxHash: proofTxHash || r.proofTxHash,
              proofImageUrl: proofImageUrl || r.proofImageUrl,
              notes: `Pembeli telah mengunggah bukti pembayaran (${proofTxHash ? 'TRX Hash: ' + proofTxHash : 'Foto Bukti Bayar'}). Menunggu konfirmasi Penjual.`,
            }
          : r
      )
    );
    addNotification({
      type: 'PAYMENT',
      title: '📤 BUKTI PEMBAYARAN PEMBELI DIUNGGAH',
      message: `Bukti transfer/foto telah diunggah oleh pembeli untuk transaksi ${tradeRecordId}. Silakan penjual mengecek dan mengkonfirmasi!`,
    });
  };

  // 1. Trigger System Buyback for Oversupply Assets based on Formula: Total Aset > Total Pesan Tiket
  const triggerSystemBuyback = (assetId?: string, customBurnUnits?: number, reason: 'OVERSUPPLY' | 'UNSOLD_2X' | string = 'OVERSUPPLY') => {
    // If specific assetId is given, target that asset. Otherwise evaluate ALL digital assets.
    const targetAssets = assetId ? assets.filter((a) => a.id === assetId) : assets;
    let totalExcessBoughtCount = 0;
    const newBuybackRecords: AssetTradeRecord[] = [];
    const updatedStockMap: Record<string, number> = {};

    targetAssets.forEach((target) => {
      const currentStock = target.stockUnits ?? 0;

      // Formula: totalAset vs totalPesanTiket
      const activeBookingsCount = target.bookedUsers ? target.bookedUsers.length : 0;
      const historyBookingsCount = tradeRecords.filter(
        (r) => r.assetId === target.id && (r.tradeType === 'SLOT_BOOKED' || r.ticketsSpent > 0)
      ).length;
      const totalPesanTiket = Math.max(activeBookingsCount, historyBookingsCount);

      // If totalAset > totalPesanTiket, there is excess stock
      if (currentStock > totalPesanTiket) {
        const maxExcessToBuy = currentStock - totalPesanTiket;
        const excessUnits = customBurnUnits && customBurnUnits > 0
          ? Math.min(maxExcessToBuy, customBurnUnits)
          : maxExcessToBuy;

        if (excessUnits > 0) {
          totalExcessBoughtCount += excessUnits;
          // Calculate new reduced stock in market (Remaining stock MUST NOT be bought, kept for market stability)
          const newStockUnits = currentStock - excessUnits;
          updatedStockMap[target.id] = newStockUnits;

          // Create individual records (1 unit per record) so Admin can pay for each excess stock one-by-one!
          const sellerPool = [
            'Nexus Node Runner (Member Penjual #1)',
            'Solana Matrix Runner (Member Penjual #2)',
            'Vortex Vault Trader (Member Penjual #3)',
            'Cyber Blade Runner (Member Penjual #4)',
            'Axiom Pulse Seller (Member Penjual #5)',
          ];

          for (let i = 1; i <= excessUnits; i++) {
            const sellerForUnit = sellerPool[(i - 1) % sellerPool.length];
            const buybackRecord: AssetTradeRecord = {
              id: `trd_sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
              userId: `usr_seller_${i}`,
              assetId: target.id,
              assetName: target.name,
              assetLogo: target.logo,
              theme: target.theme,
              priceUsdt: target.priceUsdt, // Nominal 1 unit aset
              dailyProfitPercent: target.dailyProfitPercent,
              contractDays: target.contractDays,
              tradeType: 'SYSTEM_BUYBACK',
              result: 'PENDING_SYSTEM_PAYMENT',
              ticketsSpent: 0,
              sellerName: sellerForUnit,
              sellerPhone: `+6281${Math.floor(10000000 + Math.random() * 90000000)}`,
              buyerName: 'Sistem Otomatis Axiom Virtu (Buyback Admin)',
              buyerPhone: 'SYSTEM_AXIOM',
              timestamp: Date.now() + i * 10,
              burnUnits: 1,
              notes: reason === 'UNSOLD_2X' ? 'Stok 2x Tidak Terjual' : 'Oversupply',
            };
            newBuybackRecords.push(buybackRecord);
          }
        }
      }
    });

    if (newBuybackRecords.length > 0) {
      setTradeRecords((prev) => [...newBuybackRecords, ...prev]);

      // Reduce stock of assets in market!
      setAssets((prev) =>
        prev.map((a) => (updatedStockMap[a.id] !== undefined ? { ...a, stockUnits: updatedStockMap[a.id] } : a))
      );

      addNotification({
        type: 'SYSTEM',
        title: '⚡ PEMBELIAN OTOMATIS SISTEM SELESAI!',
        message: `Sistem telah otomatis membeli total ${totalExcessBoughtCount} unit aset berlebih di pasar (${Object.keys(updatedStockMap).length} aset). Stok aset di market telah BERKURANG & antrean pembayaran Admin dapat dibayar satu-per-satu!`,
      });
    } else {
      addNotification({
        type: 'SYSTEM',
        title: 'ℹ️ TIDAK ADA STOK BERLEBIH',
        message: assetId
          ? `Stok aset digital ini tidak melebihi total pesanan tiket saat ini.`
          : `Seluruh aset digital memiliki jumlah stok yang seimbang/lebih kecil dari pemesanan tiket.`,
      });
    }
  };

  // 2. Admin Pays User for the System Buyback Asset
  const paySystemBuyback = (tradeRecordId: string, proofImageUrl?: string, proofTxHash?: string) => {
    const target = tradeRecords.find((r) => r.id === tradeRecordId);
    if (!target) return;

    const hash = proofTxHash || `0xSYS_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const img = proofImageUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=500&auto=format&fit=crop&q=80';

    setTradeRecords((prev) =>
      prev.map((r) =>
        r.id === tradeRecordId
          ? {
              ...r,
              result: 'PAID_AWAITING_BURN',
              proofTxHash: hash,
              proofImageUrl: img,
              notes: (r.notes ? r.notes + ' ' : '') + ` (✓ Admin telah membayar $${r.priceUsdt} USDT ke penjual ${r.sellerName || 'Member'}. TRX Hash: ${hash}. Aset siap di-BURN!)`,
            }
          : r
      )
    );

    addNotification({
      type: 'PAYMENT',
      title: '💳 PEMBAYARAN BUYBACK OLEH ADMIN SELESAI!',
      message: `Pembayaran sebesar $${target.priceUsdt} USDT untuk buyback ${target.assetName} telah dikonfirmasi LUNAS (TRX Hash: ${hash}). Penjual dapat melihat bukti pembayaran ini.`,
    });
  };

  // 3. Admin Executes Burn on the Bought Asset
  const executeAdminBurnForBuyback = (tradeRecordId: string) => {
    const targetRecord = tradeRecords.find((r) => r.id === tradeRecordId);
    if (!targetRecord) return;

    const burnUnits = targetRecord.burnUnits || 3;

    // Deduct stock from the circulating supply
    burnAsset(targetRecord.assetId, burnUnits);

    // Update trade record status
    setTradeRecords((prev) =>
      prev.map((r) =>
        r.id === tradeRecordId
          ? {
              ...r,
              result: 'COMPLETED_BURNED',
              isBurned: true,
              burnedAt: Date.now(),
              notes: (r.notes ? r.notes + ' ' : '') + ` (🔥 TELAH DI-BURN OLEH ADMIN! Stok ${burnUnits} unit dimusnahkan dari pasokan pasar.)`,
            }
          : r
      )
    );

    addNotification({
      type: 'SYSTEM',
      title: '🔥 EKSEKUSI BURN ASET DIBELI ADMIN BERHASIL!',
      message: `Admin telah membakar ${burnUnits} unit stok ${targetRecord.assetName} yang dibeli dari sistem oversupply. Pasar kembali seimbang!`,
    });
  };

  // Simulate incoming real-time USDT transfer to currentUser wallet
  const simulateIncomingDeposit = (amountUsdt: number) => {
    if (amountUsdt <= 0) return;
    const minReq = schedules.minVerificationDepositUsdt ?? 5;

    setCurrentUser((prev) => {
      const newBal = prev.usdtBalance + amountUsdt;
      const nowVerified = prev.isDepositDone || amountUsdt >= minReq;
      return {
        ...prev,
        usdtBalance: newBal,
        isDepositDone: nowVerified,
        isLocked: !nowVerified,
      };
    });

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const newBal = u.usdtBalance + amountUsdt;
          const nowVerified = u.isDepositDone || amountUsdt >= minReq;
          return { ...u, usdtBalance: newBal, isDepositDone: nowVerified, isLocked: !nowVerified };
        }
        return u;
      })
    );

    addMutation({
      userId: currentUser.id,
      type: 'DEPOSIT_IN',
      amountUsdt,
      amountIdr: amountUsdt * exchangeRateUsdtToIdr,
      description: `Deposit Realtime USDT TRC20 (${amountUsdt >= minReq ? 'Syarat Verifikasi Terpenuhi' : 'Top Up Reguler'})`,
      txHash: `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      senderInfo: 'External Crypto Wallet (TRC20 Network)',
      status: 'COMPLETED',
    });

    addNotification({
      type: 'PAYMENT',
      title: 'Mutasi Masuk USDT Real-Time!',
      message: `+$${amountUsdt.toFixed(2)} USDT telah masuk ke dompet Anda (${amountUsdt >= minReq ? 'Akun Otomatis Terverifikasi' : 'Saldo Bertambah'}).`,
    });
  };

  // Approve User Pending Deposit Mutation (Admin Confirmation)
  const approveDepositMutation = (mutationId: string) => {
    const target = mutations.find((m) => m.id === mutationId);
    if (!target) return;

    // Update mutation status
    setMutations((prev) =>
      prev.map((m) => (m.id === mutationId ? { ...m, status: 'COMPLETED' } : m))
    );

    // Update target user's USDT balance & verify account status
    const minReq = schedules.minVerificationDepositUsdt ?? 5;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === target.userId) {
          const newUsdt = u.usdtBalance + target.amountUsdt;
          const isVerified = u.isDepositDone || target.amountUsdt >= minReq;
          return {
            ...u,
            usdtBalance: newUsdt,
            isDepositDone: isVerified,
            isLocked: !isVerified,
          };
        }
        return u;
      })
    );

    if (currentUser.id === target.userId) {
      setCurrentUser((prev) => {
        const newUsdt = prev.usdtBalance + target.amountUsdt;
        const isVerified = prev.isDepositDone || target.amountUsdt >= minReq;
        return {
          ...prev,
          usdtBalance: newUsdt,
          isDepositDone: isVerified,
          isLocked: !isVerified,
        };
      });
    }

    const memberUser = users.find((u) => u.id === target.userId);
    const memberName = memberUser?.name || 'Pengguna';

    addNotification({
      type: 'PAYMENT',
      title: '✅ DEPOSIT DIKONFIRMASI ADMIN!',
      message: `Deposit $${target.amountUsdt.toFixed(2)} USDT (Rp ${(target.amountIdr || target.amountUsdt * exchangeRateUsdtToIdr).toLocaleString('id-ID')}) untuk ${memberName} telah DIKONFIRMASI oleh Admin. Saldo ditambahkan & Akun AKTIF.`,
    });

    addAnnouncement({
      type: 'NEWS',
      title: `✅ KONFIRMASI DEPOSIT: ${memberName}`,
      content: `Admin telah mengonfirmasi pembayaran deposit sebesar $${target.amountUsdt.toFixed(2)} USDT (Rp ${(target.amountIdr || target.amountUsdt * exchangeRateUsdtToIdr).toLocaleString('id-ID')}) dari member ${memberName} (${memberUser?.phone || ''}). Status akun kini AKTIF.`,
    });
  };

  // Reject User Pending Deposit Mutation (Admin Action)
  const rejectDepositMutation = (mutationId: string, reason?: string) => {
    const target = mutations.find((m) => m.id === mutationId);
    if (!target) return;

    setMutations((prev) =>
      prev.map((m) => (m.id === mutationId ? { ...m, status: 'CANCELLED' } : m))
    );

    const memberUser = users.find((u) => u.id === target.userId);

    addNotification({
      type: 'SYSTEM',
      title: '❌ DEPOSIT DITOLAK ADMIN',
      message: `Deposit $${target.amountUsdt.toFixed(2)} USDT (${memberUser?.name || 'Pengguna'}) dibatalkan. Alasan: ${reason || 'Pembayaran belum masuk di rekening/QRIS Admin.'}`,
    });
  };

  // Member Verification Management (Admin)
  const setUserVerificationStatus = (userId: string, isVerified: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isDepositDone: isVerified, isLocked: !isVerified }
          : u
      )
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        isDepositDone: isVerified,
        isLocked: !isVerified,
      }));
    }
    const target = users.find((u) => u.id === userId);
    addNotification({
      type: 'SYSTEM',
      title: isVerified ? 'Status Member Terverifikasi!' : 'Status Verifikasi Dibatalkan',
      message: `Admin telah mengubah status member ${target?.name || userId} menjadi ${isVerified ? 'VERIFIED (AKTIF)' : 'BELUM VERIFIKASI'}.`,
    });
  };

  const updateVerificationThreshold = (newMinUsdt: number) => {
    const val = Math.max(0, newMinUsdt);
    setSchedules((prev) => ({
      ...prev,
      minVerificationDepositUsdt: val,
    }));
    addNotification({
      type: 'SYSTEM',
      title: 'Syarat Syarat Deposit Verifikasi Diperbarui',
      message: `Admin telah mengubah batasan syarat deposit verifikasi member menjadi $${val} USDT.`,
    });
  };

  // Initial Verification Deposit Execution
  const performInitialDeposit = () => {
    const minReq = schedules.minVerificationDepositUsdt ?? 5;
    setCurrentUser((prev) => ({
      ...prev,
      isDepositDone: true,
      isLocked: false,
      ticketBalance: prev.ticketBalance + minReq,
      usdtBalance: Math.max(prev.usdtBalance - minReq, 0),
    }));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, isDepositDone: true, isLocked: false, ticketBalance: u.ticketBalance + minReq }
          : u
      )
    );

    addMutation({
      userId: currentUser.id,
      type: 'DEPOSIT_IN',
      amountUsdt: minReq,
      amountIdr: minReq * exchangeRateUsdtToIdr,
      description: `Aktivasi Deposit Syarat Verifikasi ($${minReq} USDT)`,
      txHash: `0x${Math.random().toString(36).substring(2, 10)}`,
      senderInfo: 'Axiom Vault Verification Service',
      status: 'COMPLETED',
    });

    addNotification({
      type: 'SYSTEM',
      title: 'Akun Berhasil Terverifikasi!',
      message: `Deposit $${minReq} berhasil. Anda mendapatkan ${minReq} Tiket dan Pasar Sekunder sekarang DIBUKA.`,
    });
  };

  // Top Up & Purchase Tickets ($1 / 1 Ticket) - Activates & Verifies Account
  const topUpTickets = (ticketCount: number, paymentMethod: 'USDT' | 'BANK_IDR'): boolean => {
    if (ticketCount <= 0) return false;
    const costUsdt = ticketCount; // $1/ticket

    if (paymentMethod === 'USDT' && currentUser.usdtBalance < costUsdt) {
      addNotification({
        type: 'SYSTEM',
        title: 'Saldo USDT Tidak Cukup',
        message: `Pembelian ${ticketCount} tiket membutuhkan $${costUsdt} USDT. Saldo Anda: $${currentUser.usdtBalance.toFixed(2)} USDT.`,
      });
      return false;
    }

    const wasUnverified = !currentUser.isDepositDone;

    setCurrentUser((prev) => ({
      ...prev,
      ticketBalance: prev.ticketBalance + ticketCount,
      usdtBalance: paymentMethod === 'USDT' ? Math.max(prev.usdtBalance - costUsdt, 0) : prev.usdtBalance,
      isDepositDone: true,
      isLocked: false,
    }));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              ticketBalance: u.ticketBalance + ticketCount,
              usdtBalance: paymentMethod === 'USDT' ? Math.max(u.usdtBalance - costUsdt, 0) : u.usdtBalance,
              isDepositDone: true,
              isLocked: false,
            }
          : u
      )
    );

    if (paymentMethod === 'USDT') {
      addMutation({
        userId: currentUser.id,
        type: 'DEPOSIT_IN',
        amountUsdt: costUsdt,
        amountIdr: costUsdt * exchangeRateUsdtToIdr,
        description: `Pembelian ${ticketCount} Tiket Aktivasi Akun ($${costUsdt} USDT)`,
        txHash: `0x${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        senderInfo: 'Pembelian Tiket Verifikasi System',
        status: 'COMPLETED',
      });
    }

    addNotification({
      type: 'SYSTEM',
      title: wasUnverified ? '🎉 AKUN BERHASIL TERVERIFIKASI!' : 'Pembelian Tiket Berhasil',
      message: wasUnverified
        ? `+${ticketCount} Tiket berhasil dibeli! Akun Anda kini TERVERIFIKASI dan seluruh fitur Pasar & Undian telah dibuka.`
        : `+${ticketCount} Tiket telah ditambahkan ke akun Anda (Kurs: $1 / Tiket).`,
    });
    return true;
  };

  // Random Asset Name & Logo Generator
  const generateRandomAssetName = (theme: AssetTheme): { name: string; logo: string } => {
    const prefixes = {
      CYBERPUNK: ['Cyber-Core', 'Neo-Pulse', 'Matrix-Grid', 'Neural-Node', 'Vortex-Chip'],
      SYNTHWAVE: ['Retro-Drive', 'Sunset-Vault', 'Neon-Rider', 'Synth-Sync', 'Outrun-Bit'],
      QUANTUM: ['Quantum-Mesh', 'Zero-Point', 'Entangled-Key', 'Flux-Capacitor', 'Q-Shard'],
      BIOTECH: ['Bio-Genome', 'Synapse-Link', 'Helix-Chain', 'Nano-Core', 'Cellular-Vault'],
      NEON_MATRIX: ['Glitch-Blade', 'Dark-Photon', 'Cyber-Shield', 'Hyper-Terminal', 'Ether-Pulse'],
    };

    const icons = {
      CYBERPUNK: 'Cpu',
      SYNTHWAVE: 'Zap',
      QUANTUM: 'Activity',
      BIOTECH: 'ShieldCheck',
      NEON_MATRIX: 'Key',
    };

    const list = prefixes[theme];
    const chosenPrefix = list[Math.floor(Math.random() * list.length)];
    const codeNumber = Math.floor(100 + Math.random() * 900);
    const suffix = ['Alpha', 'Beta', 'Prime', 'X', 'V2', 'Ultra'][Math.floor(Math.random() * 6)];

    return {
      name: `${chosenPrefix} #${codeNumber} ${suffix}`,
      logo: icons[theme],
    };
  };

  // Add Digital Asset
  const addAsset = (assetData: Omit<DigitalAsset, 'id' | 'createdAt' | 'bookedUsers' | 'status'>) => {
    const minPrice = assetData.minPriceUsdt || assetData.priceUsdt;
    const sim = generate15CycleSimulation(
      minPrice,
      assetData.dailyProfitPercent || 5,
      minPrice,
      assetData.maxPriceUsdt
    );

    const newAsset: DigitalAsset = {
      ...assetData,
      id: 'ast_' + Date.now(),
      createdAt: Date.now(),
      bookedUsers: [],
      status: 'AVAILABLE',
      minPriceUsdt: minPrice,
      maxPriceUsdt: assetData.maxPriceUsdt || sim.maxPrice,
      currentCycleStep: assetData.currentCycleStep || 1,
      maxGrabbers: assetData.maxGrabbers || schedules.grabbingRulesPeopleCount,
    };
    setAssets((prev) => [newAsset, ...prev]);
    addNotification({
      type: 'SYSTEM',
      title: 'Aset Digital Baru Ditambahkan',
      message: `${newAsset.name} ($${newAsset.priceUsdt} USDT) sekarang tersedia di Pasar Sekunder (Range: $${newAsset.minPriceUsdt?.toFixed(2)} - $${newAsset.maxPriceUsdt?.toFixed(2)} USDT)!`,
    });
  };

  // Update Asset Custom Schedule
  const updateAssetSchedule = (assetId: string, customSchedule?: DigitalAsset['customSchedule']) => {
    setAssets((prev) =>
      prev.map((ast) => (ast.id === assetId ? { ...ast, customSchedule } : ast))
    );
    const target = assets.find((a) => a.id === assetId);
    if (target) {
      addNotification({
        type: 'SYSTEM',
        title: 'Jadwal Custom Aset Diperbarui',
        message: customSchedule
          ? `Jadwal kustom untuk ${target.name}: Pesan (${customSchedule.bookingStartHour}-${customSchedule.bookingEndHour}), Jual Beli (${customSchedule.tradingStartHour}-${customSchedule.tradingEndHour}).`
          : `Jadwal kustom ${target.name} dihapus, menggunakan jadwal global pasar sekunder.`,
      });
    }
  };

  // Update Asset Stock Count (Exclusively Admin)
  const updateAssetStock = (assetId: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setAssets((prev) =>
      prev.map((ast) => (ast.id === assetId ? { ...ast, stockUnits: validStock } : ast))
    );
    const target = assets.find((a) => a.id === assetId);
    if (target) {
      addNotification({
        type: 'SYSTEM',
        title: 'Stok Aset Disesuaikan',
        message: `Jumlah stok ${target.name} diperbarui menjadi ${validStock} unit.`,
      });
    }
  };

  // Add Admin Stock to Asset with Direct Payment to Admin Wallet Address
  const addAdminStockToAsset = (
    assetId: string,
    additionalUnits: number,
    adminWalletAddress?: string,
    adminSellerName?: string,
    adminPhone?: string
  ) => {
    if (additionalUnits <= 0) return;
    const adminUser = users.find((u) => u.role === 'admin') || currentUser;
    const defaultWallet =
      adminWalletAddress?.trim() ||
      adminUser?.walletAddress ||
      '0xADMIN_VAULT_AXIOM_99';
    const sellerName = adminSellerName?.trim() || 'Axiom Official Admin Vault';
    const sellerPhone = adminPhone?.trim() || adminUser?.phone || '+6289999999999';

    setAssets((prev) =>
      prev.map((ast) => {
        if (ast.id === assetId) {
          const currentStock = ast.stockUnits ?? 5;
          const newStock = currentStock + additionalUnits;
          return {
            ...ast,
            stockUnits: newStock,
            sellerId: 'usr_admin',
            sellerName: sellerName,
            sellerPhone: sellerPhone,
            sellerWalletAddress: defaultWallet,
          };
        }
        return ast;
      })
    );

    const target = assets.find((a) => a.id === assetId);
    if (target) {
      addNotification({
        type: 'SYSTEM',
        title: 'Stok Admin Berhasil Ditambahkan',
        message: `+${additionalUnits} stok ditambahkan ke ${target.name}. Pembayaran stok disalurkan langsung ke Wallet Admin: ${defaultWallet}.`,
      });
    }
  };

  // Update Asset Specifications (Price, Contract Days, Profit %, Max Grabbers)
  const updateAssetDetails = (assetId: string, details: Partial<DigitalAsset>) => {
    setAssets((prev) =>
      prev.map((ast) => (ast.id === assetId ? { ...ast, ...details } : ast))
    );
    const target = assets.find((a) => a.id === assetId);
    if (target) {
      addNotification({
        type: 'SYSTEM',
        title: 'Spesifikasi Aset Diperbarui',
        message: `Rincian aset ${target.name} berhasil diperbarui oleh Admin.`,
      });
    }
  };

  // Delete Excess Asset
  const deleteAsset = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    if (target) {
      addNotification({
        type: 'SYSTEM',
        title: 'Aset Digital Dihapus',
        message: `Aset ${target.name} telah dihapus dari sistem oleh Admin.`,
      });
    }
  };

  // Burn Asset (Custom Stock Burning)
  const burnAsset = (assetId: string, burnAmount?: number) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const currentStock = target.stockUnits ?? 5;
    const amountToBurn =
      burnAmount && burnAmount > 0
        ? Math.min(burnAmount, currentStock > 0 ? currentStock : burnAmount)
        : currentStock > 0
        ? currentStock
        : 1;
    const newStock = Math.max(0, currentStock - amountToBurn);
    const isFullyBurned = newStock === 0;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              stockUnits: newStock,
              status: isFullyBurned ? 'BURNED' : a.status,
            }
          : a
      )
    );

    const totalBurnedUsdt = amountToBurn * target.priceUsdt;

    const burnNotice: Omit<Announcement, 'id' | 'timestamp'> = {
      type: 'BURN',
      title: `BURN ASET DIGITAL: ${target.name} (${amountToBurn} Unit)`,
      content: `Admin telah melakukan BURN sebanyak ${amountToBurn} unit aset (total $${totalBurnedUsdt} USDT) pada ${target.name} untuk menjaga stabilitas pasokan & nilai tukar pasar. Sisa stok: ${newStock} unit.`,
      burnedAssetId: target.id,
      burnedAssetAmount: amountToBurn,
    };
    addAnnouncement(burnNotice);

    addNotification({
      type: 'SYSTEM',
      title: 'Burn Stok Aset Berhasil!',
      message: `Sebanyak ${amountToBurn} unit ${target.name} ($${totalBurnedUsdt} USDT) telah di-burn. Sisa stok: ${newStock} unit.`,
    });
  };

  // Process single asset unsold session
  const processUnsoldAssetSession = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const updated = AssetManager.processUnsoldSession(a);
          if (updated.isInAdminBuybackQueue) {
            addNotification({
              type: 'SYSTEM',
              title: '⚠️ STOK 2X TIDAK TERJUAL -> MASUK LIST ADMIN!',
              message: `Stok aset ${a.name} ($${a.priceUsdt} USDT) tidak terjual selama 2x sesi. Stok TIDAK dibeli otomatis dan telah masuk ke Antrean Buyback Manual Admin!`,
            });
          }
          return updated;
        }
        return a;
      })
    );
  };

  // Admin Manual Buyback
  const executeAdminManualBuyback = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return AssetManager.executeAdminBuyback(a);
        }
        return a;
      })
    );

    // Record buyback trade
    addTradeRecord({
      userId: target.sellerId,
      assetId: target.id,
      assetName: target.name,
      assetLogo: target.logo,
      theme: target.theme,
      priceUsdt: target.priceUsdt,
      dailyProfitPercent: target.dailyProfitPercent,
      contractDays: target.contractDays,
      tradeType: 'SYSTEM_BUYBACK',
      result: 'COMPLETED',
      ticketsSpent: 0,
      sellerName: target.sellerName,
      sellerPhone: target.sellerPhone,
      notes: `BUYBACK MANUAL ADMIN: Stok 2x tidak terjual dibeli secara manual oleh Admin seharga $${target.priceUsdt} USDT.`,
    });

    addNotification({
      type: 'SYSTEM',
      title: '✓ BUYBACK MANUAL ADMIN BERHASIL',
      message: `Admin telah menyetujui dan membeli manual stok ${target.name} sebesar $${target.priceUsdt} USDT.`,
    });
  };

  // Decline Admin Manual Buyback
  const declineAdminManualBuyback = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return AssetManager.declineAdminBuyback(a);
        }
        return a;
      })
    );

    addNotification({
      type: 'SYSTEM',
      title: 'Buyback Manual Ditolak',
      message: `Permintaan buyback manual untuk ${target.name} ditolak oleh Admin. Stok dikembalikan ke status normal.`,
    });
  };

  // Trigger All Unsold Check (Simulasi Cek Stok Tidak Terjual)
  const triggerAllUnsoldCheck = () => {
    let flaggedCount = 0;
    setAssets((prev) =>
      prev.map((a) => {
        if (a.status === 'AVAILABLE' || a.status === 'BOOKED_WAITING') {
          const updated = AssetManager.processUnsoldSession(a);
          if (updated.isInAdminBuybackQueue) flaggedCount++;
          return updated;
        }
        return a;
      })
    );

    addNotification({
      type: 'SYSTEM',
      title: '🔄 SIMULASI UN-SOLD SWEEP SELESAI',
      message: `Sesi perputaran pasar selesai. ${flaggedCount > 0 ? `${flaggedCount} stok 2x tidak terjual telah masuk ke Antrean Buyback Manual Admin.` : 'Tidak ada stok baru yang menyentuh batas 2x tidak terjual.'}`,
    });
  };

  // Book Asset Slot with 1 Ticket
  const bookAssetSlot = (assetId: string): boolean => {
    if (currentUser.isLocked) {
      addNotification({
        type: 'SYSTEM',
        title: 'Akses Terkunci',
        message: 'Lakukan deposit pertama minimal $5 untuk membuka fitur pemesanan aset!',
      });
      return false;
    }

    const target = assets.find((a) => a.id === assetId);
    if (!target) return false;

    if (target.bookedUsers.includes(currentUser.id)) {
      addNotification({
        type: 'SYSTEM',
        title: 'Sudah Dipesan',
        message: 'Anda sudah memesan slot untuk aset digital ini.',
      });
      return false;
    }

    if (currentUser.ticketBalance < 1) {
      addNotification({
        type: 'SYSTEM',
        title: 'Tiket Tidak Cukup',
        message: 'Pesan aset membutuhkan 1 Tiket. Silakan top-up tiket di menu Dompet.',
      });
      setIsOutOfTicketsModalOpen(true);
      return false;
    }

    // Deduct ticket
    setCurrentUser((prev) => ({ ...prev, ticketBalance: prev.ticketBalance - 1 }));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ticketBalance: u.ticketBalance - 1 } : u))
    );

    // Update asset booked Users
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const updatedBooked = [...a.bookedUsers, currentUser.id];
          return {
            ...a,
            bookedUsers: updatedBooked,
            status: 'BOOKED_WAITING',
          };
        }
        return a;
      })
    );

    addTradeRecord({
      userId: currentUser.id,
      assetId: target.id,
      assetName: target.name,
      assetLogo: target.logo,
      theme: target.theme,
      priceUsdt: target.priceUsdt,
      dailyProfitPercent: target.dailyProfitPercent,
      contractDays: target.contractDays,
      tradeType: 'SLOT_BOOKED',
      result: 'PENDING_PAYMENT',
      ticketsSpent: 1,
      sellerName: target.sellerName,
      sellerPhone: target.sellerPhone,
      notes: 'Pemesanan slot berhasil menggunakan 1 tiket. Menunggu jam perebutan pasar sekunder.',
    });

    addNotification({
      type: 'SCHEDULE',
      title: 'Slot Aset Berhasil Dipesan!',
      message: `Aset ${target.name} telah dipesan. Menunggu jam jual beli untuk perebutan otomatis (1 tiket terpakai).`,
    });
    return true;
  };

  // Run Grab Process
  const runGrabProcess = (assetId: string): boolean => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return false;

    let contenders = [...target.bookedUsers];
    if (contenders.length === 0) {
      // If no one booked, simulate candidate grabbers including current user for demo
      contenders = [currentUser.id, 'usr_seller_1', 'usr_seller_2', 'usr_other_1', 'usr_other_2'];
    }

    // Pick 1 random winner
    const winnerIndex = Math.floor(Math.random() * contenders.length);
    const winnerId = contenders[winnerIndex];
    const deadline = Date.now() + 3 * 3600 * 1000; // 3 hours countdown

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            status: 'GRABBED_PAYMENT_PENDING',
            currentWinnerId: winnerId,
            paymentDeadline: deadline,
            isPaid: false,
          };
        }
        return a;
      })
    );

    if (winnerId === currentUser.id) {
      addTradeRecord({
        userId: currentUser.id,
        assetId: target.id,
        assetName: target.name,
        assetLogo: target.logo,
        theme: target.theme,
        priceUsdt: target.priceUsdt,
        dailyProfitPercent: target.dailyProfitPercent,
        contractDays: target.contractDays,
        tradeType: 'BUY_WIN',
        result: 'WIN',
        ticketsSpent: 1,
        sellerName: target.sellerName,
        sellerPhone: target.sellerPhone,
        notes: '🎉 MENANG PEREBUTAN! Menunggu pengunggahan bukti bayar TRX Hash (Batas 3 Jam).',
      });

      addNotification({
        type: 'WIN',
        title: '🎉 SELAMAT! ANDA MEMENANGKAN ASET!',
        message: `Anda memenangkan perebutan ${target.name}! Segera bayar dalam batas waktu 3 jam sebelum akun Anda diblokir permanen.`,
      });
      return true;
    } else {
      addTradeRecord({
        userId: currentUser.id,
        assetId: target.id,
        assetName: target.name,
        assetLogo: target.logo,
        theme: target.theme,
        priceUsdt: target.priceUsdt,
        dailyProfitPercent: target.dailyProfitPercent,
        contractDays: target.contractDays,
        tradeType: 'BID_LOST',
        result: 'LOST',
        ticketsSpent: 1,
        sellerName: target.sellerName,
        sellerPhone: target.sellerPhone,
        notes: `Kalah perebutan otomatis di antara ${contenders.length} peserta. Tiket 1 terpakai.`,
      });

      addNotification({
        type: 'SCHEDULE',
        title: 'Perebutan Selesai',
        message: `Anda belum beruntung mendapatkan ${target.name}. Silakan coba lagi besok di jam jual beli berikutnya!`,
      });
      return false;
    }
  };

  // Complete Payment Proof & Asset Resale Transition
  const completePaymentProof = (assetId: string, txHash: string, proofImageUrl: string) => {
    const defaultProofImg =
      proofImageUrl ||
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=400&auto=format&fit=crop&q=80';

    const target = assets.find((a) => a.id === assetId);

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const promotionResult = AssetManager.promoteAssetToNextTier(a, assets);

          if (promotionResult.isPromoted) {
            addNotification({
              type: 'SYSTEM',
              title: promotionResult.notificationTitle,
              message: promotionResult.notificationMessage,
            });
          }

          return {
            ...promotionResult.updatedAsset,
            status: 'ACTIVE_HOLDING',
            proofTxHash: txHash,
            proofImageUrl: defaultProofImg,
            isPaid: true,
            isConfirmedBySeller: true,
            sellerId: currentUser.id,
            sellerName: currentUser.name,
            sellerPhone: currentUser.phone,
            sellerWalletAddress: currentUser.walletAddress || a.sellerWalletAddress,
          };
        }
        return a;
      })
    );

    if (target) {
      setTradeRecords((prev) => {
        // Find existing record for this asset win
        const existingIdx = prev.findIndex(
          (r) =>
            (r.assetId === target.id || r.assetName === target.name) &&
            (r.userId === currentUser.id || r.userId === 'usr_me') &&
            (r.result === 'WIN' || r.tradeType === 'BUY_WIN' || r.result === 'PENDING_PAYMENT')
        );

        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            tradeType: 'TRANSFER_PAID',
            result: 'COMPLETED',
            proofTxHash: txHash,
            proofImageUrl: defaultProofImg,
            notes: 'PEREBUTAN ASET TELAH DI DAPATKAN PEMBAYARAN DIKONFIRMASI.',
          };
          return updated;
        } else {
          return [
            {
              id: 'trd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              timestamp: Date.now(),
              userId: currentUser.id,
              assetId: target.id,
              assetName: target.name,
              assetLogo: target.logo,
              theme: target.theme,
              priceUsdt: target.priceUsdt,
              dailyProfitPercent: target.dailyProfitPercent,
              contractDays: target.contractDays,
              tradeType: 'TRANSFER_PAID',
              result: 'COMPLETED',
              ticketsSpent: 1,
              sellerName: target.sellerName,
              sellerPhone: target.sellerPhone,
              proofTxHash: txHash,
              proofImageUrl: defaultProofImg,
              notes: 'PEREBUTAN ASET TELAH DI DAPATKAN PEMBAYARAN DIKONFIRMASI.',
            },
            ...prev,
          ];
        }
      });

      // Grant 1 free raffle ticket for obtaining/purchasing the asset
      grantRaffleTicketForAssetPurchase(currentUser.id, target.name);
    }

    setActiveWinningAsset(null);

    addNotification({
      type: 'PAYMENT',
      title: 'Bukti Pembayaran Terkirim!',
      message: `Bukti transfer TRX Hash & Foto telah terkirim untuk ${target?.name || 'Aset Digital'}.`,
    });
  };

  // Trigger Sanction & Permanent Hard Ban (IP, Device Hardware ID, WhatsApp)
  const triggerSanctionAutoBan = (userId: string, reason: string) => {
    const targetUser = users.find((u) => u.id === userId) || currentUser;

    const banDetails = {
      ipAddress: targetUser.ipAddress || '180.252.31.99',
      deviceId: targetUser.deviceId || `DEV-HW-${userId.toUpperCase()}-LOCKED`,
      whatsappNumber: targetUser.phone,
      bannedAt: Date.now(),
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isBanned: true,
              banReason: reason,
              banDetails,
            }
          : u
      )
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        isBanned: true,
        banReason: reason,
        banDetails,
      }));
    }

    const banNotice: Omit<Announcement, 'id' | 'timestamp'> = {
      type: 'BANNED',
      title: `🚫 HARDCORE SANKSI PERMANEN: ${targetUser.phone}`,
      content: `SANKSI PERMANEN KETAT DITERAPKAN. Akun ${targetUser.name} (${targetUser.phone}) diblokir total pada 3 Parameter Keamanan:
• Nomor WhatsApp: ${targetUser.phone} (Blacklisted)
• IP Address: ${banDetails.ipAddress} (IP Blocked)
• Perangkat (Device ID): ${banDetails.deviceId} (Hardware Blacklisted)
Alasan: ${reason}`,
      bannedUserPhone: targetUser.phone,
    };
    addAnnouncement(banNotice);

    addNotification({
      type: 'BAN',
      title: '🚨 SANKSI SIBER DITERAPKAN',
      message: `Akun ${targetUser.name} (${targetUser.phone}) telah di-banned total (IP, Perangkat, WA).`,
    });
  };

  // Unban User
  const unbanUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isBanned: false, banReason: undefined, banDetails: undefined }
          : u
      )
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        isBanned: false,
        banReason: undefined,
        banDetails: undefined,
      }));
    }

    addNotification({
      type: 'SYSTEM',
      title: 'Ban Dicabut oleh Admin',
      message: `Blokir multi-dimensi untuk ${target?.name || userId} telah dibatalkan oleh Admin.`,
    });
  };

  // Schedule Config
  const updateSchedules = (newSched: ScheduleConfig) => {
    setSchedules(newSched);
    addNotification({
      type: 'SYSTEM',
      title: 'Jadwal & Aturan Diperbarui',
      message: `Jam pesan (${newSched.bookingStartHour}-${newSched.bookingEndHour}), Jam Jual Beli (${newSched.tradingStartHour}-${newSched.tradingEndHour}), Kuota Perebutan (${newSched.grabbingRulesPeopleCount} orang).`,
    });
  };

  // Exchange Crypto <-> IDR
  const togglePriceLock = () => {
    if (isRateLocked) {
      setIsRateLocked(false);
      setLockedRateValue(null);
      addNotification({
        type: 'EXCHANGE',
        title: 'Kunci Harga Dilepas',
        message: 'Kurs mengikuti pergerakan real-time 1 menit.',
      });
    } else {
      setIsRateLocked(true);
      setLockedRateValue(exchangeRateUsdtToIdr);
      addNotification({
        type: 'EXCHANGE',
        title: 'Harga Dikunci! (Cut Price)',
        message: `Kurs berhasil dikunci di Rp ${exchangeRateUsdtToIdr.toLocaleString('id-ID')} / USDT selama sesi transaksi.`,
      });
    }
  };

  const createExchangeRequest = (
    type: 'CRYPTO_TO_IDR' | 'IDR_TO_CRYPTO',
    usdtAmount: number,
    isLocked: boolean,
    customWalletAddress?: string,
    customBankDetails?: string,
    userPaymentProof?: string,
    isTicketPurchase?: boolean,
    ticketCount?: number
  ) => {
    const currentRate = isLocked && lockedRateValue ? lockedRateValue : exchangeRateUsdtToIdr;
    const grossIdr = usdtAmount * currentRate;
    const commissionPercent = 0.01; // 1% admin exchange commission
    const netIdr = type === 'CRYPTO_TO_IDR' ? grossIdr * (1 - commissionPercent) : grossIdr * (1 + commissionPercent);

    const resolvedWallet = (customWalletAddress && customWalletAddress.trim()) || currentUser.walletAddress || '0x71C8a93Bf1D40...';
    const now = Date.now();

    const newReq: ExchangeRequest = {
      id: 'ex_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type,
      amountUsdt: usdtAmount,
      amountIdr: Math.round(netIdr),
      ratePerUsdt: currentRate,
      isPriceLocked: isLocked,
      status: 'PENDING',
      createdAt: now,
      targetWalletAddress: type === 'IDR_TO_CRYPTO' ? resolvedWallet : undefined,
      bankDetails:
        type === 'CRYPTO_TO_IDR'
          ? (customBankDetails && customBankDetails.trim())
            ? customBankDetails.trim()
            : currentUser.bankAccount
            ? `${currentUser.bankAccount.bankName} - ${currentUser.bankAccount.accountNumber} a/n ${currentUser.bankAccount.accountHolder}`
            : 'Bank BCA 8830129481'
          : `Wallet USDT: ${resolvedWallet}`,
      userPaymentProof: userPaymentProof || undefined,
      isTicketPurchase: isTicketPurchase || false,
      ticketCount: ticketCount || (isTicketPurchase ? usdtAmount : undefined),
    };

    setExchangeRequests((prev) => [newReq, ...prev]);

    // Normal User notification
    addNotification({
      type: 'EXCHANGE',
      title: isTicketPurchase ? '⏳ PEMBELIAN TIKET TERKIRIM (ON PROCESS)' : 'Permintaan Exchange Dikirim',
      message: isTicketPurchase
        ? `Laporan pembelian ${ticketCount || usdtAmount} Tiket ($${usdtAmount} USDT) dikirim. Status saat ini ON PROCESS (Menunggu Verifikasi Admin).`
        : `Penukaran ${type === 'CRYPTO_TO_IDR' ? `$${usdtAmount} USDT ➔ IDR` : `IDR ➔ $${usdtAmount} USDT`} sedang diproses oleh Admin.`,
    });

    // Admin notification
    addNotification({
      type: 'EXCHANGE',
      title: isTicketPurchase ? '🎟️ PERMINTAAN TIKET TOP UP BARU!' : '🔔 PERMINTAAN EXCHANGE BARU!',
      message: isTicketPurchase
        ? `Pengguna ${currentUser.name} (${currentUser.phone}) mengajukan pembelian ${ticketCount || usdtAmount} Tiket ($${usdtAmount} USDT). Mohon periksa bukti transfer & verifikasi.`
        : `Pengguna ${currentUser.name} (${currentUser.phone}) mengajukan exchange ${type === 'CRYPTO_TO_IDR' ? `$${usdtAmount} USDT ➔ Rp ${Math.round(netIdr).toLocaleString('id-ID')}` : `Rp ${Math.round(netIdr).toLocaleString('id-ID')} ➔ $${usdtAmount} USDT`}. Mohon konfirmasi & transfer.`,
    });
  };

  // Support Tickets / Helpdesk
  const createSupportTicket = (ticketData: {
    category: SupportTicketCategory;
    subject: string;
    description: string;
    reportedUser?: string;
    attachmentUrl?: string;
    priority?: SupportTicketPriority;
  }) => {
    const newTicket: SupportTicket = {
      id: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      reportedUser: ticketData.reportedUser,
      attachmentUrl: ticketData.attachmentUrl,
      status: 'OPEN',
      priority: ticketData.priority || 'MEDIUM',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSupportTickets((prev) => [newTicket, ...prev]);

    addNotification({
      type: 'SYSTEM',
      title: 'Tiket Support Dikirim',
      message: `Tiket pengaduan #${newTicket.id} ("${newTicket.subject}") berhasil dikirim. Tim Admin akan meninjau segera.`,
    });

    addNotification({
      type: 'SYSTEM',
      title: '📩 TIKET PENGADUAN BARU!',
      message: `Pengguna ${currentUser.name} (${currentUser.phone}) membuat tiket pengaduan #${newTicket.id}: "${newTicket.subject}".`,
    });
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicketStatus, adminReply?: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated: SupportTicket = {
            ...t,
            status,
            adminReply: adminReply !== undefined ? adminReply : t.adminReply,
            updatedAt: Date.now(),
            resolvedAt: status === 'RESOLVED' || status === 'REJECTED' ? Date.now() : t.resolvedAt,
          };
          return updated;
        }
        return t;
      })
    );

    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    if (targetTicket) {
      addNotification({
        type: 'SYSTEM',
        title: `Status Tiket #${targetTicket.id}: ${status}`,
        message: adminReply ? `Admin merespons: "${adminReply}"` : `Tiket #${targetTicket.id} telah diperbarui menjadi ${status}.`,
      });
    }
  };

  // Admin Marks Exchange Status to "PROCESSING" (Locks user cancellation)
  const markExchangeProcessing = (requestId: string) => {
    const target = exchangeRequests.find((r) => r.id === requestId);
    if (!target) return;

    setExchangeRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'PROCESSING' } : r))
    );

    addNotification({
      type: 'EXCHANGE',
      title: '⚡ STATUS EXCHANGE: DIPROSES ADMIN',
      message: `Permintaan Exchange $${target.amountUsdt} USDT (Rp ${target.amountIdr.toLocaleString('id-ID')}) untuk ${target.userName} kini sedang DIPROSES oleh Admin. Pembatalan otomatis terkunci.`,
    });
  };

  // Admin Rejects Exchange Request
  const rejectExchangeRequest = (requestId: string, reason?: string) => {
    const target = exchangeRequests.find((r) => r.id === requestId);
    if (!target) return;

    setExchangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              adminNote: reason || 'Ditolak oleh Admin (Data/Pembayaran tidak sesuai).',
            }
          : r
      )
    );

    addNotification({
      type: 'EXCHANGE',
      title: '❌ PERMINTAAN EXCHANGE DITOLAK',
      message: `Permintaan exchange $${target.amountUsdt} USDT untuk ${target.userName} DITOLAK oleh Admin. Alasan: ${reason || 'Data/Bukti Transfer belum sesuai.'}`,
    });
  };

  // User Cancels Exchange Request (Allowed ONLY IF status is 'PENDING')
  const cancelExchangeRequest = (requestId: string): boolean => {
    const target = exchangeRequests.find((r) => r.id === requestId);
    if (!target) return false;

    if (target.status === 'PROCESSING') {
      addNotification({
        type: 'SYSTEM',
        title: '❌ TIDAK DAPAT MEMBATALKAN TRANSAKSI',
        message: 'Permintaan exchange ini telah DIPROSES oleh Admin dan tidak dapat dibatalkan!',
      });
      return false;
    }

    if (target.status === 'COMPLETED' || target.status === 'REJECTED' || target.status === 'CANCELLED') {
      return false;
    }

    setExchangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'CANCELLED', adminNote: 'Dibatalkan sendiri oleh Pengguna.' }
          : r
      )
    );

    addNotification({
      type: 'EXCHANGE',
      title: '✓ PERMINTAAN EXCHANGE DIBATALKAN',
      message: `Permintaan penukaran $${target.amountUsdt} USDT berhasil Anda batalkan.`,
    });

    return true;
  };

  const approveExchangeRequest = (requestId: string, proofTxHash?: string, note?: string, proofImage?: string) => {
    const target = exchangeRequests.find((r) => r.id === requestId);
    if (!target) return;

    const generatedTxHash = proofTxHash || `BCA_REF_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const now = Date.now();

    setExchangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'COMPLETED',
              adminProofTxHash: generatedTxHash,
              adminNote: note || 'Pembayaran telah sukses ditransfer oleh Admin.',
              adminProofImage: proofImage || r.adminProofImage || undefined,
              approvedAt: now,
            }
          : r
      )
    );

    if (target.type === 'CRYPTO_TO_IDR') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.userId ? { ...u, usdtBalance: Math.max(u.usdtBalance - target.amountUsdt, 0) } : u
        )
      );
      if (currentUser.id === target.userId) {
        setCurrentUser((prev) => ({
          ...prev,
          usdtBalance: Math.max(prev.usdtBalance - target.amountUsdt, 0),
        }));
      }
    } else {
      const ticketsToAdd = target.isTicketPurchase ? (target.ticketCount || target.amountUsdt) : 0;

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === target.userId) {
            return {
              ...u,
              usdtBalance: target.isTicketPurchase ? u.usdtBalance : (u.usdtBalance + target.amountUsdt),
              ticketBalance: u.ticketBalance + ticketsToAdd,
              isDepositDone: true,
              isLocked: false,
            };
          }
          return u;
        })
      );
      if (currentUser.id === target.userId) {
        setCurrentUser((prev) => ({
          ...prev,
          usdtBalance: target.isTicketPurchase ? prev.usdtBalance : (prev.usdtBalance + target.amountUsdt),
          ticketBalance: prev.ticketBalance + ticketsToAdd,
          isDepositDone: true,
          isLocked: false,
        }));
      }
      addMutation({
        userId: target.userId,
        type: 'EXCHANGE_BUY_IN',
        amountUsdt: target.amountUsdt,
        amountIdr: target.amountIdr,
        description: target.isTicketPurchase
          ? `Top Up ${ticketsToAdd} Tiket Verifikasi (Disetujui Admin - Centang Biru Aktif)`
          : `Pembelian USDT via Exchange (Disetujui Admin)`,
        txHash: generatedTxHash,
        senderInfo: 'Axiom Exchange Service Vault',
        status: 'COMPLETED',
      });
    }

    addNotification({
      type: 'EXCHANGE',
      title: target.isTicketPurchase ? '🎉 TOP UP TIKET BERHASIL!' : '🎉 EXCHANGE SUKSES DIBAYARKAN!',
      message: target.isTicketPurchase
        ? `Top Up ${target.ticketCount || target.amountUsdt} Tiket Verifikasi Anda telah DISETUJUI oleh Admin. Centang Biru Aktif & Tiket siap digunakan!`
        : `Permintaan penukaran ${target.userName} Rp ${target.amountIdr.toLocaleString('id-ID')} telah dikonfirmasi SUKSES. No. Ref Bukti Transfer: ${generatedTxHash}`,
    });
  };

  // Giveaway / Undian Methods
  const addGiveawayPrize = (prize: Omit<GiveawayPrize, 'id'>) => {
    const newPrize: GiveawayPrize = {
      ...prize,
      id: 'prz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setGiveawayPrizes((prev) => [newPrize, ...prev]);
    addNotification({
      type: 'SYSTEM',
      title: '🎁 Hadiah Undian Baru',
      message: `Admin menambahkan hadiah undian: ${prize.title}`,
    });
  };

  const batchAddGiveawayPrizes = (prizes: Omit<GiveawayPrize, 'id'>[]) => {
    const newPrizes: GiveawayPrize[] = prizes.map((p, idx) => ({
      ...p,
      id: 'prz_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
    }));
    setGiveawayPrizes((prev) => [...newPrizes, ...prev]);
    addNotification({
      type: 'SYSTEM',
      title: '🎁 Batch Hadiah Undian Disusun',
      message: `Admin menambahkan ${prizes.length} list item hadiah undian secara otomatis.`,
    });
  };

  const clearGiveawayPrizes = () => {
    setGiveawayPrizes([]);
  };

  const updateGiveawayPrize = (id: string, prize: Partial<GiveawayPrize>) => {
    setGiveawayPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, ...prize } : p)));
  };

  const deleteGiveawayPrize = (id: string) => {
    setGiveawayPrizes((prev) => prev.filter((p) => p.id !== id));
  };

  // Auto Draw Timer Effect for Giveaway Schedule
  useEffect(() => {
    if (!giveawaySchedule.isAutoDrawEnabled || !giveawaySchedule.scheduledTime) return;

    const checkAutoDraw = () => {
      if (giveawaySchedule.scheduledTime && Date.now() >= giveawaySchedule.scheduledTime && giveawayWinners.length === 0) {
        const totalPrizeQty = giveawayPrizes.reduce((sum, p) => sum + (p.quantity || 1), 0);
        const winnersToDraw = giveawaySchedule.scheduledWinnerCount > 0 
          ? giveawaySchedule.scheduledWinnerCount 
          : (totalPrizeQty > 0 ? totalPrizeQty : 10);
        drawGiveawayWinners(winnersToDraw);
      }
    };

    const timer = setInterval(checkAutoDraw, 5000);
    return () => clearInterval(timer);
  }, [giveawaySchedule, giveawayWinners.length, giveawayPrizes]);

  const enterGiveaway = () => {
    if (giveawayParticipants.includes(currentUser.id)) return;
    setGiveawayParticipants((prev) => [...prev, currentUser.id]);
    addNotification({
      type: 'SYSTEM',
      title: '🎉 Berhasil Terdaftar Undian!',
      message: `Akun Anda (${currentUser.name}) telah resmi terdaftar sebagai peserta undian hadiah Axiom Virtu.`,
    });
  };

  const drawGiveawayWinners = (winnerCount?: number) => {
    // 1. Flatten all prizes from active giveawayPrizes according to their quantities
    const prizesFlat: { title: string; badge: string }[] = [];
    giveawayPrizes.forEach((p) => {
      const qty = p.quantity && p.quantity > 0 ? p.quantity : 1;
      for (let i = 0; i < qty; i++) {
        prizesFlat.push({ title: p.title, badge: p.badgeText || 'PEMENANG' });
      }
    });

    const totalPrizeQty = prizesFlat.length;
    // Target winner count defaults to total sum of prize quantities if not specified
    const targetCount = winnerCount && winnerCount > 0 
      ? winnerCount 
      : (totalPrizeQty > 0 ? totalPrizeQty : 10);

    // 2. Build candidate pool from giveawayParticipants (tickets entries) or all users
    let pool: UserProfile[] = [];
    if (giveawayParticipants.length > 0) {
      giveawayParticipants.forEach((partId) => {
        const foundUser = users.find((u) => u.id === partId);
        if (foundUser) {
          pool.push(foundUser);
        }
      });
    }

    if (pool.length === 0) {
      pool = users.length > 0 ? [...users] : [currentUser];
    }

    // 3. Shuffle candidate pool randomly using Fisher-Yates algorithm
    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    // 4. Select unique winners up to targetCount
    const selectedUsers: UserProfile[] = [];
    const usedUserIds = new Set<string>();

    for (const cand of shuffledPool) {
      if (selectedUsers.length >= targetCount) break;
      if (!usedUserIds.has(cand.id)) {
        usedUserIds.add(cand.id);
        selectedUsers.push(cand);
      }
    }

    // If candidate pool has fewer unique users than targetCount, fill remaining slots
    if (selectedUsers.length < targetCount && shuffledPool.length > 0) {
      for (let i = 0; selectedUsers.length < targetCount; i++) {
        selectedUsers.push(shuffledPool[i % shuffledPool.length]);
      }
    }

    // 5. Generate final winners list with assigned prize
    const newWinners: GiveawayWinner[] = selectedUsers.map((u, idx) => {
      const assigned = prizesFlat[idx] || { title: 'Bonus Saldo $10 USDT', badge: `PEMENANG #${idx + 1}` };
      const maskedPhone = u.phone ? u.phone.replace(/(\+\d{4})\d+(\d{4})/, '$1****$2') : '+62812****0000';
      return {
        id: 'wn_' + Date.now() + '_' + idx,
        userId: u.id,
        userName: u.id === currentUser.id ? `${u.name} (Anda)` : u.name,
        userPhone: maskedPhone,
        prizeTitle: assigned.title,
        prizeBadge: assigned.badge,
        luckyNumber: `#LUCKY-${Math.floor(1000 + Math.random() * 9000)}`,
        wonAt: Date.now(),
      };
    });

    setGiveawayWinners(newWinners);

    addNotification({
      type: 'SYSTEM',
      title: '🎲 HASIL UNDIAN RESMI TERBIT!',
      message: `Sistem pengocokan otomatis telah menyelesaikan pengundian. ${newWinners.length} Pemenang Resmi telah terpilih sesuai daftar ${totalPrizeQty} hadiah!`,
    });

    addAnnouncement({
      type: 'NEWS',
      title: '🎉 HASIL PENGUNDIAN HADIAH AXIOM VIRTU',
      content: `Pengundian ${newWinners.length} Pemenang Resmi telah selesai dikocok secara otomatis oleh sistem! Silakan buka menu Undian untuk melihat daftar pemenang lengkap beserta nomor unik keberuntungan.`,
    });
  };

  const resetGiveawayWinners = () => {
    setGiveawayWinners([]);
    addNotification({
      type: 'SYSTEM',
      title: 'Undian Direset',
      message: 'Daftar pemenang undian telah direset oleh Admin untuk periode berikutnya.',
    });
  };

  const grantRaffleTicketForAssetPurchase = (targetUserId: string, assetName: string) => {
    // 1. Add ticket to giveawayParticipants pool so user gets a entry / raffle ticket
    setGiveawayParticipants((prev) => [...prev, targetUserId]);

    // 2. Increment ticket balance in user profile
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, ticketBalance: (u.ticketBalance || 0) + 1 } : u))
    );
    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser((prev) => ({ ...prev, ticketBalance: (prev.ticketBalance || 0) + 1 }));
    }

    // 3. Send notification
    addNotification({
      type: 'WIN',
      title: '🎟️ TIKET GRATIS UNDIAN DIPEROLEH!',
      message: `Selamat! Karena Anda telah berhasil membeli & mendapatkan aset "${assetName}", Anda otomatis mendapatkan 1 Tiket Gratis Undian yang langsung terdaftar di list pengundian!`,
    });
  };

  const updateGiveawayWinnerDelivery = (
    winnerId: string,
    proofData: { proofTxHash: string; proofImageUrl?: string; adminNote?: string }
  ) => {
    setGiveawayWinners((prev) =>
      prev.map((w) => {
        if (w.id === winnerId) {
          const defaultImg =
            proofData.proofImageUrl && proofData.proofImageUrl.trim()
              ? proofData.proofImageUrl.trim()
              : 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80';

          const updated: GiveawayWinner = {
            ...w,
            deliveryStatus: 'SENT',
            proofTxHash: proofData.proofTxHash.trim(),
            proofImageUrl: defaultImg,
            adminNote: proofData.adminNote ? proofData.adminNote.trim() : 'Hadiah telah dikirimkan oleh Admin.',
            sentAt: Date.now(),
          };

          addNotification({
            type: 'PAYMENT',
            title: '🎁 BUKTI PENGIRIMAN HADIAH UNDIAN TERSEDIA!',
            message: `Admin telah mengirimkan bukti transfer TRX Hash & Foto untuk hadiah "${w.prizeTitle}". TRX Hash: ${proofData.proofTxHash}`,
          });

          return updated;
        }
        return w;
      })
    );
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'timestamp'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: 'anc_' + Date.now(),
      timestamp: Date.now(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  // Chat
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderPhone: currentUser.phone,
      senderRole: currentUser.role,
      message: text.trim(),
      timestamp: Date.now(),
      isE2eEncrypted: true,
    };
    setChatMessages((prev) => [...prev, msg]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        isLoggedIn,
        setIsLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isTicketModalOpen,
        setIsTicketModalOpen,
        isOutOfTicketsModalOpen,
        setIsOutOfTicketsModalOpen,
        activeTab,
        setActiveTab,
        isMobilePreviewMode,
        setIsMobilePreviewMode,
        assets,
        addAsset,
        updateAssetSchedule,
        updateAssetStock,
        addAdminStockToAsset,
        updateAssetDetails,
        deleteAsset,
        burnAsset,
        bookAssetSlot,
        runGrabProcess,
        processUnsoldAssetSession,
        executeAdminManualBuyback,
        declineAdminManualBuyback,
        triggerAllUnsoldCheck,
        tradeRecords,
        addTradeRecord,
        simulateTradeResult,
        completeTradeRecordPayment,
        uploadBuyerTradeProof,
        triggerSystemBuyback,
        paySystemBuyback,
        executeAdminBurnForBuyback,
        schedules,
        updateSchedules,
        topUpPaymentConfig,
        updateTopUpPaymentConfig,
        topUpTickets,
        performInitialDeposit,
        mutations,
        addMutation,
        simulateIncomingDeposit,
        approveDepositMutation,
        rejectDepositMutation,
        setUserVerificationStatus,
        updateVerificationThreshold,
        activeWinningAsset,
        setActiveWinningAsset,
        completePaymentProof,
        triggerSanctionAutoBan,
        unbanUser,
        exchangeRequests,
        createExchangeRequest,
        markExchangeProcessing,
        approveExchangeRequest,
        rejectExchangeRequest,
        cancelExchangeRequest,
        exchangeRateUsdtToIdr,
        coingeckoSource,
        coingeckoLastUpdated,
        rateTickerSeconds,
        togglePriceLock,
        isRateLocked,
        lockedRateValue,
        giveawayPrizes,
        giveawayWinners,
        giveawayParticipants,
        giveawaySchedule,
        updateGiveawaySchedule,
        addGiveawayPrize,
        batchAddGiveawayPrizes,
        clearGiveawayPrizes,
        updateGiveawayPrize,
        deleteGiveawayPrize,
        enterGiveaway,
        drawGiveawayWinners,
        resetGiveawayWinners,
        updateGiveawayWinnerDelivery,
        grantRaffleTicketForAssetPurchase,
        supportTickets,
        createSupportTicket,
        updateTicketStatus,
        isSupportModalOpen,
        setIsSupportModalOpen,
        announcements,
        addAnnouncement,
        chatMessages,
        sendChatMessage,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        switchUserRole,
        telegramUser,
        telegramId,
        isTelegramConnected,
        telegramInitData,
        connectTelegram,
        disconnectTelegram,
        logout,
        generateRandomAssetName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
