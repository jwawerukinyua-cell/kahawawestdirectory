import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, BusinessClaim, CommunityFeedback, BusinessApplication, CommunityStory, CommunityUpdate } from '../types';

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

export const saveBusinessApplication = async (app: BusinessApplication): Promise<boolean> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('applications').insert([
        {
          name: app.name,
          category: app.category,
          operation_type: app.operationType || null,
          zone: app.zone,
          landmark: app.landmark,
          phone: app.phone,
          whatsapp: app.whatsapp || null,
          email: app.email || null,
          description: app.description,
          services: app.services || [],
          mpesa_type: app.mpesaType || null,
          mpesa_number: app.mpesaNumber || null,
          hero_image: app.heroImage || null,
          gallery_images: app.galleryImages || [],
          applicant_name: app.applicantName,
          applicant_phone: app.applicantPhone,
          applicant_role: app.applicantRole,
          notes: app.notes || null,
          status: 'pending',
          created_at: app.created_at || new Date().toISOString(),
        }
      ]);
      if (error) console.warn('Supabase application insert warning:', error.message);
    }
    const existing: BusinessApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]');
    existing.unshift(app);
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
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
        console.warn('Supabase community story sync error:', error.message);
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

export const fetchStoriesFromSupabase = async (): Promise<CommunityStory[] | null> => {
  try {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('community_stories')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) {
      if (error) console.warn('Supabase fetch stories warning:', error.message);
      return null;
    }

    return data.map((row: any): CommunityStory => ({
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
      status: row.status || 'published',
      rejectionReason: row.rejection_reason,
      likes: row.likes || 0,
    }));
  } catch (err) {
    console.warn('Failed to fetch stories from Supabase:', err);
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
        console.warn('Supabase community update sync warning:', error.message);
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
      if (error) console.warn('Supabase fetch updates warning:', error.message);
      return null;
    }

    return data.map((row: any): CommunityUpdate => ({
      id: row.id,
      type: row.type || 'community',
      title: row.title,
      timeInfo: row.time_info || row.date,
      location: row.location || 'Kahawa West',
      zone: row.zone,
      content: row.content,
      author: row.author,
      authorPhone: row.author_phone,
      authorEmail: row.author_email,
      authorRole: row.author_role,
      contact: row.contact,
      badge: row.badge,
      imageUrl: row.image_url,
      imageCaption: row.image_caption,
      isAccountabilityConfirmed: row.is_accountability_confirmed ?? true,
      urgencyLevel: row.urgency_level || 'standard',
      date: row.date,
      status: row.status || 'published',
      rejectionReason: row.rejection_reason,
    }));
  } catch (err) {
    console.warn('Failed to fetch updates from Supabase:', err);
    return null;
  }
};

export interface SupabaseSyncReport {
  connected: boolean;
  storiesTableAccessible: boolean;
  updatesTableAccessible: boolean;
  businessesTableAccessible: boolean;
  claimsTableAccessible: boolean;
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
      businessesInsertable: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  let storiesTableAccessible = false;
  let updatesTableAccessible = false;
  let businessesTableAccessible = false;
  let claimsTableAccessible = false;
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

  return {
    connected: true,
    storiesTableAccessible,
    updatesTableAccessible,
    businessesTableAccessible,
    claimsTableAccessible,
    businessesInsertable,
    message: errorMessages.length > 0 ? errorMessages.join(' | ') : 'All tables accessible and syncing.',
  };
};

