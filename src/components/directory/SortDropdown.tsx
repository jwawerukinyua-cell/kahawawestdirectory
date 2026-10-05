import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: 'rating' | 'reviews' | 'name' | 'verified';
  onChange: (val: 'rating' | 'reviews' | 'name' | 'verified') => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="directory-sort-select" className="text-xs text-slate-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
        <span className="hidden sm:inline">Sort:</span>
      </label>
      <select
        id="directory-sort-select"
        aria-label="Sort directory listings"
        value={sortBy}
        onChange={(e) => onChange(e.target.value as any)}
        className="bg-white border border-slate-300 rounded-xl px-3 py-2 min-h-[40px] text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
      >
        <option value="rating">Highest Rated</option>
        <option value="reviews">Most Reviewed</option>
        <option value="verified">Verified First</option>
        <option value="name">Alphabetical (A-Z)</option>
      </select>
    </div>
  );
};
