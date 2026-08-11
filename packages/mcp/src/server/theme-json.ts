/**
 * `generate-runtime-theme` / `get-runtime-theme` — the runtime counterpart to
 * `generate-uni-theme`. Where that tool returns `uni-theme.ts` source for an
 * agent to write and compile (branding an app permanently), these return a
 * validated `UniTheme` as data, for an app or agent to register live:
 * `themeService.registerTheme(theme, { select: true })`.
 *
 * Two contracts make the payload affordable and trustworthy:
 *
 * - **Icons are elided.** A serialized theme is ~50 KB, ~71% of it the 61
 *   built-in icon data URIs that every uni-core consumer already ships.
 *   `dehydrateTheme` keeps genuine overrides and drops the rest (~14 KB);
 *   the receiver restores them (`ThemeService` does it on register, others
 *   call `hydrateTheme`).
 * - **Every theme is parsed before it leaves.** `parseTheme` is the same gate
 *   the consumer applies, so "validated" is checked here rather than claimed.
 */
import {
  dehydrateTheme,
  generateUniThemes,
  parseTheme,
  summarizeContrast,
  UniThemes,
  formatThemeIssues,
  type ContrastReport,
  type UniTheme,
} from '@uni-design-system/uni-core';

import { resolveSeed, type GenerateThemeArgs } from './generate.js';

export interface RuntimeTheme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  /** A validated `UniTheme` with the built-in icon set elided. */
  theme: UniTheme;
}

export interface RuntimeThemeEnvelope {
  themes: RuntimeTheme[];
  /** Present when the themes were generated in this call and audited. */
  contrast?: {
    summary: string;
    pass: boolean;
    worstRatio: number;
    /** Token pairs below their WCAG target; named, never hex. */
    failing: {
      mode: string;
      foreground: string;
      background: string;
      ratio: number;
      required: number;
    }[];
  };
  apply: { snippet: string; note: string };
  /** Always true: base icons travel out-of-band. See the module note. */
  iconsElided: true;
}

export type BuildResult =
  | { ok: true; envelope: RuntimeThemeEnvelope }
  | { ok: false; error: string };

const APPLY_SNIPPET = [
  '// Angular — ThemeService from @uni-design-system/uni-angular',
  'const result = themeService.registerTheme(theme, { select: true });',
  'if (!result.success) console.warn(result.issues);',
].join('\n');

const APPLY_NOTE =
  'Each `theme` is a complete, validated UniTheme with the built-in icon set elided. ' +
  "ThemeService restores it on register (the theme's own icons win). Outside Angular, " +
  'call `hydrateTheme(theme)` from @uni-design-system/uni-core before use, and ' +
  '`parseTheme` if the payload crossed a trust boundary.';

/** Validate and package themes, or report why they were rejected. */
function envelope(themes: RuntimeTheme[], report?: ContrastReport): BuildResult {
  for (const { id, theme } of themes) {
    const result = parseTheme(theme);
    if (!result.success) {
      return { ok: false, error: `Generated theme \`${id}\` failed validation: ${formatThemeIssues(result.issues)}` };
    }
  }

  return {
    ok: true,
    envelope: {
      themes,
      ...(report
        ? {
            contrast: {
              summary: summarizeContrast(report),
              pass: report.pass,
              worstRatio: report.worstRatio,
              failing: report.checks
                .filter((check) => !check.pass)
                .map(({ mode, foreground, background, ratio, required }) => ({
                  mode,
                  foreground,
                  background,
                  ratio,
                  required,
                })),
            },
          }
        : {}),
      apply: { snippet: APPLY_SNIPPET, note: APPLY_NOTE },
      iconsElided: true,
    },
  };
}

/** Generate a light(+dark) theme pair from brand seed(s), ready to register. */
export function buildGeneratedTheme(args: GenerateThemeArgs): BuildResult {
  const resolved = resolveSeed(args.brand);
  if (!resolved.ok) return resolved;

  const { light, dark, report } = generateUniThemes({ ...args, seed: resolved.seed });

  const themes: RuntimeTheme[] = [
    { id: light.id, name: light.name, mode: 'light', theme: dehydrateTheme(light) },
  ];
  if (args.darkMode !== false) {
    themes.push({ id: dark.id, name: dark.name, mode: 'dark', theme: dehydrateTheme(dark) });
  }

  return envelope(themes, report);
}

/** The ids `get-runtime-theme` and `GET /themes` serve. */
export function listRuntimeThemes(): { id: string; name: string; mode: 'light' | 'dark' }[] {
  return Object.entries(UniThemes).map(([id, theme]) => ({
    id,
    name: theme.name,
    mode: modeOf(id),
  }));
}

const modeOf = (id: string): 'light' | 'dark' => (/dark/i.test(id) ? 'dark' : 'light');

/** Serve a theme that ships with Uni (`LightTheme`, `DarkTheme`) as runtime JSON. */
export function buildStoredTheme(id: string): BuildResult {
  const theme = (UniThemes as Record<string, UniTheme | undefined>)[id];
  if (!theme) {
    const ids = Object.keys(UniThemes).join(', ');
    return { ok: false, error: `No theme found with id \`${id}\`. Available: ${ids}.` };
  }

  return envelope([
    { id: theme.id, name: theme.name, mode: modeOf(id), theme: dehydrateTheme(theme) },
  ]);
}

/**
 * The text block accompanying `structuredContent`: a compact orientation, not
 * a second copy of the payload — duplicating ~14 KB of JSON per theme would
 * double the cost of every call for clients that read the structured result.
 */
export function summarizeEnvelope(env: RuntimeThemeEnvelope): string {
  const list = env.themes.map((t) => `\`${t.id}\` (${t.mode})`).join(', ');
  const failing = env.contrast?.failing.length
    ? `\n\nFailing pairs:\n${env.contrast.failing
        .map((f) => `- ${f.mode} \`${f.foreground}\` on \`${f.background}\`: ${f.ratio}:1 (needs ${f.required}:1)`)
        .join('\n')}`
    : '';

  return [
    `# Runtime theme JSON — ${env.themes.length} theme${env.themes.length === 1 ? '' : 's'}`,
    '',
    `${list}. The full validated theme data is in this result's structured content.`,
    ...(env.contrast ? ['', `${env.contrast.summary}.${failing}`] : []),
    '',
    '## Apply',
    '',
    '```ts',
    env.apply.snippet,
    '```',
    '',
    env.apply.note,
    '',
    'To brand an app permanently instead, use `generate-uni-theme` — it returns an ' +
      'editable `uni-theme.ts` that becomes the source of truth. Use this tool when the ' +
      'theme should apply immediately without a build step.',
  ].join('\n');
}
