/**
 * `generate-uni-theme` — runs the uni-core OKLCH engine at tool-call time and
 * renders the static `uni-theme.ts` source. The MCP returns *file content*;
 * the calling agent writes it to disk. Per the static-theme-file direction,
 * the generated file is the system's editable source of truth — retheming
 * later means editing that file's tokens, not calling this tool again
 * (regenerate only to re-derive colors from a new brand seed).
 */
import { emitThemeFile, type ThemeFileInput } from '@uni-design-system/uni-core';

const HEX = /^#[0-9a-fA-F]{6}$/;

export type GenerateThemeArgs = Omit<ThemeFileInput, 'seed'> & { brand: string | string[] };

export function formatGeneratedTheme(args: GenerateThemeArgs): string {
  const seeds = (Array.isArray(args.brand) ? args.brand : [args.brand]).map((s) =>
    s.startsWith('#') ? s : `#${s}`,
  );
  const invalid = seeds.filter((s) => !HEX.test(s));
  if (invalid.length) {
    return `Invalid brand color(s): ${invalid.join(', ')}. Pass 6-digit hex values, e.g. "#0052FF" (1–3 colors: primary, secondary, tertiary).`;
  }

  const { content, providerSnippet, reportSummary, report } = emitThemeFile({
    ...args,
    seed: seeds.length === 1 ? seeds[0] : seeds,
  });

  const failing = report.checks.filter((c) => !c.pass);
  const failLines = failing.length
    ? `\n\nFailing pairs:\n${failing.map((f) => `- ${f.mode} \`${f.foreground}\` on \`${f.background}\`: ${f.ratio}:1 (needs ${f.required}:1)`).join('\n')}`
    : '';

  return [
    `# ${args.name ?? 'Brand'} theme — generated`,
    '',
    'Write this file to `src/app/uni-theme.ts`:',
    '',
    '```ts',
    content.trimEnd(),
    '```',
    '',
    '## Register it (app.config.ts)',
    '',
    '```ts',
    providerSnippet,
    '```',
    '',
    '## Contrast report',
    '',
    `${reportSummary}.${failLines}`,
    '',
    '## Retheming later — edit the file, do not regenerate',
    '',
    'The file above is the source of truth for the whole look and feel:',
    '- **Colors**: edit any token in the `lightColors`/`darkColors` maps; borders and every',
    '  component deriving from that token update automatically.',
    '- **Borders**: add your own primitive under any name in `borders` (e.g.',
    '  `\'brush-stroke\': `3px dashed ${colors.tertiary}``) and reference it from `components`',
    '  overrides — one edit restyles every component sharing the token.',
    '- **Components**: the `components` function returns sparse overrides deep-merged over',
    '  Uni defaults — set only what you change, e.g.',
    "  `button: { variants: { secondary: { border: borders(colors)['brush-stroke'] } } }`.",
    '- Never hardcode hex values in application components: style through `ThemeService`',
    '  accessors and semantic token names so themes stay swappable.',
  ].join('\n');
}
