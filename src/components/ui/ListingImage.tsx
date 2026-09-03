import React, { useState } from 'react';
import { Business } from '../../types';
import { generateBusinessAltText, generateStoryAltText, BusinessImageType } from '../../lib/seoAltUtils';
import {
  Store,
  Camera,
  Utensils,
  Pill,
  Wrench,
  Sparkles,
  ShoppingBag,
  Car,
  Home,
  GraduationCap,
  Scissors,
  Building,
} from 'lucide-react';

export interface ListingImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string | null;
  alt?: string;
  business?: Partial<Business> | null;
  story?: {
    title?: string;
    category?: string;
    zone?: string;
    authorName?: string;
    businessName?: string;
    imageCaption?: string;
  } | null;
  imageType?: BusinessImageType;
  index?: number;
  customCaption?: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  '/hero.webp',
  '/hero.jpg',
];

export const ListingImage: React.FC<ListingImageProps> = ({
  src,
  alt: explicitAlt,
  business,
  story,
  imageType = 'cover' as BusinessImageType,
  index = 1,
  customCaption,
  fallbackSrc,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  aspectRatio,
  onError,
  ...props
}) => {
  const [errorCount, setErrorCount] = useState(0);

  // Compute rich SEO alt text automatically
  let calculatedAlt = '';
  if (explicitAlt && explicitAlt.trim() !== '') {
    calculatedAlt = explicitAlt.trim();
  } else if (story) {
    const storyType = imageType === 'preview' ? 'preview' : imageType === 'gallery' ? 'gallery' : 'cover';
    calculatedAlt = generateStoryAltText(story, {
      type: storyType,
      customCaption,
    });
  } else if (business) {
    calculatedAlt = generateBusinessAltText(business, {
      type: imageType,
      index,
      customCaption,
    });
  } else {
    calculatedAlt = 'Kahawa West local business photo - Nairobi, Kenya';
  }

  // Determine source candidates
  const cleanSrc = src && typeof src === 'string' && src.trim() !== '' ? src.trim() : null;
  const sources = [
    cleanSrc,
    fallbackSrc,
    ...DEFAULT_FALLBACKS,
  ].filter(Boolean) as string[];

  const currentSrc = sources[errorCount] || null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (errorCount < sources.length - 1) {
      setErrorCount((prev) => prev + 1);
    } else {
      setErrorCount(sources.length);
    }
    if (onError) {
      onError(e);
    }
  };

  // If all image attempts fail or no image was provided, render a high-quality stylized visual fallback
  if (errorCount >= sources.length || !currentSrc) {
    const bizName = business?.name || story?.businessName || story?.title || 'Kahawa West Business';
    const bizZone = business?.zone || story?.zone || 'Kahawa West';
    const category = business?.category || story?.category || '';

    const getIcon = () => {
      if (category.includes('restaurant') || category.includes('food')) return <Utensils className="w-8 h-8 text-amber-400" />;
      if (category.includes('health') || category.includes('pharmacy')) return <Pill className="w-8 h-8 text-rose-400" />;
      if (category.includes('hardware') || category.includes('construction')) return <Wrench className="w-8 h-8 text-emerald-400" />;
      if (category.includes('beauty') || category.includes('personal')) return <Scissors className="w-8 h-8 text-pink-400" />;
      if (category.includes('automotive')) return <Car className="w-8 h-8 text-blue-400" />;
      if (category.includes('home') || category.includes('rental')) return <Home className="w-8 h-8 text-indigo-400" />;
      if (category.includes('education')) return <GraduationCap className="w-8 h-8 text-teal-400" />;
      return <Store className="w-8 h-8 text-amber-300" />;
    };

    return (
      <div
        className={`w-full h-full min-h-[120px] bg-gradient-to-br from-[#2E0202] via-[#4D0202] to-[#1F0101] flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden border border-rose-950/40 ${className}`}
      >
        {/* Subtle geometric backdrop pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
            {getIcon()}
          </div>
          <div className="max-w-[85%]">
            <p className="text-xs font-bold text-stone-100 truncate">{bizName}</p>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">{bizZone} • Verified Listing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={calculatedAlt}
      title={props.title || calculatedAlt}
      loading={loading}
      decoding={decoding}
      onError={handleImageError}
      className={className}
      {...props}
    />
  );
};
