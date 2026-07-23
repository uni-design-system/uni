import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { css } from '@emotion/css';
import {
  emitDtcgTokens,
  emitThemeFile,
  generatePalette,
  ShapeRadii,
  type ColorCategory,
  type ColorScheme,
  type Colors,
  type ColorToken,
  type ContrastCheck,
  type GenerationInput,
  type ThemeShape,
  type Variant,
} from '@uni-design-system/uni-core';

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
const SHAPES: ThemeShape[] = ['sharp', 'modern', 'playful'];
const VARIANTS: Variant[] = ['primary', 'secondary', 'tertiary', 'warn', 'ghost'];

// Representative tokens shown as swatches in each mode panel.
const SWATCHES: { label: string; token: ColorToken; on: ColorToken }[] = [
  { label: 'primary', token: 'primary', on: 'on-primary' },
  { label: 'secondary', token: 'secondary', on: 'on-secondary' },
  { label: 'tertiary', token: 'tertiary', on: 'on-tertiary' },
  { label: 'container', token: 'primary-container', on: 'on-primary-container' },
  { label: 'error', token: 'error', on: 'on-error' },
  { label: 'warn', token: 'warn', on: 'on-warn' },
  { label: 'success', token: 'success', on: 'on-success' },
  { label: 'surface', token: 'surface', on: 'on-surface' },
];

interface Preset {
  label: string;
  config: BrandPaletteConfig;
}

// Curated presets for the OKLCH engine. Brand colors ride as soft `targets`:
// emitted exactly where they already meet WCAG AA, lightness-adjusted (never
// hue) where they don't — so every preset is AA-clean in both modes.
const PRESETS: Preset[] = [
  {
    label: 'Indigo',
    config: { seed: '#4F46E5', scheme: 'analogous', category: 'jewel', targets: { primary: '#4F46E5' } },
  },
  {
    label: 'Ocean',
    config: { seed: '#0066B2', scheme: 'complimentary', category: 'jewel', targets: { primary: '#0066B2' } },
  },
  {
    label: 'Emerald',
    config: { seed: '#047857', scheme: 'analogous', category: 'jewel', targets: { primary: '#047857' } },
  },
  {
    label: 'Sunset',
    config: { seed: '#DC2626', scheme: 'splitComplimentary', category: 'jewel', targets: { primary: '#DC2626' } },
  },
  {
    label: 'Berry',
    config: { seed: '#C2185B', scheme: 'triadic', category: 'jewel', targets: { primary: '#C2185B' } },
  },
  {
    label: 'Heritage',
    config: {
      seed: '#2C3E35',
      scheme: 'complimentary',
      category: 'earth',
      targets: { primary: '#2C3E35', secondary: '#D4A373' },
    },
  },
  {
    label: 'Sage & Clay',
    config: {
      seed: '#6B8F71',
      scheme: 'analogous',
      category: 'earth',
      targets: { primary: '#6B8F71', secondary: '#B3593C' },
    },
  },
  {
    label: 'Pastel',
    config: { seed: '#A78BFA', scheme: 'analogous', category: 'pastel', targets: { primary: '#A78BFA' } },
  },
  {
    label: 'Graphite',
    config: {
      seed: '#475569',
      scheme: 'monochromatic',
      category: 'neutral',
      accentSaturationFloor: 10,
      targets: { primary: '#475569' },
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
        <span class="tb-eyebrow">Theme builder · Playground</span>
        <h2 class="tb-title">Make Uni your brand</h2>
        <p class="tb-lede">
          Every token is derived in OKLCH from a seed color, a scheme and a category — or bring
          exact brand colors. Presets are WCAG AA in light and dark. Changes apply to
          <b>every</b> component in this Storybook, live.
        </p>
      </header>

      <div class="tb-presets">
        @for (p of presets; track p.label) {
          <button type="button" class="tb-preset" (click)="applyPreset(p.config)">
            <span
              class="tb-dot"
              [style.background]="p.config.targets?.primary ?? p.config.brand?.primary ?? p.config.seed"
            ></span>
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
        <span>Shape</span>
        <select (change)="setShape($any($event.target).value)">
          @for (s of shapes; track s) {
            <option [value]="s" [selected]="s === shape()">{{ s }}</option>
          }
        </select>
      </label>

      <label class="tb-field">
        <span>Accent saturation floor · {{ floor() }}</span>
        <input type="range" min="0" max="45" [value]="floor()" (input)="setFloor($any($event.target).value)" />
      </label>

      <div class="tb-field">
        <span>Storybook mode</span>
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

      <div class="tb-field">
        <span>Export</span>
        <div class="tb-exports">
          <button type="button" (click)="copyThemeFile()">
            {{ copied() === 'file' ? 'Copied ✓' : 'Copy uni-theme.ts' }}
          </button>
          <button type="button" (click)="copyNgAdd()">
            {{ copied() === 'ngadd' ? 'Copied ✓' : 'Copy ng add command' }}
          </button>
          <button type="button" (click)="copyDtcg()">
            {{ copied() === 'dtcg' ? 'Copied ✓' : 'Copy DTCG JSON' }}
          </button>
        </div>
      </div>

      <div class="tb-actions">
        <button type="button" class="tb-reset" (click)="reset()">Reset to default</button>
      </div>
      <code class="tb-snippet">{{ snippet() }}</code>
    </aside>

    <section [class]="preview()">
      <p class="tb-group">Light & dark — generated together, side by side</p>
      <div class="tb-modes">
        @for (m of modePanels(); track m.label) {
          <div class="tb-panel" [style.background]="m.colors['background']" [style.borderColor]="m.colors['outline']">
            <span class="tb-panel-tag" [style.color]="m.colors['on-background-variant']">{{ m.label }}</span>
            <div class="tb-mode-swatches">
              @for (s of swatches; track s.label) {
                <div class="tb-swatch" [style.background]="m.colors[s.token]" [style.color]="m.colors[s.on]">
                  <span>{{ s.label }}</span>
                  <code>{{ m.colors[s.token] }}</code>
                </div>
              }
            </div>
            <div class="tb-mini-card" [style.background]="m.colors['surface']" [style.borderColor]="m.colors['outline']">
              <div class="tb-mini-head" [style.background]="m.colors['primary']" [style.color]="m.colors['on-primary']">
                Card header
              </div>
              <div class="tb-mini-body" [style.color]="m.colors['on-surface']">
                Semantic inks stay legible:
                <b [style.color]="m.colors['error']">error</b> ·
                <b [style.color]="m.colors['warn']">warn</b> ·
                <b [style.color]="m.colors['success']">success</b>.
              </div>
            </div>
          </div>
        }
      </div>

      <p class="tb-group">Real components — your brand, live ({{ mode() }})</p>
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

      <p class="tb-group">
        Contrast report — {{ report().checks.length }} pairs ·
        worst {{ report().worst }}:1 ·
        @if (report().failing.length === 0) {
          <span class="tb-pass">all AA</span>
        } @else {
          <span class="tb-fail">{{ report().failing.length }} failing</span>
        }
        <button type="button" class="tb-link" (click)="showAllPairs.set(!showAllPairs())">
          {{ showAllPairs() ? 'hide detail' : 'show all pairs' }}
        </button>
      </p>
      @if (report().failing.length > 0 || showAllPairs()) {
        <div class="tb-matrix">
          <table>
            <thead>
              <tr><th>mode</th><th>foreground</th><th>on</th><th>ratio</th><th>needs</th><th>level</th></tr>
            </thead>
            <tbody>
              @for (c of visibleChecks(); track $index) {
                <tr [class.bad]="!c.pass">
                  <td>{{ c.mode }}</td>
                  <td><code>{{ c.foreground }}</code></td>
                  <td><code>{{ c.background }}</code></td>
                  <td>{{ c.ratio }}</td>
                  <td>{{ c.required }}</td>
                  <td>{{ c.level }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (report().failing.length > 0) {
        <p class="tb-hint">
          Failing pairs come from hard-pinned brand colors (pins are emitted verbatim). Un-pin, or
          use a preset — soft targets keep brand hue while the guard-rail restores AA.
        </p>
      }

      <p class="tb-hint">Tip: browse to any component story in the sidebar — it's wearing your brand now.</p>
    </section>
  `,
})
export class UniThemeBuilderComponent {
  protected theme = inject(ThemeService);

  protected readonly schemes = SCHEMES;
  protected readonly categories = CATEGORIES;
  protected readonly shapes = SHAPES;
  protected readonly variants = VARIANTS;
  protected readonly sizes = ['sm', 'md', 'lg', 'xl'] as const;
  protected readonly swatches = SWATCHES;
  protected readonly presets = PRESETS;

  protected seed = signal('#4F46E5');
  protected scheme = signal<ColorScheme>('triadic');
  protected category = signal<ColorCategory>('neutral');
  protected shape = signal<ThemeShape>('modern');
  protected floor = signal(18);
  protected mode = signal<'light' | 'dark'>('light');
  protected pinPrimary = signal(false);
  protected primaryHex = signal('#2C3E35');
  protected pinSecondary = signal(false);
  protected secondaryHex = signal('#D4A373');
  /** Soft brand targets carried by the active preset (cleared on seed edits). */
  protected targets = signal<BrandPaletteConfig['targets']>(undefined);

  protected copied = signal<'file' | 'ngadd' | 'dtcg' | null>(null);
  protected showAllPairs = signal(false);

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
      this.targets.set(existing.targets);
    }
  }

  protected config = computed<BrandPaletteConfig>(() => ({
    seed: this.seed(),
    scheme: this.scheme(),
    category: this.category(),
    mode: this.mode(),
    accentSaturationFloor: this.floor(),
    radii: ShapeRadii[this.shape()],
    ...(this.targets() ? { targets: this.targets() } : {}),
    brand: {
      ...(this.pinPrimary() ? { primary: this.primaryHex() } : {}),
      ...(this.pinSecondary() ? { secondary: this.secondaryHex() } : {}),
    },
  }));

  /**
   * Both modes generated on every input change (< 15 ms each), independent of
   * the storybook-wide theme — the side-by-side preview and the contrast
   * report always show the full light+dark picture.
   */
  protected palettes = computed(() => {
    const base = { ...this.config() };
    const checks: ContrastCheck[] = [];
    const light = generatePalette({ ...base, mode: 'light', checks });
    const dark = generatePalette({ ...base, mode: 'dark', checks });
    return { light, dark, checks };
  });

  protected modePanels = computed((): { label: 'light' | 'dark'; colors: Colors }[] => [
    { label: 'light', colors: this.palettes().light },
    { label: 'dark', colors: this.palettes().dark },
  ]);

  protected report = computed(() => {
    const { checks } = this.palettes();
    return {
      checks,
      failing: checks.filter((c) => !c.pass),
      worst: checks.reduce((worst, c) => Math.min(worst, c.ratio), 21),
    };
  });

  protected visibleChecks = computed(() =>
    this.showAllPairs() ? this.report().checks : this.report().failing
  );

  protected snippet = computed(() => {
    const { radii: _radii, ...rest } = this.config();
    return JSON.stringify(rest);
  });

  /** The builder state expressed as engine input — drives all three exports. */
  protected generationInput = computed<GenerationInput>(() => {
    const targets = this.targets();
    const seeds = [this.pinPrimary() ? this.primaryHex() : (targets?.primary ?? this.seed())];
    const secondary = this.pinSecondary() ? this.secondaryHex() : targets?.secondary;
    if (secondary) seeds.push(secondary);
    if (targets?.tertiary) seeds.push(targets.tertiary);
    return {
      seed: seeds.length === 1 ? seeds[0] : seeds,
      scheme: this.scheme(),
      vibe: this.category(),
      shape: this.shape(),
      name: 'Brand',
    };
  });

  protected color(token: ColorToken): string {
    return this.theme.colors()[token] ?? 'transparent';
  }

  private apply(): void {
    this.theme.applyPalette(this.config());
  }

  private copyToClipboard(kind: 'file' | 'ngadd' | 'dtcg', text: string): void {
    void navigator.clipboard?.writeText(text).then(() => {
      this.copied.set(kind);
      setTimeout(() => this.copied.set(null), 1600);
    });
  }

  protected copyThemeFile(): void {
    this.copyToClipboard('file', emitThemeFile(this.generationInput()).content);
  }

  protected copyNgAdd(): void {
    const input = this.generationInput();
    const seeds = Array.isArray(input.seed) ? input.seed.join(',') : input.seed;
    this.copyToClipboard(
      'ngadd',
      `ng add @uni-design-system/uni-angular --brand=${seeds} --shape=${input.shape}`
    );
  }

  protected copyDtcg(): void {
    const { light, dark } = this.palettes();
    const radii = ShapeRadii[this.shape()];
    const spacing = this.theme.spacing();
    this.copyToClipboard(
      'dtcg',
      JSON.stringify(
        {
          light: emitDtcgTokens({ colors: light, radii, spacing }),
          dark: emitDtcgTokens({ colors: dark, radii, spacing }),
        },
        null,
        2
      )
    );
  }

  protected setSeed(v: string) {
    if (/^#?[0-9a-fA-F]{6}$/.test(v.replace('#', ''))) {
      this.seed.set(v.startsWith('#') ? v : `#${v}`);
      // A hand-edited seed takes over from any preset's soft brand targets.
      this.targets.set(undefined);
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
  protected setShape(v: ThemeShape) {
    this.shape.set(v);
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
    this.targets.set(config.targets);
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
    this.shape.set('modern');
    this.floor.set(18);
    this.mode.set('light');
    this.targets.set(undefined);
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
      '& .tb-exports': { display: 'flex', flexDirection: 'column', gap: 6 },
      '& .tb-exports button': {
        height: 32,
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 12.5,
        border: `1px solid ${this.c('primary')}`,
        background: this.c('primary-surface'),
        color: this.c('on-primary-surface'),
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
      '& .tb-modes': {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 14,
        marginBottom: 20,
      },
      '& .tb-panel': {
        border: '1px solid',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      },
      '& .tb-panel-tag': {
        fontSize: 10.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      },
      '& .tb-mode-swatches': {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 8,
      },
      '& .tb-swatch': {
        borderRadius: 10,
        padding: '12px 12px',
        minHeight: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      '& .tb-swatch span': { fontSize: 12.5, fontWeight: 600 },
      '& .tb-swatch code': { fontFamily: 'monospace', fontSize: 10.5, opacity: 0.85 },
      '& .tb-mini-card': { borderRadius: 10, overflow: 'hidden', border: '1px solid' },
      '& .tb-mini-head': { padding: '8px 14px', fontWeight: 600, fontSize: 13 },
      '& .tb-mini-body': { padding: '10px 14px', fontSize: 12.5, lineHeight: 1.5 },
      '& .tb-buttons': { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 14 },
      '& .tb-pass': { color: this.c('success'), fontWeight: 700 },
      '& .tb-fail': { color: this.c('error'), fontWeight: 700 },
      '& .tb-link': {
        marginLeft: 10,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: this.c('primary'),
        fontSize: 11,
        textTransform: 'none',
        letterSpacing: 'normal',
        textDecoration: 'underline',
      },
      '& .tb-matrix': {
        maxHeight: 320,
        overflow: 'auto',
        border: `1px solid ${this.c('outline')}`,
        borderRadius: 10,
        marginBottom: 12,
        '& table': { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
        '& th': {
          position: 'sticky',
          top: 0,
          textAlign: 'left',
          padding: '8px 10px',
          background: this.c('surface-variant'),
          color: this.c('on-surface-variant'),
          fontSize: 10.5,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        },
        '& td': { padding: '6px 10px', borderTop: `1px solid ${this.c('outline')}` },
        '& td code': { fontFamily: 'monospace', fontSize: 11.5 },
        '& tr.bad td': { background: this.c('error-container'), color: this.c('on-error-container') },
      },
      '& .tb-hint': { fontSize: 12.5, opacity: 0.6, marginTop: 8 },
    })
  );
}
