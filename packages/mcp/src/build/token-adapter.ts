/**
 * Token + theme adapter — reads the source theme objects exported from
 * `@uni-design-system/uni-core` (the same input Emotion consumes), not
 * generated CSS. Every token is classified by `kind`:
 *   - style      → drives Emotion CSS      (colors, radii, spacing, ...)
 *   - behavioral → sets a component prop   (components[name].options)
 * Theme templates keep the two buckets distinct so each is applied correctly.
 */
import type { ThemeTemplateModel, TokenModel, TokenValue } from '../schema.js';

// uni-core resolves to its built dist; types are loose here on purpose so the
// adapter is not coupled to core's internal type surface.
type AnyTheme = {
  id: string;
  name: string;
  colors: Record<string, unknown>;
  radii: Record<string, unknown>;
  spacing: Record<string, unknown>;
  borders: Record<string, unknown>;
  shadows: Record<string, unknown>;
  thicknesses: Record<string, unknown>;
  typography: Record<string, unknown>;
  components: Record<string, { options?: Record<string, unknown> } | undefined>;
};

/** The flat style scales, mapped to a token `type` and id namespace. */
const STYLE_SCALES: Array<{ key: keyof AnyTheme; type: string; ns: string }> = [
  { key: 'colors', type: 'color', ns: 'color' },
  { key: 'radii', type: 'radius', ns: 'radius' },
  { key: 'spacing', type: 'spacing', ns: 'spacing' },
  { key: 'borders', type: 'border', ns: 'border' },
  { key: 'shadows', type: 'shadow', ns: 'shadow' },
  { key: 'thicknesses', type: 'thickness', ns: 'thickness' },
  { key: 'typography', type: 'typography', ns: 'typography' },
];

/** Coerce any leaf/branch value into a schema-legal TokenValue. */
function toTokenValue(v: unknown): TokenValue {
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  return JSON.stringify(v);
}

export type TokenIngest = {
  tokens: TokenModel[];
  themes: ThemeTemplateModel[];
};

export function ingestTokens(themesByName: Record<string, AnyTheme>): TokenIngest {
  const themeEntries = Object.entries(themesByName);
  const base = themeEntries[0]?.[1];
  if (!base) return { tokens: [], themes: [] };

  const tokens: TokenModel[] = [];

  // --- Style tokens: enumerate scales on the base theme, capture per-theme values.
  for (const scale of STYLE_SCALES) {
    const scaleObj = base[scale.key] as Record<string, unknown>;
    for (const key of Object.keys(scaleObj)) {
      if (scaleObj[key] === undefined) continue;
      const themeValues: Record<string, TokenValue> = {};
      for (const [themeName, theme] of themeEntries) {
        const val = (theme[scale.key] as Record<string, unknown>)?.[key];
        if (val !== undefined) themeValues[themeName] = toTokenValue(val);
      }
      tokens.push({
        id: `${scale.ns}.${key}`,
        value: toTokenValue(scaleObj[key]),
        type: scale.type,
        kind: 'style',
        target: 'emotion-css',
        themeValues,
      });
    }
  }

  // --- Behavioral tokens: components[name].options across themes.
  for (const [component, def] of Object.entries(base.components)) {
    const options = def?.options;
    if (!options) continue;
    for (const optKey of Object.keys(options)) {
      if (options[optKey] === undefined) continue;
      const themeValues: Record<string, TokenValue> = {};
      for (const [themeName, theme] of themeEntries) {
        const val = theme.components?.[component]?.options?.[optKey];
        if (val !== undefined) themeValues[themeName] = toTokenValue(val);
      }
      tokens.push({
        id: `${component}.behavior.${optKey}`,
        value: toTokenValue(options[optKey]),
        type: typeof options[optKey] === 'object' ? 'object' : typeof options[optKey],
        kind: 'behavioral',
        target: 'component-prop',
        appliesTo: component,
        themeValues,
      });
    }
  }

  // --- Theme templates: two distinct buckets per theme.
  const themes: ThemeTemplateModel[] = themeEntries.map(([themeName, theme]) => {
    const styleOverrides: Record<string, TokenValue> = {};
    for (const scale of STYLE_SCALES) {
      const scaleObj = theme[scale.key] as Record<string, unknown>;
      for (const key of Object.keys(scaleObj ?? {})) {
        if (scaleObj[key] === undefined) continue;
        styleOverrides[`${scale.ns}.${key}`] = toTokenValue(scaleObj[key]);
      }
    }

    const componentOptions: Record<string, Record<string, TokenValue>> = {};
    for (const [component, def] of Object.entries(theme.components)) {
      const options = def?.options;
      if (!options) continue;
      componentOptions[component] = Object.fromEntries(
        Object.entries(options)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, toTokenValue(v)]),
      );
    }

    return {
      id: theme.id ?? themeName,
      name: theme.name ?? themeName,
      description: `The ${theme.name ?? themeName} theme for the Uni Design System.`,
      styleOverrides,
      componentOptions,
      usage:
        'Apply style overrides through the Emotion theme provider (the `UniTheme` ' +
        'object), and pass component options as component inputs/props. Import the ' +
        `theme from \`@uni-design-system/uni-core\` (\`${theme.id ?? themeName}\`).`,
    };
  });

  return { tokens, themes };
}
