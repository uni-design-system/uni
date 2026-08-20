/**
 * The runtime theme path's contract: what leaves the server must be a theme
 * the consumer's own validator accepts, small enough to be worth sending, and
 * losslessly restorable to a full theme.
 */
import { describe, expect, it } from 'vitest';
import { BaseIcons, hydrateTheme, parseTheme } from '@uni-design-system/uni-core';
import {
  buildDtcgTokens,
  buildGeneratedTheme,
  buildStoredTheme,
  listRuntimeThemes,
  summarizeEnvelope,
  type BuildResult,
} from './theme-json.js';

const unwrap = (result: BuildResult) => {
  if (!result.ok) throw new Error(`expected success, got: ${result.error}`);
  return result.envelope;
};

describe('generate-runtime-theme', () => {
  const env = unwrap(buildGeneratedTheme({ brand: '#0052FF', name: 'Acme', shape: 'sharp' }));

  it('returns a registration-ready light + dark pair', () => {
    expect(env.themes.map((t) => [t.id, t.mode])).toEqual([
      ['AcmeLight', 'light'],
      ['AcmeDark', 'dark'],
    ]);
  });

  it('every theme passes the consumer-side validator after a JSON round-trip', () => {
    for (const { theme } of env.themes) {
      const revived = JSON.parse(JSON.stringify(theme));
      expect(parseTheme(revived).issues).toEqual([]);
    }
  });

  it('elides the built-in icons and restores them on hydration', () => {
    const [{ theme }] = env.themes;
    expect(theme.icons).toEqual({});
    expect(Object.keys(hydrateTheme(theme).icons)).toHaveLength(Object.keys(BaseIcons).length);
  });

  it('stays under the payload budget that elision buys', () => {
    // A theme carrying BaseIcons serializes to ~50 KB (~12.5k tokens) — this
    // guard fails loudly if the icon set ever creeps back into the wire form.
    for (const { id, theme } of env.themes) {
      expect(JSON.stringify(theme).length, `${id} payload`).toBeLessThan(20_000);
    }
  });

  it('reports the WCAG audit with token names, not hex', () => {
    expect(env.contrast?.summary).toMatch(/contrast pairs checked/);
    expect(typeof env.contrast?.pass).toBe('boolean');
    for (const pair of env.contrast?.failing ?? []) {
      expect(pair.foreground).not.toMatch(/^#/);
    }
  });

  it('honors darkMode: false', () => {
    const light = unwrap(buildGeneratedTheme({ brand: '#0052FF', darkMode: false }));
    expect(light.themes).toHaveLength(1);
    expect(light.themes[0].mode).toBe('light');
  });

  it('rejects malformed brand colors the same way the file tool does', () => {
    const result = buildGeneratedTheme({ brand: 'nope' });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/Invalid brand color/);
  });

  it('accepts seeds with or without the leading #', () => {
    expect(buildGeneratedTheme({ brand: '0052FF' }).ok).toBe(true);
  });
});

describe('get-runtime-theme', () => {
  it('serves a built-in theme as a validated, elided theme', () => {
    const env = unwrap(buildStoredTheme('LightTheme'));
    expect(env.themes).toHaveLength(1);
    expect(env.themes[0].id).toBe('LightTheme');
    expect(parseTheme(JSON.parse(JSON.stringify(env.themes[0].theme))).success).toBe(true);
    expect(env.themes[0].theme.icons).toEqual({});
  });

  it('omits the contrast report for themes it did not generate', () => {
    expect(unwrap(buildStoredTheme('DarkTheme')).contrast).toBeUndefined();
  });

  it('reports the available ids when asked for an unknown theme', () => {
    const result = buildStoredTheme('Nope');
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain('LightTheme');
  });

  it('lists every shipped theme with its mode', () => {
    expect(listRuntimeThemes()).toEqual([
      { id: 'LightTheme', name: 'Light Theme', mode: 'light' },
      { id: 'DarkTheme', name: 'Dark Theme', mode: 'dark' },
    ]);
  });
});

describe('summarizeEnvelope', () => {
  it('orients without duplicating the payload', () => {
    const env = unwrap(buildGeneratedTheme({ brand: '#0052FF', name: 'Acme' }));
    const summary = summarizeEnvelope(env);

    expect(summary).toContain('AcmeLight');
    expect(summary).toContain('registerTheme');
    // The point of the structured result: the themes are not re-serialized here.
    expect(summary.length).toBeLessThan(2_000);
    expect(summary).not.toContain('"typography"');
  });
});

describe('export-dtcg-tokens', () => {
  it('emits DTCG color and dimension tokens for a built-in theme', () => {
    const result = buildDtcgTokens('LightTheme');
    if (!result.ok) throw new Error(result.error);

    const tokens = JSON.parse(result.json);
    expect(tokens.color['primary'].$type).toBe('color');
    expect(typeof tokens.color['primary'].$value).toBe('string');
    expect(Object.keys(tokens.size.radius).length).toBeGreaterThan(0);
    expect(Object.keys(tokens.size.spacing).length).toBeGreaterThan(0);
    expect(Object.values<{ $type: string }>(tokens.size.spacing).every((t) => t.$type === 'dimension')).toBe(true);
  });

  it('reports unknown ids with the available list', () => {
    const result = buildDtcgTokens('NopeTheme');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('LightTheme');
  });
});
