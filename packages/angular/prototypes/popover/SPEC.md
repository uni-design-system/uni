# Popover, Callout & Tour — design spec

Status: **proposal / prototype**  ·  Target: `@uni-design-system/uni-angular`
Prototype: [`index.html`](./index.html) (open in a browser, no build step)

Three deliverables, one dependency chain:

1. **`uni-popover` v2** — the existing component, upgraded **in place**
   (recommendation: update, don't replace — the bones are right). It stays
   the anchored, arrowed, stays-open surface for extended help content and
   small forms, and gains a theme entry, detached anchoring, structured
   regions, an exposed `open` model, and a **tooltip mode** — so the
   library's missing tooltip becomes a popover behaviour, not a fourth
   overlay component.
2. **`uni-callout`** — a new attention layer built on the same machinery:
   an anchored onboarding call-out that can **dim the screen** and cut a
   **spotlight** around its target, which stays crisp and — when asked —
   interactive, so a callout can say *"type here"* and the user actually can.
3. **`uni-tour`** — a thin composer that sequences callouts into an
   onboarding flow: next/back, *"2 of 5"* progress, and **action-gated
   advance** (*click the Save button to continue*). Same pattern as
   `uni-date-time-input`: primitives stay independent, the composer adds no
   new vocabulary.

---

## Why update, not replace

v1's architecture is exactly what v2 needs: a native `popover` element in
the top layer, CSS Anchor Positioning via the cdk helpers, no listeners, no
dependencies. Nothing about the foundation is wrong — what's missing is
everything *around* it:

- **No theme entry.** `popover` isn't in `ComponentName`; the chrome
  (`primary-surface`, radius `xs`, shadow `raised`, border `quaternary`,
  `6px 12px` padding) is welded into the component. Every other surface
  reads `componentOptions()`.
- **The anchor is welded to the projected trigger.** The panel can only
  point at its own `[trigger]` content — an onboarding callout needs to
  point at *someone else's* input. (`uni-dropdown` already takes a detached
  `trigger: HTMLElement`; popover never got the same door.)
- **Open state is private.** `showing` is a private signal, there are no
  `opened`/`closed` outputs, and programmatic control means grabbing a
  template ref and calling methods. Agents can't write `[open]="..."`.
- **No structure.** Extended help content and small forms get ad-hoc
  markup; there is no header, no close affordance, no footer convention.
- **No hover behaviour** — and the library has no tooltip at all, so apps
  bolt on `title=""` or a third-party one, off-palette.

A replacement would re-ship the same foundation under a new name and break
every existing usage for zero architectural gain. Everything below is
**additive**; current templates compile and render unchanged (the theme
entry's defaults reproduce today's look pixel-for-pixel).

---

## Part 1 — `uni-popover` v2

### Anatomy

```
                       ┌ [popover-header] ─────────────┐
  ┌────────────┐       │  Header title             ✕  │ ← header row: `header` string or
  │  trigger   │  ◄──  ├───────────────────────────────┤   slot; ✕ when `closable`
  └────────────┘   ▲   │  body (default slot)          │
                 arrow │  — any content, incl. forms   │
                       ├───────────────────────────────┤
                       │  [popover-footer]     [Save]  │ ← actions row (optional)
                       └───────────────────────────────┘
```

All three regions are optional; a bare `<uni-popover>tip text</uni-popover>`
renders exactly today's single-region panel.

### API

```ts
// Existing — unchanged
placement = input<Placement>('bottom');
autoClose = input(true);                 // popover="auto" | "manual"
showPopover(); hidePopover(); togglePopover();   // methods stay

// New
open      = model(false);                // two-way; replaces the private signal.
                                         // [open]="tourStep() === 2" just works.
mode      = input<'rich' | 'tooltip'>('rich');
anchor    = input<HTMLElement | string>();  // detached anchor: element or id.
                                         // When set, [trigger] is optional.
header    = input<string>();             // convenience title (or [popover-header] slot)
closable  = input(false);                // renders the ✕ icon-button in the header row
arrow     = input(true);
maxWidth  = input<string | number>();    // default from theme (38ch)
openDelay = input<number>();             // tooltip mode; theme defaults
closeDelay= input<number>();

// Events
opened = output<void>();
closed = output<void>();
```

`anchor` follows the `uni-dropdown` precedent (it already takes a detached
`trigger: HTMLElement`): the component writes the generated `anchor-name`
onto the external element, and the panel points there. Anchoring and
*control* are deliberately separate: a projected `[trigger]` keeps the
disclosure ARIA even when the panel anchors elsewhere (button here, panel
pinned to the thing it explains); with no trigger at all, the app drives
`open` and owns the controller semantics — the component never puts
`aria-expanded` on an element that doesn't control it. A string anchor is
resolved as an element id at open time — the cheapest thing for an agent to
write: `anchor="email-field"`.

### `mode="rich"` (default — today's behaviour, structured)

Click toggles; native light dismiss when `autoClose`. Focus **stays on the
trigger** on open (APG disclosure pattern) — the panel sits immediately
after the trigger in the DOM, so <kbd>Tab</kbd> walks into its content
naturally and out the other side; the popover is non-modal and never traps.
Two additions:

- An element with the `autofocus` attribute inside the panel receives focus
  on open — that's **native** `popover` behaviour we inherit for free, and
  the right tool for the small-form case (*focus the input when the filter
  popover opens*).
- Closing via ✕ or `Escape` returns focus to the trigger (native top-layer
  behaviour; the ✕ path restores it explicitly).

### `mode="tooltip"` (new)

The trigger's hover and focus open the panel; leaving both closes it. The
panel is plain content — no focusable children (dev-mode warning), no
header/footer, tighter padding from the theme. Per **WCAG 1.4.13**:

- **Dismissable** — `Escape` hides it without moving focus.
- **Hoverable** — the pointer can travel from trigger into the panel;
  entering the panel cancels the close timer.
- **Persistent** — it stays while hovered/focused; only the timers close it.

Delays: `openDelay` 500ms on hover (0 on focus — keyboard users shouldn't
wait), `closeDelay` 150ms, both theme options. ARIA flips from the
disclosure contract to `role="tooltip"` + `aria-describedby` on the
trigger; `aria-expanded`/`aria-controls` are **not** set in this mode.

> **Alternative considered:** a separate `uni-tooltip` component. Rejected —
> it would duplicate the anchor/arrow/theming machinery to change only the
> open gesture and the ARIA wiring, and the library would then carry four
> overlay surfaces (dropdown, popover, tooltip, dialog) with three of them
> 90% identical. A mode keeps one vocabulary; if tooltip usage ever needs to
> diverge structurally, promotion to a component is a rename, not a rewrite.

### Keyboard map

**Focus on the trigger (`rich`)**

| Key | Behaviour |
|---|---|
| `Enter` / `Space` | toggles the popover (native button activation) |
| `Escape` | closes it when open (native light dismiss) |
| `Tab` | moves into the open panel's content — never trapped |

**Focus inside the panel (`rich`)**

| Key | Behaviour |
|---|---|
| `Escape` | closes and returns focus to the trigger |
| `Tab` / `Shift+Tab` | walks the panel's content, exits at either end naturally |

**`tooltip` mode**

| Interaction | Behaviour |
|---|---|
| pointer enters trigger | opens after `openDelay`; leaving before that cancels |
| pointer leaves trigger/panel | closes after `closeDelay` |
| trigger receives focus | opens immediately |
| trigger loses focus | closes immediately |
| `Escape` | closes without moving focus |

### States

| State | Visual | ARIA |
|---|---|---|
| closed | display: none (top layer) | trigger `aria-expanded="false"` (rich) |
| open | fade per theme transition; arrow on the anchor side | `aria-expanded="true"`; panel `aria-labelledby` → header when present |
| tooltip open | same chrome, `tooltipPadding` | `role="tooltip"`; trigger `aria-describedby` |
| detached anchor | identical panel; ARIA on the external element when focusable | — |

### Theme entry

Add `'popover'` to `ComponentName` and register — defaults chosen to
reproduce the current hardcoded look exactly:

```ts
popover: {
  options: {
    color: 'primary-surface',
    border: 'quaternary',
    borderRadius: 'xs',
    shadow: 'raised',
    typeface: 'label',
    padding: '6px 12px',
    maxWidth: '38ch',
    offset: 7,                 // mainAxis gap, px
    arrowSize: 8,
    closeSymbol: 'close',
    headerTypeface: 'title-small',
    tooltipPadding: '4px 8px',
    tooltipOpenDelay: 500,
    tooltipCloseDelay: 150,
  },
}
```

### Migration

None required. `placement`, `autoClose`, the three methods, and both
projection slots keep their exact behaviour; `togglePopover`'s `MouseEvent`
argument becomes optional. The only observable change is that panel chrome
now reads from the theme — with defaults equal to the old constants.

### Accessibility contract

- Rich mode is the **disclosure** pattern: `aria-expanded` + `aria-controls`
  on the focusable trigger (resolved via `resolveFocusTarget`, as today).
- With `header`/`closable`, the panel gets `aria-labelledby` pointing at the
  header text; the ✕ is a real `icon-button` named *"Close"*.
- Tooltip mode is `role="tooltip"` + `aria-describedby`; the tooltip's text
  is its accessible description, never its name.
- No focus trap in either mode — the popover is non-modal by definition;
  anything that needs modality is `uni-dialog`'s job (or `uni-callout`'s,
  below).
- The fade respects the global reduced-motion rule.

---

## Part 2 — `uni-callout`

An onboarding call-out: an anchored panel that grabs attention by dimming
everything **except** its target. Composes the popover surface (same anchor
cdk, arrow, theme chrome family) plus an attention layer and stronger focus
semantics.

### Anatomy

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← scrim (dimmed page)
░░░░┌─────────────────────┐░░░░░░░░░░░░░░░░░
░░░░│ ▒▒▒ target input ▒▒▒│░░  ← spotlight hole: crisp, optionally
░░░░└─────────────────────┘░░     interactive, ring in the variant colour
░░░░░░░░░░░░▲░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░┌───────────────────────────────┐░░░░░░░
░░░░│ [callout-media]               │░░  ← optional image/illustration
░░░░│ Header title              ✕  │░░
░░░░│ Body copy — the default slot  │░░
░░░░│ [callout-actions]     [Next]  │░░
░░░░└───────────────────────────────┘░░░░░░░
```

### The spotlight is native anchor positioning — no listeners

The obvious implementation (measure `getBoundingClientRect`, cut a
`clip-path` hole, re-measure on scroll/resize) is exactly the machinery the
library just deleted with floating-ui. Instead the scrim is built from
anchor-positioned pieces, and **the browser tracks the target** through
scroll, resize, and layout changes with zero JS:

- **Visual:** one *window* element pinned to the target on all four edges —
  `top: calc(anchor(top) - pad)` … `bottom: calc(anchor(bottom) - pad)` —
  with the theme's spotlight `borderRadius` and a giant outer
  `box-shadow: 0 0 0 200vmax <scrim>`. An outer shadow of a rounded rect
  paints *everything outside it*, rounded corners included, and paint is all
  it does: `pointer-events: none`, so the hole is click-through by nature.
- **Hit-testing:** four transparent strips (top/bottom/left/right of the
  hole), each pinned with the same `anchor()` insets, `pointer-events: auto`.
  They block every click that isn't on the target; the hole between them is
  genuinely empty space.
- **`targetInteractive=false`:** a fifth transparent cover, pinned over the
  hole, blocks the target too (spotlight as pure attention, e.g. pointing at
  something the current step only *explains*).
- **No target:** the strips collapse to one full-viewport scrim and the
  panel centers (`backdrop="dim"` is this same degenerate case with a target).

Scrim and panel are both `popover="manual"` elements shown in order
(scrim first), so top-layer stacking is deterministic and the pair sits
above every `z-index` in the app — including open dialogs.

Opening a callout first scrolls an off-screen target to the viewport
center (`scrollIntoView({ block: 'center' })`, instant under reduced
motion rules) and focuses the panel with `preventScroll` — a spotlight on
something the user can't see is pointing at nothing, and a target parked
under a sticky header is unclickable however honest the hole is. The
anchor-positioned scrim needs no re-measurement afterwards.

### API

```ts
open   = model(false);
key    = input<string>();                 // stable id, echoed in `dismissed`
target = input<HTMLElement | string>();   // what it points at; absent = centered
placement = input<Placement>('bottom');
backdrop  = input<'spotlight' | 'dim' | 'none'>();
                                          // default: 'spotlight' when target set,
                                          // 'dim' otherwise
targetInteractive = input(true);
dismissible       = input(true);          // ✕ + Escape
dismissOnBackdrop = input(false);         // a stray click shouldn't kill onboarding
header  = input<string>();
variant = input<Variant>('primary');      // spotlight ring + accent colour role
arrow   = input(true);

// Events
opened    = output<void>();
closed    = output<void>();
dismissed = output<UniCalloutDismissal>();
```

```ts
export interface UniCalloutDismissal {
  key?: string;
  reason: 'close-button' | 'escape' | 'backdrop' | 'programmatic';
}
```

Slots: `[callout-media]` (full-bleed top), `[callout-header]` (or the
`header` string), default body, `[callout-actions]`.

### Dismissal persistence — hooks, not storage

The component never touches storage (library rule). "Don't show again" is
three lines in the app, and `key` + `dismissed` exist to make them three:

```html
@if (!seen('save-shortcut')) {
  <uni-callout key="save-shortcut" [target]="saveBtn" [open]="true"
               (dismissed)="markSeen($event.key!)">
    You can press Ctrl+S anywhere.
  </uni-callout>
}
```

The cdk's `local-storage` helper is the natural `markSeen` backend for apps
that want one; the component stays storage-free either way.

### Focus contract — the duet loop

A spotlight callout is *modal-ish*: the scrim blocks the pointer everywhere
except the target, and keyboard reach should match what the eye is told:

- On open, focus moves into the panel: the first `[autofocus]` element, else
  the first focusable, else the panel itself (`tabindex="-1"`).
- `Tab` cycles a **duet loop**: the panel's focusables plus — when
  `targetInteractive` — the target itself. The pattern *"focus the input,
  type, Tab back to Next"* works without focus ever escaping to the dimmed
  page.
- On close, focus returns to where it was before opening — unless the user
  moved it into the target, in which case it **stays there** (they were sent
  there on purpose; yanking it back would undo the callout's whole job).
- The panel is `role="dialog"`, labelled by the header (or the body text
  when there is no header). `aria-modal` is **not** set: the target must
  stay in the accessibility tree, and dimmed content is inert to the
  pointer, not hidden. (Full `inert` on the rest of the page is an open
  question below.)

### Keyboard map (callout open)

| Key | Behaviour |
|---|---|
| `Tab` / `Shift+Tab` | cycles the duet loop (panel focusables + interactive target) |
| `Escape` | dismisses (`reason: 'escape'`) when `dismissible`; from inside the target too |
| `Enter` on a focused action | activates it (real buttons, nothing synthetic) |

### States

| State | Visual | ARIA |
|---|---|---|
| open, spotlight | scrim + crisp hole + ring in `variant` colour | panel `role="dialog"` labelled |
| open, dim | uniform scrim, centered or anchored panel | same |
| open, none | panel only — an emphasized popover | same |
| target non-interactive | hole blocked; no ring pulse | target keeps its own semantics |
| entering / leaving | scrim fades, panel fades+lifts, per theme; reduced motion → instant | — |

The spotlight ring is shape as well as colour (WCAG 1.4.1): the hole's
edge + the arrow both mark the target even in forced-colors mode.

### Theme entry

```ts
callout: {
  options: {
    color: 'primary-surface',
    borderRadius: 'xs',
    shadow: 'menu',
    width: '320px',
    padding: '16px',
    headerTypeface: 'title-small',
    typeface: 'label',
    closeSymbol: 'close',
    arrowSize: 8,
    offset: 12,
    scrimColor: 'rgba(0, 0, 0, 0.45)',   // same in both schemes, like ::backdrop
    spotlightPadding: 6,
    spotlightRadius: 'xs',
    ringWidth: 2,
    transitionMs: 250,
  },
}
```

The ring colour is **not** an option — it is the `variant` role, the same
rule every component follows.

---

## Part 3 — `uni-tour`

A thin sequencer over `uni-callout`. One component instance renders the
whole tour; steps are data, so an agent can author a complete onboarding
flow as one array literal.

### Step shape

```ts
export interface UniTourStep {
  key: string;                       // stable id — progress, resume, analytics
  target?: HTMLElement | string;     // resolved at step start; absent = centered
  title: string;
  body: string;                      // plain text; richer content via a step template slot
  placement?: Placement;
  backdrop?: 'spotlight' | 'dim' | 'none';
  targetInteractive?: boolean;
  advanceOn?: UniTourAdvance;        // action gate — see below
}

export type UniTourAdvance = {
  event: string;                     // DOM event to await, listened on the target
  auto?: boolean;                    // advance the moment it fires
                                     // default: true for 'click', false otherwise
};
```

### API

```ts
steps  = input.required<UniTourStep[]>();
active = model<number | null>(null);      // null = not running; two-way
                                          // (deep-linkable: [active]="2" just works)
// i18n — inputs, not theme options (labels are copy, not style)
nextLabel = input('Next'); backLabel = input('Back');
skipLabel = input('Skip'); doneLabel  = input('Done');

// Events
started     = output<void>();
stepChanged = output<{ key: string; index: number }>();
finished    = output<void>();                       // Done on the last step
skipped     = output<{ key: string; index: number }>();  // ✕ / Escape / Skip

// Methods (sugar over `active`)
start(at = 0); next(); back(); skip();
```

The tour renders one `uni-callout` and drives it: footer = **Back** ·
progress · **Next**/**Done**; header ✕ = skip. `Back` is hidden on the
first step, `Next` becomes `Done` on the last. Progress renders as dots or
a *"2 of 5"* fraction (`progressStyle` theme option) — and is announced as
part of the dialog's accessible name either way.

**Resilient steps:** a step whose `target` selector matches nothing (a
hidden panel, a feature-flagged button) is **skipped with a dev-mode
warning**, not an error — a tour must survive the app changing under it.

**Persistence** mirrors the callout: `finished`/`skipped` carry everything
an app needs to record; `[active]` restores any position. The component
stores nothing.

### Action-gated advance

`advanceOn` turns a step from *"read this"* into *"do this"*:

- `{ event: 'click' }` on a *"now click Save"* step: **Next is replaced by
  the action itself** — the button row shows only Back, and clicking the
  spotlit target advances the tour (`auto` defaults true for clicks; the
  action was the point).
- `{ event: 'input' }` on a *"type your project name"* step: Next renders
  **disabled** with the step's hint until the target fires `input`, then
  enables. No auto-advance mid-typing (`auto` defaults false).
- Gated steps force `targetInteractive: true` — a step cannot demand an
  action while blocking it.
- The gate state is announced: *"Next available"* through the live region
  when it unlocks.

> **Alternative considered:** a `predicate: () => boolean` gate. Rejected
> for v1 — it needs polling or an effect per step, and every real case we
> could name (click it, type in it, pick one) is an event on the target.
> A signal-based gate can land later without breaking the event form.

### Keyboard map (tour running)

| Key | Behaviour |
|---|---|
| `ArrowRight` / `ArrowLeft` | next / back — **only while focus is in the panel** (never stolen from a target being typed in) |
| `Enter` | activates the focused button |
| `Escape` | skips the tour (`skipped` with the current step) |
| `Tab` | the callout's duet loop, unchanged |

### Announcements

Each step's panel is labelled *"{title}, step {n} of {total}"*, so entering
a step reads naturally. Gate unlocks and step changes route through one
`role="status"` region per tour. On advance, focus moves to the new panel
(the duet loop re-seats); on finish/skip, focus returns to the pre-tour
position.

### Theme entry

```ts
tour: {
  options: {
    progressStyle: 'dots',      // 'dots' | 'fraction'
    footerGap: 'sm',
  },
}
```

Everything else — panel chrome, scrim, spotlight — is the `callout` entry;
the tour deliberately has almost no skin of its own.

---

## What the prototype already proves

`index.html` is behaviour-complete for everything above; `test.mjs`
(Playwright, `node test.mjs`) drives it headlessly and asserts the
behaviours — worth porting straight into the Vitest specs:

- popover rich mode: click toggle, `aria-expanded`/`aria-controls`, light
  dismiss (outside click + `Escape`), focus return, header + ✕, footer
  actions, a working small form with native `autofocus`
- detached anchor: a popover pointing at an element it doesn't contain,
  ARIA wired onto that element
- tooltip mode: hover open after delay, instant open on focus, hoverable
  panel (pointer can cross the gap), `Escape` dismiss without focus loss,
  `role="tooltip"` + `aria-describedby`, no `aria-expanded`
- callout: spotlight hole tracks the target through scroll and resize with
  no JS listeners (assertion scrolls the page and re-measures), target
  stays clickable through the hole, strips block outside clicks,
  `targetInteractive=false` blocks the hole, dim + centered when no target
- callout focus: initial focus into the panel, duet-loop `Tab` cycle
  including the target, `Escape` dismissal with reason, focus restore
- tour: start/next/back, "n of N" progress + dots, ✕ and `Escape` skip
  with step payload, `Done` finishes, missing-target step skipped with a
  warning, `ArrowRight`/`ArrowLeft` only act from inside the panel
- action gating: a click-gated step advances on the real click and shows no
  Next; an input-gated step enables Next only after typing, announces the
  unlock, and never auto-advances
- light/dark parity on the real generated palettes; reduced-motion styles

## Open questions

1. **`inert` for the dimmed page.** The duet loop keeps `Tab` honest, but a
   screen reader's virtual cursor can still wander into dimmed content.
   Applying `inert` to the page minus the target's subtree is stronger and
   messier (the target's ancestors can't be inert-ed, so blocking is
   per-branch). Ship the loop first; measure with real SR users.
2. **A beacon primitive** — the pulsing dot that *invites* a callout rather
   than opening one unprompted. Cheap on top of `uni-callout`
   (`beacon` input: render a dot on the target; click swaps it for the
   callout). Deferred until a product asks.
3. **Should popover v2 rebase onto `uni-dropdown` internally?** They now
   share anchor plumbing and theme-driven chrome; dropdown lacks the arrow
   and the disclosure ARIA. Worth folding into one internal surface when
   one of them next needs real work — not worth churn on its own.
4. **Router-spanning tours.** A step whose target lives on another route
   needs navigation hooks and a persistence story — that's an app-level
   orchestration (or a future `TourService`), deliberately out of scope for
   the component library.
5. **Rich step bodies.** `body: string` covers onboarding copy; embedded
   forms/media per step need a template slot keyed by step
   (`*uniTourStep="'profile'"`). The slot is designed but not prototyped.
6. **Tooltip-mode singleton.** Should only one tooltip be visible
   app-wide (pointer sweeps across a toolbar)? The close-delay already
   approximates this; a shared service would make it exact.

## Checklist to ship (per `packages/angular/AGENTS.md`)

- [ ] `'popover'`, `'callout'`, `'tour'` added to `ComponentName`; theme
      entries in uni-core's base theme (popover defaults = current look)
- [ ] `popover/` upgraded in place (theme entry, `open` model, `anchor`,
      modes, regions) — existing API untouched
- [ ] `callout/` component + model; scrim/spotlight helpers in the cdk
      (`spotlightStyles(anchor, pad)` beside `anchorStyles`) — pure
      functions, unit-tested hard
- [ ] `tour/` component, model, barrel; export all from `components/index.ts`
- [ ] Specs covering the keyboard maps **and** the ARIA contracts, incl.
      tooltip-mode WCAG 1.4.13 behaviours and the duet loop
- [ ] `.stories.ts` + `.mdx` each (Overview / Usage / variations / Theme
      options / Accessibility / Do / Don't)
- [ ] `ACCESSIBILITY.md`: all three keyboard maps
- [ ] `pnpm lint && pnpm test && pnpm build && pnpm docs:api`
