/**
 * Build entry — runs every adapter and writes the versioned `uni-index.json`
 * the server reads at runtime. Invoke with `pnpm build-index`.
 *
 * Sources are read from the sibling packages in the monorepo; the Uni release
 * is taken from `packages/angular`'s version so answers match what a developer
 * actually installed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UniThemes } from '@uni-design-system/uni-core';
import { ingestAngular } from './angular-adapter.js';
import { ingestStorybook } from './storybook-adapter.js';
import { ingestTokens } from './token-adapter.js';
import { normalize } from './normalizer.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../..');
const angularRoot = join(repoRoot, 'packages/angular');
const outFile = join(here, '../data/uni-index.json');

function readVersion(): string {
  const pkg = JSON.parse(readFileSync(join(angularRoot, 'package.json'), 'utf8'));
  return pkg.version ?? '0.0.0';
}

function main() {
  const version = readVersion();
  console.log(`▸ Building Uni MCP index for release v${version}`);

  // --- Angular components
  const angular = ingestAngular(join(angularRoot, 'src/lib'));
  const pathToId = new Map(angular.map((f) => [f.sourcePath, f.id]));
  console.log(`  angular: ${angular.length} components`);

  // --- Tokens + themes from uni-core
  const { tokens, themes } = ingestTokens(UniThemes as never);
  console.log(`  tokens: ${tokens.length}  themes: ${themes.length}`);

  // --- Storybook examples (Angular). React joins when it reaches parity.
  const examples = ingestStorybook({
    indexPath: join(angularRoot, 'storybook-static/index.json'),
    packageRoot: angularRoot,
    pathToId,
    framework: 'angular',
    storybookBaseUrl: process.env.UNI_STORYBOOK_URL,
  });
  console.log(`  examples: ${examples.length}`);
  if (examples.length === 0) {
    // The adapter degrades gracefully per-story, but zero examples means the
    // built storybook is missing entirely — an index without examples once
    // shipped silently (4.1.1). Refuse to write one.
    throw new Error(
      `No storybook examples found — run \`turbo run build-storybook --filter=@uni-design-system/uni-angular\` first (looked in ${join(angularRoot, 'storybook-static')}).`,
    );
  }

  const index = normalize({
    version,
    frameworks: ['angular'],
    angular,
    examples,
    tokens,
    themes,
  });

  if (!existsSync(dirname(outFile))) mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(index, null, 2));
  console.log(`✓ Wrote ${outFile}`);
  console.log(
    `  ${index.meta.counts.components} components · ${index.meta.counts.tokens} tokens · ` +
      `${index.meta.counts.themes} themes · ${index.meta.counts.examples} examples`,
  );
}

main();
