import Link from 'next/link'
import { DbUser } from './types'

interface HeaderProps {
  user: any
  dbUser: DbUser | null
  connectedWallet: string | null
  connectingWallet: boolean
  walletConnectError: string | null
  walletError: string | null
  onConnectWallet: () => void
}

function ExchangeIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20C12 14.4772 16.4772 10 22 10C24.3166 10 26.4411 10.7874 28.1428 12.1111" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M16 12L22 10L16 6" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 28C36 33.5228 31.5228 38 26 38C23.6834 38 21.5589 37.2126 19.8572 35.8889" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 36L26 38L32 42" stroke="#00FF00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="8" fill="#EC4899" />
      <text x="18" y="21.5" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">€</text>
      <circle cx="30" cy="30" r="8" fill="#FBBF24" />
      <text x="30" y="33.5" fill="black" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">$</text>
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="20" height="32" rx="3" fill="#FDE047" stroke="#374151" strokeWidth="2.5" />
      <line x1="18" y1="16" x2="30" y2="16" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="22" x2="30" y2="22" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="28" x2="30" y2="28" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="34" x2="26" y2="34" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(30, 12) rotate(15)">
        <path d="M0 0 L4 0 L4 18 L2 22 L0 18 Z" fill="#EC4899" stroke="#374151" strokeWidth="1.5" />
        <path d="M0 18 L2 22 L4 18 Z" fill="#F3F4F6" />
        <circle cx="2" cy="21" r="0.8" fill="black" />
      </g>
    </svg>
  )
}

export function Header({
  user,
  dbUser,
  connectedWallet,
  connectingWallet,
  walletConnectError,
  walletError,
  onConnectWallet,
}: HeaderProps) {
  const usernameText = (
    dbUser?.username ||
    user?.username ||
    dbUser?.first_name ||
    user?.first_name ||
    'username'
  ).toLowerCase()

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white/10 rounded-full flex-shrink-0 shadow-lg backdrop-blur-md border border-white/20">
            {user?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo_url} alt="Avatar" className="h-full w-full object-cover rounded-full" />
            ) : null}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-medium tracking-wide text-white leading-none">
              hello, {usernameText} !
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 bg-[#00FF00] rounded-full inline-block shadow-[0_0_8px_#00FF00]"></span>
              <span className="text-xs text-white">Online</span>
            </div>
          </div>
        </div>

        <Link
          href="/admin/catalog"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm transition-all active:scale-90 hover:bg-white/20"
        >
          ⚙️
        </Link>
      </header>

      {(walletConnectError || walletError) && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-sm text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          {walletConnectError || walletError}
        </div>
      )}

      <div className="mb-8">
        {connectedWallet ? (
          <div className="w-full bg-[#7F00FF]/80 backdrop-blur-md border border-[#7F00FF] py-3.5 px-6 rounded-full text-center text-white font-semibold tracking-wide shadow-[0_0_20px_rgba(127,0,255,0.4)] flex items-center justify-center gap-2">
            <span>TON Connected:</span>
            <span className="font-bold">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-6)}</span>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            disabled={connectingWallet}
            className="w-full bg-gradient-to-r from-[#7F00FF] to-[#b026ff] py-3.5 px-6 rounded-full text-center text-white font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_25px_rgba(176,38,255,0.6)] hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(127,0,255,0.3)] disabled:opacity-60 border border-white/10"
          >
            {connectingWallet ? 'Connecting...' : 'Connect TON'}
          </button>
        )}
      </div>

      <div className="flex items-start justify-around mb-8 max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <ExchangeIcon />
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center">Exchange</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-white">
              <span className="text-[9px] font-black text-black tracking-tighter">AV</span>
            </div>
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center max-w-[80px] leading-tight">
            Axiom Virtu Channel
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button className="flex items-center justify-center w-14 h-14 transition-transform active:scale-90 hover:brightness-110">
            <HistoryIcon />
          </button>
          <span className="text-[11px] text-white font-medium tracking-wide text-center">History</span>
        </div>
      </div>
    </>
  )
}
