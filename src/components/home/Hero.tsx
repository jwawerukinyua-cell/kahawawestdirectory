import React, { useState } from 'react';
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

      {/* Landmark Pin Indicator on Roundabout Image */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-semibold bg-[#1F0101]/90 text-stone-100 border border-stone-500/50 backdrop-blur-md shadow-md">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
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
            Discover over <strong className="text-[#630303] font-bold">{businessCount}+ verified businesses</strong>, certified fundis, domestic services, 24/7 chemists, nyama choma spots, and local shops across Congo, Roundabout, Jacaranda, Jubilee, Northern Bypass & Kware.
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto shadow-2xl">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search 'Mama Fua', 'Plumber', 'Chemist', 'Super Metro', 'Mbuzi Choma'..."
            />
          </div>
        </div>

        {/* Elegant Quick Zones Transition Ribbon on the Divider Line */}
        <div className="my-6 sm:my-8 pt-4 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200 uppercase tracking-wider self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Explore by Estate Zone:</span>
            </div>

            {/* Mobile swipeable & Desktop flex-wrap Quick Zones */}
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {['Congo', 'Roundabout', 'Jacaranda Estate', 'Jubilee Estate', 'Northern Bypass', 'Kware / Quarry', 'Bima Road', 'Soweto', 'Mahiga', 'Kamae'].map((z) => {
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Browse by Category</span>
                <span className="text-xs font-sans font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full">
                  {categories.length} Categories
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

          {/* Category Cards Grid (Responsive Grid for 20 Categories - Compact & Transparent Glass) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                  className={`group rounded-xl p-2 sm:p-2.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#630303]/95 border-rose-400 text-white shadow-xl ring-2 ring-rose-400/50 backdrop-blur-md'
                      : 'bg-black/40 hover:bg-[#630303]/85 text-white border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${cat.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-white/25`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
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
        </div>
      </div>
    </div>
  );
};
