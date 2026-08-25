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
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 ${
          size === 'sm'
            ? 'text-xs px-2 py-0.5'
            : size === 'lg'
            ? 'text-sm px-3 py-1'
            : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-700' : 'w-3.5 h-3.5 text-emerald-700'} />
        <span>Claimed Owner</span>
      </span>
    );
  }

  if (type === 'unclaimed') {
    return (
      <span
        id="unclaimed-badge"
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#381E15]/15 text-[#652516] border border-[#7C2D12]/30 ${
          size === 'sm'
            ? 'text-xs px-2 py-0.5'
            : size === 'lg'
            ? 'text-sm px-3 py-1'
            : 'text-xs px-2 py-0.5'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A3412] animate-pulse" />
        <span>Unclaimed</span>
      </span>
    );
  }

  return (
    <span
      id="verified-badge"
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-sky-50 text-sky-900 border border-sky-300 ${
        size === 'sm'
          ? 'text-xs px-2 py-0.5'
          : size === 'lg'
          ? 'text-sm px-3 py-1'
          : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-sky-600' : 'w-3.5 h-3.5 text-sky-600'} />
      <span>Verified</span>
    </span>
  );
};
