/**
 * Wellsourced theme for Uni — the design language of a primary consumer
 * (apps/web in the Wellsourced repo), registered in Storybook so component
 * updates can be visually validated against a real product's look.
 *
 * Ported from the app's `app.theme.ts` attempt (colors, typography, radii,
 * shadows, borders, button/dialog/badge/symbol overrides), then extended with
 * `menu`/`menuItem` options that close the "Deltas from the old look" in
 * UNI-MENU-NOTES.md — the hand-rolled `.rowmenu` popup this theme's menus
 * replaced: 184px panel at 10px radius with the deep 0 16px 44px shadow and
 * a 6px inset, 35px items with a 7px hover pill in the neutral canvas tint,
 * red danger ink, hairline separators, and a 28px quaternary kebab. Named
 * primitives (`rowmenu` shadow, `menu` border, `menu`/`menuItem` radii, the
 * `menu` type role) carry the exact old values.
 */
import {
  BaseTheme,
  createTheme,
  HOVER_OR_KEYBOARD_FOCUS,
  type Borders,
  type Colors,
  type ComponentThemes,
  type CssLength,
  type FontWeight,
  type Radii,
  type Shadows,
  type Spacing,
  type TextStyle,
  type Thicknesses,
  type Typography,
  type UniTheme,
  type Motions,
  type Backdrops,
} from '@uni-design-system/uni-core';

export interface WellsourcedPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  warn: string;
  success: string;
  light: string;
  onLight: string;
  onLightVariant: string;
  onLightMuted: string;
  dark: string;
  onDark: string;
  background: string;
  canvas: string;
  disabled: string;
  onDisabled: string;
  /** The app's `--c-border` hairline (dividers, subtle rules). */
  border: string;
  /** The app's `--c-border-2` stronger outline (menu/panel chrome). */
  border2: string;
  /** Scrim/backdrop wash behind dialogs. */
  backdrop: string;
}

const lightPalette: WellsourcedPalette = {
  primary: '#2C3E35', // Deep forest green (heritage, natural wood)
  secondary: '#D4A373', // Warm ochre/camel (leather, textiles)
  tertiary: '#4A6B82', // Slate blue (modern metal, accents)
  quaternary: '#71717A', // Cool zinc gray (secondary accents)
  warn: '#BC4749', // Earthy brick red (low stock, errors)
  success: '#3A5F43', // Muted sage green (success states)
  light: '#FFFFFF', // Pure white (clean, minimalist base)
  onLight: '#1A1A1A', // Soft charcoal (high-contrast text)
  onLightVariant: '#1A1A1A99', // Muted text for dimensions/labels
  onLightMuted: '#71717A99', // Muted text for grouping labels
  dark: '#1A1A1A', // Deep charcoal for dark structural elements
  onDark: 'rgba(255, 255, 255, 0.85)', // Crisp light text over dark sections
  background: '#F9F9F8', // Warm alabaster (card & section backgrounds)
  canvas: '#f3f2ef', // The app's `--c-canvas` hover/section tint
  disabled: 'rgba(26, 26, 26, 0.08)', // Soft gray for inactive states
  onDisabled: 'rgba(26, 26, 26, 0.4)', // Muted gray for inactive text
  border: 'rgba(26, 26, 26, 0.08)',
  border2: 'rgba(26, 26, 26, 0.14)',
  backdrop: 'rgba(255, 255, 255, 0.6)',
};

const darkPalette: WellsourcedPalette = {
  primary: '#A3B899', // Sage green tint (highly readable on dark)
  secondary: '#E6C594', // Soft camel gold (elegant highlights)
  tertiary: '#7091A8', // Softened slate blue
  quaternary: '#A1A1AA', // Light zinc gray
  warn: '#E57373', // Pastel brick red
  success: '#81C784', // Pastel sage green
  light: '#2A2A28', // Dark charcoal-olive (elevated surfaces)
  onLight: '#F9F9F8', // Warm alabaster text over light surfaces
  onLightVariant: 'rgba(249, 249, 248, 0.6)', // Muted description text
  onLightMuted: '#A1A1AA99', // Muted text for grouping labels
  dark: '#121212', // True dark surface base
  onDark: 'rgba(255, 255, 255, 0.85)', // Primary text color
  background: '#1A1A1A', // Soft charcoal background to reduce eye strain
  canvas: '#343431', // Elevated hover tint (no dark `--c-canvas` in the app)
  disabled: 'rgba(26, 26, 26, 0.08)', // Faded contrast for disabled buttons
  onDisabled: 'rgba(255, 255, 255, 0.4)', // Faded text for disabled states
  border: 'rgba(249, 249, 248, 0.1)',
  border2: 'rgba(249, 249, 248, 0.16)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
};

const colors = (p: WellsourcedPalette, overrides: Colors = {}): Colors => ({
  ...BaseTheme.colors,

  primary: p.primary,
  'on-primary': p.onDark,

  secondary: p.secondary,
  'on-secondary': p.onDark,

  tertiary: p.tertiary,
  'on-tertiary': p.onDark,

  quaternary: p.quaternary,
  'on-quaternary': p.onDark,

  warn: p.warn,
  'on-warn': p.onDark,

  success: p.success,
  'on-success': p.onDark,

  disabled: p.disabled,
  'on-disabled': p.onDisabled,

  'primary-container': p.light,
  'on-primary-container': p.onLight,
  'on-primary-container-variant': p.onLightVariant,
  'on-primary-container-border': p.onLightVariant,

  'secondary-container': p.secondary,
  'on-secondary-container': p.onLight,
  'on-secondary-container-variant': p.onLightVariant,
  'on-secondary-container-border': '#008715',

  'tertiary-container': '#ffe2b3',
  'on-tertiary-container': '#ff7200',
  'on-tertiary-container-variant': p.onLightVariant,
  'on-tertiary-container-border': '#ff7200',

  'warn-container': '#ffc2b3',
  'on-warn-container': p.warn,
  'on-warn-container-variant': p.onLightVariant,
  'on-warn-container-border': p.warn,

  'success-container': '#b3e7c2',
  'on-success-container': p.success,
  'on-success-container-variant': p.onLightVariant,
  'on-success-container-border': p.success,

  'disabled-container': '#f2f2f2',
  'on-disabled-container': p.onLight,

  surface: p.light,
  'on-surface': p.onLight,
  'on-surface-variant': p.onLightVariant,

  'primary-surface': p.light,
  'on-primary-surface': p.onLight,
  'on-primary-surface-variant': p.onLightVariant,

  'secondary-surface': '#cce4f1',
  'on-secondary-surface': p.onLight,
  'on-secondary-surface-variant': p.primary,

  // The app's neutral canvas tint — the old row menu's hover color.
  'tertiary-surface': p.canvas,
  'on-tertiary-surface': p.onLight,
  'on-tertiary-surface-variant': p.primary,

  'quaternary-surface': '#abcde5',
  'on-quaternary-surface': p.onLight,
  'on-quaternary-surface-variant': p.primary,

  'disabled-surface': p.disabled,
  'on-disabled-surface': p.onDisabled,
  'on-disabled-surface-variant': p.onLightVariant,

  'inverse-surface': p.dark,
  'on-inverse-surface': p.onDark,
  'on-inverse-surface-variant': p.onLightVariant,

  background: p.background,
  'on-background': p.onLight,
  'on-background-variant': p.onLightVariant,

  scrim: p.backdrop,
  ghost: 'transparent',
  transparent: 'transparent',

  ...overrides,
});

/**
 * Dark counterparts of the light mapping's fixed container tints. The app's
 * `app.theme.ts` attempt defines no dark containers, so these are derived —
 * muted deep fills carrying the palette accent as the on-color. Tune to
 * taste; they exist so every container-colored component renders sensibly
 * under the dark theme.
 */
const darkContainerOverrides: Colors = {
  'secondary-container': '#4A3E2C',
  'on-secondary-container': '#E6C594',
  'tertiary-container': '#31424E',
  'on-tertiary-container': '#A8C5D8',
  'warn-container': '#4A2B29',
  'on-warn-container': '#E57373',
  'success-container': '#2C3F30',
  'on-success-container': '#81C784',
  'disabled-container': '#2E2E2C',
  'on-disabled-container': 'rgba(255, 255, 255, 0.4)',
  'secondary-surface': '#2E3A41',
  'tertiary-surface': '#343431', // canvas hover tint
  'quaternary-surface': '#3A4750',
};

// ==========================================
// Named border primitives. `menu` is the old `--c-border-2` panel outline;
// `light` lands on the old `--c-border` (1px solid rgba(26,26,26,.08)), so
// menu dividers reference it directly.
// ==========================================
const borders = (p: WellsourcedPalette): Borders => ({
  primary: `1px solid ${p.primary}`,
  secondary: `1px solid ${p.secondary}`,
  tertiary: `1px solid ${p.tertiary}`,
  quaternary: `1px solid ${p.quaternary}`,
  warn: `1px solid ${p.warn}`,
  success: `1px solid ${p.secondary}`,
  light: `1px solid ${p.border}`,
  dark: `1px solid ${p.dark}`,
  dotted: `1px dotted ${p.dark}`,
  menu: `1px solid ${p.border2}`,
  // The app's focus border — warm ochre from the palette. As the well-known
  // `focusRing` primitive it restyles the shared focus indicator everywhere:
  // text fields (via the input options below), checkboxes, radios, toggles,
  // sliders, calendar days, tag chips.
  focusRing: `1px solid ${p.secondary}`,
});

/** App radii scale plus the old row menu's exact panel/item radii. */
const radii: Radii = {
  none: 'none',
  xxs: '3px',
  xs: '5px',
  sm: '10px',
  md: '15px',
  lg: '30px',
  max: '999px',
  menu: '10px',
  menuItem: '7px',
};

/** App elevation stacks plus the old row menu's deep drop shadow. */
const shadows = (p: WellsourcedPalette): Shadows => ({
  raised: '0 2px 4px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.06)',
  card: '0 2px 4px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.06)',
  'card-hover': '0 4px 6px rgba(0, 0, 0, 0.04), 0 20px 30px rgba(0, 0, 0, 0.08)',
  menu: '0 2px 4px rgba(0, 0, 0, 0.04),  0 12px 24px rgba(0, 0, 0, 0.08)',
  dialog: '0 10px 20px rgba(0, 0, 0, 0.05),  0 30px 60px rgba(0, 0, 0, 0.12)',
  warn: '0 0 5px rgba(255, 0, 0, 0.5), inset 0 0 5px rgba(255, 0, 0, 0.3)',
  // The focus ring: a 3px spread of the ochre at 10%. Pairs with the
  // `focusRing` border primitive above (see its note).
  focusRing: `0 0 0 3px color-mix(in srgb, ${p.secondary} 10%, transparent)`,
});

/**
 * Extra thickness primitives. `focusRing` is the shared focus ring's outline
 * offset: 0 hugs the control; negative values overlay its resting border so
 * the ring reads as a border-color change; positive values add a gap.
 */
const thicknesses: Thicknesses = {};

/** Menu hover was instant in the old app CSS; a duration-0 token says so. */
const motion: Motions = {
  instant: { duration: 0, easing: 'linear' },
};

/**
 * The app's scrim: a translucent wash of the page's own ground plus a light
 * blur. Stated once, so every modal surface — dialog and drawer alike — dims
 * the page the same way. It used to live on the dialog's options alone, which
 * left the drawer inheriting the library's unrelated dark dim.
 */
const backdrops = (p: WellsourcedPalette): Backdrops => ({
  scrim: { background: p.backdrop, backdropFilter: 'blur(2px)' },
});

const spacing: Spacing = {
  none: 0,
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '22px',
  xl: '36px',
  xxl: '56px',
};

// ==========================================
// Typography — Italiana display voice over an Instrument Sans working scale,
// with Cormorant Garamond as the public pages' italic accent. Fully explicit
// (no base spread) so this table is the canonical scale the app's uni-text
// migration will port against; `hero`, `micro`, `accent` and `code` absorb
// type the app still hand-writes in CSS.
// ==========================================
const INSTRUMENT_SANS = "'Instrument Sans', sans-serif";
const ITALIANA = "'Italiana', serif";
const CORMORANT = "'Cormorant Garamond', serif";
const MONO = "'Courier New', monospace";

// Italiana ships a single 400 weight, so the weight is pinned explicitly —
// without it, headings fall back to the UA's bold and render faux-bold.
const serif = (
  fontSize: CssLength,
  lineHeight: CssLength,
  rest: Partial<TextStyle> = {}
): TextStyle => ({ fontFamily: ITALIANA, fontSize, lineHeight, fontWeight: 400, ...rest });

const sans = (
  fontSize: CssLength,
  lineHeight: CssLength,
  rest: Partial<TextStyle> = {}
): TextStyle => ({ fontFamily: INSTRUMENT_SANS, fontSize, lineHeight, ...rest });

const caps = (
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  fontWeight: FontWeight = 600
): TextStyle => ({
  fontFamily: INSTRUMENT_SANS,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textTransform: 'uppercase',
});

const typography: Typography = {
  // Italiana display ramp (lineHeight === fontSize), plus the public pages'
  // responsive hero sizes as their own tokens.
  hero: serif('clamp(46px, 5.4vw, 78px)', '1', { letterSpacing: -0.25 }),
  'hero-sm': serif('clamp(26px, 2.6vw, 34px)', '1'),
  'display-xl': serif(52, 52, { letterSpacing: -0.25 }),
  'display-large': serif(34, 34),
  'display-medium': serif(28, 28),
  'display-small': serif(22, 22),
  'display-xs': serif(18, 18),
  'headline-large': serif(24, 24, { fontWeight: 600 }),
  'headline-medium': serif(20, 28, { fontWeight: 600, letterSpacing: 0.15 }),
  'headline-small': serif(18, 24, { fontWeight: 600, letterSpacing: 0.1 }),
  overline: serif(10, 18, { letterSpacing: 1.5, textTransform: 'uppercase' }),

  // Instrument Sans working scale.
  'title-large': sans(24, 32),
  'title-medium': sans(16, 16, { fontWeight: 700 }),
  'body-1-long': sans(12, 15),
  'body-1-short': sans(12, 15),
  'body-2-long': sans(14, 18),
  'body-2-short': sans(14, 20),
  'subtitle-1': sans(12, 12, { letterSpacing: 0.15 }),
  'subtitle-2': sans(14, 20, { letterSpacing: 0.1 }),
  paragraph: sans(16, 24),
  caption: sans(10, 12, { letterSpacing: 0.4 }),
  input: sans(14, 24),
  tag: sans(15, 20, { fontWeight: 600 }),
  tab: sans(11, 11, { letterSpacing: 1.26 }),
  // The old `.rowmenu button` type: 12.5px/500 working sans.
  menu: sans(12.5, 16, { fontWeight: 500 }),
  // The label type buttons actually render — previously buried in the button
  // component `fixed` block while this role leaked base Red Hat Display.
  button: sans(14, 20, { fontWeight: 700, textTransform: 'uppercase' }),
  // KPI numerals — base metrics, de-leaked from Red Hat Display.
  stat: sans(32, 38, { fontWeight: 600, letterSpacing: -0.32 }),
  // True italics (Instrument Sans ships them; Italiana's were synthesized).
  note: sans(16, 22, { fontStyle: 'italic', fontWeight: 600 }),

  // Uppercase micro family.
  'title-small': caps(11, 12, 0.66, 700),
  eyebrow: caps(9, 9, 1.8),
  label: caps(9, 9, 1.26),
  'label-sm': caps(8, 8, 1.6, 700),
  badge: caps(9, 18, 1.26),
  // The public pages' `.micro` utility: 11px / 0.22em / 500.
  micro: caps(11, 14, 2.4, 500),

  // Cormorant Garamond — the public pages' italic accent voice. `quote` is
  // the large pull-quote (the app styles blockquotes only this way, and
  // uni-text maps blockquote → quote); `accent` is the inline `h1 em` /
  // `.assurance` idiom.
  quote: {
    fontFamily: CORMORANT,
    fontSize: 'clamp(26px, 3vw, 38px)',
    lineHeight: '1.15',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  accent: {
    fontFamily: CORMORANT,
    fontSize: 21,
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: 500,
  },
  // Inline voices at the parent's size — for accent `<em>`s inside heroes
  // (`h1 em`) and the `.serif` utility spans the public pages used.
  'accent-inline': {
    fontFamily: CORMORANT,
    fontSize: 'inherit',
    lineHeight: 'inherit',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  'serif-inline': serif('inherit', 'inherit'),

  // One mono token for the app's four ad-hoc stacks.
  code: { fontFamily: MONO, fontSize: 13, lineHeight: 20 },
};

// ==========================================
// Sparse component overrides, deep-merged over Uni defaults.
// ==========================================
const components = (p: WellsourcedPalette): ComponentThemes => ({
  badge: { options: { borderRadius: 'xxs' } },
  // The app's search-field look: fields rest on the alabaster background
  // tint and, on focus, snap to the clean surface behind an ochre border
  // with a soft 3px ring in the same hue. The default primary outline is
  // dropped in favour of the border + ring.
  input: {
    options: {
      color: 'tertiary-surface',
      focusOutline: 'none',
      focusBorder: 'focusRing',
      focusShadow: 'focusRing',
      focusColor: 'primary-surface',
    },
  },
  checkbox: {
    options: {
      size: 20,
      boxColor: 'surface',
      borderRadius: 2,
      focusRingGap: 0,
    },
  },
  // Listbox popups: the default active fill is `primary-container`, which this
  // theme maps to the same white/charcoal as `primary-surface` — an invisible
  // highlight. Re-point it at the app's canvas hover tint, the same language
  // as the menu item pills.
  combobox: { options: { activeColor: 'tertiary-surface' } },
  searchInput: { options: { activeColor: 'tertiary-surface' } },
  tagInput: { options: { activeColor: 'tertiary-surface' } },
  timeInput: { options: { activeColor: 'tertiary-surface' } },
  button: {
    fixed: {
      position: 'relative',
      overflow: 'hidden',
      outline: '0',
      border: '1px solid transparent',
      cursor: 'pointer',
      transition: 'box-shadow 0.28s ease !important',
    },
    variants: {
      ghost: {
        backgroundColor: 'transparent',
        color: p.quaternary,
        border: `1px solid rgba(26, 26, 26, 0.08) !important`,
      },
      primary: { backgroundColor: p.primary, color: p.onDark },
      secondary: { backgroundColor: p.secondary, color: p.onLight },
      tertiary: { backgroundColor: p.tertiary, color: p.onDark },
      warn: {
        backgroundColor: 'transparent',
        color: p.warn,
        border: `1px solid ${p.secondary} !important`,
      },
      disabled: { backgroundColor: `${p.disabled} !important`, color: '#fff !important' },
      success: { backgroundColor: p.success, color: p.onDark },
    },
    sizes: {
      sm: { height: 25, borderRadius: 3, fontSize: 9, padding: '0 10px', letterSpacing: '.72px' },
      md: { height: 25, borderRadius: 3, fontSize: 10, padding: '0 14px', letterSpacing: '.72px' },
      lg: { height: 32, borderRadius: 3, fontSize: 10, padding: '0 16px', letterSpacing: '1px' },
      xl: { height: 48, borderRadius: 3, fontSize: 24, padding: '0 22px' },
    },
  },
  dialog: {
    options: {
      borderRadius: 'sm',
      color: 'primary-container',
      border: 'light',
      padding: 'sm',
      elevation: 'dialog',
      // No `backdrop` override: the theme-level `scrim` primitive dresses this
      // and the drawer together.
    },
  },
  symbol: { options: { weight: 200 } },

  // ---- The old `.rowmenu` look, expressed entirely as tokens ----
  // Panel: 184px min at 10px radius, --c-border-2 outline, deep drop shadow,
  // ~6px inset (xs) so items hover as pills rather than full-bleed rows.
  menu: {
    options: {
      minWidth: 184,
      color: 'primary-surface', // #fff panel
      border: 'menu', // 1px solid rgba(26,26,26,.14) — the old --c-border-2
      borderRadius: 'menu', // 10px
      shadow: 'menu', // 0 16px 44px rgba(0,0,0,.17)
      paddingVertical: 'xs',
      paddingHorizontal: 'xs',
      dividerBorder: 'light', // 1px solid rgba(26,26,26,.08) — the old --c-border
      dividerSpacing: 'xs', // ≈ the old 5px 8px separator margins
    },
  },
  // Items: ~35px in 12.5/500 Instrument Sans, charcoal ink, 7px hover pill in the
  // neutral canvas tint, switching instantly (the old menu had no transition).
  menuItem: {
    options: {
      height: 35,
      paddingHorizontal: 'sm', // ≈ the old 11px
      gap: 'sm',
      borderRadius: 'menuItem', // 7px
      typeface: 'menu',
      textColor: 'on-surface', // --c-dark #1a1a1a
      hoverColor: 'tertiary-surface', // --c-canvas #f3f2ef
      activeSymbol: 'check',
      // The old `.rowmenu` had no hover transition at all.
      motion: 'instant',
    },
    variants: {
      // `.rowmenu button.danger`: red ink; hover keeps the neutral canvas
      // fill and the danger color stays put.
      warn: {
        color: p.warn,
        [HOVER_OR_KEYBOARD_FOCUS]: { backgroundColor: p.canvas, color: p.warn },
      },
    },
  },
  // The old `.kebab` trigger: 28px ghost square, quaternary ink darkening
  // over the canvas tint on hover.
  iconButton: {
    variants: {
      ghost: {
        backgroundColor: 'transparent',
        color: p.quaternary,
        '&:hover': { backgroundColor: p.canvas, color: p.dark },
      },
    },
    sizes: {
      sm: {
        height: 28,
        minHeight: 28,
        width: 28,
        minWidth: 28,
        fontSize: 16,
        padding: 6,
        borderRadius: '6px',
      },
    },
  },
});

// Typography is fully explicit here (no base spread), so it replaces the scale
// rather than merging over it — which `createTheme`'s deep merge would do.
// Spacing goes through `createTheme` like every other scale.
const withWellsourcedScales = (theme: UniTheme): UniTheme => ({
  ...theme,
  typography,
});

export const WellsourcedLight: UniTheme = withWellsourcedScales(
  createTheme({
    id: 'WellsourcedLight',
    name: 'Wellsourced',
    colors: colors(lightPalette),
    borders: borders(lightPalette),
    components: components(lightPalette),
    shadows: shadows(lightPalette),
    backdrops: backdrops(lightPalette),
    radii,
    thicknesses,
    spacing,
    motion,
  })
);

export const WellsourcedDark: UniTheme = withWellsourcedScales(
  createTheme({
    id: 'WellsourcedDark',
    name: 'Wellsourced (Dark)',
    colors: colors(darkPalette, darkContainerOverrides),
    borders: borders(darkPalette),
    components: components(darkPalette),
    shadows: shadows(darkPalette),
    backdrops: backdrops(darkPalette),
    radii,
    thicknesses,
    spacing,
    motion,
  })
);

/** First key wins as the default theme when registered via UNI_THEMES. */
export const WellsourcedThemes = { WellsourcedLight, WellsourcedDark };
