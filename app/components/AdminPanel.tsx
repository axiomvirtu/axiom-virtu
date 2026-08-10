import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { DigitalAsset, AssetTheme, UserProfile } from '../types';
import { CycleSimulationTable } from './CycleSimulationTable';
import { RaffleShuffleModal } from './RaffleShuffleModal';
import { PrizeLogo } from './PrizeLogo';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Flame,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
  Settings,
  User,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCcw,
  Zap,
  Globe,
  Smartphone,
  MessageSquare,
  ShieldCheck,
  PackageCheck,
  Sliders,
  Eye,
  Edit3,
  Layers,
  ArrowRightLeft,
  QrCode,
  Building2,
  Save,
  Upload,
  Gift,
  Trophy,
  Ticket,
  Send,
  Wallet,
  BarChart3,
  TrendingUp,
  Activity,
  History,
  Search,
  Filter,
  PieChart,
  FileText,
  Copy,
  Image as ImageIcon,
  Camera,
  LifeBuoy,
  Paperclip,
  Bot,
  ShoppingCart,
} from 'lucide-react';
import { AdminAgentView } from './AdminAgentView';
import { determineSmartMaxPriceAction, checkAssetStockDeficit } from '../utils/cycleSimulation';

interface AssetStockDemandChartProps {
  assetName: string;
  totalStock: number;
  ticketDemand: number;
}

const AssetStockDemandChart: React.FC<AssetStockDemandChartProps> = ({
  totalStock,
  ticketDemand,
}) => {
  const isOversupply = totalStock > ticketDemand;
  const margin = Math.abs(totalStock - ticketDemand);

  const chartData = [
    {
      name: 'Stok Aset',
      value: totalStock,
      color: isOversupply ? '#f43f5e' : '#38bdf8', // rose if excess, cyan if normal
    },
    {
      name: 'Demand Tiket',
      value: ticketDemand,
      color: '#f59e0b', // amber
    },
  ];

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono">
      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-300 font-bold gap-1">
        <span className="flex items-center gap-1.5 text-slate-200">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Grafik Perbandingan Recharts (Stok vs Demand Tiket)</span>
        </span>
        {isOversupply ? (
          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[9px] font-extrabold animate-pulse flex items-center gap-1">
            <span>⚡ Excess: +{margin} Stok (Auto-Buy Margin)</span>
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold">
            ✓ Margin Seimbang ({margin} Selisih)
          </span>
        )}
      </div>

      <div className="h-16 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 2, right: 30, left: 10, bottom: 2 }}>
            <XAxis type="number" hide domain={[0, (dataMax: number) => Math.max(dataMax + 2, 5)]} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-1.5 rounded text-[10px] shadow-xl text-slate-200 font-mono">
                      <p className="font-bold">{data.name}: <span className="text-cyan-300">{data.value} Unit</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    setActiveTab,
    assets,
    tradeRecords,
    addAsset,
    updateAssetSchedule,
    updateAssetStock,
    addAdminStockToAsset,
    updateAssetDetails,
    deleteAsset,
    burnAsset,
    runGrabProcess,
    triggerSystemBuyback,
    paySystemBuyback,
    executeAdminBurnForBuyback,
    exchangeRateUsdtToIdr,
    schedules,
    updateSchedules,
    users,
    mutations,
    approveDepositMutation,
    rejectDepositMutation,
    exchangeRequests,
    markExchangeProcessing,
    approveExchangeRequest,
    rejectExchangeRequest,
    addAnnouncement,
    generateRandomAssetName,
    triggerSanctionAutoBan,
    unbanUser,
    setUserVerificationStatus,
    updateVerificationThreshold,
    topUpPaymentConfig,
    updateTopUpPaymentConfig,
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
    drawGiveawayWinners,
    resetGiveawayWinners,
    updateGiveawayWinnerDelivery,
    supportTickets,
    updateTicketStatus,
    processUnsoldAssetSession,
    executeAdminManualBuyback,
    declineAdminManualBuyback,
    triggerAllUnsoldCheck,
  } = useApp();

  // Active Admin View Tab (for clean sub-navigation)
  const [adminTab, setAdminTab] = useState<
    | 'ASSETS_STOCK'
    | 'UNSOLD_BUYBACK_QUEUE'
    | 'MARKET_HISTORY'
    | 'SCHEDULE_BIDDING'
    | 'USERS_BAN'
    | 'MEMBER_ACTIVATION'
    | 'EXCHANGE_APPROVALS'
    | 'ANNOUNCEMENTS'
    | 'PAYMENT_CONFIG'
    | 'GIVEAWAY_ADMIN'
    | 'SUPPORT_TICKETS'
    | 'AI_AGENT'
  >('ASSETS_STOCK');

  // Market Transaction History Filters & State
  const [marketHistorySearch, setMarketHistorySearch] = useState('');
  const [marketHistoryUserFilter, setMarketHistoryUserFilter] = useState<string>('ALL');
  const [marketHistoryAssetFilter, setMarketHistoryAssetFilter] = useState<string>('ALL');
  const [marketHistoryTypeFilter, setMarketHistoryTypeFilter] = useState<string>('ALL');
  const [marketHistoryResultFilter, setMarketHistoryResultFilter] = useState<string>('ALL');

  // Dedicated Per-User Transaction History Modal State
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<UserProfile | null>(null);
  const [userHistoryTab, setUserHistoryTab] = useState<'ALL' | 'TRADES' | 'MUTATIONS' | 'EXCHANGES' | 'ASSETS'>('ALL');
  const [userHistorySearch, setUserHistorySearch] = useState('');

  // Dedicated Per-Asset Transaction History Modal State
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<DigitalAsset | null>(null);

  // Dedicated Admin Stock Addition Modal State (Direct Wallet Admin)
  const [addAdminStockTarget, setAddAdminStockTarget] = useState<DigitalAsset | null>(null);
  const [adminStockUnitsInput, setAdminStockUnitsInput] = useState<number>(1);
  const [adminWalletInput, setAdminWalletInput] = useState<string>('');
  const [adminSellerNameInput, setAdminSellerNameInput] = useState<string>('Axiom Official Admin Vault');
  const [adminSellerPhoneInput, setAdminSellerPhoneInput] = useState<string>('+6289999999999');

  const handleOpenAddAdminStockModal = (ast: DigitalAsset) => {
    setAddAdminStockTarget(ast);
    setAdminStockUnitsInput(1);
    const defaultWallet =
      ast.sellerWalletAddress ||
      currentUser.walletAddress ||
      '0xADMIN_VAULT_AXIOM_99';
    setAdminWalletInput(defaultWallet);
    setAdminSellerNameInput(ast.sellerName || 'Axiom Official Admin Vault');
    setAdminSellerPhoneInput(ast.sellerPhone || currentUser.phone || '+6289999999999');
  };

  const handleConfirmAddAdminStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdminStockTarget || adminStockUnitsInput <= 0) return;
    addAdminStockToAsset(
      addAdminStockTarget.id,
      adminStockUnitsInput,
      adminWalletInput,
      adminSellerNameInput,
      adminSellerPhoneInput
    );
    setAddAdminStockTarget(null);
  };

  // System Buyback Payment Proof Form Modal State
  const [buybackPaymentTarget, setBuybackPaymentTarget] = useState<any | null>(null);
  const [buybackTxHashInput, setBuybackTxHashInput] = useState('');
  const [buybackProofImageInput, setBuybackProofImageInput] = useState('');
  const [buybackProofImagePreviewModal, setBuybackProofImagePreviewModal] = useState<string | null>(null);
  const [copiedTxHashId, setCopiedTxHashId] = useState<string | null>(null);

  // Helper to open payment form for a buyback trade record
  const handleOpenBuybackPaymentForm = (rec: any) => {
    setBuybackPaymentTarget(rec);
    setBuybackTxHashInput(
      rec.proofTxHash || `0x8f${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`
    );
    setBuybackProofImageInput(
      rec.proofImageUrl ||
        'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=500&auto=format&fit=crop&q=80'
    );
  };

  // Helper to handle local file upload for payment proof image
  const handleBuybackFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBuybackProofImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to submit payment proof and complete buyback payment
  const handleConfirmBuybackPayment = () => {
    if (!buybackPaymentTarget) return;
    paySystemBuyback(buybackPaymentTarget.id, buybackProofImageInput, buybackTxHashInput);
    setBuybackPaymentTarget(null);
  };

  // Helper to copy TX Hash to clipboard
  const handleCopyTxHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxHashId(id);
    setTimeout(() => setCopiedTxHashId(null), 2000);
  };

  // Payment Config Editor Form State
  const [bankNameInput, setBankNameInput] = useState(topUpPaymentConfig.bankName);
  const [accountNumberInput, setAccountNumberInput] = useState(topUpPaymentConfig.accountNumber);
  const [accountHolderInput, setAccountHolderInput] = useState(topUpPaymentConfig.accountHolder);
  const [adminUsdtTrc20AddressInput, setAdminUsdtTrc20AddressInput] = useState(topUpPaymentConfig.adminUsdtTrc20Address || 'TY3v7x89K2m9pL1aN4sQ8wZ5eX7rT6uV9w');
  const [qrisImageUrlInput, setQrisImageUrlInput] = useState(topUpPaymentConfig.qrisImageUrl);
  const [qrisNmidInput, setQrisNmidInput] = useState(topUpPaymentConfig.qrisNmid);
  const [qrisMerchantNameInput, setQrisMerchantNameInput] = useState(topUpPaymentConfig.qrisMerchantName);
  const [instructionsInput, setInstructionsInput] = useState(topUpPaymentConfig.instructionsNote || '');
  const [paymentSavedNotify, setPaymentSavedNotify] = useState(false);
  const [isDraggingAdmin, setIsDraggingAdmin] = useState(false);

  // Giveaway Form State
  const [confirmClearPrizes, setConfirmClearPrizes] = useState(false);
  const [prizeInputMode, setPrizeInputMode] = useState<'SPLIT_POOL' | 'SINGLE'>('SPLIT_POOL');
  const [splitTotalPool, setSplitTotalPool] = useState<number>(100);
  const [splitWinnerCount, setSplitWinnerCount] = useState<number>(10);
  const [splitUnit, setSplitUnit] = useState<string>('USDT');
  const [prizeTitle, setPrizeTitle] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [prizeCategory, setPrizeCategory] = useState<'GADGET' | 'USDT' | 'TICKET'>('USDT');
  const [prizeBadge, setPrizeBadge] = useState('PEMENANG');
  const [prizeImage, setPrizeImage] = useState('');
  const [prizeQty, setPrizeQty] = useState<number>(1);
  const [drawWinnerCount, setDrawWinnerCount] = useState<number>(10);

  // Interactive Raffle Shuffle Modal State
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false);

  // Scheduled Draw Form State
  const [schedDateInput, setSchedDateInput] = useState<string>(() => {
    if (giveawaySchedule?.scheduledTime) {
      const d = new Date(giveawaySchedule.scheduledTime);
      const tzoffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
    }
    return '';
  });
  const [schedAutoDrawInput, setSchedAutoDrawInput] = useState<boolean>(giveawaySchedule?.isAutoDrawEnabled ?? true);
  const [schedWinnerCountInput, setSchedWinnerCountInput] = useState<number>(giveawaySchedule?.scheduledWinnerCount || 10);
  const [schedNoteInput, setSchedNoteInput] = useState<string>(giveawaySchedule?.note || 'Pengocokan Resmi Hadiah Undian Axiom');
  const [schedSavedNotify, setSchedSavedNotify] = useState(false);

  // Winner Proof Delivery Form State
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null);
  const [proofTxHashInput, setProofTxHashInput] = useState('');
  const [proofImageUrlInput, setProofImageUrlInput] = useState('');
  const [proofAdminNoteInput, setProofAdminNoteInput] = useState('');

  // Exchange Approval Quick Form State
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [activeReqProofId, setActiveReqProofId] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [proofImageInput, setProofImageInput] = useState('');

  const handleAdminExchangeProofFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap unggah file gambar (PNG, JPG, WEBP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProofImageInput(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdminQrisImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap unggah file gambar (PNG, JPG, WEBP, GIF)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setQrisImageUrlInput(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateTopUpPaymentConfig({
      bankName: bankNameInput.trim(),
      accountNumber: accountNumberInput.trim(),
      accountHolder: accountHolderInput.trim(),
      adminUsdtTrc20Address: adminUsdtTrc20AddressInput.trim(),
      qrisImageUrl: qrisImageUrlInput.trim(),
      qrisNmid: qrisNmidInput.trim(),
      qrisMerchantName: qrisMerchantNameInput.trim(),
      instructionsNote: instructionsInput.trim(),
    });
    setPaymentSavedNotify(true);
    setTimeout(() => setPaymentSavedNotify(false), 3000);
  };

  // Member Activation Management State
  const [memberFilter, setMemberFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [minDepositInput, setMinDepositInput] = useState<number>(schedules.minVerificationDepositUsdt ?? 5);

  // Support Tickets Admin State
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');
  const [ticketReplies, setTicketReplies] = useState<{ [ticketId: string]: string }>({});

  // New Asset Form State
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [themeInput, setThemeInput] = useState<AssetTheme>('CYBERPUNK');
  const [assetNameInput, setAssetNameInput] = useState('Cyber-Core #109 Alpha');
  const [priceInput, setPriceInput] = useState<number>(30);
  const [minPriceInput, setMinPriceInput] = useState<number>(30);
  const [maxPriceInput, setMaxPriceInput] = useState<number>(0); // 0 = Auto 15x cycle
  const [contractDaysInput, setContractDaysInput] = useState<number>(3);
  const [profitPercentInput, setProfitPercentInput] = useState<number>(7);
  const [initialStockInput, setInitialStockInput] = useState<number>(10);
  const [maxGrabbersInput, setMaxGrabbersInput] = useState<number>(schedules.grabbingRulesPeopleCount || 5);
  
  // Custom Schedule toggle for new asset
  const [isCustomScheduleActive, setIsCustomScheduleActive] = useState(false);
  const [customBookingStart, setCustomBookingStart] = useState('09:00');
  const [customBookingEnd, setCustomBookingEnd] = useState('11:30');
  const [customTradingStart, setCustomTradingStart] = useState('12:00');
  const [customTradingEnd, setCustomTradingEnd] = useState('14:30');

  // Edit Existing Asset Schedule Modal
  const [editingAssetScheduleId, setEditingAssetScheduleId] = useState<string | null>(null);
  const [editBookStart, setEditBookStart] = useState('09:00');
  const [editBookEnd, setEditBookEnd] = useState('11:30');
  const [editTradeStart, setEditTradeStart] = useState('12:00');
  const [editTradeEnd, setEditTradeEnd] = useState('14:30');

  // Edit Asset Specifications Modal
  const [editingAssetDetails, setEditingAssetDetails] = useState<DigitalAsset | null>(null);
  const [editPrice, setEditPrice] = useState<number>(30);
  const [editMinPrice, setEditMinPrice] = useState<number>(30);
  const [editMaxPrice, setEditMaxPrice] = useState<number>(0);
  const [editDays, setEditDays] = useState<number>(3);
  const [editProfit, setEditProfit] = useState<number>(7);
  const [editGrabbers, setEditGrabbers] = useState<number>(5);
  const [editMaxStockCapacity, setEditMaxStockCapacity] = useState<number>(15);
  const [editTicketTarget, setEditTicketTarget] = useState<number>(15);
  const [editMaxPriceAction, setEditMaxPriceAction] = useState<'AUTO_SMART_ROUTE' | 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER'>('AUTO_SMART_ROUTE');
  const [editNextTierAssetId, setEditNextTierAssetId] = useState<string>('');

  // Stock Adjustment Inline Editor
  const [editingStockAssetId, setEditingStockAssetId] = useState<string | null>(null);
  const [tempStockInput, setTempStockInput] = useState<number>(0);

  // Dedicated Target Ticket & Max Stock Capacity Editor Modal/Inline State
  const [targetSettingAssetId, setTargetSettingAssetId] = useState<string | null>(null);
  const [settingTargetTicket, setSettingTargetTicket] = useState<number>(15);
  const [settingMaxCapacity, setSettingMaxCapacity] = useState<number>(15);

  const handleOpenTargetSetting = (ast: DigitalAsset) => {
    setTargetSettingAssetId(ast.id);
    setSettingTargetTicket(ast.ticketBookingTarget ?? 15);
    setSettingMaxCapacity(ast.maxStockCapacity ?? 15);
  };

  const handleSaveTargetSetting = (assetId: string) => {
    updateAssetDetails(assetId, {
      ticketBookingTarget: Math.max(1, settingTargetTicket),
      maxStockCapacity: Math.max(1, settingMaxCapacity),
    });
    setTargetSettingAssetId(null);
  };

  // Burn Custom Stock Modal State
  const [burningAsset, setBurningAsset] = useState<DigitalAsset | null>(null);
  const [burnStockInput, setBurnStockInput] = useState<number>(1);

  const handleOpenBurnModal = (ast: DigitalAsset) => {
    setBurningAsset(ast);
    const stock = ast.stockUnits ?? 5;
    setBurnStockInput(stock > 0 ? 1 : 1);
  };

  const handleConfirmBurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!burningAsset) return;
    burnAsset(burningAsset.id, burnStockInput);
    setBurningAsset(null);
  };

  // Schedule Form State (Global Bidding Settings)
  const [bookingStart, setBookingStart] = useState(schedules.bookingStartHour);
  const [bookingEnd, setBookingEnd] = useState(schedules.bookingEndHour);
  const [tradingStart, setTradingStart] = useState(schedules.tradingStartHour);
  const [tradingEnd, setTradingEnd] = useState(schedules.tradingEndHour);
  const [peopleCount, setPeopleCount] = useState(schedules.grabbingRulesPeopleCount);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const handleGenerateRandom = () => {
    const generated = generateRandomAssetName(themeInput);
    setAssetNameInput(generated.name);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNameInput.trim()) return;

    addAsset({
      name: assetNameInput.trim(),
      theme: themeInput,
      logo: 'Cpu',
      priceUsdt: priceInput,
      minPriceUsdt: minPriceInput || priceInput,
      maxPriceUsdt: maxPriceInput > 0 ? maxPriceInput : undefined,
      contractDays: contractDaysInput,
      dailyProfitPercent: profitPercentInput,
      sellerId: 'usr_admin',
      sellerName: 'Axiom Official Admin Vault',
      sellerPhone: '+6289999999999',
      maxGrabbers: maxGrabbersInput,
      stockUnits: initialStockInput,
      customSchedule: isCustomScheduleActive
        ? {
            bookingStartHour: customBookingStart,
            bookingEndHour: customBookingEnd,
            tradingStartHour: customTradingStart,
            tradingEndHour: customTradingEnd,
          }
        : undefined,
    });

    setIsAddAssetOpen(false);
  };

  const handleOpenEditSchedule = (ast: DigitalAsset) => {
    setEditingAssetScheduleId(ast.id);
    const s = ast.customSchedule || {
      bookingStartHour: '09:00',
      bookingEndHour: '11:30',
      tradingStartHour: '12:00',
      tradingEndHour: '14:30',
    };
    setEditBookStart(s.bookingStartHour);
    setEditBookEnd(s.bookingEndHour);
    setEditTradeStart(s.tradingStartHour);
    setEditTradeEnd(s.tradingEndHour);
  };

  const handleSaveAssetSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssetScheduleId) return;

    updateAssetSchedule(editingAssetScheduleId, {
      bookingStartHour: editBookStart,
      bookingEndHour: editBookEnd,
      tradingStartHour: editTradeStart,
      tradingEndHour: editTradeEnd,
    });

    setEditingAssetScheduleId(null);
  };

  const handleOpenEditDetails = (ast: DigitalAsset) => {
    setEditingAssetDetails(ast);
    setEditPrice(ast.priceUsdt);
    setEditMinPrice(ast.minPriceUsdt || ast.priceUsdt);
    setEditMaxPrice(ast.maxPriceUsdt || 0);
    setEditDays(ast.contractDays);
    setEditProfit(ast.dailyProfitPercent);
    setEditGrabbers(ast.maxGrabbers);
    setEditMaxStockCapacity(ast.maxStockCapacity ?? 15);
    setEditTicketTarget(ast.ticketBookingTarget ?? 15);
    setEditMaxPriceAction(ast.maxPriceAction || 'AUTO_SMART_ROUTE');
    setEditNextTierAssetId(ast.nextTierAssetId || '');
  };

  const handleSaveAssetDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssetDetails) return;

    updateAssetDetails(editingAssetDetails.id, {
      priceUsdt: editPrice,
      minPriceUsdt: editMinPrice || editPrice,
      maxPriceUsdt: editMaxPrice > 0 ? editMaxPrice : undefined,
      contractDays: editDays,
      dailyProfitPercent: editProfit,
      maxGrabbers: editGrabbers,
      maxStockCapacity: editMaxStockCapacity,
      ticketBookingTarget: editTicketTarget,
      maxPriceAction: editMaxPriceAction,
      nextTierAssetId: editNextTierAssetId || undefined,
    });

    setEditingAssetDetails(null);
  };

  const handleSaveSchedules = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchedules({
      bookingStartHour: bookingStart,
      bookingEndHour: bookingEnd,
      tradingStartHour: tradingStart,
      tradingEndHour: tradingEnd,
      grabbingRulesPeopleCount: Number(peopleCount),
    });
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement({
      type: 'NEWS',
      title: annTitle.trim(),
      content: annContent.trim(),
    });
    setAnnTitle('');
    setAnnContent('');
  };

  // Bulk add stock simulation (+5 to all active assets)
  const handleBulkAddStock = () => {
    assets.forEach((ast) => {
      const current = ast.stockUnits ?? 5;
      updateAssetStock(ast.id, current + 5);
    });
  };

  return (
    <div className="space-y-4 font-mono pb-20 text-slate-100">
      {/* 1. Mode Switcher & Admin Control Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-fuchsia-500/50 shadow-2xl relative overflow-hidden">
        {/* Neon Ambient Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-500 animate-pulse" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-fuchsia-300 uppercase tracking-wider">
                  Control Panel Super Admin
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                  Active Role: {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Pusat Kontrol Mode, Kelola Stok Aset, Aturan Jam Bidding, Sanksi & Exchange
              </p>
            </div>
          </div>

          {/* Admin Header Action Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAddAssetOpen(true)}
              className="px-3.5 py-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-600/30 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Executive Summary Dashboard & Interactive Navigation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <BarChart3 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>EXECUTIVE CONTROL DASHBOARD (KLIK UNTUK MEMBUKA TABEL):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">12 Sub-Sistem Admin Interaktif</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* 1. Total Aset & Stok */}
          <button
            type="button"
            onClick={() => setAdminTab('ASSETS_STOCK')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'ASSETS_STOCK'
                ? 'bg-gradient-to-r from-cyan-950/90 via-slate-950 to-cyan-950/70 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-cyan-950/40 via-slate-950/80 to-slate-950 border border-cyan-500/40 text-slate-300 hover:border-cyan-400 hover:bg-cyan-950/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-cyan-300 font-extrabold uppercase tracking-wider font-mono">TOTAL ASET & STOK</div>
              <div className="text-xs font-black text-cyan-200 flex items-center gap-1">
                <span>{assets.length} Aset</span>
                <span className="text-[9px] text-cyan-300 bg-cyan-950/90 px-1.5 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                  {assets.reduce((sum, a) => sum + (a.stockUnits || 0), 0)} Stok
                </span>
              </div>
            </div>
            <PackageCheck className="w-5 h-5 text-cyan-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 2. List Buyback 2x Unsold */}
          <button
            type="button"
            onClick={() => setAdminTab('UNSOLD_BUYBACK_QUEUE')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'UNSOLD_BUYBACK_QUEUE'
                ? 'bg-gradient-to-r from-amber-950/95 via-slate-950 to-amber-950/80 border-2 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-amber-950/50 via-slate-950/80 to-amber-950/30 border border-amber-500/50 text-slate-300 hover:border-amber-400 hover:bg-amber-950/70 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wider font-mono">LIST BUYBACK 2X UNSOLD</div>
              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                <span>{assets.filter((a) => a.isInAdminBuybackQueue || (a.unsoldCyclesCount && a.unsoldCyclesCount >= 2)).length} Stok</span>
                <span className="text-[9px] text-amber-200 bg-amber-950/90 px-1.5 py-0.5 rounded-full border border-amber-500/50 font-mono">Manual</span>
              </div>
            </div>
            <ShoppingCart className="w-5 h-5 text-amber-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 3. Pending Exchange */}
          <button
            type="button"
            onClick={() => setAdminTab('EXCHANGE_APPROVALS')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'EXCHANGE_APPROVALS'
                ? 'bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/70 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-emerald-950/40 via-slate-950/80 to-slate-950 border border-emerald-500/40 text-slate-300 hover:border-emerald-400 hover:bg-emerald-950/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-emerald-300 font-extrabold uppercase tracking-wider font-mono">PENDING EXCHANGE</div>
              <div className="text-xs font-black text-emerald-300 flex items-center gap-1">
                <span>{exchangeRequests.filter((r) => r.status === 'PENDING').length} Transaksi</span>
              </div>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 4. Aktivasi Member */}
          <button
            type="button"
            onClick={() => setAdminTab('MEMBER_ACTIVATION')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'MEMBER_ACTIVATION'
                ? 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/70 border-2 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-slate-950 border border-amber-500/40 text-slate-300 hover:border-amber-400 hover:bg-amber-950/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wider font-mono">AKTIVASI MEMBER</div>
              <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                <span>{users.filter((u) => !u.isDepositDone).length} Pending</span>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 5. Tiket Support */}
          <button
            type="button"
            onClick={() => setAdminTab('SUPPORT_TICKETS')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'SUPPORT_TICKETS'
                ? 'bg-gradient-to-r from-indigo-950/90 via-slate-950 to-indigo-950/70 border-2 border-indigo-400 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-indigo-950/40 via-slate-950/80 to-slate-950 border border-indigo-500/40 text-slate-300 hover:border-indigo-400 hover:bg-indigo-950/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-indigo-300 font-extrabold uppercase tracking-wider font-mono">TIKET SUPPORT</div>
              <div className="text-xs font-black text-indigo-300 flex items-center gap-1">
                <span>{supportTickets.filter((t) => t.status === 'OPEN').length} Tiket Open</span>
              </div>
            </div>
            <LifeBuoy className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 6. Total Member & Sanksi */}
          <button
            type="button"
            onClick={() => setAdminTab('USERS_BAN')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'USERS_BAN'
                ? 'bg-gradient-to-r from-fuchsia-950/90 via-slate-950 to-fuchsia-950/70 border-2 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_20px_rgba(217,70,239,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-fuchsia-950/40 via-slate-950/80 to-slate-950 border border-fuchsia-500/40 text-slate-300 hover:border-fuchsia-400 hover:bg-fuchsia-950/60 hover:shadow-[0_0_15px_rgba(217,70,239,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-fuchsia-300 font-extrabold uppercase tracking-wider font-mono">TOTAL MEMBER & SANKSIS</div>
              <div className="text-xs font-black text-fuchsia-300 flex items-center gap-1">
                <span>{users.length} Active</span>
              </div>
            </div>
            <Users className="w-5 h-5 text-fuchsia-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 7. History Transaksi Member */}
          <button
            type="button"
            onClick={() => setAdminTab('MARKET_HISTORY')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'MARKET_HISTORY'
                ? 'bg-gradient-to-r from-cyan-950/90 via-slate-950 to-cyan-950/70 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-cyan-950/40 via-slate-950/80 to-slate-950 border border-cyan-500/40 text-slate-300 hover:border-cyan-400 hover:bg-cyan-950/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-cyan-300 font-extrabold uppercase tracking-wider font-mono">HISTORY TRANSAKSI</div>
              <div className="text-xs font-black text-cyan-300 flex items-center gap-1">
                <span>{tradeRecords.length} Records</span>
              </div>
            </div>
            <History className="w-5 h-5 text-cyan-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 8. Aturan Jam Bidding */}
          <button
            type="button"
            onClick={() => setAdminTab('SCHEDULE_BIDDING')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'SCHEDULE_BIDDING'
                ? 'bg-gradient-to-r from-blue-950/90 via-slate-950 to-blue-950/70 border-2 border-blue-400 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-blue-950/40 via-slate-950/80 to-slate-950 border border-blue-500/40 text-slate-300 hover:border-blue-400 hover:bg-blue-950/60 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-blue-300 font-extrabold uppercase tracking-wider font-mono">ATURAN JAM BIDDING</div>
              <div className="text-xs font-black text-blue-300 flex items-center gap-1">
                <span>{schedules ? 1 : 0} Sesi Bidding</span>
              </div>
            </div>
            <Clock className="w-5 h-5 text-blue-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 9. Kelola Undian */}
          <button
            type="button"
            onClick={() => setAdminTab('GIVEAWAY_ADMIN')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'GIVEAWAY_ADMIN'
                ? 'bg-gradient-to-r from-purple-950/90 via-slate-950 to-purple-950/70 border-2 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-purple-950/40 via-slate-950/80 to-slate-950 border border-purple-500/40 text-slate-300 hover:border-purple-400 hover:bg-purple-950/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-purple-300 font-extrabold uppercase tracking-wider font-mono">KELOLA UNDIAN</div>
              <div className="text-xs font-black text-purple-300 flex items-center gap-1">
                <span>{giveawayPrizes.length} Hadiah</span>
              </div>
            </div>
            <Gift className="w-5 h-5 text-purple-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 10. Pengumuman */}
          <button
            type="button"
            onClick={() => setAdminTab('ANNOUNCEMENTS')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'ANNOUNCEMENTS'
                ? 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/70 border-2 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-slate-950 border border-amber-500/40 text-slate-300 hover:border-amber-400 hover:bg-amber-950/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wider font-mono">PENGUMUMAN</div>
              <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                <span>Broadcast System</span>
              </div>
            </div>
            <MessageSquare className="w-5 h-5 text-amber-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 11. Edit Payment Top Up */}
          <button
            type="button"
            onClick={() => setAdminTab('PAYMENT_CONFIG')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'PAYMENT_CONFIG'
                ? 'bg-gradient-to-r from-rose-950/90 via-slate-950 to-rose-950/70 border-2 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.02]'
                : 'bg-gradient-to-r from-rose-950/40 via-slate-950/80 to-slate-950 border border-rose-500/40 text-slate-300 hover:border-rose-400 hover:bg-rose-950/60 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-rose-300 font-extrabold uppercase tracking-wider font-mono">EDIT PAYMENT TOP UP</div>
              <div className="text-xs font-black text-rose-300 flex items-center gap-1">
                <span>QRIS & Bank</span>
              </div>
            </div>
            <QrCode className="w-5 h-5 text-rose-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>

          {/* 12. Agent AI Inspector */}
          <button
            type="button"
            onClick={() => setAdminTab('AI_AGENT')}
            className={`p-3 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer group relative overflow-hidden ${
              adminTab === 'AI_AGENT'
                ? 'bg-gradient-to-r from-indigo-950/95 via-fuchsia-950/80 to-indigo-950/90 border-2 border-indigo-400 text-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-[1.02]'
                : 'bg-gradient-to-r from-indigo-950/50 via-slate-950/90 to-fuchsia-950/40 border border-indigo-500/50 text-indigo-200 hover:border-indigo-400 hover:bg-indigo-950/70 hover:shadow-[0_0_18px_rgba(99,102,241,0.25)] hover:scale-[1.02] hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-1 relative z-10">
              <div className="text-[9px] text-indigo-300 font-extrabold uppercase tracking-wider font-mono flex items-center gap-1">
                <span>AGENT AI INSPECTOR</span>
              </div>
              <div className="text-xs font-black text-indigo-200 flex items-center gap-1">
                <span>Autonomous</span>
                <span className="text-[8px] px-1.5 py-0.2 bg-indigo-900 text-indigo-200 rounded-full font-mono uppercase border border-indigo-500/50">AI</span>
              </div>
            </div>
            <Bot className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT: ASSETS CREATION & STOCK ADJUSTMENTS */}
      {adminTab === 'ASSETS_STOCK' && (
        <div className="space-y-4">
          {/* Top Monitoring Summary Dashboard for Volume & Oversupply */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-3 font-sans shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <span>MONITORING VOLUME & OVERSUPPLY PASAR</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      Realtime Analytics
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Indikator rasio volume stok circulating vs ambang oversupply & volume transaksi tiket per aset.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBulkAddStock}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Tambah +5 stok ke semua aset"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+5 Stok Semua Aset</span>
                </button>

                {assets.some((ast) => (ast.stockUnits ?? 5) / (ast.maxStockCapacity ?? 15) >= 0.8) && (
                  <button
                    type="button"
                    onClick={() => {
                      assets.forEach((ast) => {
                        const current = ast.stockUnits ?? 5;
                        const maxCap = ast.maxStockCapacity ?? 15;
                        if (current / maxCap >= 0.8) {
                          burnAsset(ast.id, Math.max(1, Math.floor(current * 0.3)));
                        }
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/60 text-[10px] font-extrabold transition flex items-center gap-1.5 animate-pulse shadow-md cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>🔥 Intervensi Massal: Burn 30% Oversupply</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stat Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              {/* Card 1: Total Stock Volume */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Total Stok Circulating:</span>
                  <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-base font-extrabold text-cyan-300">
                  {assets.reduce((sum, a) => sum + (a.stockUnits ?? 5), 0)} <span className="text-[10px] text-slate-400">Unit</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Dari {assets.length} jenis aset digital aktif
                </div>
              </div>

              {/* Card 2: Oversupply Alert Count */}
              {(() => {
                const oversupplied = assets.filter(a => ((a.stockUnits ?? 5) / (a.maxStockCapacity ?? 15)) >= 0.8);
                return (
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    oversupplied.length > 0
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-md shadow-rose-950/30'
                      : 'bg-slate-950/80 border-slate-800 text-slate-200'
                  }`}>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Status Oversupply Aset:</span>
                      <AlertTriangle className={`w-3.5 h-3.5 ${oversupplied.length > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
                    </div>
                    <div className={`text-base font-extrabold ${oversupplied.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {oversupplied.length} <span className="text-[10px]">{oversupplied.length > 0 ? 'Aset (HAMPIR OVERSUPPLY!)' : 'Aset (Normal)'}</span>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {oversupplied.length > 0 ? 'Batas oversupply: Stok ≥ 80% Kapasitas' : 'Semua stok berada di bawah ambang oversupply'}
                    </div>
                  </div>
                );
              })()}

              {/* Card 3: Ticket Booking Volume */}
              {(() => {
                const totalTicketsBooked = assets.reduce((sum, a) => {
                  const activeCount = a.bookedUsers ? a.bookedUsers.length : 0;
                  const historyCount = (tradeRecords || []).filter(r => r.assetId === a.id && r.tradeType === 'SLOT_BOOKED').length;
                  return sum + Math.max(activeCount, historyCount);
                }, 0);
                return (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Vol. Transaksi Pemesanan Tiket:</span>
                      <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-base font-extrabold text-amber-300">
                      {totalTicketsBooked} <span className="text-[10px] text-slate-400">Tiket Terpakai</span>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Aktivitas pemesanan slot tiket oleh member
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* SECTION: PEMBELIAN OTOMATIS SISTEM (BUYBACK OVERSUPPLY & ADMIN PAYMENT/BURN) */}
          {(() => {
            const systemBuybacks = (tradeRecords || []).filter((r) => r.tradeType === 'SYSTEM_BUYBACK');
            const pendingPaymentCount = systemBuybacks.filter((r) => r.result === 'PENDING_SYSTEM_PAYMENT').length;
            const pendingBurnCount = systemBuybacks.filter((r) => r.result === 'PAID_AWAITING_BURN').length;

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 space-y-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-300 shadow-sm">
                      <ArrowRightLeft className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                        <span>🛒 PEMBELIAN OTOMATIS SISTEM (BUYBACK OVERSUPPLY)</span>
                        {pendingPaymentCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50 animate-bounce">
                            {pendingPaymentCount} MENUNGGU BAYAR
                          </span>
                        )}
                        {pendingBurnCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                            {pendingBurnCount} SIAP BURN
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Perhitungan Otomatis: <strong className="text-cyan-300">Total Stok Aset : Total Pesan Tiket</strong>. Jika Total Stok &gt; Pesan Tiket, sistem membeli aset berlebih secara otomatis (stok market berkurang) & Admin membayar satu-per-satu.
                      </p>
                    </div>
                  </div>

                  {/* Manual Trigger Option for Admin */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerSystemBuyback()}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-[11px] uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>⚡ Jalankan Pembelian Otomatis Semua Aset Berlebih (Stok &gt; Tiket)</span>
                    </button>
                  </div>
                </div>

                {/* System Buyback List */}
                {systemBuybacks.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                    <p className="text-xs text-slate-400 font-mono">
                      Belum ada antrean pembelian otomatis sistem saat ini.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Ketika ada aset yang stoknya melebihi pemesanan tiket (Rasio 1 Stok : 5 Tiket), sistem secara otomatis melakukan order pembelian buyback di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono text-xs">
                    {systemBuybacks.map((rec) => {
                      const priceUsdt = rec.priceUsdt || 100;
                      const priceIdr = Math.round(priceUsdt * (exchangeRateUsdtToIdr || 16250));
                      const isPendingPay = rec.result === 'PENDING_SYSTEM_PAYMENT';
                      const isPaidAwaitingBurn = rec.result === 'PAID_AWAITING_BURN';
                      const isBurned = rec.result === 'COMPLETED_BURNED' || rec.isBurned;

                      const noteLower = (rec.notes || '').toLowerCase();
                      const isUnsold2x = noteLower.includes('2x') || noteLower.includes('tidak terjual') || noteLower.includes('unsold');

                      return (
                        <div
                          key={rec.id}
                          className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                            isPendingPay
                              ? 'bg-slate-950/95 border-rose-500/70 shadow-md ring-1 ring-rose-500/20'
                              : isPaidAwaitingBurn
                              ? 'bg-slate-950/95 border-amber-500/70 shadow-md ring-1 ring-amber-500/20'
                              : 'bg-slate-950/80 border-slate-800 opacity-80'
                          }`}
                        >
                          {/* Header: Theme badge, Name, Unit, and Status Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider bg-slate-900 border border-slate-700 text-cyan-300">
                                {rec.theme}
                              </span>
                              <strong className="text-slate-100 font-sans text-sm">{rec.assetName}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({rec.burnUnits || 1} Unit)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isPendingPay && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-500/60 flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>MENUNGGU PEMBAYARAN ADMIN</span>
                                </span>
                              )}
                              {isPaidAwaitingBurn && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-500/60 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                  <span>PEMBAYARAN LUNAS (SIAP BURN)</span>
                                </span>
                              )}
                              {isBurned && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-amber-400" />
                                  <span>🔥 SUDAH DI-BURN</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Compact Info Pembelian & Catatan System */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono">
                            {/* Left: Info Pembelian */}
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-slate-300">
                                  Total Beli: <strong className="text-emerald-400 font-extrabold">${priceUsdt} USDT</strong> <span className="text-slate-400 text-[10px]">(Rp {priceIdr.toLocaleString('id-ID')})</span>
                                </span>
                                <span className="text-slate-700">|</span>
                                <span className="text-slate-300">
                                  Penjual: <strong className="text-slate-200">{rec.sellerName}</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>Kontak: <a href={`https://wa.me/${(rec.sellerPhone || '').replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold">{rec.sellerPhone || '-'}</a></span>
                                <span>&bull; Order: {new Date(rec.timestamp).toLocaleString('id-ID')}</span>
                              </div>
                            </div>

                            {/* Right: Catatan System Badge */}
                            <div className="shrink-0 flex items-center">
                              {isUnsold2x ? (
                                <div className="px-3 py-1 rounded-lg bg-amber-950/90 border border-amber-500/70 text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Catatan System: Stok 2x Tidak Terjual</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1 rounded-lg bg-rose-950/90 border border-rose-500/70 text-rose-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Catatan System: Oversupply</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Proof Badge & Image Preview if present */}
                          {(rec.proofTxHash || rec.proofImageUrl) && (
                            <div className="p-2 rounded-lg bg-slate-900/90 border border-cyan-500/40 font-mono text-[10px] flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Bukti Pembayaran:</span>
                                </span>
                                {rec.proofTxHash && (
                                  <span className="text-cyan-300 font-bold">TRX: {rec.proofTxHash}</span>
                                )}
                              </div>

                              {rec.proofImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setBuybackProofImagePreviewModal(rec.proofImageUrl!)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[10px] transition cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Bukti Foto</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Admin Execution Buttons */}
                          <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-sans">
                            <div className="text-[10px] text-slate-400 font-mono">
                              {isPendingPay
                                ? 'Langkah 1: Upload bukti transfer USDT'
                                : isPaidAwaitingBurn
                                ? 'Langkah 2: Eksekusi Burn stok'
                                : 'Selesai'}
                            </div>

                            <div className="flex items-center gap-2">
                              {isPendingPay && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenBuybackPaymentForm(rec)}
                                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                                >
                                  <DollarSign className="w-4 h-4 text-slate-950" />
                                  <span>BAYAR &amp; UPLOAD BUKTI TRX (${priceUsdt} USDT)</span>
                                </button>
                              )}

                              {isPaidAwaitingBurn && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBuybackPaymentForm(rec)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1"
                                    title="Edit Bukti / Re-upload"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Edit Bukti</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => executeAdminBurnForBuyback(rec.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 animate-pulse cursor-pointer active:scale-95"
                                  >
                                    <Flame className="w-4 h-4 text-amber-300" />
                                    <span>🔥 EKSEKUSI BURN ASET SEKARANG (ADMIN)</span>
                                  </button>
                                </div>
                              )}

                              {isBurned && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Selesai &amp; Di-Burn Pada {rec.burnedAt ? new Date(rec.burnedAt).toLocaleTimeString('id-ID') : 'Baru saja'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Active Asset Inventory Cards */}
          <div className="space-y-3.5">
            {assets.map((ast) => {
              const currentStock = ast.stockUnits ?? 5;
              const isOutOfStock = currentStock === 0;

              // Ticket booking volume calculation
              const activeBookingsCount = ast.bookedUsers ? ast.bookedUsers.length : 0;
              const historyBookingsCount = (tradeRecords || []).filter(
                (r) => r.assetId === ast.id && r.tradeType === 'SLOT_BOOKED'
              ).length;
              const totalTicketVolume = Math.max(activeBookingsCount, historyBookingsCount);

              // Auto calculation: Oversupply when stock exceeds demand
              const isOversupply = currentStock > totalTicketVolume;
              const excessUnits = Math.max(0, currentStock - totalTicketVolume);

              return (
                <div
                  key={ast.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    isOversupply
                      ? 'bg-slate-900/95 border-rose-500/70 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30'
                      : ast.status === 'BURNED'
                      ? 'bg-red-950/20 border-red-900/50 opacity-70'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl bg-slate-950 border ${isOversupply ? 'border-rose-500/60 text-rose-400' : 'border-cyan-500/30 text-cyan-400'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <span>{ast.name}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 text-cyan-300 border border-cyan-500/30 uppercase">
                            {ast.theme}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                          <span>Harga: <strong className="text-emerald-400">${ast.priceUsdt} USDT</strong></span>
                          <span>Kontrak: <strong className="text-slate-200">{ast.contractDays} Hari</strong></span>
                          <span>Profit: <strong className="text-cyan-300">{ast.dailyProfitPercent}% / Hari</strong></span>
                          <span>Quota Grab: <strong className="text-amber-300">{ast.maxGrabbers} Persons</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Indicator Badge */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isOversupply ? (
                        <span className="px-2.5 py-1 rounded-xl bg-rose-950 border border-rose-500/80 text-rose-300 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse shadow-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>⚠️ OVERSUPPLY (+{excessUnits} STOK)</span>
                        </span>
                      ) : isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400 text-[10px] font-black uppercase">
                          ⚠️ STOK HABIS (0)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase">
                          ✓ STOK SEIMBANG ({currentStock} UNIT)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sleek, Compact Live Calculation Panel */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300">Stok Market: <strong className="text-cyan-300 font-bold">{currentStock} Unit</strong></span>
                        <span className="text-slate-700">|</span>
                        <Ticket className="w-4 h-4 text-amber-400" />
                        <span className="text-slate-300">Pemesanan Tiket: <strong className="text-amber-300 font-bold">{totalTicketVolume} Tiket</strong></span>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Rasio System: <strong className="text-emerald-400">1 Stok = 5 Tiket Quota</strong>
                      </div>
                    </div>

                    {/* Auto Oversupply Check & Direct Action */}
                    {isOversupply ? (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-rose-300">
                              OVERSUPPLY DETECTED: Kelebihan {excessUnits} Stok dari {excessUnits} Penjual!
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">
                              Sistem HANYA akan membeli {excessUnits} unit stok berlebih (${ast.priceUsdt} USDT/unit).
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerSystemBuyback(ast.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 text-white font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 shadow cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                          <span>⚡ Beli Otomatis ({excessUnits} Stok Berlebih)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>✓ STOK SEIMBANG: Total Stok ({currentStock}) &le; Pemesanan Tiket ({totalTicketVolume}). Sesi Pasar Sehat.</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Auto System</span>
                      </div>
                    )}

                    {/* Quick Operations Bar */}
                    <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-sans">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => runGrabProcess(ast.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Ticket className="w-3 h-3 text-amber-400" />
                          <span>+ Simulasi Booking Tiket</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => burnAsset(ast.id, 1)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>🔥 Burn 1 Stok</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        Member Booked: <strong className="text-cyan-300">{activeBookingsCount} User</strong> &bull; Total Tiket: <strong className="text-amber-300">{historyBookingsCount}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Stock Adjustment Controller Bar */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Penyesuaian Stok:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateAssetStock(ast.id, currentStock - 1)}
                          disabled={currentStock <= 0}
                          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center cursor-pointer"
                          title="-1 Stok"
                        >
                          -1
                        </button>
                        <span className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs min-w-[40px] text-center">
                          {currentStock}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateAssetStock(ast.id, currentStock + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold transition flex items-center justify-center cursor-pointer"
                          title="+1 Stok"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAssetStock(ast.id, currentStock + 5)}
                          className="px-2 h-7 rounded-lg bg-slate-900 border border-cyan-500/40 hover:bg-slate-800 text-cyan-300 font-bold text-[10px] transition flex items-center justify-center cursor-pointer"
                          title="+5 Stok"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAssetStock(ast.id, currentStock + 10)}
                          className="px-2 h-7 rounded-lg bg-slate-900 border border-cyan-500/40 hover:bg-slate-800 text-cyan-300 font-bold text-[10px] transition flex items-center justify-center cursor-pointer"
                          title="+10 Stok"
                        >
                          +10
                        </button>
                      </div>

                      {/* Dedicated Button to Add Stock to Admin Wallet */}
                      <button
                        type="button"
                        onClick={() => handleOpenAddAdminStockModal(ast)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-[10px] uppercase tracking-wider transition flex items-center gap-1 shadow-md shadow-emerald-950/50 cursor-pointer active:scale-95"
                        title="Tambah stok aset baru dengan penyaluran pembayaran langsung ke Alamat Wallet Admin"
                      >
                        <Wallet className="w-3.5 h-3.5 text-slate-950" />
                        <span>+ Tambah Stok (Wallet Admin)</span>
                      </button>
                    </div>

                    {/* Custom Inline Set Stock */}
                    {editingStockAssetId === ast.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={tempStockInput}
                          onChange={(e) => setTempStockInput(Number(e.target.value))}
                          className="w-16 bg-slate-900 border border-cyan-500 rounded p-1 text-center text-cyan-300 font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateAssetStock(ast.id, tempStockInput);
                            setEditingStockAssetId(null);
                          }}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Set
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStockAssetId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStockAssetId(ast.id);
                          setTempStockInput(currentStock);
                        }}
                        className="text-[10px] text-slate-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                      >
                        Set Stok Manual
                      </button>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      {/* Bidding Simulation Button */}
                      <button
                        type="button"
                        onClick={() => runGrabProcess(ast.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-slate-950 font-black text-[10px] uppercase tracking-wider transition flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Simulasikan Perebutan / Bidding Langsung"
                      >
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>Simulasi Grab / Bidding</span>
                      </button>

                      {/* Edit Specs */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditDetails(ast)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-400" />
                        <span>Edit Detail & Kapasitas</span>
                      </button>

                      {/* View Asset Specific History */}
                      <button
                        type="button"
                        onClick={() => setSelectedAssetForHistory(ast)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
                        title="Lihat Riwayat Transaksi Rinci Aset Ini"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Riwayat Aset ({tradeRecords.filter((r) => r.assetId === ast.id).length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Burn Asset */}
                      <button
                        type="button"
                        onClick={() => handleOpenBurnModal(ast)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-950 to-amber-950 hover:brightness-125 text-fuchsia-300 border border-fuchsia-500/50 text-[10px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
                        title="Burn Stok Aset Custom"
                      >
                        <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Burn Stok</span>
                      </button>

                      {/* Delete Asset */}
                      <button
                        type="button"
                        onClick={() => deleteAsset(ast.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3.1 TAB CONTENT: ANTREAN BUYBACK MANUAL ADMIN (STOK 2X TIDAK TERJUAL) */}
      {adminTab === 'UNSOLD_BUYBACK_QUEUE' && (() => {
        const unsoldQueueAssets = assets.filter(
          (a) => a.isInAdminBuybackQueue || (a.unsoldCyclesCount && a.unsoldCyclesCount >= 2)
        );
        const totalMarketTicketsSpent = tradeRecords.reduce(
          (sum, r) => sum + (r.ticketsSpent || 0),
          0
        );
        const totalBookedUsersCount = assets.reduce(
          (sum, a) => sum + (a.bookedUsers ? a.bookedUsers.length : 0),
          0
        );

        return (
          <div className="space-y-4">
            {/* Executive Header Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 space-y-3 font-sans shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/60 text-amber-300 shadow-sm">
                    <ShoppingCart className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                      <span>LIST ANTREAN BUYBACK MANUAL ADMIN</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                        {unsoldQueueAssets.length} Stok Menunggu Approval
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      Stok aset digital yang <strong>2x tidak terjual</strong> di pasar masuk ke list ini. System <strong>TIDAK membeli otomatis</strong>. Admin dapat melihat jumlah tiket terpakai dan memutuskan pembelian manual.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerAllUnsoldCheck}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer active:scale-95"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Jalankan Simulasi Sesi Sweep</span>
                </button>
              </div>

              {/* Market Ticket Usage Overview Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tiket Terpakai di Market</div>
                    <div className="text-base font-black text-amber-400 font-mono">
                      {totalMarketTicketsSpent} Tiket
                    </div>
                  </div>
                  <Ticket className="w-5 h-5 text-amber-400 opacity-80" />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Booking User Saat Ini</div>
                    <div className="text-base font-black text-cyan-400 font-mono">
                      {totalBookedUsersCount} User Booking
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-cyan-400 opacity-80" />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Pembelian Otomatis</div>
                    <div className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>NONAKTIF (Wajib Manual Admin)</span>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-emerald-400 opacity-80" />
                </div>
              </div>
            </div>

            {/* List of Unsold 2x Assets Pending Admin Buyback Decision */}
            {unsoldQueueAssets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                <h4 className="font-bold text-slate-200 text-sm">Tidak Ada Stok 2x Tidak Terjual</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Semua stok aset digital beredar lancar di pasar atau belum menyentuh ambang batas 2x tidak terjual.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {unsoldQueueAssets.map((ast) => {
                  const astPriceIdr = Math.round(ast.priceUsdt * (exchangeRateUsdtToIdr || 16250));
                  const bookedCount = ast.bookedUsers ? ast.bookedUsers.length : 0;
                  const targetBooking = ast.maxGrabbersAllowed || schedules.grabbingRulesPeopleCount || 5;

                  return (
                    <div
                      key={ast.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/60 space-y-3.5 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-bl-xl shadow-md">
                        ⚠️ 2X UN-SOLD QUEUE
                      </div>

                      {/* Header Asset Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {ast.logo || '💎'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                            <span>{ast.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 font-mono border border-amber-500/30">
                              {ast.theme}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">
                            Pemilik/Seller: <strong className="text-slate-200">{ast.sellerName || 'User Market'}</strong> ({ast.sellerPhone || '-'})
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Wallet Seller: <span className="text-cyan-300 font-bold">{ast.sellerWalletAddress || '-'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Financial & Ticket Usage Metrics */}
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Harga Stok Aset</div>
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            ${ast.priceUsdt} USDT
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Rp {astPriceIdr.toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Sesi Tidak Terjual</div>
                          <div className="text-sm font-black text-amber-400 font-mono flex items-center gap-1">
                            <span>{ast.unsoldCyclesCount || 2}x Berturut-turut</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Tiket Terpakai: <strong className="text-amber-300">{bookedCount} Tiket</strong> / Target {targetBooking}
                          </div>
                        </div>
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                        <button
                          type="button"
                          onClick={() => executeAdminManualBuyback(ast.id)}
                          className="w-full sm:w-auto flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Beli Stok Manual (${ast.priceUsdt} USDT)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => declineAdminManualBuyback(ast.id)}
                          className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>Tolak / Kembalikan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Helper Table: Overview All Assets Unsold Tracker */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>REKAPITULASI SESI UN-SOLD SELURUH STOK MARKET</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  (Monitoring status perputaran per aset)
                </span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-950 text-slate-400 font-sans uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Aset</th>
                      <th className="p-2.5">Harga</th>
                      <th className="p-2.5">Seller</th>
                      <th className="p-2.5 text-center">Counter Unsold</th>
                      <th className="p-2.5 text-center">Status List Admin</th>
                      <th className="p-2.5 text-right">Opsi Simulasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assets.map((a) => {
                      const isQueued = a.isInAdminBuybackQueue || (a.unsoldCyclesCount && a.unsoldCyclesCount >= 2);
                      return (
                        <tr key={a.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-sans font-bold text-slate-200 flex items-center gap-2">
                            <span>{a.logo || '💎'}</span>
                            <span>{a.name}</span>
                          </td>
                          <td className="p-2.5 text-emerald-400 font-bold">${a.priceUsdt} USDT</td>
                          <td className="p-2.5 text-slate-400">{a.sellerName || 'Admin Vault'}</td>
                          <td className="p-2.5 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded ${ (a.unsoldCyclesCount || 0) >= 2 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-950 text-slate-400'}`}>
                              {a.unsoldCyclesCount || 0}x
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-sans font-bold">
                            {isQueued ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-extrabold">
                                ⚠️ ANTRIAN BUYBACK
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                                Normal Market
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => processUnsoldAssetSession(a.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 transition"
                              title="+1 Counter Sesi Tidak Terjual"
                            >
                              +1 Unsold Session
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3.5 TAB CONTENT: HISTORY TRANSAKSI & SIRKULASI MARKET GLOBAL */}
      {adminTab === 'MARKET_HISTORY' && (() => {
        const totalCirculatingUnits = assets.reduce((sum, ast) => sum + (ast.stockUnits ?? 5), 0);
        const totalMaxCapacity = assets.reduce((sum, ast) => sum + (ast.maxStockCapacity ?? 15), 0);
        const totalMarketValuationUsdt = assets.reduce((sum, ast) => sum + (ast.stockUnits ?? 5) * ast.priceUsdt, 0);
        const totalMarketValuationIdr = Math.round(totalMarketValuationUsdt * (exchangeRateUsdtToIdr || 16250));

        const totalTradesCount = tradeRecords.length;
        const totalVolumeTradedUsdt = tradeRecords.reduce((sum, rec) => sum + (rec.priceUsdt || 0), 0);
        const totalVolumeTradedIdr = Math.round(totalVolumeTradedUsdt * (exchangeRateUsdtToIdr || 16250));

        // Filter trade records
        const filteredRecords = tradeRecords.filter((rec) => {
          const matchSearch =
            !marketHistorySearch ||
            (rec.assetName || '').toLowerCase().includes(marketHistorySearch.toLowerCase()) ||
            (rec.sellerName || '').toLowerCase().includes(marketHistorySearch.toLowerCase()) ||
            (rec.buyerName || '').toLowerCase().includes(marketHistorySearch.toLowerCase()) ||
            (rec.id || '').toLowerCase().includes(marketHistorySearch.toLowerCase()) ||
            (rec.notes && rec.notes.toLowerCase().includes(marketHistorySearch.toLowerCase()));

          const matchAsset = marketHistoryAssetFilter === 'ALL' || rec.assetId === marketHistoryAssetFilter;
          const matchType = marketHistoryTypeFilter === 'ALL' || rec.tradeType === marketHistoryTypeFilter;
          const matchResult = marketHistoryResultFilter === 'ALL' || rec.result === marketHistoryResultFilter;

          const selUserObj = users.find((u) => u.id === marketHistoryUserFilter);
          const matchUser =
            marketHistoryUserFilter === 'ALL' ||
            rec.userId === marketHistoryUserFilter ||
            (selUserObj &&
              (rec.sellerName === selUserObj.name ||
                rec.buyerName === selUserObj.name ||
                rec.sellerPhone === selUserObj.phone ||
                rec.buyerPhone === selUserObj.phone));

          return matchSearch && matchAsset && matchType && matchResult && matchUser;
        });

        return (
          <div className="space-y-5">
            {/* 1. Global Circulation & Analytics Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-sm">
                    <History className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                      <span>📊 MONITOR SIRKULASI PASAR & HISTORY TRANSAKSI GLOBAL</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                        {assets.length} ASET AKTIF
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Pantau jumlah total aset beredar di pasar, volume transaksi, dan riwayat perdagangan secara lengkap & rinci.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMarketHistorySearch('');
                      setMarketHistoryAssetFilter('ALL');
                      setMarketHistoryTypeFilter('ALL');
                      setMarketHistoryResultFilter('ALL');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                {/* Card 1: Total Stok Beredar */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Stok Pasar Beredar:</span>
                    <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-xl font-black text-cyan-300">
                    {totalCirculatingUnits} <span className="text-xs font-normal text-slate-400">/ {totalMaxCapacity} Unit</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((totalCirculatingUnits / totalMaxCapacity) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 flex justify-between pt-0.5">
                    <span>Okupansi Pasar:</span>
                    <span className="text-cyan-300 font-bold">{Math.round((totalCirculatingUnits / totalMaxCapacity) * 100)}%</span>
                  </div>
                </div>

                {/* Card 2: Valuasi Sirkulasi Pasar */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Valuasi Stok Pasar:</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    ${totalMarketValuationUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">USDT</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    &asymp; Rp {totalMarketValuationIdr.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Card 3: Total Transaksi Recorded */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Total Transaksi Pasar:</span>
                    <BarChart3 className="w-3.5 h-3.5 text-fuchsia-400" />
                  </div>
                  <div className="text-xl font-black text-fuchsia-300">
                    {totalTradesCount} <span className="text-xs font-normal text-slate-400">Record</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    History tercatat di sistem
                  </div>
                </div>

                {/* Card 4: Volume Perdagangan Total */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Total Volume Trade:</span>
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-300">
                    ${totalVolumeTradedUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">USDT</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    &asymp; Rp {totalVolumeTradedIdr.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Rincian Sirkulasi & Stok Per Jenis Aset Digital */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                    RINCIAN SIRKULASI STOK & VOLUME PER ASET DIGITAL
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Klik "Detail Log" untuk melihat riwayat rinci satu aset
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-200">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">Aset Digital</th>
                      <th className="p-2.5">Harga USDT</th>
                      <th className="p-2.5">Stok Beredar</th>
                      <th className="p-2.5">Pangsa Pasar (%)</th>
                      <th className="p-2.5">Total Transaksi</th>
                      <th className="p-2.5">Total Volume ($)</th>
                      <th className="p-2.5 text-right rounded-r-lg">Aksi Rinci</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {assets.map((ast) => {
                      const stock = ast.stockUnits ?? 5;
                      const maxCap = ast.maxStockCapacity ?? 15;
                      const sharePercent = totalCirculatingUnits > 0 ? Math.round((stock / totalCirculatingUnits) * 100) : 0;
                      const assetRecords = tradeRecords.filter((r) => r.assetId === ast.id);
                      const assetVolumeUsdt = assetRecords.reduce((sum, r) => sum + (r.priceUsdt || 0), 0);

                      return (
                        <tr key={ast.id} className="hover:bg-slate-950/60 transition">
                          <td className="p-2.5 font-sans font-bold flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-950 border border-slate-800 text-cyan-300 uppercase">
                              {ast.theme}
                            </span>
                            <span>{ast.name}</span>
                          </td>
                          <td className="p-2.5 text-emerald-400 font-bold">${ast.priceUsdt} USDT</td>
                          <td className="p-2.5">
                            <span className="font-extrabold text-cyan-300">{stock}</span> / {maxCap} Unit
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-cyan-400 h-1.5" style={{ width: `${sharePercent}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-300">{sharePercent}%</span>
                            </div>
                          </td>
                          <td className="p-2.5 font-bold text-fuchsia-300">{assetRecords.length} Tx</td>
                          <td className="p-2.5 text-amber-300 font-bold">${assetVolumeUsdt.toLocaleString()} USDT</td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedAssetForHistory(ast)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-cyan-400" />
                              <span>📜 Detail Log ({assetRecords.length})</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2b. KARTU MONITOR SIRKULASI SISTEMATIS PER INDIVIDUAL ASET DIGITAL */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                    📊 MONITOR SIRKULASI PASAR SISTEMATIS PER ASET DIGITAL ({assets.length} ASET AKTIF)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  4 Indikator Utama (Stok, Valuasi, Total Transaksi, Total Volume) per aset digital
                </span>
              </div>

              <div className="space-y-4">
                {assets.map((ast) => {
                  const stock = ast.stockUnits ?? 5;
                  const maxCap = ast.maxStockCapacity ?? 15;
                  const stockRatio = Math.min(100, Math.round((stock / maxCap) * 100));
                  const valuationUsdt = stock * ast.priceUsdt;
                  const valuationIdr = Math.round(valuationUsdt * (exchangeRateUsdtToIdr || 16250));
                  const assetRecords = tradeRecords.filter((r) => r.assetId === ast.id);
                  const assetVolumeUsdt = assetRecords.reduce((sum, r) => sum + (r.priceUsdt || 0), 0);
                  const assetVolumeIdr = Math.round(assetVolumeUsdt * (exchangeRateUsdtToIdr || 16250));

                  return (
                    <div
                      key={`circ_card_${ast.id}`}
                      className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono hover:border-slate-700 transition"
                    >
                      {/* Asset Header Title */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 border border-slate-700 text-cyan-300 uppercase">
                            {ast.theme}
                          </span>
                          <span className="font-bold text-sm text-slate-100">{ast.name}</span>
                          <span className="text-xs font-bold text-emerald-400">${ast.priceUsdt} USDT / Unit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMarketHistoryAssetFilter(ast.id);
                              document.getElementById('global-market-log-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Search className="w-3 h-3 text-cyan-400" />
                            <span>Filter History Aset Ini ({assetRecords.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 Cards Grid - Exact same layout as Image 1 */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Card 1: STOK PASAR BEREDAR */}
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                            <span>STOK PASAR BEREDAR:</span>
                            <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <div className="text-xl font-black text-cyan-300">
                            {stock} <span className="text-xs font-normal text-slate-400">/ {maxCap} Unit</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${stockRatio}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 flex justify-between pt-0.5">
                            <span>Okupansi Pasar:</span>
                            <span className="text-cyan-300 font-bold">{stockRatio}%</span>
                          </div>
                        </div>

                        {/* Card 2: VALUASI STOK PASAR */}
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                            <span>VALUASI STOK PASAR:</span>
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div className="text-xl font-black text-emerald-400">
                            ${valuationUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">USDT</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            &asymp; Rp {valuationIdr.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Card 3: TOTAL TRANSAKSI PASAR */}
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                            <span>TOTAL TRANSAKSI PASAR:</span>
                            <BarChart3 className="w-3.5 h-3.5 text-fuchsia-400" />
                          </div>
                          <div className="text-xl font-black text-fuchsia-300">
                            {assetRecords.length} <span className="text-xs font-normal text-slate-400">Record</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            History tercatat di sistem
                          </div>
                        </div>

                        {/* Card 4: TOTAL VOLUME TRADE */}
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                            <span>TOTAL VOLUME TRADE:</span>
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="text-xl font-black text-amber-300">
                            ${assetVolumeUsdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">USDT</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            &asymp; Rp {assetVolumeIdr.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Recharts Mini Bar Chart Visualizing Margin Before Auto-Buy */}
                      {(() => {
                        const circActiveBookings = ast.bookedUsers ? ast.bookedUsers.length : 0;
                        const circHistoryBookings = assetRecords.filter(
                          (r) => r.tradeType === 'SLOT_BOOKED' || r.ticketsSpent > 0
                        ).length;
                        const circTicketVolume = Math.max(circActiveBookings, circHistoryBookings);
                        return (
                          <AssetStockDemandChart
                            assetName={ast.name}
                            totalStock={stock}
                            ticketDemand={circTicketVolume}
                          />
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Log Transaksi Global Pasar (Filter & Searchable) */}
            <div id="global-market-log-section" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-fuchsia-400" />
                  <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                    LOG TRANSAKSI PASAR GLOBAL ({filteredRecords.length} / {tradeRecords.length})
                  </h4>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs font-mono">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={marketHistorySearch}
                    onChange={(e) => setMarketHistorySearch(e.target.value)}
                    placeholder="Cari aset, user, note..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Filter User */}
                <div>
                  <select
                    value={marketHistoryUserFilter}
                    onChange={(e) => setMarketHistoryUserFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">-- Semua Member ({users.length}) --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Asset */}
                <div>
                  <select
                    value={marketHistoryAssetFilter}
                    onChange={(e) => setMarketHistoryAssetFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">-- Semua Aset Digital --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (${a.priceUsdt})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Trade Type */}
                <div>
                  <select
                    value={marketHistoryTypeFilter}
                    onChange={(e) => setMarketHistoryTypeFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">-- Semua Tipe Transaksi --</option>
                    <option value="BUY_WIN">BUY_WIN (Menang Bidding)</option>
                    <option value="SELL_COMPLETE">SELL_COMPLETE (Penjualan Sukses)</option>
                    <option value="SYSTEM_BUYBACK">SYSTEM_BUYBACK (Beli Otomatis Sistem)</option>
                    <option value="SLOT_BOOKED">SLOT_BOOKED (Booking Slot Tiket)</option>
                    <option value="TRANSFER_PAID">TRANSFER_PAID (Transfer Lunas)</option>
                  </select>
                </div>

                {/* Filter Result Status */}
                <div>
                  <select
                    value={marketHistoryResultFilter}
                    onChange={(e) => setMarketHistoryResultFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">-- Semua Status Result --</option>
                    <option value="WIN">WIN (Pemenang)</option>
                    <option value="COMPLETED">COMPLETED (Selesai)</option>
                    <option value="PENDING_SYSTEM_PAYMENT">PENDING_SYSTEM_PAYMENT (Menunggu Bayar Admin)</option>
                    <option value="PAID_AWAITING_BURN">PAID_AWAITING_BURN (Siap Burn Admin)</option>
                    <option value="COMPLETED_BURNED">COMPLETED_BURNED (Sudah Di-Burn)</option>
                    <option value="SELL_PENDING">SELL_PENDING (Proses Penjualan)</option>
                  </select>
                </div>
              </div>

              {/* Transactions Log List */}
              {filteredRecords.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-mono">Tidak ada riwayat transaksi yang cocok dengan filter saat ini.</p>
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs">
                  {filteredRecords.map((rec) => {
                    const priceUsdt = rec.priceUsdt || 100;
                    const priceIdr = Math.round(priceUsdt * (exchangeRateUsdtToIdr || 16250));
                    const isSystem = rec.tradeType === 'SYSTEM_BUYBACK';

                    return (
                      <div
                        key={rec.id}
                        className={`p-3 rounded-xl border transition space-y-2 ${
                          isSystem
                            ? 'bg-amber-950/20 border-amber-500/50'
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-900 border border-slate-700 text-cyan-300">
                              {rec.theme || 'NEON'}
                            </span>
                            <strong className="text-slate-100 font-sans text-sm">{rec.assetName}</strong>
                            <span className="text-[10px] text-slate-400">#{rec.id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-900 border border-slate-700 text-fuchsia-300">
                              {rec.tradeType}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                rec.result === 'WIN' || rec.result === 'COMPLETED'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                  : rec.result === 'PENDING_SYSTEM_PAYMENT'
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                  : rec.result === 'PAID_AWAITING_BURN'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                  : rec.result === 'COMPLETED_BURNED'
                                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                                  : 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                              }`}
                            >
                              {rec.result}
                            </span>
                          </div>
                        </div>

                        {/* Details Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Nominal Transaksi:</span>
                            <strong className="text-emerald-400">${priceUsdt} USDT</strong> (Rp {priceIdr.toLocaleString('id-ID')})
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Penjual & Pembeli:</span>
                            <span className="text-slate-200">{rec.sellerName || 'Member'}</span> &rarr; <span className="text-cyan-300">{rec.buyerName || 'Member'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Waktu Transaksi:</span>
                            <span className="text-slate-300">{new Date(rec.timestamp).toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {rec.notes && (
                          <div className="p-2 rounded-lg bg-slate-900/90 text-[10px] text-slate-300 border border-slate-800 leading-tight">
                            {rec.notes}
                          </div>
                        )}

                        {/* Payment Proof Badge if present */}
                        {(rec.proofTxHash || rec.proofImageUrl) && (
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] space-y-1 font-mono">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Bukti Pembayaran Admin:</span>
                              </span>
                              {rec.proofTxHash && (
                                <div className="flex items-center gap-1 text-cyan-300">
                                  <span className="text-slate-500">TRX:</span>
                                  <strong>{rec.proofTxHash}</strong>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyTxHash(rec.proofTxHash!, rec.id)}
                                    className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                  >
                                    {copiedTxHashId === rec.id ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                            {rec.proofImageUrl && (
                              <button
                                type="button"
                                onClick={() => setBuybackProofImagePreviewModal(rec.proofImageUrl!)}
                                className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 font-bold pt-0.5 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Foto Bukti Transfer</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* System Buyback Quick Actions */}
                        {isSystem && rec.result === 'PENDING_SYSTEM_PAYMENT' && (
                          <div className="pt-1.5 flex items-center justify-between border-t border-slate-800 font-sans">
                            <span className="text-[10px] text-rose-400">🚨 Perlu Pembayaran Admin ke Penjual</span>
                            <button
                              type="button"
                              onClick={() => handleOpenBuybackPaymentForm(rec)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase transition cursor-pointer flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Bayar & Upload Bukti TRX (${priceUsdt} USDT)</span>
                            </button>
                          </div>
                        )}

                        {isSystem && rec.result === 'PAID_AWAITING_BURN' && (
                          <div className="pt-1.5 flex items-center justify-between border-t border-slate-800 font-sans">
                            <span className="text-[10px] text-amber-300">🔥 Lunas - Siap di-BURN Admin</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenBuybackPaymentForm(rec)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] border border-slate-700 cursor-pointer"
                              >
                                Edit Bukti
                              </button>
                              <button
                                type="button"
                                onClick={() => executeAdminBurnForBuyback(rec.id)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] uppercase transition cursor-pointer"
                              >
                                🔥 Eksekusi Burn
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 4. TAB CONTENT: SCHEDULE & BIDDING RULES */}
      {adminTab === 'SCHEDULE_BIDDING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase">
                <Clock className="w-4 h-4" />
                <span>Pengaturan Jam Fix Booking Tiket</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                Mode Jam: Real-Time Server
              </span>
            </div>

            <form onSubmit={handleSaveSchedules} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block pb-1">Mulai Jam Pesan Tiket (Booking Window Start)</label>
                  <input
                    type="text"
                    value={bookingStart}
                    onChange={(e) => setBookingStart(e.target.value)}
                    placeholder="e.g. 10:00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block pb-1">Selesai Jam Pesan Tiket (Booking Window End)</label>
                  <input
                    type="text"
                    value={bookingEnd}
                    onChange={(e) => setBookingEnd(e.target.value)}
                    placeholder="e.g. 12:00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                💡 <strong>Catatan:</strong> Jam Jual Beli / Perebutan (Grab Session Start & End) serta Ratio Perbandingan Bidding kini dikelola secara individual/spesifik pada masing-masing aset di menu <strong>Pengelolaan Aset & Penyesuaian Stok Pasar</strong>.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-600/20"
              >
                Simpan Perubahan Jam Booking Tiket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: USERS & SANCTIONS */}
      {adminTab === 'USERS_BAN' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Pengelolaan Pengguna & Status Sanksi ({users.length})</span>
            </h3>
            <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
              3 Parameter Lock Active
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar scrollbar-none">
            {users.map((usr) => {
              const userIp = usr.banDetails?.ipAddress || usr.ipAddress || '180.252.31.99';
              const userDev = usr.banDetails?.deviceId || usr.deviceId || `DEV-HW-${usr.id.toUpperCase()}`;

              return (
                <div
                  key={usr.id}
                  className={`p-3 rounded-2xl border text-xs space-y-2 transition ${
                    usr.isBanned
                      ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-950/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{usr.name}</span>
                        {usr.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[9px] font-black border border-cyan-500/40">
                            SUPER ADMIN
                          </span>
                        )}
                        {usr.isBanned && (
                          <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[9px] font-black border border-red-500/50 uppercase animate-pulse">
                            🚫 BANNED PERMANEN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Saldo: <strong className="text-emerald-400">${usr.usdtBalance.toFixed(2)} USDT</strong> • Tiket: <strong className="text-amber-300">{usr.ticketBalance}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForHistory(usr);
                          setUserHistoryTab('ALL');
                          setUserHistorySearch('');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 transition flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Lihat Semua Riwayat Transaksi Member"
                      >
                        <History className="w-3 h-3 text-cyan-400" />
                        <span>History Transaksi</span>
                      </button>

                      {usr.isBanned ? (
                        <button
                          onClick={() => unbanUser(usr.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black uppercase transition flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                        >
                          <ShieldCheck className="w-3 h-3 text-slate-950" />
                          <span>Buka Blokir (Unban)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerSanctionAutoBan(usr.id, 'Sanksi Manual Admin')}
                          className="px-2.5 py-1 rounded-xl bg-red-900 hover:bg-red-800 text-white text-[10px] font-black uppercase transition flex items-center gap-1 border border-red-500/50 shadow-sm shadow-red-900/50"
                        >
                          <ShieldAlert className="w-3 h-3 text-red-300" />
                          <span>Hard Ban</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Parameter Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[9px] font-mono pt-1 border-t border-slate-800/80">
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate text-slate-300" title={usr.phone}>{usr.phone}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate text-slate-300" title={userIp}>{userIp}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-fuchsia-400 shrink-0" />
                      <span className="truncate text-slate-300" title={userDev}>{userDev}</span>
                    </div>
                  </div>

                  {usr.isBanned && usr.banReason && (
                    <div className="text-[10px] text-red-300 bg-red-950/40 p-1.5 rounded-lg border border-red-500/30 font-mono">
                      <strong>Alasan Ban:</strong> {usr.banReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEMBER ACTIVATION PANEL */}
      {adminTab === 'MEMBER_ACTIVATION' && (
        <div className="space-y-4 font-mono">
          {/* 1. Dynamic Verification Deposit Threshold Config */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Pengaturan Syarat Deposit Verifikasi Member</h3>
                  <p className="text-[10px] text-slate-400">
                    Syarat deposit verifikasi dapat diubah ulang kapanpun oleh Admin (Default: $5 USDT).
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Syarat Saat Ini: ${schedules.minVerificationDepositUsdt ?? 5} USDT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-8 space-y-2">
                <label className="text-xs text-slate-300 font-bold block">
                  Atur Ulang Minimal Deposit Verifikasi (USDT):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMinDepositInput(preset)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition ${
                        minDepositInput === preset
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      value={minDepositInput}
                      onChange={(e) => setMinDepositInput(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-3 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
                      placeholder="Nominal custom..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                      USDT
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={() => updateVerificationThreshold(minDepositInput)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simpan Syarat Baru (${minDepositInput} USDT)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Member Activation & Verification Filter Panel */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Panel Aktivasi & Filter Status Verification Member ({users.length})
                </h3>
              </div>

              {/* Status Summary Counter */}
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  ✓ Verified: {users.filter((u) => u.isDepositDone).length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
                  🔒 Belum Verified: {users.filter((u) => !u.isDepositDone).length}
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setMemberFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    memberFilter === 'ALL'
                      ? 'bg-slate-800 border-slate-600 text-slate-100 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua ({users.length})
                </button>
                <button
                  onClick={() => setMemberFilter('VERIFIED')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    memberFilter === 'VERIFIED'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✓ Verified ({users.filter((u) => u.isDepositDone).length})
                </button>
                <button
                  onClick={() => setMemberFilter('UNVERIFIED')}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    memberFilter === 'UNVERIFIED'
                      ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔒 Belum Verify ({users.filter((u) => !u.isDepositDone).length})
                </button>
              </div>

              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Cari nama member, HP / WA..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* User Activation Cards */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto no-scrollbar scrollbar-none">
              {users
                .filter((usr) => {
                  const matchesFilter =
                    memberFilter === 'ALL' ||
                    (memberFilter === 'VERIFIED' && usr.isDepositDone) ||
                    (memberFilter === 'UNVERIFIED' && !usr.isDepositDone);
                  const matchesSearch =
                    usr.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    usr.phone.includes(memberSearch) ||
                    usr.id.toLowerCase().includes(memberSearch.toLowerCase());
                  return matchesFilter && matchesSearch;
                })
                .map((usr) => {
                  const isVerified = usr.isDepositDone;
                  const waDigits = usr.phone.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${waDigits}`;

                  // Find pending deposit mutations for this user
                  const userPendingDeposits = mutations.filter(
                    (m) => m.userId === usr.id && m.status === 'PENDING'
                  );

                  return (
                    <div
                      key={usr.id}
                      className={`p-3.5 rounded-xl border text-xs transition space-y-3 ${
                        isVerified
                          ? 'bg-slate-950/90 border-emerald-500/40 hover:border-emerald-500/70'
                          : 'bg-slate-950/90 border-amber-500/40 hover:border-amber-500/70 shadow-lg shadow-amber-950/20'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={usr.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${usr.id}`}
                              alt={usr.name}
                              className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                            />
                            {isVerified ? (
                              <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950"
                                title="Terverifikasi (Deposit Done & Aktif)"
                              >
                                <CheckCircle2 className="w-3 h-3 text-slate-950" />
                              </div>
                            ) : (
                              <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950"
                                title="Belum Verifikasi (Terkunci)"
                              >
                                <Lock className="w-2.5 h-2.5 text-slate-950" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                              <span>{usr.name}</span>
                              {usr.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[9px] font-black border border-cyan-500/40">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                              <span className="text-slate-400">WA: {usr.phone}</span>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1 transition"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-400" />
                                <span>Chat WA Aktif</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Action Toggle */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForHistory(usr);
                              setUserHistoryTab('ALL');
                              setUserHistorySearch('');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-[10px] border border-cyan-500/40 transition flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Lihat Semua Riwayat Transaksi Member"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                            <span>History Transaksi</span>
                          </button>

                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase flex items-center gap-1 ${
                              isVerified
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                AKUN AKTIF
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                BELUM VERIFIKASI (BELI TIKET)
                              </>
                            )}
                          </span>

                          <button
                            onClick={() => setUserVerificationStatus(usr.id, !isVerified)}
                            className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition flex items-center gap-1.5 shadow-md ${
                              isVerified
                                ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/30'
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                Nonaktifkan Akun
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                Setujui & Aktifkan
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Pending Deposit Alert & Quick Approval for Admin */}
                      {userPendingDeposits.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2">
                          <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                            <span>⚠️ Pengguna ini memiliki {userPendingDeposits.length} Deposit Pending menunggu konfirmasi Admin:</span>
                          </div>

                          {userPendingDeposits.map((dep) => (
                            <div
                              key={dep.id}
                              className="p-2 rounded-lg bg-slate-950 border border-amber-500/30 flex items-center justify-between text-[11px] font-mono"
                            >
                              <div>
                                <span className="text-emerald-400 font-bold">${dep.amountUsdt} USDT</span>
                                <span className="text-slate-400 ml-1.5">(Rp {(dep.amountIdr || dep.amountUsdt * 16200).toLocaleString('id-ID')})</span>
                                <div className="text-[9px] text-slate-400">{dep.description}</div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => approveDepositMutation(dep.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase transition"
                                >
                                  ✅ Konfirmasi Pembayaran Masuk
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectDepositMutation(dep.id, 'Pembayaran belum masuk di rekening Admin.')}
                                  className="px-2 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-[10px]"
                                >
                                  Tolak
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Additional User Financial & Account Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-slate-900 rounded-lg text-[10px] font-mono border border-slate-800">
                        <div>
                          <span className="text-slate-400">Saldo USDT:</span>
                          <div className="font-bold text-emerald-400">${usr.usdtBalance.toFixed(2)} USDT</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Akun Telegram:</span>
                          <div className="font-bold text-sky-300">{usr.phone}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Rekening User:</span>
                          <div className="font-bold text-slate-200">
                            {usr.bankAccount
                              ? `${usr.bankAccount.bankName} - ${usr.bankAccount.accountNumber}`
                              : 'Belum Diisi'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: EXCHANGE & USER PAYMENT APPROVALS */}
      {adminTab === 'EXCHANGE_APPROVALS' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Pengiriman Pembayaran & Persetujuan Exchange
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ubah status exchange ke <strong>PROSES</strong> agar user tidak dapat membatalkan transaksi, lalu selesaikan pembayaran.
                </p>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setExchangeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  exchangeFilter === 'ALL'
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({exchangeRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setExchangeFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ${
                  exchangeFilter === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Pending</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                  {exchangeRequests.filter((r) => r.status === 'PENDING').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setExchangeFilter('PROCESSING')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ${
                  exchangeFilter === 'PROCESSING'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Proses</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 text-[9px] font-black">
                  {exchangeRequests.filter((r) => r.status === 'PROCESSING').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setExchangeFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  exchangeFilter === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sukses ({exchangeRequests.filter((r) => r.status === 'COMPLETED').length})
              </button>
              <button
                type="button"
                onClick={() => setExchangeFilter('REJECTED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  exchangeFilter === 'REJECTED'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ditolak ({exchangeRequests.filter((r) => r.status === 'REJECTED' || r.status === 'CANCELLED').length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {exchangeRequests.filter((r) => {
              if (exchangeFilter === 'PENDING') return r.status === 'PENDING';
              if (exchangeFilter === 'PROCESSING') return r.status === 'PROCESSING';
              if (exchangeFilter === 'COMPLETED') return r.status === 'COMPLETED';
              if (exchangeFilter === 'REJECTED') return r.status === 'REJECTED' || r.status === 'CANCELLED';
              return true;
            }).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800 font-mono">
                ✓ Tidak ada permintaan exchange dengan status ini.
              </div>
            ) : (
              exchangeRequests
                .filter((r) => {
                  if (exchangeFilter === 'PENDING') return r.status === 'PENDING';
                  if (exchangeFilter === 'PROCESSING') return r.status === 'PROCESSING';
                  if (exchangeFilter === 'COMPLETED') return r.status === 'COMPLETED';
                  if (exchangeFilter === 'REJECTED') return r.status === 'REJECTED' || r.status === 'CANCELLED';
                  return true;
                })
                .map((req) => {
                  const isExpandingProof = activeReqProofId === req.id;
                  const defaultRefCode = `REF_ADMIN_TRANS_${Math.floor(100000 + Math.random() * 900000)}`;

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-xl bg-slate-950 border transition space-y-3 text-xs font-mono ${
                        req.status === 'COMPLETED'
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : req.status === 'PROCESSING'
                          ? 'border-cyan-500/50 bg-cyan-950/20'
                          : req.status === 'REJECTED' || req.status === 'CANCELLED'
                          ? 'border-red-500/30 bg-red-950/10'
                          : 'border-amber-500/40 bg-amber-950/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-100 text-sm">{req.userName}</span>
                            <span className="text-[10px] text-slate-400">({req.userPhone})</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                req.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : req.status === 'PROCESSING'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 animate-pulse'
                                  : req.status === 'REJECTED' || req.status === 'CANCELLED'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              }`}
                            >
                              {req.status === 'COMPLETED'
                                ? '✓ SUKSES'
                                : req.status === 'PROCESSING'
                                ? '⚡ PROSES ADMIN (USER DILOCK)'
                                : req.status === 'PENDING'
                                ? '⏳ PENDING'
                                : req.status === 'REJECTED'
                                ? '✕ DITOLAK'
                                : '✕ DIBATALKAN'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>Tipe: <strong className="text-amber-300">{req.type === 'CRYPTO_TO_IDR' ? 'USDT ➔ IDR Bank' : 'IDR ➔ USDT'}</strong></span>
                            <span>• Nilai: <strong className="text-emerald-400">${req.amountUsdt} USDT (Rp {req.amountIdr.toLocaleString('id-ID')})</strong></span>
                            {req.isTicketPurchase && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 animate-pulse">
                                🎟️ PEMBELIAN {req.ticketCount || req.amountUsdt} TIKET VERIFIKASI
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {req.type === 'IDR_TO_CRYPTO' ? (
                              <span>Wallet USDT Tujuan (User): <strong className="text-fuchsia-300 font-bold">{req.targetWalletAddress || req.bankDetails || '0x...'}</strong></span>
                            ) : (
                              <span>Rekening IDR User: <strong className="text-cyan-300">{req.bankDetails || 'Bank BCA 8830129481'}</strong></span>
                            )}
                          </div>
                          {req.userPaymentProof && (
                            <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-[11px] text-cyan-200 mt-1 flex items-center gap-1.5 font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>Bukti Pembayaran / TX Hash User: <strong className="font-mono text-cyan-300">{req.userPaymentProof}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Depending on Status */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => markExchangeProcessing(req.id)}
                                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-600/30 flex items-center gap-1"
                                title="Ubah status ke PROSES agar user tidak bisa membatalkan exchange ini"
                              >
                                <RefreshCcw className="w-3.5 h-3.5 text-slate-950" />
                                <span>⚡ Proses Exchange</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  approveExchangeRequest(
                                    req.id,
                                    defaultRefCode,
                                    'Pembayaran/Transfer telah sukses dikirim oleh Admin via Bank/QRIS resmi.'
                                  );
                                }}
                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center gap-1"
                              >
                                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                                <span>1-Click Bayar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isExpandingProof) {
                                    setActiveReqProofId(null);
                                  } else {
                                    setActiveReqProofId(req.id);
                                    setProofInput(defaultRefCode);
                                    setNoteInput('Transfer pembayaran telah dikirim oleh Admin.');
                                    setProofImageInput(req.adminProofImage || '');
                                  }
                                }}
                                className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition"
                              >
                                {isExpandingProof ? 'Tutup' : 'Bukti Custom'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Masukkan alasan penolakan exchange:', 'Data pembayaran / bukti transfer tidak valid');
                                  if (reason) {
                                    rejectExchangeRequest(req.id, reason);
                                  }
                                }}
                                className="px-2.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-xs transition"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {req.status === 'PROCESSING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  approveExchangeRequest(
                                    req.id,
                                    defaultRefCode,
                                    'Pembayaran/Transfer telah sukses dikirim oleh Admin via Bank/QRIS resmi.'
                                  );
                                }}
                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                <span>✓ Konfirmasi Transfer Selesai</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isExpandingProof) {
                                    setActiveReqProofId(null);
                                  } else {
                                    setActiveReqProofId(req.id);
                                    setProofInput(defaultRefCode);
                                    setNoteInput('Transfer pembayaran telah dikirim oleh Admin.');
                                    setProofImageInput(req.adminProofImage || '');
                                  }
                                }}
                                className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition"
                              >
                                {isExpandingProof ? 'Tutup' : 'Bukti Custom'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Masukkan alasan penolakan/pembatalan exchange:', 'Dibatalkan oleh Admin');
                                  if (reason) {
                                    rejectExchangeRequest(req.id, reason);
                                  }
                                }}
                                className="px-2.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-xs transition"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {req.status === 'COMPLETED' && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                                No Ref: {req.adminProofTxHash || 'BCA_REF_TRANS_001'}
                              </span>
                              {req.adminProofImage && (
                                <a
                                  href={req.adminProofImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold"
                                >
                                  <Eye className="w-3 h-3 text-emerald-400" />
                                  <span>Lihat Bukti Foto Transfer</span>
                                </a>
                              )}
                            </div>
                          )}

                          {(req.status === 'REJECTED' || req.status === 'CANCELLED') && (
                            <span className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px]">
                              {req.adminNote || 'Transaksi dibatalkan'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Custom Proof Input Form */}
                      {isExpandingProof && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2.5 text-xs font-mono">
                          <div className="text-[11px] font-bold text-cyan-300">
                            Custom Bukti Pembayaran / Ref Transfer Admin:
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400">No. Ref / TxHash Transfer:</label>
                              <input
                                type="text"
                                value={proofInput}
                                onChange={(e) => setProofInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400">Catatan Transfer Admin:</label>
                              <input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1 border-t border-slate-800">
                            <label className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                              <Upload className="w-3 h-3 text-cyan-400" />
                              <span>Foto Bukti Transfer Admin (Upload / Paste URL Gambar):</span>
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                value={proofImageInput}
                                onChange={(e) => setProofImageInput(e.target.value)}
                                placeholder="Paste URL gambar atau upload foto di samping (https://...)"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                              />
                              <label className="px-3 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition">
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Upload Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleAdminExchangeProofFile(e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {proofImageInput && (
                              <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/40 flex items-center gap-3 mt-1">
                                <img
                                  src={proofImageInput}
                                  alt="Preview Bukti Transfer"
                                  className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                                />
                                <div className="text-[10px] space-y-1">
                                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Foto Bukti Transfer Terpasang</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setProofImageInput('')}
                                    className="text-red-400 hover:text-red-300 text-[10px] underline font-bold block"
                                  >
                                    Hapus Foto
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              approveExchangeRequest(req.id, proofInput, noteInput, proofImageInput);
                              setActiveReqProofId(null);
                              setProofImageInput('');
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition mt-1 shadow-lg shadow-emerald-600/20"
                          >
                            Kirim Pembayaran & Update Status Ke User
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: GIVEAWAY ADMIN (UNDIAN HADIAH) */}
      {adminTab === 'GIVEAWAY_ADMIN' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-fuchsia-500/40 space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-base text-fuchsia-300 uppercase tracking-wider">
                  Kelola Undian Hadiah Pengguna
                </h3>
                <p className="text-[10px] text-slate-400">
                  Tambah, ubah, atau hapus hadiah undian. Tentukan berapa jumlah pemenang yang ingin diundi secara fleksibel dan transparan.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Winner Count Configurator */}
              {(() => {
                const totalPrizeQty = giveawayPrizes.reduce((sum, p) => sum + (p.quantity || 1), 0);
                return (
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold px-1">Pemenang:</span>
                    {totalPrizeQty > 0 && (
                      <button
                        type="button"
                        onClick={() => setDrawWinnerCount(totalPrizeQty)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${
                          drawWinnerCount === totalPrizeQty
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                        }`}
                        title="Sesuaikan otomatis dengan total jumlah unit hadiah"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Sesuai List ({totalPrizeQty} Hadiah)</span>
                      </button>
                    )}
                    {[3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDrawWinnerCount(num)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                          drawWinnerCount === num
                            ? 'bg-fuchsia-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={drawWinnerCount}
                      onChange={(e) => setDrawWinnerCount(Math.max(1, Number(e.target.value)))}
                      className="w-14 bg-slate-900 border border-slate-700 rounded-lg py-1 px-1.5 text-center text-fuchsia-300 font-bold text-xs"
                    />
                  </div>
                );
              })()}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const totalPrizeQty = giveawayPrizes.reduce((sum, p) => sum + (p.quantity || 1), 0);
                    const countToDraw = drawWinnerCount || (totalPrizeQty > 0 ? totalPrizeQty : 10);
                    if (confirm(`Lakukan pengundian acak otomatis sekarang untuk menentukan ${countToDraw} pemenang undian?`)) {
                      drawGiveawayWinners(countToDraw);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>🎲 Kocok Otomatis ({drawWinnerCount} Pemenang)</span>
                </button>

                {giveawayWinners.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Reset daftar pemenang undian saat ini?')) {
                        resetGiveawayWinners();
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 font-bold text-xs transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: SHUFFLE FEATURE & SCHEDULE CONFIGURATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
            {/* Box 1: Visual Slot Machine Shuffle Feature */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-950/60 via-slate-950 to-purple-950/60 border-2 border-fuchsia-500/60 space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interactive Engine Slot</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {giveawayParticipants.length} Tiket Terdaftar
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm text-slate-100 flex items-center gap-2">
                  <span>🎰 Fitur Pengocokan Undian Live</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 font-sans">
                  Putar mesin slot pengocokan secara animasi live dengan efek suara &amp; visual ticker. Menentukan pemenang secara terbuka, interaktif, dan penuh sensasi!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsShuffleModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Buka Modal Visual Pengocokan Live ({drawWinnerCount} Pemenang)</span>
              </button>
            </div>

            {/* Box 2: Schedule Config (Jam & Tanggal Pengocokan) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-xs uppercase text-cyan-300 tracking-wider">
                    Atur Jadwal Jam Pengocokan Undian
                  </h4>
                </div>
                {giveawaySchedule?.scheduledTime ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Jadwal Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    Belum Dijadwalkan
                  </span>
                )}
              </div>

              {/* Status & Countdown Box */}
              {giveawaySchedule?.scheduledTime ? (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400">Jadwal Jam Pengocokan Resmi:</div>
                  <div className="text-cyan-300 font-bold text-xs">
                    {new Date(giveawaySchedule.scheduledTime).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </div>
                  <div className="text-[10px] text-amber-300 pt-1 border-t border-slate-800 flex items-center justify-between">
                    <span>
                      Otomatis Kocok: {giveawaySchedule.isAutoDrawEnabled ? '✅ YA (ON)' : '❌ TIDAK (OFF)'}
                    </span>
                    <span>Kuota: {giveawaySchedule.scheduledWinnerCount} Pemenang</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic font-sans">
                  Belum ada jadwal jam pengocokan aktif. Tentukan tanggal &amp; jam di bawah ini agar peserta dapat melihat hitung mundur jam undian!
                </p>
              )}

              {/* Form Input Schedule */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!schedDateInput) {
                    alert('Harap pilih tanggal dan jam pengocokan undian!');
                    return;
                  }
                  const timestamp = new Date(schedDateInput).getTime();
                  if (isNaN(timestamp)) {
                    alert('Format tanggal tidak valid');
                    return;
                  }
                  updateGiveawaySchedule({
                    scheduledTime: timestamp,
                    isAutoDrawEnabled: schedAutoDrawInput,
                    scheduledWinnerCount: schedWinnerCountInput,
                    note: schedNoteInput.trim(),
                  });
                  setSchedSavedNotify(true);
                  setTimeout(() => setSchedSavedNotify(false), 3000);
                }}
                className="space-y-2.5 text-xs"
              >
                <div>
                  <label className="text-[10px] text-slate-400 font-bold">Pilih Tanggal &amp; Jam Pengocokan:</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedDateInput}
                    onChange={(e) => setSchedDateInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-slate-400 font-bold">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(20, 0, 0, 0);
                      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
                      const tzoffset = d.getTimezoneOffset() * 60000;
                      setSchedDateInput(new Date(d.getTime() - tzoffset).toISOString().slice(0, 16));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 font-bold hover:bg-slate-800 transition"
                  >
                    🌙 Jam 20:00 WIB
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      d.setHours(12, 0, 0, 0);
                      const tzoffset = d.getTimezoneOffset() * 60000;
                      setSchedDateInput(new Date(d.getTime() - tzoffset).toISOString().slice(0, 16));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-bold hover:bg-slate-800 transition"
                  >
                    🌅 Besok Jam 12:00
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 2 * 3600 * 1000);
                      const tzoffset = d.getTimezoneOffset() * 60000;
                      setSchedDateInput(new Date(d.getTime() - tzoffset).toISOString().slice(0, 16));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 text-fuchsia-300 border border-slate-700 font-bold hover:bg-slate-800 transition"
                  >
                    ⏱️ 2 Jam Lagi
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Kuota Pemenang Dijadwalkan:</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={schedWinnerCountInput}
                      onChange={(e) => setSchedWinnerCountInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-fuchsia-300 font-bold"
                    />
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedAutoDrawInput}
                        onChange={(e) => setSchedAutoDrawInput(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                      />
                      <span>Auto-Draw saat jam tiba</span>
                    </label>
                  </div>
                </div>

                {schedSavedNotify && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold text-center">
                    ✓ Jadwal Jam Pengocokan Berhasil Disimpan &amp; Diarahkan Ke Aplikasi!
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md"
                  >
                    💾 Simpan Jadwal Jam Undian
                  </button>

                  {giveawaySchedule?.scheduledTime && (
                    <button
                      type="button"
                      onClick={() => {
                        updateGiveawaySchedule({ scheduledTime: null });
                        setSchedDateInput('');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition border border-red-500/30"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Form: Add New Prize / Split Pool Multi Winner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-fuchsia-400" />
                <span>Setting Hadiah Undian & Alokasi Pemenang</span>
              </h4>

              {/* Input Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPrizeInputMode('SPLIT_POOL')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    prizeInputMode === 'SPLIT_POOL'
                      ? 'bg-fuchsia-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Auto Split Multi-Pemenang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrizeInputMode('SINGLE')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    prizeInputMode === 'SINGLE'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>🎁 Single Item / Barang</span>
                </button>
              </div>
            </div>

            {/* MODE 1: AUTO SPLIT MULTI-PEMENANG */}
            {prizeInputMode === 'SPLIT_POOL' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!splitTotalPool || splitTotalPool <= 0 || !splitWinnerCount || splitWinnerCount <= 0) return;
                  const perWinner = Number((splitTotalPool / splitWinnerCount).toFixed(2));
                  const newPrizes = [];
                  for (let i = 1; i <= splitWinnerCount; i++) {
                    const customTitle = prizeTitle.trim()
                      ? `${prizeTitle.trim()} (Pemenang #${i})`
                      : `Saldo $${perWinner} ${splitUnit} (Pemenang #${i})`;
                    newPrizes.push({
                      title: customTitle,
                      description: `Hadiah sebesar $${perWinner} ${splitUnit} dari alokasi total pool $${splitTotalPool} ${splitUnit} untuk ${splitWinnerCount} pemenang.`,
                      category: prizeCategory,
                      badgeText: `${prizeBadge.trim() || 'PEMENANG'} #${i}`,
                      imageUrl: prizeImage.trim() || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80',
                      quantity: 1,
                    });
                  }
                  batchAddGiveawayPrizes(newPrizes);
                  setDrawWinnerCount(splitWinnerCount);
                  setPrizeTitle('');
                }}
                className="space-y-3 text-xs"
              >
                {/* Auto Calculation Preview Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/20 to-slate-900 border border-fuchsia-500/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-fuchsia-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Kalkulator Alokasi Pemenang:
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      Auto-Generate {splitWinnerCount || 0} List Item
                    </span>
                  </div>
                  <div className="text-xs text-slate-200">
                    Total Pool <strong className="text-cyan-300">${splitTotalPool} {splitUnit}</strong> dibagi ke{' '}
                    <strong className="text-amber-300">{splitWinnerCount} Orang Pemenang</strong> = Masing-masing berhak mendapatkan{' '}
                    <strong className="text-emerald-400 text-sm font-black underline">
                      ${(splitTotalPool / (splitWinnerCount || 1)).toFixed(2)} {splitUnit}
                    </strong>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-slate-400 font-bold">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitTotalPool(100);
                      setSplitWinnerCount(10);
                      setSplitUnit('USDT');
                      setPrizeCategory('USDT');
                      setPrizeBadge('PEMENANG');
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono font-bold transition"
                  >
                    🚀 $100 USDT / 10 Pemenang (@$10)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitTotalPool(500);
                      setSplitWinnerCount(10);
                      setSplitUnit('USDT');
                      setPrizeCategory('USDT');
                      setPrizeBadge('PEMENANG');
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 font-mono font-bold transition"
                  >
                    💎 $500 USDT / 10 Pemenang (@$50)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitTotalPool(100);
                      setSplitWinnerCount(10);
                      setSplitUnit('Tiket');
                      setPrizeCategory('TICKET');
                      setPrizeBadge('PEMENANG VOUCHER');
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-mono font-bold transition"
                  >
                    🎟️ 100 Tiket / 10 Pemenang (@10 Tiket)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitTotalPool(50);
                      setSplitWinnerCount(5);
                      setSplitUnit('USDT');
                      setPrizeCategory('USDT');
                      setPrizeBadge('PEMENANG');
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-fuchsia-300 border border-slate-700 font-mono font-bold transition"
                  >
                    🎁 $50 USDT / 5 Pemenang (@$10)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Total Pool Hadiah ($ / Nominal):</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={splitTotalPool}
                      onChange={(e) => setSplitTotalPool(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-cyan-300 font-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Jumlah Orang Pemenang (Kuota):</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={splitWinnerCount}
                      onChange={(e) => setSplitWinnerCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-amber-300 font-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Satuan Nominal (Unit):</label>
                    <input
                      type="text"
                      value={splitUnit}
                      onChange={(e) => setSplitUnit(e.target.value)}
                      placeholder="USDT / IDR / Tiket"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Judul Kustom (Opsional):</label>
                    <input
                      type="text"
                      value={prizeTitle}
                      onChange={(e) => setPrizeTitle(e.target.value)}
                      placeholder="Kosongkan untuk nama otomatis Saldo $10 USDT"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Badge Prefix Label:</label>
                    <input
                      type="text"
                      value={prizeBadge}
                      onChange={(e) => setPrizeBadge(e.target.value)}
                      placeholder="PEMENANG"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-amber-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Kategori Hadiah:</label>
                    <select
                      value={prizeCategory}
                      onChange={(e) => setPrizeCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-bold"
                    >
                      <option value="USDT">USDT (Saldo Crypto)</option>
                      <option value="TICKET">TICKET (Voucher Bidding Akses)</option>
                      <option value="GADGET">GADGET (Barang Elektronik)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ SUSUN {splitWinnerCount} LIST PEMENANG SEKARANG (@ ${(splitTotalPool / (splitWinnerCount || 1)).toFixed(2)} {splitUnit})</span>
                </button>
              </form>
            ) : (
              /* MODE 2: SINGLE ITEM HADIAH */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!prizeTitle.trim()) return;
                  addGiveawayPrize({
                    title: prizeTitle.trim(),
                    description: prizeDesc.trim() || 'Hadiah eksklusif event undian pengguna Axiom.',
                    category: prizeCategory,
                    badgeText: prizeBadge.trim() || 'HADIAH EKSKLUSIF',
                    imageUrl: prizeImage.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
                    quantity: prizeQty,
                  });
                  setPrizeTitle('');
                  setPrizeDesc('');
                  setPrizeBadge('PEMENANG');
                  setPrizeImage('');
                  setPrizeQty(1);
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Nama Hadiah:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 15 Pro Max 256GB / Saldo $100 USDT"
                      value={prizeTitle}
                      onChange={(e) => setPrizeTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Kategori Hadiah:</label>
                    <select
                      value={prizeCategory}
                      onChange={(e) => setPrizeCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="GADGET">GADGET (Barang Elektronik)</option>
                      <option value="USDT">USDT (Saldo Crypto)</option>
                      <option value="TICKET">TICKET (Voucher Bidding Akses)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Badge Label (e.g. JUARA 1):</label>
                    <input
                      type="text"
                      value={prizeBadge}
                      onChange={(e) => setPrizeBadge(e.target.value)}
                      placeholder="JUARA 1 - GRAND PRIZE"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-amber-300 font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 font-bold">URL / Foto Gambar Hadiah:</label>
                      <label className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline flex items-center gap-1">
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setPrizeImage(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={prizeImage}
                      onChange={(e) => setPrizeImage(e.target.value)}
                      placeholder="Paste URL foto atau upload di atas (https://...)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
                    />
                    {/* Sample Presets for Goods */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className="text-[9px] text-slate-500 font-bold">Contoh Foto:</span>
                      <button
                        type="button"
                        onClick={() => setPrizeImage('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      >
                        📱 Smartphone
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrizeImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      >
                        ⌚ Smartwatch
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrizeImage('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      >
                        💻 Laptop
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold">Jumlah / Stok Hadiah:</label>
                    <input
                      type="number"
                      min={1}
                      value={prizeQty}
                      onChange={(e) => setPrizeQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-cyan-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold">Deskripsi Hadiah:</label>
                  <input
                    type="text"
                    value={prizeDesc}
                    onChange={(e) => setPrizeDesc(e.target.value)}
                    placeholder="Keterangan singkat tentang spesifikasi hadiah..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-600/20"
                >
                  + Tambahkan Hadiah Ke Daftar Undian
                </button>
              </form>
            )}
          </div>

          {/* List of Existing Prizes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>Daftar Hadiah Undian Aktif ({giveawayPrizes.length} List Item)</span>
                {giveawayPrizes.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">
                    Siap Diundi Untuk {giveawayPrizes.length} Pemenang
                  </span>
                )}
              </h4>

              {giveawayPrizes.length > 0 && (
                <div className="flex items-center gap-2">
                  {confirmClearPrizes ? (
                    <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 p-1 rounded-xl text-[10px]">
                      <span className="text-red-300 font-bold px-1.5">Kosongkan {giveawayPrizes.length} Item?</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearGiveawayPrizes();
                          setConfirmClearPrizes(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black transition shadow-sm"
                      >
                        Ya, Hapus Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearPrizes(false)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold transition"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearPrizes(true)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-xl border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan Semua List</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {giveawayPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PrizeLogo
                      title={prize.title}
                      category={prize.category}
                      imageUrl={prize.imageUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-100 text-xs truncate">{prize.title}</div>
                      <div className="text-[10px] text-amber-300 font-mono font-bold">{prize.badgeText}</div>
                      <div className="text-[10px] text-slate-400">
                        Stok: <strong className="text-cyan-300">{prize.quantity} unit</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGiveawayPrize(prize.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition shrink-0"
                    title="Hapus List Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Display Current Drawn Winners & Delivery Proof Management */}
          {giveawayWinners.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>Hasil Pemenang Undian Resmi ({giveawayWinners.length} Orang)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Admin dapat memasukkan TRX Hash &amp; Upload Bukti Foto Transfer untuk membuktikan hadiah telah dikirim.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 self-start sm:self-auto">
                  Diumumkan Ke Aplikasi
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {giveawayWinners.map((winner, idx) => {
                  const isEditing = editingWinnerId === winner.id;
                  const isSent = winner.deliveryStatus === 'SENT';

                  return (
                    <div
                      key={winner.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/40 shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                              <span>{winner.userName}</span>
                              <span className="text-cyan-300 font-mono text-[10px]">({winner.luckyNumber})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{winner.userPhone}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-emerald-300 text-xs">{winner.prizeTitle}</div>
                            <div className="text-[9px] text-amber-300 font-mono font-bold">{winner.prizeBadge}</div>
                          </div>

                          <div>
                            {isSent ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                ✓ DIKIRIM
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                ⏳ PENDING
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display current proof if sent */}
                      {!isEditing && isSent && winner.proofTxHash && (
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-400 font-bold">Bukti TRX Hash:</div>
                            <div className="font-mono text-cyan-300 truncate">{winner.proofTxHash}</div>
                            {winner.adminNote && (
                              <div className="text-[10px] text-slate-400 mt-0.5">{winner.adminNote}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {winner.proofImageUrl && (
                              <a
                                href={winner.proofImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded bg-slate-800 text-cyan-300 hover:text-cyan-200 text-[10px] font-bold flex items-center gap-1 border border-slate-700"
                              >
                                <ImageIcon className="w-3 h-3 text-cyan-400" />
                                <span>Lihat Foto</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWinnerId(winner.id);
                                setProofTxHashInput(winner.proofTxHash || '');
                                setProofImageUrlInput(winner.proofImageUrl || '');
                                setProofAdminNoteInput(winner.adminNote || '');
                              }}
                              className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold border border-amber-500/30"
                            >
                              Edit Bukti
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Button to open edit form if not sent */}
                      {!isEditing && !isSent && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingWinnerId(winner.id);
                              setProofTxHashInput('0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
                              setProofImageUrlInput('https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80');
                              setProofAdminNoteInput('Hadiah telah dikirimkan secara resmi.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider transition flex items-center gap-1 shadow-md"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>+ Input Bukti TRX Hash &amp; Foto Delivery</span>
                          </button>
                        </div>
                      )}

                      {/* Edit Form */}
                      {isEditing && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2.5 text-xs">
                          <div className="font-bold text-cyan-300 text-[11px] flex items-center justify-between">
                            <span>Form Pengiriman Hadiah Ke Pemenang #{idx + 1} ({winner.userName})</span>
                            <button
                              type="button"
                              onClick={() => setEditingWinnerId(null)}
                              className="text-slate-400 hover:text-slate-200 text-[10px]"
                            >
                              Batal ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold">TRX Hash / ID Transaksi:</label>
                              <input
                                type="text"
                                required
                                value={proofTxHashInput}
                                onChange={(e) => setProofTxHashInput(e.target.value)}
                                placeholder="e.g. 0x7a8f9b3c2d1e4f5a..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-bold">URL Foto Bukti Transfer:</label>
                              <input
                                type="text"
                                value={proofImageUrlInput}
                                onChange={(e) => setProofImageUrlInput(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 font-bold">Catatan Admin (Opsional):</label>
                            <input
                              type="text"
                              value={proofAdminNoteInput}
                              onChange={(e) => setProofAdminNoteInput(e.target.value)}
                              placeholder="e.g. Transfer saldo USDT sukses / Nomor Resi Pengiriman JNE"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingWinnerId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px]"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!proofTxHashInput.trim()) return;
                                updateGiveawayWinnerDelivery(winner.id, {
                                  proofTxHash: proofTxHashInput.trim(),
                                  proofImageUrl: proofImageUrlInput.trim(),
                                  adminNote: proofAdminNoteInput.trim(),
                                });
                                setEditingWinnerId(null);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white font-black text-[10px] uppercase tracking-wider transition shadow-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>💾 Simpan &amp; Kirim Bukti TRX ke App</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT: ANNOUNCEMENTS */}
      {adminTab === 'ANNOUNCEMENTS' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Buat Pengumuman Baru Ke Aplikasi
          </h3>

          <form onSubmit={handlePostAnnouncement} className="space-y-2 text-xs">
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Judul Pengumuman (e.g. Pemeliharaan Sistem / Promo)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              rows={3}
              required
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Isi Pengumuman..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase transition"
            >
              Terbitkan Pengumuman
            </button>
          </form>
        </div>
      )}

      {/* 8. TAB CONTENT: PAYMENT CONFIG (REKENING & QRIS EDIT) */}
      {adminTab === 'PAYMENT_CONFIG' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-fuchsia-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Pengaturan Rekening Bank & QRIS Top Up User
                </h3>
                <p className="text-[10px] text-slate-400">
                  Kelola nomor rekening resmi dan QRIS barcode yang tampil pada menu top up pengguna.
                </p>
              </div>
            </div>

            {paymentSavedNotify && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-pulse">
                ✓ Pengaturan Tersimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePaymentConfig} className="space-y-4 text-xs font-mono">
            {/* Section A: Rekening Bank Details */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>1. Edit Data Rekening Bank Resmi Admin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Nama Bank / E-Wallet:</label>
                  <input
                    type="text"
                    required
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    placeholder="e.g. Bank BCA / Mandiri / BRI"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Nomor Rekening Bank:</label>
                  <input
                    type="text"
                    required
                    value={accountNumberInput}
                    onChange={(e) => setAccountNumberInput(e.target.value)}
                    placeholder="e.g. 8830129481"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Atas Nama Rekening (A/N):</label>
                  <input
                    type="text"
                    required
                    value={accountHolderInput}
                    onChange={(e) => setAccountHolderInput(e.target.value)}
                    placeholder="e.g. PT AXIOM DIGITAL VAULT"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Wallet USDT TRC20 Admin:</label>
                  <input
                    type="text"
                    required
                    value={adminUsdtTrc20AddressInput}
                    onChange={(e) => setAdminUsdtTrc20AddressInput(e.target.value)}
                    placeholder="e.g. TY3v7x89K2m9pL1aN4sQ8wZ5eX7rT6uV9w"
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-emerald-300 font-bold focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Section B: QRIS Code Config */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-xs uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-fuchsia-400" />
                <span>2. Edit Barcode QRIS Top Up User</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  {/* DRAG AND DROP QRIS IMAGE FILE UPLOADER */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">
                      Unggah / Drag & Drop File Barcode QRIS:
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAdmin(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingAdmin(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAdmin(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleAdminQrisImageFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`relative p-3 rounded-xl border-2 border-dashed transition text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isDraggingAdmin
                          ? 'border-fuchsia-400 bg-fuchsia-500/20 scale-[1.02]'
                          : 'border-slate-700 bg-slate-900 hover:border-fuchsia-500/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAdminQrisImageFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                      <div className="text-[11px] font-bold text-slate-200">
                        Tarik & Lepas File Gambar QRIS di Sini
                      </div>
                      <div className="text-[9px] text-slate-400">
                        atau <span className="text-cyan-400 underline font-bold">Klik untuk Pilih Gambar</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">URL Gambar QRIS (Manual):</label>
                    <input
                      type="text"
                      required
                      value={qrisImageUrlInput}
                      onChange={(e) => setQrisImageUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">NMID QRIS (Nomor Merchant ID):</label>
                    <input
                      type="text"
                      required
                      value={qrisNmidInput}
                      onChange={(e) => setQrisNmidInput(e.target.value)}
                      placeholder="e.g. ID1020394820192"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-fuchsia-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Nama Merchant / Toko QRIS:</label>
                    <input
                      type="text"
                      required
                      value={qrisMerchantNameInput}
                      onChange={(e) => setQrisMerchantNameInput(e.target.value)}
                      placeholder="e.g. AXIOM DIGITAL TOP UP"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                {/* QRIS Live Preview Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-fuchsia-500/30 text-center space-y-2 flex flex-col justify-center items-center">
                  <div className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider">
                    Live Preview Barcode QRIS di Menu User:
                  </div>
                  {qrisImageUrlInput ? (
                    <img
                      src={qrisImageUrlInput}
                      alt="Preview QRIS Admin"
                      className="w-36 h-36 object-contain rounded-xl border border-fuchsia-400 p-2 bg-white shadow-md mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[10px]">
                      No Image URL
                    </div>
                  )}
                  <div className="text-[11px] font-bold text-slate-200">
                    {qrisMerchantNameInput || 'NAMA MERCHANT QRIS'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    NMID: {qrisNmidInput || 'ID10000000000'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  Catatan / Instruksi Pembayaran Top Up User:
                </label>
                <textarea
                  rows={2}
                  value={instructionsInput}
                  onChange={(e) => setInstructionsInput(e.target.value)}
                  placeholder="Petunjuk khusus untuk pengguna saat melakukan pembayaran QRIS..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>Simpan & Terapkan Ke Menu Top Up User</span>
            </button>
          </form>
        </div>
      )}

      {/* 9. TAB CONTENT: SUPPORT TICKETS & HELPDESK ADMIN */}
      {adminTab === 'SUPPORT_TICKETS' && (
        <div className="space-y-4">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tiket Pengaduan</div>
              <div className="text-xl font-black text-slate-100 font-mono">{supportTickets.length}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
              <div className="text-[10px] text-amber-300 font-bold uppercase">Menunggu Peninjauan</div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {supportTickets.filter((t) => t.status === 'OPEN').length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <div className="text-[10px] text-emerald-300 font-bold uppercase">Tiket Selesai</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {supportTickets.filter((t) => t.status === 'RESOLVED').length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-1">
              <div className="text-[10px] text-red-300 font-bold uppercase">Laporan Kecurangan User</div>
              <div className="text-xl font-black text-red-400 font-mono">
                {supportTickets.filter((t) => t.category === 'LAPOR_KECURANGAN').length}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Cari ID tiket, nama user, subjek, deskripsi..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ticketCategoryFilter}
                onChange={(e) => setTicketCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="LAPOR_KECURANGAN">🛡️ Lapor Kecurangan</option>
                <option value="BUG_SYSTEM">🐛 Bug Sistem</option>
                <option value="KENDALA_EXCHANGE">💱 Kendala Exchange</option>
                <option value="KENDALA_TOPUP">🎟️ Top Up & Tiket</option>
                <option value="MASALAH_LAIN">❓ Masalah Lainnya</option>
              </select>

              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPEN">⏳ Menunggu (OPEN)</option>
                <option value="IN_PROGRESS">⚙️ Diproses (IN PROGRESS)</option>
                <option value="RESOLVED">✅ Selesai (RESOLVED)</option>
                <option value="REJECTED">✕ Ditolak (REJECTED)</option>
              </select>
            </div>
          </div>

          {/* List of Support Tickets */}
          <div className="space-y-3">
            {supportTickets
              .filter((t) => {
                if (ticketStatusFilter !== 'ALL' && t.status !== ticketStatusFilter) return false;
                if (ticketCategoryFilter !== 'ALL' && t.category !== ticketCategoryFilter) return false;
                if (ticketSearch.trim()) {
                  const q = ticketSearch.toLowerCase();
                  return (
                    t.id.toLowerCase().includes(q) ||
                    t.userName.toLowerCase().includes(q) ||
                    t.userPhone.toLowerCase().includes(q) ||
                    t.subject.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    (t.reportedUser && t.reportedUser.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .map((ticket) => {
                const currentReplyText = ticketReplies[ticket.id] !== undefined ? ticketReplies[ticket.id] : (ticket.adminReply || '');

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-2xl border transition space-y-3 shadow-lg ${
                      ticket.category === 'LAPOR_KECURANGAN'
                        ? 'bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/20 border-red-500/40'
                        : ticket.status === 'OPEN'
                        ? 'bg-slate-900 border-amber-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-400">#{ticket.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {ticket.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ticket.priority === 'URGENT'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                              : ticket.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          PRIORITAS: {ticket.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ticket.createdAt).toLocaleString('id-ID')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ticket.status === 'OPEN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : ticket.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Reporter Info */}
                    <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        <div>
                          <span className="font-bold text-slate-100">{ticket.userName}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({ticket.userPhone})</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">User ID: {ticket.userId}</span>
                    </div>

                    {/* Reported User Alert Block */}
                    {ticket.reportedUser && (
                      <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                          <div>
                            <span className="font-bold text-red-300">USER DILAPORKAN CURANG: </span>
                            <span className="font-mono underline text-red-200">{ticket.reportedUser}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const targetUser = users.find(
                              (u) =>
                                u.name.toLowerCase().includes(ticket.reportedUser!.toLowerCase()) ||
                                u.phone.includes(ticket.reportedUser!)
                            );
                            if (targetUser) {
                              triggerSanctionAutoBan(
                                targetUser.id,
                                `Terindikasi kecurangan berdasar tiket #${ticket.id} (${ticket.subject})`
                              );
                              alert(`Pengguna ${targetUser.name} (${targetUser.phone}) telah berhasil dibanned permanen!`);
                            } else {
                              alert(`Pengguna "${ticket.reportedUser}" tidak ditemukan di database otomatis, silakan periksa di tab User & Sanksi.`);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase shadow-md transition flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Eksekusi Banned User</span>
                        </button>
                      </div>
                    )}

                    {/* Subject & Description */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-slate-100">{ticket.subject}</h4>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                        {ticket.description}
                      </p>
                    </div>

                    {ticket.attachmentUrl && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lampiran Bukti:</span>
                        <a
                          href={ticket.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline font-mono truncate"
                        >
                          {ticket.attachmentUrl}
                        </a>
                      </div>
                    )}

                    {/* Admin Response Controls */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                          <span>Tanggapan Resmi Admin Axiom:</span>
                        </span>
                        {ticket.adminReply && (
                          <span className="text-[10px] text-emerald-400 font-mono">✓ Sudah Direspon</span>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        value={currentReplyText}
                        onChange={(e) =>
                          setTicketReplies((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                        }
                        placeholder="Tuliskan jawaban atau solusi resmi admin yang akan dibaca oleh user..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateTicketStatus(
                                ticket.id,
                                'IN_PROGRESS',
                                currentReplyText.trim() || undefined
                              );
                              alert(`Tiket #${ticket.id} diperbarui menjadi IN_PROGRESS.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <RefreshCcw className="w-3 h-3" />
                            <span>Set Diproses</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateTicketStatus(
                                ticket.id,
                                'RESOLVED',
                                currentReplyText.trim() || 'Masalah telah diselesaikan oleh Admin.'
                              );
                              alert(`Tiket #${ticket.id} berhasil diselesaikan!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Tandai Selesai</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateTicketStatus(
                                ticket.id,
                                'REJECTED',
                                currentReplyText.trim() || 'Laporan tidak dapat ditindaklanjuti.'
                              );
                              alert(`Tiket #${ticket.id} ditolak.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Tolak Laporan</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {adminTab === 'AI_AGENT' && <AdminAgentView />}

      {/* MODAL: Add New Digital Asset */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-fuchsia-500/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4 font-mono text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-fuchsia-300">Tambah Aset Digital Baru</h3>
              <button
                onClick={() => setIsAddAssetOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Pilih Tema Aset Digital:</label>
                <select
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value as AssetTheme)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="CYBERPUNK">CYBERPUNK</option>
                  <option value="SYNTHWAVE">SYNTHWAVE</option>
                  <option value="QUANTUM">QUANTUM</option>
                  <option value="BIOTECH">BIOTECH</option>
                  <option value="NEON_MATRIX">NEON_MATRIX</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center pb-1">
                  <label className="text-[10px] text-slate-400">Nama Aset Digital:</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandom}
                    className="text-cyan-400 hover:underline text-[10px] font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Acak Nama Tema
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={assetNameInput}
                  onChange={(e) => setAssetNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Harga Awal / Start ($ USDT)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={priceInput}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceInput(val);
                      setMinPriceInput(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Harga Minimum ($ USDT)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Harga Maksimum ($ USDT)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Auto 15x Cycle"
                    value={maxPriceInput || ''}
                    onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Kontrak (Hari)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={contractDaysInput}
                    onChange={(e) => setContractDaysInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Profit (% / Hari)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={profitPercentInput}
                    onChange={(e) => setProfitPercentInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Stok Awal (Unit)</label>
                  <input
                    type="number"
                    min={0}
                    value={initialStockInput}
                    onChange={(e) => setInitialStockInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Max Grabbers</label>
                  <input
                    type="number"
                    min={1}
                    value={maxGrabbersInput}
                    onChange={(e) => setMaxGrabbersInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold"
                  />
                </div>
              </div>

              {/* 15-Cycle Price & Stock Split Simulation Table */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Simulasi Tabel 15x Perputaran & Split Stok Auto-Repo</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Crypto USDT (Round 0.01)</span>
                </div>
                <CycleSimulationTable
                  startPrice={priceInput}
                  profitPercent={profitPercentInput}
                  minPrice={minPriceInput}
                  maxPrice={maxPriceInput}
                />
              </div>

              {/* Custom Schedule Toggle & Inputs */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-bold">
                  <input
                    type="checkbox"
                    checked={isCustomScheduleActive}
                    onChange={(e) => setIsCustomScheduleActive(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Atur Jam Pesan & Jual Beli Kustom (Berbeda)</span>
                </label>

                {isCustomScheduleActive && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400">Jam Mulai Pesan:</label>
                        <input
                          type="time"
                          value={customBookingStart}
                          onChange={(e) => setCustomBookingStart(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400">Jam Selesai Pesan:</label>
                        <input
                          type="time"
                          value={customBookingEnd}
                          onChange={(e) => setCustomBookingEnd(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400">Jam Mulai Jual Beli:</label>
                        <input
                          type="time"
                          value={customTradingStart}
                          onChange={(e) => setCustomTradingStart(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-fuchsia-300"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400">Jam Selesai Jual Beli:</label>
                        <input
                          type="time"
                          value={customTradingEnd}
                          onChange={(e) => setCustomTradingEnd(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-fuchsia-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-600/20 hover:brightness-110 transition"
              >
                Terbitkan Aset Ke Pasar Sekunder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Existing Asset Custom Schedule */}
      {editingAssetScheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 font-mono text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Atur Jam Custom Aset Digital</span>
              </h3>
              <button
                onClick={() => setEditingAssetScheduleId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssetSchedule} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-300">Jam Pesan Tiket (Booking Slot)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400">Jam Mulai:</label>
                    <input
                      type="time"
                      value={editBookStart}
                      onChange={(e) => setEditBookStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Jam Selesai:</label>
                    <input
                      type="time"
                      value={editBookEnd}
                      onChange={(e) => setEditBookEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300 font-bold"
                    />
                  </div>
                </div>

                <div className="font-bold text-fuchsia-300 pt-2">Jam Jual Beli (Grab Session)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400">Jam Mulai:</label>
                    <input
                      type="time"
                      value={editTradeStart}
                      onChange={(e) => setEditTradeStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-fuchsia-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Jam Selesai:</label>
                    <input
                      type="time"
                      value={editTradeEnd}
                      onChange={(e) => setEditTradeEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-fuchsia-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateAssetSchedule(editingAssetScheduleId, undefined);
                    setEditingAssetScheduleId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Gunakan Jam Global
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Simpan Jam Custom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Asset Details */}
      {editingAssetDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4 font-mono text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Spesifikasi Aset: {editingAssetDetails.name}</span>
              </h3>
              <button
                onClick={() => setEditingAssetDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssetDetails} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Harga Sekarang ($ USDT)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Harga Min ($ USDT)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={editMinPrice}
                    onChange={(e) => setEditMinPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Harga Max ($ USDT)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Auto 15x"
                    value={editMaxPrice || ''}
                    onChange={(e) => setEditMaxPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Kontrak (Hari)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editDays}
                    onChange={(e) => setEditDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Profit Harian (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={editProfit}
                    onChange={(e) => setEditProfit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Max Grabbers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editGrabbers}
                    onChange={(e) => setEditGrabbers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold"
                  />
                </div>
              </div>

              {/* Max Price Action Selection */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="text-[11px] text-amber-300 font-bold block flex items-center justify-between">
                  <span>⚙️ Opsi Tindakan Saat Aset Mencapai Harga Maksimum (Max Price):</span>
                  <span className="text-[9px] text-cyan-400 font-mono">Auto Deficit Engine v2.0</span>
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditMaxPriceAction('AUTO_SMART_ROUTE')}
                    className={`p-2 rounded-lg border text-left text-[10px] font-bold transition ${
                      editMaxPriceAction === 'AUTO_SMART_ROUTE'
                        ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-cyan-300">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>🤖 Smart Auto</span>
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-normal mt-0.5 leading-tight">
                      Otomatis pilih split/naik tier berdasarkan defisit stok terkini.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMaxPriceAction('SPLIT_SAME_TIER')}
                    className={`p-2 rounded-lg border text-left text-[10px] font-bold transition ${
                      editMaxPriceAction === 'SPLIT_SAME_TIER'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-amber-300">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>⚡ Split 2x Stok</span>
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-normal mt-0.5 leading-tight">
                      Manual split 2x stok di tier yang sama &amp; reset midpoint.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMaxPriceAction('UPGRADE_NEXT_TIER')}
                    className={`p-2 rounded-lg border text-left text-[10px] font-bold transition ${
                      editMaxPriceAction === 'UPGRADE_NEXT_TIER'
                        ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-300 shadow-md ring-1 ring-fuchsia-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-extrabold text-fuchsia-300">
                      <TrendingUp className="w-3 h-3 text-fuchsia-400" />
                      <span>🚀 Naik Tier</span>
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-normal mt-0.5 leading-tight">
                      Manual naik tier ke aset berikutnya dengan rentang harga baru.
                    </div>
                  </button>
                </div>

                {/* Live Smart Evaluation Summary Card */}
                {editingAssetDetails && (() => {
                  const smartEval = determineSmartMaxPriceAction(editingAssetDetails, assets);
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-400" />
                          ANALISIS KEBUTUHAN STOK SAAT INI:
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          Mode Active: {editMaxPriceAction === 'AUTO_SMART_ROUTE' ? '🤖 Smart Auto' : editMaxPriceAction === 'SPLIT_SAME_TIER' ? '⚡ Manual Split' : '🚀 Manual Naik Tier'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-slate-800">
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                          <span className="text-slate-400 block font-bold">Tier Ini ({editingAssetDetails.name}):</span>
                          <div className="flex items-center justify-between">
                            <span>Stok: {editingAssetDetails.stockUnits ?? 1}/{editingAssetDetails.maxStockCapacity ?? 10}</span>
                            {smartEval.isCurrentDeficit ? (
                              <span className="text-amber-400 font-bold bg-amber-950/80 px-1 rounded">⚠️ Defisit Stok</span>
                            ) : (
                              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded">✓ Stok Cukup</span>
                            )}
                          </div>
                        </div>

                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                          <span className="text-slate-400 block font-bold">
                            Tier Selanjutnya ({smartEval.nextTierAsset ? smartEval.nextTierAsset.name : 'Tidak Ada'}):
                          </span>
                          <div className="flex items-center justify-between">
                            <span>
                              {smartEval.nextTierAsset
                                ? `Stok: ${smartEval.nextTierAsset.stockUnits ?? 1}/${smartEval.nextTierAsset.maxStockCapacity ?? 10}`
                                : 'Max Tier'}
                            </span>
                            {smartEval.nextTierAsset ? (
                              smartEval.isNextDeficit ? (
                                <span className="text-amber-400 font-bold bg-amber-950/80 px-1 rounded">⚠️ Defisit Stok</span>
                              ) : (
                                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded">✓ Stok Cukup</span>
                              )
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-950 border border-cyan-500/30 text-slate-300 font-sans leading-tight text-[10px]">
                        <span className="font-bold text-cyan-300 block mb-0.5">💡 Rekomendasi / Hasil Evaluasi Otomatis:</span>
                        {smartEval.reasonMessage}
                      </div>
                    </div>
                  );
                })()}

                {(editMaxPriceAction === 'UPGRADE_NEXT_TIER' || editMaxPriceAction === 'AUTO_SMART_ROUTE') && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <label className="text-[10px] text-slate-300 font-bold block">
                      Pilih Target Aset Tier Selanjutnya (Opsional Target Khusus):
                    </label>
                    <select
                      value={editNextTierAssetId}
                      onChange={(e) => setEditNextTierAssetId(e.target.value)}
                      className="w-full bg-slate-900 border border-fuchsia-500/40 rounded-lg p-2 text-fuchsia-200 font-bold text-xs"
                    >
                      <option value="">-- Otomatis Pilih Aset Tier Lebih Tinggi --</option>
                      {assets
                        .filter((a) => a.id !== editingAssetDetails?.id)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (${a.priceUsdt} USDT &bull; {a.theme})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 15-Cycle Price & Stock Split Simulation Table */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Simulasi 15x Perputaran &amp; Reset Midpoint</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Crypto USDT</span>
                </div>
                <CycleSimulationTable
                  startPrice={editPrice}
                  profitPercent={editProfit}
                  minPrice={editMinPrice}
                  maxPrice={editMaxPrice}
                  maxPriceAction={editMaxPriceAction}
                />
              </div>



              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider"
              >
                Simpan Spesifikasi Aset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Custom Burn Stock Asset */}
      {burningAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-fuchsia-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 font-mono text-slate-100 shadow-[0_0_30px_rgba(217,70,239,0.3)] relative overflow-hidden">
            {/* Top Flame Glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-fuchsia-500 to-amber-500 animate-pulse" />

            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-sm">
                <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>Burn Stok Aset Digital</span>
              </div>
              <button
                type="button"
                onClick={() => setBurningAsset(null)}
                className="text-slate-400 hover:text-white transition text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Asset Summary Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300 text-sm flex items-center justify-between">
                  <span>{burningAsset.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40 font-bold">
                    {burningAsset.theme}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Harga Per Unit: <strong className="text-emerald-400">${burningAsset.priceUsdt} USDT</strong></span>
                  <span>Stok Tersedia: <strong className="text-cyan-300">{burningAsset.stockUnits ?? 5} Unit</strong></span>
                </div>
              </div>

              <form onSubmit={handleConfirmBurn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-300 font-bold block">
                    Jumlah Stok Yang Ingin Di-Burn (Sesuka Admin):
                  </label>

                  {/* Preset Quick Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBurnStockInput(1)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition ${
                        burnStockInput === 1
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1 Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBurnStockInput(Math.min(5, burningAsset.stockUnits ?? 5))}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition ${
                        burnStockInput === 5
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      5 Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBurnStockInput(Math.min(10, burningAsset.stockUnits ?? 5))}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition ${
                        burnStockInput === 10
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      10 Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBurnStockInput(Math.max(1, burningAsset.stockUnits ?? 5))}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition ${
                        burnStockInput === (burningAsset.stockUnits ?? 5)
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Semua ({burningAsset.stockUnits ?? 5})
                    </button>
                  </div>

                  {/* Manual Number Input */}
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={burnStockInput}
                      onChange={(e) => setBurnStockInput(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-3 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400"
                      placeholder="Masukkan jumlah unit stok..."
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      UNIT
                    </span>
                  </div>
                </div>

                {/* Calculation & Effect Summary Card */}
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kalkulasi Efek Burn Stok</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Nilai USDT Di-Burn:</span>
                      <strong className="text-emerald-400 text-sm">
                        ${(burnStockInput * burningAsset.priceUsdt).toLocaleString()} USDT
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Stok Setelah Burn:</span>
                      <strong className="text-cyan-300 text-sm">
                        {Math.max(0, (burningAsset.stockUnits ?? 5) - burnStockInput)} Unit
                      </strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic pt-1">
                    *Tindakan burn akan mencatat pengumuman publik otomatis di feed pengguna.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setBurningAsset(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-600 via-fuchsia-600 to-red-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>Konfirmasi Burn ({burnStockInput} Unit)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 8. DEDICATED SINGLE ASSET TRANSACTION HISTORY MODAL */}
      {selectedAssetForHistory && (() => {
        const ast = selectedAssetForHistory;
        const assetRecords = tradeRecords.filter((r) => r.assetId === ast.id);
        const totalVolumeUsdt = assetRecords.reduce((sum, r) => sum + (r.priceUsdt || 0), 0);
        const totalVolumeIdr = Math.round(totalVolumeUsdt * (exchangeRateUsdtToIdr || 16250));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/60 rounded-3xl p-5 shadow-2xl space-y-4 overflow-y-auto font-sans">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-950 border border-slate-800 text-cyan-300 uppercase font-mono">
                        {ast.theme}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-100">{ast.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Riwayat Transaksi Lengkap & Detail Stok Beredar Aset
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAssetForHistory(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Asset Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Stok Beredar:</span>
                  <strong className="text-cyan-300 text-base">{ast.stockUnits ?? 5} / {ast.maxStockCapacity ?? 15} Unit</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Harga Unit:</span>
                  <strong className="text-emerald-400 text-base">${ast.priceUsdt} USDT</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Record:</span>
                  <strong className="text-fuchsia-300 text-base">{assetRecords.length} Transaksi</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Volume Trade:</span>
                  <strong className="text-amber-300 text-base">${totalVolumeUsdt.toLocaleString()} USDT</strong>
                  <span className="text-[9px] text-slate-400 block">&asymp; Rp {totalVolumeIdr.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Daftar Transaksi Khusus Aset {ast.name} ({assetRecords.length})</span>
                </h4>

                {assetRecords.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs font-mono">
                    Belum ada riwayat transaksi untuk aset ini.
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-xs max-h-[50vh] overflow-y-auto pr-1">
                    {assetRecords.map((rec) => {
                      const priceUsdt = rec.priceUsdt || ast.priceUsdt;
                      const priceIdr = Math.round(priceUsdt * (exchangeRateUsdtToIdr || 16250));

                      return (
                        <div key={rec.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 border border-slate-700 text-cyan-300">
                                {rec.tradeType}
                              </span>
                              <span className="text-slate-100 font-bold">{rec.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rec.timestamp).toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Nilai:</span>
                              <strong className="text-emerald-400">${priceUsdt} USDT</strong> (Rp {priceIdr.toLocaleString('id-ID')})
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Penjual:</span>
                              <span className="text-slate-200">{rec.sellerName || 'Member'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Pembeli:</span>
                              <span className="text-cyan-300">{rec.buyerName || 'Member'}</span>
                            </div>
                          </div>

                          {rec.notes && (
                            <p className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 leading-tight">
                              {rec.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForHistory(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. MODAL FORM UPLOAD BUKTI PEMBAYARAN & TRX HASH BUYBACK ADMIN */}
      {buybackPaymentTarget && (() => {
        const rec = buybackPaymentTarget;
        const priceUsdt = rec.priceUsdt || 100;
        const priceIdr = Math.round(priceUsdt * (exchangeRateUsdtToIdr || 16250));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/60 rounded-3xl p-5 shadow-2xl space-y-4 font-sans text-slate-100 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">
                      UPLOAD BUKTI PEMBAYARAN & TRX HASH BUYBACK
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Form bukti pembayaran agar penjual mengetahui resi transfer & TxHash lunas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBuybackPaymentTarget(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Transaction Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 text-[10px]">Aset & ID Transaksi:</span>
                  <span className="text-cyan-300 font-extrabold">{rec.assetName} #{rec.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Penjual (Penerima Dana):</span>
                    <strong className="text-slate-100">{rec.sellerName || 'Member Penjual'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Nominal Transfer:</span>
                    <strong className="text-emerald-400 text-sm">${priceUsdt} USDT</strong>
                    <span className="text-[10px] text-slate-400 block">&asymp; Rp {priceIdr.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form Fields */}
              <div className="space-y-3.5 font-mono text-xs">
                {/* Field 1: TRX Hash */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-cyan-300 uppercase block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. Bukti TRX Hash / ID Transaksi Transfer Blockchain/Bank:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={buybackTxHashInput}
                      onChange={(e) => setBuybackTxHashInput(e.target.value)}
                      placeholder="Contoh: 0x8f2a... atau BCA_REF_9918231"
                      className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-cyan-300 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setBuybackTxHashInput(
                          `0x8f${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`
                        )
                      }
                      className="px-2.5 py-2 shrink-0 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                      title="Generate Hash Demo"
                    >
                      ⚡ Hash Demo
                    </button>
                  </div>
                </div>

                {/* Field 2: Upload Gambar Foto Bukti Pembayaran */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-cyan-300 uppercase block flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Upload Foto / Gambar Bukti Pembayaran (Resi Transfer):</span>
                  </label>

                  {/* File Upload Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 transition text-center space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="buybackProofFileInput"
                      onChange={handleBuybackFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="buybackProofFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-cyan-300 transition"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                        <Upload className="w-5 h-5 animate-bounce" />
                      </div>
                      <span className="font-extrabold text-xs">Pilih File Foto Bukti Dari Perangkat (Kamera / Galeri)</span>
                      <span className="text-[10px] text-slate-400">Format PNG, JPG, JPEG, WEBP disupport langsung</span>
                    </label>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap">
                      <span>Pilihan Preset Contoh Bukti:</span>
                      <button
                        type="button"
                        onClick={() => setBuybackProofImageInput('https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=600&auto=format&fit=crop&q=80')}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 text-[9px] font-bold cursor-pointer"
                      >
                        Resi BCA
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuybackProofImageInput('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80')}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 text-[9px] font-bold cursor-pointer"
                      >
                        Resi Crypto USDT
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuybackProofImageInput('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80')}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 text-[9px] font-bold cursor-pointer"
                      >
                        Resi QRIS
                      </button>
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <input
                    type="text"
                    value={buybackProofImageInput}
                    onChange={(e) => setBuybackProofImageInput(e.target.value)}
                    placeholder="Atau tempelkan URL Gambar Bukti Transfer (https://...)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-[10px] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Pratinjau Foto Bukti Bayar */}
                {buybackProofImageInput && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Pratinjau Foto Bukti Pembayaran:</span>
                      </span>
                      <span className="text-emerald-400 font-mono text-[9px]">Ready to Submit ✓</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden max-h-52 border border-slate-800 bg-slate-900 flex justify-center">
                      <img
                        src={buybackProofImageInput}
                        alt="Bukti Transfer Admin"
                        className="max-h-52 object-contain w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setBuybackPaymentTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuybackPayment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>✓ Upload & Konfirmasi Pembayaran Ke Penjual</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* LIGHTBOX PREVIEW MODAL FOR PAYMENT PROOF IMAGE */}
      {buybackProofImagePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setBuybackProofImagePreviewModal(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-cyan-500/60 rounded-3xl p-4 shadow-2xl space-y-3 overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Foto Bukti Transfer Pembayaran Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setBuybackProofImagePreviewModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 flex justify-center max-h-[75vh] overflow-auto">
              <img
                src={buybackProofImagePreviewModal}
                alt="Bukti Transfer Lunas"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
              <span>Status: Lunas & Terverifikasi</span>
              <button
                type="button"
                onClick={() => setBuybackProofImagePreviewModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED MODAL: TAMBAH STOK ADMIN & WALLET DIREKSI */}
      {addAdminStockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-5 space-y-4 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <span>Tambah Stok Aset Admin</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono">
                      DIRECT WALLET
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pembayaran dari member dikirim langsung ke Alamat Wallet Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddAdminStockTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Asset Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-cyan-300">{addAdminStockTarget.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Stok Saat Ini: <strong className="text-emerald-400">{addAdminStockTarget.stockUnits ?? 5} Unit</strong>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-500">Harga Per Unit</div>
                <div className="font-bold text-emerald-400 text-sm">${addAdminStockTarget.priceUsdt} USDT</div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAddAdminStock} className="space-y-4">
              {/* Jumlah Stok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Jumlah Stok Yang Ditambahkan:</span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Stok Akhir: {(addAdminStockTarget.stockUnits ?? 5) + (Number(adminStockUnitsInput) || 0)} Unit
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={adminStockUnitsInput}
                    onChange={(e) => setAdminStockUnitsInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <div className="flex items-center gap-1">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAdminStockUnitsInput((prev) => prev + num)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition cursor-pointer border border-slate-700"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alamat Wallet Admin Destination */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/40">
                <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Alamat Wallet Admin Pembayaran (TRC20 USDT):</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 uppercase font-mono">
                    Penerima Dana
                  </span>
                </label>
                <input
                  type="text"
                  value={adminWalletInput}
                  onChange={(e) => setAdminWalletInput(e.target.value)}
                  placeholder="Masukkan Alamat Wallet TRC20 Admin"
                  className="w-full bg-slate-950 border border-emerald-500/60 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400 break-all"
                  required
                />
                <p className="text-[10px] text-emerald-300/80 leading-relaxed font-mono">
                  👑 Semua transaksi pembelian atau kemenangan tiket untuk stok tambahan ini akan ditransfer oleh member LANGSUNG ke alamat wallet Admin di atas.
                </p>
              </div>

              {/* Nama Penjual & No WA Admin */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Nama Penjual Admin:</label>
                  <input
                    type="text"
                    value={adminSellerNameInput}
                    onChange={(e) => setAdminSellerNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Akun Telegram Admin:</label>
                  <input
                    type="text"
                    value={adminSellerPhoneInput}
                    onChange={(e) => setAdminSellerPhoneInput(e.target.value)}
                    placeholder="@Sacodaha_Admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddAdminStockTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Simpan & Tambah Stok Ke Wallet Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED MODAL: RIWAYAT TRANSAKSI SETIAP PENGGUNA (PER-USER HISTORY) */}
      {selectedUserForHistory && (() => {
        const usr = selectedUserForHistory;
        const waDigits = usr.phone.replace(/[^0-9]/g, '');
        const waLink = `https://wa.me/${waDigits}`;

        // User Trade Records
        const userTrades = tradeRecords.filter(
          (r) =>
            r.userId === usr.id ||
            r.sellerName === usr.name ||
            r.buyerName === usr.name ||
            (r.sellerPhone && r.sellerPhone === usr.phone) ||
            (r.buyerPhone && r.buyerPhone === usr.phone)
        );

        // User USDT Mutations
        const userMutations = mutations.filter((m) => m.userId === usr.id);

        // User Exchange Requests
        const userExchanges = exchangeRequests.filter((e) => e.userId === usr.id);

        // User Assets Owned / Listed
        const userAssets = assets.filter(
          (a) =>
            a.sellerId === usr.id ||
            a.sellerName === usr.name ||
            a.sellerPhone === usr.phone
        );

        // Summary Metrics for this User
        const totalUserBuyUsdt = userTrades
          .filter((r) => r.tradeType === 'BUY_WIN' || r.buyerName === usr.name)
          .reduce((sum, r) => sum + (r.priceUsdt || 0), 0);

        const totalUserSellUsdt = userTrades
          .filter((r) => r.tradeType === 'SELL_COMPLETE' || r.sellerName === usr.name)
          .reduce((sum, r) => sum + (r.priceUsdt || 0), 0);

        const totalUserDepositUsdt = userMutations
          .filter((m) => m.type === 'DEPOSIT_IN' && m.status === 'COMPLETED')
          .reduce((sum, m) => sum + (m.amountUsdt || 0), 0);

        const totalUserExchangeUsdt = userExchanges
          .filter((e) => e.status === 'COMPLETED')
          .reduce((sum, e) => sum + (e.amountUsdt || 0), 0);

        // Filter Search
        const query = userHistorySearch.toLowerCase();

        const filteredUserTrades = userTrades.filter((r) => {
          if (!query) return true;
          return (
            r.assetName.toLowerCase().includes(query) ||
            r.id.toLowerCase().includes(query) ||
            r.tradeType.toLowerCase().includes(query) ||
            r.result.toLowerCase().includes(query) ||
            (r.notes && r.notes.toLowerCase().includes(query))
          );
        });

        const filteredUserMutations = userMutations.filter((m) => {
          if (!query) return true;
          return (
            m.description.toLowerCase().includes(query) ||
            m.type.toLowerCase().includes(query) ||
            m.status.toLowerCase().includes(query) ||
            (m.txHash && m.txHash.toLowerCase().includes(query))
          );
        });

        const filteredUserExchanges = userExchanges.filter((e) => {
          if (!query) return true;
          return (
            e.type.toLowerCase().includes(query) ||
            e.status.toLowerCase().includes(query) ||
            (e.adminNote && e.adminNote.toLowerCase().includes(query)) ||
            (e.bankDetails && e.bankDetails.toLowerCase().includes(query))
          );
        });

        // Combined All Timeline Events
        type TimelineItem =
          | { itemType: 'TRADE'; data: (typeof userTrades)[0]; timestamp: number }
          | { itemType: 'MUTATION'; data: (typeof userMutations)[0]; timestamp: number }
          | { itemType: 'EXCHANGE'; data: (typeof userExchanges)[0]; timestamp: number };

        const combinedTimeline: TimelineItem[] = [
          ...filteredUserTrades.map((data) => ({ itemType: 'TRADE' as const, data, timestamp: data.timestamp })),
          ...filteredUserMutations.map((data) => ({ itemType: 'MUTATION' as const, data, timestamp: data.timestamp })),
          ...filteredUserExchanges.map((data) => ({ itemType: 'EXCHANGE' as const, data, timestamp: data.createdAt })),
        ].sort((a, b) => b.timestamp - a.timestamp);

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="max-w-4xl w-full max-h-[92vh] bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-slate-950 via-cyan-950/60 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${usr.id}`}
                      alt={usr.name}
                      className="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/40 object-cover"
                    />
                    {usr.isDepositDone ? (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-[9px] font-bold" title="Verified">
                        ✓
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[9px] font-bold" title="Unverified">
                        🔒
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-100">{usr.name}</h3>
                      {usr.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[9px] font-black border border-cyan-500/40">
                          SUPER ADMIN
                        </span>
                      )}
                      {usr.isBanned && (
                        <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[9px] font-black border border-red-500/50">
                          🚫 BANNED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                      <span>WA / HP: <strong className="text-emerald-400">{usr.phone}</strong></span>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Chat WA</span>
                      </a>
                      <span className="text-slate-500">• ID: {usr.id}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserForHistory(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Tutup Modal"
                >
                  <XCircle className="w-6 h-6 text-slate-400 hover:text-rose-400" />
                </button>
              </div>

              {/* Content Body - Scrollable */}
              <div className="p-4 overflow-y-auto space-y-4 font-mono text-xs flex-1">
                {/* Executive Overview Cards for this User */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Saldo Aktif User</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                      ${usr.usdtBalance.toFixed(2)} USDT
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                      {usr.ticketBalance} Tiket
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Pembelian (Buy)</div>
                    <div className="text-sm font-black text-cyan-300 font-mono mt-0.5">
                      ${totalUserBuyUsdt.toLocaleString()} USDT
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {userTrades.filter((r) => r.tradeType === 'BUY_WIN').length}x Beli Menang
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Penjualan (Sell)</div>
                    <div className="text-sm font-black text-fuchsia-300 font-mono mt-0.5">
                      ${totalUserSellUsdt.toLocaleString()} USDT
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {userTrades.filter((r) => r.tradeType === 'SELL_COMPLETE').length}x Penjualan Sukses
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Deposit / Exchange</div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                      +${totalUserDepositUsdt.toLocaleString()} USDT
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Exchange: ${totalUserExchangeUsdt.toLocaleString()} USDT
                    </div>
                  </div>
                </div>

                {/* Sub-Nav Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-1 font-bold text-xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setUserHistoryTab('ALL')}
                      className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                        userHistoryTab === 'ALL'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Semua Timeline ({combinedTimeline.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserHistoryTab('TRADES')}
                      className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                        userHistoryTab === 'TRADES'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Market Trades ({filteredUserTrades.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserHistoryTab('MUTATIONS')}
                      className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                        userHistoryTab === 'MUTATIONS'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Mutasi Saldo ({filteredUserMutations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserHistoryTab('EXCHANGES')}
                      className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                        userHistoryTab === 'EXCHANGES'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Exchange ({filteredUserExchanges.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserHistoryTab('ASSETS')}
                      className={`px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                        userHistoryTab === 'ASSETS'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Stok Aset ({userAssets.length})
                    </button>
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userHistorySearch}
                      onChange={(e) => setUserHistorySearch(e.target.value)}
                      placeholder="Cari transaksi user ini..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* List Rendering based on userHistoryTab */}
                {userHistoryTab === 'ASSETS' ? (
                  /* User Owned Assets */
                  userAssets.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                      User ini tidak memiliki stok aset digital aktif yang dipasarkan saat ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userAssets.map((ast) => (
                        <div key={ast.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{ast.logo || '💎'}</span>
                            <div>
                              <strong className="text-slate-100 font-sans text-sm">{ast.name}</strong>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Stok: <strong className="text-emerald-400">{ast.stockUnits ?? 5} Unit</strong> • Harga:{' '}
                                <strong className="text-cyan-300">${ast.priceUsdt} USDT</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : userHistoryTab === 'ALL' ? (
                  /* Combined Timeline */
                  combinedTimeline.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                      Belum ada data transaksi yang tercatat untuk pengguna ini.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {combinedTimeline.map((item, idx) => {
                        if (item.itemType === 'TRADE') {
                          const rec = item.data;
                          const priceIdr = Math.round((rec.priceUsdt || 0) * (exchangeRateUsdtToIdr || 16250));
                          return (
                            <div key={`trade-${rec.id}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 border border-cyan-500/40 text-cyan-300 uppercase">
                                    MARKET TRADE
                                  </span>
                                  <strong className="text-slate-100 font-sans">{rec.assetName}</strong>
                                  <span className="text-[10px] text-slate-500">#{rec.id}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900 border border-slate-700 text-fuchsia-300">
                                  {rec.tradeType} ({rec.result})
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                                <div>
                                  Nominal: <strong className="text-emerald-400">${rec.priceUsdt} USDT</strong> (Rp {priceIdr.toLocaleString('id-ID')})
                                </div>
                                <div>
                                  Penjual: <span className="text-slate-200">{rec.sellerName || 'Member'}</span> &rarr; Pembeli:{' '}
                                  <span className="text-cyan-300">{rec.buyerName || 'Member'}</span>
                                </div>
                                <div>
                                  Waktu: <span className="text-slate-400">{new Date(rec.timestamp).toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                              {rec.notes && <div className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded">{rec.notes}</div>}
                            </div>
                          );
                        } else if (item.itemType === 'MUTATION') {
                          const mut = item.data;
                          return (
                            <div key={`mut-${mut.id}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                                  MUTASI SALDO: {mut.type}
                                </span>
                                <span className="text-emerald-400 font-black text-sm">+${mut.amountUsdt} USDT</span>
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center justify-between">
                                <span>{mut.description}</span>
                                <span className="text-[10px] text-slate-500">{new Date(mut.timestamp).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          );
                        } else {
                          const ex = item.data;
                          return (
                            <div key={`ex-${ex.id}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                                  EXCHANGE: {ex.type}
                                </span>
                                <span className="text-amber-400 font-black text-sm">${ex.amountUsdt} USDT</span>
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center justify-between">
                                <span>
                                  Status: <strong className="text-cyan-300">{ex.status}</strong> • Rp {ex.amountIdr.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-slate-500">{new Date(ex.createdAt).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )
                ) : userHistoryTab === 'TRADES' ? (
                  /* Only Trade Records */
                  filteredUserTrades.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                      Tidak ada riwayat perdagangan market untuk pengguna ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUserTrades.map((rec) => {
                        const priceIdr = Math.round((rec.priceUsdt || 0) * (exchangeRateUsdtToIdr || 16250));
                        return (
                          <div key={rec.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 border border-cyan-500/40 text-cyan-300 uppercase">
                                  {rec.theme || 'NEON'}
                                </span>
                                <strong className="text-slate-100 font-sans">{rec.assetName}</strong>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900 border border-slate-700 text-fuchsia-300">
                                {rec.tradeType} ({rec.result})
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                              <div>
                                Nominal: <strong className="text-emerald-400">${rec.priceUsdt} USDT</strong> (Rp {priceIdr.toLocaleString('id-ID')})
                              </div>
                              <div>
                                Penjual: <span className="text-slate-200">{rec.sellerName || 'Member'}</span> &rarr; Pembeli:{' '}
                                <span className="text-cyan-300">{rec.buyerName || 'Member'}</span>
                              </div>
                              <div>
                                Waktu: <span className="text-slate-400">{new Date(rec.timestamp).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                            {rec.notes && <div className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded">{rec.notes}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : userHistoryTab === 'MUTATIONS' ? (
                  /* Only Mutations */
                  filteredUserMutations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                      Tidak ada mutasi saldo tercatat untuk pengguna ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUserMutations.map((mut) => (
                        <div key={mut.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                              {mut.type}
                            </span>
                            <span className="text-emerald-400 font-black text-sm">+${mut.amountUsdt} USDT</span>
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center justify-between">
                            <span>{mut.description}</span>
                            <span className="text-[10px] text-slate-500">{new Date(mut.timestamp).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* Only Exchange Requests */
                  filteredUserExchanges.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                      Tidak ada riwayat penukaran exchange untuk pengguna ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUserExchanges.map((ex) => (
                        <div key={ex.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                              {ex.type}
                            </span>
                            <span className="text-amber-400 font-black text-sm">${ex.amountUsdt} USDT</span>
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center justify-between">
                            <span>
                              Status: <strong className="text-cyan-300">{ex.status}</strong> • Rp {ex.amountIdr.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-500">{new Date(ex.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <RaffleShuffleModal
        isOpen={isShuffleModalOpen}
        onClose={() => setIsShuffleModalOpen(false)}
        targetWinnerCount={drawWinnerCount}
        onCompleteDraw={(count) => {
          drawGiveawayWinners(count);
        }}
        participants={giveawayParticipants}
        prizes={giveawayPrizes}
        allUsers={users}
      />
    </div>
  );
};
