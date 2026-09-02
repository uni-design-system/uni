---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

`uni-button`: the focus ring is themed, and the theme now outranks the reset.

**Five of the twelve variants had no visible keyboard focus ring.** The ring
resolved the variant *name* as a colour token — the pattern 10.2.0 removed from
checkbox, radio and toggle, missed on the one component where it costs an
accessibility failure rather than a wrong colour:

```ts
outline: `2px solid ${this.theme.colors()[this.variant()]}`
```

`ghost` resolves to `transparent`, so its ring was drawn invisibly.
`light`, `onLight`, `dark` and `onDark` have no colour token at all, so the
declaration became `2px solid undefined` and the parser dropped it — as would
any intent a consumer registers. In every case `outline-offset` survived, so
the element still shifted on focus and the missing ring went unnoticed. This
was live without the registry involved.

The colour now comes from the variant's theme entry via `variantOptions`, the
mechanism the selection controls already use, and falls back to the reserved
`primary` accent rather than to nothing. Each variant keeps the ring colour it
had; `ghost` gains a visible one. The ring also routes through the shared
`focusRingStyle`, so a theme defining `focusRing` primitives restyles the button
alongside every other control.

**A theme could not give a button a border.** `border`, `outline`, `overflow`
and `transition` were applied *after* the theme's styles, so a variant
declaring a border was silently erased and `!important` was the only way
through — which then spread to every state adjusting that border, since the
shorthand outranks the longhand.

The base theme was caught by its own reset: `secondary` is commented "Hollow"
and declares `1px solid`, and has been rendering borderless. **It now renders
its border** — the one visible change here for anyone on the default theme.

Those four properties move ahead of the theme's styles, resolving the
`TODO: Set priority on theme-defined styles` that sat on this line. Structure
the component genuinely owns — `position` for the ripple, the symbol slots —
stays after, and the reset still applies to every variant that does not
override it.

**`uni-icon-button`'s hover moved to the theme too.** It branched on
`variant() === 'ghost'` to choose between a raised shadow and a translucent
wash, after the theme's own styles. Being a binary partition, every intent a
consumer registered fell into the not-ghost half and was given a lift whether
or not it suited — a recessive intent included — and no theme could correct it.
Both themes in this repo declare a ghost hover and had it silently overridden.

Both treatments now live in `iconButton.variants` beside the colours they belong
with. Rendering is unchanged for the variants the theme styles; a variant it
does not style no longer receives a hover it never asked for, and the `disabled`
variant loses one it should never have had, since its block is also spread into
`&:disabled`.

**`uni-icon-button` had no focus indicator at all.** Its structural block cleared
the user-agent outline and put nothing back, in every variant — so the close
affordance in every dialog and drawer header was unreachable-looking under
keyboard navigation. This was not reported; it was found while verifying the
button fix above.

It now draws the shared ring, with its colour read from the same
`variantOptions.focusColor` the button uses. The indicator is applied last on
purpose: its appearance is the theme's, through `focusColor` and the `focusRing`
primitives, but whether one exists is not a style a theme should be able to
switch off by accident.
