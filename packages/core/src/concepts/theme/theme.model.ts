import { TextRole, TextStyle, type TypeFaceDefinition } from '../typography';
import { ColorToken } from '../color';
import { Button, ButtonType } from '../button';
import { Container, ContainerType } from '../container';
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

export type Typefaces = Partial<Record<TextRole | string, TypeFaceDefinition>>;
export type Typeface = keyof Typefaces;

export interface ThemeProps {
  themeId?: string;
  themes?: Record<string, UniTheme>;
  setTheme?: any;
}

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
  name: string;
  id: string;
  colors: Colors;
  typography: Record<TextRole, TextStyle>;
  buttons: Record<ButtonType, Button>;
  containers: Record<ContainerType, Container>;

  // Updated Model Props
  borders: Borders;
  components: ComponentThemes;
  icons: Icons;
  radii: Radii;
  shadows: Shadows;
  spacing: Spacing;
  thicknesses: Thicknesses;
  typefaces: Typefaces;
}

export type Themes = Record<string, UniTheme>;
export type ThemeName = keyof Themes;
