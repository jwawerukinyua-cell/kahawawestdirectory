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
  Building2,
  Key,
  PartyPopper,
  Droplets,
  LayoutGrid,
  Folder,
  Users,
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
} from 'lucide-react';
import { Category } from '../../types';
import { HorizontalScrollContainer } from '../ui/HorizontalScrollContainer';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Building2':
      case 'Building':
        return <Building2 className="w-4 h-4" />;
      case 'Key':
        return <Key className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'ShoppingBasket':
        return <ShoppingBasket className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Truck':
        return <Truck className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'Pill':
        return <Pill className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'BadgeDollarSign':
        return <BadgeDollarSign className="w-4 h-4" />;
      case 'Church':
        return <Church className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Bus':
        return <Bus className="w-4 h-4" />;
      case 'Sprout':
        return <Sprout className="w-4 h-4" />;
      case 'Handshake':
        return <Handshake className="w-4 h-4" />;
      case 'PartyPopper':
        return <PartyPopper className="w-4 h-4" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <HorizontalScrollContainer
      id="category-filter-scroll"
      className="mb-2 font-sans"
      step={320}
    >
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-gradient-to-b from-[#3B0202] to-[#200101] text-white font-bold shadow-[0_4px_12px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] -translate-y-0.5'
            : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id];

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white font-bold shadow-[0_4px_12px_rgba(5,150,105,0.4),0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.35)] -translate-y-0.5'
                : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {getCategoryIcon(cat.icon)}
            <span>{cat.name}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white font-bold' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </HorizontalScrollContainer>
  );
};
