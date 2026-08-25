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
          <h2 className="font-display text-lg sm:text-xl font-bold text-black tracking-tight">Browse by Category</h2>
          <p className="text-xs text-stone-600">Explore verified merchants, domestic specialists & artisan trades</p>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#630303] hover:text-[#4A0202] flex items-center gap-1 p-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white hover:bg-[#630303] rounded-2xl p-3.5 sm:p-4 border border-stone-200 hover:border-[#630303] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-110 transition-transform border border-white/20`}
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
    </div>
  );
};
