import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'verified' | 'claimed' | 'unclaimed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'verified',
  size = 'md',
  className = '',
}) => {
  if (type === 'claimed') {
    return (
      <span
        id="claimed-badge"
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#630303]/10 text-[#630303] border border-[#630303]/40 shadow-2xs backdrop-blur-xs ${
          size === 'sm'
            ? 'text-[11px] px-2 py-0.5'
            : size === 'lg'
            ? 'text-sm px-3.5 py-1'
            : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-[#630303]' : 'w-4 h-4 text-[#630303]'} />
        <span>Verified Claimed</span>
      </span>
    );
  }

  if (type === 'unclaimed') {
    return (
      <span
        id="unclaimed-badge"
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-stone-100 text-stone-600 border border-stone-300 ${
          size === 'sm'
            ? 'text-[11px] px-2 py-0.5'
            : size === 'lg'
            ? 'text-sm px-3 py-1'
            : 'text-xs px-2 py-0.5'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        <span>Unclaimed</span>
      </span>
    );
  }

  return (
    <span
      id="verified-badge"
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#630303]/10 text-[#630303] border border-[#630303]/30 ${
        size === 'sm'
          ? 'text-[11px] px-2 py-0.5'
          : size === 'lg'
          ? 'text-sm px-3 py-1'
          : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5 text-[#630303]' : 'w-4 h-4 text-[#630303]'} />
      <span>Verified</span>
    </span>
  );
};
