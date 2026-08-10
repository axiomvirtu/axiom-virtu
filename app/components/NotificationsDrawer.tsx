import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  CheckCheck,
  Sparkles,
  Clock,
  DollarSign,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const NotificationsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationAsRead, clearNotifications } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-950/80 p-4 space-y-3 font-mono text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Notifikasi Real-Time
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearNotifications}
              className="text-[10px] text-slate-400 hover:text-cyan-400 font-bold"
            >
              Hapus Semua
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">Belum ada notifikasi.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-xl border text-xs space-y-1 transition cursor-pointer ${
                  notif.read
                    ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                    : 'bg-slate-950 border-cyan-500/40 text-slate-100 shadow-md shadow-cyan-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    {notif.type === 'WIN' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    {notif.type === 'BAN' && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                    {notif.type === 'EXCHANGE' && <DollarSign className="w-3.5 h-3.5 text-fuchsia-400" />}
                    {notif.title}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-snug">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
