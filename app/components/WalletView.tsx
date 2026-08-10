import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifiedBadge, UnverifiedBadge } from './VerifiedBadge';
import {
  Wallet,
  Ticket,
  QrCode,
  Copy,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Building2,
  Key,
  ArrowDownCircle,
  History,
  Sparkles,
  Search,
  ExternalLink,
  Zap,
  Trophy,
  ShoppingBag,
  Tag,
  Filter,
  Layers,
} from 'lucide-react';
import { UsdtMutation, AssetTradeRecord, ExchangeRequest } from '../types';

export const WalletView: React.FC = () => {
  const {
    currentUser,
    users,
    topUpTickets,
    exchangeRateUsdtToIdr,
    mutations,
    tradeRecords,
    simulateIncomingDeposit,
    approveDepositMutation,
    rejectDepositMutation,
    topUpPaymentConfig,
    exchangeRequests,
    setIsTicketModalOpen,
  } = useApp();

  const [ticketCountInput, setTicketCountInput] = useState<number>(5);
  const [payMethod, setPayMethod] = useState<'USDT' | 'BANK_IDR'>('USDT');
  const [copied, setCopied] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Search & Filter State for Real-Time Mutations
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simDepositAmount, setSimDepositAmount] = useState<number>(10);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const idrEquivalent = currentUser.usdtBalance * exchangeRateUsdtToIdr;

  const copyWallet = () => {
    navigator.clipboard.writeText('0x71C990184A89AXIOMUSDT_TRC20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTxHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleTopUp = () => {
    topUpTickets(ticketCountInput, payMethod);
  };

  const handleSimulateDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (simDepositAmount <= 0) return;
    simulateIncomingDeposit(simDepositAmount);
    setIsSimModalOpen(false);
  };

  // -------------------------------------------------------------
  // ADMIN VIEW: HISTORI DEPOSIT MEMBER KE REKENING & QRIS ADMIN
  // -------------------------------------------------------------
  if (currentUser.role === 'admin') {
    const allDepositMutations = mutations.filter((m) =>
      ['DEPOSIT_IN', 'EXCHANGE_BUY_IN', 'ADMIN_CREDIT_IN', 'P2P_SELL_IN'].includes(m.type) ||
      m.description.toLowerCase().includes('deposit') ||
      m.description.toLowerCase().includes('top up') ||
      m.description.toLowerCase().includes('qris') ||
      m.description.toLowerCase().includes('tiket')
    );

    const filteredAdminMutations = allDepositMutations.filter((m) => {
      const userObj = users.find((u) => u.id === m.userId);
      const userName = userObj?.name || 'Member Axiom';
      const userPhone = userObj?.phone || '';

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        m.description.toLowerCase().includes(query) ||
        (m.txHash && m.txHash.toLowerCase().includes(query)) ||
        userName.toLowerCase().includes(query) ||
        userPhone.toLowerCase().includes(query);

      const matchesType =
        filterType === 'ALL' ||
        (filterType === 'QRIS' && (m.description.toLowerCase().includes('qris') || m.description.toLowerCase().includes('bank'))) ||
        (filterType === 'USDT' && (m.type === 'DEPOSIT_IN' || m.description.toLowerCase().includes('trc20'))) ||
        (filterType === 'EXCHANGE' && m.type === 'EXCHANGE_BUY_IN');

      return matchesSearch && matchesType;
    });

    const totalDepositVolUsdt = allDepositMutations.reduce((acc, curr) => acc + curr.amountUsdt, 0);
    const totalDepositVolIdr = totalDepositVolUsdt * exchangeRateUsdtToIdr;

    return (
      <div className="space-y-4 font-mono pb-20">
        {/* Admin Header Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-fuchsia-950/80 border border-fuchsia-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-300">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                  Histori Deposit Member
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 text-[10px] font-black uppercase">
                    Admin Access
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Rekap histori seluruh deposit & top-up tiket/USDT member ke rekening admin & QRIS
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Volume Deposit Member</div>
              <div className="text-base font-black text-emerald-400">
                +${totalDepositVolUsdt.toFixed(2)} USDT
              </div>
              <div className="text-[10px] text-slate-400">
                ≈ Rp {Math.round(totalDepositVolIdr).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Transaksi Deposit</div>
              <div className="text-base font-black text-cyan-300">
                {allDepositMutations.length} Transaksi
              </div>
              <div className="text-[10px] text-slate-400">Sistem Otomatis / Validated</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400">Rekening & QRIS Admin Aktif</div>
              <div className="text-xs font-bold text-fuchsia-300 truncate">
                {topUpPaymentConfig.qrisMerchantName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {topUpPaymentConfig.bankName} - {topUpPaymentConfig.accountNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama member, HP, ref ID, atau deskripsi..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua Deposit' },
                { id: 'PENDING', label: '⏳ Menunggu Konfirmasi Admin' },
                { id: 'QRIS', label: 'Scan QRIS / IDR' },
                { id: 'USDT', label: 'USDT TRC20' },
                { id: 'EXCHANGE', label: 'Exchange Top-Up' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap transition ${
                    filterType === tab.id
                      ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Member Deposit Mutations */}
          <div className="space-y-2.5 pt-1">
            {filteredAdminMutations.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 text-slate-500 space-y-2">
                <History className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">Tidak ada data deposit member yang sesuai dengan pencarian Anda.</p>
              </div>
            ) : (
              filteredAdminMutations.map((mut) => {
                const memberUser = users.find((u) => u.id === mut.userId);
                const memberName = memberUser?.name || 'Member Axiom';
                const memberPhone = memberUser?.phone || 'No Phone';

                const isQrisOrIdr =
                  mut.description.toLowerCase().includes('qris') ||
                  mut.description.toLowerCase().includes('bank') ||
                  mut.type === 'EXCHANGE_BUY_IN';

                const dateFormatted = new Date(mut.timestamp).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                const isPending = mut.status === 'PENDING';
                const isCancelled = mut.status === 'CANCELLED';

                return (
                  <div
                    key={mut.id}
                    className={`p-3.5 rounded-xl bg-slate-950 border transition space-y-2.5 ${
                      isPending
                        ? 'border-amber-500/60 shadow-lg shadow-amber-950/40 bg-slate-900/90'
                        : 'border-slate-800 hover:border-fuchsia-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-fuchsia-400 shrink-0 font-bold text-xs mt-0.5">
                          {memberName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-100">{memberName}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">({memberPhone})</span>
                          </div>

                          <div className="flex items-center gap-2 pt-0.5">
                            {isQrisOrIdr ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1">
                                <QrCode className="w-3 h-3 text-fuchsia-400" />
                                Payment IDR QRIS / Bank Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-cyan-400" />
                                USDT TRC20 Direct
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">{dateFormatted}</span>
                          </div>

                          <p className="text-xs text-slate-300 font-sans pt-1">{mut.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-sm text-emerald-400">
                          +${mut.amountUsdt.toFixed(2)} USD
                        </div>
                        <div className="text-[11px] font-bold text-cyan-300">
                          Rp {(mut.amountIdr || mut.amountUsdt * exchangeRateUsdtToIdr).toLocaleString('id-ID')}
                        </div>
                        {isPending ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-black uppercase animate-pulse">
                            ⏳ Menunggu Konfirmasi Admin
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-extrabold uppercase">
                            ✕ Dibatalkan
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase">
                            ✓ Sukses (Terima)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions if Deposit is Pending */}
                    {isPending && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                        <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                          <span>Wajib Konfirmasi Admin: Apakah pembayaran sudah diterima di Rekening/QRIS?</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveDepositMutation(mut.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-950" />
                            <span>✅ Konfirmasi Pembayaran Masuk (Setujui & Aktifkan Member)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectDepositMutation(mut.id, 'Pembayaran belum masuk ke rekening/QRIS Admin.')}
                            className="py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {mut.txHash && (
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>Ref / TxHash:</span>
                          <span className="text-slate-300 truncate max-w-[200px]">{mut.txHash}</span>
                          <button
                            onClick={() => copyTxHash(mut.txHash!, mut.id)}
                            className="text-cyan-400 hover:underline flex items-center gap-0.5"
                          >
                            {copiedTxId === mut.id ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-500 italic">
                          Tercatat di Server Admin
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // Map and combine all transaction types into a unified chronological log
  interface UnifiedTx {
    id: string;
    timestamp: number;
    category: 'USDT' | 'TICKET' | 'ASSET' | 'TIKET' | string;
    badgeLabel: string;
    badgeStyle: string;
    title: string;
    subtitle?: string;
    amountUsdt?: number;
    ticketsAmount?: number;
    amountIdr?: number;
    isPositive?: boolean;
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'SUCCESS' | string;
    txHash?: string;
    icon: React.ReactNode;
  }

  // 1. Map USDT Mutations
  const userMutations = mutations.filter((m) => m.userId === currentUser.id);
  const mutationTxs: UnifiedTx[] = userMutations.map((m) => {
    const isTicket = m.description.toLowerCase().includes('tiket');
    return {
      id: `mut-${m.id}`,
      timestamp: m.timestamp,
      category: isTicket ? 'TICKET' : 'USDT',
      badgeLabel: isTicket
        ? 'PEMBELIAN TIKET'
        : m.type === 'DEPOSIT_IN'
        ? 'DEPOSIT TRC20'
        : m.type === 'EXCHANGE_BUY_IN'
        ? 'EXCHANGE BCA'
        : m.type === 'PROFIT_REWARD_IN'
        ? 'PROFIT ASET'
        : m.type === 'P2P_SELL_IN'
        ? 'PENJUALAN P2P'
        : 'MUTASI CREDIT',
      badgeStyle: isTicket
        ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30'
        : m.type === 'DEPOSIT_IN'
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : m.type === 'EXCHANGE_BUY_IN'
        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      title: m.description,
      subtitle: m.senderInfo ? `Sumber: ${m.senderInfo}` : undefined,
      amountUsdt: m.amountUsdt,
      amountIdr: m.amountIdr || m.amountUsdt * exchangeRateUsdtToIdr,
      isPositive: true,
      status: m.status,
      txHash: m.txHash,
      icon: isTicket ? <Ticket className="w-4 h-4 text-fuchsia-400" /> : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />,
    };
  });

  // 2. Map Exchange Requests
  const exchangeTxs: UnifiedTx[] = exchangeRequests
    .filter((e) => e.userId === currentUser.id)
    .map((e) => {
      const isTicket = e.isTicketPurchase;
      return {
        id: `ex-${e.id}`,
        timestamp: e.createdAt,
        category: isTicket ? 'TIKET' : 'USDT',
        badgeLabel: isTicket
          ? `TOP UP ${e.ticketCount || e.amountUsdt} TIKET`
          : e.type === 'CRYPTO_TO_IDR'
          ? 'EXCHANGE (USDT -> IDR)'
          : 'EXCHANGE (IDR -> USDT)',
        badgeStyle: isTicket
          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        title: isTicket
          ? `Top Up ${e.ticketCount || e.amountUsdt} Tiket Verifikasi`
          : e.type === 'CRYPTO_TO_IDR'
          ? 'Penukaran USDT ke Bank IDR'
          : 'Pembelian USDT via Bank IDR',
        subtitle: isTicket
          ? `Bukti / Catatan: ${e.userPaymentProof || 'Pembelian Tiket'}`
          : `Detail Bank: ${e.bankDetails || 'Bank BCA'}`,
        amountUsdt: e.amountUsdt,
        amountIdr: e.amountIdr,
        isPositive: e.type === 'IDR_TO_CRYPTO',
        status:
          e.status === 'COMPLETED'
            ? 'COMPLETED'
            : e.status === 'CANCELLED' || e.status === 'REJECTED'
            ? 'CANCELLED'
            : 'PENDING',
        txHash: e.adminProofTxHash,
        icon: isTicket ? <Ticket className="w-4 h-4 text-fuchsia-400" /> : <Building2 className="w-4 h-4 text-cyan-400" />,
      };
    });

  // 3. Map Asset Trade Records
  const assetTxs: UnifiedTx[] = (tradeRecords || [])
    .filter((r) => r.userId === currentUser.id || r.userId === 'usr_me')
    .map((r) => {
      const isBooking = r.tradeType === 'SLOT_BOOKED';
      const isWin = r.tradeType === 'BUY_WIN' || r.result === 'WIN';
      const isSell = r.tradeType === 'SELL_COMPLETE';
      const isBuyback = r.tradeType === 'SYSTEM_BUYBACK';

      return {
        id: `trade-${r.id}`,
        timestamp: r.timestamp,
        category: isBooking ? 'TICKET' : 'ASSET',
        badgeLabel: isBooking
          ? 'SLOT BOOKING'
          : isWin
          ? 'MENANG UNDIAN'
          : isSell
          ? 'ASET TERJUAL'
          : isBuyback
          ? 'SYSTEM BUYBACK'
          : 'TRADE ASET',
        badgeStyle: isBooking
          ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30'
          : isWin
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : isSell || isBuyback
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        title: `${r.assetName}`,
        subtitle: isBooking
          ? `Penggunaan ${r.ticketsSpent || 1} Tiket Kupon`
          : isWin
          ? `Menang Lelang • Profit +${r.dailyProfitPercent}% (${r.contractDays} Hari)`
          : `Penjualan P2P Aset Digital`,
        amountUsdt: r.priceUsdt > 0 ? r.priceUsdt : undefined,
        ticketsAmount: r.ticketsSpent > 0 ? r.ticketsSpent : undefined,
        amountIdr: r.priceUsdt > 0 ? r.priceUsdt * exchangeRateUsdtToIdr : undefined,
        isPositive: isSell || isBuyback,
        status: r.result === 'WIN' || r.result === 'COMPLETED' || r.result === 'COMPLETED_BURNED' ? 'COMPLETED' : r.result === 'LOST' ? 'CANCELLED' : 'PENDING',
        txHash: r.proofTxHash,
        icon: isBooking ? <Ticket className="w-4 h-4 text-fuchsia-400" /> : isWin ? <Trophy className="w-4 h-4 text-amber-400" /> : <ShoppingBag className="w-4 h-4 text-emerald-400" />,
      };
    });

  // Combined Log sorted by newest timestamp first
  const allTransactions: UnifiedTx[] = [...mutationTxs, ...exchangeTxs, ...assetTxs].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const filteredTransactions = allTransactions.filter((tx) => {
    if (filterType !== 'ALL' && tx.category !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchBadge = tx.badgeLabel.toLowerCase().includes(q);
      const matchSub = tx.subtitle ? tx.subtitle.toLowerCase().includes(q) : false;
      const matchHash = tx.txHash ? tx.txHash.toLowerCase().includes(q) : false;
      return matchTitle || matchBadge || matchSub || matchHash;
    }
    return true;
  });

  // Total incoming volume calculation
  const totalIncomingUsdt = userMutations.reduce((acc, curr) => acc + curr.amountUsdt, 0);

  const getTypeBadge = (type: UsdtMutation['type']) => {
    switch (type) {
      case 'DEPOSIT_IN':
        return {
          label: 'Deposit TRC20',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'EXCHANGE_BUY_IN':
        return {
          label: 'Exchange BCA -> USDT',
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        };
      case 'PROFIT_REWARD_IN':
        return {
          label: 'Hasil Profit Aset',
          bg: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
        };
      case 'ADMIN_CREDIT_IN':
        return {
          label: 'Top Up Admin',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'P2P_SELL_IN':
        return {
          label: 'Penjualan P2P',
          bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
      default:
        return {
          label: 'Mutasi Masuk',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-4 font-mono pb-20">
      {/* 1. Wallet Balance Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/80 border border-cyan-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">Dompet Kripto USDT Utama</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            E2E Encrypted
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Total Saldo Aset</div>
            <div className="text-2xl font-black text-cyan-300 tracking-tight">
              ${currentUser.usdtBalance.toFixed(2)} <span className="text-xs font-semibold text-slate-400">USDT</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 pt-0.5">
              ≈ Rp {idrEquivalent.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] text-slate-500">(Kurs Realtime 1 Min)</span>
            </div>
          </div>

          {/* Quick Realtime Deposit Simulation Button */}
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition shrink-0"
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-200" />
            <span>Simulasi Deposit</span>
          </button>
        </div>

        {/* Address & Copy */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Alamat Wallet USDT (TRC20):</span>
            <button
              onClick={copyWallet}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Salin'}
            </button>
          </div>
          <div className="font-bold text-xs text-slate-200 truncate font-mono">
            0x71C990184A89AXIOMUSDT_TRC20
          </div>
        </div>
      </div>

      {/* 2. Top-Up & Purchase Admission Tickets Panel ($1 = 1 Ticket) */}
      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-fuchsia-500/50 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-fuchsia-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-fuchsia-950 border border-fuchsia-500/50">
              <Ticket className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <span>Pembelian Tiket &amp; Verifikasi Akun</span>
                <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500 text-slate-950 font-black">
                  SYARAT VERIFIKASI
                </span>
              </h3>
              <p className="text-[10px] text-fuchsia-300 font-mono">
                Kurs Tetap: 1 Tiket = $1.00 USDT (Rp {exchangeRateUsdtToIdr.toLocaleString('id-ID')})
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 font-bold text-xs">
            {currentUser.ticketBalance} Tiket
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-[11px] text-amber-200/90 space-y-2 font-mono">
          <div className="flex items-center justify-between font-bold">
            <span>Status Verifikasi Akun:</span>
            <div>
              {currentUser.isDepositDone ? (
                <VerifiedBadge size="sm" text="Verified" />
              ) : (
                <UnverifiedBadge size="sm" onClick={() => setIsTicketModalOpen(true)} />
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            💡 Pembelian minimal 1 Tiket ($1 USDT) secara otomatis memverifikasi akun Anda dan membuka seluruh akses Pasar Sekunder &amp; Undian.
          </p>

          <button
            type="button"
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-fuchsia-950/50 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Buka Modal Pembelian Tiket &amp; Integrasi USDT/QRIS</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-bold">Pilih Jumlah Tiket yang Ingin Dibeli:</label>
          <div className="grid grid-cols-5 gap-1.5 text-xs">
            {[1, 5, 10, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => setTicketCountInput(num)}
                className={`py-2 rounded-xl border font-bold transition cursor-pointer ${
                  ticketCountInput === num
                    ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-600/30 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Focused Action Button - Strictly Transfer USDT TRC20 */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Wallet className="w-4 h-4 text-fuchsia-200" />
            <span>TRANSFER USDT TRC20 (${ticketCountInput} USDT)</span>
          </button>
        </div>
      </div>

      {/* 3. UNIFIED TRANSACTION HISTORY LOG (RIWAYAT TRANSAKSI LENGKAP) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">Riwayat Transaksi Dompet</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  <Zap className="w-3 h-3 text-emerald-400" /> REAL-TIME LOG
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Catatan lengkap transfer USDT, pembelian tiket, &amp; perdagangan aset</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">Total Transaksi</div>
            <div className="text-sm font-black text-cyan-300">
              {allTransactions.length} Log Event
            </div>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, ID, TxHash, atau deskripsi..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <button
              onClick={() => setIsSimModalOpen(true)}
              className="px-2.5 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] rounded-xl flex items-center gap-1 transition shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulasi Deposit</span>
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold no-scrollbar">
            {[
              { id: 'ALL', label: `Semua Log (${allTransactions.length})` },
              { id: 'USDT', label: `Transfer USDT (${mutationTxs.length + exchangeTxs.length})` },
              { id: 'TICKET', label: `Pembelian Tiket (${allTransactions.filter((t) => t.category === 'TICKET').length})` },
              { id: 'ASSET', label: `Trade & Booking Aset (${assetTxs.filter((t) => t.category === 'ASSET').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${
                  filterType === tab.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Realtime Transaction History Feed */}
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">Belum ada catatan riwayat transaksi yang cocok dengan pencarian filter.</p>
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:underline inline-block pt-1"
              >
                + Coba Simulasi Deposit USDT Real-Time
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const dateStr = new Date(tx.timestamp).toLocaleString('id-ID', {
                dateStyle: 'short',
                timeStyle: 'medium',
              });

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-emerald-500/40 transition space-y-2 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {tx.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tx.badgeStyle}`}>
                            {tx.badgeLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-100 pt-0.5">{tx.title}</h4>
                        {tx.subtitle && (
                          <div className="text-[10px] text-slate-400">
                            {tx.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      {tx.amountUsdt !== undefined && (
                        <div className={`font-black text-sm flex items-center justify-end gap-0.5 ${
                          tx.isPositive ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          <span>{tx.isPositive ? '+' : '-'}${tx.amountUsdt.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-slate-400">USDT</span>
                        </div>
                      )}

                      {tx.ticketsAmount !== undefined && (
                        <div className="font-bold text-xs text-fuchsia-400 flex items-center justify-end gap-1">
                          <Ticket className="w-3 h-3" />
                          <span>-{tx.ticketsAmount} Tiket</span>
                        </div>
                      )}

                      {tx.amountIdr !== undefined && (
                        <div className="text-[10px] font-semibold text-slate-400">
                          ≈ Rp {tx.amountIdr.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TX Hash & Status Row */}
                  <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                      <span>Ref / TxHash:</span>
                      <span className="text-cyan-400/90 truncate max-w-[140px] sm:max-w-[220px]">
                        {tx.txHash || tx.id}
                      </span>
                      <button
                        onClick={() => copyTxHash(tx.txHash || tx.id, tx.id)}
                        className="text-slate-400 hover:text-cyan-300 transition"
                        title="Salin Tx Hash / Ref"
                      >
                        {copiedTxId === tx.id ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {tx.status === 'PENDING' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black text-[9px] uppercase animate-pulse">
                        ⏳ Menunggu Konfirmasi
                      </span>
                    ) : tx.status === 'CANCELLED' ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[9px] uppercase">
                        ✕ Dibatalkan
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px]">
                        ✓ Selesai / Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. E2E Keys & Security Parameters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Key className="w-4 h-4" />
          <span>Keamanan Enkripsi End-to-End (E2E)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Seluruh kunci privat transaksi P2P dan pesan langsung antar pengguna dienkripsi secara penuh
          di sisi perangkat pengguna. Tidak ada pihak ketiga yang dapat mengintersepsi transaksi dompet Anda.
        </p>
      </div>

      {/* MODAL: Realtime Deposit Simulation */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 font-mono text-slate-100 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                <span>Simulasi Mutasi Masuk Deposit USDT</span>
              </div>
              <button
                onClick={() => setIsSimModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateDepositSubmit} className="space-y-4 text-xs">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Fitur ini mensimulasikan jaringan blockchain TRC20 yang mengirimkan transfer USDT masuk secara real-time ke dompet akun Anda untuk menguji pencatatan mutasi dan aktivasi member.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Pilih Nominal Deposit USDT:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 25, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimDepositAmount(val)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        simDepositAmount === val
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      ${val} USDT
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="number"
                    min={1}
                    value={simDepositAmount}
                    onChange={(e) => setSimDepositAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-3 text-emerald-300 font-bold text-sm focus:outline-none focus:border-emerald-400"
                    placeholder="Atau ketik nominal USDT custom..."
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Nominal Masuk:</span>
                  <strong className="text-emerald-400">${simDepositAmount.toFixed(2)} USDT</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Estimasi Rupiah:</span>
                  <strong className="text-cyan-300">
                    Rp {(simDepositAmount * exchangeRateUsdtToIdr).toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSimModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kirim Deposit Real-Time</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

