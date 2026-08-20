# Calendar, Date & Time Input — prototype

Design exploration for `uni-calendar`, `uni-date-input`, `uni-time-input`,
and the thin `uni-date-time-input` composer, whose first application is a
scheduling flow (pick a day → pick a slot).

| File | What it is |
|---|---|
| `SPEC.md` | The component spec — value shapes, APIs, theme entries, keyboard maps, ARIA contracts, open questions |
| `index.html` | Interactive prototype. Open it in a browser; no build step, no dependencies |
| `test.mjs` | Playwright script asserting 59 behaviours of the prototype (`node test.mjs`) |

## Running the prototype

```bash
open packages/angular/prototypes/date-input/index.html
```

## Running the behaviour checks

```bash
cd packages/angular/prototypes/date-input
npm i -D playwright && npx playwright install chromium
node test.mjs        # → 59/59 passed
```

`test.mjs` pins Chromium via `executablePath`; drop that argument if you have
Playwright's own browsers installed.

## Status

Nothing here ships. The prototype is deliberately vanilla JS/CSS so the
behaviour can be argued about before it is committed to Angular, Emotion, and
theme tokens. The colours are the real Uni light/dark palettes dumped from
`@uni-design-system/uni-core` (seed `#4F46E5`, triadic, neutral), so what you
see is what the components will look like. Values everywhere are plain ISO
strings (`2026-08-20`, `15:00`, `2026-08-20T15:00`) — never `Date` objects.
