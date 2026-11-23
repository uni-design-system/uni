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
  /** Component id → selector, for synthesizing the element of an args-only story. */
  idToSelector?: Map<string, string>;
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

/** One top-level entry of an args object literal, as source text. */
type ArgEntry = { key: string; value: string } | { spread: string };

/**
 * Split an object literal's source into its top-level entries. Not a parser:
 * it tracks nesting and string/template quoting, which is all it takes to find
 * the commas and colons that belong to the outermost object.
 */
export function splitArgs(literal: string): ArgEntry[] | undefined {
  const body = literal.trim().replace(/^\{/, '').replace(/\}$/, '');
  const chunks: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) {
      current += ch;
      if (ch === '\\') current += body[++i] ?? '';
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if ('{[('.includes(ch)) depth++;
    else if ('}])'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      chunks.push(current);
      current = '';
    } else current += ch;
  }
  chunks.push(current);
  if (depth !== 0 || quote) return undefined;

  const entries: ArgEntry[] = [];
  for (const chunk of chunks.map((c) => c.trim()).filter(Boolean)) {
    if (chunk.startsWith('...')) {
      entries.push({ spread: chunk.slice(3).trim() });
      continue;
    }
    const m = /^(?:([A-Za-z_$][\w$]*)|'([^']+)'|"([^"]+)")\s*(?::([\s\S]*))?$/.exec(chunk);
    if (!m) return undefined;
    const key = m[1] ?? m[2] ?? m[3];
    // Shorthand `{ options }` binds the like-named variable.
    entries.push({ key, value: m[4] === undefined ? key : m[4].trim() });
  }
  return entries;
}

/**
 * Meta args overlaid by the story's own, in first-seen order, with
 * `...Other.args` spreads expanded from the sibling story. Undefined when an
 * entry cannot be read — a spread of anything else, or syntax the splitter
 * does not follow — so the caller falls back rather than show a partial tag.
 */
function mergedArgs(
  src: string,
  exportName: string,
  seen = new Set<string>()
): Map<string, string> | undefined {
  if (seen.has(exportName)) return undefined;
  seen.add(exportName);

  const merged = new Map<string, string>();
  const overlay = (literal: string | undefined, inherited: boolean): boolean => {
    if (!literal) return true;
    const entries = splitArgs(literal);
    if (!entries) return false;
    for (const entry of entries) {
      if ('key' in entry) {
        merged.set(entry.key, entry.value);
        continue;
      }
      const story = /^([A-Za-z_$][\w$]*)\.args$/.exec(entry.spread)?.[1];
      // A spread story already carries the meta args; inside the meta itself
      // there is no story to resolve.
      const spread = story && !inherited ? mergedArgs(src, story, seen) : undefined;
      if (!spread) return false;
      for (const [key, value] of spread) merged.set(key, value);
    }
    return true;
  };

  if (!overlay(extractMetaArgs(src), true)) return undefined;
  if (!overlay(extractArgs(src, exportName), false)) return undefined;
  return merged;
}

const STRING_LITERAL = /^(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)")$/;
/** Longest literal worth writing into an attribute; longer ones are named. */
const MAX_INLINE = 60;

/**
 * Whether a value's source can sit in an Angular binding as written: one
 * short line, no double quote to end the attribute early, no arrow function
 * or template literal, and nothing that refers to a variable or function of
 * the stories file — which a reader pasting the example would not have.
 */
function isInlineLiteral(value: string): boolean {
  if (value.length > MAX_INLINE || /["`\n]|=>/.test(value)) return false;
  const bare = value
    .replace(/'(?:[^'\\]|\\.)*'/g, "''") // string contents are not identifiers
    .replace(/[A-Za-z_$][\w$]*\s*:/g, ''); // nor are object keys
  const names = bare.match(/[A-Za-z_$][\w$]*/g) ?? [];
  return names.every((name) => ['true', 'false', 'null', 'undefined'].includes(name));
}

/** Pull a multi-line value's continuation lines back to the left margin. */
function outdent(value: string): string {
  const [first, ...rest] = value.split('\n');
  const indent = Math.min(...rest.filter((l) => l.trim()).map((l) => /^\s*/.exec(l)![0].length));
  return [first, ...rest.map((l) => l.slice(Number.isFinite(indent) ? indent : 0))].join('\n');
}

/** The opening and closing halves of an element for a component selector. */
function elementFor(selectorOrTag: string): { open: string; close: string } | undefined {
  // `uni-combobox, Combobox` — the first alternative is the documented one.
  const selector = selectorOrTag.split(',')[0].trim();
  const m = /^([A-Za-z][\w-]*)?(?:\[([\w-]+)\])?$/.exec(selector);
  if (!m || (!m[1] && !m[2])) return undefined;
  // An attribute-only selector needs a host; `div` is the neutral one.
  const tag = m[1] ?? 'div';
  return m[2]
    ? { open: `<${tag} ${m[2]}`, close: `></${tag}>` }
    : { open: `<${tag}`, close: ' />' };
}

/**
 * The element a story with no template renders: Storybook mounts the
 * component and sets its args as inputs, so the markup is the selector plus
 * one binding per arg. Literal values are written inline. Anything else — a
 * constant from the stories file, a function call, a long structure — is
 * bound to a property named after the input and its source listed underneath,
 * so the tag stays valid markup and nothing is invented.
 */
export function synthesizeTemplate(
  selectorOrTag: string,
  args: Map<string, string>
): string | undefined {
  const element = elementFor(selectorOrTag);
  if (!element) return undefined;

  const attrs: string[] = [];
  const named: string[] = [];
  for (const [key, value] of args) {
    const text = STRING_LITERAL.exec(value);
    const plain = text?.[1] ?? text?.[2];
    if (plain !== undefined && !/[\\"]/.test(plain)) attrs.push(`${key}="${plain}"`);
    else if (isInlineLiteral(value)) attrs.push(`[${key}]="${value}"`);
    else {
      attrs.push(`[${key}]="${key}"`);
      named.push(`${key} = ${outdent(value)}`);
    }
  }

  const oneLine = [element.open, ...attrs].join(' ') + element.close;
  const tag =
    oneLine.length <= 100 || attrs.length === 0
      ? oneLine
      : `${element.open}\n${attrs.map((attr) => `  ${attr}`).join('\n')}\n${element.close.trimStart()}`;
  return named.length ? `${tag}\n<!-- bound values:\n${named.join('\n')}\n-->` : tag;
}

/** Assemble a readable snippet: the render template (if any) + the story's args. */
export function buildCode(name: string, template: string | undefined, args: string | undefined): string {
  const parts: string[] = [`<!-- Storybook story: ${name} -->`];
  if (template) parts.push(template);
  if (args) parts.push(`<!-- args:\n${args}\n-->`);
  return parts.join('\n');
}

/**
 * The snippet for a story with no template of its own or from the meta: the
 * synthesized element when its args can be read, else the raw args — meta
 * defaults included, since they are half of what is on screen.
 */
export function buildArgsOnlyCode(
  name: string,
  src: string,
  exportName: string,
  selectorOrTag: string | undefined
): string {
  // A `render` whose template could not be read (a wrapper component, a
  // template built by a helper) draws something other than the bare element.
  const customRender = [storyBlock(src, exportName), metaBlock(src)].some((block) =>
    /\brender\s*:|^\s*render\s*\(/m.test(block ?? '')
  );
  const merged = selectorOrTag && !customRender ? mergedArgs(src, exportName) : undefined;
  const synthesized = merged && selectorOrTag ? synthesizeTemplate(selectorOrTag, merged) : undefined;
  if (synthesized) return `<!-- Storybook story: ${name} -->\n${synthesized}`;

  const parts: string[] = [`<!-- Storybook story: ${name} -->`];
  const metaArgs = extractMetaArgs(src);
  const args = extractArgs(src, exportName);
  if (metaArgs) parts.push(`<!-- default args (shared by every story):\n${metaArgs}\n-->`);
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
      cached = { src, template: extractMetaTemplate(src) };
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
      code: template
        ? buildCode(entry.name, template, args)
        : buildArgsOnlyCode(
            entry.name,
            cached.src,
            entry.exportName,
            opts.idToSelector?.get(componentId)
          ),
      storybookUrl: opts.storybookBaseUrl
        ? `${opts.storybookBaseUrl.replace(/\/$/, '')}/?path=/story/${entry.id}`
        : undefined,
    });
  }

  return examples;
}
