import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { contrastRatio, hexToRgb } from '../color/color.helper';
import { generatePalette } from '../color/color.factory';
import { createTheme, lightColors } from '../theme/themes/base.theme';
import { hexToOklch, oklchToHex } from './oklch.helper';
import { classifyScheme, generateThemes, generateUniThemes, ShapeRadii } from './theme.generator';
import { emitThemeFile } from './theme-file.emitter';
import { emitDtcgTokens } from './dtcg.emitter';

// Uniform seed corpus: hue sweep × lightness × chroma extremes (PRD §7.3
// requires ≥ 1,000). Out-of-gamut combinations gamut-map to valid hexes,
// which is exactly the kind of extreme seed the guard-rail must survive.
const corpus: string[] = [];
for (let h = 0; h < 360; h += 4) {
  for (const l of [0.25, 0.45, 0.65, 0.85]) {
    for (const c of [0.02, 0.12, 0.28]) {
      corpus.push(oklchToHex({ l, c, h }));
    }
  }
}

describe('oklch conversion', () => {
  it('round-trips hex → OKLCH → hex within 1 bit per channel', () => {
    for (const hex of corpus) {
      const back = oklchToHex(hexToOklch(hex));
      const a = hexToRgb(hex);
      const b = hexToRgb(back);
      expect(Math.abs(a.red - b.red), `red drift for ${hex}`).toBeLessThanOrEqual(1);
      expect(Math.abs(a.green - b.green), `green drift for ${hex}`).toBeLessThanOrEqual(1);
      expect(Math.abs(a.blue - b.blue), `blue drift for ${hex}`).toBeLessThanOrEqual(1);
    }
  });

  it('preserves perceptual anchors (white, black, mid grey)', () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe('#FFFFFF');
    expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe('#000000');
    expect(hexToOklch('#FFFFFF').l).toBeCloseTo(1, 3);
    expect(hexToOklch('#000000').l).toBeCloseTo(0, 3);
  });

  it('gamut-maps out-of-range chroma without hue drift', () => {
    const vivid = hexToOklch(oklchToHex({ l: 0.6, c: 0.5, h: 145 }));
    expect(Math.abs(vivid.h - 145)).toBeLessThan(2);
  });
});

describe('generateThemes', () => {
  it('is deterministic — identical input, identical output', () => {
    const input = { seed: '#0052FF', vibe: 'jewel', shape: 'modern' } as const;
    expect(JSON.stringify(generateThemes(input))).toBe(JSON.stringify(generateThemes(input)));
  });

  it('emits every token the shipped BaseTheme emits', () => {
    const { lightColors: generated, darkColors } = generateThemes({ seed: '#0052FF' });
    const baseKeys = Object.keys(lightColors);
    for (const key of baseKeys) {
      expect(generated[key], `light missing '${key}'`).toBeDefined();
      expect(darkColors[key], `dark missing '${key}'`).toBeDefined();
    }
  });

  it('reports a passing WCAG audit for every corpus seed in both modes', () => {
    for (const seed of corpus) {
      const { report } = generateThemes({ seed });
      const failures = report.checks.filter((check) => !check.pass);
      expect(
        failures,
        `${seed}: ${failures
          .map((f) => `${f.mode} ${f.foreground}/${f.background} ${f.ratio} < ${f.required}`)
          .join(', ')}`
      ).toEqual([]);
      expect(report.pass).toBe(true);
    }
  });

  it('honors the seed hue in the primary token', () => {
    for (const seed of ['#0052FF', '#C2185B', '#00695C', '#F57F17']) {
      const { lightColors: generated } = generateThemes({ seed });
      const seedHue = hexToOklch(seed).h;
      const primaryHue = hexToOklch(generated.primary!).h;
      const drift = Math.abs(seedHue - primaryHue) % 360;
      expect(Math.min(drift, 360 - drift), `hue drift for ${seed}`).toBeLessThan(6);
    }
  });

  it('emits an AA-safe seed nearly verbatim as the light primary', () => {
    // #4F46E5 already passes 4.5:1 on the generated background, so the
    // guard-rail must not touch it (± round-trip precision).
    const { lightColors: generated } = generateThemes({ seed: '#4F46E5' });
    const seed = hexToRgb('#4F46E5');
    const out = hexToRgb(generated.primary!);
    expect(Math.abs(seed.red - out.red)).toBeLessThanOrEqual(1);
    expect(Math.abs(seed.green - out.green)).toBeLessThanOrEqual(1);
    expect(Math.abs(seed.blue - out.blue)).toBeLessThanOrEqual(1);
  });

  it('keeps semantic inks vivid, not muddy, in light mode', () => {
    // Guard against bronze/brown drift: warn must sit on the orange side of
    // amber (dark yellow reads brown) and error/warn must keep real chroma
    // even after the AA guard-rail darkens them for use as ink on white.
    const { lightColors: generated } = generateThemes({ seed: '#4F46E5' });
    const warn = hexToOklch(generated.warn!);
    expect(warn.h).toBeGreaterThan(45);
    expect(warn.h).toBeLessThan(65);
    expect(warn.c).toBeGreaterThan(0.13);
    expect(hexToOklch(generated.error!).c).toBeGreaterThan(0.15);
  });

  it('caps dark-mode accent chroma to avoid neon vibration', () => {
    const { darkColors } = generateThemes({ seed: '#FF0044', vibe: 'florescent' });
    for (const token of ['primary', 'secondary', 'tertiary'] as const) {
      expect(hexToOklch(darkColors[token]!).c).toBeLessThanOrEqual(0.17);
    }
  });

  it('keeps dark surfaces off pure black and tinted toward the brand hue', () => {
    const { darkColors } = generateThemes({ seed: '#0052FF' });
    expect(darkColors.background).not.toBe('#000000');
    expect(hexToOklch(darkColors.background!).l).toBeGreaterThan(0.1);
  });

  it('emits radii only when a shape is requested', () => {
    expect(generateThemes({ seed: '#0052FF' }).radii).toBeUndefined();
    expect(generateThemes({ seed: '#0052FF', shape: 'playful' }).radii).toEqual(ShapeRadii.playful);
  });

  it('meets the ≤ 15 ms generation budget', () => {
    generateThemes({ seed: '#0052FF' }); // warm-up
    const runs = 25;
    const start = performance.now();
    for (let i = 0; i < runs; i++) generateThemes({ seed: '#0052FF', shape: 'modern' });
    expect((performance.now() - start) / runs).toBeLessThan(15);
  });
});

describe('classifyScheme', () => {
  it('classifies hue relationships', () => {
    expect(classifyScheme(10, [12])).toBe('monochromatic');
    expect(classifyScheme(10, [40, 60])).toBe('analogous');
    expect(classifyScheme(10, [190])).toBe('complimentary');
    expect(classifyScheme(10, [155, 225])).toBe('splitComplimentary');
    expect(classifyScheme(10, [130, 250])).toBe('triadic');
  });
});

describe('generateUniThemes', () => {
  it('returns registration-ready themes with derived borders and components', () => {
    const { light, dark } = generateUniThemes({ seed: '#0052FF', name: 'Acme', shape: 'sharp' });
    expect(light.id).toBe('AcmeLight');
    expect(dark.id).toBe('AcmeDark');
    expect(light.radii).toEqual(ShapeRadii.sharp);
    expect(light.borders.primary).toContain(light.colors.primary);
    expect(light.components.button?.variants?.primary?.backgroundColor).toBe(light.colors.primary);
  });
});

describe('generateShadows (via generateThemes)', () => {
  it('tints light shadows toward the brand hue instead of neutral black', () => {
    const { lightShadows, lightColors: colors } = generateThemes({ seed: '#0052FF' });
    const rgb = lightShadows.raised!.match(/rgba\((\d+), (\d+), (\d+),/);
    expect(rgb).not.toBeNull();
    const [, r, g, b] = rgb!.map(Number);
    expect(`${r},${g},${b}`).not.toBe('0,0,0');
    // Blue seed → shadow ink leans blue.
    expect(b).toBeGreaterThan(r);
    expect(colors.primary).toBeDefined();
  });

  it('keeps dark shadows near-zero and tints the warn glow with the error color', () => {
    const { darkShadows, darkColors } = generateThemes({ seed: '#0052FF' });
    expect(darkShadows.raised).toBe('none');
    const { red } = hexToRgb(darkColors.error!);
    expect(darkShadows.warn).toContain(`rgba(${red}, `);
  });

  it('emits theme-scoped shadows into the static theme file', () => {
    const { content } = emitThemeFile({ seed: '#0052FF' });
    expect(content).toContain('const lightShadows: Shadows');
    expect(content).toContain('const darkShadows: Shadows');
    expect(content).toContain('shadows: lightShadows,');
  });
});

describe('emitDtcgTokens', () => {
  it('maps every color token and dimension scales into DTCG format', () => {
    const { lightColors: colors } = generateThemes({ seed: '#0052FF' });
    const tokens = emitDtcgTokens({ colors, radii: ShapeRadii.modern, spacing: { md: '16px' } });
    expect(tokens.color['primary']).toEqual({ $value: colors.primary, $type: 'color' });
    expect(tokens.color['on-surface-variant']).toBeDefined();
    expect(Object.keys(tokens.color).length).toBe(Object.keys(colors).length);
    expect(tokens.size.radius['md']).toEqual({ $value: '24px', $type: 'dimension' });
    expect(tokens.size.radius['none']).toBeUndefined(); // 'none' is not a dimension
    expect(tokens.size.spacing['md']).toEqual({ $value: '16px', $type: 'dimension' });
  });
});

describe('button token conformance', () => {
  it('drives button corner rounding from options tokens, not per-size pixels', () => {
    const theme = createTheme({ id: 'T', name: 'T', colors: lightColors });
    const options = theme.components.button?.options as { borderRadius: string };
    expect(options).toEqual({ borderRadius: 'max', typeface: 'button' });
    expect(theme.components.iconButton?.options).toEqual({ borderRadius: 'max' });
    for (const size of Object.values(theme.components.button?.sizes ?? {})) {
      expect(size).not.toHaveProperty('borderRadius');
    }
    // The token resolves through the theme's radii scale, so shape languages
    // restyle buttons: sharp → square, modern/playful → pill.
    expect(theme.radii[options.borderRadius]).toBe('999px');
    const sharp = createTheme({ id: 'S', name: 'S', colors: lightColors, radii: ShapeRadii.sharp });
    expect(sharp.radii[options.borderRadius]).toBe('0px');
  });

  it('drives button typography from the type scale, not hardcoded families', () => {
    const theme = createTheme({ id: 'T', name: 'T', colors: lightColors });
    const options = theme.components.button?.options as { typeface: string };
    // The typeface token resolves against the theme's typography, so the
    // `button` role (or any custom role) restyles labels without CSS edits.
    expect(theme.typography[options.typeface]).toBeDefined();
    expect(theme.typography[options.typeface].fontFamily).toBe('Red Hat Display');
    const fixed = theme.components.button?.fixed as Record<string, unknown>;
    expect(fixed).not.toHaveProperty('fontFamily');
    for (const size of Object.values(theme.components.button?.sizes ?? {})) {
      expect(size).not.toHaveProperty('fontFamily');
    }
  });
});

describe('card token conformance', () => {
  it('drives the card frame from tokens: variant-named borders, radii scale', () => {
    const theme = createTheme({ id: 'T', name: 'T', colors: lightColors });
    const options = theme.components.card?.options as { borderRadius: string };
    expect(options.borderRadius).toBe('xs');
    expect(theme.radii[options.borderRadius]).toBe('8px'); // classic card radius, now tokened
    const fixed = theme.components.card?.fixed as Record<string, unknown>;
    expect(fixed).not.toHaveProperty('borderRadius');
    expect(fixed).not.toHaveProperty('borderStyle');
    expect(fixed).not.toHaveProperty('borderWidth');
    // Variant-follow works because border primitives are named after variants.
    for (const variant of ['primary', 'secondary', 'tertiary', 'warn', 'success']) {
      expect(theme.borders[variant], `borders.${variant}`).toBeDefined();
    }
  });
});

describe('createTheme overrides', () => {
  it('deep-merges custom border primitives and component overrides over derived defaults', () => {
    const theme = createTheme({
      id: 'T',
      name: 'T',
      colors: lightColors,
      borders: { 'brush-stroke': '3px dashed #444' },
      components: { button: { variants: { secondary: { border: '3px dashed #444' } } } },
    });
    // New primitive lands; derived defaults survive.
    expect(theme.borders['brush-stroke']).toBe('3px dashed #444');
    expect(theme.borders.primary).toBe(`1px solid ${lightColors.primary}`);
    // Only the touched leaf changes; sibling variant keys and components survive.
    expect(theme.components.button?.variants?.secondary?.border).toBe('3px dashed #444');
    expect(theme.components.button?.variants?.secondary?.color).toBeDefined();
    expect(theme.components.button?.variants?.primary?.backgroundColor).toBe(lightColors.primary);
    expect(theme.components.input?.options).toBeDefined();
  });
});

describe('emitThemeFile', () => {
  it('is deterministic and emits every color token literally', () => {
    const input = { seed: '#0052FF', shape: 'modern', name: 'Acme' } as const;
    const a = emitThemeFile(input);
    expect(a.content).toBe(emitThemeFile(input).content);
    for (const key of Object.keys(lightColors)) {
      expect(a.content, `missing token '${key}'`).toContain(`${/^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`}:`);
    }
    expect(a.content).toContain('const borders = (colors: Colors): Borders');
    expect(a.content).toContain('export const AcmeLight');
    expect(a.content).toContain('export const AcmeDark');
    expect(a.content).toContain('export const AcmeThemes');
    expect(a.content).toContain('radii,');
    expect(a.providerSnippet).toContain('UNI_THEMES');
    expect(a.report.pass).toBe(true);
    // ng new's strict tsconfig sets noPropertyAccessFromIndexSignature, and
    // Colors has an index signature — dot access on `colors` breaks the build.
    expect(a.content).not.toMatch(/colors\.[a-z]/);
  });

  it('emits syntactically valid TypeScript', () => {
    const { content } = emitThemeFile({ seed: '#C2185B', name: 'Berry' });
    const out = ts.transpileModule(content, {
      reportDiagnostics: true,
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
    });
    expect(out.diagnostics).toEqual([]);
  });

  it('omits the dark theme when darkMode is false', () => {
    const { content } = emitThemeFile({ seed: '#0052FF', darkMode: false });
    expect(content).toContain('export const BrandLight');
    expect(content).not.toContain('BrandDark');
    expect(content).not.toContain('darkColors');
  });
});

describe('generatePalette (compat wrapper)', () => {
  it('keeps hard brand pins verbatim in light mode', () => {
    const colors = generatePalette({
      seed: '#4F46E5',
      scheme: 'triadic',
      category: 'neutral',
      brand: { primary: '#123456' },
    });
    expect(colors.primary).toBe('#123456');
  });

  it('lifts hard pins for dark mode without hue drift', () => {
    const colors = generatePalette({
      seed: '#4F46E5',
      scheme: 'triadic',
      category: 'neutral',
      mode: 'dark',
      brand: { primary: '#123456' },
    });
    const pinHue = hexToOklch('#123456').h;
    const outHue = hexToOklch(colors.primary!).h;
    const drift = Math.abs(pinHue - outHue) % 360;
    expect(Math.min(drift, 360 - drift)).toBeLessThan(8);
    expect(contrastRatio(colors.primary!, colors.background!)).toBeGreaterThanOrEqual(3);
  });
});
