/**
 * AI tool integrity (PRD §5.3/§7.3): everything the MCP *teaches* agents —
 * example snippets, component API metadata, guidelines, and tool guidance —
 * must reference semantic tokens, never raw hex colors. Agents reproduce the
 * patterns they're shown; one hardcoded hex in the corpus becomes hardcoded
 * hex in every app whose AI copied it. Because examples are extracted from
 * Storybook stories, a violation here points at the offending story.
 *
 * Deliberately out of scope: token *values* in the index (color tokens are
 * hex by nature — that's data, not example code), the generated theme-file
 * content (the one place colors are supposed to live), the theme payload the
 * runtime theme tools return (same reason — it *is* the theme), hex passed
 * as generation *input* (a seed is engine input, not a style), and the
 * components in CONTENT_COLOR_COMPONENTS below, whose hex is the content they
 * display rather than a style.
 */
import { describe, expect, it } from 'vitest';
import index from '../data/uni-index.json' with { type: 'json' };
import { formatGeneratedTheme } from './generate.js';
import { buildGeneratedTheme, summarizeEnvelope } from './theme-json.js';

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/**
 * Components whose job is to show or read a color the app supplies. A hex in
 * their examples and docs is the value being displayed (`hex="#434C5A"` on a
 * swatch, the eyedropper's "Sampled #434C5A" announcement) — content, like the
 * text in a label — so the rule does not apply to them. Add a component here
 * only when its hex is data in that sense; anything that *styles* with a hex
 * still belongs on a theme token.
 */
const CONTENT_COLOR_COMPONENTS = new Set(['color-swatch', 'eyedropper']);

const taughtComponents = index.components.filter(
  (component) => !CONTENT_COLOR_COMPONENTS.has(component.id)
);

interface Violation {
  where: string;
  hexes: string[];
}

const findHex = (where: string, text: string | undefined, out: Violation[]): void => {
  const matches = (text ?? '').match(HEX);
  if (matches) out.push({ where, hexes: [...new Set(matches)] });
};

describe('MCP teaching corpus contains no raw hex colors', () => {
  it('example snippets style through tokens only', () => {
    const violations: Violation[] = [];
    for (const component of taughtComponents) {
      for (const example of component.examples ?? []) {
        findHex(`${component.id} · example "${example.title}"`, example.code, violations);
      }
    }
    expect(violations).toEqual([]);
  });

  it('component API metadata and guidelines are hex-free', () => {
    const violations: Violation[] = [];
    for (const component of taughtComponents) {
      findHex(`${component.id} · bindings`, JSON.stringify(component.bindings), violations);
      findHex(`${component.id} · guidelines`, JSON.stringify(component.guidelines), violations);
      findHex(`${component.id} · summary/description`, `${component.summary} ${component.description}`, violations);
    }
    expect(violations).toEqual([]);
  });

  it('exempts only components that exist', () => {
    // A renamed or removed component must not leave a stale exemption behind.
    const ids = new Set(index.components.map((component) => component.id));
    expect([...CONTENT_COLOR_COMPONENTS].filter((id) => !ids.has(id))).toEqual([]);
  });

  it('generate-uni-theme guidance is hex-free outside the theme file itself', () => {
    const output = formatGeneratedTheme({ brand: '#0052FF', name: 'Acme', shape: 'modern' });
    // The fenced code blocks are the generated uni-theme.ts and provider
    // snippet — the theme file legitimately holds every color. Everything
    // outside the fences is guidance agents will imitate.
    const guidance = output.replace(/```[\s\S]*?```/g, '');
    expect(guidance.match(HEX)).toBeNull();
  });

  it('runtime theme guidance is hex-free outside the theme payload', () => {
    const result = buildGeneratedTheme({ brand: '#0052FF', name: 'Acme', shape: 'modern' });
    if (!result.ok) throw new Error(result.error);
    const { themes, ...envelope } = result.envelope;

    // JSON output has no code fences to carve out, so scope the rule to what
    // agents actually read and imitate: the apply snippet, the icon-hydration
    // note, the contrast summary and its named token pairs. `themes` holds the
    // theme data itself and is exempt for the same reason the file above is.
    findHexIn(JSON.stringify(envelope));
    findHexIn(summarizeEnvelope(result.envelope));
  });
});

/** Assert a hex-free string, reporting the offenders when it isn't. */
function findHexIn(text: string): void {
  expect(text.match(HEX)).toBeNull();
}
