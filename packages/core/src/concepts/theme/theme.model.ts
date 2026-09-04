import { TextRole, TextStyle, type TypeFaceDefinition } from '../typography';
import { ColorToken } from '../color';
import type { ComponentThemes } from '../component';
import type { Variant } from './theme.types';
import type { Size } from '../size';
import type { Elevation } from '../elevation';
import type { StyleExpression } from '../style/style.types';

export type Colors = Partial<Record<ColorToken, string>>;
export type ColorKey = keyof Colors;
export type OptionalColor = ColorKey | undefined;

/**
 * A theme's spacing scale. The named steps stay optional and discoverable;
 * the index signature lets a theme add its own (`tight: '6px'`), which
 * `NullableSize` accepts wherever a spacing token is taken. Spelled out rather
 * than `Partial<Record<NullableSize, …>>`, which would collapse to a plain
 * string record and lose autocomplete on the named steps.
 */
export type Spacing = { [K in Size | 'none']?: string | number } & {
  [key: string]: string | number | undefined;
};
export type Orientation = 'horizontal' | 'vertical';
export type LinearSpacing = Record<Orientation, Spacing>;

/**
 * A theme's type scale. Keyed by the canonical {@link TextRole}s, with room
 * for a few product-specific extras (badge, tag, input). This is the single
 * source of type truth — CSS-ready `typefaces` are derived from it on read
 * via `toTypefaces()`, never stored twice.
 */
export type Typography = Record<TextRole, TextStyle> & Record<string, TextStyle>;

export type Typefaces = Partial<Record<TextRole | string, TypeFaceDefinition>>;
export type Typeface = keyof Typefaces;

export type Borders = Partial<Record<Variant | string, string>>;
export type Border = keyof Borders;
export type OptionalBorder = Border | undefined;

export type RadiiSize = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'max';
export type Radii = Partial<Record<RadiiSize | string, string>>;
export type Radius = keyof Radii;
export type OptionalRadius = Radius | undefined;

export type Shadows = Partial<Record<Elevation | string, string>>;
export type Shadow = keyof Shadows;

export type Thickness = 'thin' | 'thick' | 'standard';
/** Open like Borders/Shadows: extra named primitives (e.g. `focusRing`) allowed. */
export type Thicknesses = Partial<Record<Thickness | string, string | number>>;

export type Icons = Record<string, string>;
export type Icon = keyof Icons;

/**
 * A named motion primitive. Duration and easing are one token rather than two
 * scales because they are one design decision: slowing a panel without
 * softening its curve reads as sluggish rather than calm.
 */
export interface MotionToken {
  /** Milliseconds. */
  duration: number;
  /** Any CSS `<easing-function>` — `linear`, `ease-out`, `cubic-bezier(…)`. */
  easing: string;
  /**
   * Entry scale for panels that grow into place, e.g. `0.8`. Omitted by
   * motions that only fade, and ignored by components that only fade.
   */
  scale?: number;
}

export type MotionName = 'popup' | 'panel' | 'reveal' | 'notification' | 'control';
/** Open like Borders/Shadows: extra named primitives allowed. */
export type Motions = Partial<Record<MotionName | string, MotionToken>>;
export type Motion = keyof Motions;

export type BackdropName = 'scrim';
/**
 * Named backdrop primitives: the wash a top-layer surface lays over the page
 * it covers. A style expression rather than a color, because the paint and its
 * filter are one design decision — a translucent wash without its blur reads
 * as a different scrim, not a dimmer one.
 *
 * Shared so that every modal surface dims the page the same way. They used to
 * own a `backdrop` blob each, and drifted: the dialog washed the page white
 * and blurred it while the drawer dimmed it dark.
 *
 * Open like Borders/Shadows: extra named primitives allowed.
 */
export type Backdrops = Partial<Record<BackdropName | string, StyleExpression>>;
export type Backdrop = keyof Backdrops;

export interface UniTheme {
  id: string;
  name: string;

  /** Sole color source of truth. Borders and component variants derive from it. */
  colors: Colors;
  /** Numeric type scale; CSS `typefaces` are derived on read. */
  typography: Typography;

  // Token scales — flat, resolver-friendly.
  borders: Borders;
  radii: Radii;
  shadows: Shadows;
  spacing: Spacing;
  thicknesses: Thicknesses;
  icons: Icons;
  /** Shared timing for overlays and reveals; components point at a name. */
  motion: Motions;
  /** Shared scrims for modal surfaces; components point at a name. */
  backdrops: Backdrops;

  /** Per-component theming: fixed base + state-aware variants + sizes + options. */
  components: ComponentThemes;
}

export type Themes = Record<string, UniTheme>;
export type ThemeName = keyof Themes;
