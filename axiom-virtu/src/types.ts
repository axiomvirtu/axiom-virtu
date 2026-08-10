export type UserRole = 'user' | 'admin';

export interface TelegramWebAppUser {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  auth_date?: number;
  hash?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string; // Telegram connected handle / username / ID
  password?: string;
  role: UserRole;
  usdtBalance: number;
  ticketBalance: number;
  walletAddress: string;
  isDepositDone: boolean; // Minimum $1 / ticket deposit required
  isLocked: boolean; // Locked if isDepositDone === false
  isVerified?: boolean;
  isBanned: boolean;
  banReason?: string;
  banDetails?: {
    ipAddress: string;
    deviceId: string;
    whatsappNumber: string;
    bannedAt: number;
  };
  ipAddress?: string;
  deviceId?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt?: string;
  avatar?: string;
  photoUrl?: string;
  biometricEnabled?: boolean;
  phoneNumber?: string;
}

export type AssetTheme = 'CYBERPUNK' | 'SYNTHWAVE' | 'QUANTUM' | 'BIOTECH' | 'NEON_MATRIX';

export interface DigitalAsset {
  id: string;
  name: string;
  theme: AssetTheme;
  logo: string; // Icon identifier or SVG/image URL
  priceUsdt: number;
  minPriceUsdt?: number; // Minimum price range (Cycle 1 starting price)
  maxPriceUsdt?: number; // Maximum price range ceiling before 2x stock split & midpoint reset
  currentCycleStep?: number; // Current step in 15-cycle rotation (1 to 15)
  contractDays: number; // 1 to 30 days
  dailyProfitPercent: number; // e.g. 5.5%
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWalletAddress?: string;
  maxGrabbers: number; // Default 5 persons, editable by admin
  maxGrabbersAllowed?: number;
  bookedUsers: string[]; // List of user IDs who booked with ticket
  currentWinnerId?: string;
  status: 'AVAILABLE' | 'BOOKED_WAITING' | 'GRABBED_PAYMENT_PENDING' | 'ACTIVE_HOLDING' | 'EXPIRED' | 'BURNED';
  paymentDeadline?: number; // Timestamp 3 hours from win
  proofTxHash?: string;
  proofImageUrl?: string;
  isPaid?: boolean;
  isConfirmedBySeller?: boolean;
  createdAt: number;
  stockUnits?: number; // Available circulating stock units editable by admin
  totalStock?: number;
  maxStockCapacity?: number; // Maximum stock limit capacity before oversupply warning (e.g. 15 or 20)
  ticketBookingTarget?: number; // Target ticket volume for booking demand indicator (e.g. 15 or 20)
  // Action when reaching Max Price (harga tertinggi)
  maxPriceAction?: 'AUTO_SMART_ROUTE' | 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER'; // Default: AUTO_SMART_ROUTE
  nextTierAssetId?: string; // Optional explicit target next tier asset ID
  // Unsold tracking & Manual Admin Buyback queue
  unsoldCyclesCount?: number; // Count of consecutive trading sessions where stock was unsold
  isInAdminBuybackQueue?: boolean; // True if unsold 2x sessions, preventing auto-buy & requiring manual admin decision
  adminBuybackStatus?: 'NONE' | 'PENDING_ADMIN_BUYBACK' | 'PURCHASED_BY_ADMIN' | 'REJECTED_BY_ADMIN';
  // Custom trading & booking hours per asset
  customSchedule?: {
    bookingStartHour: string;
    bookingEndHour: string;
    tradingStartHour: string;
    tradingEndHour: string;
  };
}

export interface ScheduleConfig {
  bookingStartHour: string; // e.g. "10:00"
  bookingEndHour: string;   // e.g. "12:00"
  tradingStartHour: string; // e.g. "13:00"
  tradingEndHour: string;   // e.g. "15:00"
  grabbingRulesPeopleCount: number; // Default 5
  minVerificationDepositUsdt?: number; // Configurable verification threshold, default $5
}

export interface UsdtMutation {
  id: string;
  userId: string;
  type: 'DEPOSIT_IN' | 'P2P_SELL_IN' | 'EXCHANGE_BUY_IN' | 'ADMIN_CREDIT_IN' | 'PROFIT_REWARD_IN';
  amountUsdt: number;
  amountIdr?: number;
  description: string;
  txHash?: string;
  senderInfo?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  timestamp: number;
}

export interface Announcement {
  id: string;
  type: 'NEWS' | 'BANNED' | 'BURN';
  title: string;
  content: string;
  timestamp: number;
  bannedUserPhone?: string;
  burnedAssetId?: string;
  burnedAssetAmount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderRole: UserRole;
  message: string;
  timestamp: number;
  isE2eEncrypted?: boolean;
}

export interface ExchangeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: 'CRYPTO_TO_IDR' | 'IDR_TO_CRYPTO';
  amountUsdt: number;
  amountIdr: number;
  ratePerUsdt: number;
  isPriceLocked: boolean;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  userPaymentProof?: string;
  adminNote?: string;
  adminProofTxHash?: string;
  adminProofImage?: string;
  bankDetails?: string;
  targetWalletAddress?: string;
  isTicketPurchase?: boolean;
  ticketCount?: number;
  createdAt: number;
  approvedAt?: number;
}

export interface GiveawayScheduleConfig {
  scheduledTime: number | null; // Timestamp in ms or null if unscheduled
  isAutoDrawEnabled: boolean;
  scheduledWinnerCount: number;
  note?: string;
  updatedAt?: number;
}

export interface GiveawayPrize {
  id: string;
  title: string;
  description: string;
  category: 'GADGET' | 'USDT' | 'TICKET' | 'OTHER';
  badgeText: string;
  imageUrl?: string;
  quantity: number;
}

export interface GiveawayWinner {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  prizeTitle: string;
  prizeBadge?: string;
  luckyNumber: string;
  wonAt: number;
  deliveryStatus?: 'PENDING' | 'SENT';
  proofTxHash?: string;
  proofImageUrl?: string;
  sentAt?: number;
  adminNote?: string;
}

export type AssetTradeType = 'BUY_WIN' | 'SELL_COMPLETE' | 'BID_LOST' | 'SLOT_BOOKED' | 'TRANSFER_PAID' | 'SYSTEM_BUYBACK';
export type AssetTradeResult = 'WIN' | 'LOST' | 'COMPLETED' | 'PENDING_PAYMENT' | 'PENDING_SYSTEM_PAYMENT' | 'PAID_AWAITING_BURN' | 'COMPLETED_BURNED';

export interface AssetTradeRecord {
  id: string;
  userId: string;
  assetId: string;
  assetName: string;
  assetLogo: string;
  theme: AssetTheme;
  priceUsdt: number;
  dailyProfitPercent: number;
  contractDays: number;
  tradeType: AssetTradeType;
  result: AssetTradeResult;
  ticketsSpent: number; // e.g. 1
  sellerName: string;
  sellerPhone?: string;
  buyerName?: string;
  buyerPhone?: string;
  timestamp: number;
  proofTxHash?: string;
  proofImageUrl?: string;
  notes?: string;
  burnUnits?: number; // Number of units involved in system buyback / burn
  isBurned?: boolean;
  burnedAt?: number;
}

export interface TopUpPaymentConfig {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl: string;
  qrisNmid: string;
  qrisMerchantName: string;
  adminUsdtTrc20Address?: string;
  instructionsNote?: string;
}

export type SupportTicketCategory = 'LAPOR_KECURANGAN' | 'BUG_SYSTEM' | 'KENDALA_EXCHANGE' | 'KENDALA_TOPUP' | 'MASALAH_LAIN';
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  reportedUser?: string; // Name/Phone/ID of user reported (if applicable)
  attachmentUrl?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: number;
  updatedAt: number;
  adminReply?: string;
  resolvedAt?: number;
}

export interface AppNotification {
  id: string;
  type: 'WIN' | 'SCHEDULE' | 'PAYMENT' | 'EXCHANGE' | 'SYSTEM' | 'BAN';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}
