import type { ColorCategory, ColorScheme } from '../color/color.types';
import type { Colors, Radii, Shadows } from '../theme/theme.model';

/** Shape language for generated radii — see the PRD's radii presets. */
export type ThemeShape = 'sharp' | 'modern' | 'playful';

export interface GenerationInput {
  /**
   * Brand color(s): a single hex seed, or 2–3 hexes assigned to the
   * primary/secondary/tertiary roles in order. Seeds are honored as closely
   * as WCAG AA allows — the guard-rail may nudge lightness, never hue.
   */
  seed: string | string[];
  /**
   * Tonal character of the generated palette. Defaults to a category
   * inferred from the seed's own chroma, so a vivid brand stays vivid and a
   * muted brand stays muted.
   */
  vibe?: ColorCategory;
  /** Override the hue-wheel relationship (auto-classified for multi-seed input). */
  scheme?: ColorScheme;
  /** Emit a {@link Radii} override matching this shape language. */
  shape?: ThemeShape;
  /** Display name for the generated themes. Defaults to "Brand". */
  name?: string;
}

/** One WCAG 2.2 pair verified by the guard-rail, by token name. */
export interface ContrastCheck {
  mode: 'light' | 'dark';
  /** Content/border token name, e.g. 'on-primary'. */
  foreground: string;
  /** Surface token name it renders on, e.g. 'primary'. */
  background: string;
  foregroundColor: string;
  backgroundColor: string;
  /** Achieved contrast ratio (1–21). */
  ratio: number;
  /** Required ratio: 4.5 for content pairs, 3 for borders/outline. */
  required: number;
  pass: boolean;
  level: 'AA' | 'AAA' | 'fail';
}

/** Machine-readable WCAG audit of a generated light+dark theme pair. */
export interface ContrastReport {
  checks: ContrastCheck[];
  /** Lowest ratio across all checks. */
  worstRatio: number;
  /** True when every checked pair meets its requirement. */
  pass: boolean;
}

/** Output of {@link generateThemes} — plugs directly into `createTheme()`. */
export interface GeneratedThemeConfig {
  lightColors: Colors;
  darkColors: Colors;
  /** Present when `shape` was provided. */
  radii?: Radii;
  /** Brand-tinted shadow overrides (reserved; not yet emitted). */
  shadows?: Shadows;
  report: ContrastReport;
}
