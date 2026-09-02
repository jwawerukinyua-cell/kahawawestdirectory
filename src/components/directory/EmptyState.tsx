import React, { useState } from 'react';
import { SearchX, PlusCircle, Share2, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedZone?: string;
  isHousingFilterActive?: boolean;
  isVerifiedFilterActive?: boolean;
  isMpesaFilterActive?: boolean;
  onReset: () => void;
  onListBusiness: () => void;
  onSelectSuggestion?: (query: string) => void;
}

const QUICK_SUGGESTIONS = [
  'Gas Delivery',
  'Water Bowsers',
  'Pharmacy / Chemist',
  'Plumber & Electrician',
  'Salon & Barber',
  'Hardware & Cement',
  'Fresh Groceries',
];

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery = '',
  selectedCategory = 'all',
  selectedZone = 'all',
  isHousingFilterActive = false,
  isVerifiedFilterActive = false,
  isMpesaFilterActive = false,
  onReset,
  onListBusiness,
  onSelectSuggestion,
}) => {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const hasSearch = Boolean(searchQuery && searchQuery.trim() !== '');
  const hasCategoryFilter = selectedCategory !== 'all';
  const hasZoneFilter = selectedZone !== 'all';
  const hasQuickFilter = isHousingFilterActive || isVerifiedFilterActive || isMpesaFilterActive;

  const shareText = hasSearch
    ? `Hello! I was searching for "${searchQuery.trim()}" on Kahawa West Directory (KWEST) and couldn't find your listing. You can add your business for free so neighbors find you easily: https://kwestdirectory.co.ke`
    : `Hello! If you run a business or service in Kahawa West, add it for free to the official KWEST Neighborhood Directory: https://kwestdirectory.co.ke`;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <div
      id="directory-empty-state"
      className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-stone-200 shadow-sm max-w-xl mx-auto my-8 font-sans"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mx-auto mb-4 shadow-2xs">
        <SearchX className="w-8 h-8 text-amber-800" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-display font-black text-stone-900 mb-2 tracking-tight">
        {hasSearch ? `No listings found for "${searchQuery}"` : 'No listings found'}
      </h3>

      {/* Active Filter Tags */}
      {(hasCategoryFilter || hasZoneFilter || hasQuickFilter) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          {isHousingFilterActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
              🏢 Housing & Rent Agents
            </span>
          )}
          {isVerifiedFilterActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold">
              ✓ Verified
            </span>
          )}
          {isMpesaFilterActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-semibold">
              💳 M-Pesa Till
            </span>
          )}
          {hasZoneFilter && (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold">
              Zone: {selectedZone}
            </span>
          )}
          {hasCategoryFilter && (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold">
              Category: {selectedCategory}
            </span>
          )}
        </div>
      )}

      {/* Main Friendly Fallback Copy */}
      <p className="text-stone-600 text-sm sm:text-base mb-6 leading-relaxed">
        No listings found for your search. Know a local business offering this? Share the directory with them to list their business instantly!
      </p>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 border border-emerald-600"
        >
          <Share2 className="w-4 h-4" />
          <span>Share with a Business (WhatsApp)</span>
        </a>

        <Button
          variant="primary"
          size="md"
          onClick={onListBusiness}
          className="w-full sm:w-auto bg-[#630303] hover:bg-[#7D0404] text-white"
          icon={<PlusCircle className="w-4 h-4" />}
        >
          List This Business
        </Button>

        <button
          onClick={handleCopyInvite}
          className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition flex items-center justify-center gap-1.5"
          title="Copy invite text"
        >
          {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
          <span>{copiedInvite ? 'Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Reset Filter Button */}
      {(hasSearch || hasCategoryFilter || hasZoneFilter || hasQuickFilter) && (
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition underline underline-offset-4"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear search & reset all filters</span>
          </button>
        </div>
      )}

      {/* Quick suggestions */}
      {onSelectSuggestion && (
        <div className="mt-6 pt-4 border-t border-stone-100 text-left">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Popular Local Searches in Kahawa West</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => onSelectSuggestion(sug)}
                className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
