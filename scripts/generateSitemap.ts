import fs from 'fs';
import path from 'path';
import { INITIAL_BUSINESSES } from '../src/data/businesses';
import { INITIAL_COMMUNITY_STORIES } from '../src/data/communityStories';
import { generateSitemapXml, generateRobotsTxt, DEFAULT_PRODUCTION_BASE_URL } from '../src/lib/sitemapGenerator';

const sitemapXml = generateSitemapXml({
  baseUrl: DEFAULT_PRODUCTION_BASE_URL,
  businesses: INITIAL_BUSINESSES,
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

console.log(`Successfully generated /public/sitemap.xml (${INITIAL_BUSINESSES.length} businesses, ${INITIAL_COMMUNITY_STORIES.length} stories).`);
console.log(`Successfully generated /public/robots.txt.`);
