import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: 'rating' | 'reviews' | 'name' | 'verified';
  onChange: (val: 'rating' | 'reviews' | 'name' | 'verified') => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1 hidden sm:flex">
        <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
      </span>
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value as any)}
        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="rating">Highest Rated</option>
        <option value="reviews">Most Reviewed</option>
        <option value="verified">Verified First</option>
        <option value="name">Alphabetical (A-Z)</option>
      </select>
    </div>
  );
};
