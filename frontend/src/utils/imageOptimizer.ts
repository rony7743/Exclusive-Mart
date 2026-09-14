export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Optimizes an image File using client-side canvas resizing and WebP compression.
 * Reduces file size significantly (e.g., 5MB -> 100-250KB) while maintaining visual clarity.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    format = 'image/webp'
  } = options;

  // Don't process non-images, SVG, or animated GIFs to avoid breaking them
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate constrained dimensions preserving aspect ratio
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
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output mime-type and file extension
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compression somehow produced a larger file, keep original
          if (blob.size >= file.size && file.type === 'image/webp') {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const extension = format === 'image/webp' ? 'webp' : 'jpg';
          const optimizedFileName = `${baseName}.${extension}`;

          const optimizedFile = new File([blob], optimizedFileName, {
            type: blob.type || format,
            lastModified: Date.now()
          });

          resolve(optimizedFile);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on error
    };

    img.src = objectUrl;
  });
}

/**
 * Optimizes an array of image Files concurrently.
 */
export async function optimizeImages(
  files: File[],
  options: OptimizeOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => optimizeImage(file, options)));
}

