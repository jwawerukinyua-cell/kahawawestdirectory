import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, BusinessClaim, CommunityFeedback, BusinessApplication } from '../types';

// The user's Supabase project: qmdhxdrmywvjbevxsnfd
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qmdhxdrmywvjbevxsnfd.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_fallback';

export const isSupabaseConfigured = Boolean(
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_fallback'
);

export const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

export const saveCustomizedBusiness = async (business: Business): Promise<{ success: boolean; error?: string }> => {
  try {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('businesses').upsert([
        {
          id: business.id,
          name: business.name,
          tagline: business.tagline,
          category: business.category,
          zone: business.zone,
          landmark: business.landmark,
          phone: business.phone,
          whatsapp: business.whatsapp,
          email: business.email,
          is_claimed: true,
          rating: business.rating,
          hero_image: business.heroImage,
          gallery_images: business.galleryImages,
          description: business.description,
          services: business.services,
          mpesa: business.mpesa,
          social_links: business.socialLinks,
          opening_hours: business.openingHours,
          special_offer: business.specialOffer,
          updated_at: new Date().toISOString(),
        }
      ]);
      if (error) console.warn('Supabase business upsert warning:', error.message);
    }

    // Local storage persistence
    const existing: Record<string, Business> = JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
    existing[business.id] = business;
    localStorage.setItem(BUSINESSES_STORAGE_KEY, JSON.stringify(existing));

    return { success: true };
  } catch (err: any) {
    console.error('Error saving customized business:', err);
    const existing: Record<string, Business> = JSON.parse(localStorage.getItem(BUSINESSES_STORAGE_KEY) || '{}');
    existing[business.id] = business;
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
    return seedBusinesses.map((b) => custom[b.id] || b);
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
