import type { Colors } from '../theme/theme.model';
import type { BrandRole, PaletteConfig } from '../color/color.factory';
import type { ColorCategory } from '../color/color.types';
import { contrastRatio, hexToRgb, relativeLuminance } from '../color/color.helper';
import { schemeHues } from '../color/color.utils';
import { hexToOklch, oklchToHex, type Oklch } from './oklch.helper';
import type { ContrastCheck } from './generation.types';

export interface GenerateColorsConfig extends PaletteConfig {
  /**
   * Soft brand anchors, per role: the palette starts from these exact colors
   * but the WCAG guard-rail may adjust lightness (never hue) to reach AA.
   * Contrast-safe counterpart to the hard `brand` pins, which are emitted
   * verbatim even when they fail.
   */
  targets?: Partial<Record<BrandRole, string>>;
  /** Sink for the contrast checks performed while building this palette. */
  checks?: ContrastCheck[];
}

// ── Tonal architecture ──────────────────────────────────────────────────────
// Every token maps onto one of these OKLCH lightness slots. Because OKLCH L
// is perceptually uniform, a slot renders equally light for every hue — the
// property HSL lacked, and the root fix for muddy derived palettes.
const toneMap = (dark: boolean) =>
  dark
    ? {
        accent: 0.78,
        container: 0.42,
        roleSurface: 0.26,
        background: 0.18,
        surface: 0.21,
        surfaceVariant: 0.32,
        outline: 0.66,
        onSurface: 0.93,
        mutedText: 0.76,
        inverse: 0.93,
        onInverse: 0.25,
        onDeep: 0.2,
        onLight: 0.985,
        grey: 0.72,
        disabledContainer: 0.3,
      }
    : {
        accent: 0.55,
        container: 0.9,
        roleSurface: 0.97,
        background: 0.995,
        surface: 0.985,
        surfaceVariant: 0.94,
        outline: 0.6,
        onSurface: 0.25,
        mutedText: 0.48,
        inverse: 0.3,
        onInverse: 0.97,
        onDeep: 0.24,
        onLight: 0.985,
        grey: 0.5,
        disabledContainer: 0.96,
      };

// OKLCH chroma per tonal category — the perceptual successor to the HSL
// `CategorySaturation` table. Values are accent-level chroma; container and
// surface chroma are derived fractions.
export const CategoryChroma: Record<ColorCategory, number> = {
  jewel: 0.17,
  pastel: 0.055,
  earth: 0.08,
  neutral: 0.03,
  florescent: 0.26,
  shades: 0,
};

/** Dark-mode accents cap chroma so they don't vibrate on dark surfaces. */
const DARK_ACCENT_CHROMA_CAP = 0.16;

// Semantic feedback roles in OKLCH: hue + chroma per role. Chroma differs per
// role because sRGB gamut room differs by hue at the AA-dark lightness light
// mode forces on ink tokens: red holds 0.20; amber sits at 55° (not 70° —
// dark yellow reads brown, dark orange stays lively) with 0.18; green 0.16.
const SemanticColors = {
  error: { hue: 27, chroma: 0.2 },
  warn: { hue: 55, chroma: 0.18 },
  success: { hue: 152, chroma: 0.16 },
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Generate a complete {@link Colors} token set in OKLCH. Same contract as
 * `generatePalette` (which delegates here), plus soft brand targets and a
 * contrast-check sink for {@link ContrastReport} consumers.
 */
export const generateColors = (config: GenerateColorsConfig): Colors => {
  const {
    seed,
    scheme,
    category,
    mode = 'light',
    accentSaturationFloor = 18,
    brand = {},
    targets = {},
    checks,
  } = config;
  const dark = mode === 'dark';
  const t = toneMap(dark);

  // The primary anchor (hard pin > soft target > seed) sets the neutral hue.
  const anchor = hexToOklch(brand.primary ?? targets.primary ?? seed);
  const hues = schemeHues(anchor.h, scheme);

  // Chroma model. The floor keeps the brand hue perceptible even for the
  // near-grey `neutral` category (0–100 legacy scale → OKLCH chroma).
  const chromaFloor = (accentSaturationFloor / 100) * 0.28;
  let accentC = Math.max(CategoryChroma[category], chromaFloor);
  if (dark) accentC = Math.min(accentC, DARK_ACCENT_CHROMA_CAP);
  const containerC = Math.max(CategoryChroma[category] * 0.45, accentC * 0.35);
  const surfaceC = Math.min(CategoryChroma[category], 0.012);

  const tone = (hue: number, c: number, l: number): string => oklchToHex({ l, c, h: hue });

  /**
   * The WCAG guard-rail: walk the foreground's OKLCH lightness away from the
   * background until the pair meets `target` (≤ 50 steps). Hue is never
   * touched; chroma only shrinks as a last resort when L runs out of room.
   */
  const ensureContrast = (fg: Oklch, bg: string, target: number): Oklch => {
    const out: Oklch = { ...fg };
    let hex = oklchToHex(out);
    if (contrastRatio(hex, bg) >= target) return out;
    // Pick the direction that can actually reach the target: each side has a
    // hard ceiling — black tops out at (Ybg + 0.05) / 0.05, white at
    // 1.05 / (Ybg + 0.05) — so staying on the foreground's current side is
    // only right when that side has enough headroom.
    const bgY = relativeLuminance(hexToRgb(bg));
    const darkCeiling = (bgY + 0.05) / 0.05;
    const lightCeiling = 1.05 / (bgY + 0.05);
    let lighten = relativeLuminance(hexToRgb(hex)) >= bgY;
    if (lighten && lightCeiling < target && darkCeiling >= target) lighten = false;
    if (!lighten && darkCeiling < target && lightCeiling >= target) lighten = true;
    const step = lighten ? 0.015 : -0.015;
    for (let i = 0; i < 50 && contrastRatio(hex, bg) < target; i++) {
      if ((step > 0 && out.l < 0.995) || (step < 0 && out.l > 0.02)) {
        out.l = clamp(out.l + step, 0, 1);
      } else {
        out.c = Math.max(0, out.c - 0.02);
      }
      hex = oklchToHex(out);
    }
    return out;
  };

  /** Guard-railed token: adjust toward `target` contrast, then record the pair. */
  const contrasted = (fg: Oklch, bgHex: string, target: number): string =>
    oklchToHex(ensureContrast(fg, bgHex, target));

  const record = (
    foreground: string,
    background: string,
    foregroundColor: string,
    backgroundColor: string,
    required: number
  ): void => {
    if (!checks) return;
    const ratio = contrastRatio(foregroundColor, backgroundColor);
    checks.push({
      mode,
      foreground,
      background,
      foregroundColor,
      backgroundColor,
      ratio: Math.round(ratio * 100) / 100,
      required,
      pass: ratio >= required,
      level: ratio < required ? 'fail' : ratio >= 7 ? 'AAA' : 'AA',
    });
  };

  const background = tone(anchor.h, surfaceC, t.background);
  const surface = tone(anchor.h, surfaceC, t.surface);
  const surfaceVariant = tone(anchor.h, surfaceC, t.surfaceVariant);

  // Legible foreground for a given ground: whichever of the tonal near-black /
  // near-white starts closer to AA, then guard-railed the rest of the way.
  const onColor = (hue: number, bg: string, c: number): string => {
    const deep: Oklch = { l: t.onDeep, c: Math.min(c, 0.05), h: hue };
    const light: Oklch = { l: t.onLight, c: Math.min(c, 0.02), h: hue };
    const pick =
      contrastRatio(oklchToHex(deep), bg) >= contrastRatio(oklchToHex(light), bg) ? deep : light;
    return contrasted(pick, bg, 4.5);
  };

  // Dark-mode counterpart of a *hard-pinned* brand color: lift lightness only
  // (hue and chroma preserved) until it clears 3:1 on the dark ground.
  const adaptPinForDark = (hex: string): string => {
    const pin = hexToOklch(hex);
    pin.l = Math.max(pin.l, 0.6);
    return oklchToHex(ensureContrast(pin, background, 3));
  };

  /**
   * Resolve a role's base color: hard pins are verbatim in light mode and
   * lightness-lifted in dark; soft targets and generated tones are pulled to
   * ≥ 4.5:1 as standalone ink on `background` and `surface` (§3.6).
   */
  const baseFor = (name: BrandRole, hue: number, c: number): string => {
    const pinned = brand[name];
    if (pinned) return dark ? adaptPinForDark(pinned) : pinned;
    const target = targets[name];
    let base: Oklch;
    if (target) {
      // Soft targets keep their own chroma — brand fidelity beats category.
      // Callers that want a vibe cap applied clamp the target before passing
      // it in (see `generateThemes`). Dark mode still decouples chroma.
      base = hexToOklch(target);
      if (dark) {
        base.c = Math.min(base.c, DARK_ACCENT_CHROMA_CAP);
        base.l = Math.max(base.l, t.accent - 0.08);
      }
    } else {
      base = { l: t.accent, c, h: hue };
    }
    return oklchToHex(ensureContrast(ensureContrast(base, background, 4.5), surface, 4.5));
  };

  const disabled = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const onDisabled = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';

  // An accent role's base drives its container/surface/on satellites. Every
  // content satellite passes through the guard-rail and is recorded.
  const role = (name: string, base: string, cC: number = containerC) => {
    const { h, c } = hexToOklch(base);
    const container = tone(h, cC, t.container);
    const roleSurface = tone(h, surfaceC, t.roleSurface);
    const onBase = onColor(h, base, c);
    const onContainer = onColor(h, container, c);
    const onContainerVariant = contrasted({ l: t.mutedText, c: Math.min(cC, 0.06), h }, container, 4.5);
    const border = ensureContrast(ensureContrast(hexToOklch(base), container, 3), surface, 3);
    const borderHex = oklchToHex(border);
    const onRoleSurface = onColor(h, roleSurface, surfaceC);
    const onRoleSurfaceVariant = contrasted(hexToOklch(base), roleSurface, 4.5);

    record(`on-${name}`, name, onBase, base, 4.5);
    record(`on-${name}-container`, `${name}-container`, onContainer, container, 4.5);
    record(`on-${name}-container-variant`, `${name}-container`, onContainerVariant, container, 4.5);
    record(`on-${name}-container-border`, `${name}-container`, borderHex, container, 3);
    record(`on-${name}-container-border`, 'surface', borderHex, surface, 3);
    record(`on-${name}-surface`, `${name}-surface`, onRoleSurface, roleSurface, 4.5);
    record(`on-${name}-surface-variant`, `${name}-surface`, onRoleSurfaceVariant, roleSurface, 4.5);
    record(name, 'background', base, background, 4.5);
    record(name, 'surface', base, surface, 4.5);

    return {
      [name]: base,
      [`on-${name}`]: onBase,
      [`${name}-container`]: container,
      [`on-${name}-container`]: onContainer,
      [`on-${name}-container-variant`]: onContainerVariant,
      [`on-${name}-container-border`]: borderHex,
      [`${name}-surface`]: roleSurface,
      [`on-${name}-surface`]: onRoleSurface,
      [`on-${name}-surface-variant`]: onRoleSurfaceVariant,
    };
  };

  const primaryBase = baseFor('primary', hues.primary, accentC);
  const secondaryBase = baseFor('secondary', hues.secondary, accentC);
  const tertiaryBase = baseFor('tertiary', hues.tertiary, accentC);

  // Quaternary is a neutral, near-grey accent tied to the brand hue.
  const quaternaryGrey = brand.quaternary
    ? dark
      ? adaptPinForDark(brand.quaternary)
      : brand.quaternary
    : oklchToHex(ensureContrast({ l: t.grey, c: surfaceC, h: anchor.h }, surface, 3));
  const quaternarySurface = tone(anchor.h, surfaceC, t.roleSurface);
  const onQuaternary = onColor(anchor.h, quaternaryGrey, surfaceC);
  const onQuaternarySurface = onColor(anchor.h, quaternarySurface, surfaceC);
  const onQuaternarySurfaceVariant = contrasted(hexToOklch(primaryBase), quaternarySurface, 4.5);
  const onQuaternaryContainerVariant = contrasted(
    { l: t.mutedText, c: Math.min(containerC, 0.06), h: anchor.h },
    quaternarySurface,
    4.5
  );
  record('on-quaternary', 'quaternary', onQuaternary, quaternaryGrey, 4.5);
  record('on-quaternary-surface', 'quaternary-surface', onQuaternarySurface, quaternarySurface, 4.5);
  record(
    'on-quaternary-surface-variant',
    'quaternary-surface',
    onQuaternarySurfaceVariant,
    quaternarySurface,
    4.5
  );

  // Semantic feedback roles keep colorful, recognizable hues in every category.
  const semantic = (name: 'error' | 'warn' | 'success') => {
    const { hue, chroma } = SemanticColors[name];
    const base = baseFor(name, hue, dark ? Math.min(chroma, DARK_ACCENT_CHROMA_CAP) : chroma);
    const { h } = hexToOklch(base);
    const container = tone(h, containerC + 0.04, t.container);
    const onBase = onColor(h, base, chroma);
    const onContainer = onColor(h, container, chroma);
    record(`on-${name}`, name, onBase, base, 4.5);
    record(`on-${name}-container`, `${name}-container`, onContainer, container, 4.5);
    record(name, 'background', base, background, 4.5);
    record(name, 'surface', base, surface, 4.5);
    return { base, container, onBase, onContainer, h };
  };

  const error = semantic('error');
  const warn = semantic('warn');
  const success = semantic('success');

  const semanticExtras = (name: 'warn' | 'success', s: ReturnType<typeof semantic>) => {
    const variant = contrasted({ l: t.mutedText, c: 0.06, h: s.h }, s.container, 4.5);
    const border = oklchToHex(
      ensureContrast(ensureContrast(hexToOklch(s.base), s.container, 3), surface, 3)
    );
    record(`on-${name}-container-variant`, `${name}-container`, variant, s.container, 4.5);
    record(`on-${name}-container-border`, `${name}-container`, border, s.container, 3);
    return { variant, border };
  };
  const warnExtras = semanticExtras('warn', warn);
  const successExtras = semanticExtras('success', success);

  // Neutral text tokens.
  const onBackground = tone(anchor.h, surfaceC, t.onSurface);
  const onBackgroundVariant = contrasted({ l: t.mutedText, c: surfaceC, h: anchor.h }, background, 4.5);
  const onSurface = tone(anchor.h, surfaceC, t.onSurface);
  const onSurfaceVariant = contrasted(
    { l: dark ? t.mutedText : t.mutedText - 0.14, c: surfaceC, h: anchor.h },
    surfaceVariant,
    4.5
  );
  record('on-background', 'background', onBackground, background, 4.5);
  record('on-background-variant', 'background', onBackgroundVariant, background, 4.5);
  record('on-surface', 'surface', onSurface, surface, 4.5);
  record('on-surface-variant', 'surface-variant', onSurfaceVariant, surfaceVariant, 4.5);

  // Inverse surfaces flip the ground; their accents must stay legible there.
  const inverseSurface = tone(anchor.h, surfaceC, t.inverse);
  const onInverse = tone(anchor.h, surfaceC, t.onInverse);
  const inversePrimary = contrasted(hexToOklch(primaryBase), inverseSurface, 4.5);
  record('on-inverse-surface', 'inverse-surface', onInverse, inverseSurface, 4.5);
  record('on-inverse-surface-primary', 'inverse-surface', inversePrimary, inverseSurface, 4.5);
  record('on-inverse-container', 'inverse-container', onInverse, inverseSurface, 4.5);

  const outline = oklchToHex(
    ensureContrast(
      ensureContrast({ l: t.outline, c: Math.min(surfaceC, 0.02), h: hues.primary }, surface, 3),
      background,
      3
    )
  );
  record('outline', 'surface', outline, surface, 3);
  record('outline', 'background', outline, background, 3);

  return {
    ...role('primary', primaryBase),
    ...role('secondary', secondaryBase),
    ...role('tertiary', tertiaryBase),

    quaternary: quaternaryGrey,
    'on-quaternary': onQuaternary,
    'quaternary-surface': quaternarySurface,
    'on-quaternary-surface': onQuaternarySurface,
    'on-quaternary-surface-variant': onQuaternarySurfaceVariant,
    'on-quaternary-container-variant': onQuaternaryContainerVariant,
    'on-quaternary-container-border': quaternaryGrey,

    // Semantic
    error: error.base,
    'on-error': error.onBase,
    'error-container': error.container,
    'on-error-container': error.onContainer,

    warn: warn.base,
    'on-warn': warn.onBase,
    'warn-container': warn.container,
    'on-warn-container': warn.onContainer,
    'on-warn-container-variant': warnExtras.variant,
    'on-warn-container-border': warnExtras.border,

    success: success.base,
    'on-success': success.onBase,
    'success-container': success.container,
    'on-success-container': success.onContainer,
    'on-success-container-variant': successExtras.variant,
    'on-success-container-border': successExtras.border,

    // Neutral surfaces
    background,
    'on-background': onBackground,
    'on-background-variant': onBackgroundVariant,
    surface,
    'on-surface': onSurface,
    'surface-variant': surfaceVariant,
    'on-surface-variant': onSurfaceVariant,

    // Inverse
    'inverse-surface': inverseSurface,
    'on-inverse-surface': onInverse,
    'on-inverse-surface-primary': inversePrimary,
    'on-inverse-surface-variant': inversePrimary,
    'inverse-container': inverseSurface,
    'on-inverse-container': onInverse,

    // Utility
    outline,
    shadow: '#000000',
    scrim: '#000000',
    'surface-tint': primaryBase,
    transparent: 'rgba(0,0,0,0)',
    ghost: 'rgba(0,0,0,0)',

    // Disabled (deliberate alpha overlays — excluded from the contrast report)
    disabled,
    'on-disabled': onDisabled,
    'disabled-container': tone(hues.primary, surfaceC, t.disabledContainer),
    'on-disabled-container': onDisabled,
    'disabled-surface': disabled,
    'on-disabled-surface': dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    'on-disabled-surface-variant': dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
  };
};
