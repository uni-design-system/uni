import type { ColorCategory, ColorScheme } from '../color/color.types';
import type { Radii, UniTheme } from '../theme/theme.model';
import type { BrandRole } from '../color/color.factory';
import { createTheme } from '../theme/themes/base.theme';
import { hexToOklch, oklchToHex } from './oklch.helper';
import { CategoryChroma, generateColors } from './palette.factory';
import type {
  ContrastCheck,
  GeneratedThemeConfig,
  GenerationInput,
  ThemeShape,
} from './generation.types';

/** Radii presets per shape language (PRD §3.5.A). Same keys as `BaseRadii`. */
export const ShapeRadii: Record<ThemeShape, Radii> = {
  sharp: { none: 'none', xxs: '0px', xs: '0px', sm: '0px', md: '0px', lg: '0px', max: '0px' },
  modern: { none: 'none', xxs: '4px', xs: '8px', sm: '16px', md: '24px', lg: '32px', max: '999px' },
  playful: { none: 'none', xxs: '8px', xs: '16px', sm: '24px', md: '32px', lg: '48px', max: '9999px' },
};

/** Shortest angular distance between two hue angles, in degrees (0–180). */
const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * Classify 2–3 brand hues against {@link ColorScheme} by their angular
 * distances from the primary hue. Heuristic bands, widest match wins.
 */
export const classifyScheme = (primaryHue: number, otherHues: number[]): ColorScheme => {
  const distances = otherHues.map((h) => hueDistance(primaryHue, h));
  if (distances.length === 0) return 'analogous';
  if (distances.every((d) => d < 15)) return 'monochromatic';
  if (distances.every((d) => d <= 65)) return 'analogous';
  if (distances.some((d) => d >= 165)) return 'complimentary';
  if (distances.length > 1 && distances.every((d) => d >= 130)) return 'splitComplimentary';
  return 'triadic';
};

/**
 * Infer a tonal category from the seed's own chroma, so an unstated "vibe"
 * preserves the brand's character — vivid stays vivid, muted stays muted.
 */
export const inferCategory = (seedHex: string): ColorCategory => {
  const { c } = hexToOklch(seedHex);
  if (c >= 0.13) return 'jewel';
  if (c >= 0.07) return 'earth';
  if (c >= 0.03) return 'pastel';
  return 'neutral';
};

/**
 * The theme generation engine (PRD §3.3): brand seed(s) in, complete WCAG-AA
 * light+dark {@link Colors} pair out, with a machine-readable contrast report.
 * Pure and deterministic — identical input yields identical output.
 */
export const generateThemes = (input: GenerationInput): GeneratedThemeConfig => {
  const seeds = (Array.isArray(input.seed) ? input.seed : [input.seed]).slice(0, 3);
  const [primary, secondary, tertiary] = seeds;
  const scheme =
    input.scheme ??
    (seeds.length > 1
      ? classifyScheme(hexToOklch(primary).h, seeds.slice(1).map((s) => hexToOklch(s).h))
      : 'analogous');
  const category = input.vibe ?? inferCategory(primary);

  // Seeds pass through as soft targets with their own chroma (brand fidelity).
  // Only an *explicit* vibe caps them to the category's chroma ceiling.
  const applyVibe = (hex: string): string => {
    if (!input.vibe) return hex;
    const color = hexToOklch(hex);
    return oklchToHex({ ...color, c: Math.min(color.c, CategoryChroma[input.vibe]) });
  };
  const targets: Partial<Record<BrandRole, string>> = { primary: applyVibe(primary) };
  if (secondary) targets.secondary = applyVibe(secondary);
  if (tertiary) targets.tertiary = applyVibe(tertiary);

  const checks: ContrastCheck[] = [];
  const base = { seed: primary, scheme, category, targets, checks };
  const lightColors = generateColors({ ...base, mode: 'light' });
  const darkColors = generateColors({ ...base, mode: 'dark' });

  const worstRatio = checks.reduce((worst, check) => Math.min(worst, check.ratio), 21);
  return {
    lightColors,
    darkColors,
    radii: input.shape ? ShapeRadii[input.shape] : undefined,
    report: { checks, worstRatio, pass: checks.every((check) => check.pass) },
  };
};

/**
 * Convenience wrapper: {@link generateThemes} piped through `createTheme()`,
 * returning a registration-ready light/dark {@link UniTheme} pair.
 */
export const generateUniThemes = (input: GenerationInput): { light: UniTheme; dark: UniTheme } => {
  const { lightColors, darkColors, radii } = generateThemes(input);
  const name = input.name ?? 'Brand';
  const id = name.replace(/\W+/g, '') || 'Brand';
  return {
    light: createTheme({ id: `${id}Light`, name: `${name} Light`, colors: lightColors, radii }),
    dark: createTheme({ id: `${id}Dark`, name: `${name} Dark`, colors: darkColors, radii }),
  };
};
