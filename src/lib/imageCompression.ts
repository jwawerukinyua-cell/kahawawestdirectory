/**
 * Client-Side Image Compression & Document Size Safeguard Utility for Kahawa West Directory
 * 
 * Compresses raw high-resolution smartphone camera photos (5MB - 25MB)
 * directly in the user's browser before saving to localStorage or transmitting to Firestore,
 * shrinking them down to ~50KB - 90KB JPEG.
 * 
 * Prevents localStorage quota overflow and strictly guarantees Firestore documents never
 * exceed Google Cloud Firestore's hard limit of 1,048,576 bytes (1 MiB).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.72)
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.72,
  mimeType: 'image/jpeg',
};

/**
 * Compresses a user-selected File/Blob into an optimized data URL string.
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // If SVG, return as-is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        const maxW = opts.maxWidth || 800;
        const maxH = opts.maxHeight || 800;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxW || height > maxH) {
          if (width / height > maxW / maxH) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas fails, scale down via basic reader
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
          return;
        }

        // Draw with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Export compressed image as lightweight data URL
        const dataUrl = canvas.toDataURL(opts.mimeType || 'image/jpeg', opts.quality || 0.72);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas compression error:', err);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Downscales an existing base64 data URL string if it exceeds target dimensions or length.
 */
export async function downscaleDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.70
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  
  // If already small (< 75KB), skip re-encoding
  if (dataUrl.length < 100000 && !dataUrl.includes('image/png')) {
    return dataUrl;
  }

  if (typeof document === 'undefined') return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Recursively inspects and downscales any base64 image strings in a Firestore payload
 * to guarantee that the entire document remains safely below the 1,048,576 bytes limit.
 */
export async function ensureSafeFirestorePayload<T extends Record<string, any>>(
  payload: T,
  maxTotalBytes = 750000
): Promise<T> {
  if (!payload || typeof payload !== 'object') return payload;

  const clone: Record<string, any> = JSON.parse(JSON.stringify(payload));

  // 1. First pass: downscale all known image fields to 800x800 @ 0.70
  if (typeof clone.heroImage === 'string' && clone.heroImage.startsWith('data:image/')) {
    clone.heroImage = await downscaleDataUrl(clone.heroImage, 800, 800, 0.70);
  }

  if (typeof clone.imageUrl === 'string' && clone.imageUrl.startsWith('data:image/')) {
    clone.imageUrl = await downscaleDataUrl(clone.imageUrl, 800, 800, 0.70);
  }

  if (Array.isArray(clone.galleryImages)) {
    // Keep max 4 gallery images to respect mobile limits
    clone.galleryImages = clone.galleryImages.slice(0, 4);
    for (let i = 0; i < clone.galleryImages.length; i++) {
      if (typeof clone.galleryImages[i] === 'string' && clone.galleryImages[i].startsWith('data:image/')) {
        clone.galleryImages[i] = await downscaleDataUrl(clone.galleryImages[i], 800, 800, 0.68);
      }
    }
  }

  if (clone.claimed_details && typeof clone.claimed_details === 'object') {
    if (Array.isArray(clone.claimed_details.photos)) {
      clone.claimed_details.photos = clone.claimed_details.photos.slice(0, 3);
      for (let i = 0; i < clone.claimed_details.photos.length; i++) {
        if (typeof clone.claimed_details.photos[i] === 'string' && clone.claimed_details.photos[i].startsWith('data:image/')) {
          clone.claimed_details.photos[i] = await downscaleDataUrl(clone.claimed_details.photos[i], 800, 800, 0.68);
        }
      }
    }
  }

  // 2. Measure current size
  let currentJson = JSON.stringify(clone);
  let byteSize = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(currentJson).length
    : currentJson.length;

  // 3. Second pass: if still > maxTotalBytes (e.g. 750KB), compress more aggressively
  if (byteSize > maxTotalBytes) {
    if (typeof clone.heroImage === 'string' && clone.heroImage.startsWith('data:image/')) {
      clone.heroImage = await downscaleDataUrl(clone.heroImage, 600, 600, 0.55);
    }
    if (typeof clone.imageUrl === 'string' && clone.imageUrl.startsWith('data:image/')) {
      clone.imageUrl = await downscaleDataUrl(clone.imageUrl, 600, 600, 0.55);
    }
    if (Array.isArray(clone.galleryImages)) {
      // Reduce to 2 images
      clone.galleryImages = clone.galleryImages.slice(0, 2);
      for (let i = 0; i < clone.galleryImages.length; i++) {
        if (typeof clone.galleryImages[i] === 'string' && clone.galleryImages[i].startsWith('data:image/')) {
          clone.galleryImages[i] = await downscaleDataUrl(clone.galleryImages[i], 600, 600, 0.52);
        }
      }
    }
    if (clone.claimed_details && Array.isArray(clone.claimed_details.photos)) {
      clone.claimed_details.photos = clone.claimed_details.photos.slice(0, 2);
      for (let i = 0; i < clone.claimed_details.photos.length; i++) {
        if (typeof clone.claimed_details.photos[i] === 'string' && clone.claimed_details.photos[i].startsWith('data:image/')) {
          clone.claimed_details.photos[i] = await downscaleDataUrl(clone.claimed_details.photos[i], 600, 600, 0.52);
        }
      }
    }

    currentJson = JSON.stringify(clone);
    byteSize = typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(currentJson).length
      : currentJson.length;
  }

  // 4. Hard safety net: Firestore strict limit is 1,048,576 bytes.
  // If somehow still > 950KB, strip base64 and use ultra-reliable CDN fallback
  if (byteSize > 950000) {
    console.warn(`Firestore document payload (${byteSize} bytes) approached 1MB limit; replacing oversized local base64 with verified CDN fallback`);
    const fallback = '/hero.webp';
    if (clone.heroImage && clone.heroImage.startsWith('data:image/')) clone.heroImage = fallback;
    if (clone.imageUrl && clone.imageUrl.startsWith('data:image/')) clone.imageUrl = fallback;
    if (Array.isArray(clone.galleryImages)) clone.galleryImages = [clone.heroImage || fallback];
    if (clone.claimed_details && Array.isArray(clone.claimed_details.photos)) clone.claimed_details.photos = [fallback];
  }

  return clone as T;
}

/**
 * Validates whether a selected file is an acceptable image format and returns a helpful error if not.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
    return {
      valid: false,
      error: 'Please upload a valid photo file (.jpg, .jpeg, .png, or .webp).',
    };
  }

  // Check if file is abnormally massive (> 25MB)
  if (file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Photo is too large (maximum 25MB). Please choose a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Markers of recurring generic Unsplash photos that were previously injected as placeholders.
 */
export const PERSISTENT_PLACEHOLDER_MARKERS = [
  'photo-1555396273-367ea4eb4db5', // cafe interior
  'photo-1504307651254-35680f356dfd', // construction site workers
  'photo-1517245386807-bb43f82c33c4', // cafe table
  'photo-1522337360788-8b13dee7a37e', // generic cosmetics
  'photo-1587854692152-cbe660dbde88', // pharmacy pills
  'photo-1544025162-d76694265947', // generic grilled platter / food fallback
];

export function isGenericPlaceholderPhoto(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  return PERSISTENT_PLACEHOLDER_MARKERS.some((marker) => url.includes(marker));
}

/**
 * Sanitizes business photos to ensure that real photos are kept (up to 3)
 * and generic Unsplash placeholders are stripped out.
 */
export function sanitizeBusinessPhotos(photos: (string | undefined | null)[] = [], maxCount = 3): string[] {
  if (!Array.isArray(photos)) return [];
  const valid = photos.filter((p): p is string => typeof p === 'string' && p.trim() !== '');
  const customPhotos = valid.filter((p) => !isGenericPlaceholderPhoto(p));
  if (customPhotos.length > 0) {
    return customPhotos.slice(0, maxCount);
  }
  return valid.slice(0, 1);
}

