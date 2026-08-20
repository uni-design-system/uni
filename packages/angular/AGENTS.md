# Conventions — @uni-design-system/uni-angular

Guidance for contributors, human or AI. The generated API reference is in
[`llms.txt`](./llms.txt); accessibility contracts are in
[ACCESSIBILITY.md](./ACCESSIBILITY.md).

## Hard rules (enforced by ESLint as errors)

- **Signals only.** `input()` / `input.required()` / `model()` / `output()` /
  `computed()` / `signal()` / `linkedSignal()`. The legacy decorators
  (`@Input`, `@Output`, `@HostBinding`, `@HostListener`) are banned; use
  `host: { ... }` metadata instead.
- **`ChangeDetectionStrategy.OnPush` on every component.** The library is
  zoneless-ready; never inject `ChangeDetectorRef`.
- **Template a11y rules are errors.** Interactive elements must be focusable
  and keyboard-operable; labels must be associated.
- No `standalone: true` (it's the default), no `*ngIf`/`*ngFor` (use `@if`/`@for`).

## Architectural conventions

- **No rxjs.** Async/reactive state is signals; timers via the cdk `useTimer()`.
- **Styling is Emotion-only** (`css()` from `@emotion/css`), driven by theme
  tokens from `ThemeService`. No `.css`/`.scss` files for component styles
  (icon.component.scss is the grandfathered exception). Class strings are
  **memoized `computed()`s** bound via `host: { '[class]': 'className()' }` —
  never getters (they re-serialize on every CD cycle) and never fields written
  from `effect()`.
- **Native platform first:** `<dialog>` + `showModal()`, `popover="auto"`,
  native `<select>`/`<input>`, CSS Anchor Positioning via the cdk helpers
  (`anchorStyles`/`anchorArrowStyles`/`newAnchorName`). **Zero runtime
  dependencies** — adding one requires a maintainer decision.
- **Client-only:** the library assumes a browser (top layer, popovers).
  Guard any pre-render DOM access with `afterNextRender`.
- **Theming:** components inject `ThemeService` (usually via `BaseComponent`)
  and self-register a `COMPONENT_NAME` provider to read their options from the
  theme. `theme.focusRing()` is the shared focus indicator (use
  `focusRingStyle()` when the ring keys off your own selector, e.g.
  `&:focus + .checkbox`); a theme restyles it everywhere by defining
  `focusRing` border and/or shadow primitives.
- **Selectors:** each component declares a canonical `uni-*` selector plus a
  short alias (`uni-checkbox, Checkbox`). Use the canonical form in docs and
  examples.

## Form controls

Implement Signal Forms interfaces — `FormValueControl<T>` (a `value` model) or
`FormCheckboxControl` (a `checked` model) — plus the standard state block,
kept **explicit in every control** (do not extract it into a base class):

```ts
readonly disabled = input(false);
readonly touched = model(false);
readonly invalid = input(false);
readonly dirty = input(false);
readonly required = input(false);
readonly ariaDescribedBy = input<string>();
```

`showError()` gates `aria-invalid` on `invalid && (touched || dirty)`.
Controls do **not** render validation messages; apps do, associating them via
`ariaDescribedBy`.

## Accessibility requirements for new components

- Full keyboard operability (see ACCESSIBILITY.md for existing patterns —
  roving focus for composites, real `<button>`s for actions).
- ARIA state via host metadata; unique ids from the cdk `uniqueId()`.
- Icons (`Symbol`/`Icon`) are `aria-hidden` — the parent control provides the
  accessible name. Icon-only buttons need projected text or `ariaLabel`.
- Animations must respect reduced motion (global rule exists; don't fight it).

## Adding a component — checklist

1. `src/lib/components/<name>/` with `<name>.component.ts` (+ `.html` if not
   inline), `<name>.model.ts` for options, `index.ts` barrel; export from
   `src/lib/components/index.ts`.
2. Register theme options under `COMPONENT_NAME` in uni-core's theme if themed.
3. Spec file (`.spec.ts`, Vitest, decorator-free — see `vitest.config.ts` note)
   covering behavior **and** the ARIA contract.
4. `.stories.ts` + `.mdx` docs following the canonical MDX structure below —
   every code snippet must use real class names and canonical selectors
   (CI-able via `pnpm docs:api` + the mdx audit).
5. Update ACCESSIBILITY.md with the component's keyboard map.
6. `pnpm lint && pnpm test && pnpm build && pnpm docs:api` all green.

## Component docs (MDX) — canonical structure

Every component MDX page follows one flow, in this order. The MDX is
double-duty: it renders the Storybook docs page **and** feeds the MCP index
(`## Overview` → `whenToUse`; `## Do` / `## Don't` / `## Accessibility`
bullets → their guideline fields), so AI agents read exactly what humans read.

```mdx
import { Meta, Title } from '@storybook/addon-docs/blocks';
import * as Stories from './<name>.stories';
import { StoryUsage } from '../../../stories/blocks/StoryUsage';
import { StoryExample } from '../../../stories/blocks/StoryExample';
import { ThemeOptions } from '../../../stories/blocks/ThemeOptionsBlock';

<Meta of={Stories} />
<Title />

`import { UniXComponent } from '@uni-design-system/uni-angular';`

## Overview

When-to-use prose (2 short paragraphs max): what it is, when to reach for it,
what drives its styling. This text IS the MCP's when-to-use answer.

## Usage

<StoryUsage of={Stories.Primary} />

## <Named variation>            <!-- zero or more, meaningful names -->

<StoryExample of={Stories.Variation} />

## Theme options

<ThemeOptions componentName="<componentName>" />

## Accessibility                 <!-- bullets; feeds the MCP -->

- Keyboard/ARIA facts a consumer must know.

## Do                            <!-- optional; bullets; feeds the MCP -->
## Don't                         <!-- optional; bullets; feeds the MCP -->
```

Rules:

- **No property/API tables.** `StoryUsage` renders the controls (knobs) with
  descriptions from `argTypes` — that is the API reference. Sections named
  `Properties`, `Props`, `API`, `Methods`, or `Events` are legacy; fold their
  content into `argTypes` descriptions and delete them.
- **`## Usage` is the compact playground** — exactly one `StoryUsage` per
  page (story + source + knobs). Additional examples are `StoryExample`
  (no knobs) under named headings.
- **`## Theme options` is required** for any component with a `COMPONENT_NAME`
  theme entry — it shows the per-theme option tokens (live from the active
  theme), which the knobs cannot.
- Story templates in `.stories.ts` use layout attributes and canonical
  selectors — no inline `style="…"`, no raw hex (the MCP integrity lint
  rejects hex in the example corpus).

## Commands

```bash
pnpm test        # vitest (zoneless TestBed, jsdom + popover/dialog stubs)
pnpm lint        # eslint (a11y template rules + decorator bans are errors)
pnpm build       # ng-packagr → dist/
pnpm storybook   # local docs
pnpm docs:api    # regenerate llms.txt from source
```
