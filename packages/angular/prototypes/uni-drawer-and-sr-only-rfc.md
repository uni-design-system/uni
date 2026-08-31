# Uni: sr-only overflow escape, and Drawer gaps for editor-style panels

**For:** Uni Design System dev team
**From:** Wellsourced (web app, Angular 21.2.12)
**Package:** `@uni-design-system/uni-angular@10.0.0`, `@uni-design-system/uni-core@10.0.0`
**Date:** 2026-08-31

Two independent items. **§1 is a library bug** that can affect any scrolling shell in any consuming app. **§2–§6 are gaps** that stop `uni-drawer` from being usable as an editor/form panel; they are what we would need in order to retire our hand-rolled side panel and adopt Drawer.

---

## 1. BUG — `visuallyHidden` escapes its scroll container

### What happens

`visuallyHidden` is `position: absolute` with no guarantee of a positioned host:

```js
// fesm2022/uni-design-system-uni-angular.mjs
const visuallyHidden = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
};
```

It is applied at **15 sites** in the bundle (`srOnly`, `srOnlyClass`, `statusClassName`). The hosts that render it — including `uni-number-input`, `uni-quantity-stepper`, and the toggle's hidden `<input>` — are `position: static`.

CSS clips only those descendants whose containing-block chain runs through the clipper. Because these spans have no positioned ancestor nearby, their containing block resolves to whatever positioned box is above — often several scroll containers up — so they **skip the intervening `overflow: auto` entirely** and land in that distant ancestor's scrollable overflow.

### Evidence from our app

A right-hand `position: fixed` panel, containing a form with `uni-number-input` and `uni-quantity-stepper` fields:

```js
span = panel.querySelector('span.css-io473s')   // the sr-only span
getComputedStyle(span).position                 // "absolute"
span.parentElement.tagName                      // "UNI-NUMBER-INPUT"  (position: static)
span.offsetParent                               // → the fixed panel, 3 levels and 2 scrollers up
span.getBoundingClientRect().bottom             // 1891

panel.scrollHeight   // 1891   ← entirely from these 1×1 spans
panel.clientHeight   // 793
```

Enumerating the offenders inside the panel's body scroller:

```js
[...body.querySelectorAll('*')]
  .filter(e => getComputedStyle(e).position === 'absolute' && e.offsetParent === body)
// 7 hits, parents: UNI-NUMBER-INPUT, UNI-QUANTITY-STEPPER, LABEL (toggle's hidden input)
```

### Why this is the library's to fix

A visually-hidden helper should be inert. As written, it silently attaches itself to an arbitrary ancestor chosen by the consuming app's layout, and turns 1×1 invisible text into real, scrollable distance in a box that never opted into scrolling. Consumers cannot see it coming, and there are 15 emission sites, so there is no reasonable per-usage guard.

### Proposed fix

**Preferred — one line, fixes all 15 sites:**

```diff
 const visuallyHidden = {
-    position: 'absolute',
+    position: 'fixed',
```

A fixed-position box's containing block is the viewport, so it is excluded from every ancestor's scrollable overflow. The element is 1×1 and `clip-path`-ed to nothing, so its placement is irrelevant, and screen-reader behaviour is unchanged. Residual: inside a `transform`ed ancestor a fixed box re-anchors to that ancestor — worth a note, not worth chasing.

**Alternative:** add `position: 'relative'` to the root class of each of the 15 components that emit an sr-only child. More surface area, but keeps the helper's placement local and has no `transform` caveat.

**Not recommended:** dropping `position` from the recipe. Without it the element occupies 1px of flow, which shows up as a stray flex item.

### Guard

A unit test asserting that every element carrying the sr-only class is either `position: fixed` or has a positioned parent. This class of bug is invisible in isolation and only appears when a consumer nests the control inside a scrolling shell.

---

## 2. BUG — Drawer `over` mode makes the `<dialog>` itself the scroller

```js
// UniDrawerComponent.overClass
overClass = computed(() => {
    const options = this.componentOptions();
    const start = this.position() === 'start';
    return css({
        boxSizing: 'border-box',
        width: options.width ?? 280,
        maxWidth: '90vw',
        height: '100dvh',
        maxHeight: '100dvh',
        border: 'none',
        margin: start ? '0 auto 0 0' : '0 0 0 auto',
        overflowY: 'auto',                       // ← the dialog is the scroll container
        ...this.theme.colorPair(options.color),
        ...this.theme.padding(options.padding),  // ← and it owns the padding
        ...this.theme.boxShadow(options.elevation),
        '&::backdrop': { ...options.backdrop },
        '&[open]':    { animation: `${this.slideIn()} 250ms ease-out` },
        '&[closing]': { animation: `${this.slideOut()} 250ms ease-in` },
    });
});
```

Three consequences:

1. The `<dialog>` is top-layer and therefore the containing block for §1's escaping spans — so §1 reproduces inside a Drawer too. It is milder there only because Drawer has no pinned regions to tear away (see §3): you just scroll past the end of the content.
2. Padding on the scrolling box means a pinned header or footer is impossible without a consumer overriding library CSS.
3. `over` sets **only** `overflowY`. `side` correctly sets both axes:

```js
// UniDrawerComponent.sideClass — both axes explicit, good
overflowX: 'hidden',
overflowY: 'auto',
```

A single hidden axis computes the other to `auto`. That exact asymmetry is what turned our shell into an accidental scroller — worth making both axes explicit in `over` as well, and worth a lint rule.

### Proposed structure

Give `over` (and `side`) a three-row flex column:

```js
// dialog
padding: 0,
display: 'flex',
flexDirection: 'column',
overflow: 'clip',            // never a scroll container, both axes

// header row / footer row
flex: 'none',
padding: <own theme option>,

// body row — the only scroller
flex: '1 1 auto',
minHeight: 0,
position: 'relative',        // contains stray absolutes
overflowX: 'hidden',
overflowY: 'auto',
overscrollBehavior: 'contain',
padding: options.padding,
```

**Ordering matters.** `position: relative` on the body *without* `overflow: clip` on the shell is worse than the status quo: it re-parents the phantom overflow into the scroller, which then scrolls past the end of its real content. We tried exactly that in our app and reverted it. The two changes ship together; with §1 fixed, `position: relative` is defence in depth rather than the mechanism.

---

## 3. GAP — Drawer has one content slot; editor panels need pinned header and footer

`uni-drawer` projects into a single `<ng-content />`. `uni-dialog` already solves this shape with `uni-dialog-header` and `[dialog-buttons]`, each backed by its own theme options (`dialogHeader.behavior.*`, `dialogButtons.behavior.*`).

For reference, across our 7 side panels: **7/7 have a pinned footer action bar** (1–3 buttons plus a dirty-state label), and 1 has a pinned header (a "N of M" counter with prev/next navigation).

**Request:** `uni-drawer-header` and `[drawer-buttons]`, mirroring the dialog pair, with `drawerHeader.behavior.*` / `drawerButtons.behavior.*` options.

---

## 4. GAP — Drawer API for non-navigation use

Current API: `open` (model), `mode`, `position`, `ariaLabel`. Everything else is theme-only.

| Need | Today | Request |
|---|---|---|
| Per-instance width | `options.width ?? 280`, theme only | `width` input overriding `drawer.behavior.width`. Our panels are 480; a nav drawer is 280. Both exist in one app. |
| Headline + close button | none | `headline` input and `defaultCloseButton`, as `uni-dialog` has, rendered by `uni-drawer-header`. |
| Initial focus | native first-focusable | `initialFocus` selector input, as `uni-dialog` has. The native default lands on the first control, which for an editor panel is usually the wrong one. |
| Accessible name | `ariaLabel`, default `'Navigation'` | `aria-labelledby` from the header when present; keep `ariaLabel` as fallback. The current default is wrong for anything but a nav drawer. |

---

## 5. GAP — close cannot be vetoed

```js
onBackdropClick(event) {
    if (event.target.nodeName === 'DIALOG')
        this.open.set(false);
}

/** Route Escape through the animated close, keeping `open` in sync. */
onCancel(event) {
    event.preventDefault();
    this.open.set(false);
}
```

Both set `open` false unconditionally. Two of our panels run an **async** "Discard unsaved changes?" confirm on close and can cancel it, so a synchronous unconditional close loses work.

**Request:** a close-*request* output (or a close predicate) — the drawer asks, and only closes when the consumer sets `open` false. `uni-dialog` has the same limitation and would benefit from the same treatment.

---

## 6. Theme options to add

Defaults belong at the theme component options, per Uni's own convention. Existing: `drawer.behavior.color | width | divider | elevation | padding | backdrop`.

- **`scrim`** — optional. When off, `::backdrop` is transparent, giving a non-dimming drawer.
- **`background`** — `solid | glass | gradient`, so surface treatment is a token choice rather than per-app CSS.
- **`elevation`** — already present (`menu`); confirm it is read for `over` as well as `side`.
- Per-row padding options for the new header/footer rows (see §3).

---

## 7. Top-layer coexistence — snackbar / notifications

Once a drawer is a real modal `<dialog>`, everything outside it paints **beneath** the backdrop and is inert. Our toast stack sits beside the open panel today; as a modal it would be dimmed and unclickable — and saves from inside a panel are exactly when toasts fire.

**Request:** put `uni-snackbar` / `uni-notifications` in the top layer (popover API) so they remain visible and interactive above a modal drawer or dialog.

Nested `uni-dialog` confirms opened *from* a drawer are fine — a second `showModal()` stacks above the first.

---

## 8. Docs

- The Storybook **"Overlay"** story for Drawer renders `mode="side"` — it is a copy of the "Dashboard Shell" story, so `mode="over"` currently has no worked example.
- The MCP index reports Drawer as `Uni v9.0.0` while `10.0.0` is what installs.
- Both Drawer examples are navigation shells. An editor-panel example (header + scrolling form + pinned save bar) would document the shape §3–§5 are aimed at.

---

## 9. Acceptance criteria

A Storybook story: `uni-drawer mode="over"` containing a long form with a `uni-number-input` and a `uni-quantity-stepper` **near the bottom**, plus a pinned header and footer.

1. `dialog.scrollHeight === dialog.clientHeight`.
2. `dialog.scrollTop = 999` leaves `scrollTop` at `0`.
3. Wheeling over the footer moves nothing.
4. The body row scrolls to its last element and stops; the page behind does not move.
5. `[...dialog.querySelectorAll('*')].filter(e => getComputedStyle(e).position === 'absolute' && e.offsetParent === dialog)` is empty.
6. Escape and backdrop click raise a cancellable close request; vetoing keeps the drawer open.
7. Focus starts at `initialFocus` and is trapped inside the drawer.
8. A snackbar raised while the drawer is open is visible and clickable.

Items 1–3 fail today; they are the exact shape that broke us.

---

## Appendix — what we changed on our side

Our shell set only `overflow-x: hidden`, which computed `overflow-y` to `auto` and made it an accidental scroll container. That is ours, and it is fixed: `overflow: clip` on the shell, `overscroll-behavior: contain` on its body scroller. It is a stopgap that stops §1's escaping spans from becoming scrollable distance in our panel; it does not address §1 itself, which remains reachable by any other consumer with a scrolling shell.
