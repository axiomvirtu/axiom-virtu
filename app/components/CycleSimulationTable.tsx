import React, { useState } from 'react';
import { generate15CycleSimulation } from '../utils/cycleSimulation';
import { TrendingUp, RefreshCw, Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CycleSimulationTableProps {
  startPrice: number;
  profitPercent: number;
  minPrice?: number;
  maxPrice?: number;
  maxPriceAction?: 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER';
  nextTierName?: string;
  compact?: boolean;
}

export const CycleSimulationTable: React.FC<CycleSimulationTableProps> = ({
  startPrice,
  profitPercent,
  minPrice,
  maxPrice,
  maxPriceAction = 'SPLIT_SAME_TIER',
  nextTierName,
  compact = false,
}) => {
  const [showRules, setShowRules] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const simulation = generate15CycleSimulation(
    startPrice,
    profitPercent,
    minPrice,
    maxPrice,
    maxPriceAction as 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER',
    nextTierName
  );

  return (
    <div className="space-y-2 font-sans text-xs">
      {/* Top Bar Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Min:</span>
          <span className="font-bold text-cyan-300">${simulation.minPrice.toFixed(2)}</span>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950 border border-rose-500/40 flex items-center justify-between">
          <span className="text-slate-400">Max (15x):</span>
          <span className="font-bold text-rose-400">${simulation.maxPrice.toFixed(2)}</span>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950 border border-amber-500/50 flex items-center justify-between">
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
            Mid:
          </span>
          <span className="font-bold text-amber-300">${simulation.midpointPrice.toFixed(2)}</span>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
          <span className="text-slate-400">Profit:</span>
          <span className="font-bold text-emerald-400">+{profitPercent}%</span>
        </div>
      </div>

      {/* Toggle Controls Header */}
      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition"
        >
          <Info className="w-3 h-3 text-amber-400" />
          <span>{showRules ? 'Sembunyikan Aturan' : 'Aturan Repo & Presisi USDT (0.01)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer transition px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30"
        >
          <span>{isExpanded ? 'Tutup Tabel' : 'Buka Tabel (15 Cycles)'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsible Info Alert Box */}
      {showRules && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/30 text-[10px] leading-relaxed text-slate-200 space-y-1 animate-fadeIn">
          <div className="font-bold text-amber-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Aturan Perhitungan 15x Perputaran & Split Stok Auto-Repo:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono">
            <li>
              <strong>Presisi USDT:</strong> Pembulatan otomatis ke <strong>0.01 USDT</strong> (misal $5.876 -&gt; <strong>$5.88</strong>).
            </li>
            <li>
              <strong>Aturan Max Price:</strong>{' '}
              {maxPriceAction === 'UPGRADE_NEXT_TIER' ? (
                <span>
                  Menyentuh <strong>Max Price (${simulation.maxPrice.toFixed(2)})</strong> -&gt; <strong>NAIK KE TIER SELANJUTNYA</strong> ({nextTierName || 'Next Tier'}).
                </span>
              ) : (
                <span>
                  Menyentuh <strong>Max Price (${simulation.maxPrice.toFixed(2)})</strong> -&gt; stok terbagi 2 unit &amp; reset ke Harga Tengah (${simulation.midpointPrice.toFixed(2)}).
                </span>
              )}
            </li>
            <li>
              <strong>Wallet Penjual Tetap:</strong> Hak milik &amp; Wallet Penjual TIDAK BERUBAH.
            </li>
          </ul>
        </div>
      )}

      {/* Collapsible Compact Table */}
      {isExpanded && (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 max-h-44 overflow-y-auto font-mono text-[10px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-300 font-bold">
              <tr>
                <th className="py-1 px-1.5 text-center">Cycle</th>
                <th className="py-1 px-1.5">Harga Beli</th>
                <th className="py-1 px-1.5">Profit (+{profitPercent}%)</th>
                <th className="py-1 px-1.5">Harga Jual</th>
                <th className="py-1 px-1.5 text-center">Stok</th>
                <th className="py-1 px-1.5">Status Repo / Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {simulation.rows.map((row) => (
                <tr
                  key={row.cycle}
                  className={
                    row.isMaxPriceSplitTrigger
                      ? 'bg-amber-950/50 font-bold border-l-2 border-l-amber-500'
                      : 'hover:bg-slate-900/50'
                  }
                >
                  <td className="py-1 px-1.5 text-center font-bold text-cyan-400">#{row.cycle}</td>
                  <td className="py-1 px-1.5 text-slate-200">${row.startPriceUsdt.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-emerald-400">+${row.profitUsdt.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-cyan-300 font-bold">${row.roundedResalePrice.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-center font-bold text-amber-300">{row.stockCount} Unit</td>
                  <td className="py-1 px-1.5">
                    {row.isMaxPriceSplitTrigger ? (
                      maxPriceAction === 'UPGRADE_NEXT_TIER' ? (
                        <span className="text-fuchsia-300 font-extrabold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-fuchsia-400 animate-pulse" />
                          <span>🚀 MAX PRICE! NAIK KE TIER SELANJUTNYA ({nextTierName || 'Next Tier'})</span>
                        </span>
                      ) : (
                        <span className="text-amber-300 font-extrabold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>⚡ MAX PRICE! SPLIT 2 STOK & RESET MIDPOINT (${simulation.midpointPrice.toFixed(2)})</span>
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">✓ Normal Trade</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

