---
'@uni-design-system/uni-angular': minor
---

`uni-drawer` gains the API an editor panel needs, and a close it can refuse.

**Closing can now be vetoed.** Escape, the backdrop, the header's close button
and the footer's cancel all funnel through one decision that emits
`closeRequest` with a `reason` — `'escape' | 'backdrop' | 'close-button'`. Set
`disableAutoClose` and the drawer stops acting on its own: it asks, and waits
for you to set `open`.

That split exists because the confirmation it has to accommodate is
*asynchronous*. A synchronous veto — a preventable event — cannot express
"ask the user, then decide", so every consumer would prevent unconditionally
and close manually anyway. Leave `disableAutoClose` off and behaviour is
unchanged, so adding a listener alone breaks nothing.

```html
<uni-drawer [(open)]="open" [disableAutoClose]="form.dirty()"
            (closeRequest)="confirmDiscard()" />
```

New inputs: `width` (per-instance override of the theme's width — a nav drawer
is 280 and an editor panel 480, and both live in one app), `headline` and
`defaultCloseButton` for the header row, and `initialFocus`, a selector resolved
inside the panel when it opens.

**`ariaLabel` no longer defaults to `'Navigation'`.** A drawer with a header is
labelled by that header via `aria-labelledby`; without one, `ariaLabel` is used;
with neither, the drawer is unnamed. The old default meant every drawer that
wasn't a nav drawer announced itself as one, and a wrong accessible name is
worse than a missing one — the missing one is at least caught by an audit. If
you relied on it, set `ariaLabel="Navigation"` explicitly.

**`scrim` turns the dimming off** without changing the modality. As a `scrim`
input or a `drawer.behavior.scrim` theme option, false leaves `::backdrop`
transparent so the page behind stays legible — an editor panel beside a board
the user is still reading. Focus is still trapped and the page behind is still
inert: it is a visibility choice, not a modality one. `background` joins it,
selecting `solid`, `glass` or `gradient` as a token choice rather than per-app
CSS.

**Fixed: a closed overlay drawer rendered in normal flow behind the page.** The
panel's `display: flex` outranks the UA stylesheet's
`dialog:not([open]) { display: none }`, so the drawer was visible on first
paint and reappeared behind the content after every close. An explicit
`&:not([open])` rule restores it. The closing animation is unaffected — `open`
is only removed once it ends.
