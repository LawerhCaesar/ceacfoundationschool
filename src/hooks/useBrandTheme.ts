import { useEffect } from 'react';

interface ExtractedColorHSL {
  hue: number; // 0 - 360
  saturation: number; // 0 - 100
  lightness: number; // 0 - 100
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl(r: number, g: number, b: number): ExtractedColorHSL {
  // Convert RGB (0-255) to HSL (0-360, 0-100, 0-100)
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
}

function getPrimaryForeground(lightness: number): string {
  // Choose white text for darker colors, black for lighter colors
  return lightness < 55 ? '0 0% 100%' : '0 0% 0%';
}

function lighten(lightness: number, amount: number): number {
  return clamp(lightness + amount, 0, 100);
}

function shiftHue(hue: number, amount: number): number {
  const shifted = (hue + amount) % 360;
  return shifted < 0 ? shifted + 360 : shifted;
}

/**
 * Extracts a brand color from an image and updates CSS variables to balance the theme
 * with the logo's primary color. Safe no-op if image fails to load.
 */
export function useBrandTheme(imageUrl: string = 'logo.png'): void {
  useEffect(() => {
    let isCancelled = false;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;

    image.onload = () => {
      if (isCancelled) return;

      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Scale down for performance
        const sampleWidth = 50;
        const sampleHeight = Math.max(1, Math.round((image.height / image.width) * sampleWidth));
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        context.drawImage(image, 0, 0, sampleWidth, sampleHeight);

        const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 10) continue;

          // Skip near-white background pixels
          if (r > 245 && g > 245 && b > 245) continue;

          totalR += r;
          totalG += g;
          totalB += b;
          count += 1;
        }

        if (count === 0) return;

        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);

        let { hue, saturation, lightness } = rgbToHsl(avgR, avgG, avgB);

        // Normalize: ensure saturation and lightness are within usable ranges
        saturation = clamp(saturation, 45, 85);
        lightness = clamp(lightness, 35, 60);

        const primary = `${hue} ${saturation}% ${lightness}%`;
        const primaryForeground = getPrimaryForeground(lightness);

        // Derive accent/secondary from primary
        const accentHue = shiftHue(hue, 20);
        const accent = `${accentHue} ${clamp(saturation - 10, 35, 80)}% ${lightness}%`;
        const secondaryHue = shiftHue(hue, -20);
        const secondary = `${secondaryHue} ${clamp(saturation - 15, 30, 75)}% ${lightness}%`;

        // Slightly lighter accent for UI affordances
        const accentLight = `${hue} ${saturation}% ${lighten(lightness, 0)}%`;
        const accentForeground = '0 0% 100%';

        const root = document.documentElement;
        root.style.setProperty('--primary', primary);
        root.style.setProperty('--primary-foreground', primaryForeground);
        root.style.setProperty('--ring', primary);

        root.style.setProperty('--sidebar-primary', primary);
        root.style.setProperty('--sidebar-ring', primary);

        root.style.setProperty('--accent', accentLight);
        root.style.setProperty('--accent-foreground', accentForeground);
        root.style.setProperty('--secondary', secondary);
      } catch {
        // Fail silently; keep default theme
      }
    };

    image.onerror = () => {
      // Fail silently; keep default theme
    };

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);
}


