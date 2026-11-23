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
 * The object literal assigned at the first match of `declaration` — a story
 * export or the file's meta — brace-balanced so nothing from a neighboring
 * declaration can leak in. Starts at the `{` after the `=`, not the first
 * `{`, because a type annotation may hold braces of its own.
 */
function objectLiteralAfter(src: string, declaration: RegExp): string | undefined {
  const start = src.search(declaration);
  if (start === -1) return undefined;
  const assign = /=\s*\{/.exec(src.slice(start));
  if (!assign) return undefined;
  const braceStart = start + assign.index + assign[0].length - 1;

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

/** The object literal of one named story export. */
const storyBlock = (src: string, exportName: string): string | undefined =>
  objectLiteralAfter(src, new RegExp(`export const ${exportName}\\b`));

/** The object literal of the file's meta (`const meta = {…}`). */
const metaBlock = (src: string): string | undefined => objectLiteralAfter(src, /\bconst meta\b/);

/** The `args: { ... }` object literal directly inside one object literal. */
function argsIn(block: string | undefined): string | undefined {
  if (!block) return undefined;
  const argsIdx = block.search(/\bargs:/);
  if (argsIdx === -1) return undefined;
  const braceStart = block.indexOf('{', argsIdx);
  if (braceStart === -1) return undefined;
  let depth = 0;
  for (let i = braceStart; i < block.length; i++) {
    if (block[i] === '{') depth++;
    else if (block[i] === '}') {
      depth--;
      if (depth === 0) return block.slice(braceStart, i + 1);
    }
  }
  return undefined;
}

/** The first `template: `...`` inside one object literal. */
function templateIn(block: string | undefined): string | undefined {
  const m = block?.match(/template:\s*`([\s\S]*?)`/);
  return m ? dedent(m[1]) : undefined;
}

/**
 * The meta-level `render` template, shared by every story that only sets
 * `args`. Read from the meta object alone: taking the file's first template
 * instead handed args-only stories the markup of whichever sibling story
 * happened to declare a `render` first.
 */
export function extractMetaTemplate(src: string): string | undefined {
  return templateIn(metaBlock(src));
}

/**
 * The meta-level `args`, which every story inherits. An args-only story with
 * no template anywhere is rendered from these plus its own, so the example
 * needs both to show what is on screen.
 */
export function extractMetaArgs(src: string): string | undefined {
  return argsIn(metaBlock(src));
}

/** The template belonging to one named story, when it brings its own `render`. */
export function extractStoryTemplate(src: string, exportName: string): string | undefined {
  return templateIn(storyBlock(src, exportName));
}

/**
 * The `args: { ... }` object literal of a named story export. Scoped to the
 * story's own block, so a story without args does not pick up the next one's.
 */
export function extractArgs(src: string, exportName: string): string | undefined {
  return argsIn(storyBlock(src, exportName));
}

/**
 * Assemble a readable snippet: the render template (if any) + the story's
 * args. With no template the component is rendered straight from args, so the
 * meta's defaults are listed too — they are half of what is on screen.
 */
export function buildCode(
  name: string,
  template: string | undefined,
  args: string | undefined,
  metaArgs?: string
): string {
  const parts: string[] = [`<!-- Storybook story: ${name} -->`];
  if (template) parts.push(template);
  else if (metaArgs) parts.push(`<!-- default args (shared by every story):\n${metaArgs}\n-->`);
  if (args) parts.push(`<!-- args:\n${args}\n-->`);
  return parts.join('\n');
}

export function ingestStorybook(opts: StorybookOptions): StorybookExample[] {
  if (!existsSync(opts.indexPath)) return [];
  const index = JSON.parse(readFileSync(opts.indexPath, 'utf8')) as {
    entries: Record<string, StoryEntry>;
  };

  // Cache per-stories-file parsing (template + full source) to avoid re-reads.
  const fileCache = new Map<string, { src: string; template?: string; args?: string }>();
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
      cached = { src, template: extractMetaTemplate(src), args: extractMetaArgs(src) };
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
      code: buildCode(entry.name, template, args, cached.args),
      storybookUrl: opts.storybookBaseUrl
        ? `${opts.storybookBaseUrl.replace(/\/$/, '')}/?path=/story/${entry.id}`
        : undefined,
    });
  }

  return examples;
}
