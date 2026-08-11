/**
 * Validates every `?path=/docs/<id>` cross-link in the MDX corpus against the
 * ids Storybook actually generated.
 *
 * Story ids are derived from a story's `title` plus its docs `name`, so any
 * retitling silently breaks every link pointing at the old id — nothing in the
 * build complains, and the link just lands on "story not found". Three links
 * were already dead when this check was written.
 *
 * Run after `build-storybook`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const INDEX = 'storybook-static/index.json';
const LINK = /\?path=\/docs\/([a-z0-9-]+--[a-z0-9-]+)/g;

if (!existsSync(INDEX)) {
  console.error(`✗ ${INDEX} not found — run \`pnpm build-storybook\` first.`);
  process.exit(1);
}

const ids = new Set(Object.keys(JSON.parse(readFileSync(INDEX, 'utf8')).entries));
const files = execSync("find src -name '*.mdx'").toString().trim().split('\n').filter(Boolean);

const broken = [];
let checked = 0;

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const [, id] of source.matchAll(LINK)) {
    checked++;
    if (!ids.has(id)) broken.push({ file, id });
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} of ${checked} doc links point at ids that do not exist:\n`);
  for (const { file, id } of broken) console.error(`  ${file}\n    → ${id}`);
  console.error('\nValid ids are listed in storybook-static/index.json.');
  process.exit(1);
}

console.log(`✓ ${checked} doc links across ${files.length} MDX files all resolve.`);
