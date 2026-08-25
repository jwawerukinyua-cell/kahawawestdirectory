import React from 'react';
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
    <div className="mb-10 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#24140E] tracking-tight">Browse by Category</h2>
          <p className="text-xs text-stone-600">Explore verified merchants & certified artisan trades</p>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 p-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white hover:bg-emerald-700 rounded-2xl p-3.5 sm:p-4 border border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition-transform border border-white/20`}
                >
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="font-display font-bold text-[#24140E] group-hover:text-white text-xs sm:text-sm transition-colors duration-150 leading-snug">
                  {cat.name}
                </h3>
              </div>

              <span className="text-[11px] text-stone-500 group-hover:text-emerald-100 font-medium mt-2 transition-colors duration-150">
                {count} {count === 1 ? 'listing' : 'listings'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
