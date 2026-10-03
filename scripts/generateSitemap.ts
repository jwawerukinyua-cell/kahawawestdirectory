import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_BUSINESSES } from '../src/data/businesses';
import { INITIAL_COMMUNITY_STORIES } from '../src/data/communityStories';
import { generateSitemapXml, generateRobotsTxt, DEFAULT_PRODUCTION_BASE_URL } from '../src/lib/sitemapGenerator';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../src/lib/supabase';
import { Business } from '../src/types';

function isValidHttpUrl(str?: string): boolean {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
}

async function run() {
  const envUrl = process.env.VITE_SUPABASE_URL;
  const supabaseUrl = isValidHttpUrl(envUrl) ? envUrl! : DEFAULT_SUPABASE_URL;

  const envKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseKey = (envKey && envKey.startsWith('ey')) ? envKey : DEFAULT_SUPABASE_ANON_KEY;

  let combinedBusinesses: Business[] = [...INITIAL_BUSINESSES];

  if (supabaseUrl && supabaseKey) {
    try {
      console.log('Connecting to Supabase to fetch live directory listings for sitemap...');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: dbRows, error } = await supabase
        .from('businesses')
        .select('*');

      if (error) {
        console.warn('Could not fetch businesses from Supabase (using static fallback):', error.message);
      } else if (dbRows && dbRows.length > 0) {
        console.log(`Fetched ${dbRows.length} active listings from Supabase.`);
        
        // Merge Supabase businesses into array, overriding or appending
        const bizMap = new Map<string, Business>();
        INITIAL_BUSINESSES.forEach((b) => bizMap.set(b.id, b));

        const PURGED_TEST_BUSINESS_IDS = new Set([
          'test-inspect-biz',
          'kw-biz-kimondo-tech',
          'kw-biz-bonata-cleaners',
          'kw-biz-bewai-transporters',
          'kw-test-approved-123',
          'kw-biz-muriithi-hardware',
          'kw-biz-kj-fresh-foods',
        ]);
        const PURGED_TEST_BUSINESS_NAMES = new Set([
          'ukweli furniture crafts',
          'muriithi general hardware',
          'test approved biz',
          'test business',
          'kimondo tech & laptop repair doctor',
          'kimondo tech & laptop',
          'bonata cleaners',
          'bewai transporters',
          'kj',
        ]);

        dbRows.forEach((row: any) => {
          if (row.status === 'archived' || row.status === 'rejected') return;
          if (PURGED_TEST_BUSINESS_IDS.has(row.id)) return;
          const norm = (row.name || '').toLowerCase().trim();
          if (PURGED_TEST_BUSINESS_NAMES.has(norm)) return;

          const biz: Business = {
            id: row.id,
            name: row.name,
            tagline: row.tagline || '',
            category: row.category,
            zone: row.zone,
            landmark: row.landmark || '',
            description: row.description || '',
            phone: row.phone || '',
            whatsapp: row.whatsapp || row.phone || '',
            email: row.email || undefined,
            rating: row.rating ? parseFloat(row.rating) : 4.5,
            reviewCount: row.review_count || 1,
            heroImage: row.hero_image,
            galleryImages: row.gallery_images || [],
            isVerified: row.is_verified || false,
            slug: row.slug || row.id,
          };
          bizMap.set(biz.id, biz);
        });

        combinedBusinesses = Array.from(bizMap.values());
      }
    } catch (err) {
      console.warn('Network error querying Supabase during sitemap generation. Falling back to local data:', err);
    }
  }

  const sitemapXml = generateSitemapXml({
    baseUrl: DEFAULT_PRODUCTION_BASE_URL,
    businesses: combinedBusinesses,
    stories: INITIAL_COMMUNITY_STORIES,
    includeImages: true,
  });

  const robotsTxt = generateRobotsTxt(DEFAULT_PRODUCTION_BASE_URL);

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`Successfully generated /public/sitemap.xml (${combinedBusinesses.length} businesses, ${INITIAL_COMMUNITY_STORIES.length} stories).`);
  console.log(`Successfully generated /public/robots.txt.`);
}

run().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
