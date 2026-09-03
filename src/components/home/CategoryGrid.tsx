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
    'home-rentals',
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
      case 'Building2':
      case 'Building':
        return <Building2 className="w-5 h-5" />;
      case 'Key':
        return <Key className="w-5 h-5" />;
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
              className={`group relative bg-white hover:bg-gradient-to-b hover:from-[#630303] hover:to-[#380101] rounded-2xl p-3 sm:p-4 transition-all duration-200 ease-out cursor-pointer justify-between ${
                !isPinned ? 'hidden lg:flex flex-col' : 'flex flex-col'
              } ${
                isPinned
                  ? 'shadow-[0_6px_16px_rgba(0,0,0,0.07),0_2px_4px_rgba(251,191,36,0.2),inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(251,191,36,0.4)] hover:shadow-[0_14px_30px_rgba(99,3,3,0.22),0_4px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_6px_rgba(0,0,0,0.1)]'
                  : 'shadow-[0_6px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(0,0,0,0.06)] hover:shadow-[0_14px_30px_rgba(99,3,3,0.2),0_4px_8px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_6px_rgba(0,0,0,0.1)]'
              }`}
            >
              {isPinned && (
                <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-black uppercase tracking-wide bg-amber-400 text-stone-950 flex items-center gap-0.5 shadow-2xs group-hover:bg-amber-300">
                  <Star className="w-2.5 h-2.5 fill-stone-950" />
                  <span>Top</span>
                </span>
              )}

              <div>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${getCategoryBadgeClass(cat.id)} text-white flex items-center justify-center mb-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform`}
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
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition-all duration-200 ease-out flex items-center justify-between shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0"
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
                          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 transition-all duration-200 ease-out cursor-pointer flex items-start gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg ${getCategoryBadgeClass(cat.id)} text-white flex items-center justify-center flex-shrink-0 shadow-xs`}
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
                        className="bg-stone-50 hover:bg-white rounded-xl p-2.5 transition-all duration-200 ease-out cursor-pointer flex items-start gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg ${getCategoryBadgeClass(cat.id)} opacity-80 text-white flex items-center justify-center flex-shrink-0`}
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
