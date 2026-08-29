---
'@uni-design-system/uni-angular': patch
---

Lint MDX prose for stray `{`, which MDX compiles to a JSX expression.

Writing `named "Increase {label}"` in a docs bullet makes `label` a reference to
an undefined variable, and the page dies at runtime with
`ReferenceError: label is not defined` under Storybook's "The component failed to
render properly" banner. Nothing caught it: it is a React render error rather
than a compile error, so **`build-storybook` passes**, and `check-doc-links.mjs`
only validates link ids. Only opening the page found it — twice.

`scripts/check-mdx-braces.mjs` now runs as part of the package's `lint` script,
so `turbo run lint` (and therefore CI) fails on it. It skips the four places a
brace is legitimate — fenced code blocks, inline code spans including ones that
soft-wrap across a line, ESM `import`/`export` statements, and JSX tags such as
`of={Stories.X}` or `rows={[…]}` — plus MDX comment containers. Hits are
reported as `file:line:column` with the offending line and the fix: backtick the
text, or escape the brace as `\{`.

Also available on its own as `pnpm lint:mdx`.
