# Number Input, Stepper, Range & Slider — prototype

Design exploration for `uni-number-input`, `uni-quantity-stepper`,
`uni-number-range-input`, and `uni-slider` — closing the roadmap's
"Number input with increment/decrement steppers" item.

| File | What it is |
|---|---|
| `SPEC.md` | The component spec — value shapes, parsing rules, stepping model, keyboard maps, ARIA contracts, theme entries, open questions |
| `index.html` | Interactive prototype. Open it in a browser; no build step, no dependencies |
| `test.mjs` | Playwright script asserting 81 behaviours of the prototype (`node test.mjs`) |

## Running the prototype

```bash
open packages/angular/prototypes/number-input/index.html
```

## Running the behaviour checks

```bash
cd packages/angular/prototypes/number-input
npm i -D playwright && npx playwright install chromium
node test.mjs        # → 81/81 passed
```

`test.mjs` pins Chromium via `executablePath` (override with `CHROMIUM_PATH`);
drop that argument if you have Playwright's own browsers installed.

## Status

Nothing here ships. The prototype is deliberately vanilla JS/CSS so the
behaviour — the canonical-decimal value model, locale parsing, the snap-grid
stepping, hold-to-repeat, range swap/fence, slider thumb crossing — can be
argued about before it is committed to Angular, Emotion, and theme tokens.
The colours are the real Uni light/dark palettes dumped from
`@uni-design-system/uni-core` (seed `#4F46E5`, triadic, neutral), so what you
see is what the components will look like. All arithmetic — stepping, rounding,
clamping — runs on scaled BigInts over canonical decimal strings; nothing
numeric ever passes through a float, which is how `0.1 + 0.2` stays `0.3` and
`1.15` rounds to `1.2`.
