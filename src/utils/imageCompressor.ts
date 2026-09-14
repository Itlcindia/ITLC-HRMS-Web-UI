/**
 * Image Compression Utility
 * Resizes and compresses images to prevent localStorage QuotaExceededError
 * and optimize network payload sizes across all HRMS panels.
 */

export const compressImage = (
  input: File | string,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    const processDataUrl = (dataUrl: string) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        resolve(dataUrl || '');
        return;
      }

      // If it's an SVG or already tiny, return as is
      if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.length < 15000) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions keeping aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export as JPEG with given quality
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            resolve(dataUrl);
          }
        } catch (e) {
          console.warn('Image compression canvas error, using original:', e);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof input === 'string') {
      processDataUrl(input);
    } else if (input && (typeof FileReader !== 'undefined')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processDataUrl((e.target?.result as string) || '');
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(input as Blob);
    } else {
      resolve('');
    }
  });
};
