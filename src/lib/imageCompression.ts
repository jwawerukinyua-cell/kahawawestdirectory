/**
 * Client-Side Image Compression Utility for Kahawa West Directory
 * 
 * Compresses raw high-resolution smartphone camera photos (5MB - 15MB)
 * directly in the user's browser before saving to localStorage or transmitting,
 * shrinking them down to ~80KB - 180KB JPEG/WebP.
 * 
 * Prevents localStorage quota overflow and ensures super-fast rendering on budget mobile networks.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.78)
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.78,
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
    // If SVG or already tiny, return as-is
    if (file.type === 'image/svg+xml' || file.size < 60 * 1024) {
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

        const maxW = opts.maxWidth || 1200;
        const maxH = opts.maxHeight || 1200;

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
          // Fallback to FileReader if canvas context fails
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

        // Export compressed image as data URL
        const dataUrl = canvas.toDataURL(opts.mimeType || 'image/jpeg', opts.quality || 0.78);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas compression error, falling back to direct FileReader:', err);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
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
