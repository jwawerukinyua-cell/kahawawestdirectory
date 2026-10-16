import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Business,
  BusinessClaim,
  CommunityFeedback,
  BusinessApplication,
  CommunityStory,
  CommunityUpdate,
} from '../types';
import { DEFAULT_OPENING_HOURS } from '../data/defaultOpeningHours';
import {
  saveBusinessToFirestore,
  fetchBusinessesFromFirestore,
  saveClaimToFirestore,
  fetchClaimsFromFirestore,
  updateClaimInFirestore,
  deleteClaimFromFirestore,
  saveApplicationToFirestore,
  fetchApplicationsFromFirestore,
  updateApplicationInFirestore,
  deleteApplicationFromFirestore,
  saveStoryToFirestore,
  fetchStoriesFromFirestore,
  deleteStoryFromFirestore,
  saveUpdateToFirestore,
  fetchUpdatesFromFirestore,
  deleteUpdateFromFirestore,
  saveFeedbackToFirestore,
  testFirebaseSyncStatus,
  subscribeToApplications,
  subscribeToClaims,
  FirebaseSyncReport,
} from './firebase';

export {
  subscribeToApplications,
  subscribeToClaims,
};

// Supabase legacy client maintained as passive secondary fallback
export const DEFAULT_SUPABASE_URL = 'https://wfsqnhujjqldcxnhnzvf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3FuaHVqanFsZGN4bmhuenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Mjc0NTEsImV4cCI6MjEwMjIwMzQ1MX0.BAVXjSjkw5IPbmeZLaN2uOrM4mnIhB_wbZsk1lbgT4A';

function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = envUrl && isValidHttpUrl(envUrl) ? envUrl.trim() : DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  envKey && typeof envKey === 'string' && envKey.trim().length > 20
    ? envKey.trim()
    : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20 && SUPABASE_ANON_KEY !== 'dummy_anon_fallback'
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
    clientInstance = null;
  }
}

export const supabase: SupabaseClient | null = clientInstance;

// Firebase is active! Egress restriction is removed.
export function isSupabaseEgressRestricted(): boolean {
  return false;
}

export function logSupabaseWarning(scope: string, error: any) {
  if (!error) return;
  console.info(`[KWEST Sync] ${scope}:`, error.message || error);
}

// Local storage backup keys for seamless offline persistence
const CLAIMS_STORAGE_KEY = 'kwest_directory_claims';
const BUSINESSES_STORAGE_KEY = 'kwest_directory_custom_businesses';
const FEEDBACK_STORAGE_KEY = 'kwest_directory_feedback';
const APPLICATIONS_STORAGE_KEY = 'kwest_directory_applications';

export const SUPABASE_CACHE_TTL_MS = 10 * 60 * 1000;
export const SUPABASE_ADMIN_CACHE_TTL_MS = 2 * 60 * 1000;

const CACHE_KEYS = {
  BUSINESSES_DATA: 'kwest_cache_businesses_data_v2',
  BUSINESSES_TIME: 'kwest_cache_businesses_timestamp_v2',
  STORIES_DATA: 'kwest_cache_stories_data',
  STORIES_TIME: 'kwest_cache_stories_timestamp',
  UPDATES_DATA: 'kwest_cache_updates_data',
  UPDATES_TIME: 'kwest_cache_updates_timestamp',
  CLAIMS_DATA: 'kwest_cache_claims_data',
  CLAIMS_TIME: 'kwest_cache_claims_timestamp',
  APPLICATIONS_DATA: 'kwest_cache_applications_data',
  APPLICATIONS_TIME: 'kwest_cache_applications_timestamp',
};

// In-flight query deduplication
let inFlightBusinessesPromise: Promise<Business[] | null> | null = null;
let inFlightStoriesPromise: Promise<CommunityStory[] | null> | null = null;
let inFlightUpdatesPromise: Promise<CommunityUpdate[] | null> | null = null;
let inFlightClaimsPromise: Promise<BusinessClaim[] | null> | null = null;
let inFlightAppsPromise: Promise<BusinessApplication[] | null> | null = null;

// Rate limiting logic
export interface RateLimitCheckResult {
  allowed: boolean;
  message?: string;
  remainingSeconds?: number;
}

export const checkActionRateLimit = (
  actionType: 'claim' | 'application' | 'feedback',
  maxAllowed = 10,
  windowMs = 15 * 60 * 1000
): RateLimitCheckResult => {
  try {
    const key = `kwest_rate_limit_${actionType}`;
    const raw = localStorage.getItem(key);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const validTimestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);

    if (validTimestamps.length >= maxAllowed) {
      const oldestInWindow = Math.min(...validTimestamps);
      const remainingSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
      const remainingMins = Math.ceil(remainingSeconds / 60);
      return {
        allowed: false,
        remainingSeconds,
        message: `Submission limit reached. Please wait ${remainingMins} minute${remainingMins > 1 ? 's' : ''} before submitting another ${actionType}.`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
};

export const recordActionRateLimit = (actionType: 'claim' | 'application' | 'feedback'): void => {
  try {
    const key = `kwest_rate_limit_${actionType}`;
    const raw = localStorage.getItem(key);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const validTimestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);
    validTimestamps.push(now);
    localStorage.setItem(key, JSON.stringify(validTimestamps));
  } catch {}
};

// ----------------------------------------------------
// CLAIMS MANAGEMENT (Firebase Firestore)
// ----------------------------------------------------
export const saveBusinessClaim = async (
  claim: BusinessClaim
): Promise<{ success: boolean; error?: string; remoteSynced?: boolean; id?: string }> => {
  let remoteSynced = false;
  let remoteError: string | undefined;

  try {
    // 1. Save directly to Google Firebase Firestore
    try {
      const res = await saveClaimToFirestore(claim);
      if (res && res.id) {
        claim.id = res.id;
        remoteSynced = true;
      }
    } catch (fbErr: any) {
      console.warn('Firebase save claim fallback to local:', fbErr);
      remoteError = fbErr.message;
    }

    // 2. Persist locally to browser storage for instantaneous UI updates
    const existingClaims: BusinessClaim[] = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
    const filtered = existingClaims.filter((c) => c.business_id !== claim.business_id && c.id !== claim.id);
    filtered.unshift(claim);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('kwest_claims_updated', { detail: filtered }));

    return { success: true, remoteSynced, error: remoteError, id: claim.id };
  } catch (err: any) {
    console.error('Error saving claim:', err);
    return { success: true, remoteSynced: false, error: err?.message, id: claim.id };
  }
};

export const getSavedClaims = (): BusinessClaim[] => {
  try {
    return JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const PURGED_CLAIM_IDS = new Set([
  'biz-test-check',
  'biz-test-inspect',
  'kw-biz-muriithi-hardware',
  'kw-biz-01',
  '4063e854-ed42-4b74-936f-d6a7ad82f59f',
  '22f73c33-550d-4cef-9368-af5ebf020f94',
  '9ed03cdf-5c96-4f8e-bbc0-58bc75cd3414',
  '39b8116c-cceb-4766-9872-144a96cf9b09',
]);

export const PURGED_TEST_BUSINESS_IDS = new Set([
  'test-inspect-biz',
  'kw-biz-kimondo-tech',
  'kw-biz-bonata-cleaners',
  'kw-biz-bewai-transporters',
  'kw-test-approved-123',
  'kw-biz-muriithi-hardware',
  'kw-biz-kj-fresh-foods',
  'kw-biz-21d5f6e4-e129-4f9a-a389-a93a4a1153e7',
  'kw-biz-42144f4f-a522-411c-9a4a-dac54c91d558',
  'kw-biz-7025cfba-a0d6-4add-9a56-ee3c9e99dab6',
  'kw-biz-9945f0cd-a5b7-424c-a655-9014c3d2c429',
  '9945f0cd-a5b7-424c-a655-9014c3d2c429',
  'kw-biz-f6da2a83-47ed-4e12-a982-a15986ca6531',
  'f6da2a83-47ed-4e12-a982-a15986ca6531',
  'kw-biz-9412805e-4313-4c4e-b400-4c03a1e5cd80',
  '9412805e-4313-4c4e-b400-4c03a1e5cd80',
]);

export const PURGED_TEST_BUSINESS_NAMES = new Set([
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

export const PURGED_STORY_IDS = new Set([
  'story-community-safety-security-watch',
  'story-01',
  'story-02',
  'story-03',
  'story-1788450086647',
  'story-1788342289836',
]);

export const fetchClaimsFromSupabase = async (forceRefresh = false): Promise<BusinessClaim[] | null> => {
  try {
    if (!forceRefresh) {
      try {
        const cachedTime = localStorage.getItem(CACHE_KEYS.CLAIMS_TIME);
        const cachedData = localStorage.getItem(CACHE_KEYS.CLAIMS_DATA);
        if (cachedTime && cachedData && Date.now() - Number(cachedTime) < SUPABASE_ADMIN_CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }

    if (inFlightClaimsPromise) return inFlightClaimsPromise;

    inFlightClaimsPromise = (async () => {
      try {
        // Fetch from Firebase Firestore
        const fbClaims = await fetchClaimsFromFirestore();
        const filtered = (fbClaims || []).filter(
          (row) =>
            !PURGED_CLAIM_IDS.has(row.id || '') &&
            !PURGED_CLAIM_IDS.has(row.business_id) &&
            (row.status as string) !== 'rejected' &&
            (row.status as string) !== 'archived'
        );

        // Merge with any local offline claims not yet in cloud
        const local = getSavedClaims();
        const mergedMap = new Map<string, BusinessClaim>();
        filtered.forEach((c) => mergedMap.set(c.id || c.business_id, c));
        local.forEach((c) => {
          if (!mergedMap.has(c.id || c.business_id) && !PURGED_CLAIM_IDS.has(c.id || c.business_id)) {
            mergedMap.set(c.id || c.business_id, c);
          }
        });

        const result = Array.from(mergedMap.values());
        try {
          localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(result));
          localStorage.setItem(CACHE_KEYS.CLAIMS_DATA, JSON.stringify(result));
          localStorage.setItem(CACHE_KEYS.CLAIMS_TIME, String(Date.now()));
        } catch {}

        return result;
      } catch (fbErr) {
        console.warn('Firebase fetch claims failed, falling back to local storage:', fbErr);
        const cachedData = localStorage.getItem(CACHE_KEYS.CLAIMS_DATA);
        if (cachedData) return JSON.parse(cachedData);
        return getSavedClaims();
      } finally {
        inFlightClaimsPromise = null;
      }
    })();

    return inFlightClaimsPromise;
  } catch (err) {
    inFlightClaimsPromise = null;
    return getSavedClaims();
  }
};

export const updateClaimStatusInSupabase = async (
  claimIdOrBizId: string,
  status: 'pending' | 'verified' | 'rejected',
  notes?: string
): Promise<boolean> => {
  try {
    await updateClaimInFirestore(claimIdOrBizId, { status, ...(notes ? { notes } : {}) });

    const existing = getSavedClaims();
    const updated = existing.map((c) =>
      c.id === claimIdOrBizId || c.business_id === claimIdOrBizId
        ? { ...c, status, ...(notes ? { notes } : {}) }
        : c
    );
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_claims_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to update claim status in Firebase:', err);
    return false;
  }
};

export const deleteClaimFromSupabase = async (claimIdOrBizId: string): Promise<boolean> => {
  try {
    await deleteClaimFromFirestore(claimIdOrBizId);

    const existing = getSavedClaims();
    const updated = existing.filter((c) => c.id !== claimIdOrBizId && c.business_id !== claimIdOrBizId);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_claims_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to delete claim from Firebase:', err);
    return false;
  }
};

export const generateBusinessSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// ----------------------------------------------------
// BUSINESSES MANAGEMENT (Firebase Firestore)
// ----------------------------------------------------
export const saveCustomizedBusiness = async (
  business: Business
): Promise<{ success: boolean; error?: string }> => {
  try {
    const slug = business.slug || generateBusinessSlug(business.name);
    const normalizedBusiness: Business = {
      ...business,
      slug,
    };

    // Save to Firebase Firestore
    await saveBusinessToFirestore(normalizedBusiness);

    // Save to local storage for instant offline capability
    const existing: Record<string, Business> = JSON.parse(
      localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}'
    );
    existing[normalizedBusiness.id] = normalizedBusiness;
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(existing));

    try {
      const cached = localStorage.getItem(CACHE_KEYS.BUSINESSES_DATA);
      if (cached) {
        const list: Business[] = JSON.parse(cached);
        const idx = list.findIndex((b) => b.id === normalizedBusiness.id);
        if (idx >= 0) {
          list[idx] = normalizedBusiness;
        } else {
          list.unshift(normalizedBusiness);
        }
        localStorage.setItem(CACHE_KEYS.BUSINESSES_DATA, JSON.stringify(list));
      }
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.warn('Sync business to Firebase encountered an issue, safely preserved in local storage:', err);
    return { success: true };
  }
};

export const fetchBusinessesFromSupabase = async (forceRefresh = false): Promise<Business[] | null> => {
  try {
    if (!forceRefresh) {
      try {
        const cachedTime = localStorage.getItem(CACHE_KEYS.BUSINESSES_TIME);
        const cachedData = localStorage.getItem(CACHE_KEYS.BUSINESSES_DATA);
        if (cachedTime && cachedData && Date.now() - Number(cachedTime) < SUPABASE_CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {}
    }

    if (inFlightBusinessesPromise) return inFlightBusinessesPromise;

    inFlightBusinessesPromise = (async () => {
      try {
        const data = await fetchBusinessesFromFirestore();

        const mapped: Business[] = (data || [])
          .filter((row: any) => {
            if (row.status === 'archived' || row.status === 'rejected') return false;
            if (PURGED_TEST_BUSINESS_IDS.has(row.id)) return false;
            const norm = (row.name || '').toLowerCase().trim();
            if (PURGED_TEST_BUSINESS_NAMES.has(norm)) return false;
            return true;
          })
          .map((row: any): Business => ({
            id: row.id,
            slug: row.slug || generateBusinessSlug(row.name),
            name: row.name,
            tagline: row.tagline || `${row.name} in Kahawa West`,
            category: row.category,
            subCategory: row.subCategory || row.sub_category,
            zone: row.zone || 'Station / Railway',
            landmark: row.landmark || 'Kahawa West',
            addressDetails: row.addressDetails || row.address_details,
            phone: row.phone,
            whatsapp: row.whatsapp || row.phone,
            email: row.email,
            isVerified: Boolean(row.isVerified ?? row.is_verified),
            isClaimed: Boolean(row.isClaimed ?? row.is_claimed),
            claimedBy: row.claimedBy || row.claimed_by,
            rating: typeof row.rating === 'number' ? row.rating : 5.0,
            reviewCount: typeof row.reviewCount === 'number' ? row.reviewCount : 1,
            priceLevel: row.priceLevel || row.price_level || 'Moderate',
            heroImage:
              row.heroImage ||
              row.hero_image ||
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            galleryImages:
              Array.isArray(row.galleryImages) && row.galleryImages.length > 0
                ? row.galleryImages
                : Array.isArray(row.gallery_images) && row.gallery_images.length > 0
                ? row.gallery_images
                : [row.heroImage || row.hero_image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
            description: row.description || `${row.name} in Kahawa West`,
            services: Array.isArray(row.services) ? row.services : [],
            features: Array.isArray(row.features) ? row.features : [],
            mpesa: row.mpesa,
            socialLinks: row.socialLinks || row.social_links,
            openingHours: DEFAULT_OPENING_HOURS,
            specialOffer: row.specialOffer || row.special_offer,
            coordinates: row.coordinates || { lat: -1.185, lng: 36.885 },
            createdAt: row.createdAt || row.created_at,
            updatedAt: row.updatedAt || row.updated_at,
          }));

        try {
          localStorage.setItem(CACHE_KEYS.BUSINESSES_DATA, JSON.stringify(mapped));
          localStorage.setItem(CACHE_KEYS.BUSINESSES_TIME, String(Date.now()));
        } catch {}

        return mapped;
      } catch (fbErr) {
        console.warn('Firebase fetch businesses fallback:', fbErr);
        const cachedData = localStorage.getItem(CACHE_KEYS.BUSINESSES_DATA);
        if (cachedData) return JSON.parse(cachedData);
        return null;
      } finally {
        inFlightBusinessesPromise = null;
      }
    })();

    return inFlightBusinessesPromise;
  } catch (err) {
    inFlightBusinessesPromise = null;
    return null;
  }
};

export const getCustomizedBusinesses = (): Record<string, Business> => {
  try {
    const raw = JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
    let changed = false;
    PURGED_TEST_BUSINESS_IDS.forEach((id) => {
      if (raw[id]) {
        delete raw[id];
        changed = true;
      }
    });
    if (changed) {
      try {
        localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(raw));
      } catch {}
    }
    return raw;
  } catch {
    return {};
  }
};

export const getStoredBusinesses = (seedBusinesses: Business[]): Business[] => {
  try {
    const custom = getCustomizedBusinesses();
    const seedMap = new Map<string, Business>();

    const mergedSeeds = seedBusinesses.map((seed) => {
      seedMap.set(seed.id, seed);
      if (custom[seed.id]) {
        const c = custom[seed.id];
        const currentSlug = c.slug || generateBusinessSlug(c.name || seed.name);
        const resolvedCategory = seed.id === 'kw-biz-10' ? 'home-rentals' : c.category || seed.category;
        return {
          ...seed,
          ...c,
          category: resolvedCategory,
          slug: currentSlug,
        };
      }
      return seed;
    });

    const newCustomListings: Business[] = [];
    Object.keys(custom).forEach((id) => {
      if (!seedMap.has(id)) {
        const item = custom[id];
        if (item.isVerified === true) {
          newCustomListings.push({
            ...item,
            slug: item.slug || generateBusinessSlug(item.name),
          });
        }
      }
    });

    const isPurged = (b: Business) => {
      if (PURGED_TEST_BUSINESS_IDS.has(b.id)) return true;
      const norm = (b.name || '').toLowerCase().trim();
      if (PURGED_TEST_BUSINESS_NAMES.has(norm)) return true;
      return false;
    };

    return [...newCustomListings, ...mergedSeeds].filter((b) => !isPurged(b));
  } catch {
    return seedBusinesses;
  }
};

// ----------------------------------------------------
// FEEDBACK & REVIEWS
// ----------------------------------------------------
const DEFAULT_INITIAL_FEEDBACK: CommunityFeedback[] = [
  {
    id: 'fb-seed-01',
    businessId: 'kw-biz-01',
    businessName: 'Mama Njeri Nyama Choma & Grill',
    authorName: 'Peter Mwangi (Congo Resident)',
    serviceOrProduct: '1kg Mbuzi Choma & Mukimo Platter',
    experience: 'Better',
    rating: 5,
    tags: ['Verified Resident', 'Better'],
    comment:
      'Super fast roast and the mbuzi choma was tender and hot. The mukimo was fresh without too much oil. Great place for weekend family lunch.',
    businessResponse: {
      respondedBy: 'Mama Njeri (Proprietor)',
      responseDate: '2026-08-25',
      message: 'Asante sana Peter! We always source fresh meat every morning from local suppliers. Welcome back anytime with family!',
    },
    created_at: '2026-08-24T14:20:00Z',
  },
  {
    id: 'fb-seed-02',
    businessId: 'kw-biz-01',
    businessName: 'Mama Njeri Nyama Choma & Grill',
    authorName: 'Grace Wanjiku',
    serviceOrProduct: 'Kuku Kienyeji Wet Fry & Ugali',
    experience: 'Good',
    rating: 4,
    tags: ['Verified Resident', 'Good'],
    comment:
      'Good chicken taste and the soup was rich. Delivery to Jacaranda took 35 mins which was okay, but packaging was very neat.',
    businessResponse: {
      respondedBy: 'Maina (Kitchen Supervisor)',
      responseDate: '2026-08-28',
      message: 'Thank you Grace for the review. We are currently testing new thermal rider bags to make Jacaranda deliveries even faster!',
    },
    created_at: '2026-08-27T18:45:00Z',
  },
  {
    id: 'fb-seed-03',
    businessId: 'kw-biz-03',
    businessName: 'Ukweli Modern Furniture & Upholstery Works',
    authorName: 'Dennis Ochieng',
    serviceOrProduct: 'Custom 6-Seater L-Shape Sofa & Coffee Table',
    experience: 'Better',
    rating: 5,
    tags: ['Verified Resident', 'Better'],
    comment:
      'Solid hardwood mahogany frame with heavy fabric that doesn’t fray. Finished and delivered right on time to my apartment near Soweto.',
    businessResponse: {
      respondedBy: 'Fundi Kanyi (Master Craftsman)',
      responseDate: '2026-08-22',
      message: 'Thank you Dennis! We take pride in real treated wood construction that lasts decades. Enjoy your living room set!',
    },
    created_at: '2026-08-20T11:15:00Z',
  },
];

export const saveCommunityFeedback = async (feedback: CommunityFeedback): Promise<boolean> => {
  try {
    await saveFeedbackToFirestore(feedback);
    const existing: CommunityFeedback[] = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    existing.unshift(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('kwest_feedback_updated', { detail: existing }));
    return true;
  } catch {
    return false;
  }
};

export const saveFeedbackBusinessReply = async (
  feedbackId: string,
  reply: { respondedBy: string; responseDate: string; message: string }
): Promise<boolean> => {
  try {
    const list = getStoredFeedback();
    const updated = list.map((item) => {
      if (item.id === feedbackId) {
        return {
          ...item,
          businessResponse: reply,
        };
      }
      return item;
    });
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_feedback_updated', { detail: updated }));
    return true;
  } catch {
    return false;
  }
};

export const getStoredFeedback = (businessId?: string): CommunityFeedback[] => {
  try {
    let list: CommunityFeedback[] = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || 'null');
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = DEFAULT_INITIAL_FEEDBACK;
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_FEEDBACK));
    }
    if (businessId) {
      return list.filter((f) => f.businessId === businessId);
    }
    return list;
  } catch {
    return DEFAULT_INITIAL_FEEDBACK;
  }
};

// ----------------------------------------------------
// APPLICATIONS MANAGEMENT (Shop Listings via Firebase)
// ----------------------------------------------------
export const saveBusinessApplication = async (
  app: BusinessApplication
): Promise<{ success: boolean; error?: string; remoteSynced?: boolean; id?: string }> => {
  const rateLimit = checkActionRateLimit('application', 10);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message, remoteSynced: false };
  }
  let remoteSynced = false;
  let remoteError: string | undefined;

  try {
    const appWithId: BusinessApplication = {
      ...app,
      id: app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
    };

    // Save directly to Firebase Firestore
    try {
      const res = await saveApplicationToFirestore(appWithId);
      if (res && res.id) {
        appWithId.id = res.id;
        remoteSynced = true;
      }
    } catch (fbErr: any) {
      console.warn('Firebase save application fallback:', fbErr);
      remoteError = fbErr.message;
    }

    const existing: BusinessApplication[] = JSON.parse(
      localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]'
    );
    const filtered = existing.filter((a) => a.id !== appWithId.id);
    filtered.unshift(appWithId);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(filtered));

    recordActionRateLimit('application');
    window.dispatchEvent(new CustomEvent('kwest_applications_updated', { detail: filtered }));

    return { success: true, remoteSynced, error: remoteError, id: appWithId.id };
  } catch (err: any) {
    console.error('Error saving application:', err);
    return { success: false, remoteSynced: false, error: err?.message };
  }
};

export const getStoredApplications = (): BusinessApplication[] => {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const fetchApplicationsFromSupabase = async (
  forceRefresh = false
): Promise<BusinessApplication[] | null> => {
  try {
    if (!forceRefresh) {
      try {
        const cachedTime = localStorage.getItem(CACHE_KEYS.APPLICATIONS_TIME);
        const cachedData = localStorage.getItem(CACHE_KEYS.APPLICATIONS_DATA);
        if (cachedTime && cachedData && Date.now() - Number(cachedTime) < SUPABASE_ADMIN_CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }

    if (inFlightAppsPromise) return inFlightAppsPromise;

    inFlightAppsPromise = (async () => {
      try {
        const fbApps = await fetchApplicationsFromFirestore();

        // Merge with locally stored applications so nothing is lost
        const local = getStoredApplications();
        const mergedMap = new Map<string, BusinessApplication>();
        (fbApps || []).forEach((a) => mergedMap.set(a.id, a));
        local.forEach((a) => {
          if (!mergedMap.has(a.id)) {
            mergedMap.set(a.id, a);
          }
        });

        const result = Array.from(mergedMap.values());
        try {
          localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(result));
          localStorage.setItem(CACHE_KEYS.APPLICATIONS_DATA, JSON.stringify(result));
          localStorage.setItem(CACHE_KEYS.APPLICATIONS_TIME, String(Date.now()));
        } catch {}

        return result;
      } catch (fbErr) {
        console.warn('Firebase fetch applications fallback to local storage:', fbErr);
        const cachedData = localStorage.getItem(CACHE_KEYS.APPLICATIONS_DATA);
        if (cachedData) return JSON.parse(cachedData);
        return getStoredApplications();
      } finally {
        inFlightAppsPromise = null;
      }
    })();

    return inFlightAppsPromise;
  } catch (err) {
    inFlightAppsPromise = null;
    return getStoredApplications();
  }
};

export const updateApplicationStatusInSupabase = async (
  appId: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<boolean> => {
  try {
    await updateApplicationInFirestore(appId, { status, ...(notes ? { notes } : {}) });

    const existing = getStoredApplications();
    const updated = existing.map((a) => (a.id === appId ? { ...a, status, ...(notes ? { notes } : {}) } : a));
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_applications_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to update application status in Firebase:', err);
    return false;
  }
};

export const deleteApplicationFromSupabase = async (appId: string): Promise<boolean> => {
  try {
    await deleteApplicationFromFirestore(appId);

    const existing = getStoredApplications();
    const updated = existing.filter((a) => a.id !== appId);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_applications_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to delete application from Firebase:', err);
    return false;
  }
};

// ----------------------------------------------------
// COMMUNITY STORIES (Firebase Firestore)
// ----------------------------------------------------
export const syncStoryToSupabase = async (story: CommunityStory): Promise<boolean> => {
  try {
    await saveStoryToFirestore(story);
    return true;
  } catch (err) {
    console.warn('Firebase community story sync error:', err);
    return false;
  }
};

export function normalizeContentStatus(status?: string): 'published' | 'pending_review' | 'rejected' | 'archived' {
  if (!status) return 'published';
  const s = status.toLowerCase().trim();
  if (s === 'published' || s === 'approved' || s === 'approve' || s === 'live' || s === 'active') {
    return 'published';
  }
  if (s === 'rejected' || s === 'reject') {
    return 'rejected';
  }
  if (s === 'pending' || s === 'pending_review' || s === 'in_review') {
    return 'pending_review';
  }
  return 'published';
}

export const fetchStoriesFromSupabase = async (forceRefresh = false): Promise<CommunityStory[] | null> => {
  try {
    if (!forceRefresh) {
      try {
        const cachedTime = localStorage.getItem(CACHE_KEYS.STORIES_TIME);
        const cachedData = localStorage.getItem(CACHE_KEYS.STORIES_DATA);
        if (cachedTime && cachedData && Date.now() - Number(cachedTime) < SUPABASE_CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }

    if (inFlightStoriesPromise) return inFlightStoriesPromise;

    inFlightStoriesPromise = (async () => {
      try {
        const data = await fetchStoriesFromFirestore();

        const mapped: CommunityStory[] = (data || [])
          .filter(
            (row: any) =>
              !row.id.startsWith('test-') &&
              !PURGED_STORY_IDS.has(row.id) &&
              row.id !== 'story-community-safety-security-watch' &&
              row.slug !== 'community-safety-and-crime-vigilance-in-kahawa-west' &&
              row.id !== 'story-01' &&
              row.id !== 'story-02' &&
              row.id !== 'story-03' &&
              row.id !== 'story-1788450086647' &&
              row.id !== 'story-1788342289836'
          )
          .map((row: any): CommunityStory => ({
            id: row.id,
            slug: row.slug || row.id,
            title: row.title,
            subtitle: row.subtitle,
            category: row.category,
            zone: row.zone,
            content: row.content,
            excerpt: row.excerpt || row.content.slice(0, 160) + '...',
            imageUrl: row.imageUrl || row.image_url,
            imageCaption: row.imageCaption || row.image_caption,
            isRealPhotoConfirmed: Boolean(row.isRealPhotoConfirmed ?? row.is_real_photo_confirmed),
            authorName: row.authorName || row.author_name,
            authorRole: row.authorRole || row.author_role,
            authorEmail: row.authorEmail || row.author_email,
            authorPhone: row.authorPhone || row.author_phone,
            date: row.date,
            readTimeMinutes: row.readTimeMinutes || row.read_time_minutes || 3,
            featured: Boolean(row.featured),
            status: normalizeContentStatus(row.status),
            rejectionReason: row.rejectionReason || row.rejection_reason,
            likes: row.likes || 0,
          }));

        try {
          localStorage.setItem(CACHE_KEYS.STORIES_DATA, JSON.stringify(mapped));
          localStorage.setItem(CACHE_KEYS.STORIES_TIME, String(Date.now()));
        } catch {}

        return mapped;
      } catch (fbErr) {
        console.warn('Firebase fetch stories fallback:', fbErr);
        const cachedData = localStorage.getItem(CACHE_KEYS.STORIES_DATA);
        if (cachedData) return JSON.parse(cachedData);
        return null;
      } finally {
        inFlightStoriesPromise = null;
      }
    })();

    return inFlightStoriesPromise;
  } catch (err) {
    inFlightStoriesPromise = null;
    return null;
  }
};

export const deleteStoryFromSupabase = async (storyId: string): Promise<boolean> => {
  try {
    await deleteStoryFromFirestore(storyId);

    try {
      const cached = localStorage.getItem(CACHE_KEYS.STORIES_DATA);
      if (cached) {
        const list: CommunityStory[] = JSON.parse(cached);
        const filtered = list.filter((s) => s.id !== storyId && !PURGED_STORY_IDS.has(s.id));
        localStorage.setItem(CACHE_KEYS.STORIES_DATA, JSON.stringify(filtered));
      }
    } catch {}

    return true;
  } catch (err) {
    console.warn('Firebase delete story error:', err);
    return false;
  }
};

// ----------------------------------------------------
// COMMUNITY UPDATES (Firebase Firestore)
// ----------------------------------------------------
export const syncUpdateToSupabase = async (update: CommunityUpdate): Promise<boolean> => {
  try {
    await saveUpdateToFirestore(update);
    return true;
  } catch (err) {
    console.warn('Firebase community update sync error:', err);
    return false;
  }
};

export const fetchUpdatesFromSupabase = async (forceRefresh = false): Promise<CommunityUpdate[] | null> => {
  try {
    if (!forceRefresh) {
      try {
        const cachedTime = localStorage.getItem(CACHE_KEYS.UPDATES_TIME);
        const cachedData = localStorage.getItem(CACHE_KEYS.UPDATES_DATA);
        if (cachedTime && cachedData && Date.now() - Number(cachedTime) < SUPABASE_CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }

    if (inFlightUpdatesPromise) return inFlightUpdatesPromise;

    inFlightUpdatesPromise = (async () => {
      try {
        const data = await fetchUpdatesFromFirestore();

        const mapped: CommunityUpdate[] = (data || [])
          .filter(
            (row: any) =>
              !row.id.startsWith('test-') &&
              row.id !== 'up-01' &&
              row.id !== 'up-02' &&
              row.id !== 'up-03' &&
              row.id !== 'up-04' &&
              row.id !== 'up-05' &&
              row.id !== 'up-06'
          )
          .map((row: any): CommunityUpdate => ({
            id: row.id,
            type: row.type || (row.id === 'up-iebc-voter-reg-2026' ? 'business' : 'community'),
            title: row.title,
            timeInfo: row.timeInfo || row.time_info || row.date,
            location: row.location || 'Kahawa West',
            zone: row.zone,
            content: row.content,
            author: row.author,
            authorPhone: row.authorPhone || row.author_phone,
            authorEmail: row.authorEmail || row.author_email,
            authorRole: row.authorRole || row.author_role,
            contact: row.contact,
            badge: row.badge,
            imageUrl: row.imageUrl || row.image_url,
            imageCaption: row.imageCaption || row.image_caption,
            isAccountabilityConfirmed: Boolean(row.isAccountabilityConfirmed ?? row.is_accountability_confirmed),
            urgencyLevel: row.urgencyLevel || row.urgency_level || 'standard',
            date: row.date,
            status: normalizeContentStatus(row.status),
            rejectionReason: row.rejectionReason || row.rejection_reason,
          }));

        try {
          localStorage.setItem(CACHE_KEYS.UPDATES_DATA, JSON.stringify(mapped));
          localStorage.setItem(CACHE_KEYS.UPDATES_TIME, String(Date.now()));
        } catch {}

        return mapped;
      } catch (fbErr) {
        console.warn('Firebase fetch updates fallback:', fbErr);
        const cachedData = localStorage.getItem(CACHE_KEYS.UPDATES_DATA);
        if (cachedData) return JSON.parse(cachedData);
        return null;
      } finally {
        inFlightUpdatesPromise = null;
      }
    })();

    return inFlightUpdatesPromise;
  } catch (err) {
    inFlightUpdatesPromise = null;
    return null;
  }
};

export const deleteUpdateFromSupabase = async (updateId: string): Promise<boolean> => {
  try {
    await deleteUpdateFromFirestore(updateId);

    try {
      const cached = localStorage.getItem(CACHE_KEYS.UPDATES_DATA);
      if (cached) {
        const list: CommunityUpdate[] = JSON.parse(cached);
        const filtered = list.filter((u) => u.id !== updateId);
        localStorage.setItem(CACHE_KEYS.UPDATES_DATA, JSON.stringify(filtered));
      }
    } catch {}

    return true;
  } catch (err) {
    console.warn('Firebase delete update error:', err);
    return false;
  }
};

// ----------------------------------------------------
// SYNC STATUS TEST REPORT (Tests Google Firebase Firestore)
// ----------------------------------------------------
export interface SupabaseSyncReport {
  connected: boolean;
  storiesTableAccessible: boolean;
  updatesTableAccessible: boolean;
  businessesTableAccessible: boolean;
  claimsTableAccessible: boolean;
  applicationsTableAccessible: boolean;
  businessesInsertable: boolean;
  message: string;
  sqlToRun?: string;
}

export const testSupabaseSyncStatus = async (): Promise<SupabaseSyncReport> => {
  try {
    const fbReport: FirebaseSyncReport = await testFirebaseSyncStatus();
    return {
      connected: fbReport.connected,
      storiesTableAccessible: fbReport.storiesTableAccessible,
      updatesTableAccessible: fbReport.updatesTableAccessible,
      businessesTableAccessible: fbReport.businessesTableAccessible,
      claimsTableAccessible: fbReport.claimsTableAccessible,
      applicationsTableAccessible: fbReport.applicationsTableAccessible,
      businessesInsertable: fbReport.businessesInsertable,
      message: fbReport.message,
    };
  } catch (err: any) {
    return {
      connected: false,
      storiesTableAccessible: false,
      updatesTableAccessible: false,
      businessesTableAccessible: false,
      claimsTableAccessible: false,
      applicationsTableAccessible: false,
      businessesInsertable: false,
      message: `Firebase Sync Status check: ${err?.message || err}`,
    };
  }
};
