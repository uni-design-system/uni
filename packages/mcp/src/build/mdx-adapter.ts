/**
 * MDX adapter — turns each component's co-located `.mdx` docs page into
 * authored guidelines for the index. The `## Overview` prose becomes
 * `whenToUse`; optional `## Do` / `## Don't` / `## Accessibility` bullet
 * sections map to their fields, so docs authors grow guidelines in the same
 * file the Storybook sidebar shows. JSX (Meta/Title/story blocks), import
 * statements, and inline-code import lines are stripped — only prose ships.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

export interface MdxGuidelines {
  whenToUse: string;
  dos: string[];
  donts: string[];
  accessibility: string[];
}

const SECTION = /^##\s+(.+)$/;

/** Lines that are markup or scaffolding rather than guideline prose. */
const isNoise = (line: string): boolean => {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('import ') ||
    trimmed.startsWith('<') ||
    trimmed.endsWith('/>') ||
    trimmed === '' ||
    // the `import { UniX } from '…';` inline-code line under the title
    /^`import .*`$/.test(trimmed)
  );
};

const bullets = (lines: string[]): string[] =>
  lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- ') || l.startsWith('* '))
    .map((l) => l.slice(2).trim())
    .filter(Boolean);

const prose = (lines: string[]): string =>
  lines
    .filter((l) => !isNoise(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Parse one MDX source into guidelines. Pure — testable without a filesystem. */
export function parseMdxGuidelines(source: string): MdxGuidelines | undefined {
  const sections = new Map<string, string[]>();
  let current: string | undefined;
  for (const line of source.split('\n')) {
    const heading = line.match(SECTION);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      sections.set(current, []);
      continue;
    }
    if (current) sections.get(current)!.push(line);
  }

  const whenToUse = prose(sections.get('overview') ?? []);
  const dos = bullets(sections.get('do') ?? []);
  const donts = bullets(sections.get("don't") ?? sections.get('dont') ?? []);
  const accessibility = bullets(sections.get('accessibility') ?? []);

  if (!whenToUse && !dos.length && !donts.length && !accessibility.length) return undefined;
  return { whenToUse, dos, donts, accessibility };
}

export type MdxOptions = {
  /** The lib root that component `sourcePath`s are relative to. */
  srcRoot: string;
  /** Map of component sourcePath → id, from the framework adapter. */
  pathToId: Map<string, string>;
};

/**
 * Walk component directories for `.mdx` files and attach each to a component
 * id. An MDX belongs to the component whose file shares its basename
 * (`tabs.mdx` → `tabs.component.ts`); when the basenames differ (e.g.
 * `expand.mdx` documenting the whole group), it falls back to any component
 * living in the same directory.
 */
export function ingestMdx(opts: MdxOptions): Map<string, MdxGuidelines> {
  // Directory → ids, and full path prefix → id for basename matches.
  const idsByDir = new Map<string, string[]>();
  const idByBase = new Map<string, string>();
  for (const [sourcePath, id] of opts.pathToId) {
    const dir = dirname(sourcePath);
    idsByDir.set(dir, [...(idsByDir.get(dir) ?? []), id]);
    idByBase.set(sourcePath.replace(/\.component\.ts$/, ''), id);
  }

  const out = new Map<string, MdxGuidelines>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.endsWith('.mdx')) continue;
      const rel = relative(opts.srcRoot, abs);
      const base = rel.replace(/\.mdx$/, '');
      const id =
        idByBase.get(base) ?? (idsByDir.get(dirname(rel)) ?? [])[0];
      if (!id) continue;
      const parsed = parseMdxGuidelines(readFileSync(abs, 'utf8'));
      // First match wins per id (a directory documents its primary component).
      if (parsed && !out.has(id)) out.set(id, parsed);
    }
  };
  walk(opts.srcRoot);
  console.log(`  guidelines: ${out.size} components (from mdx)`);
  return out;
}

/** Exposed for logging/tests. */
export function guidelineStats(guidelines: Map<string, MdxGuidelines>): string {
  return [...guidelines.keys()].sort().join(', ');
}
