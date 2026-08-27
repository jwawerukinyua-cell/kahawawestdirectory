import React, { useState, useMemo } from 'react';
import {
  Utensils,
  HeartPulse,
  Scissors,
  ShoppingBag,
  Wrench,
  Car,
  Laptop,
  CreditCard,
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
  Star,
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  categoryCounts = {},
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const PINNED_CATEGORY_IDS = [
    'hardware-construction',
    'food-fresh',
    'health-wellness',
    'mama-fua-domestic',
  ];

  const { primaryCategories, pinnedCategories, otherActiveCategories, emptyCategories } = useMemo(() => {
    const active = categories.filter((cat) => (categoryCounts[cat.id] || 0) > 0);
    const zeroCount = categories.filter((cat) => (categoryCounts[cat.id] || 0) === 0);

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
        return <Users className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5" />;
      case 'ShoppingBasket':
        return <ShoppingBasket className="w-5 h-5" />;
      case 'Coffee':
      case 'Utensils':
        return <Coffee className="w-5 h-5" />;
      case 'Truck':
        return <Truck className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5" />;
      case 'Pill':
      case 'HeartPulse':
        return <Pill className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Smartphone':
      case 'Laptop':
        return <Smartphone className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'BadgeDollarSign':
      case 'CreditCard':
        return <BadgeDollarSign className="w-5 h-5" />;
      case 'Church':
        return <Church className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Bus':
        return <Bus className="w-5 h-5" />;
      case 'PartyPopper':
        return <PartyPopper className="w-5 h-5" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5" />;
      case 'Handshake':
        return <Handshake className="w-5 h-5" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-10 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <span>Browse by Category</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              {primaryCategories.length} Active
            </span>
          </h2>
          <p className="text-xs text-stone-600">Explore verified merchants, domestic specialists & artisan trades</p>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#630303] hover:text-[#4A0202] flex items-center gap-1 p-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: Top 4 on Mobile/Tablet, Full Active Grid on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {primaryCategories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isPinned = PINNED_CATEGORY_IDS.includes(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative bg-white hover:bg-[#630303] rounded-2xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer justify-between active:scale-[0.98] ${
                !isPinned ? 'hidden lg:flex flex-col' : 'flex flex-col'
              } ${
                isPinned
                  ? 'border-amber-400/80 shadow-sm hover:shadow-xl ring-1 ring-amber-400/30'
                  : 'border-stone-200 hover:border-[#630303] shadow-xs hover:shadow-xl'
              }`}
            >
              {isPinned && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-amber-400 text-stone-950 flex items-center gap-0.5 shadow-2xs group-hover:bg-amber-300">
                  <Star className="w-2.5 h-2.5 fill-stone-950" />
                  <span>Top</span>
                </span>
              )}

              <div>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition-transform border border-white/20`}
                >
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="font-display font-bold text-black group-hover:text-white text-xs sm:text-sm transition-colors duration-150 leading-snug">
                  {cat.name}
                </h3>
              </div>

              <span className="text-[11px] text-stone-500 group-hover:text-rose-100 font-medium mt-2 transition-colors duration-150">
                {count} {count === 1 ? 'listing' : 'listings'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expandable Drawer for Additional / Empty Categories */}
      {(otherActiveCategories.length > 0 || emptyCategories.length > 0) && (
        <div className="mt-3.5 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold transition flex items-center justify-between active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-[#630303]" />
              <span>
                {isMoreOpen ? (
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
            <div className="flex items-center gap-1 text-[11px] text-[#630303] font-semibold">
              <span>{isMoreOpen ? 'Collapse' : 'Expand'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isMoreOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isMoreOpen && (
            <div className="mt-2.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Other active categories on mobile/tablet */}
              {otherActiveCategories.length > 0 && (
                <div className="lg:hidden">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-2 block">
                    More Active Categories
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {otherActiveCategories.map((cat) => {
                      const count = categoryCounts[cat.id] || 0;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => onSelectCategory(cat.id)}
                          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 border border-stone-200 transition cursor-pointer flex items-start gap-2 shadow-2xs"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} text-white flex items-center justify-center flex-shrink-0`}
                          >
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-stone-900 text-xs truncate">
                              {cat.name}
                            </h3>
                            <span className="text-[10px] text-stone-500 block mt-0.5">
                              {count} {count === 1 ? 'place' : 'places'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty categories */}
              {emptyCategories.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                    Open for New Listings
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                    {emptyCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className="bg-stone-50 hover:bg-stone-100 rounded-xl p-2.5 border border-stone-200 transition cursor-pointer flex items-start gap-2"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} opacity-80 text-white flex items-center justify-center flex-shrink-0`}
                        >
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-stone-700 text-xs truncate">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            0 listings • Open
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
