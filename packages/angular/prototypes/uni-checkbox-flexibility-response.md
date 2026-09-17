# Response: the selection controls' label — all five items

**For:** Wellsourced
**From:** Uni Design System dev team
**Re:** `uni-checkbox-flexibility-cr.md`
**Date:** 2026-09-17

Four of the five are fixed and ship in **11.2.0**, across all three controls. The
fifth is a decision, and the answer is "documented, not fixed", with reasoning.

§4's *shape* is declined in favour of a mechanism we already have; the capability
you asked for is there. Two of your premises were wrong in your favour — one
workaround you carried was unnecessary before we started, and one thing you
treated as your own CSS problem was our bug. Both are below rather than quietly
folded into the fix.

Both rules in Appendix B are deletable, and so is the `.remember` rule in §1.

---

## §1 — the typeface: fixed, on all three

`textRole` and `textColor` are options on `checkbox`, `toggle` and `radio`, both
defaulting to `label`. Radio takes a second pair, `groupTextRole` and
`groupTextColor`, because the heading and the choices under it are two levels of
one hierarchy and sharing `label` is what flattened them.

They are typed `Typeface`, not `TextRole` — deliberately. `TextRole` is the
closed union, and your own scale names a dozen roles that are not in it (`micro`,
`stat`, `menu`, `eyebrow`, `label-sm`, `hero`…). A component option that could not point
at `micro` would have reproduced the original problem one layer up.

The role is bound into `uni-text` rather than composed with `ThemeService.textClass`,
which keeps the emitted class identical to what `uni-text="label"` produced —
verified, not assumed; see the acceptance table.

**For your theme:**

```ts
checkbox: { options: { textRole: 'body-2-long' } },
toggle:   { options: { textRole: 'body-2-long' } },
radio:    { options: { textRole: 'body-2-long', groupTextRole: 'label' } },
```

`body-2-long` is `sans(14, 18)` in your scale — the exact metrics your five
declarations force. We have put precisely this into the `WellsourcedLight` /
`WellsourcedDark` mirror in our Storybook, so the theme now renders what your app
renders rather than what your app had to correct afterwards. Under that theme a
checkbox label now computes `14px / 18px / none / normal / 400`.

Note the radio line: keeping `groupTextRole: 'label'` is right for you. Your
`label` role *is* the caption above a field, which is what a group heading is —
it was only ever wrong on the choices.

### The `.remember` rule: use §3, not `textColor`

`textColor` is a theme option, so it cannot express "this one checkbox, on the
sign-in page, in softer ink" — you would be setting it for the whole app. That
case is answered by §3 instead:

```html
<uni-checkbox>
  <span uni-text="body-2-long" color="on-surface-variant">Keep me signed in for 30 days</span>
</uni-checkbox>
```

Per-instance ink, per-instance role, no CSS, and the `<label>` still names and
activates the control. `textColor` is for the app-wide decision.

---

## §2 — `labelHidden`: fixed, and you were carrying a workaround you did not need

`labelHidden` renders `label` through the shared `visuallyHidden` recipe — the
`uni-icon-button` pattern, the same recipe as the twenty other components that
emit one, and the string stays in the DOM so `getByLabelText` and a screen reader
agree.

**The gap suppression is not necessary, and has not been since 10.1.** Your §4
says "at `gap: 8` an invisible span still reserves 8px beside the box". That is
true of *your* rule, which clips the span but leaves it in flow. It is not true
of ours: `visuallyHidden` has been `position: fixed` since we fixed the overflow
escape you reported in `uni-drawer-and-sr-only-rfc.md` §1. An out-of-flow box is
not a flex item, so the label row's `gap` never applies to it.

Measured in Storybook, `<uni-checkbox label="…" labelHidden>`:

| | |
|---|---|
| host width | **20px** |
| box width | **20px** |
| `gap` still declared on the label | `8px` |
| hidden span | `position: fixed`, 1×1 |

So your own drawer RFC had already paid for this workaround before you wrote it.
`gap: 0` on `.label-sr-only` can go, and it was never what made the control fit —
see the next section for what actually did.

On radio, `labelHidden` hides the group heading only. It keeps the id
`aria-labelledby` points at, so the group is still named.

### And one you reported as your CSS rather than our bug

`uni-checkbox.label-sr-only { display: inline-flex }` is in your Appendix B as
part of the sr-only workaround. It was not: **none of the three controls set a
host `display` at all.** Each is therefore `inline` with a `display: flex`
`<label>` inside, which makes the host generate block boxes and fill its
container — so `<uni-checkbox>` never measured the control it contains, in any
app, labelled or not. Your table's "26px grid track" and "32px column" rows are
that bug, not the label.

The hosts are `inline-flex` now, and `fullWidth` is the way back to filling the
container. This is the one change that can move an existing layout: a checkbox
relying on the stretch will shrink-wrap. You are unaffected — you were already
overriding it — but anyone inheriting the old behaviour will see it.

Same family, also fixed: the box and the track now carry `flex-shrink: 0`, which
`uni-radio`'s circle already had. Without it a long label in a narrow column
squashed the box into a rectangle, which §3 makes much likelier.

---

## §3 — projection: fixed, and radio gets its own shape

`<ng-content />` is projected inside the control's own `<label>` on `uni-checkbox`
and `uni-toggle`, so your row markup collapses to what you wrote:

```html
<uni-checkbox fullWidth [checked]="isSelected(id)" (checkedChange)="toggle(id)">
  <span uni-text="body-1-short">{{ title }}</span>
  <span class="chip">{{ reason }}</span>
</uni-checkbox>
```

Verified in a browser, not only in jsdom: clicking the chip at the far end of the
row toggles the box, the `<uni-checkbox>` measures exactly its container, and the
control is the only tab stop. No `div`, no click handler, no `stopPropagation`,
no name passed twice.

**One deviation from your proposal.** You asked that when both `label` and
projected content are supplied, `label` be rendered sr-only automatically. It is
not automatic: pass `labelHidden` alongside it. Knowing whether the slot received
nodes means reading the DOM after render — it changes with an `@if` inside the
projection, so it would have to be re-read every cycle, and a component that
silently reclassifies your visible label based on what it finds in its own DOM is
worse than an explicit attribute. `label` + `labelHidden` is one extra word and
says what it does.

**Radio cannot take `<ng-content />`** — it renders N labels from an `options`
array, so there is no single slot to project into. It takes a template instead,
instantiated once per option and handed that option, landing inside that option's
`<label>`:

```html
<uni-radio [options]="plans" label="Plan" fullWidth>
  <ng-template uniRadioOption let-option>
    <span uni-text="body-2-long">{{ option.label }}</span>
    <span uni-text="caption">{{ descriptions[option.value] }}</span>
  </ng-template>
</uni-radio>
```

`let-option` is typed, not `any` — there is an `ngTemplateContextGuard` on the
directive.

`fullWidth` is on all three (on radio it widens each option row).

### A sharp edge we found while writing the stories

`labelHidden` and `fullWidth` take `booleanAttribute`, as `uni-inline-button` and
`uni-expand-area` already do, so `<uni-checkbox labelHidden>` reads as `true`.
Without it a valueless attribute binds the **empty string**, which is falsy — the
attribute compiles, reads as set, and does nothing. We caught this on our own
first story, having written the bare-attribute form you used in §3.

The same defect was on **every other valueless boolean attribute in the
library**, and since you will write that markup too, it is fixed in the same
release rather than left for you to trip over: `fullWidth` on `uni-button`,
`uni-input`, `uni-input-box`, `uni-select`, `uni-textarea` and `box-layout`
(which also covers `fullHeight`), plus **`disable` and `loading` on
`uni-button`**. So `<button text-button fullWidth>` works, and so does
`<button text-button disable>` — which until now rendered an enabled button,
and is the one in this set worth auditing your own templates for.
`[disable]="expr"` always worked and is unchanged.

One thing that made this worse than it looked, and is worth knowing if you ever
chase a bare attribute that half-works: the four field components forward
`fullWidth` down into `box-layout`, and a `booleanAttribute` transform coerces
the empty string to `true`. So once `box-layout` had the transform, the bare
attribute on `uni-input` *rendered* correctly while `uni-input`'s own
`fullWidth()` still held `''`. Our first guard asserted the emitted CSS and
passed with the transform removed from four of the six declarations — it was
testing the end of the chain. It now asserts each input's value, and all ten
declarations fail it individually when reverted.

---

## §4 — `gap` fixed; the size *shape* declined, the size *capability* shipped

`gap` is `NullableSize` on all three, defaulting to `sm` (8px — unchanged). It
resolves through `getSpacing`, not `theme.gap()`, so `gap: 'none'` is `0` rather
than a dropped declaration. Radio's group column gets `groupGap`; left unset it
stays at the 12px it has always drawn, because 12 is not a step on the base scale
and resolving it as a token would warn on every miss.

**On `size`, we are not taking the shape you proposed.** `size?: string | number | Partial<Record<Size, …>>`
inside `options` would stand up a second per-size mechanism beside
`ComponentTheme.sizes`, which is the one every other component uses and the one
`toggle.size` was *removed in favour of* in 11.0.0, one release before the build
you measured. So
checkbox and radio get a `sizes` block:

```ts
checkbox: { sizes: { sm: { height: 16 }, md: { height: 18 }, lg: { height: 20 } } },
```

read as data the way `uni-toggle` and `uni-calendar` read theirs. `lg` is
`BaseComponent`'s default and reproduces today's 20px exactly. Your dense table
is `<uni-checkbox size="sm">`, which is also the first time the inherited `size`
input has done anything on these two — you were right that it was inert.

**Precedence, and it matters to you.** `options.size` is now `@deprecated` but
still **outranks** the `sizes` block. Themes are deep-merged over the base, so
your theme — which states `checkbox: { options: { size: 20 } }` — would otherwise
inherit our block and have its own number silently overruled by ours. As shipped,
your theme renders exactly as it does today.

**For your theme:** to use per-size boxes, delete `size: 20` from
`checkbox.options` and state a `sizes` block. Until you do, every checkbox stays
20px regardless of its `size` input. `options.size` goes in 12.0.

---

## §5 — `checked` is documented, not reconciled

You framed this as "fix or name it", and we are naming it, because the fix you
describe is not available.

The reconcile would have to distinguish "the parent re-asserted the same value"
from "the parent did not write". Angular does not surface that difference: a
one-way `[checked]` binding whose expression has not changed produces no
`setInput` call at all, so there is nothing for the component to react to. The
nearest thing that *is* available — an effect re-asserting the bound value onto
the DOM input — would repaint the box while leaving the `model()` diverged from
both the parent and the DOM. That trades a visible wrong state for an invisible
one, and fires on every legitimate toggle. We would rather not.

So it is written down, in the place a developer meets it: the `checked` knob's
description, the Overview in all three MDX pages, and a "Don't" bullet —

> Bind `[(checked)]`, or hold the value in your own signal — a change your app
> declines will not snap back on its own.

— covering `indeterminate` (which a user interaction clears unconditionally) and
radio's `value` on the same grounds. You already hold your values in a signal
that always flips, so nothing changes for you; this is for the next person.

---

## Your acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | `textRole = 'body-2-long'` renders 14/18 sentence case, no consumer stylesheet mentions `uni-checkbox` | **met** — measured under `WellsourcedLight`: `14px / 18px / none / normal / 400`, the five declarations your rule forces |
| 2 | `labelHidden` names without drawing, host measures exactly the box, no residual gap | **met** — host 20px, box 20px, with `gap: 8px` still on the label; the hidden span is out of flow, so it never claimed the gap |
| 3 | Projected content toggles with no consumer handler; the checkbox is the only tab stop | **met** — clicked the chip at the far end of the row; one tab stop. Radio gets an option template instead of a slot |
| 4 | `size="sm"` renders the theme's small box; a theme with a plain number renders as today | **met** — via `ComponentTheme.sizes`, not the proposed options shape; the plain number still wins |
| 5 | Unchanged themes render byte-identical CSS | **met, with two declarations named** — `flex-shrink: 0` on the box and track, and `display: inline-flex` on the host. Every other rule is identical character for character, diffed against 11.1.0's emitted CSS rather than reasoned about |
| 6 | Toggle and radio pass 1, 2 and 4 under the same option names | **met** — plus radio's `groupTextRole` split and the option template |

Covered by 1,052 tests, 42 of them new across the three controls. Each fix was
verified by reverting it and confirming the matching test fails — all eleven
reverts were caught, including the `booleanAttribute` one, which is how we found
that defect rather than shipping it.

## One request back

Both of the premises we corrected above were checkable against the installed
build: `visuallyHidden` is `position: fixed` in the 11.1.0 you quoted from, and
the missing host `display` shows up in one `getComputedStyle` call. You quoted
the source accurately throughout — the gap between quoting a rule and measuring
what it does is where both went. A line of measurement beside the quote, as you
gave us in the drawer RFC, would have saved you the `gap: 0` rule entirely.
