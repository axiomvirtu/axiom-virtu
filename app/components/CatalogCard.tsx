import { AssetCatalogRow } from './types'

interface CatalogCardProps {
  item: AssetCatalogRow
  onBuy: (item: AssetCatalogRow) => void
  categoryName: string
}

function CategoryIcon({ categoryName, className = "w-16 h-16" }: { categoryName: string, className?: string }) {
  // Return different SVG icons based on category
  const cat = categoryName.toLowerCase()
  if (cat.includes('nova')) {
    // Crown / Star
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  }
  if (cat.includes('chrono')) {
    // Clock / Time
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  if (cat.includes('aether') || cat.includes('pulse')) {
    // Pulse / Wave
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  }
  if (cat.includes('core') || cat.includes('axiom')) {
    // Core / Atom
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    )
  }
  
  // Default Virtu Spark / Lightning
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

export function CatalogCard({ item, onBuy, categoryName }: CatalogCardProps) {
  if (!item.is_multi) {
    // Layout Kartu Tunggal (Single Card)
    return (
      <div className="flex flex-col items-center mb-10 w-full relative group">
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 bg-[#7F00FF] opacity-10 blur-3xl rounded-full pointer-events-none transition-opacity group-hover:opacity-30"></div>

        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transform transition-all duration-300 group-hover:scale-[1.02] group-hover:border-[#7F00FF]/50 group-hover:shadow-[0_15px_40px_rgba(127,0,255,0.2)] flex flex-col items-center relative overflow-hidden">
          {/* subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
          
          <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#7F00FF]/20 to-[#b026ff]/20 rounded-2xl flex items-center justify-center border border-[#7F00FF]/30 shadow-[inset_0_0_20px_rgba(127,0,255,0.2)]">
            <CategoryIcon categoryName={categoryName} className="w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>

          <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#e0b3ff] mb-6 uppercase text-center drop-shadow-[0_0_10px_rgba(176,38,255,0.3)]">
            {item.name}
          </h2>

          <ul className="text-white/80 text-[13px] font-medium leading-relaxed tracking-wide space-y-3 pl-6 list-none mb-8 w-full max-w-sm">
            <li className="relative">
              <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-cyan-300 mr-2 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">Start Capital:</span> 
              <span className="text-white">Min: {item.capital_min} - Max: {item.capital_max} TON</span>
            </li>
            <li className="relative">
              <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-cyan-300 mr-2 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">Ticket Purchase:</span> 
              <span className="text-white">{item.ticket_time_start} - {item.ticket_time_end} (UTC+7)</span>
            </li>
            <li className="relative">
              <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-cyan-300 mr-2 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">Asset Trading:</span> 
              <span className="text-white">{item.trading_time_start} - {item.trading_time_end} (UTC+7)</span>
            </li>
            <li className="relative">
              <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-cyan-300 mr-2 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">Contract Asset:</span> 
              <span className="text-white">{item.contract_asset}</span>
            </li>
            <li className="relative">
              <span className="absolute -left-5 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-cyan-300 mr-2 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">Profit:</span> 
              <span className="text-green-400 font-bold">{item.profit}</span>
            </li>
          </ul>

          <button onClick={() => onBuy(item)} className="bg-gradient-to-r from-[#7F00FF] to-[#b026ff] text-white font-bold tracking-widest text-sm uppercase px-12 py-3.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(176,38,255,0.6)] hover:shadow-[0_0_25px_rgba(176,38,255,0.9)] border border-white/20">
            BUY TICKET NOW
          </button>
        </div>
      </div>
    )
  }

  // Layout Kartu Ganda Bertumpuk (Multi Card)
  return (
    <div className="flex gap-5 items-center w-full bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group transition-all hover:border-[#7F00FF]/40 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(127,0,255,0.15)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      {/* Icon Placeholder instead of empty square */}
      <div className="w-24 h-24 bg-gradient-to-br from-[#7F00FF]/20 to-[#b026ff]/20 border border-[#7F00FF]/40 rounded-[20px] flex-shrink-0 flex items-center justify-center shadow-[inset_0_0_15px_rgba(176,38,255,0.2)] relative z-10 transition-transform group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(176,38,255,0.4)]">
        <CategoryIcon categoryName={categoryName} className="w-12 h-12 text-[#e0b3ff] drop-shadow-[0_0_5px_rgba(224,179,255,0.8)]" />
      </div>
      
      <div className="flex flex-col flex-grow min-w-0 relative z-10">
        <h3 className="text-base font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 mb-2.5 uppercase drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
          {item.name}
        </h3>
        
        <ul className="text-white/70 text-[11px] font-medium leading-relaxed space-y-1.5 pl-3 list-none mb-3.5">
          <li className="relative">
            <span className="absolute -left-3 top-1 w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">Capital:</span> <span className="text-white">Min: {item.capital_min} - Max: {item.capital_max} TON</span>
          </li>
          <li className="relative">
            <span className="absolute -left-3 top-1 w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">Purchase:</span> <span className="text-white">{item.ticket_time_start} - {item.ticket_time_end}</span>
          </li>
          <li className="relative">
            <span className="absolute -left-3 top-1 w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">Trading:</span> <span className="text-white">{item.trading_time_start} - {item.trading_time_end}</span>
          </li>
          <li className="relative">
            <span className="absolute -left-3 top-1 w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">Contract:</span> <span className="text-white">{item.contract_asset}</span>
          </li>
          <li className="relative">
            <span className="absolute -left-3 top-1 w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">Profit:</span> <span className="text-green-400 font-bold">{item.profit}</span>
          </li>
        </ul>
        
        <div>
          <button onClick={() => onBuy(item)} className="bg-gradient-to-r from-[#7F00FF] to-[#b026ff] text-white font-bold tracking-widest text-[10px] uppercase px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_0_10px_rgba(176,38,255,0.5)] hover:shadow-[0_0_15px_rgba(176,38,255,0.8)] border border-white/20">
            BUY TICKET
          </button>
        </div>
      </div>
    </div>
  )
}
