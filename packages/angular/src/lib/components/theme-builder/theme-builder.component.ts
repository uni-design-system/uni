import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { css } from '@emotion/css';
import type { ColorCategory, ColorScheme, ColorToken, Variant } from '@uni-design-system/uni-core';

import { ThemeService, type BrandPaletteConfig } from '../../theming';
import { UniButtonComponent } from '../button';

const SCHEMES: ColorScheme[] = [
  'monochromatic',
  'analogous',
  'complimentary',
  'splitComplimentary',
  'triadic',
];
const CATEGORIES: ColorCategory[] = ['jewel', 'pastel', 'earth', 'neutral', 'florescent', 'shades'];
const VARIANTS: Variant[] = ['primary', 'secondary', 'tertiary', 'warn', 'ghost'];

// Representative tokens to show as swatches — the brand-derived spine of the theme.
const SWATCHES: { label: string; token: ColorToken; on: ColorToken }[] = [
  { label: 'primary', token: 'primary', on: 'on-primary' },
  { label: 'secondary', token: 'secondary', on: 'on-secondary' },
  { label: 'tertiary', token: 'tertiary', on: 'on-tertiary' },
  { label: 'quaternary', token: 'quaternary', on: 'on-quaternary' },
  { label: 'error', token: 'error', on: 'on-error' },
  { label: 'warn', token: 'warn', on: 'on-warn' },
  { label: 'success', token: 'success', on: 'on-success' },
  { label: 'surface', token: 'surface', on: 'on-surface' },
];

interface Preset {
  label: string;
  config: BrandPaletteConfig;
}

const PRESETS: Preset[] = [
  { label: 'Indigo', config: { seed: '#4F46E5', scheme: 'triadic', category: 'neutral' } },
  { label: 'Teal', config: { seed: '#0F766E', scheme: 'analogous', category: 'earth' } },
  { label: 'Ocean', config: { seed: '#0066B2', scheme: 'complimentary', category: 'jewel' } },
  {
    label: 'Heritage (pinned pair)',
    config: {
      seed: '#2C3E35',
      scheme: 'complimentary',
      category: 'earth',
      brand: { primary: '#2C3E35', secondary: '#D4A373' },
    },
  },
];

@Component({
  selector: 'uni-theme-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UniButtonComponent],
  host: { '[class]': 'shell()' },
  template: `
    <aside [class]="controls()">
      <header class="tb-head">
        <span class="tb-eyebrow">Theme builder · Color</span>
        <h2 class="tb-title">Make Uni your brand</h2>
        <p class="tb-lede">
          Every token is derived from a seed color, a scheme and a category — or pin exact brand
          colors. Changes apply to <b>every</b> component in this Storybook, live.
        </p>
      </header>

      <div class="tb-presets">
        @for (p of presets; track p.label) {
          <button type="button" class="tb-preset" (click)="applyPreset(p.config)">
            <span class="tb-dot" [style.background]="p.config.brand?.primary ?? p.config.seed"></span>
            {{ p.label }}
          </button>
        }
      </div>

      <label class="tb-field">
        <span>Seed color</span>
        <div class="tb-row">
          <input type="color" [value]="seed()" (input)="setSeed($any($event.target).value)" />
          <input type="text" [value]="seed()" (input)="setSeed($any($event.target).value)" spellcheck="false" />
        </div>
      </label>

      <label class="tb-field">
        <span>Scheme</span>
        <select (change)="setScheme($any($event.target).value)">
          @for (s of schemes; track s) {
            <option [value]="s" [selected]="s === scheme()">{{ s }}</option>
          }
        </select>
      </label>

      <label class="tb-field">
        <span>Category</span>
        <select (change)="setCategory($any($event.target).value)">
          @for (c of categories; track c) {
            <option [value]="c" [selected]="c === category()">{{ c }}</option>
          }
        </select>
      </label>

      <label class="tb-field">
        <span>Accent saturation floor · {{ floor() }}</span>
        <input type="range" min="0" max="45" [value]="floor()" (input)="setFloor($any($event.target).value)" />
      </label>

      <div class="tb-field">
        <span>Mode</span>
        <div class="tb-toggle">
          <button type="button" [class.on]="mode() === 'light'" (click)="setMode('light')">Light</button>
          <button type="button" [class.on]="mode() === 'dark'" (click)="setMode('dark')">Dark</button>
        </div>
      </div>

      <label class="tb-field tb-pin" [class.dim]="!pinPrimary()">
        <span>
          <input type="checkbox" [checked]="pinPrimary()" (change)="setPinPrimary($any($event.target).checked)" />
          Pin primary <em>{{ pinPrimary() ? 'exact' : 'off' }}</em>
        </span>
        <div class="tb-row">
          <input type="color" [value]="primaryHex()" (input)="setPrimaryHex($any($event.target).value)" />
          <input type="text" [value]="primaryHex()" (input)="setPrimaryHex($any($event.target).value)" spellcheck="false" />
        </div>
      </label>

      <label class="tb-field tb-pin" [class.dim]="!pinSecondary()">
        <span>
          <input type="checkbox" [checked]="pinSecondary()" (change)="setPinSecondary($any($event.target).checked)" />
          Pin secondary <em>{{ pinSecondary() ? 'exact' : 'off' }}</em>
        </span>
        <div class="tb-row">
          <input type="color" [value]="secondaryHex()" (input)="setSecondaryHex($any($event.target).value)" />
          <input type="text" [value]="secondaryHex()" (input)="setSecondaryHex($any($event.target).value)" spellcheck="false" />
        </div>
      </label>

      <div class="tb-actions">
        <button type="button" class="tb-reset" (click)="reset()">Reset to default</button>
      </div>
      <code class="tb-snippet">{{ snippet() }}</code>
    </aside>

    <section [class]="preview()">
      <p class="tb-group">Palette</p>
      <div class="tb-swatches">
        @for (s of swatches; track s.label) {
          <div class="tb-swatch" [style.background]="color(s.token)" [style.color]="color(s.on)">
            <span>{{ s.label }}</span>
            <code>{{ color(s.token) }}</code>
          </div>
        }
      </div>

      <p class="tb-group">Buttons — your brand, our variants</p>
      <div class="tb-buttons">
        @for (v of variants; track v) {
          <button text-button [variant]="v" size="lg">{{ v }}</button>
        }
      </div>
      <div class="tb-buttons">
        @for (sz of sizes; track sz) {
          <button text-button variant="primary" [size]="sz">{{ sz }}</button>
        }
      </div>

      <p class="tb-group">Surfaces</p>
      <div class="tb-cards">
        <div class="tb-card" [style.background]="color('surface')" [style.borderColor]="color('outline')">
          <div class="tb-card-head" [style.background]="color('primary')" [style.color]="color('on-primary')">
            Card header
          </div>
          <div class="tb-card-body" [style.color]="color('on-surface')">
            Body copy on a surface with the outline token as its border. Semantic states stay legible:
            <b [style.color]="color('error')">error</b> ·
            <b [style.color]="color('warn')">warn</b> ·
            <b [style.color]="color('success')">success</b>.
          </div>
        </div>
        <div class="tb-card" [style.background]="color('primary-container')" [style.borderColor]="color('primary')">
          <div class="tb-card-body" [style.color]="color('on-primary-container')">
            <b>primary-container</b> — a soft brand tint for chips, highlights and callouts, with its
            own legible on-color.
          </div>
        </div>
      </div>

      <p class="tb-hint">Tip: browse to any component story in the sidebar — it's wearing your brand now.</p>
    </section>
  `,
})
export class UniThemeBuilderComponent {
  protected theme = inject(ThemeService);

  protected readonly schemes = SCHEMES;
  protected readonly categories = CATEGORIES;
  protected readonly variants = VARIANTS;
  protected readonly sizes = ['sm', 'md', 'lg', 'xl'] as const;
  protected readonly swatches = SWATCHES;
  protected readonly presets = PRESETS;

  protected seed = signal('#4F46E5');
  protected scheme = signal<ColorScheme>('triadic');
  protected category = signal<ColorCategory>('neutral');
  protected floor = signal(18);
  protected mode = signal<'light' | 'dark'>('light');
  protected pinPrimary = signal(false);
  protected primaryHex = signal('#2C3E35');
  protected pinSecondary = signal(false);
  protected secondaryHex = signal('#D4A373');

  constructor() {
    // Seed the controls from an already-active custom palette, if any.
    const existing = this.theme.customPalette();
    if (existing) {
      this.seed.set(existing.seed);
      this.scheme.set(existing.scheme);
      this.category.set(existing.category);
      this.floor.set(existing.accentSaturationFloor ?? 18);
      this.mode.set(existing.mode ?? 'light');
      if (existing.brand?.primary) {
        this.pinPrimary.set(true);
        this.primaryHex.set(existing.brand.primary);
      }
      if (existing.brand?.secondary) {
        this.pinSecondary.set(true);
        this.secondaryHex.set(existing.brand.secondary);
      }
    }
  }

  protected config = computed<BrandPaletteConfig>(() => ({
    seed: this.seed(),
    scheme: this.scheme(),
    category: this.category(),
    mode: this.mode(),
    accentSaturationFloor: this.floor(),
    brand: {
      ...(this.pinPrimary() ? { primary: this.primaryHex() } : {}),
      ...(this.pinSecondary() ? { secondary: this.secondaryHex() } : {}),
    },
  }));

  protected snippet = computed(() => JSON.stringify(this.config()));

  protected color(token: ColorToken): string {
    return this.theme.colors()[token] ?? 'transparent';
  }

  private apply(): void {
    this.theme.applyPalette(this.config());
  }

  protected setSeed(v: string) {
    if (/^#?[0-9a-fA-F]{6}$/.test(v.replace('#', ''))) {
      this.seed.set(v.startsWith('#') ? v : `#${v}`);
      this.apply();
    }
  }
  protected setScheme(v: ColorScheme) {
    this.scheme.set(v);
    this.apply();
  }
  protected setCategory(v: ColorCategory) {
    this.category.set(v);
    this.apply();
  }
  protected setFloor(v: string) {
    this.floor.set(Number(v));
    this.apply();
  }
  protected setMode(v: 'light' | 'dark') {
    this.mode.set(v);
    this.apply();
  }
  protected setPinPrimary(v: boolean) {
    this.pinPrimary.set(v);
    this.apply();
  }
  protected setPrimaryHex(v: string) {
    this.primaryHex.set(v.startsWith('#') ? v : `#${v}`);
    if (this.pinPrimary()) this.apply();
  }
  protected setPinSecondary(v: boolean) {
    this.pinSecondary.set(v);
    this.apply();
  }
  protected setSecondaryHex(v: string) {
    this.secondaryHex.set(v.startsWith('#') ? v : `#${v}`);
    if (this.pinSecondary()) this.apply();
  }

  protected applyPreset(config: BrandPaletteConfig) {
    this.seed.set(config.seed);
    this.scheme.set(config.scheme);
    this.category.set(config.category);
    this.floor.set(config.accentSaturationFloor ?? 18);
    this.pinPrimary.set(!!config.brand?.primary);
    if (config.brand?.primary) this.primaryHex.set(config.brand.primary);
    this.pinSecondary.set(!!config.brand?.secondary);
    if (config.brand?.secondary) this.secondaryHex.set(config.brand.secondary);
    this.apply();
  }

  protected reset() {
    this.theme.clearCustomPalette();
    this.seed.set('#4F46E5');
    this.scheme.set('triadic');
    this.category.set('neutral');
    this.floor.set(18);
    this.mode.set('light');
    this.pinPrimary.set(false);
    this.pinSecondary.set(false);
  }

  // ── Styling (reads live theme tokens so the builder wears the brand too) ──
  private c = (token: ColorToken) => this.theme.colors()[token] ?? 'transparent';

  protected shell = computed(() =>
    css({
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 340px) 1fr',
      gap: 24,
      alignItems: 'start',
      padding: 24,
      background: this.c('background'),
      color: this.c('on-background'),
      minHeight: '100vh',
      fontFamily: 'Red Hat Display, system-ui, sans-serif',
      '@media (max-width: 820px)': { gridTemplateColumns: '1fr' },
      '& .tb-eyebrow': {
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.6,
      },
      '& .tb-title': { fontSize: 26, margin: '6px 0 8px', letterSpacing: '-0.02em' },
      '& .tb-lede': { fontSize: 14, lineHeight: 1.5, opacity: 0.8, margin: 0 },
      '& .tb-group': {
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.55,
        margin: '4px 0 12px',
      },
    })
  );

  protected controls = computed(() =>
    css({
      position: 'sticky',
      top: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 20,
      borderRadius: 14,
      background: this.c('surface'),
      border: `1px solid ${this.c('outline')}`,
      '& .tb-head': { display: 'flex', flexDirection: 'column' },
      '& .tb-presets': { display: 'flex', flexWrap: 'wrap', gap: 8 },
      '& .tb-preset': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
        borderRadius: 999,
        padding: '5px 11px 5px 6px',
        fontSize: 12.5,
        border: `1px solid ${this.c('outline')}`,
        background: this.c('surface'),
        color: this.c('on-surface'),
      },
      '& .tb-dot': { width: 13, height: 13, borderRadius: '50%' },
      '& .tb-field': { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 },
      '& .tb-field > span': { fontSize: 12, opacity: 0.7 },
      '& .tb-row': { display: 'flex', gap: 8, alignItems: 'center' },
      '& input[type=color]': {
        width: 40,
        height: 34,
        padding: 0,
        border: `1px solid ${this.c('outline')}`,
        borderRadius: 8,
        background: 'none',
        cursor: 'pointer',
      },
      '& input[type=text], & select': {
        width: '100%',
        height: 34,
        padding: '0 10px',
        borderRadius: 8,
        border: `1px solid ${this.c('outline')}`,
        background: this.c('background'),
        color: this.c('on-background'),
        fontSize: 13,
      },
      '& input[type=range]': { width: '100%', accentColor: this.c('primary') },
      '& .tb-toggle': { display: 'flex', gap: 6 },
      '& .tb-toggle button': {
        flex: 1,
        height: 32,
        borderRadius: 8,
        cursor: 'pointer',
        border: `1px solid ${this.c('outline')}`,
        background: this.c('background'),
        color: this.c('on-background'),
      },
      '& .tb-toggle button.on': {
        background: this.c('primary'),
        color: this.c('on-primary'),
        borderColor: this.c('primary'),
      },
      '& .tb-pin.dim input[type=color], & .tb-pin.dim input[type=text]': { opacity: 0.45 },
      '& .tb-pin em': {
        fontStyle: 'normal',
        fontSize: 10,
        padding: '1px 6px',
        borderRadius: 5,
        marginLeft: 4,
        background: this.c('primary-container'),
        color: this.c('on-primary-container'),
      },
      '& .tb-reset': {
        cursor: 'pointer',
        borderRadius: 8,
        padding: '8px 14px',
        border: `1px solid ${this.c('outline')}`,
        background: this.c('background'),
        color: this.c('on-background'),
        fontSize: 13,
      },
      '& .tb-snippet': {
        display: 'block',
        fontFamily: 'monospace',
        fontSize: 10.5,
        lineHeight: 1.5,
        wordBreak: 'break-all',
        opacity: 0.6,
      },
    })
  );

  protected preview = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      '& .tb-swatches': {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 10,
        marginBottom: 20,
      },
      '& .tb-swatch': {
        borderRadius: 12,
        padding: '16px 14px',
        minHeight: 74,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      '& .tb-swatch span': { fontSize: 13, fontWeight: 600 },
      '& .tb-swatch code': { fontFamily: 'monospace', fontSize: 11, opacity: 0.85 },
      '& .tb-buttons': { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 14 },
      '& .tb-cards': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 12 },
      '& .tb-card': { borderRadius: 12, overflow: 'hidden', border: '1px solid' },
      '& .tb-card-head': { padding: '10px 16px', fontWeight: 600 },
      '& .tb-card-body': { padding: '14px 16px', fontSize: 13.5, lineHeight: 1.5 },
      '& .tb-hint': { fontSize: 12.5, opacity: 0.6, marginTop: 8 },
    })
  );
}
