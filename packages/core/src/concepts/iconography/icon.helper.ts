/**
 * Turns a raw SVG source string into an icon primitive — the inline data URI
 * form `uni-icon` renders as a CSS mask over `currentColor`.
 *
 * This is the path for bringing your own icons (a brand set, a designer
 * handoff) into a theme. The built-in `BaseIcons` are generated separately
 * from Material Symbols; everything you add goes through here:
 *
 * ```ts
 * const icons: Icons = {
 *   acmeLogo: svgToIconUri(readFileSync('brand/logo.svg', 'utf8')),
 *   search: svgToIconUri(readFileSync('brand/search.svg', 'utf8')),
 * };
 * createTheme({ id: 'Acme', name: 'Acme', colors, icons });
 * ```
 *
 * `createTheme` merges these over `BaseIcons` per name, so reusing a built-in
 * name reskins it and any new name is simply added.
 */

export interface SvgToIconUriOptions {
  /**
   * Accept an SVG that paints in more than one color. Masks are monochrome —
   * the artwork is flattened to its silhouette and takes `currentColor` — so
   * this is rejected by default to catch logos that were never going to
   * survive the pipeline. Set this when a silhouette is what you want.
   */
  allowMultiColor?: boolean;
  /** Name used in error messages, so a failing icon in a set is identifiable. */
  name?: string;
}

/** Paint values that produce no pixels, and so never count as a color. */
const BLANK_PAINT = new Set(['none', 'transparent', 'inherit', '']);

/** Collect every distinct paint value the artwork actually renders with. */
function paintValues(svg: string): string[] {
  const found = new Set<string>();

  for (const [, value] of svg.matchAll(/\b(?:fill|stroke)\s*=\s*["']([^"']*)["']/g)) {
    const paint = value.trim().toLowerCase();
    if (!BLANK_PAINT.has(paint)) found.add(paint);
  }
  // `style="fill:#fff"` — same meaning, different syntax.
  for (const [, , value] of svg.matchAll(/\b(fill|stroke)\s*:\s*([^;"'}]+)/g)) {
    const paint = value.trim().toLowerCase();
    if (!BLANK_PAINT.has(paint)) found.add(paint);
  }

  return [...found];
}

/**
 * Strip everything that stops an SVG scaling to the box it is masked into, and
 * collapse it to one line. Fixed `width`/`height` are removed rather than
 * rejected — designers export them by default and they carry no information
 * the `viewBox` doesn't already have.
 */
function normalize(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(width|height)\s*=\s*["'][^"']*["']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

/**
 * Percent-encode only what a data URI requires. SVG attributes are switched to
 * single quotes so the result drops straight into a double-quoted TypeScript
 * string with no escaping — and stays readable, unlike base64.
 */
function encode(svg: string): string {
  return (
    'data:image/svg+xml,' +
    svg
      .replace(/"/g, "'")
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/</g, '%3c')
      .replace(/>/g, '%3e')
  );
}

/**
 * Encode an SVG string as a mask-ready icon data URI, validating that it will
 * actually survive the mask pipeline.
 *
 * Throws when the source is not a complete `<svg>` document, has no `viewBox`
 * (it could not scale), references an external or raster image, or paints in
 * more than one color (see {@link SvgToIconUriOptions.allowMultiColor}).
 */
export function svgToIconUri(svg: string, options: SvgToIconUriOptions = {}): string {
  const label = options.name ? `${options.name}: ` : '';
  const fail = (message: string): never => {
    throw new Error(`${label}${message}`);
  };

  if (typeof svg !== 'string' || !svg.trim()) fail('empty SVG source');

  const normalized = normalize(svg);

  if (!/^<svg[\s>]/i.test(normalized) || !/<\/svg>$/i.test(normalized)) {
    fail('not a complete <svg> document');
  }

  // Without a viewBox the mask has no intrinsic ratio to scale by, and
  // `uni-icon` sizes itself from its container.
  if (!/\bviewBox\s*=\s*["'][^"']+["']/i.test(normalized)) {
    fail('no viewBox — the icon could not scale to its container');
  }

  // A mask is rendered as an isolated image: it cannot fetch anything, so an
  // external reference silently renders nothing.
  if (/<image\b/i.test(normalized)) {
    fail('contains a raster <image>; masks need vector artwork');
  }
  if (/\b(?:xlink:)?href\s*=\s*["'](?!#)/i.test(normalized)) {
    fail('references an external resource, which a masked SVG cannot load');
  }

  if (!options.allowMultiColor) {
    const paints = paintValues(normalized);
    if (paints.some((p) => p.startsWith('url('))) {
      fail(
        'paints with a gradient or pattern — masks use the alpha channel only, ' +
          'so it would flatten to a silhouette. Pass { allowMultiColor: true } to accept that.'
      );
    }
    if (paints.length > 1) {
      fail(
        `paints in ${paints.length} colors (${paints.join(', ')}) — masks use the alpha ` +
          'channel only, so it would flatten to a silhouette in currentColor. ' +
          'Pass { allowMultiColor: true } to accept that.'
      );
    }
  }

  return encode(normalized);
}
