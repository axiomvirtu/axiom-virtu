import React, { useState } from 'react';
import {
  X,
  LifeBuoy,
  ShieldAlert,
  Bug,
  RefreshCw,
  Ticket as TicketIcon,
  HelpCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Send,
  UserX,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '../types';

export const SupportTicketModal: React.FC = () => {
  const {
    currentUser,
    isSupportModalOpen,
    setIsSupportModalOpen,
    supportTickets,
    createSupportTicket,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Form State
  const [category, setCategory] = useState<SupportTicketCategory>('LAPOR_KECURANGAN');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [reportedUser, setReportedUser] = useState('');
  const [priority, setPriority] = useState<SupportTicketPriority>('MEDIUM');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter State for List
  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportTicketStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSupportModalOpen) return null;

  const myTickets = supportTickets.filter((t) => t.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Mohon isi subjek dan detail pengaduan dengan lengkap.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      createSupportTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        reportedUser: category === 'LAPOR_KECURANGAN' ? reportedUser.trim() : undefined,
        priority,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });

      setIsSubmitting(false);
      setSuccessMessage('Tiket pengaduan Anda telah berhasil dikirim ke Tim Support & Admin!');
      setSubject('');
      setDescription('');
      setReportedUser('');
      setAttachmentUrl('');

      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('list');
      }, 1500);
    }, 600);
  };

  const getCategoryMeta = (cat: SupportTicketCategory) => {
    switch (cat) {
      case 'LAPOR_KECURANGAN':
        return {
          label: 'Lapor User Curang',
          icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
          badgeStyle: 'bg-red-500/10 text-red-400 border-red-500/30',
        };
      case 'BUG_SYSTEM':
        return {
          label: 'Bug / Error Sistem',
          icon: <Bug className="w-4 h-4 text-amber-400" />,
          badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'KENDALA_EXCHANGE':
        return {
          label: 'Kendala Exchange IDR/USDT',
          icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
          badgeStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'KENDALA_TOPUP':
        return {
          label: 'Kendala Top Up & Tiket',
          icon: <TicketIcon className="w-4 h-4 text-fuchsia-400" />,
          badgeStyle: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
        };
      case 'MASALAH_LAIN':
      default:
        return {
          label: 'Masalah Lainnya',
          icon: <HelpCircle className="w-4 h-4 text-indigo-400" />,
          badgeStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        };
    }
  };

  const getStatusBadge = (st: SupportTicketStatus) => {
    switch (st) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Menunggu Admin
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Sedang Diproses
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Selesai / Teratasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Ditolak / Laporan Gugur
          </span>
        );
    }
  };

  const filteredTickets = myTickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">Pusat Pengaduan &amp; Tiket Support</h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  24/7 HELPDESK
                </span>
              </div>
              <p className="text-xs text-slate-400">Layanan pengaduan kecurangan user, bug, kendala top up &amp; exchange</p>
            </div>
          </div>

          <button
            onClick={() => setIsSupportModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-slate-900 border-indigo-500/40 text-indigo-400 shadow-lg'
                  : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-slate-900 border-indigo-500/40 text-indigo-400 shadow-lg'
                  : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Riwayat Tiket saya</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                {myTickets.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Kategori Pengaduan *</span>
                  <span className="text-[10px] text-slate-500">Pilih jenis kendala yang Anda alami</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'LAPOR_KECURANGAN',
                      title: 'Lapor User Curang',
                      desc: 'Multi-akun, bot lelang, penipuan transfer',
                      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
                      border: 'hover:border-red-500/50',
                    },
                    {
                      id: 'BUG_SYSTEM',
                      title: 'Bug / Error Sistem',
                      desc: 'Masalah tampilan, tombol, atau fungsi app',
                      icon: <Bug className="w-4 h-4 text-amber-400" />,
                      border: 'hover:border-amber-500/50',
                    },
                    {
                      id: 'KENDALA_EXCHANGE',
                      title: 'Kendala Exchange',
                      desc: 'Penukaran USDT <-> IDR Bank belum cair',
                      icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
                      border: 'hover:border-cyan-500/50',
                    },
                    {
                      id: 'KENDALA_TOPUP',
                      title: 'Top Up & Tiket',
                      desc: 'Pembelian tiket atau deposit belum masuk',
                      icon: <TicketIcon className="w-4 h-4 text-fuchsia-400" />,
                      border: 'hover:border-fuchsia-500/50',
                    },
                    {
                      id: 'MASALAH_LAIN',
                      title: 'Masalah Lainnya',
                      desc: 'Pertanyaan umum, akun, atau panduan',
                      icon: <HelpCircle className="w-4 h-4 text-indigo-400" />,
                      border: 'hover:border-indigo-500/50',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as SupportTicketCategory)}
                      className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                        category === item.id
                          ? 'bg-indigo-950/60 border-indigo-500 text-slate-100 shadow-md ring-1 ring-indigo-500/50'
                          : `bg-slate-950 border-slate-800 text-slate-400 ${item.border}`
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-200">{item.title}</div>
                        <div className="text-[10px] text-slate-400 pt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reported User Field (If LAPOR_KECURANGAN) */}
              {category === 'LAPOR_KECURANGAN' && (
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2">
                  <label className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-red-400" />
                    <span>User Yang Dilaporkan / Terindikasi Curang *</span>
                  </label>
                  <input
                    type="text"
                    value={reportedUser}
                    onChange={(e) => setReportedUser(e.target.value)}
                    placeholder="Masukkan Nama, Akun Telegram, atau ID User yang melanggar..."
                    className="w-full px-3 py-2 bg-slate-950 border border-red-500/40 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-400"
                  />
                  <p className="text-[10px] text-red-300/80">
                    Sistem akan melacak log transaksi, alamat IP, dan ID perangkat user tersebut untuk proses tindakan sanksi banned permanen.
                  </p>
                </div>
              )}

              {/* Priority Select & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tingkat Urgensi</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Rendah (Pertanyaan Umum)</option>
                    <option value="MEDIUM">Sedang (Kendala Standar)</option>
                    <option value="HIGH">Tinggi (Top Up / Exchange)</option>
                    <option value="URGENT">Sangat Mendesak (Kecurangan / Fraud)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Subjek / Judul Pengaduan *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Transfer Bank BCA Rp 100rb belum masuk ke wallet..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Detail Masalah &amp; Kronologi Kejadian *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan secara rinci kronologi kejadian, waktu transaksi, id transaksi, atau bukti pendukung lainnya agar admin dapat memproses dengan cepat..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Attachment URL / Proof */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Link Bukti Transaksi / Tangkapan Layar (Opsional)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Imgur, Google Drive, atau URL Gambar</span>
                </label>
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://i.imgur.com/example.png atau ID referensi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Action Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengirim Tiket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Tiket Pengaduan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Tab Riwayat Tiket Saya */
            <div className="space-y-3">
              {/* Filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari ID tiket, subjek..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold no-scrollbar">
                  {[
                    { id: 'ALL', label: 'Semua' },
                    { id: 'OPEN', label: 'Menunggu' },
                    { id: 'IN_PROGRESS', label: 'Diproses' },
                    { id: 'RESOLVED', label: 'Selesai' },
                    { id: 'REJECTED', label: 'Ditolak' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id as any)}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                        statusFilter === st.id
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-extrabold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets Feed */}
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 space-y-2">
                  <LifeBuoy className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                  <p className="text-xs">Belum ada tiket pengaduan yang cocok dengan filter.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="text-xs font-bold text-indigo-400 hover:underline inline-block pt-1"
                  >
                    + Buat Tiket Pengaduan Baru
                  </button>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const meta = getCategoryMeta(ticket.category);
                  const dateStr = new Date(ticket.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-cyan-400">#{ticket.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeStyle}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">{ticket.subject}</h4>
                        {ticket.reportedUser && (
                          <div className="mt-1 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 font-semibold flex items-center gap-1.5">
                            <UserX className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>User dilaporkan: {ticket.reportedUser}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                          {ticket.description}
                        </p>
                      </div>

                      {ticket.attachmentUrl && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                          <span>Bukti lampiran:</span>
                          <a
                            href={ticket.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline font-mono truncate max-w-[200px]"
                          >
                            {ticket.attachmentUrl}
                          </a>
                        </div>
                      )}

                      {/* Admin Response Box */}
                      {ticket.adminReply && (
                        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 mt-2">
                          <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold border-b border-indigo-500/20 pb-1">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Tanggapan Resmi Admin Axiom Support:
                            </span>
                            {ticket.resolvedAt && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(ticket.resolvedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
