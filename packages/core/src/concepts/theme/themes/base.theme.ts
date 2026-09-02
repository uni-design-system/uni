import type { ComponentThemes } from '../../component';
import { generatePalette, type PaletteConfig } from '../../color';
import type { GenerateColorsConfig } from '../../generation/palette.factory';
import { generateShadows } from '../../generation/shadow.generator';
import { BaseIcons } from '../../iconography/icon.records';
import { HOVER_OR_KEYBOARD_FOCUS } from '../../style/selectors.constants';
import type { TextRole, TextStyle } from '../../typography';
import type {
  Borders,
  Colors,
  Icons,
  Motions,
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
  'display-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 45,
    lineHeight: 52,
    fontWeight: 'normal',
  },
  'display-small': {
    fontFamily: 'Red Hat Display',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 'normal',
  },
  'headline-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'normal',
  },
  'headline-medium': {
    fontFamily: 'Red Hat Display',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 'normal',
  },
  'headline-small': {
    fontFamily: 'Red Hat Display',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'normal',
  },
  'title-large': {
    fontFamily: 'Red Hat Display',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 'normal',
  },
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
  'subtitle-1': {
    fontFamily: 'Red Hat Display',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
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
  // Stat-tile value: large, semibold, slightly tightened. Proportional
  // figures on purpose — tabular-nums is for columns, not display numbers.
  stat: {
    fontFamily: 'Red Hat Display',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 600,
    letterSpacing: -0.32,
  },
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
  // 0, not 'none': `padding: none` is invalid CSS and gets dropped, which let
  // user-agent defaults (e.g. <dialog>'s 1em padding) leak through the token.
  none: 0,
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '32px',
  xl: '64px',
  // Completes the doubling. It was in the `Size` union but absent from every
  // base theme, so `padding="xxl"` type-checked and silently rendered nothing.
  xxl: '128px',
};

const BaseThicknesses: Thicknesses = { thin: 1, standard: 2, thick: 4 };

/**
 * Shared motion timing, named by what moves rather than by how fast:
 * a small panel attached to a control snaps (`popup`), a larger free-floating
 * surface settles (`panel`), content growing in place eases at both ends
 * (`reveal`), a transient message arrives and leaves under its own steam
 * (`notification`), and a control answering a pointer should feel immediate
 * (`control`).
 *
 * Fast and linear is deliberate for `popup`. It is the timing every
 * trigger-anchored panel in the library uses — dropdown, menu, multi-select
 * and the combobox-style listboxes — so a form full of them opens uniformly;
 * at 100ms an easing curve is imperceptible anyway, and linear avoids the
 * lag a slow-in curve adds to something the user is waiting on.
 */
const BaseMotion: Motions = {
  popup: { duration: 100, easing: 'linear', scale: 0.8 },
  panel: { duration: 250, easing: 'ease' },
  // The base speed for a reveal, not its final duration: uni-expand scales
  // this by content height (see `expandDuration`) so perceived speed stays
  // even across short and tall regions.
  reveal: { duration: 350, easing: 'ease-in-out' },
  notification: { duration: 350, easing: 'ease-in-out' },
  // Feedback, not choreography: hover fills and check marks answer the
  // pointer, so this is the fastest token that still reads as a transition.
  control: { duration: 300, easing: 'ease' },
};

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

/**
 * One tag colour role across all three tones. `soft` is the resting look (the
 * container pair), `solid` fills with the role itself, `outline` keeps the
 * surface and draws the edge — so every role stays consistent and a theme can
 * still override any single cell.
 */
/**
 * Accent roles for the selection controls (checkbox, radio, toggle).
 *
 * A variant names the intent; this says which colour token draws it, and the
 * component decides where it lands — the box fill, the ring, the dot, the
 * track, the focus ring. Keeping it as a role rather than a `variants`
 * StyleExpression is what stops interior class names like `.checkbox-check`
 * becoming public theme contract.
 *
 * The same seven names `button` and `iconButton` theme, so the library is
 * consistent about which intents exist by default.
 */
const SELECTION_ACCENTS = {
  primary: { accent: 'primary' },
  secondary: { accent: 'secondary' },
  tertiary: { accent: 'tertiary' },
  warn: { accent: 'warn' },
  success: { accent: 'success' },
  disabled: { accent: 'disabled' },
  // `ghost` is transparent, so the glyph cannot take a paired on-colour from
  // it — there is no `on-ghost`. It keeps the primary on-colour instead, which
  // is what the old variant-name lookup fell back to anyway.
  ghost: { accent: 'ghost', onAccent: 'on-primary' },
} as const;

const tagVariant = (
  c: Colors,
  role: 'primary' | 'secondary' | 'tertiary' | 'warn' | 'success'
) => ({
  [role]: {
    backgroundColor: c[`${role}-container`],
    color: c[`on-${role}-container`],
    '&.tone-solid': { backgroundColor: c[role], color: c[`on-${role}`] },
    '&.tone-outline': {
      backgroundColor: 'transparent',
      color: c[role],
      borderColor: c[`on-${role}-container-border`] ?? c[role],
    },
  },
});

const buildComponents = (c: Colors): ComponentThemes => ({
  alert: {
    options: { topPosition: 40, borderRadius: 'sm', motion: 'notification', elevation: 'md' },
  },
  // Trail typography, link/current colors, separator symbol and spacing are
  // tokens; the current page reads in the stronger ink.
  breadcrumb: {
    options: {
      typeface: 'label',
      color: 'on-background-variant',
      currentColor: 'on-background',
      separatorSymbol: 'chevron_right',
      gap: 'xs',
    },
  },
  // App shell: bar surface, divider, title type and spacing are all tokens.
  appBar: {
    options: {
      color: 'surface',
      height: 56,
      divider: 'light',
      typeface: 'title-large',
      padding: 'md',
      gap: 'md',
      elevation: undefined,
    },
  },
  // Navigation drawer: shares the dialog's native-<dialog> machinery in
  // 'over' mode (elevation + scrim backdrop); 'side' mode is an in-flow
  // aside separated by the divider border primitive.
  //
  // `padding` is the *body* row's padding, not the panel's. The panel is a
  // three-row flex column whose header and footer pin while only the body
  // scrolls, so padding on the panel itself would scroll away with the
  // content and make a pinned row impossible.
  drawer: {
    options: {
      color: 'surface',
      width: 280,
      divider: 'light',
      // Overlay mode only: a side drawer is separated by `divider` instead,
      // so raising it off the page would double the separation.
      elevation: 'menu',
      padding: 'md',
      backdrop: { background: 'rgba(0, 0, 0, 0.4)' },
      scrim: true,
      background: 'solid',
    },
  },
  // Pinned header row for a drawer used as an editor panel. Left-aligned
  // rather than the dialog header's centered title: a panel headline reads as
  // a section label beside the page, where a dialog's reads as an annoucement.
  drawerHeader: {
    options: {
      color: undefined,
      height: 56,
      padding: 'md',
      textRole: 'title-medium',
      textAlign: 'left',
      divider: 'light',
      closeButtonIcon: 'close',
      closeButtonSize: 'md',
    },
  },
  // Pinned footer action row. Justified to the end and unstretched — a panel
  // save bar trails its actions, where a dialog centers them.
  drawerButtons: {
    options: {
      gap: 'sm',
      padding: 'md',
      justifyContent: 'flex-end',
      confirmButtonVariant: 'primary',
      cancelButtonVariant: 'quaternary',
      buttonSize: 'md',
      divider: 'light',
      stretch: false,
      reverseOrder: false,
    },
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
  // Search field: chrome comes from the shared `input` options via
  // uni-input-box; these tokens style the affordances and suggestion list.
  searchInput: {
    options: {
      searchSymbol: 'search',
      clearSymbol: 'close',
      listColor: 'primary-surface',
      listShadow: 'menu',
      listBorderRadius: 'xs',
      activeColor: 'primary-container',
      maxSuggestions: 8,
    },
  },
  // Selection controls: chrome colors are tokens (accent fill/ring follows the
  // component's variant; its on-color pairs are derived in the component).
  checkbox: {
    options: {
      size: 20,
      boxColor: 'surface',
      borderRadius: 2,
      focusRingGap: 2,
    },
    variantOptions: SELECTION_ACCENTS,
  },
  radio: {
    options: { size: 20, ringColor: 'outline', fillColor: 'surface', motion: 'control' },
    variantOptions: SELECTION_ACCENTS,
  },
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
  // Footer action row: every layout knob is a token so a theme can move from
  // the default centered pill pair to e.g. Carbon-style full-bleed halves
  // (stretch + reverseOrder + 'none' spacing) without touching the component.
  dialogButtons: {
    options: {
      gap: 'md',
      padding: 'md',
      paddingBottom: 'lg',
      justifyContent: 'center',
      confirmButtonVariant: 'primary',
      cancelButtonVariant: 'warn',
      buttonSize: 'lg',
      stretch: false,
      reverseOrder: false,
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
    options: {
      border: 'none',
      borderRadius: 'xxs',
      color: 'primary-surface',
      shadow: 'menu',
      motion: 'popup',
    },
  },
  // Menu panel chrome. The undefined color/border/borderRadius/shadow fall
  // back to the `dropdown` options above, so menus follow generic popovers
  // until a theme deliberately splits them. Panel padding + item borderRadius
  // together select the archetype: full-bleed rows (padding none) vs. the
  // inset "hover pill" look (padding xs + menuItem borderRadius).
  menu: {
    options: {
      minWidth: 184,
      color: undefined,
      border: undefined,
      borderRadius: undefined,
      shadow: undefined,
      paddingVertical: 'xs',
      paddingHorizontal: 'none',
      dividerBorder: 'light',
      dividerSpacing: 'xs',
    },
  },
  // Item anatomy: every density/shape/type knob is a token, and `variants`
  // carry tones — an item declares `variant: 'warn'` and the theme decides
  // what a destructive action looks like. `activeSymbol` marks the selected
  // item; set it to undefined to drop the trailing symbol entirely.
  menuItem: {
    options: {
      height: 38,
      paddingHorizontal: 'md',
      gap: 'md',
      borderRadius: 'none',
      typeface: 'label',
      textColor: undefined,
      hoverColor: 'primary-container',
      activeSymbol: 'check',
      motion: 'control',
    },
    variants: {
      // The default variant, deliberately empty: a menu item's ordinary
      // appearance is its `fixed` style, and `warn` below is the only role that
      // changes it. Present so the unthemed-variant warning stays quiet on the
      // default path — spreading `{}` contributes nothing.
      primary: {},
      warn: {
        color: c.warn,
        // Must key the highlight with the shared constant — see its doc.
        [HOVER_OR_KEYBOARD_FOCUS]: {
          backgroundColor: c['warn-container'],
          color: c['on-warn-container'],
        },
      },
    },
  },
  // Defaults reproduce the pre-theme hardcoded popover look exactly, except
  // `maxWidth` (new — long content previously never wrapped). The tooltip*
  // options apply only in `mode="tooltip"`.
  popover: {
    options: {
      color: 'primary-surface',
      border: 'quaternary',
      borderRadius: 'xs',
      shadow: 'raised',
      typeface: 'label',
      padding: '6px 12px',
      maxWidth: '38ch',
      offset: 7,
      arrowSize: 8,
      closeSymbol: 'close',
      headerTypeface: 'title-small',
      tooltipPadding: '4px 8px',
      tooltipOpenDelay: 500,
      tooltipCloseDelay: 150,
      motion: 'panel',
    },
  },
  // The `reveal` token's duration is the base speed at a 240px-tall region;
  // the actual duration scales with content height (√-of-height, clamped
  // ~0.15–0.6s at this speed — see `expandDuration`). The toggle's chevron
  // rotation shares the clock.
  expand: { options: { motion: 'reveal' } },
  footer: { options: { height: 52, color: 'primary', logoHeight: 18.6, logoPadding: 'md' } },
  input: {
    options: {
      typeface: 'input',
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
  // Numeric field. Chrome again comes from `input` via uni-input-box, so a
  // number field restyles with every other field; these are the numeric
  // specifics. `tabularNumerals` earns its place — with proportional figures a
  // held-down stepper makes the number visibly jitter as 1 and 8 swap widths,
  // and a column of prices stops lining up.
  numberInput: {
    options: {
      stepperLayout: 'stacked',
      incrementIcon: 'plus',
      decrementIcon: 'minus',
      stepUpIcon: 'chevronUp',
      stepDownIcon: 'chevronDown',
      stepperWidth: 32,
      // WCAG 2.2 SC 2.5.8 floor, honoured by the `split` and `trailing`
      // layouts. Two `stacked` arrows share the field height (16px each in a
      // 32px field) because 2 × 24 does not fit — so a coarse pointer, where
      // target size actually decides whether a tap lands, gets `split`.
      minTouchTarget: 24,
      affixColor: 'on-primary-surface-variant',
      affixGap: 'xs',
      align: 'start',
      tabularNumerals: true,
      repeatDelayMs: 500,
      repeatIntervalMs: 100,
      repeatFastIntervalMs: 25,
      repeatRampMs: 2000,
    },
  },
  // Two linked numeric fields in one chrome — price filters, thresholds,
  // tolerances. Field chrome again comes from `input` via uni-input-box; these
  // are the composer's own bits. `dividerText` is literal text rather than an
  // icon token: an en dash between two numbers is punctuation, not a glyph.
  numberRangeInput: {
    options: {
      partGap: 'sm',
      dividerText: '–',
      dividerColor: 'outline',
      // Each end carries its own adornment — the spec's `$ 50 – $ 500`.
      affixColor: 'on-primary-surface-variant',
      affixGap: 'xs',
    },
  },
  // The cart line, the table cell, the seat count: the numeric core with no
  // field chrome and no room for a label. It does need a container, so it gets
  // its own colour/border/radius rather than reaching into `input` — a cart
  // stepper and a form field are styled together by default (same token
  // values) but a theme can part them without touching every field.
  quantityStepper: {
    options: {
      // `color`, `border` and `borderRadius` are deliberately unset: the
      // container takes the shared `input` chrome, so a theme that restyles its
      // fields carries the stepper beside them. Set one only to part them.
      // `dividerColor` is deliberately unset: the rules either side of the
      // value take the `border` token above, so the frame reads as one weight
      // and follows the focus border. Set it only for a deliberately distinct
      // divider.
      incrementIcon: 'plus',
      decrementIcon: 'minus',
      // At `min` with `deleteAtMin`, the − becomes a remove affordance.
      deleteIcon: 'delete',
      tabularNumerals: true,
      // Grows with the digits, so stepping never reflows the row it sits in.
      valueWidth: '3ch',
    },
    // Outer height; the buttons are square at it. `md` (the default) and `lg`
    // clear the 24×24 pointer target of WCAG 2.2 SC 2.5.8; `sm` cannot — a
    // 24px bordered box leaves 22px inside — so it is the dense desktop
    // option and touch surfaces should stay on `md` or larger.
    sizes: {
      sm: { height: 24 },
      md: { height: 32 },
      lg: { height: 40 },
    },
  },
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

  // Chips. Two orthogonal axes: `variant` picks the colour role, `tone` picks
  // the archetype (soft fill / solid fill / outline). Tones are nested
  // `&.tone-*` selectors inside each variant so a theme author restyles both
  // axes in one place — the same trick `button` uses for `&:hover` — rather
  // than hunting for colour decisions inside `options`.
  tag: {
    options: {
      borderRadius: 'max', // 'xs' switches the whole set to rectangular labels
      typeface: 'tag',
      gap: 'xs',
      // Icon primitives, not Material ligatures: they mask `currentColor`, so
      // they recolour with the chip's tone and a theme can swap the artwork.
      removeIcon: 'close',
      selectedIcon: 'check',
    },
    fixed: {
      display: 'inline-flex',
      alignItems: 'center',
      maxWidth: '100%',
      border: '1px solid transparent',
      transition: 'background-color .2s ease, color .2s ease',
    },
    variants: {
      ...tagVariant(c, 'primary'),
      ...tagVariant(c, 'secondary'),
      ...tagVariant(c, 'tertiary'),
      ...tagVariant(c, 'warn'),
      ...tagVariant(c, 'success'),
      ghost: {
        backgroundColor: 'transparent',
        color: c['on-background'],
        '&.tone-solid': { backgroundColor: c['surface-variant'], color: c['on-surface-variant'] },
        '&.tone-outline': { backgroundColor: 'transparent', borderColor: c.outline },
      },
      disabled: {
        backgroundColor: c['disabled-container'],
        color: c['on-disabled'],
        '&.tone-solid': { backgroundColor: c.disabled, color: c['on-disabled'] },
        '&.tone-outline': { backgroundColor: 'transparent', borderColor: c.disabled },
      },
    },
    // Geometry only — family and weight come from the `typeface` option.
    sizes: {
      sm: { height: 20, fontSize: 12, padding: '0 8px' },
      md: { height: 24, fontSize: 13, padding: '0 10px' },
      lg: { height: 32, fontSize: 15, padding: '0 12px' },
    },
  },
  // Chip field. Field chrome (colour, border, radius, focus outline) is NOT
  // duplicated here — it comes from `input` via uni-input-box, so a tag input
  // restyles with every other field. These are the chip-field specifics.
  tagInput: {
    options: {
      chipGap: 'xs',
      chipSize: 'md',
      // The text input never collapses to a sliver next to wrapped chips.
      minInputWidth: '12ch',
      listColor: 'primary-surface',
      listShadow: 'menu',
      listBorderRadius: 'xs',
      activeColor: 'primary-container',
      maxSuggestions: 8,
    },
  },

  // Month grid. Selection/range/today colours are deliberately NOT options —
  // they are the `primary` role pair, so a theme restyles them by restyling
  // its palette, the same rule every other component follows.
  calendar: {
    options: {
      dayBorderRadius: 'max', // 'xxs' gives the square/GitHub-contributions look
      typeface: 'label',
      gap: 'xxs', // grid gutter
      navPrevSymbol: 'chevron_left',
      navNextSymbol: 'chevron_right',
      weekdayFormat: 'short', // Intl weekday: 'narrow' | 'short'
      showOutsideDays: false,
      todayStyle: 'outline', // 'outline' | 'dot'
    },
    fixed: {
      display: 'inline-block',
      userSelect: 'none',
    },
    // Geometry only, like tag: day cell square + font size per size token.
    sizes: {
      sm: { width: 28, height: 28, fontSize: 12 },
      md: { width: 34, height: 34, fontSize: 13 },
      lg: { width: 40, height: 40, fontSize: 15 },
    },
  },
  // Closed-set single-select autocomplete. Field chrome comes from `input` via
  // uni-input-box; `maxVisibleOptions` is a scroll height — the list scrolls
  // past it, never truncates (contrast searchInput's `maxSuggestions`).
  combobox: {
    options: {
      // Icon primitives (BaseIcons names), rendered by uni-icon — not
      // Material Symbol ligatures. Themes re-point or register their own
      // through createTheme({ icons }).
      toggleIcon: 'chevronDown',
      clearIcon: 'close',
      selectedIcon: 'check',
      listColor: 'primary-surface',
      listShadow: 'menu',
      listBorderRadius: 'xs',
      activeColor: 'primary-container',
      maxVisibleOptions: 8,
      descriptionColor: 'on-primary-surface-variant',
    },
  },
  // Date field. Field chrome comes from `input` via uni-input-box; these
  // style the popup-calendar affordance and panel only.
  dateInput: {
    options: {
      toggleSymbol: 'calendar_month',
      popupShadow: 'menu',
      popupBorderRadius: 'xs',
      popupColor: 'primary-surface',
    },
  },
  // Time field. Same listbox trio as tagInput/searchInput.
  timeInput: {
    options: {
      toggleSymbol: 'schedule',
      listColor: 'primary-surface',
      listShadow: 'menu',
      listBorderRadius: 'xs',
      activeColor: 'primary-container',
      maxVisibleOptions: 7,
    },
  },
  // Composer seating a date + time part in one field chrome.
  dateTimeInput: {
    options: { partGap: 'sm', dividerColor: 'outline' },
  },

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
    // The keyboard-focus ring's colour per intent. It is named here rather than
    // derived from the fill because the ring is drawn *outside* the button, so
    // it has to read against the page, not against the variant.
    //
    // Each entry below reproduces the colour the ring already had, back when it
    // was resolved from the variant's name. `ghost` is the exception and the
    // fix: its token is `transparent`, so its ring was invisible.
    variantOptions: {
      primary: { focusColor: 'primary' },
      secondary: { focusColor: 'secondary' },
      tertiary: { focusColor: 'tertiary' },
      warn: { focusColor: 'warn' },
      success: { focusColor: 'success' },
      disabled: { focusColor: 'disabled' },
      ghost: { focusColor: 'primary' },
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
    // Hover belongs to the variant, next to the colours it goes with. A filled
    // icon button lifts; the hollow one washes, because a shadow under a
    // transparent surface reads as a floating square. This used to be a
    // `variant === 'ghost'` branch inside the component, which meant no theme
    // could restyle either treatment and every consumer-registered intent was
    // classed with the filled ones by default.
    variants: {
      ghost: {
        backgroundColor: 'transparent',
        color: 'currentcolor',
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
      },
      primary: {
        backgroundColor: c.primary,
        color: c['on-primary'],
        '&:hover': { boxShadow: BaseShadows.raised },
      },
      secondary: {
        backgroundColor: c.secondary,
        color: c['on-secondary'],
        '&:hover': { boxShadow: BaseShadows.raised },
      },
      tertiary: {
        backgroundColor: c.tertiary,
        color: c['on-tertiary'],
        '&:hover': { boxShadow: BaseShadows.raised },
      },
      warn: {
        backgroundColor: c.warn,
        color: c['on-warn'],
        '&:hover': { boxShadow: BaseShadows.raised },
      },
      success: {
        backgroundColor: c.success,
        color: c['on-success'],
        '&:hover': { boxShadow: BaseShadows.raised },
      },
      // Deliberately no hover: this block is also spread into `&:disabled`, so
      // a hover here would give a disabled control a lift on pointer-over.
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
  // KPI tile: card-recipe frame, muted label over a large `stat`-role value;
  // delta inks are the semantic success/error (direction × goodness decided
  // by the component); sparkline in the outline hue, endpoint in the accent.
  stat: {
    options: {
      labelTypeface: 'label',
      valueTypeface: 'stat',
      color: 'surface',
      border: 'light',
      borderRadius: 'xs',
      positiveColor: 'success',
      negativeColor: 'error',
      trendColor: 'outline',
      trendAccent: 'primary',
      padding: 'md',
      gap: 'xxs',
    },
  },
  // Bounded numeric input. Fill and thumb colour are deliberately NOT options
  // — they are the `variant` role pair, the rule every other component
  // follows, so `variant="warn"` recolours a slider with no theme edit. The
  // track is a groove rather than an accent, so it stays a token. Geometry
  // knobs are plain px.
  slider: {
    options: {
      trackHeight: 4,
      trackColor: 'primary-container',
      borderRadius: 'max',
      thumbSize: 16,
      thumbBorderRadius: 'max',
      // WCAG 2.2 SC 2.5.8 floor. The visual dot stays `thumbSize`; the
      // transparent hit area around it grows to this.
      minTouchTarget: 24,
      markSize: 3,
      markColor: 'on-primary-container',
      labelTypeface: 'label',
      labelColor: 'on-surface-variant',
      tooltipColor: 'inverse-surface',
      tooltipTextColor: 'on-inverse-surface',
      tooltipShadow: 'menu',
      tooltipBorderRadius: 'xs',
      // Click-to-jump and keyboard only; a transition on a dragged thumb
      // reads as lag, so drag is deliberately unanimated.
      transitionMs: 120,
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
      direction: 'ltr',
      highlightWidth: 40,
      gap: 'sm',
    },
  },
  snackbar: {
    options: { bottomPosition: 40, motion: 'notification', autoCloseDelay: 35000 },
  },
  symbol: { options: { fill: 0, weight: 400, grade: 0, opticalSize: 24 } },
  // Switch geometry, like tag and calendar, is enumerated per size token rather
  // than derived from one number — the track and knob proportions of a real
  // switch design are not a constant ratio across sizes.
  //
  // `padding` is the knob's inset, and everything else falls out of the three:
  // knob = height - 2 * padding, travel = width - height, radius = height / 2.
  // `lg` is BaseComponent's default size and reproduces the pre-`sizes`
  // geometry exactly (knob 16, travel 20), so no existing toggle moves.
  toggle: {
    options: { trackColor: 'surface-variant', knobColor: 'surface', motion: 'control' },
    variantOptions: SELECTION_ACCENTS,
    sizes: {
      sm: { width: 28, height: 16, padding: 3 },
      md: { width: 32, height: 18, padding: 3 },
      lg: { width: 40, height: 20, padding: 2 },
    },
  },
  tooltip: {
    options: {
      border: undefined,
      borderRadius: 'xs',
      shadow: 'raised',
      color: 'inverse-surface',
      typeface: 'label',
    },
  },
  // The spotlight ring color is deliberately not an option — it is the
  // callout's `variant` role. `scrimColor` is scheme-invariant, like
  // `::backdrop`.
  callout: {
    options: {
      color: 'primary-surface',
      borderRadius: 'xs',
      shadow: 'menu',
      width: '320px',
      padding: '16px',
      headerTypeface: 'title-small',
      typeface: 'label',
      closeSymbol: 'close',
      arrowSize: 8,
      offset: 12,
      scrimColor: 'rgba(0, 0, 0, 0.45)',
      spotlightPadding: 6,
      spotlightRadius: 'xs',
      ringWidth: 2,
      motion: 'panel',
    },
  },
  // Panel chrome, scrim and spotlight all come from the `callout` entry; the
  // tour deliberately has almost no skin of its own.
  tour: {
    options: {
      progressStyle: 'dots',
      footerGap: 'sm',
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
  /**
   * Named icon primitives (inline SVG data URIs, masked with `currentColor`),
   * merged over {@link BaseIcons}. Add or override under any name; components
   * render them by token via the icon component, never by inlining SVG.
   */
  icons?: Icons;
  /** Override the radii scale, e.g. a generated shape-language preset. */
  radii?: Radii;
  /** Override the elevation shadows, e.g. brand-tinted generated stacks. */
  shadows?: Shadows;
  /**
   * Named motion primitives, merged over {@link BaseMotion}. Retime every
   * overlay at once by restating a token — components point at these by name
   * rather than carrying their own durations.
   */
  motion?: Motions;
  /**
   * Sparse typography overrides, deep-merged over the base type scale:
   * restate only the roles — or the individual {@link TextStyle} fields
   * within a role — that change, and add product-specific roles under any
   * name. Untouched roles keep tracking the library defaults.
   */
  typography?: Record<TextRole | string, Partial<TextStyle>>;
  /**
   * Named border primitives, merged over the derived defaults. New tokens may
   * use any name — point component options (or `components` overrides) at
   * them and every consumer of the shared token picks up the change.
   */
  borders?: Borders;
  /**
   * Named thickness primitives, merged over the base scale (`thin`/`standard`/
   * `thick` stay unless restated). Extra tokens may use any name — e.g. a
   * `focusRing` thickness sets the shared focus ring's outline offset.
   */
  thicknesses?: Thicknesses;
  /**
   * Spacing steps, merged over the base scale (the named steps stay unless
   * restated). Extra tokens may use any name — `{ tight: '6px' }` is then a
   * valid `padding` / `gap` value everywhere — so an app's real rhythm does
   * not have to be forced onto a doubling scale.
   */
  spacing?: Spacing;
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
  motion,
  typography,
  borders,
  thicknesses,
  spacing,
  components,
}: ThemeConfig): UniTheme => ({
  id,
  name,
  colors,
  typography: deepMerge(BaseTypography, typography as Partial<Typography> | undefined),
  borders: deepMerge(buildBorders(colors), borders),
  radii,
  shadows,
  spacing: { ...BaseSpacing, ...spacing },
  motion: { ...BaseMotion, ...motion },
  thicknesses: { ...BaseThicknesses, ...thicknesses },
  icons: { ...BaseIcons, ...icons },
  components: deepMerge(buildComponents(colors), components),
});

/**
 * Re-attach the built-in icon set to a theme that traveled without it.
 *
 * A serialized theme is ~50 KB, ~71% of which is {@link BaseIcons} — bytes
 * every uni-core consumer already ships. Transports (MCP tool results, theme
 * JSON over HTTP) send the {@link dehydrateTheme} form and the receiver
 * hydrates, applying exactly the `{...BaseIcons, ...icons}` contract
 * {@link createTheme} applies at construction: the theme's own icons win,
 * built-ins fill the rest.
 */
export const hydrateTheme = (theme: UniTheme): UniTheme => ({
  ...theme,
  icons: { ...BaseIcons, ...theme.icons },
});

/**
 * The wire form of a theme: icons identical to the built-in set are dropped,
 * so only genuine overrides travel. Reverse with {@link hydrateTheme}.
 */
export const dehydrateTheme = (theme: UniTheme): UniTheme => ({
  ...theme,
  icons: Object.fromEntries(
    Object.entries(theme.icons).filter(([name, uri]) => BaseIcons[name as never] !== uri)
  ),
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
