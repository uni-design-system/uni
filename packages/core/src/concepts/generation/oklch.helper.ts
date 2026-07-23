import type { RGB } from '../color/color.model';
import { hexToRgb, rgbToHex } from '../color/color.helper';

/**
 * A color in OKLCH: perceptual lightness `l` (0–1), chroma `c` (0 = grey,
 * ~0.37 = max sRGB vividness) and hue angle `h` in degrees (0–360).
 *
 * Unlike HSL lightness, OKLCH `l` is perceptually uniform — a blue and a
 * yellow at the same `l` *look* equally light — which is what makes derived
 * tonal scales consistent across hues.
 */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// sRGB transfer function and its inverse (gamma ↔ linear light).
const srgbToLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

const linearToSrgb = (channel: number): number =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;

interface LinearRGB {
  r: number;
  g: number;
  b: number;
}

// OKLab ↔ linear sRGB matrices (Björn Ottosson's reference constants).
const linearRgbToOklab = ({ r, g, b }: LinearRGB): { l: number; a: number; b: number } => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
};

const oklabToLinearRgb = (l: number, a: number, b: number): LinearRGB => {
  const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(l - 0.0894841775 * a - 1.291485548 * b, 3);
  return {
    r: 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    g: -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    b: -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  };
};

const oklchToLinearRgb = ({ l, c, h }: Oklch): LinearRGB => {
  const rad = (h * Math.PI) / 180;
  return oklabToLinearRgb(l, c * Math.cos(rad), c * Math.sin(rad));
};

const GAMUT_EPSILON = 1e-4;

const inSrgbGamut = ({ r, g, b }: LinearRGB): boolean =>
  r >= -GAMUT_EPSILON &&
  r <= 1 + GAMUT_EPSILON &&
  g >= -GAMUT_EPSILON &&
  g <= 1 + GAMUT_EPSILON &&
  b >= -GAMUT_EPSILON &&
  b <= 1 + GAMUT_EPSILON;

/** Parse a hex color (`#RGB` or `#RRGGBB`) into OKLCH. */
export const hexToOklch = (hex: string): Oklch => {
  const { red, green, blue } = hexToRgb(hex);
  const { l, a, b } = linearRgbToOklab({
    r: srgbToLinear(red / 255),
    g: srgbToLinear(green / 255),
    b: srgbToLinear(blue / 255),
  });
  const c = Math.hypot(a, b);
  const h = c < 1e-6 ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  return { l, c, h: h < 0 ? h + 360 : h };
};

/**
 * Render OKLCH as an sRGB hex string. Out-of-gamut colors are mapped back
 * into sRGB by reducing chroma only — lightness and hue are preserved, so
 * vivid seeds desaturate gracefully instead of shifting hue or clipping.
 */
export const oklchToHex = (color: Oklch): string => {
  const target: Oklch = { l: clamp(color.l, 0, 1), c: Math.max(color.c, 0), h: color.h };
  let rgb = oklchToLinearRgb(target);
  if (!inSrgbGamut(rgb)) {
    let low = 0;
    let high = target.c;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inSrgbGamut(oklchToLinearRgb({ ...target, c: mid }))) low = mid;
      else high = mid;
    }
    rgb = oklchToLinearRgb({ ...target, c: low });
  }
  // Scale *after* the transfer function: 255 × transfer(channel), rounded once
  // inside rgbToHex. Rounding before scaling collapses every channel to 0/1.
  return rgbToHex(toSrgb255(rgb));
};

const toSrgb255 = ({ r, g, b }: LinearRGB): RGB => ({
  red: 255 * linearToSrgb(clamp(r, 0, 1)),
  green: 255 * linearToSrgb(clamp(g, 0, 1)),
  blue: 255 * linearToSrgb(clamp(b, 0, 1)),
});
