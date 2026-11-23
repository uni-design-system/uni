/**
 * Lists the signal members — `input()`, `model()`, `output()` — a component or
 * directive declares, by reading its source. Shared by the two parsers that
 * publish a component's API: `generate-api.mjs` here (llms.txt) and
 * `packages/mcp/src/build/angular-adapter.ts` (the MCP index), so the two
 * cannot disagree about what a component accepts.
 *
 * Plain `.mjs` because `generate-api.mjs` runs on bare Node;
 * `signal-members.d.mts` types it for the MCP's TypeScript, and its specs
 * live with that adapter (`angular-adapter.spec.ts`).
 */

/** The JSDoc block immediately preceding an offset, flattened to one line. */
export function jsdocBefore(src, index) {
  const before = src.slice(0, index);
  // Content may not contain `*/`, so only the immediately preceding block matches.
  const m = before.match(/\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*$/);
  if (!m) return '';
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Read `<Type>(arg, …)` starting at `from`: the generic argument, if any, and
 * the call's top-level arguments. Brackets are balanced and strings skipped,
 * so the read survives a function type (`(row: T) => string` — the `>` of an
 * arrow closes nothing) and a call that wraps across lines.
 */
export function readCall(src, from) {
  let i = from;
  let type = '';
  if (src[i] === '<') {
    let depth = 0;
    const start = i + 1;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (ch === '<') depth++;
      else if (ch === '>' && src[i - 1] !== '=') {
        depth--;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) return null;
    type = src.slice(start, i);
    i++;
  }
  if (src[i] !== '(') return null;

  const args = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      current += ch;
      if (ch === '\\') current += src[++i] ?? '';
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    if ('([{'.includes(ch)) {
      depth++;
      if (depth === 1) continue; // the call's own opening paren
    } else if (')]}'.includes(ch)) {
      depth--;
      if (depth === 0) {
        if (current.trim()) args.push(current.trim());
        return { type, args };
      }
    } else if (ch === ',' && depth === 1) {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  return null;
}

/**
 * The first generic argument: `input<T, TransformT>` accepts `TransformT` but
 * holds and reports `T`, so the write type is not part of the member's type.
 */
export function firstTypeArg(type) {
  let depth = 0;
  for (let i = 0; i < type.length; i++) {
    const ch = type[i];
    if ('<([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch) || (ch === '>' && type[i - 1] !== '=')) depth--;
    else if (ch === ',' && depth === 0) return type.slice(0, i);
  }
  return type;
}

const flat = (text) => text?.replace(/\s+/g, ' ').trim() ?? '';

/**
 * Every public signal member declared in a class source, in source order.
 *
 * Only the head of a declaration is matched; its type and arguments are read
 * by `readCall`, because neither fits a single-line pattern: a function type
 * holds `=>`, and an options bag wraps onto further lines. The two-space
 * anchor is what skips `protected`/`private` members — those lines start with
 * the modifier.
 */
export function parseMembers(src) {
  const members = [];
  const memberRe =
    /^ {2}(?:readonly |override )*(\w+)\s*=\s*(input\.required|input|model\.required|model|output)(?=[<(])/gm;
  let m;
  while ((m = memberRe.exec(src))) {
    const [, name, kind] = m;
    const call = readCall(src, m.index + m[0].length);
    if (!call) continue;

    // `input(initial, options)` and `model(initial, options)` take a default
    // first; `input.required(options)` and `output(options)` take none.
    const hasDefault = kind === 'input' || kind === 'model';
    const def = hasDefault ? flat(call.args[0]) || undefined : undefined;
    const options = (hasDefault ? call.args[1] : call.args[0]) ?? '';

    let type = flat(firstTypeArg(call.type));
    // `input(false, { transform: booleanAttribute })` — the transform is what
    // makes a valueless attribute (`<uni-checkbox labelHidden>`) read as true.
    // Report the type the member holds, not the raw argument list.
    if (!type && /transform:\s*booleanAttribute/.test(options)) type = 'boolean';
    else if (!type && /transform:\s*numberAttribute/.test(options)) type = 'number';
    if (!type) {
      // No explicit generic: infer from the default value literal.
      if (def === 'true' || def === 'false') type = 'boolean';
      else if (def && /^-?[\d.]+$/.test(def)) type = 'number';
      else if (def && /^['"`]/.test(def)) type = 'string';
      else type = 'unknown';
    }

    members.push({
      name,
      kind,
      type,
      default: def,
      // The name a template binds, when `{ alias }` makes it differ.
      alias: options.match(/\balias:\s*['"]([^'"]+)['"]/)?.[1],
      doc: jsdocBefore(src, m.index),
    });
  }
  return members;
}
