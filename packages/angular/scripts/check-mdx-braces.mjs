/**
 * Fails on a `{` sitting in MDX **prose**, where MDX compiles it to a JSX
 * expression.
 *
 * Writing `named "Increase {label}"` in a bullet makes `label` a reference to an
 * undefined variable, and the docs page dies at runtime with
 * `ReferenceError: label is not defined` under Storybook's "The component
 * failed to render properly" banner. Nothing else catches it: it is a React
 * render error rather than a compile error, so **`build-storybook` passes**, and
 * `check-doc-links.mjs` only looks at link ids. Only opening the page finds it.
 *
 * Braces are legitimate in four places, all skipped here: fenced code blocks,
 * inline code spans, ESM `import`/`export` statements, and JSX tags
 * (`of={Stories.X}`, `rows={[…]}`). MDX comment containers (`{/* … *\/}`) are
 * allowed too.
 *
 * The fix for a real hit is to wrap the text in backticks — `` `Increase
 * {label}` `` — or escape the brace as `\{`.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("find src -name '*.mdx'").toString().trim().split('\n').filter(Boolean);

/** Blank a span to spaces, keeping newlines so offsets still map to lines. */
const blankSpan = (chars, from, to) => {
  for (let i = from; i < to && i < chars.length; i++) {
    if (chars[i] !== '\n') chars[i] = ' ';
  }
};

/**
 * Blank JSX tags. Walks from `<Name` to its matching `>`, tracking quotes and
 * brace depth so an attribute like `rows={[{ a: 1 }]}` does not end the tag
 * early.
 */
const blankJsxTags = (chars) => {
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== '<' || !/[A-Za-z/]/.test(chars[i + 1] ?? '')) continue;

    let depth = 0;
    let quote = null;
    let j = i + 1;
    for (; j < chars.length; j++) {
      const c = chars[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '{') {
        depth++;
      } else if (c === '}') {
        depth--;
      } else if (c === '>' && depth === 0) {
        break;
      }
    }
    if (j >= chars.length) continue; // unterminated: leave it for the reader
    blankSpan(chars, i, j + 1);
    i = j;
  }
};

/** Blank ESM statements, including ones whose brace list wraps across lines. */
const blankEsm = (chars, source) => {
  const lines = source.split('\n');
  let offset = 0;
  let carry = 0; // unbalanced braces left open by a wrapped import

  for (const line of lines) {
    const starts = /^\s*(import|export)\s/.test(line);
    if (starts || carry > 0) {
      blankSpan(chars, offset, offset + line.length);
      for (const c of line) {
        if (c === '{') carry++;
        else if (c === '}') carry--;
      }
      if (carry < 0) carry = 0;
    }
    offset += line.length + 1;
  }
};

const problems = [];
let scanned = 0;

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const chars = [...source];

  // 1. Fenced code blocks.
  {
    const lines = source.split('\n');
    let offset = 0;
    let inFence = false;
    for (const line of lines) {
      const fence = /^\s*(```|~~~)/.test(line);
      if (fence || inFence) blankSpan(chars, offset, offset + line.length);
      if (fence) inFence = !inFence;
      offset += line.length + 1;
    }
  }

  // 2. ESM statements, then JSX tags, then inline code.
  blankEsm(chars, source);
  blankJsxTags(chars);

  let masked = chars.join('');
  // Inline code spans. They may soft-wrap across a line — Markdown allows it,
  // and the corpus does it — but not across a blank line, which ends the
  // paragraph and so bounds the damage an unpaired backtick can do. Newlines
  // survive the blanking so reported line numbers stay true.
  masked = masked.replace(/(`+)(?:(?!\1)[^\n]|\n(?![ \t]*\n))*\1/g, (m) =>
    m.replace(/[^\n]/g, ' ')
  );
  // MDX comment containers are a legitimate prose brace.
  masked = masked.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, (m) => m.replace(/[^\n]/g, ' '));

  scanned++;

  for (const match of masked.matchAll(/\{/g)) {
    const before = source.slice(0, match.index);
    const line = before.split('\n').length;
    const column = match.index - before.lastIndexOf('\n');
    const text = source.split('\n')[line - 1].trim();
    problems.push({ file, line, column, text });
  }
}

if (problems.length) {
  console.error(
    `✗ ${problems.length} brace${problems.length === 1 ? '' : 's'} in MDX prose — ` +
      `MDX reads these as JSX expressions, so the docs page throws at runtime:\n`
  );
  for (const { file, line, column, text } of problems) {
    console.error(`  ${file}:${line}:${column}`);
    console.error(`    ${text}\n`);
  }
  console.error('Wrap the text in backticks, or escape the brace as \\{.');
  process.exit(1);
}

console.log(`✓ no stray braces in the prose of ${scanned} MDX files.`);
