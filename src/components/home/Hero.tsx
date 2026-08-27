import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Utensils,
  HeartPulse,
  Scissors,
  ShoppingBag,
  Wrench,
  Car,
  Laptop,
  GraduationCap,
  Home,
  PartyPopper,
  Droplets,
  ArrowRight,
  Folder,
  Sparkles,
  Flame,
  ShoppingBasket,
  Coffee,
  Truck,
  Briefcase,
  Pill,
  Smartphone,
  BadgeDollarSign,
  Church,
  Shirt,
  Bus,
  Sprout,
  Handshake,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  PlusCircle,
} from 'lucide-react';
import { SearchBar } from '../directory/SearchBar';
import { Category } from '../../types';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onListBusinessClick: () => void;
  onExploreClick: () => void;
  businessCount: number;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onListBusinessClick,
  onExploreClick,
  businessCount,
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
  const [isMoreCategoriesOpen, setIsMoreCategoriesOpen] = useState(false);

  // Top 4 High-Demand Pinned Category IDs
  const PINNED_CATEGORY_IDS = [
    'hardware-construction',
    'food-fresh',
    'health-wellness',
    'mama-fua-domestic',
  ];

  // Segregate Active (count > 0) vs Empty / Zero-Count (count === 0)
  const { primaryCategories, pinnedCategories, otherActiveCategories, emptyCategories } = useMemo(() => {
    const active = categories.filter((cat) => (categoryCounts[cat.id] || 0) > 0);
    const zeroCount = categories.filter((cat) => (categoryCounts[cat.id] || 0) === 0);

    // Sort active categories: pinned 4 at the top in requested order, then remaining active categories
    const pinnedActive: Category[] = [];
    PINNED_CATEGORY_IDS.forEach((id) => {
      const match = active.find((c) => c.id === id);
      if (match) pinnedActive.push(match);
    });

    const otherActive = active.filter((c) => !PINNED_CATEGORY_IDS.includes(c.id));

    return {
      primaryCategories: [...pinnedActive, ...otherActive],
      pinnedCategories: pinnedActive,
      otherActiveCategories: otherActive,
      emptyCategories: zeroCount,
    };
  }, [categories, categoryCounts]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Flame':
        return <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'ShoppingBasket':
        return <ShoppingBasket className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Coffee':
      case 'Utensils':
        return <Coffee className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Truck':
        return <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Pill':
      case 'HeartPulse':
        return <Pill className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Car':
        return <Car className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Smartphone':
      case 'Laptop':
        return <Smartphone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'BadgeDollarSign':
      case 'CreditCard':
        return <BadgeDollarSign className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Church':
        return <Church className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Bus':
        return <Bus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'PartyPopper':
        return <PartyPopper className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Sprout':
        return <Sprout className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Handshake':
        return <Handshake className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Home':
        return <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      default:
        return <Folder className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
    }
  };

  return (
    <div
      id="home-hero-banner"
      className="relative bg-[#3B0202] text-white rounded-3xl overflow-hidden shadow-2xl mb-8 border border-[#630303]"
    >
      {/* Background Image: Directly displays /hero.jpg (Kahawa West Bypass Roundabout) with high optical clarity */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!heroImgError ? (
          <img
            src="/hero.jpg"
            alt="Kahawa West Bypass Roundabout Landmark"
            className="w-full h-full object-cover object-center opacity-95 transition-all duration-300 transform scale-100 filter brightness-105 contrast-105"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#630303] via-[#3B0202] to-[#0D6E44]" />
        )}

        {/* Lightweight translucent dark gradient overlay calibrated so the roundabout landmark is clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0101]/95 via-[#2E0202]/50 to-[#2E0202]/30" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
      </div>

      {/* Decorative Subtle Ambient Accents */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Landmark Pin Indicator cleanly anchored at bottom-right of hero image to eliminate top-badge overlap on tablet/desktop */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-black/80 text-stone-200 border border-white/20 backdrop-blur-md shadow-md pointer-events-none">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>Kahawa West Bypass Roundabout</span>
      </div>

      <div className="relative z-10 p-5 sm:p-8 lg:p-10">
        {/* Top Header & Search Area */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          {/* Brand Directory Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans font-semibold bg-[#1F0101]/90 text-emerald-300 border border-emerald-500/40 mb-4 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Kahawa West Business Directory</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black sm:text-black mb-3 sm:mb-4 leading-tight drop-shadow-sm bg-white/95 px-4 py-2 rounded-2xl inline-block border border-stone-300/80 shadow-md">
            Find Verified Local Businesses in{' '}
            <span className="text-[#630303] font-black">
              Kahawa West
            </span>
          </h1>

          {/* Description */}
          <div className="font-sans text-black text-xs sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-semibold bg-white/90 px-4 py-2 rounded-xl border border-stone-200/80 shadow-sm">
            Discover over <strong className="text-[#630303] font-bold">{businessCount}+ verified businesses</strong>, certified fundis, domestic services, 24/7 chemists, nyama choma spots, and local shops across Jacaranda, Kamae, Congo, Roundabout, Jubilee, Northern Bypass & Kware.
          </div>

          {/* Search Controls & Sleek Action Button */}
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 shadow-2xl">
            <div className="flex-1 w-full">
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search 'Mama Fua', 'Plumber', 'Chemist', 'Super Metro', 'Mbuzi Choma'..."
              />
            </div>
            {onListBusinessClick && (
              <button
                type="button"
                id="hero-list-biz-btn"
                onClick={onListBusinessClick}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md border border-emerald-500/50 backdrop-blur-md transition whitespace-nowrap flex-shrink-0 cursor-pointer"
                title="Add your business to Kahawa West Directory"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                <span>List Business</span>
              </button>
            )}
          </div>
        </div>

        {/* Elegant Quick Zones Transition Ribbon on the Divider Line */}
        <div className="my-6 sm:my-8 pt-4 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200 uppercase tracking-wider self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Explore by Estate Zone:</span>
            </div>

            {/* Mobile swipeable & Desktop flex-wrap Quick Zones with Kamae placed next to Jacaranda on the top line */}
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {['Jacaranda', 'Kamae', 'Congo', 'Roundabout', 'Jubilee', 'Northern Bypass', 'Kware', 'Bima Road', 'Soweto', 'Mahiga'].map((z) => {
                  const isActive = searchQuery.toLowerCase() === z.toLowerCase();
                  return (
                    <button
                      key={z}
                      onClick={() => onSearchChange(isActive ? '' : z)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex-shrink-0 active:scale-95 flex items-center gap-1 border ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-black/50 hover:bg-[#630303] text-stone-200 hover:text-white border-white/25 hover:border-rose-400 backdrop-blur-md'
                      }`}
                    >
                      <span>{z}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Browse by Category Section */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Browse by Category</span>
                <span className="text-xs font-sans font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full">
                  {primaryCategories.length} Active
                </span>
              </h2>
              <p className="text-xs text-stone-200">
                Explore local merchants, domestic specialists & certified artisan trades across Kahawa West
              </p>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => onSelectCategory('all')}
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#260101]/90 border border-emerald-500/40 backdrop-blur-md transition"
              >
                Show All Places <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Category Cards Grid (Top 4 on Mobile/Tablet, Full Active Grid on Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {primaryCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              const isPinned = PINNED_CATEGORY_IDS.includes(cat.id);

              return (
                <div
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                  className={`group relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer justify-between active:scale-[0.98] ${
                    !isPinned ? 'hidden lg:flex flex-col' : 'flex flex-col'
                  } ${
                    isSelected
                      ? 'bg-[#630303]/95 border-rose-400 text-white shadow-xl ring-2 ring-rose-400/50 backdrop-blur-md'
                      : isPinned
                      ? 'bg-black/55 hover:bg-[#630303]/90 text-white border-amber-400/40 hover:border-amber-400 shadow-sm hover:shadow-xl backdrop-blur-md ring-1 ring-amber-400/20'
                      : 'bg-black/40 hover:bg-[#630303]/85 text-white border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl backdrop-blur-md'
                  }`}
                >
                  {isPinned && !isSelected && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-amber-400 text-stone-950 flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-stone-950" />
                      <span>Top</span>
                    </span>
                  )}

                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${cat.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-white/25`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div className="min-w-0 flex-1 pr-3">
                      <h3
                        className={`font-display font-bold text-[11px] sm:text-xs leading-snug truncate transition-colors duration-150 ${
                          isSelected
                            ? 'text-white'
                            : 'text-stone-100 group-hover:text-white'
                        }`}
                        title={cat.name}
                      >
                        {cat.name}
                      </h3>
                      <span
                        className={`text-[10px] font-medium block mt-0.5 transition-colors duration-150 ${
                          isSelected
                            ? 'text-rose-200'
                            : 'text-stone-300 group-hover:text-rose-200'
                        }`}
                      >
                        {count} {count === 1 ? 'place' : 'places'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable "More Categories" Collapsible Drawer */}
          {(otherActiveCategories.length > 0 || emptyCategories.length > 0) && (
            <div className="mt-3.5 pt-3 border-t border-white/15">
              <button
                type="button"
                id="toggle-more-categories-drawer"
                onClick={() => setIsMoreCategoriesOpen(!isMoreCategoriesOpen)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-stone-200 hover:text-white text-xs font-bold transition flex items-center justify-between backdrop-blur-md active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {isMoreCategoriesOpen ? (
                      'Hide Additional Categories'
                    ) : (
                      <>
                        <span className="lg:hidden">
                          See More Categories ({otherActiveCategories.length + emptyCategories.length} More)
                        </span>
                        <span className="hidden lg:inline">
                          See More Categories ({emptyCategories.length} Available for Listing)
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-rose-300 font-semibold">
                  <span>{isMoreCategoriesOpen ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMoreCategoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isMoreCategoriesOpen && (
                <div className="mt-2.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* On mobile/tablet: Show remaining active categories */}
                  {otherActiveCategories.length > 0 && (
                    <div className="lg:hidden">
                      <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>More Active Categories</span>
                        <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                          {otherActiveCategories.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                        {otherActiveCategories.map((cat) => {
                          const count = categoryCounts[cat.id] || 0;
                          const isSelected = selectedCategory === cat.id;

                          return (
                            <div
                              key={cat.id}
                              id={`mobile-extra-cat-${cat.id}`}
                              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                              className={`group rounded-xl p-2.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                                isSelected
                                  ? 'bg-[#630303]/95 border-rose-400 text-white shadow-xl ring-2 ring-rose-400/50 backdrop-blur-md'
                                  : 'bg-black/40 hover:bg-[#630303]/85 text-white border-white/20 hover:border-white/40 backdrop-blur-md'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cat.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20`}
                                >
                                  {getCategoryIcon(cat.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className={`font-display font-bold text-[10px] sm:text-[11px] leading-snug truncate transition-colors duration-150 ${
                                      isSelected ? 'text-white' : 'text-stone-100 group-hover:text-white'
                                    }`}
                                    title={cat.name}
                                  >
                                    {cat.name}
                                  </h3>
                                  <span
                                    className={`text-[9px] font-medium block mt-0.5 ${
                                      isSelected ? 'text-rose-200' : 'text-stone-300'
                                    }`}
                                  >
                                    {count} {count === 1 ? 'place' : 'places'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty / Open for Listing Categories */}
                  {emptyCategories.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>Open for New Business Listings</span>
                        <span className="bg-stone-900 text-stone-300 px-1.5 py-0.2 rounded-full border border-white/20">
                          {emptyCategories.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                        {emptyCategories.map((cat) => {
                          const isSelected = selectedCategory === cat.id;

                          return (
                            <div
                              key={cat.id}
                              id={`empty-cat-card-${cat.id}`}
                              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                              className={`group rounded-xl p-2 sm:p-2.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                                isSelected
                                  ? 'bg-[#630303]/95 border-rose-400 text-white shadow-xl ring-2 ring-rose-400/50 backdrop-blur-md'
                                  : 'bg-black/25 hover:bg-[#630303]/70 text-stone-300 hover:text-white border-white/10 hover:border-white/30 backdrop-blur-sm'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${cat.color} opacity-80 text-white flex items-center justify-center flex-shrink-0 border border-white/20`}
                                >
                                  {getCategoryIcon(cat.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className="font-display font-bold text-[10px] sm:text-[11px] leading-snug truncate text-stone-300 group-hover:text-white"
                                    title={cat.name}
                                  >
                                    {cat.name}
                                  </h3>
                                  <span className="text-[9px] font-medium text-stone-400 group-hover:text-emerald-300 block mt-0.5">
                                    0 places • Claim & List
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
