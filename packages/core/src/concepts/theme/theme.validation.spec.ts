import { describe, expect, it } from 'vitest';

import { BaseIcons } from '../iconography/icon.records';
import { BaseTheme, createTheme, dehydrateTheme, hydrateTheme } from './themes/base.theme';
import { DarkTheme } from './themes/dark.theme';
import { LightTheme } from './themes/light.theme';
import {
  assertTheme,
  isUniTheme,
  parseTheme,
  REQUIRED_COLOR_TOKENS,
  REQUIRED_TEXT_ROLES,
} from './theme.validation';

/** Structured clone so mutations never leak between tests. */
const cloneTheme = () => structuredClone(LightTheme) as Record<string, any>;

const issuePaths = (input: unknown): string[] =>
  parseTheme(input).issues.map((issue) => issue.path);

describe('parseTheme', () => {
  it('accepts every built-in theme', () => {
    for (const theme of [LightTheme, DarkTheme, BaseTheme]) {
      const result = parseTheme(theme);
      expect(result.issues).toEqual([]);
      expect(result.success).toBe(true);
    }
  });

  it('accepts a createTheme product', () => {
    const theme = createTheme({ id: 'T', name: 'Test', colors: BaseTheme.colors });
    expect(parseTheme(theme).success).toBe(true);
  });

  it('round-trips through JSON (the distribution format)', () => {
    const revived = JSON.parse(JSON.stringify(LightTheme));
    expect(parseTheme(revived).success).toBe(true);
  });

  it('rejects non-objects with a single root issue', () => {
    for (const input of [null, undefined, 42, 'theme', []]) {
      const result = parseTheme(input);
      expect(result.success).toBe(false);
      expect(result.issues).toEqual([{ path: '', message: 'theme must be an object' }]);
    }
  });

  it('requires id and name', () => {
    const theme = cloneTheme();
    theme.id = '';
    delete theme.name;
    expect(issuePaths(theme)).toEqual(expect.arrayContaining(['id', 'name']));
  });

  it('reports every missing required color token by path', () => {
    const theme = cloneTheme();
    delete theme.colors['primary'];
    delete theme.colors['on-warn'];
    expect(issuePaths(theme)).toEqual(
      expect.arrayContaining(['colors.primary', 'colors.on-warn'])
    );
  });

  it('rejects non-string color values', () => {
    const theme = cloneTheme();
    theme.colors.primary = 0xff0000;
    expect(issuePaths(theme)).toContain('colors.primary');
  });

  it('requires every canonical text role with renderable fields', () => {
    const theme = cloneTheme();
    delete theme.typography['label'];
    theme.typography['title-small'].fontSize = { px: 12 };
    delete theme.typography['caption'].fontFamily;
    const paths = issuePaths(theme);
    expect(paths).toEqual(
      expect.arrayContaining([
        'typography.label',
        'typography.title-small.fontSize',
        'typography.caption.fontFamily',
      ])
    );
  });

  it('allows string CssLength values and extra roles', () => {
    const theme = cloneTheme();
    theme.typography.menu = { fontFamily: 'Inter', fontSize: '1.2rem', lineHeight: 16 };
    expect(parseTheme(theme).success).toBe(true);
  });

  it('requires the scale keys components depend on', () => {
    const theme = cloneTheme();
    delete theme.radii['max'];
    delete theme.spacing['md'];
    delete theme.shadows['menu'];
    delete theme.thicknesses['standard'];
    expect(issuePaths(theme)).toEqual(
      expect.arrayContaining(['radii.max', 'spacing.md', 'shadows.menu', 'thicknesses.standard'])
    );
  });

  it('walks component style expressions recursively', () => {
    const theme = cloneTheme();
    theme.components.button.variants.primary['&:hover'] = { filter: ['brightness'] };
    theme.components.badge = 'pill';
    expect(issuePaths(theme)).toEqual(
      expect.arrayContaining([
        'components.button.variants.primary.&:hover.filter',
        'components.badge',
      ])
    );
  });

  it('aggregates issues across scales in one result', () => {
    const result = parseTheme({ id: 'x', name: 'x' });
    expect(result.success).toBe(false);
    // Every scale reports at least once: colors, typography, borders, radii,
    // shadows, spacing, thicknesses, icons, components.
    const roots = new Set(result.issues.map((issue) => issue.path.split('.')[0]));
    expect(roots.size).toBeGreaterThanOrEqual(9);
  });
});

describe('assertTheme / isUniTheme', () => {
  it('assertTheme returns the theme when valid', () => {
    expect(assertTheme(LightTheme)).toBe(LightTheme);
  });

  it('assertTheme throws with every reason in the message', () => {
    const theme = cloneTheme();
    delete theme.colors['primary'];
    delete theme.radii['sm'];
    expect(() => assertTheme(theme)).toThrowError(/colors\.primary.*radii\.sm|radii\.sm.*colors\.primary/s);
  });

  it('isUniTheme narrows', () => {
    expect(isUniTheme(LightTheme)).toBe(true);
    expect(isUniTheme({})).toBe(false);
  });
});

describe('hydrateTheme / dehydrateTheme (the wire format)', () => {
  const iconCount = Object.keys(BaseIcons).length;

  it('dehydrating drops the built-in icons and stays a valid theme', () => {
    const wire = dehydrateTheme(LightTheme);
    expect(Object.keys(wire.icons)).toEqual([]);
    expect(parseTheme(JSON.parse(JSON.stringify(wire))).success).toBe(true);
  });

  it('dehydrating cuts the serialized payload by ~70%', () => {
    const full = JSON.stringify(LightTheme).length;
    const wire = JSON.stringify(dehydrateTheme(LightTheme)).length;
    expect(wire).toBeLessThan(full * 0.35);
  });

  it('keeps genuine icon overrides on the wire', () => {
    const custom = { ...LightTheme, icons: { ...LightTheme.icons, acmeLogo: 'data:image/svg+xml,x' } };
    expect(dehydrateTheme(custom).icons).toEqual({ acmeLogo: 'data:image/svg+xml,x' });
  });

  it('round-trips through JSON back to the full icon set', () => {
    const revived = JSON.parse(JSON.stringify(dehydrateTheme(LightTheme)));
    const restored = hydrateTheme(revived);
    expect(Object.keys(restored.icons)).toHaveLength(iconCount);
    expect(restored.icons).toEqual(LightTheme.icons);
  });

  it("hydration lets the theme's own icons win over built-ins", () => {
    const [firstName] = Object.keys(BaseIcons);
    const restored = hydrateTheme({ ...LightTheme, icons: { [firstName]: 'data:image/svg+xml,mine' } });
    expect(restored.icons[firstName]).toBe('data:image/svg+xml,mine');
    expect(Object.keys(restored.icons)).toHaveLength(iconCount);
  });
});

describe('required-token exports', () => {
  it('the base theme satisfies its own contract', () => {
    for (const token of REQUIRED_COLOR_TOKENS) {
      expect(BaseTheme.colors[token], `color ${token}`).toBeDefined();
    }
    for (const role of REQUIRED_TEXT_ROLES) {
      expect(BaseTheme.typography[role], `role ${role}`).toBeDefined();
    }
  });
});
