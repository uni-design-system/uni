import type { Colors } from '../theme';
import { HSLToHex, contrastRatio, hexToHSL } from './color.helper';
import { CategorySaturation } from './color.records';
import {
  getAnalogousHues,
  getComplimentaryHue,
  getSplitComplimentaryHues,
  getTriadicHues,
} from './color.utils';
import type { ColorCategory, ColorScheme } from './color.types';

export interface PaletteConfig {
  /** Seed brand color as a hex string, e.g. '#4F46E5'. */
  seed: string;
  /** How secondary/tertiary hues relate to the seed. */
  scheme: ColorScheme;
  /** Saturation / tonal character of the palette. */
  category: ColorCategory;
  /** Light or dark rendering of the same palette. Defaults to 'light'. */
  mode?: 'light' | 'dark';
  /**
   * Minimum accent saturation so the brand hue stays perceptible even for the
   * `neutral` category (which is otherwise near-grey). Set to 0 to honor the
   * category saturation exactly.
   */
  accentSaturationFloor?: number;
}

interface RoleHues {
  primary: number;
  secondary: number;
  tertiary: number;
}

const avg = (range: { low: number; high: number }): number => (range.low + range.high) / 2;

/**
 * Derive the primary/secondary/tertiary hues from a seed hue using the color
 * wheel relationships in {@link ColorScheme}.
 */
export const schemeHues = (hue: number, scheme: ColorScheme): RoleHues => {
  switch (scheme) {
    case 'monochromatic':
      return { primary: hue, secondary: hue, tertiary: hue };
    case 'analogous': {
      const [a, b] = getAnalogousHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
    case 'complimentary': {
      const [a] = getAnalogousHues(hue);
      return { primary: hue, secondary: getComplimentaryHue(hue), tertiary: a };
    }
    case 'splitComplimentary': {
      const [a, b] = getSplitComplimentaryHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
    case 'triadic': {
      const [a, b] = getTriadicHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
  }
};

// Lightness targets per rendering mode. These are the tonal "slots" every
// token maps onto — kept in one place so light/dark stay in lockstep.
const toneMap = (dark: boolean) =>
  dark
    ? {
        accent: 76,
        container: 34,
        roleSurface: 16,
        background: 12,
        surface: 13,
        surfaceVariant: 28,
        outline: 55,
        onSurface: 90,
        inverse: 90,
        onInverse: 18,
        onDeep: 8,
        onLight: 98,
      }
    : {
        accent: 40,
        container: 90,
        roleSurface: 97,
        background: 99,
        surface: 99,
        surfaceVariant: 92,
        outline: 52,
        onSurface: 14,
        inverse: 20,
        onInverse: 96,
        onDeep: 12,
        onLight: 98,
      };

/**
 * Generate a complete {@link Colors} token set from a single seed color, a
 * {@link ColorScheme} and a {@link ColorCategory}. Produces a light or dark
 * variant of the same palette; `on-*` colors are chosen by WCAG contrast so
 * text stays legible for any seed.
 */
export const generatePalette = (config: PaletteConfig): Colors => {
  const { seed, scheme, category, mode = 'light', accentSaturationFloor = 18 } = config;
  const dark = mode === 'dark';
  const t = toneMap(dark);

  const seedHue = hexToHSL(seed).hue ?? 0;
  const hues = schemeHues(seedHue, scheme);

  const catSat = avg(CategorySaturation[category]);
  const accentSat = Math.max(catSat, accentSaturationFloor);
  const containerSat = Math.max(catSat, accentSat * 0.5);
  const surfaceSat = Math.min(catSat, 8); // surfaces stay lightly tinted regardless of category
  const semanticSat = 62; // feedback colors stay colorful even for muted categories

  const tone = (hue: number, sat: number, lightness: number): string =>
    HSLToHex({ hue, saturation: sat, lightness });

  // Legible foreground for a given background: the tonal near-black or
  // near-white with the higher contrast ratio.
  const onColor = (hue: number, bg: string, sat: number): string => {
    const deep = tone(hue, Math.min(sat, 14), t.onDeep);
    const light = tone(hue, Math.min(sat, 6), t.onLight);
    return contrastRatio(bg, deep) >= contrastRatio(bg, light) ? deep : light;
  };

  const variantOverlay = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const disabled = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const onDisabled = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';

  // A named accent role produces its base, container and the on/variant/border
  // satellites that the token set expects.
  const role = (name: string, hue: number, sat: number) => {
    const base = tone(hue, sat, t.accent);
    const container = tone(hue, containerSat, t.container);
    const roleSurface = tone(hue, surfaceSat, t.roleSurface);
    return {
      [name]: base,
      [`on-${name}`]: onColor(hue, base, sat),
      [`${name}-container`]: container,
      [`on-${name}-container`]: onColor(hue, container, sat),
      [`on-${name}-container-variant`]: variantOverlay,
      [`on-${name}-container-border`]: base,
      [`${name}-surface`]: roleSurface,
      [`on-${name}-surface`]: onColor(hue, roleSurface, sat),
      [`on-${name}-surface-variant`]: base,
    };
  };

  const primaryAccent = tone(hues.primary, accentSat, t.accent);
  const background = tone(hues.primary, surfaceSat, t.background);
  const surface = tone(hues.primary, surfaceSat, t.surface);
  const surfaceVariant = tone(hues.primary, surfaceSat, t.surfaceVariant);
  const inverseSurface = tone(hues.primary, surfaceSat, t.inverse);
  const onInverse = tone(hues.primary, surfaceSat, t.onInverse);

  // Semantic feedback hues (kept colorful): red / amber / green.
  const ERROR_HUE = 8;
  const WARN_HUE = 32;
  const SUCCESS_HUE = 142;

  return {
    ...role('primary', hues.primary, accentSat),
    ...role('secondary', hues.secondary, accentSat),
    ...role('tertiary', hues.tertiary, accentSat),

    // Quaternary is a neutral, near-grey accent tied to the brand hue.
    quaternary: tone(hues.primary, surfaceSat, dark ? 70 : 46),
    'on-quaternary': dark ? '#1C1B1F' : '#FFFFFF',
    'quaternary-surface': tone(hues.primary, surfaceSat, t.roleSurface),
    'on-quaternary-surface': onColor(hues.primary, tone(hues.primary, surfaceSat, t.roleSurface), surfaceSat),
    'on-quaternary-surface-variant': primaryAccent,
    'on-quaternary-container-variant': variantOverlay,
    'on-quaternary-container-border': tone(hues.primary, surfaceSat, dark ? 70 : 46),

    // Semantic
    error: tone(ERROR_HUE, semanticSat, t.accent),
    'on-error': onColor(ERROR_HUE, tone(ERROR_HUE, semanticSat, t.accent), semanticSat),
    'error-container': tone(ERROR_HUE, containerSat + 20, t.container),
    'on-error-container': onColor(ERROR_HUE, tone(ERROR_HUE, containerSat + 20, t.container), semanticSat),

    warn: tone(WARN_HUE, semanticSat, t.accent),
    'on-warn': onColor(WARN_HUE, tone(WARN_HUE, semanticSat, t.accent), semanticSat),
    'warn-container': tone(WARN_HUE, containerSat + 20, t.container),
    'on-warn-container': onColor(WARN_HUE, tone(WARN_HUE, containerSat + 20, t.container), semanticSat),
    'on-warn-container-variant': variantOverlay,
    'on-warn-container-border': tone(WARN_HUE, semanticSat, t.accent),

    success: tone(SUCCESS_HUE, semanticSat, t.accent),
    'on-success': onColor(SUCCESS_HUE, tone(SUCCESS_HUE, semanticSat, t.accent), semanticSat),
    'success-container': tone(SUCCESS_HUE, containerSat + 20, t.container),
    'on-success-container': onColor(SUCCESS_HUE, tone(SUCCESS_HUE, containerSat + 20, t.container), semanticSat),
    'on-success-container-variant': variantOverlay,
    'on-success-container-border': tone(SUCCESS_HUE, semanticSat, t.accent),

    // Neutral surfaces
    background,
    'on-background': tone(hues.primary, surfaceSat, t.onSurface),
    'on-background-variant': tone(hues.primary, surfaceSat, dark ? 62 : 58),
    surface,
    'on-surface': tone(hues.primary, surfaceSat, t.onSurface),
    'surface-variant': surfaceVariant,
    'on-surface-variant': tone(hues.primary, surfaceSat, dark ? 78 : 30),

    // Inverse
    'inverse-surface': inverseSurface,
    'on-inverse-surface': onInverse,
    'on-inverse-surface-primary': primaryAccent,
    'on-inverse-surface-variant': primaryAccent,
    'inverse-container': inverseSurface,
    'on-inverse-container': onInverse,

    // Utility
    outline: tone(hues.primary, surfaceSat, t.outline),
    shadow: '#000000',
    scrim: '#000000',
    'surface-tint': primaryAccent,
    transparent: 'rgba(0,0,0,0)',
    ghost: 'rgba(0,0,0,0)',

    // Disabled
    disabled,
    'on-disabled': onDisabled,
    'disabled-container': tone(hues.primary, surfaceSat, dark ? 22 : 95),
    'on-disabled-container': onDisabled,
    'disabled-surface': disabled,
    'on-disabled-surface': dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    'on-disabled-surface-variant': variantOverlay,
  };
};
