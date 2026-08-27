import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, BusinessClaim, CommunityFeedback, BusinessApplication } from '../types';

// The user's Supabase project URL and anon key
const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wfsqnhujjqldcxnhnzvf.supabase.co';
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export const SUPABASE_URL = isValidHttpUrl(rawUrl) ? rawUrl : 'https://wfsqnhujjqldcxnhnzvf.supabase.co';
export const SUPABASE_ANON_KEY = typeof rawKey === 'string' ? rawKey.trim() : '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.length > 20 &&
  SUPABASE_ANON_KEY !== 'dummy_anon_fallback'
);

let clientInstance: SupabaseClient | null = null;
if (isValidHttpUrl(SUPABASE_URL) && isSupabaseConfigured) {
  try {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (initErr) {
    console.warn('Supabase client initialization warning, using local storage fallback:', initErr);
    clientInstance = null;
  }
}

export const supabase: SupabaseClient | null = clientInstance;

// Local storage backup keys for seamless preview & persistence
const CLAIMS_STORAGE_KEY = 'kwest_directory_claims';
const BUSINESSES_STORAGE_KEY = 'kwest_directory_custom_businesses';
const FEEDBACK_STORAGE_KEY = 'kwest_directory_feedback';
const APPLICATIONS_STORAGE_KEY = 'kwest_directory_applications';

export const saveBusinessClaim = async (claim: BusinessClaim): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. If Supabase is connected with active key, write to claims table
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('claims').insert([
        {
          business_id: claim.business_id,
          full_name: claim.full_name,
          phone_number: claim.phone_number,
          email: claim.email,
          business_role: claim.business_role,
          status: claim.status || 'pending',
          created_at: claim.created_at || new Date().toISOString(),
        }
      ]);
      if (error) {
        console.warn('Supabase insert warning, falling back to local sync:', error.message);
      }
    }

    // 2. Persist locally to browser storage for instantaneous UI updates
    const existingClaims: BusinessClaim[] = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
    existingClaims.unshift(claim);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(existingClaims));

    return { success: true };
  } catch (err: any) {
    console.error('Error saving claim:', err);
    // Fallback save locally
    const existingClaims: BusinessClaim[] = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
    existingClaims.unshift(claim);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(existingClaims));
    return { success: true };
  }
};

export const getSavedClaims = (): BusinessClaim[] => {
  try {
    return JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const generateBusinessSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const saveCustomizedBusiness = async (business: Business): Promise<{ success: boolean; error?: string }> => {
  try {
    const slug = business.slug || generateBusinessSlug(business.name);
    const normalizedBusiness: Business = {
      ...business,
      slug,
    };

    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('businesses').upsert([
        {
          id: normalizedBusiness.id,
          slug: normalizedBusiness.slug,
          name: normalizedBusiness.name,
          tagline: normalizedBusiness.tagline,
          category: normalizedBusiness.category,
          zone: normalizedBusiness.zone,
          landmark: normalizedBusiness.landmark,
          phone: normalizedBusiness.phone,
          whatsapp: normalizedBusiness.whatsapp,
          email: normalizedBusiness.email,
          is_claimed: true,
          rating: normalizedBusiness.rating,
          hero_image: normalizedBusiness.heroImage,
          gallery_images: normalizedBusiness.galleryImages,
          description: normalizedBusiness.description,
          services: normalizedBusiness.services,
          mpesa: normalizedBusiness.mpesa,
          social_links: normalizedBusiness.socialLinks,
          opening_hours: normalizedBusiness.openingHours,
          special_offer: normalizedBusiness.specialOffer,
          updated_at: new Date().toISOString(),
        }
      ]);
      if (error) console.warn('Supabase business upsert warning:', error.message);
    }

    // Local storage persistence
    const existing: Record<string, Business> = JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
    existing[normalizedBusiness.id] = normalizedBusiness;
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(existing));

    return { success: true };
  } catch (err: any) {
    console.error('Error saving customized business:', err);
    const slug = business.slug || generateBusinessSlug(business.name);
    const normalizedBusiness: Business = {
      ...business,
      slug,
    };
    const existing: Record<string, Business> = JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
    existing[normalizedBusiness.id] = normalizedBusiness;
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(existing));
    return { success: true };
  }
};

export const getCustomizedBusinesses = (): Record<string, Business> => {
  try {
    return JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const getStoredBusinesses = (seedBusinesses: Business[]): Business[] => {
  try {
    const custom = getCustomizedBusinesses();
    const seedMap = new Map<string, Business>();

    // 1. Process and merge seed businesses
    const mergedSeeds = seedBusinesses.map((seed) => {
      seedMap.set(seed.id, seed);
      if (custom[seed.id]) {
        const c = custom[seed.id];
        // Ensure slug is synced with updated name if name changed
        const currentSlug = c.slug || generateBusinessSlug(c.name || seed.name);
        return {
          ...seed,
          ...c,
          slug: currentSlug,
        };
      }
      return seed;
    });

    // 2. Also retrieve new custom listed businesses not in seeds
    const newCustomListings: Business[] = [];
    Object.keys(custom).forEach((id) => {
      if (!seedMap.has(id)) {
        const item = custom[id];
        newCustomListings.push({
          ...item,
          slug: item.slug || generateBusinessSlug(item.name),
        });
      }
    });

    return [...newCustomListings, ...mergedSeeds];
  } catch {
    return seedBusinesses;
  }
};

export const saveCommunityFeedback = async (feedback: CommunityFeedback): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('feedback').insert([feedback]);
    }
    const existing: CommunityFeedback[] = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    existing.unshift(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
};

export const getStoredFeedback = (businessId?: string): CommunityFeedback[] => {
  try {
    const list: CommunityFeedback[] = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    if (businessId) {
      return list.filter((f) => f.businessId === businessId);
    }
    return list;
  } catch {
    return [];
  }
};

export const saveBusinessApplication = async (app: BusinessApplication): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('applications').insert([app]);
    }
    const existing: BusinessApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]');
    existing.unshift(app);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
};

export const syncStoryToSupabase = async (story: any): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('community_stories').upsert([
        {
          id: story.id,
          title: story.title,
          subtitle: story.subtitle || null,
          category: story.category,
          zone: story.zone,
          content: story.content,
          excerpt: story.excerpt || null,
          image_url: story.imageUrl || null,
          image_caption: story.imageCaption || null,
          is_real_photo_confirmed: story.isRealPhotoConfirmed ?? true,
          author_name: story.authorName,
          author_role: story.authorRole,
          author_email: story.authorEmail,
          author_phone: story.authorPhone,
          date: story.date || new Date().toISOString().split('T')[0],
          read_time_minutes: story.readTimeMinutes || 3,
          featured: story.featured || false,
          status: story.status || 'pending_review',
          rejection_reason: story.rejectionReason || null,
          likes: story.likes || 0,
        },
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Supabase community story sync error:', err);
    return false;
  }
};

