import type { ComponentThemes } from '../../component';
import { generatePalette, type PaletteConfig } from '../../color';
import type { GenerateColorsConfig } from '../../generation/palette.factory';
import { generateShadows } from '../../generation/shadow.generator';
import type { TextRole, TextStyle } from '../../typography';
import type {
  Borders,
  Colors,
  Icons,
  Radii,
  Shadows,
  Spacing,
  Thicknesses,
  Typography,
  UniTheme,
} from '../theme.model';

// ==========================================
// Type scale — the single source of type truth.
// CSS-ready `typefaces` are derived from this on read (toTypefaces).
// ==========================================
const BaseTypography: Typography = {
  'display-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 57,
    lineHeight: 64,
    fontWeight: 'normal',
    letterSpacing: -0.25,
  },
  'display-medium': { fontFamily: 'Red Hat Display', fontSize: 45, lineHeight: 52, fontWeight: 'normal' },
  'display-small': { fontFamily: 'Red Hat Display', fontSize: 36, lineHeight: 44, fontWeight: 'normal' },
  'headline-large': { fontFamily: 'Red Hat Display', fontSize: 32, lineHeight: 40, fontWeight: 'normal' },
  'headline-medium': { fontFamily: 'Red Hat Display', fontSize: 28, lineHeight: 36, fontWeight: 'normal' },
  'headline-small': { fontFamily: 'Red Hat Display', fontSize: 24, lineHeight: 32, fontWeight: 'normal' },
  'title-large': { fontFamily: 'Red Hat Display', fontSize: 22, lineHeight: 28, fontWeight: 'normal' },
  'title-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'medium',
    letterSpacing: 0.15,
  },
  'title-small': {
    fontFamily: 'Red Hat Display',
    fontWeight: 'medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  'body-1-long': { fontFamily: 'Roboto', fontSize: 16, lineHeight: 22 },
  'body-1-short': { fontFamily: 'Roboto', fontSize: 16, lineHeight: 24 },
  'body-2-long': { fontFamily: 'Roboto', fontSize: 14, lineHeight: 18 },
  'body-2-short': { fontFamily: 'Roboto', fontSize: 14, lineHeight: 20 },
  'subtitle-1': { fontFamily: 'Red Hat Display', fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  'subtitle-2': {
    fontFamily: 'Red Hat Display',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'medium',
    letterSpacing: 0.1,
  },
  label: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 20 },
  button: {
    fontFamily: 'Red Hat Display',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'medium',
    textTransform: 'capitalize',
  },
  caption: { fontFamily: 'Roboto', fontSize: 12, lineHeight: 18, letterSpacing: 0.4 },
  overline: {
    fontFamily: 'Red Hat Display',
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  paragraph: { fontFamily: 'Roboto', fontSize: 16, lineHeight: 24 },
  quote: { fontFamily: 'Roboto', fontSize: 16, lineHeight: 24 },
  note: { fontFamily: 'Roboto', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  // Product-specific extras (were duplicated into `typefaces` before).
  badge: { fontFamily: 'Red Hat Display', fontSize: 16, lineHeight: 24 },
  tag: { fontFamily: 'Red Hat Display', fontSize: 15, lineHeight: 20, fontWeight: 600 },
  input: { fontFamily: 'Red Hat Display', fontSize: 14, lineHeight: 24 },
} as Record<TextRole, TextStyle> & Record<string, TextStyle>;

// ==========================================
// Shared token scales — theme-agnostic.
// ==========================================
const BaseShadows: Shadows = {
  raised:
    'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px',
  menu: 'rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;',
  dialog:
    'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
  warn: '0 0 5px rgba(255, 0, 0, 0.5), inset 0 0 5px rgba(255, 0, 0, 0.3)',
};

const BaseSpacing: Spacing = {
  none: 'none',
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '32px',
  xl: '64px',
};

const BaseThicknesses: Thicknesses = { thin: 1, standard: 2, thick: 4 };

const BaseRadii: Radii = {
  none: 'none',
  xxs: '4px',
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  max: '999px',
};

// ==========================================
// Color-derived token builders — the reason a custom theme
// only has to supply `colors`.
// ==========================================
const buildBorders = (c: Colors): Borders => ({
  primary: `1px solid ${c.primary}`,
  secondary: `1px solid ${c.secondary}`,
  tertiary: `1px solid ${c.tertiary}`,
  quaternary: `1px solid ${c.quaternary}`,
  warn: `1px solid ${c.warn}`,
  success: `1px solid ${c.success}`,
  light: `1px solid ${c.outline}`,
  dark: `1px solid ${c['on-background']}`,
  dotted: `1px dotted ${c['on-background']}`,
});

const buildComponents = (c: Colors): ComponentThemes => ({
  alert: {
    options: { topPosition: 40, borderRadius: 'sm', transitionSpeed: 0.35, elevation: 'md' },
  },
  // Initials/icon avatars color from the role's container tokens; the radius
  // token makes them circles by default and squares under a 'sharp' theme.
  avatar: {
    options: { borderRadius: 'max', typeface: 'subtitle-2', fallbackSymbol: 'person' },
    variants: {
      primary: { backgroundColor: c['primary-container'], color: c['on-primary-container'] },
      secondary: { backgroundColor: c['secondary-container'], color: c['on-secondary-container'] },
      tertiary: { backgroundColor: c['tertiary-container'], color: c['on-tertiary-container'] },
      quaternary: { backgroundColor: c['surface-variant'], color: c['on-surface-variant'] },
      warn: { backgroundColor: c['warn-container'], color: c['on-warn-container'] },
      success: { backgroundColor: c['success-container'], color: c['on-success-container'] },
    },
    sizes: {
      sm: { height: 24, width: 24, fontSize: 10 },
      md: { height: 32, width: 32, fontSize: 13 },
      lg: { height: 40, width: 40, fontSize: 16 },
      xl: { height: 56, width: 56, fontSize: 22 },
    },
  },
  // Overlap is a spacing token; the ring separates stacked avatars using the
  // surface color so groups read on any background.
  avatarGroup: { options: { overlap: 'sm', ringColor: 'surface', ringWidth: 2 } },
  checkbox: { options: { size: 20 } },
  dialog: {
    options: {
      borderRadius: 'lg',
      color: 'primary-surface',
      border: 'quaternary',
      padding: 'sm',
      elevation: 'dialog',
      backdrop: { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(2px)' },
    },
  },
  dialogHeader: {
    options: {
      borderRadius: 'max',
      color: 'primary',
      height: 48,
      textRole: 'title-large',
      textAlign: 'center',
      closeButtonIcon: 'close',
      closeButtonSize: 'md',
    },
  },
  dropdown: {
    options: { border: 'none', borderRadius: 'xxs', color: 'primary-surface', shadow: 'menu' },
  },
  footer: { options: { height: 52, color: 'primary', logoHeight: 18.6, logoPadding: 'md' } },
  input: {
    options: {
      typeFace: 'input',
      color: 'primary-surface',
      textColor: 'on-primary-surface',
      disabledColor: 'disabled-surface',
      disabledTextColor: 'on-disabled-surface',
      border: 'light',
      borderRadius: 'xs',
      errorShadow: 'warn',
      errorBorder: 'warn',
      height: 32,
      paddingLeft: 'sm',
      focusOutline: `2px solid ${c.primary}`,
      focusOutlineOffset: 2,
    },
  },
  // Field chrome (color/border/typeface/focus) comes from the shared `input`
  // options via uni-input-box; these are the textarea-specific behaviors.
  textarea: { options: { rows: 3, resize: 'vertical' } },
  // Every visual knob is a token, so a theme can turn the default underline
  // tabs into pills (borderRadius 'max' + activeColor) or restyle the
  // indicator without touching component code.
  tabs: {
    options: {
      typeface: 'title-small',
      textColor: 'on-surface-variant',
      activeTextColor: 'primary',
      indicatorColor: 'primary',
      indicatorThickness: 'standard',
      divider: 'light',
      gap: 'sm',
      borderRadius: 'none',
      padding: 'md',
      activeColor: undefined,
    },
  },
  multiSelectDropdown: {
    options: {
      textRole: 'input',
      textColor: 'on-primary-surface',
      dividerBorder: 'light',
      searchInputBorder: 'light',
      searchInputBorderRadius: 'xxs',
      focusOutline: `2px solid ${c.primary}`,
      focusOutlineOffset: 2,
    },
  },
  badge: { options: { borderRadius: 'xxs' } },

  // ---- Buttons: variants are structural archetypes with interaction states ----
  button: {
    // Radius and typeface are tokens, not baked values: `max` renders the
    // classic pill and the type scale's `button` role carries the label
    // typography, so shape languages, custom radii, and typography edits
    // restyle every button by re-pointing or redefining a token.
    options: { borderRadius: 'max', typeface: 'button' },
    fixed: {
      position: 'relative',
      overflow: 'hidden',
      outline: '0',
      border: '0',
      cursor: 'pointer',
      transition: 'all 0.28s ease',
    },
    variants: {
      ghost: {
        backgroundColor: 'transparent',
        color: 'currentcolor',
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)' },
      },
      // Solid
      primary: {
        backgroundColor: c.primary,
        color: c['on-primary'],
        border: '0',
        '&:hover': { filter: 'brightness(0.92)' },
      },
      // Hollow
      secondary: {
        backgroundColor: 'transparent',
        color: c.secondary,
        border: `1px solid ${c.secondary}`,
        '&:hover': { backgroundColor: c.secondary, color: c['on-secondary'] },
      },
      // Solid
      tertiary: {
        backgroundColor: c.tertiary,
        color: c['on-tertiary'],
        border: '0',
        '&:hover': { filter: 'brightness(0.92)' },
      },
      warn: {
        backgroundColor: c.warn,
        color: c['on-warn'],
        border: '0',
        '&:hover': { filter: 'brightness(0.92)' },
      },
      success: {
        backgroundColor: c.success,
        color: c['on-success'],
        border: '0',
        '&:hover': { filter: 'brightness(0.92)' },
      },
      disabled: {
        backgroundColor: `${c.disabled} !important`,
        color: `${c['on-disabled']} !important`,
        border: '0',
      },
    },
    // Sizes are geometry only (height/padding/fontSize); families, weights and
    // transforms come from the `typeface` option's type-scale role.
    sizes: {
      sm: { height: 22, fontSize: 12, padding: '0 12px', fontWeight: 600 },
      md: { height: 26, fontSize: 16, padding: '0 16px' },
      lg: { height: 36, fontSize: 18, padding: '0 18px' },
      xl: { height: 48, fontSize: 24, padding: '0 22px' },
    },
  },
  iconButton: {
    options: { borderRadius: 'max' },
    variants: {
      ghost: { backgroundColor: 'transparent', color: 'currentcolor' },
      primary: { backgroundColor: c.primary, color: c['on-primary'] },
      secondary: { backgroundColor: c.secondary, color: c['on-secondary'] },
      tertiary: { backgroundColor: c.tertiary, color: c['on-tertiary'] },
      warn: { backgroundColor: c.warn, color: c['on-warn'] },
      success: { backgroundColor: c.success, color: c['on-success'] },
      disabled: {
        backgroundColor: 'transparent !important',
        color: `${c['on-disabled']} !important`,
      },
    },
    sizes: {
      sm: { height: 22, minHeight: 22, width: 22, minWidth: 22, fontSize: 18 },
      md: { height: 26, minHeight: 26, width: 26, minWidth: 26, fontSize: 22 },
      lg: { height: 36, minHeight: 36, width: 36, minWidth: 36, fontSize: 30 },
      xl: { height: 40, minHeight: 40, width: 40, minWidth: 40, fontSize: 34 },
    },
  },
  progressGauge: {
    fixed: { textFill: c['on-background'] },
    // Track = the role's container token (the palette's soft tint of that
    // role), arc = the role base — so gauges follow any brand palette instead
    // of the fixed pastels they used to hardcode.
    variants: {
      primary: { backgroundColor: c['primary-container'], color: c.primary },
      secondary: { backgroundColor: c['secondary-container'], color: c.secondary },
      tertiary: { backgroundColor: c['tertiary-container'], color: c.tertiary },
      warn: { backgroundColor: c['warn-container'], color: c.warn },
      success: { backgroundColor: c['success-container'], color: c.success },
    },
    sizes: {
      sm: { height: '54px' },
      md: { height: '68px' },
      lg: { height: '82px' },
      xl: { height: '104px' },
    },
  },
  card: {
    // The frame is tokens: the border primitive named by the active variant
    // (borders.primary … borders.success — override with `border` to pin all
    // cards to one primitive, e.g. a custom 'brush-stroke'), the radii scale
    // (`xs` = the classic 8px), and an optional elevation shadow.
    options: { borderRadius: 'xs' },
    fixed: { overflow: 'hidden', backgroundColor: c.background },
  },
  cardHeader: {
    fixed: { padding: '12px 24px' },
    variants: {
      primary: { backgroundColor: c.primary, color: c['on-primary'] },
      secondary: { backgroundColor: c.secondary, color: c['on-secondary'] },
      tertiary: { backgroundColor: c.tertiary, color: c['on-tertiary'] },
      warn: { backgroundColor: c.warn, color: c['on-warn'] },
      success: { backgroundColor: c.success, color: c['on-success'] },
    },
  },
  cardContent: { fixed: { padding: '12px 24px' } },
  dataSearch: {
    options: {
      border: 'light',
      borderRadius: 'xs',
      color: 'primary-surface',
      placeholderColor: 'disabled',
    },
  },
  dataTable: {
    options: {
      color: 'primary-surface',
      border: 'light',
      borderRadius: 'sm',
      elevation: undefined,
      headerPadding: 'sm',
      footerPadding: 'sm',
      thTextRole: 'headline-small',
      thColor: 'primary-container',
      thVerticalBorder: 'dotted',
      thHorizontalBorder: 'light',
      thPadding: 'sm',
      tdTextRole: 'title-small',
      tdColor: 'primary-surface',
      tdStickyColor: 'primary-container',
      tdPadding: 'sm',
      tdVerticalBorder: 'dotted',
      tdHorizontalBorder: 'light',
      rowHoverColor: 'primary-container',
      loadingOverlayColor: 'scrim',
      loadingSpinnerColor: 'primary',
      loadingSpinnerSize: 40,
    },
  },
  notificationBadge: { options: { borderRadius: 'sm', offset: -10 } },
  paginator: {
    options: {
      gap: 'xs',
      textRole: 'label',
      inputBorder: 'light',
      inputBorderRadius: 'xs',
      pageBorderRadius: 'xs',
      currentPageBorder: 'light',
      currentPageBorderRadius: 'xs',
    },
  },
  // Loading placeholders paint with surface tokens so they sit naturally on
  // any theme; the shimmer highlight sweeps in the lighter surface color.
  skeleton: {
    options: {
      color: 'surface-variant',
      highlightColor: 'surface',
      borderRadius: 'xs',
      animation: 'shimmer',
      duration: 1.4,
      gap: 'sm',
    },
  },
  snackbar: {
    options: { bottomPosition: 40, transitionDelay: '0.35s', autoCloseDelay: 35000 },
  },
  symbol: { options: { fill: 0, weight: 400, grade: 0, opticalSize: 24 } },
  toggle: { options: { size: 20 } },
  tooltip: {
    options: {
      border: undefined,
      borderRadius: 'xs',
      shadow: 'raised',
      color: 'inverse-surface',
      typeface: 'label',
    },
  },
});

// ==========================================
// Theme factory. A custom theme = a name + a `colors` map.
// Everything color-dependent (borders, component variants) is derived;
// `borders`/`components` overrides deep-merge over the derived defaults, so a
// theme file can define its own named primitives and rewire per-component
// options without restating anything it doesn't touch.
// ==========================================
export interface ThemeConfig {
  id: string;
  name: string;
  colors: Colors;
  icons?: Icons;
  /** Override the radii scale, e.g. a generated shape-language preset. */
  radii?: Radii;
  /** Override the elevation shadows, e.g. brand-tinted generated stacks. */
  shadows?: Shadows;
  /**
   * Named border primitives, merged over the derived defaults. New tokens may
   * use any name — point component options (or `components` overrides) at
   * them and every consumer of the shared token picks up the change.
   */
  borders?: Borders;
  /**
   * Sparse per-component overrides, deep-merged over the derived component
   * themes: only the sections you provide (fixed/variants/sizes/options keys)
   * are replaced; everything else keeps tracking the library defaults.
   */
  components?: ComponentThemes;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = <T>(base: T, override: Partial<T> | undefined): T => {
  if (!override) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override)) {
    out[key] = isRecord(value) && isRecord(out[key]) ? deepMerge(out[key], value) : value;
  }
  return out as T;
};

export const createTheme = ({
  id,
  name,
  colors,
  icons = {},
  radii = BaseRadii,
  shadows = BaseShadows,
  borders,
  components,
}: ThemeConfig): UniTheme => ({
  id,
  name,
  colors,
  typography: BaseTypography,
  borders: deepMerge(buildBorders(colors), borders),
  radii,
  shadows,
  spacing: BaseSpacing,
  thicknesses: BaseThicknesses,
  icons,
  components: deepMerge(buildComponents(colors), components),
});

/**
 * Build a full {@link UniTheme} straight from a {@link PaletteConfig} — the
 * one-call path a theme builder uses to turn a brand color (or a seed +
 * scheme + category) into a complete, ready-to-apply theme.
 */
export const createThemeFromPalette = (
  config: GenerateColorsConfig & { id?: string; name?: string; icons?: Icons; radii?: Radii }
): UniTheme => {
  const colors = generatePalette(config);
  return createTheme({
    id: config.id ?? 'CustomTheme',
    name: config.name ?? 'Custom Theme',
    colors,
    radii: config.radii,
    shadows: generateShadows(colors, config.mode ?? 'light'),
    icons: config.icons,
  });
};

/**
 * Seed for the shipped Light/Dark themes. Swap these three values (or call
 * `generatePalette` with your own) to reskin the entire system — every color
 * token is derived, so there is nothing else to hand-author.
 */
export const BASE_PALETTE_CONFIG: Pick<PaletteConfig, 'seed' | 'scheme' | 'category'> = {
  seed: '#4F46E5', // indigo
  scheme: 'triadic',
  category: 'neutral',
};

export const lightColors: Colors = generatePalette({ ...BASE_PALETTE_CONFIG, mode: 'light' });

export const BaseTheme: UniTheme = createTheme({
  id: 'BaseTheme',
  name: 'Base Theme',
  colors: lightColors,
});
