#!/usr/bin/env node
/**
 * Generates `src/concepts/iconography/icon.records.ts` — the `BaseIcons` set
 * shipped with every theme — from the canonical Material Symbols source.
 *
 * Icons are rendered by `uni-icon` as a CSS mask over `currentColor`, so each
 * one is stored as an inline SVG data URI. Every glyph is pulled at the same
 * family and weight on the same `0 -960 960 960` grid, which is what keeps the
 * set at one optical weight — the previous hand-assembled set mixed four grids.
 *
 * Regenerate with: pnpm icons:generate
 * Verify without writing: pnpm icons:generate --check  (CI drift check)
 *
 * Every fetched glyph is validated before anything is written: a malformed
 * path, an off-grid viewBox or geometry outside the grid aborts the run rather
 * than shipping a broken icon. `src/concepts/iconography/icon.records.spec.ts`
 * asserts the same invariants against the committed file.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import prettier from 'prettier';

// --- configuration ---------------------------------------------------------

/**
 * Material Symbols family and weight. Weight 300 reads clearly from 16px up
 * and in ghost buttons; 100/200 thin out badly at small sizes. Other valid
 * combinations: `materialsymbolsrounded`, and weights `wght100`–`wght700`
 * (`default` is 400).
 */
const FAMILY = 'materialsymbolsoutlined';
const WEIGHT = 'wght300';

const GRID = '0 -960 960 960';

/**
 * The set, grouped by intent — group labels become section comments in the
 * generated file. Keys are the flat camelCase names themes and components use
 * (`<uni-icon name="chevronDown" />`); values are Material Symbols glyph names.
 *
 * Renaming a key is a breaking change: `uni-icon` renders nothing for an
 * unknown name, so a rename silently blanks the icon in consuming apps.
 */
const GROUPS = [
  [
    'Navigation & layout',
    {
      menu: 'menu',
      chevronUp: 'keyboard_arrow_up',
      chevronDown: 'keyboard_arrow_down',
      chevronLeft: 'chevron_left',
      chevronRight: 'chevron_right',
      arrowLeft: 'arrow_back',
      arrowRight: 'arrow_forward',
      home: 'home',
      externalLink: 'open_in_new',
    },
  ],
  [
    'Actions & controls',
    {
      search: 'search',
      close: 'close',
      plus: 'add',
      minus: 'remove',
      more: 'more_vert',
      delete: 'delete',
      edit: 'edit',
      download: 'download',
      upload: 'upload',
      share: 'share',
      filter: 'filter_list',
    },
  ],
  [
    'Status & feedback',
    {
      check: 'check',
      checkCircle: 'check_circle',
      xCircle: 'cancel',
      alertCircle: 'error',
      info: 'info',
      warning: 'warning',
      lock: 'lock',
    },
  ],
  [
    'User & system',
    {
      profile: 'person',
      settings: 'settings',
      notification: 'notifications',
      favorite: 'favorite',
      help: 'help',
      calendar: 'calendar_month',
    },
  ],
];

/**
 * Icons kept verbatim from the existing file rather than fetched. The spinner
 * carries its own `@keyframes` and has no Material Symbols equivalent, so a
 * regeneration must not overwrite it.
 */
const PRESERVED = ['spinner'];

const OUT = new URL('../src/concepts/iconography/icon.records.ts', import.meta.url).pathname;

// --- fetching --------------------------------------------------------------

const url = (glyph) =>
  `https://fonts.gstatic.com/s/i/short-term/release/${FAMILY}/${glyph}/${WEIGHT}/24px.svg`;

async function fetchGlyph(glyph, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url(glyph));
      if (res.ok) return await res.text();
      // A 404 means the glyph name or family/weight combination is wrong;
      // retrying will not help.
      if (res.status === 404) throw new Error(`not found — check the glyph name and ${WEIGHT}`);
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (/not found/.test(err.message)) break;
    }
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  throw new Error(`${glyph}: ${lastErr.message}\n  ${url(glyph)}`);
}

// --- validation ------------------------------------------------------------

/**
 * Endpoint-only bounding box. Curve control points may bulge past it, but
 * Material's paths never place an endpoint outside the grid, so an endpoint
 * out of bounds means corrupted data.
 */
function bounds(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = '';
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const mark = () => {
    box.minX = Math.min(box.minX, x);
    box.maxX = Math.max(box.maxX, x);
    box.minY = Math.min(box.minY, y);
    box.maxY = Math.max(box.maxY, y);
  };
  const n = () => parseFloat(toks[i++]);
  const step = (dx, dy, rel) => {
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
        cmd = rel ? 'l' : 'L'; // repeated pairs after a moveto are linetos
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

function validate(name, svg) {
  const fail = (msg) => {
    throw new Error(`${name}: ${msg}`);
  };

  if (!/^\s*<svg[\s\S]*<\/svg>\s*$/.test(svg)) fail('response is not a complete <svg> document');

  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (viewBox !== GRID) fail(`viewBox is "${viewBox}", expected "${GRID}"`);

  const paths = [...svg.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);
  if (!paths.length) fail('no path data');

  for (const d of paths) {
    const bad = d.match(/[^\sMmLlHhVvCcSsQqTtAaZz0-9eE.,+-]+/);
    if (bad) fail(`invalid character(s) in path data: ${JSON.stringify(bad[0])}`);

    const { minX, minY, maxX, maxY } = bounds(d);
    if (minX < 0 || maxX > 960 || minY < -960 || maxY > 0) {
      fail(`geometry outside the grid: x [${minX}, ${maxX}], y [${minY}, ${maxY}]`);
    }
  }
}

// --- encoding --------------------------------------------------------------

// These mirror `svgToIconUri` in src/concepts/iconography/icon.helper.ts — the
// public helper brand teams use for their own SVGs. They are duplicated rather
// than imported because this script must run without a prior build (the helper
// is TypeScript, and importing from dist/ would make generation depend on the
// very package it generates). The duplication is not trusted: the helper's spec
// asserts `svgToIconUri` reproduces every committed BaseIcon byte-for-byte, so
// any drift between the two fails the test suite.

/** Strip the fixed pixel size so the mask scales to whatever box it's given. */
const normalize = (svg) =>
  svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim();

/**
 * Percent-encodes only what a data URI requires, and switches SVG attributes
 * to single quotes so the emitted TypeScript string needs no escapes. Far more
 * readable (and smaller) than base64.
 */
const toDataUri = (svg) =>
  'data:image/svg+xml,' +
  normalize(svg)
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3c')
    .replace(/>/g, '%3e');

// --- emit ------------------------------------------------------------------

/** Pull hand-authored icons out of the current file so they survive a run. */
function readPreserved() {
  const existing = readFileSync(OUT, 'utf8');
  return PRESERVED.map((name) => {
    const value = existing.match(
      new RegExp(`^ {2}${name}:\\s*\\n?\\s*"([\\s\\S]*?)",\\n`, 'm')
    )?.[1];
    if (!value) {
      throw new Error(
        `cannot preserve "${name}": not found in ${OUT}. ` +
          `Remove it from PRESERVED or restore it before regenerating.`
      );
    }
    return [name, value];
  });
}

async function main() {
  const check = process.argv.includes('--check');
  const preserved = readPreserved();

  const fetched = [];
  for (const [label, entries] of GROUPS) {
    const svgs = await Promise.all(
      Object.entries(entries).map(async ([name, glyph]) => {
        const svg = await fetchGlyph(glyph);
        validate(name, svg);
        return [name, toDataUri(svg)];
      })
    );
    fetched.push([label, svgs]);
  }

  let body = '';
  for (const [label, entries] of fetched) {
    body += `  // ${label}\n`;
    // Double-quoted: the URIs use single quotes internally, so this stays
    // escape-free — and it is what prettier settles on anyway.
    for (const [name, uri] of entries) body += `  ${name}:\n    "${uri}",\n`;
    body += '\n';
  }
  body += '  // Hand-authored: animated, no Material Symbols equivalent\n';
  for (const [name, uri] of preserved) body += `  ${name}:\n    "${uri}",\n`;

  const style = FAMILY.replace('materialsymbols', '');
  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1);

  const source = `import type { Icons } from '../theme/theme.model';

/**
 * Default icon primitives shipped with every theme. Each icon is an inline
 * SVG data URI rendered as a CSS mask over \`currentColor\`, so icons recolor
 * with the theme automatically. \`createTheme\` merges a theme's own \`icons\`
 * over this set — add or override under any name; components render them by
 * token via \`uni-icon\`, never by inlining SVG.
 *
 * The set is Material Symbols ${styleLabel} at weight ${WEIGHT.replace('wght', '')}, normalized to a
 * single \`${GRID}\` grid so every glyph shares one optical weight.
 *
 * Generated by scripts/generate-icons.mjs (pnpm icons:generate). Do not edit
 * by hand — add or change icons in that script's manifest and regenerate.
 */
export const BaseIcons = {
${body}} satisfies Icons;

/** Names guaranteed present on every theme. */
export type BaseIconName = keyof typeof BaseIcons;

/**
 * An icon name. Autocompletes the built-in set while still allowing any name a
 * theme registers through \`createTheme({ icons })\`.
 */
export type IconName = BaseIconName | (string & {});
`;

  const formatted = await prettier.format(source, {
    ...(await prettier.resolveConfig(OUT)),
    filepath: OUT,
  });

  const count = fetched.reduce((a, [, e]) => a + e.length, 0) + preserved.length;

  if (check) {
    if (readFileSync(OUT, 'utf8') === formatted) {
      console.log(`icon.records.ts is up to date (${count} icons)`);
      return;
    }
    console.error(
      `icon.records.ts is out of date — run \`pnpm icons:generate\` and commit the result.`
    );
    process.exit(1);
  }

  writeFileSync(OUT, formatted);
  console.log(`Wrote ${OUT} (${count} icons, ${FAMILY}/${WEIGHT})`);
}

main().catch((err) => {
  console.error(`\nIcon generation failed — nothing written.\n${err.message}\n`);
  process.exit(1);
});
