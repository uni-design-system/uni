import { TextRole, TextStyle, type TypeFaceDefinition } from '../typography';
import { ColorToken } from '../color';
import type { ComponentThemes } from '../component';
import type { Variant } from './theme.types';
import type { NullableSize } from '../size';
import type { Elevation } from '../elevation';

export type Colors = Partial<Record<ColorToken, string>>;
export type ColorKey = keyof Colors;
export type OptionalColor = ColorKey | undefined;

export type Spacing = Partial<Record<NullableSize, string | number>>;
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
export type Thicknesses = Record<Thickness, string | number>;

export type Icons = Record<string, string>;
export type Icon = keyof Icons;

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

  /** Per-component theming: fixed base + state-aware variants + sizes + options. */
  components: ComponentThemes;
}

export type Themes = Record<string, UniTheme>;
export type ThemeName = keyof Themes;
