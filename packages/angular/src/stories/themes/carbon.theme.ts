/**
 * Carbon theme for Uni — an experiment in retheming flexibility.
 *
 * Scaffolded by the `generate-uni-theme` MCP tool
 * (brand=#0f62fe,#393939,#161616 · vibe=neutral · shape=sharp), then
 * hand-tuned per the documented workflow ("edit the file, do not regenerate")
 * to IBM Carbon v11 token values — White theme for light, Gray 90 for dark.
 *
 * The focus component is the dialog, mirroring Carbon's modal:
 * sharp corners, gray `layer` surface, #161616@50% overlay, left-aligned
 * heading with a flush ghost close, and full-bleed 50/50 footer buttons.
 */
import {
  createTheme,
  type Borders,
  type Colors,
  type ComponentThemes,
  type Shadows,
  type Typography,
  type UniTheme,
} from '@uni-design-system/uni-core';

// ==========================================
// Colors — Carbon v11 White theme.
// Custom tokens (border-subtle, overlay, *-hover/-active) are named
// primitives the borders/components below point at.
// ==========================================
const lightColors: Colors = {
  primary: '#0f62fe', // Blue 60 — interactive / button-primary
  'on-primary': '#ffffff',
  'primary-container': '#d0e2ff',
  'on-primary-container': '#001d6c',
  'on-primary-container-variant': '#0043ce',
  'on-primary-container-border': '#0f62fe',
  'primary-surface': '#f4f4f4', // layer-01 — Carbon modal surface
  'on-primary-surface': '#161616', // text-primary
  'on-primary-surface-variant': '#525252', // text-secondary
  secondary: '#393939', // Gray 80 — button-secondary
  'on-secondary': '#ffffff',
  'secondary-container': '#e0e0e0',
  'on-secondary-container': '#161616',
  'on-secondary-container-variant': '#525252',
  'on-secondary-container-border': '#393939',
  'secondary-surface': '#ffffff',
  'on-secondary-surface': '#161616',
  'on-secondary-surface-variant': '#525252',
  tertiary: '#0043ce', // Blue 70 — link-primary-hover territory
  'on-tertiary': '#ffffff',
  'tertiary-container': '#d0e2ff',
  'on-tertiary-container': '#001d6c',
  'on-tertiary-container-variant': '#0043ce',
  'on-tertiary-container-border': '#0043ce',
  'tertiary-surface': '#edf5ff',
  'on-tertiary-surface': '#001141',
  'on-tertiary-surface-variant': '#0043ce',
  quaternary: '#8d8d8d', // border-strong
  'on-quaternary': '#ffffff',
  'quaternary-surface': '#ffffff',
  'on-quaternary-surface': '#161616',
  'on-quaternary-surface-variant': '#525252',
  'on-quaternary-container-variant': '#6f6f6f',
  'on-quaternary-container-border': '#8d8d8d',
  error: '#da1e28', // Red 60 — support-error
  'on-error': '#ffffff',
  'error-container': '#ffd7d9',
  'on-error-container': '#a2191f',
  warn: '#da1e28', // Uni's warn = Carbon's danger
  'on-warn': '#ffffff',
  'warn-container': '#ffd7d9',
  'on-warn-container': '#a2191f',
  'on-warn-container-variant': '#750e13',
  'on-warn-container-border': '#da1e28',
  success: '#24a148', // Green 50 — support-success
  'on-success': '#ffffff',
  'success-container': '#defbe6',
  'on-success-container': '#0e6027',
  'on-success-container-variant': '#044317',
  'on-success-container-border': '#24a148',
  background: '#ffffff',
  'on-background': '#161616',
  'on-background-variant': '#525252',
  surface: '#ffffff',
  'on-surface': '#161616',
  'surface-variant': '#e0e0e0',
  'on-surface-variant': '#525252',
  'inverse-surface': '#393939', // background-inverse
  'on-inverse-surface': '#ffffff',
  'on-inverse-surface-primary': '#78a9ff',
  'on-inverse-surface-variant': '#c6c6c6',
  'inverse-container': '#393939',
  'on-inverse-container': '#ffffff',
  outline: '#8d8d8d',
  shadow: '#000000',
  scrim: '#161616',
  'surface-tint': '#0f62fe',
  transparent: 'rgba(0,0,0,0)',
  ghost: 'rgba(0,0,0,0)',
  disabled: '#c6c6c6',
  'on-disabled': '#8d8d8d',
  'disabled-container': '#f4f4f4',
  'on-disabled-container': '#c6c6c6',
  'disabled-surface': '#c6c6c6',
  'on-disabled-surface': '#8d8d8d',
  'on-disabled-surface-variant': '#a8a8a8',
  // Carbon-specific primitives referenced by borders/components below.
  'border-subtle': '#e0e0e0',
  overlay: 'rgba(22, 22, 22, 0.5)',
  'primary-hover': '#0353e9',
  'primary-active': '#002d9c',
  'secondary-hover': '#4c4c4c',
  'secondary-active': '#6f6f6f',
  'danger-hover': '#b81922',
  'danger-active': '#750e13',
  'ghost-hover': '#e8e8e8',
};

// Carbon v11 Gray 90 theme.
const darkColors: Colors = {
  primary: '#0f62fe',
  'on-primary': '#ffffff',
  'primary-container': '#002d9c',
  'on-primary-container': '#d0e2ff',
  'on-primary-container-variant': '#78a9ff',
  'on-primary-container-border': '#4589ff',
  'primary-surface': '#393939', // layer-01 (g90) — modal surface
  'on-primary-surface': '#f4f4f4',
  'on-primary-surface-variant': '#c6c6c6',
  secondary: '#6f6f6f', // button-secondary (g90)
  'on-secondary': '#ffffff',
  'secondary-container': '#525252',
  'on-secondary-container': '#f4f4f4',
  'on-secondary-container-variant': '#c6c6c6',
  'on-secondary-container-border': '#8d8d8d',
  'secondary-surface': '#393939',
  'on-secondary-surface': '#f4f4f4',
  'on-secondary-surface-variant': '#c6c6c6',
  tertiary: '#78a9ff',
  'on-tertiary': '#161616',
  'tertiary-container': '#0043ce',
  'on-tertiary-container': '#d0e2ff',
  'on-tertiary-container-variant': '#a6c8ff',
  'on-tertiary-container-border': '#78a9ff',
  'tertiary-surface': '#262626',
  'on-tertiary-surface': '#d0e2ff',
  'on-tertiary-surface-variant': '#78a9ff',
  quaternary: '#8d8d8d',
  'on-quaternary': '#161616',
  'quaternary-surface': '#393939',
  'on-quaternary-surface': '#f4f4f4',
  'on-quaternary-surface-variant': '#c6c6c6',
  'on-quaternary-container-variant': '#a8a8a8',
  'on-quaternary-container-border': '#8d8d8d',
  error: '#fa4d56', // Red 50 — support-error (g90)
  'on-error': '#161616',
  'error-container': '#a2191f',
  'on-error-container': '#ffd7d9',
  warn: '#da1e28', // danger buttons keep Red 60 in dark themes
  'on-warn': '#ffffff',
  'warn-container': '#a2191f',
  'on-warn-container': '#ffd7d9',
  'on-warn-container-variant': '#ff8389',
  'on-warn-container-border': '#fa4d56',
  success: '#42be65', // Green 40 — support-success (g90)
  'on-success': '#161616',
  'success-container': '#0e6027',
  'on-success-container': '#defbe6',
  'on-success-container-variant': '#6fdc8c',
  'on-success-container-border': '#42be65',
  background: '#262626',
  'on-background': '#f4f4f4',
  'on-background-variant': '#c6c6c6',
  surface: '#262626',
  'on-surface': '#f4f4f4',
  'surface-variant': '#525252',
  'on-surface-variant': '#c6c6c6',
  'inverse-surface': '#f4f4f4',
  'on-inverse-surface': '#161616',
  'on-inverse-surface-primary': '#0f62fe',
  'on-inverse-surface-variant': '#525252',
  'inverse-container': '#f4f4f4',
  'on-inverse-container': '#161616',
  outline: '#8d8d8d',
  shadow: '#000000',
  scrim: '#161616',
  'surface-tint': '#0f62fe',
  transparent: 'rgba(0,0,0,0)',
  ghost: 'rgba(0,0,0,0)',
  disabled: '#525252',
  'on-disabled': '#8d8d8d',
  'disabled-container': '#393939',
  'on-disabled-container': '#6f6f6f',
  'disabled-surface': '#525252',
  'on-disabled-surface': '#8d8d8d',
  'on-disabled-surface-variant': '#6f6f6f',
  'border-subtle': '#525252',
  overlay: 'rgba(22, 22, 22, 0.7)',
  'primary-hover': '#0353e9',
  'primary-active': '#002d9c',
  'secondary-hover': '#606060',
  'secondary-active': '#393939',
  'danger-hover': '#b81922',
  'danger-active': '#750e13',
  'ghost-hover': '#4c4c4c',
};

// ==========================================
// Typography — IBM Plex Sans over the whole scale, with the roles the
// dialog uses pinned to Carbon's type tokens.
// ==========================================
const PLEX = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

const carbonizeTypography = (typography: Typography): Typography => ({
  ...(Object.fromEntries(
    Object.entries(typography).map(([role, style]) => [role, { ...style, fontFamily: PLEX }])
  ) as Typography),
  // heading-03 — modal title
  'title-large': { fontFamily: PLEX, fontSize: 20, lineHeight: 28, fontWeight: 400 },
  // heading-02
  'title-medium': { fontFamily: PLEX, fontSize: 16, lineHeight: 24, fontWeight: 600 },
  // heading-01
  'title-small': { fontFamily: PLEX, fontSize: 14, lineHeight: 20, fontWeight: 600 },
  // body-01 — modal body copy
  'body-2-long': { fontFamily: PLEX, fontSize: 14, lineHeight: 20, letterSpacing: 0.16 },
  'body-2-short': { fontFamily: PLEX, fontSize: 14, lineHeight: 18, letterSpacing: 0.16 },
  // body-02
  'body-1-long': { fontFamily: PLEX, fontSize: 16, lineHeight: 24 },
  'body-1-short': { fontFamily: PLEX, fontSize: 16, lineHeight: 22 },
  // label-01
  label: { fontFamily: PLEX, fontSize: 12, lineHeight: 16, letterSpacing: 0.32 },
  caption: { fontFamily: PLEX, fontSize: 12, lineHeight: 16, letterSpacing: 0.32 },
  // body-compact-01 — Carbon buttons are sentence case, never capitalized
  button: {
    fontFamily: PLEX,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 400,
    letterSpacing: 0.16,
    textTransform: undefined,
  },
  input: { fontFamily: PLEX, fontSize: 14, lineHeight: 20, letterSpacing: 0.16 },
});

// ==========================================
// Shadows — Carbon separates overlays with the scrim, not elevation;
// the modal itself casts no shadow.
// ==========================================
const carbonShadows: Shadows = {
  raised: 'none',
  menu: '0 2px 6px rgba(0, 0, 0, 0.3)',
  dialog: 'none',
  warn: 'none',
};

// ==========================================
// Named border primitives — `subtle` and `none` are new tokens the
// component options below point at.
// ==========================================
const borders = (colors: Colors): Borders => ({
  subtle: `1px solid ${colors['border-subtle']}`,
  strong: `1px solid ${colors['outline']}`,
  none: 'none',
});

/** Shape language: 'sharp' — Carbon has no rounded corners. */
const radii = {
  none: 'none',
  xxs: '0px',
  xs: '0px',
  sm: '0px',
  md: '0px',
  lg: '0px',
  max: '0px',
};

// ==========================================
// Sparse component overrides, deep-merged over Uni defaults.
// The dialog family is the focus: Carbon modal anatomy end to end.
// ==========================================
const components = (colors: Colors): ComponentThemes => ({
  dialog: {
    options: {
      borderRadius: 'none',
      color: 'primary-surface', // Carbon $layer
      border: 'none',
      padding: 'none',
      elevation: 'dialog', // resolves to 'none' above
      backdrop: { background: colors['overlay'] },
    },
  },
  dialogHeader: {
    options: {
      borderRadius: 'none',
      color: 'transparent',
      height: 64,
      paddingHorizontal: 'md',
      textRole: 'title-large', // Carbon heading-03
      textColor: 'on-primary-surface',
      textAlign: 'left',
      closeButtonIcon: 'close',
      closeButtonSize: 'lg',
    },
  },
  dialogButtons: {
    options: {
      gap: 'none',
      padding: 'none',
      paddingBottom: 'none',
      stretch: true, // full-bleed 50/50 halves
      reverseOrder: true, // cancel left, primary action right
      confirmButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
      buttonSize: 'xl',
    },
    // Carbon modal footer: 64px-tall buttons, labels pinned top-left.
    fixed: {
      '& > button': { alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14 },
    },
  },
  button: {
    options: { borderRadius: 'none', typeface: 'button' },
    // Carbon pins button labels to the left edge (UA buttons center them).
    fixed: { textAlign: 'left' },
    variants: {
      primary: {
        backgroundColor: colors.primary,
        color: colors['on-primary'],
        border: '0',
        '&:hover': { backgroundColor: colors['primary-hover'] },
        '&:active': { backgroundColor: colors['primary-active'] },
      },
      // Carbon secondary is a solid gray, not Uni's default hollow archetype.
      secondary: {
        backgroundColor: colors.secondary,
        color: colors['on-secondary'],
        border: '0',
        '&:hover': { backgroundColor: colors['secondary-hover'] },
        '&:active': { backgroundColor: colors['secondary-active'] },
      },
      warn: {
        backgroundColor: colors.warn,
        color: colors['on-warn'],
        border: '0',
        '&:hover': { backgroundColor: colors['danger-hover'] },
        '&:active': { backgroundColor: colors['danger-active'] },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.primary,
        '&:hover': { backgroundColor: colors['ghost-hover'] },
      },
    },
    // Carbon button heights (sm 32 / md 40 / lg 48 / modal-footer 64) with the
    // signature left-pinned label and generous trailing padding.
    sizes: {
      sm: { height: 32, fontSize: 14, padding: '0 60px 0 16px' },
      md: { height: 40, fontSize: 14, padding: '0 60px 0 16px' },
      lg: { height: 48, fontSize: 14, padding: '0 60px 0 16px' },
      xl: { height: 64, fontSize: 14, padding: '0 16px' },
    },
  },
  iconButton: {
    options: { borderRadius: 'none' },
    variants: {
      ghost: {
        backgroundColor: 'transparent',
        color: colors['on-primary-surface'],
        '&:hover': { backgroundColor: colors['ghost-hover'] },
      },
    },
    // 'lg' is the modal close target: Carbon's 48px square ghost button.
    // uni-icon masks to the padding box, so padding 14 yields the 20px glyph.
    sizes: {
      lg: { height: 48, minHeight: 48, width: 48, minWidth: 48, fontSize: 20, padding: 14 },
    },
  },
  input: {
    options: { borderRadius: 'none', border: 'strong' },
  },
  // Carbon v11 overflow/context menu: sharp full-bleed panel on $layer with
  // the 0 2px 6px menu shadow, no panel inset, full-bleed 1px dividers.
  menu: {
    options: {
      minWidth: 160,
      color: 'primary-surface',
      border: 'none',
      borderRadius: 'none',
      shadow: 'menu',
      paddingVertical: 'none',
      paddingHorizontal: 'none',
      dividerBorder: 'subtle',
      dividerSpacing: 'none',
    },
  },
  // 40px options in body-compact-01, $text-secondary resting, $layer-hover on
  // hover, and Carbon's productive motion (~110ms). The warn tone mirrors the
  // "danger" option: red text, solid danger fill on hover.
  menuItem: {
    options: {
      height: 40,
      typeface: 'body-2-short',
      textColor: 'on-primary-surface-variant',
      hoverColor: 'secondary-container',
      borderRadius: 'none',
      activeSymbol: 'check',
      transitionSpeed: 0.11,
    },
    variants: {
      warn: {
        color: colors.warn,
        '&:hover, &:focus': {
          backgroundColor: colors['danger-hover'],
          color: colors['on-warn'],
        },
      },
    },
  },
});

const withCarbonTypography = (theme: UniTheme): UniTheme => ({
  ...theme,
  typography: carbonizeTypography(theme.typography),
});

export const CarbonLight: UniTheme = withCarbonTypography(
  createTheme({
    id: 'CarbonLight',
    name: 'Carbon (White)',
    colors: lightColors,
    borders: borders(lightColors),
    components: components(lightColors),
    shadows: carbonShadows,
    radii,
  })
);

export const CarbonDark: UniTheme = withCarbonTypography(
  createTheme({
    id: 'CarbonDark',
    name: 'Carbon (Gray 90)',
    colors: darkColors,
    borders: borders(darkColors),
    components: components(darkColors),
    shadows: carbonShadows,
    radii,
  })
);

/** First key wins as the default theme when registered via UNI_THEMES. */
export const CarbonThemes = { CarbonLight, CarbonDark };
