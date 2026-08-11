# Tag & Tag Input — prototype

Design exploration for the redesigned `uni-tag` and the new `uni-tag-input`,
whose first application is an email recipient field.

| File | What it is |
|---|---|
| `SPEC.md` | The component spec — API, theme entries, keyboard map, ARIA contract, open questions |
| `index.html` | Interactive prototype. Open it in a browser; no build step, no dependencies |
| `test.mjs` | Playwright script asserting 32 behaviours of the prototype (`node test.mjs`) |

## Running the prototype

```bash
open packages/angular/prototypes/tag-input/index.html
```

## Running the behaviour checks

```bash
cd packages/angular/prototypes/tag-input
npm i -D playwright && npx playwright install chromium
node test.mjs        # → 32/32 passed
```

`test.mjs` pins Chromium via `executablePath`; drop that argument if you have
Playwright's own browsers installed.

## Status

Nothing here ships. The prototype is deliberately vanilla JS/CSS so the
behaviour can be argued about before it is committed to Angular, Emotion, and
theme tokens. The colours are the real Uni light/dark palettes dumped from
`@uni-design-system/uni-core` (seed `#4F46E5`, triadic, neutral), so what you
see is what the components will look like.
