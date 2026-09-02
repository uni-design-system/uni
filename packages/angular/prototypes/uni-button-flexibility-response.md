# Response: `Variant` registry — the four open items

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `uni-button-flexibility-cr.md`, revision 4
**Date:** 2026-09-01

Three of the four are fixed and ship in **10.3.0**. The fourth is a decision, and
the answer is no, with reasoning. §8's remaining ask was already satisfied in
10.2.1.

Revision 4 was accurate. Where it was wrong it understated the problem twice, and
we have said so below rather than quietly widening the fix.

---

## §1 — focus ring: fixed, and wider than you measured

You found `ghost` and consumer-registered intents. It was **five of our own
twelve**, all live in 10.2.1 with no registry involved:

| variant | `colors[variant]` | emitted outline |
|---|---|---|
| `ghost` | `rgba(0,0,0,0)` | transparent — present and invisible |
| `light`, `onLight`, `dark`, `onDark` | `undefined` | `2px solid undefined` — dropped |

The other seven happened to resolve. As you noted, `outline-offset` survived in
every case, so the element still shifted on focus and the missing ring went
unnoticed — including by us.

The colour now comes from the variant's theme entry through `variantOptions`,
the same mechanism the selection controls use, and falls back to the reserved
`primary` accent rather than to nothing:

```ts
button: { variantOptions: { primary: { focusColor: 'primary' }, … } }
```

Each variant keeps the ring colour it already had; `ghost` gains a visible one.
The ring also routes through the shared `focusRingStyle`, so a theme defining
`focusRing` border/shadow primitives now restyles the button alongside every
other control — previously it could not.

**For your theme:** set `focusColor` per intent under `button.variantOptions`.
Anything you leave unset gets `primary`, which is visible but probably not what
you want for `destructive`.

### And one you did not report

Verifying the above turned up something worse next door: **`uni-icon-button` had
no focus indicator at all.** Its structural block cleared the user-agent outline
and put nothing back, in any variant — so unlike the button, which at least
worked for seven of twelve, this one never drew a ring for anyone. It is the
close affordance in every dialog and drawer header, which makes it the icon
button your users are most likely to reach by keyboard.

Fixed the same way, reading `focusColor` from `iconButton.variantOptions`. Worth
checking against your own theme, since you will not have seen a ring there
either.

---

## §4 — ordering: fixed, and our own theme was the proof

`border`, `outline`, `overflow` and `transition` now precede `style()`,
resolving the `TODO: Set priority on theme-defined styles` that sat on that
exact line. Structure the component genuinely owns — `position` for the ripple,
the symbol slots — stays after.

You were more right than the CR claims. It is not only that a consumer could not
set a border: **our own base theme could not either.** Its `secondary` variant
is commented `// Hollow` and declares `1px solid`, and has been rendering
borderless since the reset was introduced. The component was also re-declaring
`border: '0'` on top of the theme's `fixed` block, which already said the same
thing — overriding the theme with a copy of itself.

**One visible change, which should not reach you.** `secondary` buttons on the
default theme now render their border. You define your own `secondary`, so you
are unaffected — we are noting it because it is the same mechanism as your
acceptance criterion 3: the `fixed` block's `border: 1px solid transparent`
finally applying. Anyone inheriting our `secondary` gains a 1px edge.

You should be able to delete all seven `!important` declarations you identified.

---

## §3 — the literal: fixed, and we would push back on "tidiness"

Revision 4 downgraded this on the grounds that `ghost` cannot be removed under
an extend-only registry. That is true and it is not the problem.

`variant() !== 'ghost'` is a **binary partition of an open set**. There is no
third branch, so every intent you register falls into the not-ghost half and
receives a raised shadow — including `subtle`, which your own appendix defines
as the recessive, hollow intent. A lift on hover is the opposite of recessive.
And because the branches ran *after* the theme, you could not have corrected it:
both themes in this repository — the Carbon experiment and our mirror of yours —
declare a ghost hover and had it silently overridden. Yours was overridden
*partially*, since the component only set `background-color`, leaving your
`color` applied and your background replaced.

So it was the same defect as §1 and §4, not a leftover: a component deciding
*visual application* from an *intent name*, which is the thing your governing
principle forbids. Both treatments now live in `iconButton.variants` beside the
colours they belong with.

**Two behaviour changes:** a variant the theme does not style no longer receives
a hover it never asked for, and the `disabled` variant loses one it should never
have had — that block is also spread into `&:disabled`, so it was lifting a
control that cannot be pressed. **Theme a hover for each intent you register**,
or it will have none.

---

## §6 — `Size` stays closed

The answer is no, and the reason is that the two are not symmetrical.

A **variant** resolves against a theme entry *you* write. If you register
`destructive` and forget to style it, there is a sensible fallback and we warn
you once in dev. The set is open because its meaning is yours to define.

A **size** resolves against geometry the *component* needs — a track width, a
knob inset, a row height. An unregistered size has nothing to resolve to and no
sensible fallback: the component cannot guess what `roomy` measures. That is
what `size.types.ts` means by "Closed on purpose".

The seven t-shirt steps are the ladder, and what a step *means* is entirely
yours: `toggle.sizes.sm` is whatever width, height and padding your theme says.
Your segmented pill landing on `xs` because it was the nearest free name is a
naming pinch rather than a capability one — the geometry you wanted was
expressible, the label just read oddly. We would rather leave that than open a
scale with no fallback story.

If you hit a case where seven genuinely is not enough steps, reopen it and we
will look again.

---

## The `ghost` → `subtle` rename: declined

You are right that `ghost` is presentational and the odd one out. We are not
renaming it, because it is a published name in an extend-only set: renaming
breaks every consumer using it and every theme keyed on it, for a naming
improvement.

The registry already gets you what you want. Register `subtle`, theme it, and
never write `ghost`. Our name remaining legal in your app is a lint concern, as
the contract says — it is not a constraint on your vocabulary.

---

## §8 — the index stamp was already fixed in 10.2.1

`uni-mcp@10.2.0` did stamp `10.1.0`; the cause was build ordering, not data.
`tsup` inlines `uni-index.json` into the bundle, and the dist was built before
`changeset version` ran, so the publish shipped an index stamped for the
previous release. `version-packages` now rebuilds the package after
regenerating the index.

Verified in the published artifact:

```
uni-mcp@10.2.0  meta=10.1.0  button=10.1.0
uni-mcp@10.2.1  meta=10.2.1  button=10.2.1   ✓
```

Move to **10.2.1 or later** and the server describes the release that carries
it. Thank you for separating this from the npx-cache half — that distinction is
what made it findable.

---

## Please state the version you measured against

The v9.0.0 report cost us both a cycle. For the record of what each build
actually says:

| `uni-mcp` | stamps |
|---|---|
| 4.7.0 | 8.2.0 |
| 4.7.1 | 8.3.0 |
| **4.7.2** | **9.0.0** ← the one you were running |
| 4.7.3 | 10.1.0 |
| 10.2.0 | 10.1.0 (the ordering bug) |
| 10.2.1 | 10.2.1 |

Now that versions are aligned, **pin `uni-mcp` to your installed
`uni-angular`** rather than tracking `@latest` — that is what the alignment was
for, and `@latest` through `npx -y` is what pinned you to 4.7.2 in the first
place. Quoting the server version alongside any MCP-sourced claim would let us
tell a stale index from a real defect immediately.

---

## Your acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Visible focus ring for a registered variant and for `ghost` | **met** — asserted on the emitted rule, not by eye |
| 2 | A variant can set `border`/`outline`/`overflow`/`transition` with no `!important`, states included | **met** |
| 3 | `fixed`'s `border: 1px solid transparent` actually renders | **met** — follows from 2 |
| 4 | No component branches on a variant name literal | **met** |
| 5 | Output unchanged except `ghost` gaining a ring | **met** — plus icon buttons gaining a ring they never had. `secondary` gains a border on the default theme only, which your own `secondary` shields you from |

Covered by 909 tests. Each fix was verified by reverting it and confirming the
matching test fails — the focus ring and the hover both failed in ways that look
correct, so a test that passes either way would have been worse than none. One
of ours did exactly that on the first attempt: a helper read only the first
`:hover` block, so it saw the theme's intention rather than the component's
override sitting after it, and passed against the unfixed code. It was rewritten
before being trusted.
