// noinspection JSUnusedGlobalSymbols

import { computed, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';
import { css, injectGlobal } from '@emotion/css';
import { LocalStorageService, Options } from '../cdk';
import {
  LightTheme,
  type NullableSize,
  type ThemeName,
  type Typeface,
  type UniTheme,
  Z_INDEX,
  type ZIndexableElements,
  ColorToken,
  ComponentName,
  ComponentTheme,
  ContainerColorToken,
  ContentColorToken,
  NullableStyleExpression,
  OptionalSize,
  Size,
  TextRole,
  Thickness,
  Variant,
  toTypefaces,
  createThemeFromPalette,
  type GenerateColorsConfig,
  type PaletteConfig,
  type Radii,
  type ColorKey,
  type Radius,
  type Border,
  type Shadow,
  type Motion,
  type MotionToken,
  type Backdrop,
  type StyleExpression,
} from '@uni-design-system/uni-core';

import {
  formatThemeIssues,
  hydrateTheme,
  parseTheme,
  type Themes,
  type ThemeParseResult,
} from '@uni-design-system/uni-core';

import { UNI_THEMES } from './theme.token';
import { safeParseInt } from '../cdk/helpers/number.helper';

declare const ngDevMode: boolean | undefined;

/**
 * The editable shape a theme builder manipulates: a seed + scheme + category
 * (plus optional saturation floor, brand colors, and light/dark mode).
 * Everything else in a theme is derived from this. Brand colors come in two
 * strengths: `brand` pins are emitted verbatim (may fail contrast), `targets`
 * are brand-faithful but the WCAG guard-rail may adjust their lightness.
 */
export type BrandPaletteConfig = Required<Pick<PaletteConfig, 'seed' | 'scheme' | 'category'>> &
  Pick<GenerateColorsConfig, 'mode' | 'accentSaturationFloor' | 'brand' | 'targets'> & {
    /** Radii override (e.g. a `ShapeRadii` shape-language preset). */
    radii?: Radii;
  };

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** localStorage key marking the custom brand theme as active. */
  static readonly CUSTOM_KEY = 'CustomTheme';
  /** localStorage key holding the serialized brand palette config. */
  static readonly PALETTE_KEY = 'uni-custom-palette';

  private localStorage = inject(LocalStorageService);

  /**
   * The live theme registry: the injected {@link UNI_THEMES} map (validated
   * at construction) plus anything added via {@link registerTheme} — including
   * the custom brand theme, which registers under {@link CUSTOM_KEY} so it is
   * an ordinary, selectable entry.
   */
  private readonly registry = signal<Themes>({});

  private readonly _theme = signal<UniTheme>(LightTheme);
  /** The active theme. Write via {@link setTheme}/{@link selectTheme} — every write is validated. */
  readonly theme = this._theme.asReadonly();

  /** Selectable themes, derived from the registry — reactive to registration. */
  readonly themeOptions = computed<Options<ThemeName>>(() =>
    Object.entries(this.registry()).map(([value, theme]) => ({ label: theme.name, value }))
  );

  components = computed(() => this.theme().components);
  component = <T, V = object>(componentName: ComponentName): Signal<ComponentTheme<T, V>> =>
    computed(() => (this.components()[componentName] as ComponentTheme<T, V>) || {});
  colors = computed(() => this.theme().colors);
  // CSS-ready typefaces are derived from the theme's numeric type scale,
  // never stored twice on the theme.
  typeFaces = computed(() => toTypefaces(this.theme().typography));
  spacing = computed(() => this.theme().spacing);
  thicknesses = computed(() => this.theme().thicknesses);
  radii = computed(() => this.theme().radii);
  borders = computed(() => this.theme().borders);
  shadows = computed(() => this.theme().shadows);
  icons = computed(() => this.theme().icons);
  // `?? {}` for themes registered as JSON that predate the motion scale —
  // the validator does not require it, so they must not crash on read.
  motions = computed(() => this.theme().motion ?? {});
  /** Same story as `motions`: a JSON theme may predate the backdrops scale. */
  backdrops = computed(() => this.theme().backdrops ?? {});

  constructor() {
    // Honor the user's reduced-motion preference across every component
    // (WCAG 2.3.3): collapse all animations/transitions to a single frame.
    injectGlobal`
      @media (prefers-reduced-motion: reduce) {
        /* ::backdrop is not a descendant of anything, so the universal
           selector alone never reaches the scrim a <dialog> fades in. */
        *, *::before, *::after, *::backdrop {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;

    // Seed the registry from the injected map, excluding (with reasons) any
    // theme that fails the structural contract — a malformed theme would
    // otherwise render as silent `undefined` CSS.
    const injected = inject(UNI_THEMES);
    const registry: Themes = {};
    for (const [key, candidate] of Object.entries(injected)) {
      const result = parseTheme(candidate);
      if (result.success) {
        registry[key] = result.theme;
      } else {
        console.warn(`Uni theme '${key}' rejected: ${formatThemeIssues(result.issues)}`);
      }
    }
    this.registry.set(registry);

    // Rehydrate a custom brand theme if one is active — this is what lets a
    // palette built in one story reskin every other story: each story spins up
    // a fresh ThemeService, and it reads the persisted config here on init.
    const savedTheme = this.localStorage.getItem<string>('theme');
    const savedPalette = this.localStorage.getItem<BrandPaletteConfig>(ThemeService.PALETTE_KEY);
    if (savedTheme === ThemeService.CUSTOM_KEY && savedPalette) {
      this.applyPalette(savedPalette, false);
    } else {
      this.selectTheme(savedTheme || Object.keys(registry)[0] || 'base');
    }
  }

  /**
   * Activate a registered theme. Returns false — touching nothing, persisting
   * nothing — when the name is unknown (previously this silently kept the old
   * theme while still recording the bad key).
   */
  public selectTheme(themeName: ThemeName): boolean {
    const theme = this.registry()[themeName];
    if (!theme) return false;

    // Registered themes were validated at registration; set directly.
    this._theme.set(theme);
    this.selectedThemeKey.set(themeName);
    this.localStorage.setItem('theme', themeName);
    return true;
  }

  /**
   * Validate and activate a theme without registering it. The result carries
   * acceptance or the complete list of rejection reasons; on rejection the
   * active theme is unchanged.
   */
  public setTheme(input: unknown): ThemeParseResult {
    const result = this.accept(input);
    if (result.success) {
      this._theme.set(result.theme);
      this.selectedThemeKey.set(result.theme.id);
    }
    return result;
  }

  /**
   * Validate and add a theme to the registry (keyed by its `id`), making it
   * selectable and listed in {@link themeOptions}. On rejection the registry
   * is unchanged and the result lists every reason.
   */
  public registerTheme(input: unknown, opts?: { select?: boolean }): ThemeParseResult {
    const result = this.accept(input);
    if (result.success) {
      const theme = result.theme;
      this.registry.update((themes) => ({ ...themes, [theme.id]: theme }));
      if (opts?.select) this.selectTheme(theme.id);
    }
    return result;
  }

  /**
   * The gate every externally-supplied theme passes: validate, then restore
   * any built-in icons the payload left out. Themes that travel as JSON (the
   * MCP theme tools, a theme registry) omit the built-in icon set — it is
   * ~71% of the bytes and every consumer already ships it — so hydration
   * applies the same `{...BaseIcons, ...icons}` contract `createTheme` uses:
   * the theme's own icons win, built-ins fill the rest.
   */
  private accept(input: unknown): ThemeParseResult {
    const result = parseTheme(input);
    return result.success ? { ...result, theme: hydrateTheme(result.theme) } : result;
  }

  /** Remove a registered theme; falls back to the first remaining theme if it was active. */
  public unregisterTheme(id: string): void {
    if (!(id in this.registry())) return;
    this.registry.update((themes) => {
      const { [id]: _removed, ...rest } = themes;
      return rest;
    });
    if (this.selectedThemeKey() === id) {
      this.selectTheme(Object.keys(this.registry())[0] || 'base');
    }
  }

  /** The live brand palette config, when a custom theme is active. */
  public customPalette = signal<BrandPaletteConfig | null>(null);
  public isCustomTheme = computed(() => this.selectedThemeKey() === ThemeService.CUSTOM_KEY);

  /**
   * Generate a full theme from a brand palette config and make it active. When
   * `persist` is true the config is saved so every subsequent story (and
   * reload) renders with the same brand.
   */
  public applyPalette(config: BrandPaletteConfig, persist = true): void {
    this.customPalette.set(config);
    // Registering (rather than only setting) makes 'Your Brand' an ordinary
    // registry entry: it appears in themeOptions/uni-theme-switch and can be
    // switched away from and back to.
    const result = this.registerTheme(
      createThemeFromPalette({ ...config, id: ThemeService.CUSTOM_KEY, name: 'Your Brand' })
    );
    if (!result.success) return;

    this._theme.set(result.theme);
    this.selectedThemeKey.set(ThemeService.CUSTOM_KEY);
    if (persist) {
      this.localStorage.setItem(ThemeService.PALETTE_KEY, config);
      this.localStorage.setItem('theme', ThemeService.CUSTOM_KEY);
    }
  }

  /** Drop the custom brand theme and fall back to the first registered theme. */
  public clearCustomPalette(): void {
    this.customPalette.set(null);
    this.localStorage.removeItem(ThemeService.PALETTE_KEY);
    this.unregisterTheme(ThemeService.CUSTOM_KEY);
  }

  public selectedThemeName = computed(() => this.theme().name);
  public selectedThemeKey = signal<string>('');

  textClass = (textRole: TextRole, textColor?: ContentColorToken) => {
    return css([
      {
        ...this.typeFaces()[textRole],
      },
      textColor && {
        color: this.colors()[textColor],
      },
    ]);
  };

  componentStyle = (componentName: ComponentName, variant: Variant, size: Size) =>
    computed(() => {
      const component = this.component(componentName)();
      const { fixed, variants, sizes } = component;
      this.warnUnthemedVariant(componentName, variant, component);
      const variantStyle = variants && variants[variant];
      const sizeStyle = sizes && sizes[size];
      return { ...fixed, ...variantStyle, ...sizeStyle };
    });

  /**
   * The active variant's roles from a component's `variantOptions` map — the
   * per-variant data a component *reads* rather than CSS it applies. See
   * `ComponentTheme.variantOptions`.
   */
  variantRoles = <V>(componentName: ComponentName, variant: Variant): Signal<V | undefined> =>
    computed(() => {
      const component = this.component<unknown, V>(componentName)();
      this.warnUnthemedVariant(componentName, variant, component);
      return component.variantOptions?.[variant];
    });

  private readonly warnedVariants = new Set<string>();

  /**
   * Say something when a component is asked for a variant its theme does not
   * define, once per component/variant pair.
   *
   * `Variant` is an open registry, so a name the theme never styled cannot be a
   * compile error — and the miss is silent by construction, because an absent
   * style spreads to nothing and an absent role falls back. That is exactly the
   * ordinary state of a work in progress: a designer registers `destructive`,
   * uses it, and has not written its theme block yet. Same reasoning as
   * {@link resolveSpacing}, whose open scale has the same problem.
   *
   * A component that themes no variants at all is not missing anything — most
   * of the library never varies by intent — so silence there is correct.
   */
  private warnUnthemedVariant(
    componentName: ComponentName,
    variant: Variant,
    component: ComponentTheme<unknown, unknown>
  ): void {
    const { variants, variantOptions } = component;
    if (!variants && !variantOptions) return;
    if (variants?.[variant] !== undefined || variantOptions?.[variant] !== undefined) return;

    const key = `${componentName}/${variant}`;
    if (!(typeof ngDevMode === 'undefined' || ngDevMode) || this.warnedVariants.has(key)) return;
    this.warnedVariants.add(key);

    const defined = [
      ...new Set([...Object.keys(variants ?? {}), ...Object.keys(variantOptions ?? {})]),
    ];
    console.warn(
      `[uni] Unknown variant "${variant}" on "${componentName}": the active theme does not ` +
        `define it, so the component falls back to its default appearance. Add it to the ` +
        `theme's \`components.${componentName}\` entry, or use one of: ${defined.join(', ')}.`
    );
  }

  /**
   * Resolve a spacing token to its CSS value. `'none'` resolves through the
   * scale like any other token — it is `0`, not the string `'none'`, which is
   * not a valid length and was silently dropped wherever it landed.
   */
  getSpacing = (size: NullableSize) => this.resolveSpacing(size);

  private readonly warnedSpacing = new Set<string>();

  /**
   * Resolve a spacing token against the active theme.
   *
   * The scale is open — a theme may name steps beyond `xxs`…`xxl` — so a
   * mistyped token cannot be a compile error. It would otherwise vanish
   * silently, since an `undefined` CSS value is simply dropped, so say so once
   * per token in dev.
   */
  private resolveSpacing(size: NullableSize): string | number | undefined {
    const value = this.spacing()[size];
    if (
      value === undefined &&
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
      !this.warnedSpacing.has(size)
    ) {
      this.warnedSpacing.add(size);
      console.warn(
        `[uni] Unknown spacing token "${size}": the active theme does not define it, ` +
          `so the declaration is dropped. Add it to the theme's \`spacing\` map, or use ` +
          `one of: ${Object.keys(this.spacing()).join(', ')}.`
      );
    }
    return value;
  }

  getThickness = (thickness: Thickness) => this.theme().thicknesses[thickness];

  getContentColor = (token: ContainerColorToken, useVariant?: boolean) =>
    useVariant
      ? this.colors()[`on-${token}-variant` as ColorToken]
      : this.colors()[`on-${token}` as ColorToken];

  colorPair = (token?: ContainerColorToken, colorVariant?: boolean): NullableStyleExpression => {
    if (!token) return;
    const backgroundColor = this.colors()[token];
    const color = this.getContentColor(token, colorVariant);
    return { color, backgroundColor };
  };

  backgroundColor = (token?: ColorKey): NullableStyleExpression => {
    return !token ? undefined : { backgroundColor: this.colors()[token] };
  };

  backgroundImage = (url?: string): NullableStyleExpression => {
    return !url ? undefined : { backgroundImage: `url(${url})` };
  };

  getContainerColors = (color: Variant, useVariant?: boolean) => {
    const token = (color + '-container') as ContainerColorToken;
    return this.colorPair(token, useVariant);
  };

  /**
   * The shared keyboard-focus indicator's styles (WCAG 2.4.7), without a
   * selector — for controls that key the ring off their own state selector
   * (`&:focus + .checkbox`). Everything else spreads `focusRing()` instead.
   *
   * Themable: a theme that defines `focusRing` **border** and/or **shadow**
   * primitives replaces the default 2px outline with that border (drawn as
   * an outline hugging the control) plus the ring shadow — one focus
   * language for every control, from text fields to checkboxes to calendar
   * days. A `focusRing` **thickness** primitive sets the outline offset
   * (default 0 when themed, 2px for the classic outline; negative values
   * overlay the control's own border, reading as a border-color change).
   * Without those primitives the classic outline renders, in the given
   * color or `currentColor`.
   */
  focusRingStyle = (color?: string, gap?: string | number) => {
    const border = this.borders()['focusRing'];
    const shadow = this.shadows()['focusRing'];
    // An explicit per-call gap wins; else the theme's `focusRing` thickness
    // primitive; else the branch default (hugging when themed, classic 2px).
    const offset = gap ?? this.thicknesses()['focusRing'];
    if (border || shadow) {
      return {
        outline: border ?? 'none',
        outlineOffset: offset ?? 0,
        ...(shadow ? { boxShadow: shadow } : {}),
      };
    }
    return { outline: `2px solid ${color ?? 'currentColor'}`, outlineOffset: offset ?? '2px' };
  };

  /**
   * Shared keyboard-focus indicator (WCAG 2.4.7). Spread into a component's
   * Emotion styles: `...this.theme.focusRing()` or `focusRing('primary')`.
   * See `focusRingStyle` for how themes restyle it.
   */
  focusRing = (token?: ColorToken) => ({
    '&:focus-visible': this.focusRingStyle(token ? this.colors()[token] : undefined),
  });

  typeface = (typeface?: Typeface) => {
    const typefaces = this.typeFaces();
    return typeface && typefaces[typeface];
  };

  colorPalette = () => this.colors();

  color(color?: ColorKey): NullableStyleExpression {
    return !color ? undefined : { color: this.colors()[color] };
  }

  getDashedBorder(
    color: ColorKey | undefined,
    radius: Radius | undefined
  ): NullableStyleExpression {
    if (!color) return;

    const r = radius && this.radii()[radius];
    const borderRadius = r ? safeParseInt(r) : 0;
    const colors = this.colors()[color];
    const strokeColor = colors?.replace('#', '%23');

    return {
      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${borderRadius}' ry='${borderRadius}' stroke='${strokeColor}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
      borderRadius,
    };
  }

  /**
   * Resolves a named motion primitive. Falls back to `popup` and then to a
   * hard default, so a theme that predates the motion scale — or names a
   * token that isn't there — still animates rather than snapping.
   */
  motion(token: Motion | undefined): MotionToken {
    const motions = this.motions();
    return (
      (token ? motions[token] : undefined) ??
      motions['popup'] ?? { duration: 100, easing: 'linear', scale: 0.8 }
    );
  }

  private readonly warnedBackdrops = new Set<string>();

  /**
   * Resolves a named backdrop primitive — the wash a modal surface lays over
   * the page — so every such surface dims it the same way.
   *
   * A raw style object passes straight through: that is the shape the dialog's
   * and drawer's `backdrop` options took before the scale existed, and a
   * consumer theme that still states one keeps working.
   */
  backdrop(token: Backdrop | StyleExpression | undefined): NullableStyleExpression {
    if (!token) return undefined;
    if (typeof token !== 'string') return token;

    const backdrops = this.backdrops();
    const value = backdrops[token];
    if (value) return value;

    // The scale is open, so a mistyped name cannot be a compile error. Falling
    // through to `scrim` still dims the page; saying so once keeps the typo
    // from hiding behind a backdrop that looks almost right.
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !this.warnedBackdrops.has(token)) {
      this.warnedBackdrops.add(token);
      console.warn(
        `[uni] Unknown backdrop token "${token}": the active theme does not define it, ` +
          `so the shared \`scrim\` is used instead. Add it to the theme's \`backdrops\` ` +
          `map, or use one of: ${Object.keys(backdrops).join(', ')}.`
      );
    }
    return backdrops['scrim'] ?? { background: 'rgba(0, 0, 0, 0.4)' };
  }

  radius(size: Radius | undefined): NullableStyleExpression {
    return !size ? undefined : { borderRadius: this.radii()[size] };
  }

  getRadiusLeft(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomLeftRadius: this.radii()[size],
      borderTopLeftRadius: this.radii()[size],
    };
  }

  getRadiusRight(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomRightRadius: this.radii()[size],
      borderTopRightRadius: this.radii()[size],
    };
  }

  getRadiusTop(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderTopLeftRadius: this.radii()[size],
      borderTopRightRadius: this.radii()[size],
    };
  }

  getRadiusBottom(size: Radius | undefined): NullableStyleExpression {
    if (!size) return;
    return {
      borderBottomLeftRadius: this.radii()[size],
      borderBottomRightRadius: this.radii()[size],
    };
  }

  padding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { padding: this.resolveSpacing(size) };
  }

  horizontalPadding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingInline: this.resolveSpacing(size) };
  }

  verticalPadding(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingBlock: this.resolveSpacing(size) };
  }

  paddingLeft(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingLeft: this.resolveSpacing(size) };
  }

  paddingRight(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingRight: this.resolveSpacing(size) };
  }

  paddingTop(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingTop: this.resolveSpacing(size) };
  }

  paddingBottom(size: OptionalSize): NullableStyleExpression {
    return !size ? undefined : { paddingBottom: this.resolveSpacing(size) };
  }

  /**
   * Inline-axis margin only — `'auto'` passes through for centering, anything
   * else resolves as a spacing token. Block margins are deliberately absent
   * (they collapse and fight `gap`).
   */
  marginInline(margin: 'auto' | OptionalSize): NullableStyleExpression {
    if (!margin) return undefined;
    return { marginInline: margin === 'auto' ? 'auto' : this.getSpacing(margin) };
  }

  border(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { border: this.borders()[border] };
  }

  borderTop(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderTop: this.borders()[border] };
  }

  borderBottom(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderBottom: this.borders()[border] };
  }

  borderLeft(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderLeft: this.borders()[border] };
  }

  borderRight(border: Border | undefined): NullableStyleExpression {
    return !border ? undefined : { borderRight: this.borders()[border] };
  }

  boxShadow(shadow: Shadow | undefined) {
    return !shadow ? undefined : { boxShadow: this.shadows()[shadow] };
  }

  gap(gap: OptionalSize): NullableStyleExpression {
    return !gap || gap === 'none' ? undefined : { gap: this.resolveSpacing(gap) };
  }

  zIndex(element: ZIndexableElements | undefined): NullableStyleExpression {
    return !element ? undefined : { zIndex: Z_INDEX[element] };
  }

  borderColor(borderColor: ColorToken): NullableStyleExpression {
    return { borderColor: this.colors()[borderColor] };
  }

  getComponentTheme<T, V = object>(componentName: ComponentName) {
    return this.component<T, V>(componentName);
  }

  // Used to get an "always-defined" options object from a component theme.
  getComponentOptions = <T>(componentName: ComponentName) =>
    linkedSignal({
      source: this.getComponentTheme<T>(componentName),
      computation: () => {
        return this.getComponentTheme<T>(componentName)().options || ({} as T);
      },
    });

  componentOptions = (componentName: ComponentName) =>
    computed(() => this.component(componentName)().options || {});

  style(prop: string, value: string | number | undefined): NullableStyleExpression {
    return !value ? undefined : { [prop]: value };
  }

  /**
   * Like {@link style}, but only `undefined` means "unset" — so a meaningful
   * `0` survives. `flex-shrink: 0` is the whole point of the input, and
   * {@link style}'s truthiness check would drop it.
   */
  styleIfSet(prop: string, value: string | number | undefined): NullableStyleExpression {
    return value === undefined ? undefined : { [prop]: value };
  }
}
