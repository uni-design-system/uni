import { HSL, HSLA, RGB, UniColor } from './color.model';
import { CategoryLightness, CategorySaturation, RoleHues } from './color.records';
import { randomRangeValue } from './color.utils';

export function HSLAToString({ hue, saturation, lightness, alpha = 1 }: HSLA): string {
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

export function RGBToString({ red, green, blue }: RGB): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * @deprecated Random HSL generation produces non-deterministic, perceptually
 * uneven colors. Use the OKLCH engine (`generateThemes` in
 * `concepts/generation`) or `generatePalette` instead.
 */
export function uniColor({ role, category, alpha = 1 }: UniColor): string {
  const hue = randomRangeValue(RoleHues[role]);
  const saturation = randomRangeValue(CategorySaturation[category]);
  const lightness = randomRangeValue(CategoryLightness[category]);

  return HSLAToString({ hue, saturation, lightness, alpha });
}

export const RGBToHSL = ({ red, green, blue }: RGB): HSL => {
  red /= 255;
  green /= 255;
  blue /= 255;
  const l = Math.max(red, green, blue);
  const s = l - Math.min(red, green, blue);
  const h = s
    ? l === red
      ? (green - blue) / s
      : l === green
        ? 2 + (blue - red) / s
        : 4 + (red - green) / s
    : 0;
  return {
    hue: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    saturation: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    lightness: (100 * (2 * l - s)) / 2,
  };
};

// ── Conversions & contrast (used by the palette factory) ────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const toHex2 = (value: number): string => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

export const rgbToHex = ({ red, green, blue }: RGB): string =>
  `#${toHex2(red)}${toHex2(green)}${toHex2(blue)}`.toUpperCase();

export const hexToRgb = (hex: string): RGB => {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const int = parseInt(h, 16);
  return { red: (int >> 16) & 255, green: (int >> 8) & 255, blue: int & 255 };
};

export const HSLToRGB = ({ hue = 0, saturation = 0, lightness = 0 }: HSL): RGB => {
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((hue % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  return {
    red: (r1 + m) * 255,
    green: (g1 + m) * 255,
    blue: (b1 + m) * 255,
  };
};

/** Build an sRGB hex string straight from HSL channel values. */
export const HSLToHex = (hsl: HSL): string => rgbToHex(HSLToRGB(hsl));

export const hexToHSL = (hex: string): HSL => RGBToHSL(hexToRgb(hex));

/** WCAG relative luminance of an sRGB color (0 = black, 1 = white). */
export const relativeLuminance = ({ red, green, blue }: RGB): number => {
  const channel = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
};

/** WCAG contrast ratio between two colors (1:1 – 21:1). Accepts RGB or hex. */
export const contrastRatio = (a: RGB | string, b: RGB | string): number => {
  const la = relativeLuminance(typeof a === 'string' ? hexToRgb(a) : a);
  const lb = relativeLuminance(typeof b === 'string' ? hexToRgb(b) : b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

// Future Methods - https://codepen.io/jkantner/pen/VVEMRK
