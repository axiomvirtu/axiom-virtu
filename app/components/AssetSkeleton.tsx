import React from 'react';

export const AssetCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 relative overflow-hidden animate-pulse">
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-[shimmer_1.8s_infinite]" />

      {/* Card Header: Icon + Title + Theme Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-800 rounded-lg" />
            <div className="h-3 w-20 bg-slate-800/70 rounded-md" />
          </div>
        </div>
        <div className="h-5 w-20 bg-slate-800 rounded-full shrink-0" />
      </div>

      {/* Price & Daily Profit Metrics Bar */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-slate-800/80 rounded" />
          <div className="h-6 w-24 bg-slate-800 rounded-md" />
        </div>
        <div className="h-7 w-20 bg-slate-800/90 rounded-lg" />
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
          <div className="h-2.5 w-16 bg-slate-800/80 rounded" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
          <div className="h-2.5 w-16 bg-slate-800/80 rounded" />
          <div className="h-4 w-16 bg-slate-800 rounded" />
        </div>
      </div>

      {/* Seller Telegram Bar Skeleton */}
      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
          <div className="h-3 w-28 bg-slate-800 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-800/90 rounded-lg shrink-0" />
      </div>

      {/* Action Button Skeleton */}
      <div className="h-11 w-full bg-slate-800 rounded-xl" />
    </div>
  );
};

export const AssetGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <AssetCardSkeleton key={idx} />
      ))}
    </div>
  );
};
