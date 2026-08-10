import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Lock,
} from 'lucide-react';

export const CommunityChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, currentUser } = useApp();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-4 font-mono pb-20 flex flex-col h-[calc(100vh-180px)]">
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/80 border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
              Kolom Chat Komunitas Trader Axiom
            </h3>
            <p className="text-[10px] text-slate-400">Ruang Diskusi Pasar & Transaksi P2P</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          E2E
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono">
        {chatMessages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">Belum ada pesan komunitas.</div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-200">{msg.senderName}</span>
                  {msg.senderRole === 'admin' ? (
                    <span className="px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-bold">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-mono">WA: {msg.senderPhone}</span>
                  )}
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isMe
                      ? 'bg-cyan-600 text-slate-950 rounded-tr-none font-medium shadow-md shadow-cyan-600/20'
                      : msg.senderRole === 'admin'
                      ? 'bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-200 rounded-tl-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan ke komunitas trader..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
