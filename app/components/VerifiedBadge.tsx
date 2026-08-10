import React from 'react';
import { BadgeCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  text?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showText = true,
  className = '',
  text = 'Terverifikasi',
}) => {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-bold font-mono rounded-full bg-gradient-to-r from-blue-600/25 via-cyan-600/20 to-blue-500/25 border border-blue-400/60 text-blue-300 shadow-sm shadow-blue-500/20 backdrop-blur-sm whitespace-nowrap animate-fade-in ${sizeClasses[size]} ${className}`}
      title="Akun Terverifikasi via Pembelian Tiket (Axiom Verified)"
    >
      <BadgeCheck className={`${iconSizes[size]} text-blue-400 fill-blue-500/30 shrink-0 animate-pulse`} />
      {showText && <span className="tracking-tight uppercase font-extrabold text-blue-200">{text}</span>}
    </span>
  );
};

export const UnverifiedBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}> = ({ size = 'md', onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center font-bold font-mono rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-300 hover:bg-amber-500/25 transition cursor-pointer whitespace-nowrap ${sizeClasses[size]} ${className}`}
      title="Klik untuk membeli tiket & memverifikasi akun"
    >
      <ShieldCheck className={`${iconSizes[size]} text-amber-400 shrink-0 animate-pulse`} />
      <span className="tracking-tight uppercase font-extrabold text-amber-300">Belum Verified</span>
    </button>
  );
};
