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

function dedent(template: string): string {
  return template
    .split('\n')
    .map((l) => l.replace(/^\s{6,8}/, ''))
    .join('\n')
    .trim();
}

/**
 * Grab the first `template: `...`` block from a stories/render source — the
 * meta-level `render`, shared by every story that only sets `args`.
 */
function extractTemplate(src: string): string | undefined {
  const m = src.match(/template:\s*`([\s\S]*?)`/);
  return m ? dedent(m[1]) : undefined;
}

/**
 * The template belonging to one named story, when it brings its own `render`.
 *
 * Without this every story in a file was handed the file's *first* template, so
 * a component whose meta declares a generic `render` had all of its examples
 * collapse into the same stub — the richest stories documented as the poorest.
 * Brace-balances the story's object literal the way `extractArgs` does, so a
 * later story's template cannot leak in.
 */
function extractStoryTemplate(src: string, exportName: string): string | undefined {
  const start = src.search(new RegExp(`export const ${exportName}\\b`));
  if (start === -1) return undefined;
  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) return undefined;

  let depth = 0;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        const block = src.slice(braceStart, i + 1);
        const m = block.match(/template:\s*`([\s\S]*?)`/);
        return m ? dedent(m[1]) : undefined;
      }
    }
  }
  return undefined;
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
    // The story's own template when it has one; otherwise the meta-level
    // render it legitimately shares with every other args-only story.
    const template = extractStoryTemplate(cached.src, entry.exportName) ?? cached.template;
    examples.push({
      componentId,
      title: entry.name,
      framework: opts.framework,
      code: buildCode(entry.name, template, args),
      storybookUrl: opts.storybookBaseUrl
        ? `${opts.storybookBaseUrl.replace(/\/$/, '')}/?path=/story/${entry.id}`
        : undefined,
    });
  }

  return examples;
}
