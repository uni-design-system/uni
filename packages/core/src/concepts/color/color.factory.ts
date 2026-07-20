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

/** Roles whose base color can be pinned to an exact brand hex. */
export type BrandRole =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'error'
  | 'warn'
  | 'success';

export interface PaletteConfig {
  /**
   * Seed brand color as a hex string, e.g. '#4F46E5'. Anchors the neutral
   * hue and every role you don't pin via `brand`. When `brand.primary` is
   * set, that color anchors instead.
   */
  seed: string;
  /** How secondary/tertiary hues relate to the anchor, for unpinned roles. */
  scheme: ColorScheme;
  /** Saturation / tonal character of the generated (unpinned) colors. */
  category: ColorCategory;
  /** Light or dark rendering of the same palette. Defaults to 'light'. */
  mode?: 'light' | 'dark';
  /**
   * Minimum accent saturation so the brand hue stays perceptible even for the
   * `neutral` category (which is otherwise near-grey). Set to 0 to honor the
   * category saturation exactly.
   */
  accentSaturationFloor?: number;
  /**
   * Exact brand colors, pinned per role. A pinned color is emitted verbatim as
   * that role's base token in **light** mode ("cannot shift"); in **dark** mode
   * it is lifted in lightness only — hue and saturation preserved — so it stays
   * legible on a dark ground. Its on/container/surface satellites are derived
   * from it. Unpinned roles are generated from the seed + scheme as usual, so an
   * arbitrary brand pair (e.g. forest green + ochre) can be reproduced exactly.
   */
  brand?: Partial<Record<BrandRole, string>>;
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
  const { seed, scheme, category, mode = 'light', accentSaturationFloor = 18, brand = {} } = config;
  const dark = mode === 'dark';
  const t = toneMap(dark);

  // The primary brand pin (if any) anchors the neutral hue; otherwise the seed.
  const anchorHue = hexToHSL(brand.primary ?? seed).hue ?? 0;
  const hues = schemeHues(anchorHue, scheme);

  const catSat = avg(CategorySaturation[category]);
  const accentSat = Math.max(catSat, accentSaturationFloor);
  const containerSat = Math.max(catSat, accentSat * 0.5);
  const surfaceSat = Math.min(catSat, 8); // surfaces stay lightly tinted regardless of category
  const semanticSat = 62; // feedback colors stay colorful even for muted categories

  const tone = (hue: number, sat: number, lightness: number): string =>
    HSLToHex({ hue, saturation: sat, lightness });

  const background = tone(anchorHue, surfaceSat, t.background);

  // Legible foreground for a given background: the tonal near-black or
  // near-white with the higher contrast ratio.
  const onColor = (hue: number, bg: string, sat: number): string => {
    const deep = tone(hue, Math.min(sat, 14), t.onDeep);
    const light = tone(hue, Math.min(sat, 6), t.onLight);
    return contrastRatio(bg, deep) >= contrastRatio(bg, light) ? deep : light;
  };

  // Dark-mode counterpart of a pinned brand color: lift lightness only (hue and
  // saturation preserved) until it clears a contrast floor on the dark ground.
  const adaptForDark = (hex: string): string => {
    const { hue = 0, saturation = 0, lightness = 0 } = hexToHSL(hex);
    let L = Math.max(lightness, 60);
    let out = tone(hue, saturation, L);
    for (let i = 0; i < 20 && contrastRatio(out, background) < 3 && L < 92; i++) {
      L += 3;
      out = tone(hue, saturation, L);
    }
    return out;
  };

  // Resolve a role's base color: exact pin in light, lifted pin in dark, else
  // the generated tone.
  const baseFor = (name: BrandRole, hue: number, sat: number): string => {
    const pinned = brand[name];
    if (pinned) return dark ? adaptForDark(pinned) : pinned;
    return tone(hue, sat, t.accent);
  };

  const variantOverlay = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const disabled = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const onDisabled = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';

  // An accent role's base color drives its container/surface/on satellites,
  // whether that base was generated or pinned to a brand color.
  const role = (name: string, base: string, cSat: number = containerSat) => {
    const { hue = 0, saturation = 0 } = hexToHSL(base);
    const container = tone(hue, cSat, t.container);
    const roleSurface = tone(hue, surfaceSat, t.roleSurface);
    return {
      [name]: base,
      [`on-${name}`]: onColor(hue, base, saturation),
      [`${name}-container`]: container,
      [`on-${name}-container`]: onColor(hue, container, saturation),
      [`on-${name}-container-variant`]: variantOverlay,
      [`on-${name}-container-border`]: base,
      [`${name}-surface`]: roleSurface,
      [`on-${name}-surface`]: onColor(hue, roleSurface, surfaceSat),
      [`on-${name}-surface-variant`]: base,
    };
  };

  const primaryBase = baseFor('primary', hues.primary, accentSat);
  const secondaryBase = baseFor('secondary', hues.secondary, accentSat);
  const tertiaryBase = baseFor('tertiary', hues.tertiary, accentSat);
  const quaternaryBase = baseFor('quaternary', anchorHue, surfaceSat); // generated: near-grey
  const quaternaryGrey = brand.quaternary
    ? quaternaryBase
    : tone(anchorHue, surfaceSat, dark ? 70 : 46);

  const primaryAccent = primaryBase;
  const surface = tone(anchorHue, surfaceSat, t.surface);
  const surfaceVariant = tone(anchorHue, surfaceSat, t.surfaceVariant);
  const inverseSurface = tone(anchorHue, surfaceSat, t.inverse);
  const onInverse = tone(anchorHue, surfaceSat, t.onInverse);

  // Semantic feedback hues (kept colorful): red / amber / green.
  const ERROR_HUE = 8;
  const WARN_HUE = 32;
  const SUCCESS_HUE = 142;

  const errorBase = baseFor('error', ERROR_HUE, semanticSat);
  const warnBase = baseFor('warn', WARN_HUE, semanticSat);
  const successBase = baseFor('success', SUCCESS_HUE, semanticSat);
  const errorHue = hexToHSL(errorBase).hue ?? ERROR_HUE;
  const warnHue = hexToHSL(warnBase).hue ?? WARN_HUE;
  const successHue = hexToHSL(successBase).hue ?? SUCCESS_HUE;

  return {
    ...role('primary', primaryBase),
    ...role('secondary', secondaryBase),
    ...role('tertiary', tertiaryBase),

    // Quaternary is a neutral, near-grey accent tied to the brand hue.
    quaternary: quaternaryGrey,
    'on-quaternary': dark ? '#1C1B1F' : '#FFFFFF',
    'quaternary-surface': tone(anchorHue, surfaceSat, t.roleSurface),
    'on-quaternary-surface': onColor(anchorHue, tone(anchorHue, surfaceSat, t.roleSurface), surfaceSat),
    'on-quaternary-surface-variant': primaryAccent,
    'on-quaternary-container-variant': variantOverlay,
    'on-quaternary-container-border': quaternaryGrey,

    // Semantic
    error: errorBase,
    'on-error': onColor(errorHue, errorBase, semanticSat),
    'error-container': tone(errorHue, containerSat + 20, t.container),
    'on-error-container': onColor(errorHue, tone(errorHue, containerSat + 20, t.container), semanticSat),

    warn: warnBase,
    'on-warn': onColor(warnHue, warnBase, semanticSat),
    'warn-container': tone(warnHue, containerSat + 20, t.container),
    'on-warn-container': onColor(warnHue, tone(warnHue, containerSat + 20, t.container), semanticSat),
    'on-warn-container-variant': variantOverlay,
    'on-warn-container-border': warnBase,

    success: successBase,
    'on-success': onColor(successHue, successBase, semanticSat),
    'success-container': tone(successHue, containerSat + 20, t.container),
    'on-success-container': onColor(successHue, tone(successHue, containerSat + 20, t.container), semanticSat),
    'on-success-container-variant': variantOverlay,
    'on-success-container-border': successBase,

    // Neutral surfaces
    background,
    'on-background': tone(anchorHue, surfaceSat, t.onSurface),
    'on-background-variant': tone(anchorHue, surfaceSat, dark ? 62 : 58),
    surface,
    'on-surface': tone(anchorHue, surfaceSat, t.onSurface),
    'surface-variant': surfaceVariant,
    'on-surface-variant': tone(anchorHue, surfaceSat, dark ? 78 : 30),

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
