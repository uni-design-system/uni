# Popover, Callout & Tour — prototype

Design exploration for the in-place upgrade of `uni-popover` (structured
regions, detached anchoring, tooltip mode) and the new `uni-callout` +
`uni-tour` attention layer, whose first application is product onboarding.

| File | What it is |
|---|---|
| `SPEC.md` | The component spec — APIs, theme entries, keyboard maps, ARIA contracts, the anchor-positioned spotlight design, open questions |
| `index.html` | Interactive prototype. Open it in a browser; no build step, no dependencies |
| `test.mjs` | Playwright script asserting 62 behaviours of the prototype (`node test.mjs`) |

## Running the prototype

```bash
open packages/angular/prototypes/popover/index.html
```

Requires a browser with CSS Anchor Positioning (Chrome/Edge 125+) — the
spotlight's scroll-tracking is the whole demo.

## Running the behaviour checks

```bash
cd packages/angular/prototypes/popover
npm i -D playwright && npx playwright install chromium
node test.mjs        # → 62/62 passed
```

`test.mjs` pins Chromium via `executablePath`; drop that argument if you have
Playwright's own browsers installed.

## Status

Nothing here ships. The prototype is deliberately vanilla JS/CSS so the
behaviour can be argued about before it is committed to Angular, Emotion, and
theme tokens. The colours are the real Uni light/dark palettes dumped from
`@uni-design-system/uni-core` (seed `#4F46E5`, triadic, neutral), so what you
see is what the components will look like. The headline trick to evaluate: the
spotlight scrim is built entirely from anchor-positioned elements, so the hole
tracks its target through scroll and resize with **zero JS listeners** — scroll
the page with a callout open.
