import { Business } from '../types';

export const HOUSING_CATEGORY_ID = 'home-rentals';
export const HOUSING_CONTACT_UNLOCK_FEE = 500; // KES 500

const UNLOCK_STORAGE_PREFIX = 'kwest_unlocked_contact_biz_';
const UNLOCK_EVENT_NAME = 'kwest_contact_unlock_changed';

/**
 * Checks if a specific business has had its contacts unlocked (via M-Pesa fee or admin)
 */
export const isBusinessContactUnlocked = (businessId: string, business?: Business): boolean => {
  if (business?.isContactUnlocked) return true;
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${UNLOCK_STORAGE_PREFIX}${businessId}`) === 'true';
  } catch {
    return false;
  }
};

/**
 * Determines if a business's direct contacts (Phone & WhatsApp) should be gated behind the KES 500 unlock fee.
 * Housing & Rent Collecting Agents ('home-rentals') are gated by default unless unlocked.
 */
export const isBusinessContactGated = (business: Business | null | undefined): boolean => {
  if (!business) return false;
  
  // If explicitly unlocked on the business object or locally
  if (business.isContactUnlocked || isBusinessContactUnlocked(business.id, business)) {
    return false;
  }

  // Housing & Rent Collecting Agents category is gated
  if (business.category === HOUSING_CATEGORY_ID) {
    return true;
  }

  // Any other business marked with explicit isContactGated flag
  return Boolean(business.isContactGated);
};

/**
 * Unlocks direct contacts for a business and broadcasts state change to all active components
 */
export const unlockBusinessContact = (businessId: string, mpesaRef?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${UNLOCK_STORAGE_PREFIX}${businessId}`, 'true');
    if (mpesaRef) {
      localStorage.setItem(`${UNLOCK_STORAGE_PREFIX}${businessId}_ref`, mpesaRef.trim().toUpperCase());
      localStorage.setItem(`${UNLOCK_STORAGE_PREFIX}${businessId}_date`, new Date().toISOString());
    }
    window.dispatchEvent(new Event(UNLOCK_EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save contact unlock status:', err);
  }
};

/**
 * Locks direct contacts for a business
 */
export const lockBusinessContact = (businessId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${UNLOCK_STORAGE_PREFIX}${businessId}`);
    localStorage.removeItem(`${UNLOCK_STORAGE_PREFIX}${businessId}_ref`);
    localStorage.removeItem(`${UNLOCK_STORAGE_PREFIX}${businessId}_date`);
    window.dispatchEvent(new Event(UNLOCK_EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to lock contact status:', err);
  }
};

/**
 * Returns a masked representation of a phone number for gated listings
 * E.g., +254728556677 -> +254 728 ••• 677
 */
export const maskPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '+254 7•• ••• •••';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length >= 9) {
    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-3);
    return `+254 ${prefix.slice(-2)}• ••• ${suffix}`;
  }
  return '+254 7•• ••• •••';
};
