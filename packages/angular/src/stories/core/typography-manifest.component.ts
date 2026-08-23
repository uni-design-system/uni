import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { css } from '@emotion/css';
import type { TypeFaceDefinition } from '@uni-design-system/uni-core';
import { ThemeService } from '../../lib/theming';
import { UniTextDirective } from '../../lib/components/text';

interface FaceRow {
  token: string;
  /** One-line spec summary: family · size / line-height · weight · tracking … */
  specs: string;
}

interface FaceGroup {
  name: string;
  rows: FaceRow[];
}

/**
 * Ordered grouping of the type scale for the manifest. Tokens that match no
 * group (product extras like `stat`, `tag`, or anything a theme registers
 * beyond the canonical roles) collect into a trailing "Component" group, so
 * the page always shows every typeface the active theme knows about.
 */
const Groups: { name: string; match: (token: string) => boolean }[] = [
  { name: 'Display', match: (t) => t.startsWith('display') },
  { name: 'Headline', match: (t) => t.startsWith('headline') },
  { name: 'Title', match: (t) => t.startsWith('title') },
  { name: 'Body', match: (t) => t.startsWith('body') || t.startsWith('subtitle') },
  { name: 'Prose', match: (t) => ['paragraph', 'quote', 'note'].includes(t) },
  { name: 'Utility', match: (t) => ['label', 'button', 'caption', 'overline'].includes(t) },
];

const specSummary = (face: TypeFaceDefinition): string => {
  const parts = [face.fontFamily, `${face.fontSize} / ${face.lineHeight}`];
  if (face.fontWeight) parts.push(`weight ${face.fontWeight}`);
  if (face.letterSpacing) parts.push(`tracking ${face.letterSpacing}`);
  if (face.textTransform) parts.push(face.textTransform);
  if (face.fontStyle) parts.push(face.fontStyle);
  return parts.join(' · ');
};

/**
 * Storybook-only manifest of every typeface registered in the active theme.
 * Reads the derived `typeFaces()` map off the ThemeService, so switching the
 * theme in the toolbar re-renders the specimens and specs live.
 */
@Component({
  selector: 'sb-typography-manifest',
  imports: [UniTextDirective],
  template: `
    <p uni-text="body-2-short" color="on-surface-variant">
      {{ count() }} typefaces registered in {{ theme.selectedThemeName() }}.
    </p>
    @for (group of groups(); track group.name) {
      <section>
        <h2 uni-text="overline" color="on-surface-variant" display="block">{{ group.name }}</h2>
        @for (row of group.rows; track row.token) {
          <div [class]="rowClass()">
            <div [class]="metaClass()">
              <code>{{ row.token }}</code>
              <span>{{ row.specs }}</span>
            </div>
            <span [uni-text]="row.token" display="block">{{ specimen }}</span>
          </div>
        }
      </section>
    }
  `,
  host: { '[class]': 'hostClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbTypographyManifestComponent {
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
  protected readonly specimen = 'The quick brown fox jumps over the lazy dog';

  protected readonly groups = computed<FaceGroup[]>(() => {
    const faces = Object.entries(this.theme.typeFaces());
    const grouped = Groups.map(({ name, match }) => ({
      name,
      rows: faces
        .filter(([token]) => match(token))
        .map(([token, face]) => ({ token, specs: specSummary(face) })),
    }));
    const claimed = new Set(grouped.flatMap((g) => g.rows.map((r) => r.token)));
    grouped.push({
      name: 'Component',
      rows: faces
        .filter(([token]) => !claimed.has(token))
        .map(([token, face]) => ({ token, specs: specSummary(face) })),
    });
    return grouped.filter((g) => g.rows.length);
  });

  protected readonly count = computed(() => Object.keys(this.theme.typeFaces()).length);

  protected readonly rowClass = computed(() =>
    css({
      padding: '16px 0',
      borderBottom: `1px solid ${this.theme.colors()['outline']}`,
      overflow: 'hidden',
    })
  );

  protected readonly metaClass = computed(() =>
    css({
      ...this.theme.typeface('caption'),
      color: this.theme.colors()['on-surface-variant'],
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '8px',
      code: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        color: this.theme.colors()['on-surface'],
        backgroundColor: this.theme.colors()['surface-variant'],
        padding: '2px 6px',
        borderRadius: '4px',
      },
    })
  );
}
