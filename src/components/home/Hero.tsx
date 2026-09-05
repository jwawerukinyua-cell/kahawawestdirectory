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
  Building2,
  Key,
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
  ArrowDown,
} from 'lucide-react';
import { SearchBar } from '../directory/SearchBar';
import { Category } from '../../types';
import { generateBrandAltText } from '../../lib/seoAltUtils';

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
  const [currentHeroSrc, setCurrentHeroSrc] = useState('/hero.jpg');

  const handleHeroImgError = () => {
    if (currentHeroSrc === '/hero.jpg') {
      setCurrentHeroSrc('/hero.webp');
    } else if (currentHeroSrc === '/hero.webp') {
      setCurrentHeroSrc('/hero-opt.jpg');
    }
  };

  const [isMoreCategoriesOpen, setIsMoreCategoriesOpen] = useState(false);

  // Top 4 High-Demand Pinned Category IDs (Housing, Food, Health, Mama Fua)
  const PINNED_CATEGORY_IDS = [
    'home-rentals',
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

  // Guaranteed high-contrast color badges for category icons
  const getCategoryBadgeClass = (catId: string) => {
    switch (catId) {
      case 'home-rentals':
        return 'bg-emerald-600 text-white';
      case 'food-fresh':
        return 'bg-emerald-700 text-white';
      case 'health-wellness':
        return 'bg-teal-600 text-white';
      case 'mama-fua-domestic':
        return 'bg-rose-700 text-white';
      case 'home-utilities':
        return 'bg-orange-600 text-white';
      case 'hardware-construction':
        return 'bg-blue-600 text-white';
      case 'restaurants-cafes':
        return 'bg-amber-600 text-white';
      case 'errands-deliveries':
        return 'bg-yellow-600 text-white';
      case 'beauty-personal-care':
        return 'bg-pink-600 text-white';
      case 'automotive':
        return 'bg-indigo-600 text-white';
      case 'education':
        return 'bg-purple-600 text-white';
      case 'electronics-tech':
        return 'bg-cyan-600 text-white';
      case 'financial-services':
        return 'bg-emerald-800 text-white';
      case 'events-entertainment':
        return 'bg-fuchsia-600 text-white';
      case 'fashion-clothing':
        return 'bg-violet-600 text-white';
      case 'transport-travel':
        return 'bg-sky-600 text-white';
      case 'home-garden':
        return 'bg-lime-700 text-white';
      case 'community-organizations':
        return 'bg-teal-700 text-white';
      case 'churches-faith':
        return 'bg-amber-700 text-white';
      case 'professional-services':
        return 'bg-slate-700 text-white';
      default:
        return 'bg-rose-600 text-white';
    }
  };

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
      case 'Building2':
      case 'Building':
        return <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      case 'Key':
        return <Key className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
      default:
        return <Folder className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;
    }
  };

  return (
    <div
      id="home-hero-banner"
      className="relative bg-stone-950 text-white rounded-3xl overflow-hidden shadow-2xl mb-8 border border-stone-800"
    >
      {/* Background Image: High Priority Landmark Photo */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-stone-950">
        <img
          src={currentHeroSrc}
          alt={generateBrandAltText('hero-landmark')}
          title="Kahawa West Landmark - Bypass Roundabout Intersection"
          className="w-full h-full object-cover object-[center_35%] transition-all duration-300 transform scale-100 filter brightness-105 contrast-105"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width="1200"
          height="600"
          onError={handleHeroImgError}
        />

        {/* Scenic calibrated overlay that lets the bypass roundabout landmark shine through vividly while keeping text 100% readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/80" />
        <div className="absolute inset-0 bg-[#3B0202]/25 mix-blend-multiply" />
      </div>

      {/* Decorative Subtle Ambient Accents */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Landmark Pin Indicator cleanly anchored at bottom-right of hero image */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-black/80 text-stone-200 border border-white/20 backdrop-blur-md shadow-md pointer-events-none">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>Kahawa West Bypass Roundabout</span>
      </div>

      <div className="relative z-10 p-5 sm:p-8 lg:p-10">
        {/* Top Header & Search Area */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          {/* Main Title */}
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Find Verified Local Businesses in{' '}
            <span style={{ color: '#630303' }} className="font-black">
              Kahawa West
            </span>
          </h1>

          {/* Description */}
          <p className="font-sans text-stone-200 text-xs sm:text-base mb-5 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            <span className="font-bold text-white">Kahawa West, Finally Organized.</span> Find trusted businesses, discover hidden local gems, read community updates, and support businesses around you—all in one trusted place.
          </p>

          {/* Search Controls & Sleek Action Button */}
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 shadow-2xl">
            <div className="flex-1 w-full flex items-center gap-2">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={(val) => {
                    onSearchChange(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onExploreClick();
                    }
                  }}
                  placeholder="Search 'Mama Fua', 'Plumber', 'Chemist', 'Super Metro', 'Mbuzi Choma'..."
                />
              </div>
              <button
                type="button"
                id="hero-search-submit-btn"
                onClick={onExploreClick}
                className="px-4 py-2.5 rounded-2xl bg-[#630303] hover:bg-[#7D0404] active:scale-95 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md border border-rose-400/40 backdrop-blur-md transition whitespace-nowrap flex-shrink-0 cursor-pointer"
                title="Search and show results"
              >
                <Search className="w-4 h-4 text-rose-200" />
                <span>Find</span>
              </button>
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
                <span>List Your Business</span>
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
                      onClick={() => {
                        onSearchChange(isActive ? '' : z);
                        onExploreClick();
                      }}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {primaryCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              const isPinned = PINNED_CATEGORY_IDS.includes(cat.id);

              return (
                <div
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                  className={`group relative rounded-2xl p-3 sm:p-3.5 transition-all duration-200 ease-out cursor-pointer justify-between border ${
                    !isPinned ? 'hidden lg:flex flex-col' : 'flex flex-col'
                  } ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#8E0808] to-[#4A0303] text-white border-rose-400 ring-2 ring-rose-400/50 shadow-xl -translate-y-0.5'
                      : isPinned
                      ? 'bg-stone-900/85 hover:bg-[#630303] text-white border-amber-400/50 hover:border-amber-300 shadow-[0_4px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-xl backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-stone-900/80 hover:bg-[#630303] text-white border-white/20 hover:border-rose-400 shadow-[0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-xl backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {isPinned && !isSelected && (
                    <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 flex items-center gap-0.5 shadow-sm pointer-events-none">
                      <Star className="w-2.5 h-2.5 fill-stone-950" />
                      <span>Top</span>
                    </span>
                  )}

                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${getCategoryBadgeClass(cat.id)} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-display font-bold text-xs sm:text-sm leading-snug truncate transition-colors duration-150 ${
                          isSelected
                            ? 'text-white'
                            : 'text-white group-hover:text-rose-200'
                        }`}
                        title={cat.name}
                      >
                        {cat.name}
                      </h3>
                      <span
                        className={`text-[10px] sm:text-[11px] font-semibold block mt-1 transition-colors duration-150 ${
                          isSelected
                            ? 'text-rose-200'
                            : 'text-stone-300 group-hover:text-white'
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
            <div className="mt-4 pt-3.5 border-t border-white/20">
              <button
                type="button"
                id="toggle-more-categories-drawer"
                onClick={() => setIsMoreCategoriesOpen(!isMoreCategoriesOpen)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-stone-900/85 hover:bg-[#630303] text-stone-200 hover:text-white text-xs font-bold transition-all duration-200 ease-out flex items-center justify-between border border-white/20 hover:border-rose-400 shadow-md hover:-translate-y-0.5 active:translate-y-0"
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
                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
                              className={`group rounded-xl p-2.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between border ${
                                isSelected
                                  ? 'bg-gradient-to-b from-[#8E0808] to-[#4A0303] text-white border-rose-400 shadow-md -translate-y-0.5'
                                  : 'bg-stone-900/80 hover:bg-[#630303] text-white border-white/20 hover:border-rose-400 shadow-md hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-7 h-7 rounded-lg ${getCategoryBadgeClass(cat.id)} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}
                                >
                                  {getCategoryIcon(cat.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className={`font-display font-bold text-[11px] sm:text-xs leading-snug truncate transition-colors duration-150 ${
                                      isSelected ? 'text-white' : 'text-stone-100 group-hover:text-white'
                                    }`}
                                    title={cat.name}
                                  >
                                    {cat.name}
                                  </h3>
                                  <span
                                    className={`text-[10px] font-medium block mt-0.5 ${
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
                              className={`group rounded-xl p-2 sm:p-2.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between border ${
                                isSelected
                                  ? 'bg-gradient-to-b from-[#8E0808] to-[#4A0303] text-white border-rose-400 shadow-md -translate-y-0.5'
                                  : 'bg-stone-900/60 hover:bg-[#630303]/80 text-stone-200 hover:text-white border-white/15 hover:border-rose-400 shadow-sm hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-7 h-7 rounded-lg ${getCategoryBadgeClass(cat.id)} opacity-90 text-white flex items-center justify-center flex-shrink-0 shadow-sm`}
                                >
                                  {getCategoryIcon(cat.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className="font-display font-bold text-[10px] sm:text-[11px] leading-snug truncate text-stone-200 group-hover:text-white"
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

        {/* Smart Downward Indicator Leading Visitors to the Next Step / Directory */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-200 text-xs font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{businessCount} Local Businesses & Specialists Active</span>
          </div>

          <button
            type="button"
            id="hero-scroll-down-btn"
            onClick={onExploreClick}
            className="group px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 hover:border-white/40 text-stone-100 text-xs font-bold flex items-center gap-2.5 transition-all shadow-sm cursor-pointer backdrop-blur-sm"
            title="Scroll down to view full directory and filter tools"
          >
            <span>Browse All Businesses Below</span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center group-hover:translate-y-0.5 transition-transform duration-200">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
