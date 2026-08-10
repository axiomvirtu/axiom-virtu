import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  ShieldAlert,
  Flame,
  Info,
  Clock,
  ExternalLink,
  PhoneCall,
  XCircle,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements } = useApp();
  const [subTab, setSubTab] = useState<'ALL' | 'NEWS' | 'BANNED' | 'BURN'>('ALL');

  const filteredAnnouncements = announcements.filter((a) => {
    if (subTab === 'ALL') return true;
    return a.type === subTab;
  });

  return (
    <div className="space-y-4 font-mono pb-20">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar scrollbar-none touch-pan-x">
        <button
          onClick={() => setSubTab('ALL')}
          className={`px-3 py-2 rounded-xl font-bold border transition ${
            subTab === 'ALL'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Semua Pengumuman ({announcements.length})
        </button>

        <button
          onClick={() => setSubTab('NEWS')}
          className={`px-3 py-2 rounded-xl font-bold border flex items-center gap-1.5 transition ${
            subTab === 'NEWS'
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Informasi Terkini</span>
        </button>

        <button
          onClick={() => setSubTab('BANNED')}
          className={`px-3 py-2 rounded-xl font-bold border flex items-center gap-1.5 transition ${
            subTab === 'BANNED'
              ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
          <span>Akun Dibanned</span>
        </button>

        <button
          onClick={() => setSubTab('BURN')}
          className={`px-3 py-2 rounded-xl font-bold border flex items-center gap-1.5 transition ${
            subTab === 'BURN'
              ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span>Aset Burned Admin</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            Belum ada pengumuman dalam kategori ini.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl bg-slate-900 border space-y-2 transition ${
                ann.type === 'BANNED'
                  ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-950/30'
                  : ann.type === 'BURN'
                  ? 'border-fuchsia-500/50 bg-fuchsia-950/20 shadow-lg shadow-fuchsia-950/30'
                  : 'border-cyan-500/30 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ann.type === 'BANNED'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : ann.type === 'BURN'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {ann.type === 'BANNED' && <XCircle className="w-3 h-3 text-red-400" />}
                  {ann.type === 'BURN' && <Flame className="w-3 h-3 text-amber-300" />}
                  {ann.type === 'NEWS' && <Info className="w-3 h-3 text-cyan-400" />}
                  {ann.type}
                </span>

                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(ann.timestamp).toLocaleString('id-ID')}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100">{ann.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{ann.content}</p>

              {ann.bannedUserPhone && (
                <div className="pt-2 border-t border-red-500/20 text-[11px] text-red-300 flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Nomor Terblokir Permanen: <strong>{ann.bannedUserPhone}</strong></span>
                </div>
              )}

              {ann.burnedAssetAmount && (
                <div className="pt-2 border-t border-fuchsia-500/20 text-[11px] text-fuchsia-300 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jumlah Aset Di-Burn oleh Admin: <strong>{ann.burnedAssetAmount} Unit</strong></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
