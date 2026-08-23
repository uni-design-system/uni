import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../lib/theming';
import { UniIconComponent } from '../../lib/components/icon';
import { UniTextDirective } from '../../lib/components/text';

/**
 * Storybook-only manifest of every icon primitive registered in the active
 * theme. Reads the merged `icons` record off the theme (BaseIcons plus
 * anything the theme adds or overrides), so switching the theme in the
 * toolbar re-renders the set live. Tiles copy their token name on click.
 */
@Component({
  selector: 'sb-icon-manifest',
  imports: [UniIconComponent, UniTextDirective],
  template: `
    <p uni-text="body-2-short" color="on-surface-variant">
      {{ names().length }} icons registered in {{ theme.selectedThemeName() }}. Click a tile to
      copy its token name.
    </p>
    <div [class]="gridClass()">
      @for (name of names(); track name) {
        <button
          type="button"
          [class]="tileClass()"
          (click)="copy(name)"
          [attr.aria-label]="'Copy icon token ' + name"
        >
          <uni-icon [name]="name" size="24" />
          <span>{{ copied() === name ? 'copied!' : name }}</span>
        </button>
      }
    </div>
  `,
  host: { '[class]': 'hostClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbIconManifestComponent {
  protected readonly theme = inject(ThemeService);

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

  /** Registration order — BaseIcons' semantic grouping, then theme additions. */
  protected readonly names = computed(() => Object.keys(this.theme.theme().icons));

  protected readonly copied = signal<string | null>(null);

  protected copy(name: string): void {
    navigator.clipboard?.writeText(name);
    this.copied.set(name);
    setTimeout(() => this.copied.update((c) => (c === name ? null : c)), 1200);
  }

  protected readonly gridClass = computed(() =>
    css({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '8px',
    })
  );

  protected readonly tileClass = computed(() =>
    css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 8px 12px',
      border: `1px solid ${this.theme.colors()['outline']}`,
      borderRadius: '8px',
      background: 'none',
      cursor: 'pointer',
      color: this.theme.colors()['on-surface'],
      ...this.theme.typeface('caption'),
      overflowWrap: 'anywhere',
      '&:hover': {
        backgroundColor: this.theme.colors()['surface-variant'],
      },
      ...this.theme.focusRing('primary'),
    })
  );
}
