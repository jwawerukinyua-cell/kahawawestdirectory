/**
 * Kenyan Mobile & WhatsApp Protocol Normalization Utilities
 * 
 * Ensures all phone numbers and WhatsApp links strictly follow telecommunications
 * protocols (tel:+254... and https://wa.me/254...) so mobile dialers and WhatsApp
 * launch instantaneously without syntax errors or country code mismatches.
 */

/**
 * Standardizes any Kenyan phone number format for click-to-call `tel:` protocol.
 * 
 * Supports:
 * - Local mobile (e.g. "0712 345 678", "0722-123-456", "0110 987 654") -> "+254712345678"
 * - International formatted ("+254 712 345 678", "254712345678") -> "+254712345678"
 * - Emergency shortcodes ("999", "112", "97771", "1199") -> "999" (preserves shortcodes)
 */
export function formatKenyanPhoneForTel(phone: string | undefined | null): string {
  if (!phone || phone.trim() === '') return '+254700000000';

  const clean = phone.trim();

  // Preserve emergency 3 to 5 digit shortcodes (e.g. 999, 112, 911, 1199, 97771)
  const digitsOnly = clean.replace(/[^0-9]/g, '');
  if (digitsOnly.length <= 5 && digitsOnly.length >= 3) {
    return digitsOnly;
  }

  // Handle Kenyan 07xx or 01xx numbers (10 digits)
  if (digitsOnly.startsWith('0') && (digitsOnly.length === 10)) {
    return `+254${digitsOnly.substring(1)}`;
  }

  // Handle 7xx or 1xx numbers (9 digits without leading 0)
  if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
    return `+254${digitsOnly}`;
  }

  // Handle already prefixed 254 (12 digits)
  if (digitsOnly.startsWith('254') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  // Fallback: if already starts with +, clean internal spaces
  if (clean.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
}

/**
 * Normalizes phone numbers specifically for the WhatsApp protocol `https://wa.me/254...`
 * (WhatsApp requires strictly digits without '+' or leading '0').
 */
export function formatKenyanPhoneForWhatsApp(whatsappOrPhone: string | undefined | null): string {
  if (!whatsappOrPhone || whatsappOrPhone.trim() === '') return '254764405842';

  let raw = whatsappOrPhone.trim();

  // If user pasted a full URL like "https://wa.me/254712345678" or "wa.me/0712345678"
  if (raw.includes('wa.me/')) {
    const parts = raw.split('wa.me/');
    raw = parts[parts.length - 1].split('?')[0];
  }

  const digitsOnly = raw.replace(/[^0-9]/g, '');

  // Handle Kenyan 07xx or 01xx numbers
  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return `254${digitsOnly.substring(1)}`;
  }

  // Handle 7xx or 1xx numbers (9 digits)
  if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
    return `254${digitsOnly}`;
  }

  // Handle already 254... (12 digits)
  if (digitsOnly.startsWith('254')) {
    return digitsOnly;
  }

  return digitsOnly || '254764405842';
}

/**
 * Generates an instant WhatsApp chat link with pre-filled message.
 */
export function getWhatsAppChatUrl(phoneOrWa: string | undefined | null, message?: string): string {
  const cleanNumber = formatKenyanPhoneForWhatsApp(phoneOrWa);
  if (!message || message.trim() === '') {
    return `https://wa.me/${cleanNumber}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Formats a Kenyan phone number cleanly for visual display in UI (e.g. "0712 345 678").
 */
export function formatPhoneForDisplay(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length <= 5) return digits; // Shortcodes

  // If 254712345678 -> 0712 345 678
  if (digits.startsWith('254') && digits.length === 12) {
    const local = '0' + digits.substring(3);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }

  // If 0712345678 -> 0712 345 678
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phone;
}
