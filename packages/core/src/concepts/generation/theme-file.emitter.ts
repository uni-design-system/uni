import type { Colors, Shadows } from '../theme/theme.model';
import { generateThemes } from './theme.generator';
import type { ContrastReport, GenerationInput } from './generation.types';

export interface ThemeFileInput extends GenerationInput {
  /** Emit the dark theme alongside the light one. Defaults to true. */
  darkMode?: boolean;
}

/** A rendered static theme file plus everything a consumer needs to wire it. */
export interface EmittedThemeFile {
  /** TypeScript source for a static `uni-theme.ts` — plain, reviewable data. */
  content: string;
  /** Registration snippet for the consumer's `app.config.ts`. */
  providerSnippet: string;
  report: ContrastReport;
  /** One-line human summary of the contrast report. */
  reportSummary: string;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const asKey = (k: string): string => (IDENT.test(k) ? k : `'${k}'`);

const recordLiteral = (record: Record<string, string | undefined>, indent: string): string =>
  Object.entries(record)
    .map(([k, v]) => `${indent}${asKey(k)}: '${v}',`)
    .join('\n');

// The derived border primitives, spelled out as template literals over the
// colors const — visible, editable, and edits to a color propagate. Access is
// bracket-only: `Colors` carries an index signature, and consumer tsconfigs
// with `noPropertyAccessFromIndexSignature` (ng new strict default) reject
// dot access on it.
const bordersLiteral = (): string =>
  [
    '/**',
    ' * Named border primitives. These mirror the derived defaults — edit them, or',
    ' * add your own under any token name and point component options (or the',
    ' * `components` overrides below) at it. Every component deriving from a',
    ' * shared token picks up the change.',
    ' */',
    'const borders = (colors: Colors): Borders => ({',
    "  primary: `1px solid ${colors['primary']}`,",
    "  secondary: `1px solid ${colors['secondary']}`,",
    "  tertiary: `1px solid ${colors['tertiary']}`,",
    "  quaternary: `1px solid ${colors['quaternary']}`,",
    "  warn: `1px solid ${colors['warn']}`,",
    "  success: `1px solid ${colors['success']}`,",
    "  light: `1px solid ${colors['outline']}`,",
    "  dark: `1px solid ${colors['on-background']}`,",
    "  dotted: `1px dotted ${colors['on-background']}`,",
    '});',
  ].join('\n');

const themeExport = (
  exportName: string,
  displayName: string,
  colorsConst: string,
  shadowsConst: string,
  radii: boolean
): string =>
  [
    `export const ${exportName}: UniTheme = createTheme({`,
    `  id: '${exportName}',`,
    `  name: '${displayName}',`,
    `  colors: ${colorsConst},`,
    `  borders: borders(${colorsConst}),`,
    `  components: components(${colorsConst}),`,
    `  shadows: ${shadowsConst},`,
    ...(radii ? ['  radii,'] : []),
    '});',
  ].join('\n');

/**
 * Render a static `uni-theme.ts` from a brand seed — the file the `ng add`
 * schematic writes and the MCP `generate_uni_theme` tool returns.
 *
 * The file is the system's **source of truth**: literal colors, the border
 * primitives spelled out, and a sparse `components` override section — so a
 * human (or an AI agent) can retheme by editing tokens in place, with no
 * runtime generation. Deterministic: same input, same file.
 */
export const emitThemeFile = (input: ThemeFileInput): EmittedThemeFile => {
  const { darkMode = true, name = 'Brand' } = input;
  const { lightColors, darkColors, radii, lightShadows, darkShadows, report } = generateThemes(input);
  const id = (name.replace(/\W+/g, '') || 'Brand') as string;

  const seeds = Array.isArray(input.seed) ? input.seed : [input.seed];
  const regenerate = [
    `--brand=${seeds.join(',')}`,
    input.vibe && `--vibe=${input.vibe}`,
    input.scheme && `--scheme=${input.scheme}`,
    input.shape && `--shape=${input.shape}`,
    !darkMode && '--dark-mode=false',
  ]
    .filter(Boolean)
    .join(' ');

  const reportSummary = `${report.checks.length} contrast pairs checked · worst ${report.worstRatio}:1 · ${
    report.pass ? 'all AA' : `${report.checks.filter((c) => !c.pass).length} failing`
  }`;

  const modes: {
    exportName: string;
    displayName: string;
    colorsConst: string;
    colors: Colors;
    shadowsConst: string;
    shadows: Shadows;
  }[] = [
    {
      exportName: `${id}Light`,
      displayName: `${name} Light`,
      colorsConst: 'lightColors',
      colors: lightColors,
      shadowsConst: 'lightShadows',
      shadows: lightShadows,
    },
    ...(darkMode
      ? [
          {
            exportName: `${id}Dark`,
            displayName: `${name} Dark`,
            colorsConst: 'darkColors',
            colors: darkColors,
            shadowsConst: 'darkShadows',
            shadows: darkShadows,
          },
        ]
      : []),
  ];

  const content = [
    '/**',
    ` * ${name} theme for Uni — generated data, yours to edit.`,
    ' *',
    ` * Regenerate colors: ng add @uni-design-system/uni-angular ${regenerate}`,
    ' * (or the `generate-uni-theme` MCP tool). Edits are never overwritten silently —',
    ' * regeneration rewrites this file, so commit before regenerating.',
    ` * ${reportSummary}.`,
    ' */',
    'import {',
    '  createTheme,',
    '  type Borders,',
    '  type Colors,',
    '  type ComponentThemes,',
    '  type Shadows,',
    '  type UniTheme,',
    "} from '@uni-design-system/uni-core';",
    '',
    ...modes.map(({ colorsConst, colors }) => `const ${colorsConst}: Colors = {\n${recordLiteral(colors as Record<string, string>, '  ')}\n};\n`),
    '/** Brand-tinted elevation shadows — theme-scoped, edit freely. */',
    ...modes.map(({ shadowsConst, shadows }) => `const ${shadowsConst}: Shadows = {\n${recordLiteral(shadows as Record<string, string>, '  ')}\n};\n`),
    bordersLiteral(),
    '',
    '/**',
    ' * Sparse component overrides, deep-merged over Uni component defaults: only',
    ' * what you write here changes. Point components at your own primitives, e.g.:',
    " *   button: { variants: { secondary: { border: `2px dashed ${colors['tertiary']}` } } },",
    " *   input: { options: { borderRadius: 'max' } },",
    ' */',
    'const components = (colors: Colors): ComponentThemes => ({});',
    '',
    ...(radii
      ? [`/** Shape language: '${input.shape}'. */`, `const radii = {\n${recordLiteral(radii as Record<string, string>, '  ')}\n};`, '']
      : []),
    ...modes.map(
      ({ exportName, displayName, colorsConst, shadowsConst }) =>
        `${themeExport(exportName, displayName, colorsConst, shadowsConst, !!radii)}\n`
    ),
    '/** First key wins as the default theme when registered via UNI_THEMES. */',
    `export const ${id}Themes = { ${modes.map((m) => m.exportName).join(', ')} };`,
    '',
  ].join('\n');

  const providerSnippet = [
    `import { UNI_THEMES } from '@uni-design-system/uni-angular';`,
    `import { ${id}Themes } from './uni-theme';`,
    '',
    '// app.config.ts → providers:',
    `{ provide: UNI_THEMES, useValue: ${id}Themes },`,
  ].join('\n');

  return { content, providerSnippet, report, reportSummary };
};
