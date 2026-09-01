import React, { useState } from 'react';
import { Business } from '../../types';
import { generateBusinessAltText, generateStoryAltText, BusinessImageType } from '../../lib/seoAltUtils';

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

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

export const ListingImage: React.FC<ListingImageProps> = ({
  src,
  alt: explicitAlt,
  business,
  story,
  imageType = 'cover' as BusinessImageType,
  index = 1,
  customCaption,
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

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

  const finalSrc = !hasError && src && src.trim() !== '' ? src.trim() : fallbackSrc;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={finalSrc}
      alt={calculatedAlt}
      title={props.title || calculatedAlt}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      onError={handleImageError}
      className={className}
      {...props}
    />
  );
};
