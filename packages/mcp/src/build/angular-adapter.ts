/**
 * Angular adapter — reuses the battle-tested source parsing from
 * `packages/angular/scripts/generate-api.mjs` (signals-only API: `input()`,
 * `model()`, `output()`) and emits normalized component fragments under
 * `bindings.angular`. No Compodoc: the signals API is not expressible in the
 * decorator metadata Compodoc reads, and the repo already trusts this parser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ApiMember, Binding, ComponentModel } from '../schema.js';

const IMPORT_PATH = '@uni-design-system/uni-angular';

/** Component fragment: identity + the Angular binding, before merge. */
export type ComponentFragment = Pick<
  ComponentModel,
  'id' | 'name' | 'summary' | 'description' | 'category'
> & {
  /** Source path relative to the lib root, e.g. `components/button/button.component.ts`. */
  sourcePath: string;
  binding: Binding;
};

type ParsedMember = {
  name: string;
  kind: string;
  type: string;
  default?: string;
  doc: string;
};

type ParsedFile = {
  path: string;
  cls: string;
  selector: string;
  members: ParsedMember[];
  classDoc: string;
};

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) collect(p, out);
    else if (
      p.endsWith('.ts') &&
      !p.endsWith('.spec.ts') &&
      !p.endsWith('.stories.ts') &&
      !p.endsWith('.model.ts') &&
      !p.endsWith('.record.ts')
    )
      out.push(p);
  }
  return out;
}

/** JSDoc block immediately preceding an offset, flattened to one line. */
function jsdocBefore(src: string, index: number): string {
  const before = src.slice(0, index);
  const m = before.match(/\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*$/);
  if (!m) return '';
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

function parseFile(srcRoot: string, path: string): ParsedFile | null {
  const src = readFileSync(path, 'utf8');
  const decorator = src.match(/@(Component|Directive)\(\{([\s\S]*?)\n\}\)/);
  if (!decorator) return null;
  const meta = decorator[2];
  const selector = meta.match(/selector:\s*'([^']+)'/)?.[1];
  const cls = src.match(/export class (\w+)/)?.[1];
  if (!selector || !cls) return null;

  const members: ParsedMember[] = [];
  const memberRe =
    /^ {2}(?:readonly |override )*(\w+)\s*=\s*(input\.required|input|model\.required|model|output)(?:<([^=;]*?)>)?\((.*?)\);?$/gm;
  let m: RegExpExecArray | null;
  while ((m = memberRe.exec(src))) {
    const [, name, kind, type, defaultVal] = m;
    const lineStart = src.lastIndexOf('\n', m.index) + 1;
    const line = src.slice(lineStart, m.index + m[0].length);
    if (/^\s{2}(protected|private)/.test(line)) continue;
    let resolvedType = (type || '').trim();
    const def = kind.includes('required') ? undefined : defaultVal?.trim() || undefined;
    if (!resolvedType) {
      if (def === 'true' || def === 'false') resolvedType = 'boolean';
      else if (def && /^-?[\d.]+$/.test(def)) resolvedType = 'number';
      else if (def && /^['"`]/.test(def)) resolvedType = 'string';
      else resolvedType = 'unknown';
    }
    members.push({ name, kind, type: resolvedType, default: def, doc: jsdocBefore(src, m.index) });
  }

  const classDoc = jsdocBefore(src, src.indexOf(`export class ${cls}`));
  return { path: relative(srcRoot, path), cls, selector, members, classDoc };
}

/** Derive a stable, framework-neutral id from the class name. */
function idFromClass(cls: string): string {
  return cls
    .replace(/^Uni/, '')
    .replace(/(Component|Directive)$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function humanName(cls: string): string {
  return cls.replace(/^Uni/, '').replace(/(Component|Directive)$/, '');
}

const CATEGORY_BY_KEYWORD: Array<[RegExp, string]> = [
  [/input|checkbox|radio|toggle|select|slider|form|search|file-drop/, 'forms'],
  [/box|row|stack|center|wrap|grid|layout|divider|scroll|expand|card|menu|popover/, 'layout'],
  [/alert|snackbar|dialog|notification|tooltip|badge|progress/, 'feedback'],
  [/paginator|sort|data-table|data-search|tag/, 'data'],
  [/button|icon|symbol|text|background|theme-builder/, 'primitives'],
];

/** Classify a component by path segment first, then keyword heuristics. */
function classify(path: string, id: string): string {
  if (path.startsWith('cdk/')) return 'cdk';
  if (path.startsWith('directives/')) return 'directives';
  if (path.startsWith('theming/')) return 'theming';
  for (const [re, cat] of CATEGORY_BY_KEYWORD) if (re.test(id)) return cat;
  return 'components';
}

const MEMBER_KIND: Record<string, ApiMember['kind']> = {
  input: 'input',
  'input.required': 'input',
  model: 'model',
  'model.required': 'model',
  output: 'output',
};

function toApiMembers(members: ParsedMember[]): ApiMember[] {
  return members.map((mem) => ({
    name: mem.name,
    kind: MEMBER_KIND[mem.kind] ?? 'input',
    type: mem.type,
    required: mem.kind.includes('required'),
    default: mem.default,
    description: mem.doc,
  }));
}

/** Parse `packages/angular/src/lib` into Angular component fragments. */
export function ingestAngular(srcRoot: string): ComponentFragment[] {
  return collect(srcRoot)
    .map((p) => parseFile(srcRoot, p))
    .filter((e): e is ParsedFile => Boolean(e))
    // Drop internal story/demo/support components (mirrors generate-api.mjs).
    .filter(
      (e) =>
        !/story|demo/i.test(e.cls) &&
        !/datasource\.component|permissions\.component|timer\.component|local-storage\.component/.test(
          e.path,
        ),
    )
    .map((e) => {
      const id = idFromClass(e.cls);
      return {
        id,
        name: humanName(e.cls),
        summary: e.classDoc.split(/(?<=[.!?])\s/)[0] ?? '',
        description: e.classDoc,
        category: classify(e.path, id),
        sourcePath: e.path,
        binding: {
          importPath: IMPORT_PATH,
          selectorOrTag: e.selector,
          api: toApiMembers(e.members),
        },
      } satisfies ComponentFragment;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
