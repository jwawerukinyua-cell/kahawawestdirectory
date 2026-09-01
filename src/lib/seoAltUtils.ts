/**
 * SEO & Accessibility Alt Text Generator for Kahawa West Directory
 * 
 * Automatically generates hyper-local, keyword-rich, and screen-reader-friendly
 * alt text for images across the directory without requiring technical knowledge
 * from business owners or community contributors.
 */

import { Business } from '../types';

export type BusinessImageType = 'cover' | 'hero' | 'gallery' | 'logo' | 'preview' | 'mpesa' | 'ad' | 'thumbnail';

export interface BusinessAltOptions {
  type?: BusinessImageType;
  index?: number;
  customCaption?: string;
  customAlt?: string;
  zone?: string;
  category?: string;
}

export interface StoryAltOptions {
  type?: 'cover' | 'preview' | 'gallery' | 'author';
  customCaption?: string;
  customAlt?: string;
}

/**
 * Generates an SEO-optimized alt text string for a business listing image.
 * Includes Business Name, Category/Subcategory, Estate Zone, and Kahawa West Nairobi keyword grounding.
 */
export function generateBusinessAltText(
  business?: Partial<Business> | null,
  options: BusinessAltOptions = {}
): string {
  const { type = 'cover', index = 1, customCaption, customAlt, zone: customZone, category: customCat } = options;

  // 1. If explicit custom alt or caption provided by user, prioritize it while ensuring locality context
  if (customAlt && customAlt.trim() !== '') {
    return customAlt.trim();
  }

  if (customCaption && customCaption.trim() !== '') {
    const cleanCaption = customCaption.trim();
    if (business?.name && !cleanCaption.toLowerCase().includes(business.name.toLowerCase())) {
      return `${cleanCaption} - ${business.name}, Kahawa West`;
    }
    return cleanCaption;
  }

  const name = business?.name?.trim() || 'Local Business';
  const category = customCat || business?.subCategory || business?.category || 'Services & Products';
  const zone = customZone || business?.zone || 'Kahawa West';
  const landmark = business?.landmark?.trim();
  const locationSuffix = landmark 
    ? `near ${landmark} in ${zone}, Kahawa West Nairobi`
    : `in ${zone}, Kahawa West Nairobi`;

  switch (type) {
    case 'logo':
      return `${name} official business logo - ${category} ${locationSuffix}`;

    case 'hero':
    case 'cover':
      return `Storefront and business premises of ${name}, offering ${category} ${locationSuffix}`;

    case 'gallery':
      return `${name} verified photo ${index} - ${category} showcase ${locationSuffix}`;

    case 'ad':
      return `Special offer and commercial spotlight from ${name} - ${category} ${locationSuffix}`;

    case 'mpesa':
      return `Verified M-Pesa merchant payment details for ${name} ${locationSuffix}`;

    case 'thumbnail':
    case 'preview':
    default:
      return `${name} - ${category} located in ${zone}, Kahawa West`;
  }
}

/**
 * Generates an SEO-optimized alt text for Community Spotlight stories & editorial photos.
 */
export function generateStoryAltText(
  story?: {
    title?: string;
    category?: string;
    zone?: string;
    authorName?: string;
    businessName?: string;
    imageCaption?: string;
  } | null,
  options: StoryAltOptions = {}
): string {
  const { type = 'cover', customCaption, customAlt } = options;

  if (customAlt && customAlt.trim() !== '') {
    return customAlt.trim();
  }

  const caption = customCaption || story?.imageCaption;
  if (caption && caption.trim() !== '') {
    return `${caption.trim()} - Kahawa West Community Spotlight`;
  }

  const title = story?.title?.trim() || 'Community Spotlight';
  const zone = story?.zone || 'Kahawa West';
  const category = story?.category || 'Community Story';
  const entity = story?.businessName ? ` featuring ${story.businessName}` : '';

  switch (type) {
    case 'preview':
      return `Thumbnail preview of "${title}" - ${category} in ${zone}, Kahawa West`;
    case 'author':
      return `Photo of storyteller ${story?.authorName || 'Resident'} - ${zone}, Kahawa West`;
    case 'cover':
    default:
      return `Community story photo for "${title}"${entity} - ${category} in ${zone}, Kahawa West Nairobi`;
  }
}

/**
 * Generates landmark & platform branding alt text for general UI components.
 */
export function generateBrandAltText(
  purpose: 'logo' | 'hero-landmark' | 'about-banner' | 'pwa-icon',
  context?: string
): string {
  switch (purpose) {
    case 'logo':
      return 'KWEST Kahawa West Business & Services Directory official emblem';
    case 'hero-landmark':
      return 'Kahawa West Bypass roundabout and commercial centre landmark in Nairobi, Kenya';
    case 'about-banner':
      return 'Kahawa West estate community and neighborhood commercial landscape';
    case 'pwa-icon':
      return 'Kahawa West Directory PWA mobile application icon';
    default:
      return context || 'Kahawa West Directory, Nairobi Kenya';
  }
}
