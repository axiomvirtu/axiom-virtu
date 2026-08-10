import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trophy,
  Crown,
  Ticket,
  CheckCircle2,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Gift,
  Users,
  Zap,
} from 'lucide-react';
import { GiveawayPrize, UserProfile } from '../types';
import { PrizeLogo } from './PrizeLogo';

interface RaffleShuffleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWinnerCount: number;
  onCompleteDraw: (winnerCount: number) => void;
  participants: string[];
  prizes: GiveawayPrize[];
  allUsers: UserProfile[];
}

export const RaffleShuffleModal: React.FC<RaffleShuffleModalProps> = ({
  isOpen,
  onClose,
  targetWinnerCount,
  onCompleteDraw,
  participants,
  prizes,
  allUsers,
}) => {
  const [stage, setStage] = useState<'IDLE' | 'COUNTDOWN' | 'SHUFFLING' | 'REVEALING' | 'FINISHED'>('IDLE');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Ticker slot machine display states
  const [currentDisplayUser, setCurrentDisplayUser] = useState<string>('Mencari Pemenang...');
  const [currentDisplayTicket, setCurrentDisplayTicket] = useState<string>('#UNDIAN-0000');
  const [currentDisplayPrize, setCurrentDisplayPrize] = useState<string>('Grand Prize Axiom');

  // Drawn winners temporary result
  const [drawnWinners, setDrawnWinners] = useState<
    { name: string; phone: string; luckyNumber: string; prizeTitle: string; prizeBadge: string }[]
  >([]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStage('IDLE');
      setCountdownNum(3);
      setDrawnWinners([]);
    }
  }, [isOpen]);

  // Web Audio Synthesizer for mechanical slot sound effects
  const playTickSound = (frequency = 600, duration = 0.03) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors if blocked by browser policy
    }
  };

  const playFanfareSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    } catch {
      // Ignore
    }
  };

  // Start Shuffle Sequence
  const handleStartShuffle = () => {
    setStage('COUNTDOWN');
    setCountdownNum(3);

    playTickSound(800, 0.08);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        playTickSound(800 + (3 - count) * 200, 0.08);
      } else {
        clearInterval(timer);
        runShuffleEngine();
      }
    }, 900);
  };

  const runShuffleEngine = () => {
    setStage('SHUFFLING');

    // Build candidate names array
    const sampleNames =
      allUsers.length > 0
        ? allUsers.map((u) => u.name)
        : ['Budi Santoso', 'Siti Rahma', 'Andi Wijaya', 'Rudi Pratama', 'Dewi Lestari', 'Axiom Trader'];

    const prizesFlat: { title: string; badge: string }[] = [];
    prizes.forEach((p) => {
      for (let i = 0; i < p.quantity; i++) {
        prizesFlat.push({ title: p.title, badge: p.badgeText || 'PEMENANG' });
      }
    });

    let speedMs = 40; // Fast initial spin
    let elapsedMs = 0;
    const durationTotalMs = 4200;

    const shuffleInterval = setInterval(() => {
      elapsedMs += speedMs;

      // Random displays
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomTicket = `#UNDIAN-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomPrize =
        prizesFlat.length > 0
          ? prizesFlat[Math.floor(Math.random() * prizesFlat.length)].title
          : 'Saldo $10 USDT';

      setCurrentDisplayUser(randomName);
      setCurrentDisplayTicket(randomTicket);
      setCurrentDisplayPrize(randomPrize);

      playTickSound(400 + Math.random() * 300, 0.02);

      if (elapsedMs >= durationTotalMs) {
        clearInterval(shuffleInterval);

        // Compute actual winners
        const computedWinners: {
          name: string;
          phone: string;
          luckyNumber: string;
          prizeTitle: string;
          prizeBadge: string;
        }[] = [];

        // Pick distinct candidates
        const candidates = allUsers.length > 0 ? [...allUsers] : [];
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        const countToDraw = Math.min(targetWinnerCount, Math.max(candidates.length, 1));
        for (let k = 0; k < countToDraw; k++) {
          const u = candidates[k] || { name: `Pemenang #${k + 1}`, phone: '+62812****9000' };
          const p = prizesFlat[k] || { title: `Bonus Saldo $10 USDT`, badge: `PEMENANG #${k + 1}` };
          const maskedPhone = u.phone ? u.phone.replace(/(\+\d{4})\d+(\d{4})/, '$1****$2') : '+62812****9000';
          computedWinners.push({
            name: u.name,
            phone: maskedPhone,
            luckyNumber: `#LUCKY-${Math.floor(1000 + Math.random() * 9000)}`,
            prizeTitle: p.title,
            prizeBadge: p.badge,
          });
        }

        setDrawnWinners(computedWinners);
        setStage('REVEALING');
        playFanfareSound();
      }
    }, speedMs);
  };

  const handleCommitDraw = () => {
    onCompleteDraw(targetWinnerCount);
    setStage('FINISHED');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-fuchsia-500/60 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl shadow-fuchsia-600/30 space-y-5 relative overflow-hidden text-slate-100">
        {/* Background glow pulse */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
                <span>Pengocokan Undian Live</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <div className="text-[10px] text-slate-400">
                Kuis &amp; Pengundian Pemenang Otomatis Realtime
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={soundEnabled ? 'Mute Efek Suara' : 'Aktifkan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {stage !== 'SHUFFLING' && stage !== 'COUNTDOWN' && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition flex items-center justify-center text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* STAGE 1: IDLE PREPARATION */}
        {stage === 'IDLE' && (
          <div className="space-y-4 text-center py-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold">
                <Gift className="w-4 h-4 text-amber-300" />
                <span>Siap Diundi Untuk {targetWinnerCount} Pemenang</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Total Tiket Peserta:</span>
                  </div>
                  <div className="text-base font-black text-cyan-300 mt-0.5">
                    {participants.length} Tiket
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stok Item Hadiah:</span>
                  </div>
                  <div className="text-base font-black text-amber-300 mt-0.5">
                    {prizes.length} List Item
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartShuffle}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:brightness-110 text-white font-black text-sm uppercase tracking-wider transition shadow-xl shadow-fuchsia-600/40 flex items-center justify-center gap-2.5 animate-pulse"
            >
              <Play className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>🎰 MULAI PENGOCOKAN UNDIAN LIVE NOW</span>
            </button>
          </div>
        )}

        {/* STAGE 2: COUNTDOWN */}
        {stage === 'COUNTDOWN' && (
          <div className="py-12 text-center space-y-3">
            <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest animate-bounce">
              MEMERIKSA DOKUMEN TIKET &amp; MEMULAI ENGINE...
            </div>
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300 animate-ping">
              {countdownNum}
            </div>
            <div className="text-[10px] text-slate-400">
              Mesin slot pengocokan akan berputar otomatis...
            </div>
          </div>
        )}

        {/* STAGE 3: SHUFFLING SLOT TICKER */}
        {stage === 'SHUFFLING' && (
          <div className="py-6 space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>SLOT MESIN BERPUTAR - SHUFFLING PARTICIPANTS</span>
            </div>

            {/* Simulated Slot Reel Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-fuchsia-500 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-pulse" />

              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                CANDIDATE ENTRY TIKET:
              </div>

              <div className="text-2xl font-black text-cyan-300 font-mono tracking-wider animate-pulse">
                {currentDisplayTicket}
              </div>

              <div className="text-lg font-black text-slate-100 truncate">
                {currentDisplayUser}
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-amber-300 font-bold flex items-center justify-center gap-2">
                <PrizeLogo
                  title={currentDisplayPrize}
                  category={currentDisplayPrize.toLowerCase().includes('usdt') ? 'USDT' : currentDisplayPrize.toLowerCase().includes('tiket') ? 'TICKET' : 'GADGET'}
                  size="sm"
                />
                <span>{currentDisplayPrize}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400">
              Sedang mengacak nomor keberuntungan peserta...
            </div>
          </div>
        )}

        {/* STAGE 4: REVEALING & WINNER RESULTS */}
        {stage === 'REVEALING' && (
          <div className="space-y-4 text-center py-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-400/50 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>PENGOKAN SELESAI! PEMENANG RESMI TERPILIH</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Berikut adalah hasil pengocokan resmi untuk {drawnWinners.length} orang pemenang:
              </p>
            </div>

            {/* List of winners */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-left text-xs">
              {drawnWinners.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-400/40 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/40 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5 truncate">
                        <span>{w.name}</span>
                        <span className="text-cyan-300 font-mono text-[10px]">({w.luckyNumber})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{w.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <PrizeLogo
                      title={w.prizeTitle}
                      category={w.prizeTitle.toLowerCase().includes('usdt') ? 'USDT' : w.prizeTitle.toLowerCase().includes('tiket') ? 'TICKET' : 'GADGET'}
                      size="sm"
                    />
                    <div>
                      <div className="font-bold text-emerald-300 text-xs">{w.prizeTitle}</div>
                      <div className="text-[9px] text-amber-300 font-bold font-mono">{w.prizeBadge}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartShuffle}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kocok Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleCommitDraw}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>💾 Commit &amp; Publikasikan Hasil Ke App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
