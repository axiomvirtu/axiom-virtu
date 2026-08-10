import React from 'react';
import { Gift, Smartphone } from 'lucide-react';

interface PrizeLogoProps {
  category?: string;
  title?: string;
  imageUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Clean Official Tether (USDT) Vector Logo
const UsdtSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg className={`${className} filter drop-shadow-[0_0_8px_rgba(38,161,123,0.5)]`} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="#26A17B"/>
    <path d="M117.8 71.3V56H82.2V71.3H50V90H70.8C73.2 108.6 85.3 122.8 100 122.8C114.7 122.8 126.8 108.6 129.2 90H150V71.3H117.8ZM100 114.3C88.8 114.3 79.5 103.8 77.2 90H122.8C120.5 103.8 111.2 114.3 100 114.3ZM129.2 81.3H70.8C70.3 78.1 70 74.7 70 71.3H130C130 74.7 129.7 78.1 129.2 81.3Z" fill="white"/>
    <rect x="91.5" y="90" width="17" height="55" fill="white"/>
  </svg>
);

// Clean Golden VIP Ticket Vector Logo
const TicketSvgIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg className={`${className} filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]`} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="45" width="170" height="110" rx="16" fill="url(#ticketGrad)" stroke="#FBBF24" strokeWidth="5"/>
    <circle cx="15" cy="100" r="16" fill="#020617"/>
    <circle cx="185" cy="100" r="16" fill="#020617"/>
    <line x1="65" y1="45" x2="65" y2="155" stroke="#FBBF24" strokeWidth="4" strokeDasharray="8 8"/>
    <path d="M95 80H155M95 100H160M95 120H140" stroke="#FEF08A" strokeWidth="7" strokeLinecap="round"/>
    <defs>
      <linearGradient id="ticketGrad" x1="15" y1="45" x2="185" y2="155" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#B45309"/>
      </linearGradient>
    </defs>
  </svg>
);

export const PrizeLogo: React.FC<PrizeLogoProps> = ({
  category = '',
  title = '',
  imageUrl = '',
  className = '',
  size = 'md',
}) => {
  const upperCat = category.toUpperCase();
  const lowerTitle = title.toLowerCase();

  const isUsdt = upperCat === 'USDT' || lowerTitle.includes('usdt');
  const isTicket = upperCat === 'TICKET' || lowerTitle.includes('tiket') || lowerTitle.includes('ticket');

  const sizeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconDimension = sizeDimensions[size] || sizeDimensions.md;

  // 1. USDT Logo (Transparent background, pure Tether logo)
  if (isUsdt) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${iconDimension} ${className}`} title="Saldo USDT Official">
        <UsdtSvgIcon className="w-full h-full object-contain" />
      </div>
    );
  }

  // 2. Ticket Logo (Transparent background, pure Ticket logo)
  if (isTicket) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${iconDimension} ${className}`} title="Tiket Undian Official">
        <TicketSvgIcon className="w-full h-full object-contain" />
      </div>
    );
  }

  // 3. Other Goods / Gadgets Image or Photo (Clean image without dark background container)
  if (imageUrl && imageUrl.trim()) {
    return (
      <div className={`flex items-center justify-center shrink-0 overflow-hidden rounded-xl ${iconDimension} ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 4. Default Gadget / Gift Icon (Clean icon without dark background container)
  return (
    <div className={`flex items-center justify-center shrink-0 ${iconDimension} ${className}`}>
      {upperCat === 'GADGET' ? (
        <Smartphone className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
      ) : (
        <Gift className="w-full h-full text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
      )}
    </div>
  );
};

