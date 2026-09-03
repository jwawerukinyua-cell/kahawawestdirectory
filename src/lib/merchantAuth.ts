// Lightweight 4-Digit Merchant PIN Authentication & Device Session Engine for KWEST Directory

export interface MerchantAccountRecord {
  businessId: string;
  businessName: string;
  phone: string;
  pin: string; // 4-digit numeric string e.g. "1234"
  role:
    | 'Owner'
    | 'Manager'
    | 'Authorized Representative'
    | 'Partner'
    | 'Agent / On Behalf of Owner'
    | 'Agent / Listing on Behalf of Owner'
    | 'Listing on Behalf of Owner'
    | string;
  isListingOnBehalf?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  applicantName?: string;
  applicantPhone?: string;
  createdAt: string;
  unlockedDevices?: string[];
}

const PINS_STORAGE_KEY = 'kwest_merchant_pins_v1';
const ACTIVE_SESSIONS_KEY = 'kwest_merchant_active_sessions_v1';
const CURRENT_DEVICE_KEY = 'kwest_merchant_device_id_v1';

// Generate or get stable anonymous device identifier
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let devId = localStorage.getItem(CURRENT_DEVICE_KEY);
    if (!devId) {
      devId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      localStorage.setItem(CURRENT_DEVICE_KEY, devId);
    }
    return devId;
  } catch {
    return 'fallback_device';
  }
}

// Get all registered merchant PIN records
export function getAllMerchantRecords(): Record<string, MerchantAccountRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PINS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Register or update PIN and ownership metadata
export function registerMerchantAccount(account: Omit<MerchantAccountRecord, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const records = getAllMerchantRecords();
    const deviceId = getDeviceId();
    
    records[account.businessId] = {
      ...account,
      createdAt: new Date().toISOString(),
      unlockedDevices: Array.from(new Set([...(records[account.businessId]?.unlockedDevices || []), deviceId])),
    };
    
    localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(records));
    
    // Automatically grant instant session on this device
    grantMerchantSession(account.businessId);
  } catch (e) {
    console.error('Error saving merchant PIN record:', e);
  }
}

// Grant an active session for a business on current device
export function grantMerchantSession(businessId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    const sessions: string[] = raw ? JSON.parse(raw) : [];
    if (!sessions.includes(businessId)) {
      sessions.push(businessId);
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
    }
    // Also dispatch custom event so UI updates reactively
    window.dispatchEvent(new CustomEvent('kwest_merchant_session_changed', { detail: { businessId, status: 'unlocked' } }));
  } catch (e) {
    console.error('Error granting merchant session:', e);
  }
}

// Revoke/Lock active session
export function revokeMerchantSession(businessId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    let sessions: string[] = raw ? JSON.parse(raw) : [];
    sessions = sessions.filter((id) => id !== businessId);
    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('kwest_merchant_session_changed', { detail: { businessId, status: 'locked' } }));
  } catch (e) {
    console.error('Error revoking merchant session:', e);
  }
}

// Check if merchant session is active on this device
export function isMerchantSessionActive(businessId: string, businessName?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Check active sessions list
    const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    const sessions: string[] = raw ? JSON.parse(raw) : [];
    if (sessions.includes(businessId)) return true;

    // 2. Check if device is in the unlocked list for this business
    const records = getAllMerchantRecords();
    const deviceId = getDeviceId();
    const record = records[businessId];
    if (record?.unlockedDevices?.includes(deviceId)) {
      grantMerchantSession(businessId);
      return true;
    }

    // 3. For Ukweli Furniture Crafts test business, auto-unlock if claimed on this browser
    const isUkweli = 
      businessId.includes('furniture') || 
      businessId === 'kw-biz-18' || 
      (businessName && (businessName.toLowerCase().includes('ukweli') || businessName.toLowerCase().includes('furniture')));
    
    if (isUkweli && !localStorage.getItem('kwest_ukweli_locked_explicitly')) {
      // Provide instant access for the verified test shop unless manually locked
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Verify entered 4-digit PIN against stored record
export function verifyMerchantPin(
  businessId: string, 
  enteredPin: string, 
  businessName?: string, 
  enteredPhone?: string
): { success: boolean; message?: string; role?: string } {
  const cleanPin = enteredPin.trim();
  
  // 1. Admin Master Bypass
  if (cleanPin === 'KahawaWest@Admin99!' || cleanPin === '9999') {
    grantMerchantSession(businessId);
    return { success: true, role: 'KWEST Administrator (Master Override)' };
  }

  // 2. Default Test Shop PIN ('1234')
  const isUkweli = 
    businessId.includes('furniture') || 
    businessId === 'kw-biz-18' || 
    (businessName && (businessName.toLowerCase().includes('ukweli') || businessName.toLowerCase().includes('furniture')));
  
  if (isUkweli && cleanPin === '1234') {
    grantMerchantSession(businessId);
    return { success: true, role: 'Owner' };
  }

  // 3. Check registered PIN records
  const records = getAllMerchantRecords();
  const record = records[businessId];

  if (record) {
    if (record.pin === cleanPin) {
      grantMerchantSession(businessId);
      return { success: true, role: record.role };
    }
    return { success: false, message: 'Incorrect 4-Digit Merchant PIN. Please try again or check your WhatsApp confirmation.' };
  }

  // 4. Default fallback: If newly created or claimed without a custom pin yet, accept '1234'
  if (cleanPin === '1234') {
    grantMerchantSession(businessId);
    return { success: true, role: 'Owner' };
  }

  return { success: false, message: 'Invalid PIN. If you forgot your PIN, tap "Contact Editorial Desk" below for instant PIN reset.' };
}
