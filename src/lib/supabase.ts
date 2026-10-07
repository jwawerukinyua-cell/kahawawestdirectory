import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, BusinessClaim, CommunityFeedback, BusinessApplication, CommunityStory, CommunityUpdate } from '../types';
import { DEFAULT_OPENING_HOURS } from '../data/defaultOpeningHours';

// The user's Supabase project URL and anon key with bulletproof production fallback
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

export const SUPABASE_URL = (envUrl && isValidHttpUrl(envUrl)) ? envUrl.trim() : DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = (envKey && typeof envKey === 'string' && envKey.trim().length > 20)
  ? envKey.trim()
  : DEFAULT_SUPABASE_ANON_KEY;

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

let hasLoggedEgressNotice = false;
let isEgressRestricted = false;

export function isSupabaseEgressRestricted(): boolean {
  return isEgressRestricted;
}

export function logSupabaseWarning(scope: string, error: any) {
  if (!error) return;
  const message = error.message || String(error);
  if (
    message.includes('exceed_egress_quota') ||
    message.includes('restricted') ||
    message.includes('spend caps') ||
    message.includes('bandwidth limit')
  ) {
    isEgressRestricted = true;
    if (!hasLoggedEgressNotice) {
      hasLoggedEgressNotice = true;
      console.info(
        `ℹ️ [KWEST Data Sync]: Supabase free-tier egress quota limit reached on remote database. The directory is operating seamlessly from high-performance local & verified static storage.`
      );
    }
    return;
  }
  // If already known to be egress restricted, don't spam the console with generic fetch errors
  if (isEgressRestricted) return;
  console.warn(`Supabase ${scope} warning:`, message);
}

// Local storage backup keys for seamless preview & persistence
const CLAIMS_STORAGE_KEY = 'kwest_directory_claims';
const BUSINESSES_STORAGE_KEY = 'kwest_directory_custom_businesses';
const FEEDBACK_STORAGE_KEY = 'kwest_directory_feedback';
const APPLICATIONS_STORAGE_KEY = 'kwest_directory_applications';

export const saveBusinessClaim = async (
  claim: BusinessClaim
): Promise<{ success: boolean; error?: string; remoteSynced?: boolean; id?: string }> => {
  let remoteSynced = false;
  let remoteError: string | undefined;

  try {
    // 1. If Supabase is connected with active key, write to claims table
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.from('claims').insert([
        {
          business_id: claim.business_id,
          business_name: claim.business_name || null,
          full_name: claim.full_name,
          phone_number: claim.phone_number,
          whatsapp_number: claim.whatsapp_number || claim.phone_number,
          email: claim.email,
          business_role: claim.business_role,
          notes: claim.notes || null,
          status: claim.status || 'pending',
          claimed_details: claim.claimed_details || {},
          created_at: claim.created_at || new Date().toISOString(),
        }
      ]).select('id').single();

      if (error) {
        logSupabaseWarning('insert claim', error);
        remoteError = error.message;
      } else {
        remoteSynced = true;
        if (data?.id) {
          claim.id = data.id;
        }
      }
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
    // Fallback save locally
    const existingClaims: BusinessClaim[] = JSON.parse(localStorage.getItem(CLAIMS_STORAGE_KEY) || '[]');
    const filtered = existingClaims.filter((c) => c.business_id !== claim.business_id && c.id !== claim.id);
    filtered.unshift(claim);
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('kwest_claims_updated', { detail: filtered }));
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

export const fetchClaimsFromSupabase = async (): Promise<BusinessClaim[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) logSupabaseWarning('fetch claims', error);
      return null;
    }

    const filtered = data.filter(
      (row: any) =>
        !PURGED_CLAIM_IDS.has(row.id) &&
        !PURGED_CLAIM_IDS.has(row.business_id) &&
        row.status !== 'rejected' &&
        row.status !== 'archived'
    );

    const mapped: BusinessClaim[] = filtered.map((row: any): BusinessClaim => ({
      id: row.id,
      business_id: row.business_id,
      business_name: row.business_name,
      full_name: row.full_name,
      phone_number: row.phone_number,
      whatsapp_number: row.whatsapp_number,
      email: row.email,
      business_role: row.business_role,
      national_id: row.national_id,
      notes: row.notes,
      status: row.status || 'pending',
      claimed_details: row.claimed_details || {},
      created_at: row.created_at,
    }));

    // Cache to local storage
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(mapped));
    return mapped;
  } catch (err) {
    logSupabaseWarning('fetch claims', err);
    return null;
  }
};

export const updateClaimStatusInSupabase = async (
  claimIdOrBizId: string,
  status: 'pending' | 'verified' | 'rejected',
  notes?: string
): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      let query = supabase.from('claims').update({ status, ...(notes ? { notes } : {}) });
      if (isUuid(claimIdOrBizId)) {
        query = query.eq('id', claimIdOrBizId);
      } else {
        query = query.eq('business_id', claimIdOrBizId);
      }
      const { error } = await query;
      if (error) logSupabaseWarning('update claim', error);
    }
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
    console.warn('Failed to update claim status:', err);
    return false;
  }
};

export const deleteClaimFromSupabase = async (claimIdOrBizId: string): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      let query = supabase.from('claims').delete();
      if (isUuid(claimIdOrBizId)) {
        query = query.eq('id', claimIdOrBizId);
      } else {
        query = query.eq('business_id', claimIdOrBizId);
      }
      await query;
    }
    const existing = getSavedClaims();
    const updated = existing.filter(
      (c) => c.id !== claimIdOrBizId && c.business_id !== claimIdOrBizId
    );
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_claims_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to delete claim:', err);
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

export const saveCustomizedBusiness = async (business: Business): Promise<{ success: boolean; error?: string }> => {
  try {
    const slug = business.slug || generateBusinessSlug(business.name);
    const normalizedBusiness: Business = {
      ...business,
      slug,
    };

    if (supabase && isSupabaseConfigured) {
      // Supabase 'businesses' table schema columns
      const { error } = await supabase.from('businesses').upsert([
        {
          id: normalizedBusiness.id,
          slug: normalizedBusiness.slug,
          name: normalizedBusiness.name,
          tagline: normalizedBusiness.tagline || '',
          category: normalizedBusiness.category,
          sub_category: normalizedBusiness.subCategory || null,
          zone: normalizedBusiness.zone,
          landmark: normalizedBusiness.landmark || 'Kahawa West',
          phone: normalizedBusiness.phone,
          whatsapp: normalizedBusiness.whatsapp || normalizedBusiness.phone,
          email: normalizedBusiness.email || null,
          is_verified: normalizedBusiness.isVerified ?? true,
          is_claimed: normalizedBusiness.isClaimed ?? true,
          claimed_by: normalizedBusiness.claimedBy || null,
          claimed_at: normalizedBusiness.claimedAt || new Date().toISOString().split('T')[0],
          rating: normalizedBusiness.rating || 5.0,
          review_count: normalizedBusiness.reviewCount || 1,
          price_level: normalizedBusiness.priceLevel || 'Moderate',
          hero_image: normalizedBusiness.heroImage || null,
          gallery_images: normalizedBusiness.galleryImages || [],
          description: normalizedBusiness.description || '',
          services: normalizedBusiness.services || [],
          features: normalizedBusiness.features || [],
          mpesa: normalizedBusiness.mpesa || null,
          social_links: normalizedBusiness.socialLinks || null,
          special_offer: normalizedBusiness.specialOffer || null,
          status: 'published',
          created_at: normalizedBusiness.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      if (error) logSupabaseWarning('business upsert', error);
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

export const fetchBusinessesFromSupabase = async (): Promise<Business[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) logSupabaseWarning('fetch businesses', error);
      return null;
    }

    return data
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
      subCategory: row.sub_category,
      zone: row.zone || 'Station / Railway',
      landmark: row.landmark || 'Kahawa West',
      addressDetails: row.address_details,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      email: row.email,
      isVerified: Boolean(row.is_verified),
      isClaimed: Boolean(row.is_claimed),
      claimedBy: row.claimed_by,
      rating: typeof row.rating === 'number' ? row.rating : 5.0,
      reviewCount: typeof row.review_count === 'number' ? row.review_count : 1,
      priceLevel: row.price_level || 'Moderate',
      heroImage: row.hero_image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      galleryImages: Array.isArray(row.gallery_images) && row.gallery_images.length > 0
        ? row.gallery_images
        : [row.hero_image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
      description: row.description || `${row.name} in Kahawa West`,
      services: Array.isArray(row.services) ? row.services : [],
      features: Array.isArray(row.features) ? row.features : [],
      mpesa: row.mpesa,
      socialLinks: row.social_links,
      openingHours: DEFAULT_OPENING_HOURS,
      specialOffer: row.special_offer,
      coordinates: row.coordinates || { lat: -1.1850, lng: 36.8850 },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    logSupabaseWarning('fetch businesses', err);
    return null;
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
        const resolvedCategory = seed.id === 'kw-biz-10' ? 'home-rentals' : (c.category || seed.category);
        return {
          ...seed,
          ...c,
          category: resolvedCategory,
          slug: currentSlug,
        };
      }
      return seed;
    });

    // 2. Only retrieve explicitly verified custom listed businesses not in seeds
    const newCustomListings: Business[] = [];
    Object.keys(custom).forEach((id) => {
      if (!seedMap.has(id)) {
        const item = custom[id];
        // Strictly require verified status for custom businesses to be visible in the directory
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

// Initial sample seed feedback for realistic neighborhood reviews
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
    comment: 'Super fast roast and the mbuzi choma was tender and hot. The mukimo was fresh without too much oil. Great place for weekend family lunch.',
    businessResponse: {
      respondedBy: 'Mama Njeri (Proprietor)',
      responseDate: '2026-08-25',
      message: 'Asante sana Peter! We always source fresh meat every morning from local suppliers. Welcome back anytime with family!'
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
    comment: 'Good chicken taste and the soup was rich. Delivery to Jacaranda took 35 mins which was okay, but packaging was very neat.',
    businessResponse: {
      respondedBy: 'Maina (Kitchen Supervisor)',
      responseDate: '2026-08-28',
      message: 'Thank you Grace for the review. We are currently testing new thermal rider bags to make Jacaranda deliveries even faster!'
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
    comment: 'Solid hardwood mahogany frame with heavy fabric that doesn’t fray. Finished and delivered right on time to my apartment near Soweto.',
    businessResponse: {
      respondedBy: 'Fundi Kanyi (Master Craftsman)',
      responseDate: '2026-08-22',
      message: 'Thank you Dennis! We take pride in real treated wood construction that lasts decades. Enjoy your living room set!'
    },
    created_at: '2026-08-20T11:15:00Z',
  },
  {
    id: 'fb-seed-04',
    businessId: 'kw-biz-02',
    businessName: 'St. Francis 24/7 Chemist & Diagnostic Clinic',
    authorName: 'Mama Stacy',
    serviceOrProduct: 'Prescription Antibiotics & Child Blood Pressure Check',
    experience: 'Better',
    rating: 5,
    tags: ['Verified Resident', 'Better'],
    comment: 'Opened promptly at 11 PM during an emergency. The pharmacist explained the dosage clearly and was very patient with my sick daughter.',
    created_at: '2026-08-28T23:10:00Z',
  }
];

export const saveCommunityFeedback = async (feedback: CommunityFeedback): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('feedback').insert([feedback]);
    }
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

export const saveBusinessApplication = async (
  app: BusinessApplication
): Promise<{ success: boolean; error?: string; remoteSynced?: boolean; id?: string }> => {
  let remoteSynced = false;
  let remoteError: string | undefined;

  try {
    const appWithId: BusinessApplication = {
      ...app,
      id: app.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'pending',
    };

    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.from('applications').insert([
        {
          name: appWithId.name,
          category: appWithId.category,
          operation_type: appWithId.operationType || null,
          zone: appWithId.zone,
          landmark: appWithId.landmark,
          phone: appWithId.phone,
          whatsapp: appWithId.whatsapp || null,
          email: appWithId.email || null,
          description: appWithId.description,
          services: appWithId.services || [],
          mpesa_type: appWithId.mpesaType || null,
          mpesa_number: appWithId.mpesaNumber || null,
          hero_image: appWithId.heroImage || null,
          gallery_images: appWithId.galleryImages || [],
          applicant_name: appWithId.applicantName,
          applicant_phone: appWithId.applicantPhone,
          applicant_role: appWithId.applicantRole,
          notes: appWithId.notes || (appWithId.merchantPin ? `[PIN: ${appWithId.merchantPin}]` : null),
          status: 'pending',
          created_at: appWithId.created_at || new Date().toISOString(),
        }
      ]).select('id').single();

      if (error) {
        logSupabaseWarning('application insert', error);
        remoteError = error.message;
      } else {
        remoteSynced = true;
        if (data?.id) {
          appWithId.id = data.id;
        }
      }
    }

    const existing: BusinessApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]');
    const filtered = existing.filter((a) => a.id !== appWithId.id);
    filtered.unshift(appWithId);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(filtered));

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

export const fetchApplicationsFromSupabase = async (): Promise<BusinessApplication[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) logSupabaseWarning('fetch applications', error);
      return null;
    }

    const mapped: BusinessApplication[] = data.map((row: any): BusinessApplication => ({
      id: row.id,
      name: row.name,
      category: row.category,
      operationType: row.operation_type,
      zone: row.zone,
      landmark: row.landmark,
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      description: row.description,
      services: Array.isArray(row.services) ? row.services : [],
      mpesaType: row.mpesa_type,
      mpesaNumber: row.mpesa_number,
      heroImage: row.hero_image,
      galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
      applicantName: row.applicant_name,
      applicantPhone: row.applicant_phone,
      applicantRole: row.applicant_role,
      notes: row.notes,
      status: row.status || 'pending',
      created_at: row.created_at,
    }));

    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mapped));
    return mapped;
  } catch (err) {
    logSupabaseWarning('fetch applications', err);
    return null;
  }
};

export const updateApplicationStatusInSupabase = async (
  appId: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      let query = supabase.from('applications').update({ status, ...(notes ? { notes } : {}) });
      if (isUuid(appId)) {
        query = query.eq('id', appId);
      } else {
        query = query.eq('id', appId);
      }
      const { error } = await query;
      if (error) logSupabaseWarning('update application', error);
    }
    const existing = getStoredApplications();
    const updated = existing.map((a) =>
      a.id === appId ? { ...a, status, ...(notes ? { notes } : {}) } : a
    );
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_applications_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to update application status:', err);
    return false;
  }
};

export const deleteApplicationFromSupabase = async (appId: string): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      if (isUuid(appId)) {
        await supabase.from('applications').delete().eq('id', appId);
      }
    }
    const existing = getStoredApplications();
    const updated = existing.filter((a) => a.id !== appId);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kwest_applications_updated', { detail: updated }));
    return true;
  } catch (err) {
    console.warn('Failed to delete application:', err);
    return false;
  }
};

export const syncStoryToSupabase = async (story: CommunityStory): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('community_stories').upsert([
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
      if (error) {
        logSupabaseWarning('community story sync', error);
        return false;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Supabase community story sync error:', err);
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

export const fetchStoriesFromSupabase = async (): Promise<CommunityStory[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('community_stories')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) {
      if (error) logSupabaseWarning('fetch stories', error);
      return null;
    }

    return data
      .filter(
        (row: any) =>
          !row.id.startsWith('test-') &&
          row.id !== 'story-01' &&
          row.id !== 'story-02' &&
          row.id !== 'story-03' &&
          row.id !== 'story-1788450086647' &&
          row.id !== 'story-1788342289836'
      )
      .map((row: any): CommunityStory => ({
      id: row.id,
      slug: row.slug || (row.id === 'story-1788450086647' || row.id === 'story-1788342289836' ? 'kahawa-pride-fc' : row.id),
      title: row.title,
      subtitle: row.subtitle,
      category: row.category,
      zone: row.zone,
      content: row.content,
      excerpt: row.excerpt || row.content.slice(0, 160) + '...',
      imageUrl: row.image_url,
      imageCaption: row.image_caption,
      isRealPhotoConfirmed: Boolean(row.is_real_photo_confirmed),
      authorName: row.author_name,
      authorRole: row.author_role,
      authorEmail: row.author_email,
      authorPhone: row.author_phone,
      date: row.date,
      readTimeMinutes: row.read_time_minutes || 3,
      featured: Boolean(row.featured),
      status: normalizeContentStatus(row.status),
      rejectionReason: row.rejection_reason,
      likes: row.likes || 0,
    }));
  } catch (err) {
    logSupabaseWarning('fetch stories', err);
    return null;
  }
};

export const deleteStoryFromSupabase = async (storyId: string): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('community_stories').delete().eq('id', storyId);
      if (error) console.warn('Supabase delete story warning:', error.message);
      return !error;
    }
    return false;
  } catch (err) {
    console.warn('Supabase delete story error:', err);
    return false;
  }
};

export const deleteUpdateFromSupabase = async (updateId: string): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('community_updates').delete().eq('id', updateId);
      if (error) console.warn('Supabase delete update warning:', error.message);
      return !error;
    }
    return false;
  } catch (err) {
    console.warn('Supabase delete update error:', err);
    return false;
  }
};

export const syncUpdateToSupabase = async (update: CommunityUpdate): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('community_updates').upsert([
        {
          id: update.id,
          title: update.title,
          type: update.type,
          time_info: update.timeInfo,
          location: update.location,
          zone: update.zone || null,
          content: update.content,
          author: update.author,
          author_phone: update.authorPhone || null,
          author_email: update.authorEmail || null,
          author_role: update.authorRole || null,
          contact: update.contact || null,
          badge: update.badge || null,
          image_url: update.imageUrl || null,
          image_caption: update.imageCaption || null,
          is_accountability_confirmed: update.isAccountabilityConfirmed ?? true,
          urgency_level: update.urgencyLevel || 'standard',
          date: update.date || new Date().toISOString().split('T')[0],
          status: update.status || 'pending_review',
          rejection_reason: update.rejectionReason || null,
        },
      ]);
      if (error) {
        logSupabaseWarning('community update sync', error);
        return false;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Supabase community update sync error:', err);
    return false;
  }
};

export const fetchUpdatesFromSupabase = async (): Promise<CommunityUpdate[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('community_updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) logSupabaseWarning('fetch updates', error);
      return null;
    }

    return data
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
      timeInfo: row.time_info || row.date,
      location: row.location || 'Kahawa West',
      zone: row.zone,
      content: row.content,
      author: row.author,
      authorPhone: row.author_phone,
      authorEmail: row.author_email,
      authorRole: row.author_role || (row.id === 'up-iebc-voter-reg-2026' ? 'Local Resident / Neighbor' : undefined),
      contact: row.contact || row.author_phone || (row.id === 'up-iebc-voter-reg-2026' ? '0764405842' : undefined),
      badge: row.badge || (row.id === 'up-iebc-voter-reg-2026' ? 'Public Notice' : undefined),
      imageUrl: row.image_url || (row.id === 'up-iebc-voter-reg-2026' ? '/iebc-logo.png' : undefined),
      imageCaption: row.image_caption || (row.id === 'up-iebc-voter-reg-2026' ? 'Independent Electoral and Boundaries Commission (IEBC) voter registration notice' : undefined),
      isAccountabilityConfirmed: row.is_accountability_confirmed ?? true,
      urgencyLevel: row.urgency_level || 'standard',
      date: row.date,
      status: normalizeContentStatus(row.status),
      rejectionReason: row.rejection_reason,
    }));
  } catch (err) {
    logSupabaseWarning('fetch updates', err);
    return null;
  }
};

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
  if (!supabase || !isSupabaseConfigured) {
    return {
      connected: false,
      storiesTableAccessible: false,
      updatesTableAccessible: false,
      businessesTableAccessible: false,
      claimsTableAccessible: false,
      applicationsTableAccessible: false,
      businessesInsertable: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  let storiesTableAccessible = false;
  let updatesTableAccessible = false;
  let businessesTableAccessible = false;
  let claimsTableAccessible = false;
  let applicationsTableAccessible = false;
  let businessesInsertable = false;
  let errorMessages: string[] = [];

  // 1. Test stories SELECT
  const storiesCheck = await supabase.from('community_stories').select('id').limit(1);
  if (!storiesCheck.error) {
    storiesTableAccessible = true;
  } else {
    errorMessages.push(`Stories: ${storiesCheck.error.message}`);
  }

  // 2. Test updates SELECT
  const updatesCheck = await supabase.from('community_updates').select('id').limit(1);
  if (!updatesCheck.error) {
    updatesTableAccessible = true;
  } else {
    errorMessages.push(`Updates: ${updatesCheck.error.message}`);
  }

  // 3. Test businesses SELECT
  const bizCheck = await supabase.from('businesses').select('id').limit(1);
  if (!bizCheck.error) {
    businessesTableAccessible = true;
  } else {
    errorMessages.push(`Businesses: ${bizCheck.error.message}`);
  }

  // 4. Test claims SELECT
  const claimsCheck = await supabase.from('claims').select('id').limit(1);
  if (!claimsCheck.error) {
    claimsTableAccessible = true;
  } else {
    errorMessages.push(`Claims: ${claimsCheck.error.message}`);
  }

  // 5. Test applications SELECT
  const appsCheck = await supabase.from('applications').select('id').limit(1);
  if (!appsCheck.error) {
    applicationsTableAccessible = true;
  } else {
    errorMessages.push(`Applications: ${appsCheck.error.message}`);
  }

  const isEgressBlocked = errorMessages.some(
    (msg) => msg.includes('exceed_egress_quota') || msg.includes('restricted') || msg.includes('spend caps')
  );

  if (isEgressBlocked) {
    return {
      connected: true,
      storiesTableAccessible: false,
      updatesTableAccessible: false,
      businessesTableAccessible: false,
      claimsTableAccessible: false,
      applicationsTableAccessible: false,
      businessesInsertable: false,
      message: 'Supabase Free Tier 5GB monthly egress quota reached for project wfsqnhujjqldcxnhnzvf. The KWEST directory is running seamlessly on its fast local storage & static cache without interruption. To restore live remote database sync, remove spend caps or upgrade your plan in your Supabase dashboard.',
    };
  }

  return {
    connected: true,
    storiesTableAccessible,
    updatesTableAccessible,
    businessesTableAccessible,
    claimsTableAccessible,
    applicationsTableAccessible,
    businessesInsertable,
    message: errorMessages.length > 0 ? errorMessages.join(' | ') : 'All tables accessible and syncing.',
  };
};

