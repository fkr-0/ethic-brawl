/**
 * Color manipulation utilities
 */

/**
 * RGB color representation
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * RGBA color representation
 */
export interface RGBA extends RGB {
  a: number; // 0-1
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Parse a hex color string to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const [, red, green, blue] = result;
  if (!red || !green || !blue) return null;

  return {
    r: Number.parseInt(red, 16),
    g: Number.parseInt(green, 16),
    b: Number.parseInt(blue, 16),
  };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Linear interpolation between two colors
 */
export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/**
 * Convert RGB to CSS string
 */
export function rgbToString(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Convert RGBA to CSS string
 */
export function rgbaToString(rgba: RGBA): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

/**
 * Create RGBA from RGB and alpha
 */
export function withAlpha(rgb: RGB, a: number): RGBA {
  return { ...rgb, a };
}

/**
 * Darken a color by a percentage
 */
export function darken(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - amount);
  return hslToRgb(hsl);
}

/**
 * Lighten a color by a percentage
 */
export function lighten(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + amount);
  return hslToRgb(hsl);
}

/**
 * Saturate a color by a percentage
 */
export function saturate(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.s = Math.min(100, hsl.s + amount);
  return hslToRgb(hsl);
}

/**
 * Desaturate a color by a percentage
 */
export function desaturate(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.s = Math.max(0, hsl.s - amount);
  return hslToRgb(hsl);
}

/**
 * Adjust hue of a color
 */
export function adjustHue(rgb: RGB, degrees: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return hslToRgb(hsl);
}

/**
 * Complementary color
 */
export function complement(rgb: RGB): RGB {
  return adjustHue(rgb, 180);
}

/**
 * Predefined colors for the game
 */
export const COLORS = {
  // Background
  DEEP_PURPLE: '#1A0A2E',
  DARK_MAGENTA: '#2D1B4E',

  // Accents
  CYAN: '#00F5FF',
  HOT_MAGENTA: '#FF00FF',
  ACID_GREEN: '#39FF14',
  NEON_RED: '#FF073A',

  // UI
  WHITE: '#FFFFFF',
  PALE_PURPLE: '#B8A9C9',

  // Game
  HEALTH: '#00F5FF',
  HEALTH_LOW: '#FF073A',
  COMBO: '#FF00FF',
  SPECIAL: '#39FF14',
} as const;

/**
 * Get RGB from predefined color name
 */
export function getGameColor(name: keyof typeof COLORS): RGB {
  return hexToRgb(COLORS[name]) ?? { r: 255, g: 255, b: 255 };
}
