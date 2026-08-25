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
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'PartyPopper':
        return <PartyPopper className="w-5 h-5" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div
      id="home-hero-banner"
      className="relative bg-[#1A0C06] text-white rounded-3xl overflow-hidden shadow-2xl mb-8 border border-[#4A2518]/70"
    >
      {/* Background Image: Directly displays /hero.jpg (Kahawa West Bypass Roundabout) with high clarity & transparency */}
      <div className="absolute inset-0 z-0">
        {!heroImgError ? (
          <img
            src="/hero.jpg"
            alt="Kahawa West Bypass Roundabout Landmark"
            className="w-full h-full object-cover object-center opacity-95 transition-opacity duration-300"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#24140E] via-[#381E15] to-[#0D6E44]" />
        )}

        {/* Lightweight translucent warm gradients for optimal photo visibility and sharp readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140803]/85 via-[#140803]/50 to-[#140803]/45" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Decorative Emerald & Blue Ambient Accents */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Landmark Pin Indicator on Roundabout Image */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-[#140803]/85 text-stone-100 border border-stone-600/60 backdrop-blur-md shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>Kahawa West Bypass Roundabout</span>
      </div>

      <div className="relative z-10 p-5 sm:p-8 lg:p-10">
        {/* Top Header & Search Area */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          {/* Brand Domain Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold bg-[#140803]/90 text-sky-300 border border-sky-500/40 mb-4 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold tracking-tight text-sky-200">kwestdirectory.co.ke</span>
            <span className="text-stone-500">•</span>
            <span className="text-emerald-300">Official Kahawa West Business Directory</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight drop-shadow-md">
            Find Verified Local Businesses in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-sky-300">
              Kahawa West
            </span>
          </h1>

          {/* Description */}
          <p className="font-sans text-stone-200 text-xs sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Discover over <strong className="text-white font-bold">{businessCount}+ verified businesses</strong>, certified fundis, 24/7 chemists, nyama choma spots, and housing vacancies across Congo Stage, Roundabout, Jacaranda, Bima Rd & Mahiga.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-5 sm:mb-6 shadow-2xl">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search 'Chemist', 'Fundi Maina', 'Super Metro', 'Mbuzi Choma'..."
            />
          </div>

          {/* Quick Estate Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-sans text-stone-200">
            <span className="text-stone-300 font-semibold text-[11px] sm:text-xs">Quick Zones:</span>
            {['Congo Stage', 'Roundabout', 'Jacaranda Estate', 'Bima Road', 'Soweto', 'Mahiga'].map((z) => (
              <button
                key={z}
                onClick={() => onSearchChange(z)}
                className="px-2.5 py-1 rounded-xl bg-[#2A140B]/85 hover:bg-emerald-900/80 text-stone-200 hover:text-emerald-200 border border-[#4A2518] hover:border-emerald-500/60 text-[11px] sm:text-xs transition active:scale-95 backdrop-blur-xs"
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* Browse by Category Section - Sits seamlessly inside the roundabout hero showcase */}
        <div className="pt-6 sm:pt-8 border-t border-[#4A2518]/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Browse by Category</span>
                <span className="text-xs font-sans font-normal text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                  12 Categories
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Explore local merchants & certified artisan services across Kahawa West
              </p>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => onSelectCategory('all')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#221008]/80 border border-emerald-500/40 backdrop-blur-md transition"
              >
                Show All Places <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* White Category Cards Grid with Green Hover Effect over translucent Roundabout Backdrop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                  className={`group rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                    isSelected
                      ? 'bg-emerald-800 border-emerald-400 text-white shadow-xl ring-2 ring-emerald-400/50'
                      : 'bg-white hover:bg-emerald-700 text-stone-900 border-stone-200/90 hover:border-emerald-600 shadow-md hover:shadow-2xl'
                  }`}
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform border border-white/20`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <h3
                      className={`font-display font-bold text-xs sm:text-sm transition-colors duration-150 leading-snug ${
                        isSelected
                          ? 'text-white'
                          : 'text-stone-900 group-hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-medium mt-2.5 transition-colors duration-150 ${
                      isSelected
                        ? 'text-emerald-200 font-semibold'
                        : 'text-stone-500 group-hover:text-emerald-100'
                    }`}
                  >
                    {count} {count === 1 ? 'listing' : 'listings'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="mt-8 pt-5 border-t border-[#4A2518]/60 grid grid-cols-3 gap-2 sm:gap-4 text-center font-sans text-stone-300">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl bg-[#140803]/80 border border-[#3D1A0E] backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Claim & Manage</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl bg-[#140803]/80 border border-[#3D1A0E] backdrop-blur-md">
            <CreditCard className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Direct M-Pesa Tills</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl bg-[#140803]/80 border border-[#3D1A0E] backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Community Reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
};

