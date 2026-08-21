# Combobox — prototype

Design exploration for `uni-combobox`: the form-bound, closed-set,
single-select autocomplete that closes the roadmap's "Combobox /
autocomplete" item.

| File | What it is |
|---|---|
| `SPEC.md` | The component spec — API, draft-resolution rules, keyboard map, ARIA contract, CDK changes, open questions |
| `index.html` | Interactive prototype. Open it in a browser; no build step, no dependencies |
| `test.mjs` | Playwright script asserting 41 behaviours of the prototype (`node test.mjs`) |

## Running the prototype

```bash
open packages/angular/prototypes/combobox/index.html
```

## Running the behaviour checks

```bash
cd packages/angular/prototypes/combobox
npm i -D playwright && npx playwright install chromium
node test.mjs        # → 41/41 passed
```

`test.mjs` pins Chromium via `executablePath` (override with `CHROMIUM_PATH`);
drop that argument if you have Playwright's own browsers installed.

## Status

Nothing here ships. The prototype is deliberately vanilla JS/CSS so the
behaviour — the draft model, the four commit-resolution rules, disabled-option
skipping, the Escape ladder — can be argued about before it is committed to
Angular, Emotion, and theme tokens. The colours are the real Uni light/dark
palettes dumped from `@uni-design-system/uni-core` (seed `#4F46E5`, triadic,
neutral), so what you see is what the component will look like.
