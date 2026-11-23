#!/usr/bin/env node
/**
 * Generates a compact, machine-readable API reference (llms.txt) for the
 * component library by parsing the component/directive sources.
 *
 * Regenerate with: pnpm docs:api
 * CI can diff the output to catch documentation drift.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { jsdocBefore, parseMembers } from './signal-members.mjs';

const SRC = new URL('../src/lib', import.meta.url).pathname;
const OUT = new URL('../llms.txt', import.meta.url).pathname;

/** Recursively collect candidate source files. */
function collect(dir, out = []) {
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

function parseFile(path) {
  const src = readFileSync(path, 'utf8');
  const decorator = src.match(/@(Component|Directive)\(\{([\s\S]*?)\n\}\)/);
  if (!decorator) return null;
  const meta = decorator[2];
  const selector = meta.match(/selector:\s*'([^']+)'/)?.[1];
  const cls = src.match(/export class (\w+)/)?.[1];
  if (!selector || !cls) return null;

  const members = parseMembers(src);
  const classDoc = jsdocBefore(src, src.indexOf(`export class ${cls}`));
  return { path: relative(SRC, path), cls, selector, members, classDoc };
}

const entries = collect(SRC)
  .map(parseFile)
  .filter(Boolean)
  // demo/story-support components are not public API
  .filter((e) => !/story|demo/i.test(e.cls) && !/datasource\.component|permissions\.component|timer\.component|local-storage\.component/.test(e.path))
  .sort((a, b) => a.cls.localeCompare(b.cls));

const lines = [];
lines.push('# @uni-design-system/uni-angular — API reference');
lines.push('');
lines.push('> Generated from source by scripts/generate-api.mjs (pnpm docs:api). Do not edit by hand.');
lines.push('');
lines.push('Themed Angular component library. Signals-only API: every input below is a');
lines.push('signal input — read as `component.name()`, bind as `[name]="..."`. Two-way');
lines.push('model inputs support `[(name)]`. Form controls implement Signal Forms');
lines.push('`FormValueControl`/`FormCheckboxControl` and bind with `[formField]`.');
lines.push('');
lines.push('Import everything from `@uni-design-system/uni-angular`.');
lines.push('Canonical selectors are the `uni-`-prefixed form; the short/PascalCase');
lines.push('aliases (e.g. `Checkbox`, `button[text-button]`) are supported secondaries.');
lines.push('');
lines.push('Inheritance (inputs listed once, available on all subclasses):');
lines.push('- Components extending `BaseComponent` also accept `variant: Variant` and `size: Size`.');
lines.push('- Layout components (`UniBoxComponent` and subclasses Row, Stack, Center, Wrap, Grid,');
lines.push('  MenuItem) also accept every `UniBoxComponent` input (padding*, border*, color,');
lines.push('  display, gap, width/height, flex/grid props, ...).');
lines.push('');

for (const e of entries) {
  lines.push(`## ${e.cls}`);
  lines.push(`- selector: \`${e.selector}\``);
  if (e.classDoc) lines.push(`- ${e.classDoc}`);
  const inputs = e.members.filter((m) => m.kind.startsWith('input'));
  const models = e.members.filter((m) => m.kind.startsWith('model'));
  const outputs = e.members.filter((m) => m.kind === 'output');
  if (inputs.length) {
    lines.push('- inputs:');
    for (const i of inputs) {
      const req = i.kind === 'input.required' ? ' (required)' : '';
      const def = i.default !== undefined && i.default !== '' ? ` = ${i.default}` : '';
      const alias = i.alias ? ` (bind as \`${i.alias}\`)` : '';
      lines.push(`  - \`${i.name}: ${i.type}\`${req}${def}${alias}${i.doc ? ` — ${i.doc}` : ''}`);
    }
  }
  if (models.length) {
    lines.push('- two-way models:');
    for (const i of models) {
      const def = i.default !== undefined && i.default !== '' ? ` = ${i.default}` : '';
      lines.push(`  - \`${i.name}: ${i.type}\`${def}${i.doc ? ` — ${i.doc}` : ''}`);
    }
  }
  if (outputs.length) {
    lines.push('- outputs:');
    for (const o of outputs) {
      lines.push(`  - \`${o.name}: ${o.type}\`${o.doc ? ` — ${o.doc}` : ''}`);
    }
  }
  lines.push('');
}

writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT} (${entries.length} components/directives)`);
