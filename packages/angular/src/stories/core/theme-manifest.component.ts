import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../lib/theming';
import { UniTextComponent } from '../../lib/components/text';

export type ThemeManifestSection =
  | 'colors'
  | 'spacing'
  | 'radii'
  | 'borders'
  | 'shadows'
  | 'thicknesses';

interface TokenRow {
  token: string;
  value: string;
}

interface ColorGroup {
  name: string;
  rows: (TokenRow & { onColor?: string })[];
}

/**
 * Ordered color families for the manifest. A token belongs to the first
 * matcher that claims it; anything unclaimed (theme-specific extras) collects
 * into a trailing "Other" group so the manifest always shows the complete
 * record.
 */
const ColorGroups: { name: string; match: (token: string) => boolean }[] = [
  ...['primary', 'secondary', 'tertiary', 'quaternary'].map((f) => ({
    name: f[0].toUpperCase() + f.slice(1),
    match: (t: string) => t === f || t.startsWith(`${f}-`) || t.startsWith(`on-${f}`),
  })),
  ...['error', 'warn', 'alert', 'success', 'info'].map((f) => ({
    name: f[0].toUpperCase() + f.slice(1),
    match: (t: string) => t === f || t.startsWith(`${f}-`) || t.startsWith(`on-${f}`),
  })),
  ...['disabled', 'inverse'].map((f) => ({
    name: f[0].toUpperCase() + f.slice(1),
    match: (t: string) => t === f || t.startsWith(`${f}-`) || t.startsWith(`on-${f}`),
  })),
  {
    name: 'Surfaces',
    match: (t) =>
      t === 'background' ||
      t === 'surface' ||
      t === 'surface-variant' ||
      t === 'scrim' ||
      t.startsWith('on-background') ||
      t.startsWith('on-surface'),
  },
  {
    name: 'Utility',
    match: (t) => ['outline', 'shadow', 'surface-tint', 'transparent'].includes(t),
  },
];

/**
 * Storybook-only manifest for one of the active theme's token scales. Each
 * `section` renders every token in that scale with its resolved value, read
 * live off the ThemeService so the toolbar re-themes it. Typography and
 * iconography have their own Core pages; this covers the rest.
 */
@Component({
  selector: 'sb-theme-manifest',
  imports: [UniTextComponent],
  template: `
    @switch (section()) {
      @case ('colors') {
        @for (group of colorGroups(); track group.name) {
          <h3 uni-text="overline" color="on-surface-variant" display="block">{{ group.name }}</h3>
          <div [class]="gridClass()">
            @for (row of group.rows; track row.token) {
              <div [class]="cardClass()">
                <div
                  [class]="swatchClass()"
                  [style.background]="row.value"
                  [style.color]="row.onColor || null"
                >
                  @if (row.onColor) {
                    Aa
                  }
                </div>
                <code>{{ row.token }}</code>
                <span>{{ row.value }}</span>
              </div>
            }
          </div>
        }
      }
      @case ('spacing') {
        @for (row of rows(); track row.token) {
          <div [class]="rowClass()">
            <code>{{ row.token }}</code>
            <span>{{ row.value }}</span>
            <div [class]="barClass()" [style.width]="row.value === '0' ? '1px' : row.value"></div>
          </div>
        }
      }
      @case ('radii') {
        <div [class]="gridClass()">
          @for (row of rows(); track row.token) {
            <div [class]="cardClass()">
              <div [class]="shapeClass()" [style.border-radius]="row.value"></div>
              <code>{{ row.token }}</code>
              <span>{{ row.value }}</span>
            </div>
          }
        </div>
      }
      @case ('borders') {
        <div [class]="gridClass()">
          @for (row of rows(); track row.token) {
            <div [class]="cardClass()">
              <div [class]="shapeClass()" [style.border]="row.value"></div>
              <code>{{ row.token }}</code>
              <span>{{ row.value }}</span>
            </div>
          }
        </div>
      }
      @case ('shadows') {
        <div [class]="gridClass()">
          @for (row of rows(); track row.token) {
            <div [class]="cardClass()">
              <div [class]="shadowClass()" [style.box-shadow]="row.value"></div>
              <code>{{ row.token }}</code>
              <span>{{ row.value }}</span>
            </div>
          }
        </div>
      }
      @case ('thicknesses') {
        @for (row of rows(); track row.token) {
          <div [class]="rowClass()">
            <code>{{ row.token }}</code>
            <span>{{ row.value }}</span>
            <div [class]="ruleClass()" [style.height.px]="row.value"></div>
          </div>
        }
      }
    }
  `,
  host: { '[class]': 'hostClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbThemeManifestComponent {
  protected readonly theme = inject(ThemeService);

  readonly section = input.required<ThemeManifestSection>();

  /** The selected scale as [token, value] rows, in record order. */
  protected readonly rows = computed<TokenRow[]>(() => {
    const scale = this.theme.theme()[this.section()] as Record<string, string | number>;
    return Object.entries(scale)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([token, value]) => ({ token, value: String(value) }));
  });

  protected readonly colorGroups = computed<ColorGroup[]>(() => {
    const colors = this.theme.colors() as Record<string, string>;
    const rows = this.rows().map((row) => ({ ...row, onColor: colors[`on-${row.token}`] }));
    const grouped = ColorGroups.map(({ name, match }) => ({
      name,
      rows: rows.filter(({ token }) => match(token)),
    }));
    const claimed = new Set(grouped.flatMap((g) => g.rows.map((r) => r.token)));
    grouped.push({ name: 'Other', rows: rows.filter(({ token }) => !claimed.has(token)) });
    return grouped.filter((g) => g.rows.length);
  });

  // The docs canvas doesn't take the theme background, so the manifest paints
  // its own surface — dark themes stay legible on the white docs page.
  protected readonly hostClass = computed(() =>
    css({
      display: 'block',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: this.theme.colors()['background'],
      color: this.theme.colors()['on-background'],
    })
  );

  protected readonly gridClass = computed(() =>
    css({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    })
  );

  protected readonly cardClass = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      ...this.theme.typeface('caption'),
      code: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
      span: { color: this.theme.colors()['on-background-variant'], overflowWrap: 'anywhere' },
    })
  );

  protected readonly swatchClass = computed(() =>
    css({
      height: '56px',
      borderRadius: '8px',
      border: `1px solid ${this.theme.colors()['outline']}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...this.theme.typeface('title-medium'),
    })
  );

  protected readonly shapeClass = computed(() =>
    css({
      height: '72px',
      border: `2px solid ${this.theme.colors()['on-background']}`,
      backgroundColor: this.theme.colors()['surface'],
    })
  );

  protected readonly shadowClass = computed(() =>
    css({
      height: '72px',
      margin: '8px',
      borderRadius: '8px',
      backgroundColor: this.theme.colors()['surface'],
    })
  );

  protected readonly rowClass = computed(() =>
    css({
      display: 'grid',
      gridTemplateColumns: '80px 60px 1fr',
      alignItems: 'center',
      gap: '16px',
      padding: '8px 0',
      borderBottom: `1px solid ${this.theme.colors()['outline']}`,
      ...this.theme.typeface('caption'),
      code: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
      span: { color: this.theme.colors()['on-background-variant'] },
    })
  );

  protected readonly barClass = computed(() =>
    css({
      height: '12px',
      borderRadius: '2px',
      backgroundColor: this.theme.colors()['primary'],
    })
  );

  protected readonly ruleClass = computed(() =>
    css({
      backgroundColor: this.theme.colors()['on-background'],
      maxWidth: '160px',
    })
  );
}
