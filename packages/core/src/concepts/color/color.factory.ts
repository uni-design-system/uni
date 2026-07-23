import type { Colors } from '../theme';
import { generateColors, type GenerateColorsConfig } from '../generation/palette.factory';
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
   * Minimum accent saturation (0–100 scale) so the brand hue stays perceptible
   * even for the `neutral` category (which is otherwise near-grey). Set to 0
   * to honor the category saturation exactly.
   */
  accentSaturationFloor?: number;
  /**
   * Exact brand colors, pinned per role. A pinned color is emitted verbatim as
   * that role's base token in **light** mode ("cannot shift"); in **dark** mode
   * it is lifted in lightness only — hue and chroma preserved — so it stays
   * legible on a dark ground. Its on/container/surface satellites are derived
   * from it. Unpinned roles are generated from the seed + scheme as usual, so an
   * arbitrary brand pair (e.g. forest green + ochre) can be reproduced exactly.
   */
  brand?: Partial<Record<BrandRole, string>>;
}

/**
 * Generate a complete {@link Colors} token set from a single seed color, a
 * {@link ColorScheme} and a {@link ColorCategory}. Produces a light or dark
 * variant of the same palette; `on-*` colors are driven to WCAG AA contrast
 * so text stays legible for any seed.
 *
 * Delegates to the OKLCH engine in `concepts/generation` — all lightness and
 * chroma math is perceptual, and every derived pair passes through the WCAG
 * guard-rail. Accepts the engine's extended config, so callers may also pass
 * soft `targets` (brand-faithful but guard-railed) and a `checks` sink. Use
 * `generateThemes()` for the light+dark pair plus a {@link ContrastReport}.
 */
export const generatePalette = (config: GenerateColorsConfig): Colors => generateColors(config);
