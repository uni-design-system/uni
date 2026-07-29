/**
 * `create-icon-tokens` — turns a consuming project's raw SVGs into theme icon
 * tokens.
 *
 * This is the counterpart to the never-inline-SVG rule the server teaches: an
 * agent that finds inline `<svg>` in a component calls this, gets a paste-ready
 * `icons` map back, and moves the artwork into the theme where it belongs.
 *
 * Encoding is delegated to `svgToIconUri` in uni-core, so tokens produced here
 * are byte-identical to the built-in set. What this adds is the set-level view
 * a single-icon helper cannot have: which names collide with built-ins, and
 * whether the artwork shares one grid.
 */
import { BaseIcons, svgToIconUri } from '@uni-design-system/uni-core';

export interface IconTokenInput {
  /** Token name. Non-camelCase input is converted, and the change reported. */
  name: string;
  /** Raw SVG source, or an already-encoded `data:image/svg+xml,…` URI. */
  svg: string;
  /**
   * Accept artwork that paints in more than one color, knowing it flattens to
   * a silhouette. Off by default so multi-color logos are caught rather than
   * silently reduced.
   */
  allowMultiColor?: boolean;
}

interface Encoded {
  name: string;
  originalName: string;
  uri: string;
  viewBox: string;
}

interface Rejected {
  name: string;
  reason: string;
}

const DATA_URI = /^data:image\/svg\+xml[^,]*,/;

/** Flat camelCase is the set convention (`chevronDown`, `externalLink`). */
function toCamelCase(name: string): string {
  const cleaned = name
    .trim()
    .replace(/\.svg$/i, '')
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ''));
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

const decode = (uri: string) => decodeURIComponent(uri.replace(DATA_URI, ''));

const viewBoxOf = (svg: string) => svg.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1] ?? 'unknown';

/** The grid the built-in set is drawn on. */
const BASE_GRID = viewBoxOf(decode(BaseIcons.chevronDown));

export function formatIconTokens(icons: IconTokenInput[]): string {
  if (!icons.length) {
    return 'No icons supplied. Pass `icons: [{ name, svg }]` — `svg` may be raw SVG source or an already-encoded data URI.';
  }

  const encoded: Encoded[] = [];
  const rejected: Rejected[] = [];

  for (const { name, svg, allowMultiColor } of icons) {
    const tokenName = toCamelCase(name);
    // Accept an already-encoded URI so re-running the tool is harmless.
    const source = DATA_URI.test(svg.trim()) ? decode(svg.trim()) : svg;

    try {
      const uri = svgToIconUri(source, { name: tokenName, allowMultiColor });
      encoded.push({ name: tokenName, originalName: name, uri, viewBox: viewBoxOf(decode(uri)) });
    } catch (error) {
      const reason = (error as Error).message
        .replace(`${tokenName}: `, '')
        // The helper's advice names its own option; point at this tool's input
        // instead, so the caller can actually act on it.
        .replace(
          /Pass \{ allowMultiColor: true \} to accept that\./,
          `Set \`allowMultiColor: true\` on \`${tokenName}\` and call again if a silhouette is intended.`
        );
      rejected.push({ name: tokenName, reason });
    }
  }

  const out: string[] = [];
  out.push(`# Icon tokens — ${encoded.length} of ${icons.length} encoded`);
  out.push('');

  if (encoded.length) {
    out.push('## Add to `uni-theme.ts`');
    out.push('');
    out.push('Merge these into the `icons` const. They are merged over the built-in set per');
    out.push('name, then rendered anywhere with `<uni-icon name="…" />` — delete the inline');
    out.push('`<svg>` from the component.');
    out.push('');
    out.push('```ts');
    out.push('const icons: Icons = {');
    for (const { name, uri } of encoded) out.push(`  ${name}: "${uri}",`);
    out.push('};');
    out.push('```');
    out.push('');
  }

  if (rejected.length) {
    out.push('## Not encoded');
    out.push('');
    out.push('These cannot render as a mask. Fix the artwork and call again.');
    out.push('');
    for (const { name, reason } of rejected) out.push(`- \`${name}\` — ${reason}`);
    out.push('');
  }

  const notes: string[] = [];

  const renamed = encoded.filter((e) => e.name !== e.originalName);
  if (renamed.length) {
    notes.push(
      `Renamed to the set's flat camelCase convention: ${renamed
        .map((e) => `\`${e.originalName}\` → \`${e.name}\``)
        .join(', ')}.`
    );
  }

  const overrides = encoded.filter((e) => e.name in BaseIcons);
  if (overrides.length) {
    notes.push(
      `Overrides a built-in icon: ${overrides.map((e) => `\`${e.name}\``).join(', ')}. ` +
        'Intentional for rebranding a standard glyph; rename if you meant to add a new one.'
    );
  }

  // The set-level check a per-icon helper cannot make — and the exact defect
  // that made the old built-in set look inconsistent.
  const grids = [...new Set(encoded.map((e) => e.viewBox))];
  if (grids.length > 1) {
    notes.push(
      `Mixed viewBox grids (${grids.map((g) => `\`${g}\``).join(', ')}). Icons drawn on ` +
        'different grids will not share an optical weight or size. Re-export the set on one grid.'
    );
  } else if (grids.length === 1 && grids[0] !== BASE_GRID && overrides.length) {
    notes.push(
      `This set is drawn on \`${grids[0]}\` while the built-in set uses \`${BASE_GRID}\`. ` +
        'That is fine on its own, but a glyph overriding a built-in will sit next to ' +
        'un-overridden built-ins, so check they read at the same weight.'
    );
  }

  notes.push(
    'Icons are masked with `currentColor`, so they are monochrome: the mask uses the ' +
      'alpha channel and any fill colors in the source are discarded. Color them by ' +
      'setting text color on the container, or with `<uni-icon color="…" />`.'
  );

  out.push('## Notes');
  out.push('');
  for (const note of notes) out.push(`- ${note}`);

  return out.join('\n');
}
