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
 * content (the one place colors are supposed to live), and hex passed as
 * generation *input* (a seed is engine input, not a style).
 */
import { describe, expect, it } from 'vitest';
import index from '../data/uni-index.json' with { type: 'json' };
import { formatGeneratedTheme } from './generate.js';

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

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
    for (const component of index.components) {
      for (const example of component.examples ?? []) {
        findHex(`${component.id} · example "${example.title}"`, example.code, violations);
      }
    }
    expect(violations).toEqual([]);
  });

  it('component API metadata and guidelines are hex-free', () => {
    const violations: Violation[] = [];
    for (const component of index.components) {
      findHex(`${component.id} · bindings`, JSON.stringify(component.bindings), violations);
      findHex(`${component.id} · guidelines`, JSON.stringify(component.guidelines), violations);
      findHex(`${component.id} · summary/description`, `${component.summary} ${component.description}`, violations);
    }
    expect(violations).toEqual([]);
  });

  it('generate-uni-theme guidance is hex-free outside the theme file itself', () => {
    const output = formatGeneratedTheme({ brand: '#0052FF', name: 'Acme', shape: 'modern' });
    // The fenced code blocks are the generated uni-theme.ts and provider
    // snippet — the theme file legitimately holds every color. Everything
    // outside the fences is guidance agents will imitate.
    const guidance = output.replace(/```[\s\S]*?```/g, '');
    expect(guidance.match(HEX)).toBeNull();
  });
});
