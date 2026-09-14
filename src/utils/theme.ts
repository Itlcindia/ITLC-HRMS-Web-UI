/**
 * Utility to extract dominant color from Base64 Image string.
 * It loads the image, draws it to a small 16x16 canvas,
 * filters out near-white/near-black/transparent pixels,
 * and returns the average color or the most colorful pixel color in HEX format.
 */
export const extractDominantColor = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve('#4F46E5'); // Fallback to default indigo
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#4F46E5');
          return;
        }
        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;
        
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        let bestColor = '';
        let maxSaturation = -1;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip highly transparent pixels
          if (a < 150) continue;

          // Skip pure black/pure white/grays
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const delta = maxVal - minVal;

          // Delta is saturation. If delta is small, color is grey/white/black
          if (delta < 25) continue; 
          
          // Saturation
          const saturation = delta / maxVal;
          if (saturation > maxSaturation) {
            maxSaturation = saturation;
            const rHex = r.toString(16).padStart(2, '0');
            const gHex = g.toString(16).padStart(2, '0');
            const bHex = b.toString(16).padStart(2, '0');
            bestColor = `#${rHex}${gHex}${bHex}`;
          }

          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }

        if (bestColor) {
          resolve(bestColor);
        } else if (count > 0) {
          const rAvg = Math.round(rSum / count).toString(16).padStart(2, '0');
          const gAvg = Math.round(gSum / count).toString(16).padStart(2, '0');
          const bAvg = Math.round(bSum / count).toString(16).padStart(2, '0');
          resolve(`#${rAvg}${gAvg}${bAvg}`);
        } else {
          resolve('#4F46E5');
        }
      } catch (err) {
        resolve('#4F46E5');
      }
    };
    img.onerror = () => {
      resolve('#4F46E5');
    };
  });
};

/**
 * Applies custom theme color variables to document root.
 */
export const applyThemeColor = (hexColor: string | null | undefined) => {
  if (!hexColor || !/^#[0-9A-F]{6}$/i.test(hexColor)) {
    // If invalid or reset, remove dynamic variables to fallback to CSS defaults
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--color-primary-light');
    document.documentElement.style.removeProperty('--color-primary-glow');
    return;
  }
  
  // Set primary color
  document.documentElement.style.setProperty('--color-primary', hexColor);
  
  // Convert HEX to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Set light & glow variables
  document.documentElement.style.setProperty('--color-primary-light', `rgba(${r}, ${g}, ${b}, 0.08)`);
  document.documentElement.style.setProperty('--color-primary-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
};
