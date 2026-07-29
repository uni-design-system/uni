import { describe, expect, it } from 'vitest';
import { BaseIcons } from './icon.records';

// The set is generated from Material Symbols, so these guard the *pipeline*:
// a hand-edit or a bad regeneration that ships a malformed or off-grid glyph
// fails here rather than in a consumer's UI.

const GRID = '0 -960 960 960';

/** Icons rendered on the shared Material grid — everything except the
 *  hand-authored spinner, which is a 24-unit animated glyph. */
const gridIcons = Object.entries(BaseIcons).filter(([name]) => name !== 'spinner');

const decode = (uri: string) => decodeURIComponent(uri.replace(/^data:image\/svg\+xml[^,]*,/, ''));

/** Endpoint-only bounding box. Curve control points can bulge past it, but
 *  Material's paths never place an endpoint outside the grid. */
function bounds(d: string) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0,
    x = 0,
    y = 0,
    sx = 0,
    sy = 0,
    cmd = '';
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const mark = () => {
    box.minX = Math.min(box.minX, x);
    box.maxX = Math.max(box.maxX, x);
    box.minY = Math.min(box.minY, y);
    box.maxY = Math.max(box.maxY, y);
  };
  const n = () => parseFloat(toks[i++]);
  const step = (dx: number, dy: number, rel: boolean) => {
    x = rel ? x + dx : dx;
    y = rel ? y + dy : dy;
  };

  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case 'M':
        step(n(), n(), rel);
        sx = x;
        sy = y;
        mark();
        cmd = rel ? 'l' : 'L'; // implicit lineto for repeated pairs
        break;
      case 'L':
      case 'T':
        step(n(), n(), rel);
        mark();
        break;
      case 'H':
        x = rel ? x + n() : n();
        mark();
        break;
      case 'V':
        y = rel ? y + n() : n();
        mark();
        break;
      case 'C':
        (n(), n(), n(), n());
        step(n(), n(), rel);
        mark();
        break;
      case 'S':
      case 'Q':
        (n(), n());
        step(n(), n(), rel);
        mark();
        break;
      case 'A':
        (n(), n(), n(), n(), n());
        step(n(), n(), rel);
        mark();
        break;
      case 'Z':
        x = sx;
        y = sy;
        break;
      default:
        i = toks.length;
    }
  }
  return box;
}

describe('BaseIcons', () => {
  it.each(Object.entries(BaseIcons))('%s is a well-formed SVG data URI', (_name, uri) => {
    expect(uri).toMatch(/^data:image\/svg\+xml[,;]/);
    const svg = decode(uri);
    expect(svg).toMatch(/^\s*<svg[\s\S]*<\/svg>\s*$/);
    expect(svg).toContain('viewBox');
  });

  it.each(gridIcons)('%s sits on the shared %s grid', (_name, uri) => {
    expect(decode(uri)).toContain(`viewBox='${GRID}'`);
  });

  it.each(gridIcons)('%s has valid path data inside the grid', (_name, uri) => {
    const svg = decode(uri);
    const paths = [...svg.matchAll(/ d='([^']*)'/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);

    for (const d of paths) {
      // Anything outside the SVG path grammar means corrupted data.
      expect(d).not.toMatch(/[^\sMmLlHhVvCcSsQqTtAaZz0-9eE.,+-]/);

      const { minX, minY, maxX, maxY } = bounds(d);
      expect(minX).toBeGreaterThanOrEqual(0);
      expect(maxX).toBeLessThanOrEqual(960);
      expect(minY).toBeGreaterThanOrEqual(-960);
      expect(maxY).toBeLessThanOrEqual(0);
    }
  });

  it('keeps every icon name that shipped before the Material Symbols set', () => {
    // Removing one of these silently blanks an icon in consuming apps, since
    // `uni-icon` renders nothing for an unknown name.
    const shipped = [
      'alertCircle',
      'calendar',
      'checkCircle',
      'chevronUp',
      'chevronDown',
      'chevronLeft',
      'chevronRight',
      'xCircle',
      'search',
      'close',
      'spinner',
    ];
    expect(Object.keys(BaseIcons)).toEqual(expect.arrayContaining(shipped));
  });

  it('keeps the spinner animated', () => {
    // The spinner is the one glyph carrying its own keyframes; a regeneration
    // that overwrote it with a static Material glyph would lose the animation.
    expect(decode(BaseIcons.spinner)).toContain('@keyframes');
  });
});
