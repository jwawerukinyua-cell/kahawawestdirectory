/**
 * KWEST XML Sitemap & Robots.txt Generator Utility
 * 
 * Generates SEO-compliant XML sitemaps adhering to the Sitemaps.org 0.9 standard
 * and Google Image Sitemap extension specifications.
 * 
 * Supports dynamic generation from live local storage / Supabase state
 * as well as static generation for crawlers (Googlebot, Bingbot, etc.).
 */

import { Business, EstateZone, CommunityStory } from '../types';
import { CATEGORIES } from '../data/categories';
import { copyToClipboard } from './clipboard';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number; // 0.0 to 1.0
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}

export interface SitemapGeneratorOptions {
  baseUrl?: string;
  businesses?: Business[];
  stories?: CommunityStory[];
  additionalUrls?: SitemapUrlEntry[];
  includeImages?: boolean;
}

export interface SitemapStats {
  totalUrls: number;
  homepageCount: number;
  categoriesCount: number;
  zonesCount: number;
  businessesCount: number;
  storiesCount: number;
  corePagesCount: number;
  totalImagesCount: number;
  generatedAt: string;
}

export const ESTATE_ZONES_LIST: EstateZone[] = [
  'Congo',
  'Roundabout',
  'Jacaranda Estate',
  'Jubilee Estate',
  'Northern Bypass',
  'Kware / Quarry',
  'Bima Road',
  'Soweto',
  'Kamae',
  'Station / Railway',
  'Mahiga',
  'Kamiti Road',
  'Kiamumbi Border',
];

export const DEFAULT_PRODUCTION_BASE_URL = 'https://kwestdirectory.co.ke';

/**
 * Safely escapes special XML characters (&, <, >, ", ') to maintain valid XML.
 */
export function escapeXml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats a Date object or ISO string to standard YYYY-MM-DD for <lastmod>.
 */
export function formatLastMod(dateInput?: string | Date): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Builds the complete list of SitemapUrlEntry items based on directory data.
 */
export function buildSitemapEntries(options: SitemapGeneratorOptions = {}): SitemapUrlEntry[] {
  const rawBase = options.baseUrl || (typeof window !== 'undefined' ? window.location.origin : DEFAULT_PRODUCTION_BASE_URL);
  const baseUrl = rawBase.replace(/\/+$/, '');
  const today = formatLastMod();
  const includeImages = options.includeImages !== false;

  const entries: SitemapUrlEntry[] = [];

  // 1. Homepage (Top Priority)
  entries.push({
    loc: `${baseUrl}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0,
  });

  // 2. Core Service Modals / Deep-link Views
  const corePages = [
    { path: '/?view=emergency', priority: 0.9, changefreq: 'monthly' as const },
    { path: '/?view=list-business', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/?view=promote', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/?view=stories', priority: 0.8, changefreq: 'daily' as const },
    { path: '/?view=guidelines', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/?view=community-standards', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/?view=privacy', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/?view=terms', priority: 0.5, changefreq: 'monthly' as const },
  ];

  corePages.forEach((p) => {
    entries.push({
      loc: `${baseUrl}${p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    });
  });

  // 3. Category Filter Pages
  CATEGORIES.forEach((cat) => {
    entries.push({
      loc: `${baseUrl}/?category=${encodeURIComponent(cat.id)}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.85,
    });
  });

  // 4. Estate Zone Filter Pages
  ESTATE_ZONES_LIST.forEach((zone) => {
    entries.push({
      loc: `${baseUrl}/?zone=${encodeURIComponent(zone)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  // 5. Business Directory Listings
  if (options.businesses && options.businesses.length > 0) {
    options.businesses.forEach((biz) => {
      const bizSlug = biz.slug || biz.id;
      const images: SitemapUrlEntry['images'] = [];

      if (includeImages) {
        if (biz.heroImage && biz.heroImage.startsWith('http')) {
          images.push({
            loc: biz.heroImage,
            title: biz.name,
            caption: `${biz.name} in ${biz.zone}, Kahawa West - ${biz.tagline || biz.category}`,
          });
        }
        if (biz.galleryImages && Array.isArray(biz.galleryImages)) {
          biz.galleryImages.forEach((img) => {
            if (img && img.startsWith('http') && img !== biz.heroImage) {
              images.push({
                loc: img,
                title: `${biz.name} Photo`,
                caption: `Photo from ${biz.name} in ${biz.zone}`,
              });
            }
          });
        }
      }

      entries.push({
        loc: `${baseUrl}/?biz=${encodeURIComponent(bizSlug)}`,
        lastmod: formatLastMod(),
        changefreq: 'weekly',
        priority: 0.9,
        images: images.length > 0 ? images : undefined,
      });
    });
  }

  // 6. Community Spotlight Stories
  if (options.stories && options.stories.length > 0) {
    options.stories.forEach((story) => {
      const images: SitemapUrlEntry['images'] = [];
      if (includeImages && story.imageUrl && story.imageUrl.startsWith('http')) {
        images.push({
          loc: story.imageUrl,
          title: story.title,
          caption: story.imageCaption || story.excerpt || story.title,
        });
      }

      entries.push({
        loc: `${baseUrl}/?story=${encodeURIComponent(story.id)}`,
        lastmod: formatLastMod(story.date),
        changefreq: 'weekly',
        priority: 0.75,
        images: images.length > 0 ? images : undefined,
      });
    });
  }

  // 7. Additional Custom URLs if specified
  if (options.additionalUrls && options.additionalUrls.length > 0) {
    entries.push(...options.additionalUrls);
  }

  return entries;
}

/**
 * Generates the full XML Sitemap string matching the Sitemaps.org 0.9 protocol.
 */
export function generateSitemapXml(options: SitemapGeneratorOptions = {}): string {
  const entries = buildSitemapEntries(options);

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">';
  const urlsetClose = '</urlset>';

  const urlElements = entries.map((entry) => {
    let itemXml = `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      itemXml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      itemXml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      itemXml += `    <priority>${entry.priority.toFixed(2)}</priority>\n`;
    }

    if (entry.images && entry.images.length > 0) {
      entry.images.forEach((img) => {
        itemXml += '    <image:image>\n';
        itemXml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
        if (img.title) {
          itemXml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        }
        if (img.caption) {
          itemXml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        }
        itemXml += '    </image:image>\n';
      });
    }

    itemXml += '  </url>';
    return itemXml;
  });

  return `${xmlHeader}\n${urlsetOpen}\n${urlElements.join('\n')}\n${urlsetClose}\n`;
}

/**
 * Calculates comprehensive stats about the sitemap.
 */
export function getSitemapStats(options: SitemapGeneratorOptions = {}): SitemapStats {
  const entries = buildSitemapEntries(options);

  let totalImagesCount = 0;
  entries.forEach((e) => {
    if (e.images) totalImagesCount += e.images.length;
  });

  return {
    totalUrls: entries.length,
    homepageCount: 1,
    categoriesCount: CATEGORIES.length,
    zonesCount: ESTATE_ZONES_LIST.length,
    businessesCount: options.businesses?.length || 0,
    storiesCount: options.stories?.length || 0,
    corePagesCount: 8,
    totalImagesCount,
    generatedAt: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }),
  };
}

/**
 * Generates robots.txt content with dynamic base URL configuration.
 */
export function generateRobotsTxt(baseUrl = DEFAULT_PRODUCTION_BASE_URL): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `# Robots.txt for KWEST (Kahawa West Neighborhood Directory)
# Canonical URL: ${cleanBase}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*?*filter=*

# Explicit Search Engine Allow Rules
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Sitemap Index Declaration
Sitemap: ${cleanBase}/sitemap.xml
Host: ${cleanBase.replace(/^https?:\/\//, '')}
`;
}

/**
 * Helper to download text content as a file in the user's browser.
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'application/xml'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to copy sitemap XML to clipboard.
 */
export async function copySitemapToClipboard(xml: string): Promise<boolean> {
  return await copyToClipboard(xml);
}
