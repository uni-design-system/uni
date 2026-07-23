/**
 * Storybook adapter — turns built `storybook-static/index.json` entries plus
 * their story sources into `ExampleModel`s. Storybook is the runtime that
 * exercises the components, so its stories are the canonical copy-pasteable
 * usage. Extraction is deliberately defensive: a story that can't be parsed
 * yields a best-effort snippet rather than failing the build.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExampleModel, Framework } from '../schema.js';

type StoryEntry = {
  type: string;
  id: string;
  name: string;
  title: string;
  importPath: string; // "./src/lib/.../button.stories.ts"
  componentPath?: string; // "./src/lib/.../button.component.ts"
  exportName?: string;
};

export type StorybookExample = ExampleModel & { componentId: string };

export type StorybookOptions = {
  /** Path to the built storybook-static/index.json. */
  indexPath: string;
  /** Package root that `./src/...` importPaths resolve against (packages/angular). */
  packageRoot: string;
  /** Map of `components/x/x.component.ts` → component id (from the framework adapter). */
  pathToId: Map<string, string>;
  framework: Framework;
  /** Optional deployed Storybook base URL for deep links. */
  storybookBaseUrl?: string;
};

/** Normalize a Storybook `./src/...` path to the lib-relative form the id map uses. */
function toLibRelative(componentPath: string): string {
  return componentPath.replace(/^\.\//, '').replace(/^src\/lib\//, '');
}

/** Grab the first `template: `...`` block from a stories/render source. */
function extractTemplate(src: string): string | undefined {
  const m = src.match(/template:\s*`([\s\S]*?)`/);
  if (!m) return undefined;
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s{6,8}/, ''))
    .join('\n')
    .trim();
}

/** Grab the `args: { ... }` object literal for a named story export. */
function extractArgs(src: string, exportName: string): string | undefined {
  const start = src.search(new RegExp(`export const ${exportName}\\b`));
  if (start === -1) return undefined;
  const argsIdx = src.indexOf('args:', start);
  if (argsIdx === -1) return undefined;
  const braceStart = src.indexOf('{', argsIdx);
  if (braceStart === -1) return undefined;
  // Balance braces to find the end of the args object.
  let depth = 0;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(braceStart, i + 1);
    }
  }
  return undefined;
}

/** Assemble a readable snippet: render template (if any) + the story's args. */
function buildCode(name: string, template: string | undefined, args: string | undefined): string {
  const parts: string[] = [`<!-- Storybook story: ${name} -->`];
  if (template) parts.push(template);
  if (args) parts.push(`<!-- args:\n${args}\n-->`);
  return parts.join('\n');
}

export function ingestStorybook(opts: StorybookOptions): StorybookExample[] {
  if (!existsSync(opts.indexPath)) return [];
  const index = JSON.parse(readFileSync(opts.indexPath, 'utf8')) as {
    entries: Record<string, StoryEntry>;
  };

  // Cache per-stories-file parsing (template + full source) to avoid re-reads.
  const fileCache = new Map<string, { src: string; template?: string }>();
  const examples: StorybookExample[] = [];

  for (const entry of Object.values(index.entries)) {
    if (entry.type !== 'story' || !entry.componentPath || !entry.exportName) continue;
    const componentId = opts.pathToId.get(toLibRelative(entry.componentPath));
    if (!componentId) continue;

    let cached = fileCache.get(entry.importPath);
    if (!cached) {
      const abs = join(opts.packageRoot, entry.importPath.replace(/^\.\//, ''));
      if (!existsSync(abs)) continue;
      const src = readFileSync(abs, 'utf8');
      cached = { src, template: extractTemplate(src) };
      fileCache.set(entry.importPath, cached);
    }

    const args = extractArgs(cached.src, entry.exportName);
    examples.push({
      componentId,
      title: entry.name,
      framework: opts.framework,
      code: buildCode(entry.name, cached.template, args),
      storybookUrl: opts.storybookBaseUrl
        ? `${opts.storybookBaseUrl.replace(/\/$/, '')}/?path=/story/${entry.id}`
        : undefined,
    });
  }

  return examples;
}
