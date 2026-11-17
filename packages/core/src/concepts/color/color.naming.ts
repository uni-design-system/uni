/**
 * Helpers for *specified* colors — a paint, a fabric, a brand ink a user
 * typed, picked or sampled — as opposed to theme colors, which live in the
 * palette. Framework-free so every binding parses, names and samples a color
 * the same way.
 */

const toHex2 = (value: number): string =>
  Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, '0');

/**
 * Generous in, strict out: reads the spellings people actually paste —
 * `434c5a`, `#434C5A`, `#abc`, `434c5aff` (alpha dropped), `rgb(67, 76, 90)`,
 * `rgba(67,76,90,1)` — and returns sRGB `#RRGGBB` in uppercase, or `null` for
 * anything else. Never throws, whatever it is handed.
 */
export function normalizeHex(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let text = input.trim();

  const rgb = text.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return ('#' + rgb.slice(1, 4).map((channel) => toHex2(Number(channel))).join('')).toUpperCase();

  text = text.replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(text)) {
    text = text
      .split('')
      .map((digit) => digit + digit)
      .join('');
  }
  if (/^[0-9a-f]{8}$/i.test(text)) text = text.slice(0, 6);
  return /^[0-9a-f]{6}$/i.test(text) ? '#' + text.toUpperCase() : null;
}

/** Hue bands, as the upper bound (degrees) of each name. */
const HUE_NAMES: readonly (readonly [number, string])[] = [
  [15, 'red'],
  [45, 'orange'],
  [70, 'yellow'],
  [160, 'green'],
  [200, 'teal'],
  [250, 'blue'],
  [290, 'violet'],
  [335, 'magenta'],
  [360, 'red'],
];

/**
 * A color as it should be *said*: "a dark slate blue", "an off-white" — for
 * an accessible name or a live region, where six hex characters tell a
 * screen-reader user nothing. Accepts anything {@link normalizeHex} does and
 * returns `''` for anything it does not.
 *
 * Deliberately coarse — nine hue words, light / dark, muted. It names a
 * swatch for someone who cannot see it; it does not grade paint.
 *
 * Near-neutrals are caught by chroma (max − min) before any hue is read: HSL
 * saturation blows up near white and black, where a paint chip's faint cast
 * would otherwise come out as "a light yellow".
 */
export function nameHue(hex: unknown): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return '';

  const int = parseInt(normalized.slice(1), 16);
  const [r, g, b] = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const chroma = max - min;

  if (chroma < 0.08) {
    if (lightness > 0.9) return 'an off-white';
    if (lightness > 0.6) return 'a light gray';
    if (lightness > 0.3) return 'a mid gray';
    return 'a near-black';
  }

  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) hue = ((g - b) / chroma) % 6;
  else if (max === g) hue = (b - r) / chroma + 2;
  else hue = (r - g) / chroma + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  let name = (HUE_NAMES.find(([limit]) => hue < limit) ?? HUE_NAMES[HUE_NAMES.length - 1])[1];
  let muted = saturation < 0.3;
  // A grayed blue has a name of its own, and "muted slate blue" says it twice.
  if (name === 'blue' && saturation < 0.35) {
    name = 'slate blue';
    muted = false;
  }

  const tone = lightness > 0.75 ? 'light ' : lightness < 0.32 ? 'dark ' : '';
  const phrase = tone + (muted ? 'muted ' : '') + name;
  return (/^[aeiou]/.test(phrase) ? 'an ' : 'a ') + phrase;
}

/**
 * The mean color of a block of RGBA pixels — `ImageData.data`, or any array
 * laid out the same way — as `#RRGGBB`. The sampling rule behind an
 * eyedropper over a photograph: one pixel of a photographed chip is noise, so
 * a sample is the mean of a region around the point, never the point.
 *
 * Returns `null` for an empty block. Alpha is ignored: a photograph is
 * opaque, and a transparent pixel has no color to weigh in.
 */
export function meanColor(pixels: ArrayLike<number>): string | null {
  const count = Math.floor(pixels.length / 4);
  if (!count) return null;

  let red = 0;
  let green = 0;
  let blue = 0;
  for (let i = 0; i < count * 4; i += 4) {
    red += pixels[i];
    green += pixels[i + 1];
    blue += pixels[i + 2];
  }
  return ('#' + toHex2(red / count) + toHex2(green / count) + toHex2(blue / count)).toUpperCase();
}
