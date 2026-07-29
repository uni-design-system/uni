import { describe, expect, it } from 'vitest';
import { BaseIcons, svgToIconUri } from '@uni-design-system/uni-core';
import { formatIconTokens } from './icons.js';

const svg = (inner: string, viewBox = '0 0 24 24') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;

const mark = (fill = '#111') => svg(`<path fill="${fill}" d="M4 4h16v16H4z"/>`);

describe('formatIconTokens', () => {
  it('returns a paste-ready icons map', () => {
    const out = formatIconTokens([{ name: 'acmeLogo', svg: mark() }]);

    expect(out).toContain('1 of 1 encoded');
    expect(out).toContain('const icons: Icons = {');
    expect(out).toContain('acmeLogo: "data:image/svg+xml,');
    // The value must match what the library helper produces, or brand icons
    // would encode differently from the built-in set.
    expect(out).toContain(svgToIconUri(mark()));
  });

  it('converts names to the flat camelCase convention and says so', () => {
    const out = formatIconTokens([
      { name: 'acme-logo.svg', svg: mark() },
      { name: 'Brand Shield', svg: mark() },
    ]);

    expect(out).toContain('acmeLogo: "data:');
    expect(out).toContain('brandShield: "data:');
    expect(out).toContain('`acme-logo.svg` → `acmeLogo`');
    expect(out).toContain('`Brand Shield` → `brandShield`');
  });

  it('reports which names override built-in icons', () => {
    const out = formatIconTokens([{ name: 'search', svg: mark() }]);
    expect(out).toMatch(/Overrides a built-in icon: `search`/);
  });

  it('does not claim an override for a genuinely new name', () => {
    const out = formatIconTokens([{ name: 'acmeLogo', svg: mark() }]);
    expect(out).not.toContain('Overrides a built-in icon');
  });

  it('rejects unusable artwork per-icon without failing the whole batch', () => {
    const out = formatIconTokens([
      { name: 'good', svg: mark() },
      {
        name: 'twoColor',
        svg: svg('<path fill="#E8112D" d="M0 0h1v1H0z"/><circle fill="#0052FF" r="4"/>'),
      },
      {
        name: 'noViewBox',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24"><path d="M0 0h1v1H0z"/></svg>',
      },
    ]);

    expect(out).toContain('1 of 3 encoded');
    expect(out).toContain('good: "data:');
    // The survivor is still emitted…
    expect(out).toContain('## Not encoded');
    expect(out).toMatch(/- `twoColor` — paints in 2 colors/);
    expect(out).toMatch(/- `noViewBox` — no viewBox/);
    // …and the failure reason is not prefixed with the name twice.
    expect(out).not.toContain('twoColor: paints');
  });

  it("points a rejected multi-color icon at this tool's option, not the library helper's", () => {
    const out = formatIconTokens([
      {
        name: 'brandMark',
        svg: svg('<path fill="#E8112D" d="M0 0h1v1H0z"/><circle fill="#0052FF" r="4"/>'),
      },
    ]);
    expect(out).toContain('Set `allowMultiColor: true` on `brandMark`');
    // The library-facing phrasing would be un-actionable through MCP.
    expect(out).not.toContain('Pass { allowMultiColor: true }');
  });

  it('encodes multi-color artwork when the caller opts in', () => {
    const two = svg('<path fill="#E8112D" d="M0 0h1v1H0z"/><circle fill="#0052FF" r="4"/>');
    const out = formatIconTokens([{ name: 'brandMark', svg: two, allowMultiColor: true }]);
    expect(out).toContain('1 of 1 encoded');
    expect(out).toContain('brandMark: "data:');
    expect(out).not.toContain('## Not encoded');
  });

  it('warns when a set mixes viewBox grids', () => {
    const out = formatIconTokens([
      { name: 'a', svg: mark() },
      { name: 'b', svg: svg('<path fill="#111" d="M0 0h8v8H0z"/>', '0 0 32 32') },
    ]);
    expect(out).toMatch(/Mixed viewBox grids \(`0 0 24 24`, `0 0 32 32`\)/);
    expect(out).toContain('optical weight');
  });

  it('stays quiet about grids when the set is internally consistent', () => {
    const out = formatIconTokens([
      { name: 'a', svg: mark() },
      { name: 'b', svg: mark('#222') },
    ]);
    expect(out).not.toContain('Mixed viewBox grids');
  });

  it('flags a grid mismatch against the built-in set only when overriding one', () => {
    const overriding = formatIconTokens([{ name: 'close', svg: mark() }]);
    expect(overriding).toMatch(/built-in set uses `0 -960 960 960`/);

    // A brand-only name on its own grid is nobody's problem.
    const additive = formatIconTokens([{ name: 'acmeLogo', svg: mark() }]);
    expect(additive).not.toContain('built-in set uses');
  });

  it('is idempotent — an already-encoded data URI passes through unchanged', () => {
    const once = formatIconTokens([{ name: 'acmeLogo', svg: mark() }]);
    const uri = once.match(/acmeLogo: "([^"]+)"/)![1];

    const twice = formatIconTokens([{ name: 'acmeLogo', svg: uri }]);
    expect(twice).toContain(`acmeLogo: "${uri}"`);
    expect(twice).toContain('1 of 1 encoded');
  });

  it('round-trips a built-in icon back to itself', () => {
    const out = formatIconTokens([{ name: 'chevronDown', svg: BaseIcons.chevronDown }]);
    expect(out).toContain(`chevronDown: "${BaseIcons.chevronDown}"`);
  });

  it('always states the monochrome constraint', () => {
    expect(formatIconTokens([{ name: 'a', svg: mark() }])).toContain('monochrome');
  });

  it('lists the built-in icons so redundant tokens are caught before they are added', () => {
    // Apps hand-draw their own close/check/plus constantly. The tool cannot
    // recognise the shape, so it has to hand the caller the list to check
    // against — otherwise a migration silently duplicates the built-in set.
    const out = formatIconTokens([{ name: 'myClose', svg: mark() }]);

    expect(out).toContain('already built in');
    for (const name of ['check', 'close', 'plus', 'search', 'download', 'warning']) {
      expect(out).toContain(name);
    }
    expect(out).toMatch(/use `<uni-icon name="…" \/>` with the\s*built-in name/);
  });

  it('omits the built-in check when nothing encoded', () => {
    const out = formatIconTokens([{ name: 'broken', svg: '<div>nope</div>' }]);
    expect(out).not.toContain('already built in');
  });

  it('guides the caller when handed nothing', () => {
    expect(formatIconTokens([])).toContain('No icons supplied');
  });
});
