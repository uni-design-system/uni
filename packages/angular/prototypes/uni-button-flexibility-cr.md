# Uni: what must move alongside `Variant = keyof UniVariantRegistry`

**For:** Uni Design System dev team
**From:** Wellsourced (web app, Angular 21.2.12)
**Package:** `@uni-design-system/uni-angular@10.2.1`, `@uni-design-system/uni-core@10.2.1`
**Date:** 2026-09-01 · **Revision 4** — most of revision 3 shipped in 10.2.0; this narrows to what is left

Quoted from the installed 10.2.1 build, with the rendering claims measured in the browser against this app. The MCP index still reports several components at v9.0.0 and was not used as a source.

---

## Revision note

Revision 1 asked for a third axis — a `tone` (`solid | hollow | ghost`) generalised from `uni-tag`, plus a per-instance `shape`. **That is withdrawn.** Uni's response is correct and this revision is built on it:

> Variants describe intent. It is the theme's job to describe the visual application of that intent.

The mistake in revision 1 was naming: `warnSolid` puts a **visual application** into a **semantic** slot. Once a variant says "solid", no theme can re-render that intent any other way — which defeats the point of loading a different theme. `solid`, `hollow` and `pill` are all answers to "how should this theme draw it", and they belong in the theme.

The combinatorial argument in revision 1 also answered the wrong question. It assumed names would be generated across axes. They are not: a design system *chooses* a small set of intents, and adding a colour does not imply adding an archetype. Two axes hold.

**What remains** is everything that has to change so unlimited variants actually work. With a closed 12-name union these were latent; with an open registry they become live defects.

**Revision 4.** 10.2.0 shipped the registry and most of what revision 3 asked for. Re-verified against 10.2.1:

| revision 3 asked for | 10.2.x |
|---|---|
| `Variant = keyof UniVariantRegistry` | **delivered** |
| decouple variant from colour lookup in checkbox / radio / toggle | **delivered** — via the new `variantOptions` map (and it found two more sites than we did: checkbox's `on-${variant}` resolver, 12 not 10) |
| dev warning for an unthemed `component/variant` pair | **delivered** |
| document the extend-versus-replace contract | **delivered** — the registry extends only; `primary` and `disabled` are reserved and documented |
| docs: stale version stamp, missing inherited inputs, wrong drawer example | **delivered** — see §7 |

**What is left is four things**, two of them measured rather than read:

- **§1 — `uni-button`'s focus ring was not included in the decoupling.** It is the same bug the form controls just had, it is a WCAG 2.4.7 failure rather than a wrong colour, and `variantOptions` — the mechanism that fixed the others — is generic on `ComponentTheme` and already available to it.
- **§4 — a variant cannot set a border** without `!important`, because the component's reset is applied after the theme.
- **§3** — the hard-coded `variant() === 'ghost'` literal is still present (1 occurrence).
- **§6** — `Size` is still a closed union, which revision 3 raised as a question and 10.2 did not answer.

---

## 1. `uni-button`'s focus ring still resolves a variant as a colour

**The form controls are fixed; the button was missed.** 10.2.0 moved checkbox,
radio and toggle onto `variantOptions` and deleted `getThemeColor`. The same
pattern survives in `UniButtonComponent`, where it costs more than a colour.

```ts
// uni-core/dist/types/concepts/theme/theme.types.d.ts
export type TextColor = ContentColorToken | Variant;
```

The remaining site is one line, and it fails harder than a wrong colour:

```js
// UniButtonComponent.className — the block comment above it reads
// "Only the keyboard-focus indicator (WCAG 2.4.7) stays component-owned."
'&:focus-visible': {
    outline: `2px solid ${this.theme.colors()[this.variant()]}`,
    outlineOffset: '2px',
},
```

An intent name is not a colour token, so the interpolation yields the string
`2px solid undefined` — invalid, and dropped by the CSS parser. Measured on a
registered `segmented` variant in this app, reading the emitted emotion rules:

| variant | emitted `outline` |
|---|---|
| `secondary` | `rgb(212, 163, 115) solid 2px` |
| `success` | `rgb(58, 95, 67) solid 2px` |
| `warn` | `rgb(188, 71, 73) solid 2px` |
| **`segmented`** (registered) | **`(dropped)`** |
| **`ghost`** (uni's own) | **`transparent solid 2px`** |

`outlineOffset: 2px` survives, so nothing looks broken — the ring is simply
absent. Every variant a consumer registers is a button with no visible keyboard
focus indicator: an accessibility regression created by using the feature as
documented, and the one place where the registry currently makes a component
worse rather than only less expressive.

**`ghost` shows this is already live in 10.2, with no registry involved.** Its
colour token is `transparent`, so the ring resolves to a transparent outline —
uni's own default variant has an invisible focus indicator today.

**Ask:** resolve the focus-ring colour from the variant's *theme entry* (or a
dedicated `focusColor` component option) rather than from a colour token that
shares the variant's name, and fall back to a visible colour rather than to
`undefined`. This is the same decoupling as the form controls above; it just
carries a WCAG failure rather than a cosmetic one.

Today this is safe only because every name in `Variant` happens to also be a colour token. Under intent naming that coincidence ends by design: `<uni-checkbox variant="destructive">` looks up `colors['destructive']`, misses, and **silently renders primary**. The consumer sees a wrong-coloured control with no error, no warning, and nothing to grep for.

**Ask:** apply to `uni-button` the fix 10.2.0 applied to the form controls. `variantOptions` is declared generically on `ComponentTheme` —

```ts
// uni-core/dist/types/concepts/component/component.types.d.ts
variantOptions?: Partial<Record<Variant, V>>;
```

— so the button can read a `focusColor` from the active variant's entry with no new concept and no new API surface, exactly as checkbox now reads `accent`. Fall back to a visible colour rather than to `undefined`, and give `ghost` an entry so its ring stops being transparent.

---

## 2. An unthemed variant fails silently — DELIVERED in 10.2.0

_Kept for the record; the theme service now warns once per component and variant in dev, naming what the theme does define. No action._

```js
componentStyle = (componentName, variant, size) => computed(() => {
    const { fixed, variants, sizes } = this.component(componentName)();
    const variantStyle = variants && variants[variant];   // undefined if unthemed
    const sizeStyle = sizes && sizes[size];
    return { ...fixed, ...variantStyle, ...sizeStyle };    // spread of undefined is a no-op
});
```

With twelve fixed names, an unthemed variant was nearly impossible. With an open registry it is the ordinary failure of a work in progress: a designer registers `destructive`, uses it, and has not yet written its theme block. The button renders with `fixed` + size and no archetype — plausible enough to ship by accident.

Uni already made this exact call elsewhere, and documented the reasoning:

```js
/**
 * The scale is open — a theme may name steps beyond `xxs`…`xxl` — so a
 * mistyped token cannot be a compile error. It would otherwise vanish
 * silently, since an `undefined` CSS value is simply dropped, so say so once
 * per token in dev.
 */
resolveSpacing(size) { … console.warn(`[uni] Unknown spacing token "${size}" …`) }
```

**Ask:** apply the `resolveSpacing` treatment to `componentStyle` — one dev warning per unknown `component/variant` pair, naming the variants the active theme does define. Open sets need this precisely because the compiler can no longer catch the mistake.

---

## 3. A hard-coded variant literal

```js
// UniIconButtonComponent
variant() === 'ghost'
```

**Still present in 10.2.1** (verified: one occurrence). 10.2.0 settled that the registry extends rather than replaces, so `ghost` cannot actually be removed by a consumer — which lowers this from a correctness bug to a tidiness one. It is still an assumption that uni's own names survive, and it is worth a sweep for others.

---

## 4. The component's own reset outranks the theme

`UniButtonComponent` interleaves theme styles and structural styles in one
`css([...])` call, and the structural block comes **last**:

```js
className = computed(() => css([
    // Token-driven radius + typeface from component options. Applied before
    // `style()` so theme `sizes`/`fixed` (per-size fontSize, or hand-set
    // radii/families in older themes) keep winning.
    this.theme.radius(this.componentOptions().borderRadius),
    { ...this.theme.typeface(this.componentOptions().typeface) },
    this.style() && {
        ...this.style(),   // TODO: Set priority on theme-defined styles
    },
    {
        display: 'flex',
        …
        overflow: 'hidden',
        outline: 0,
        border: 0,          // ← after the theme
        cursor: 'pointer',
        transition: 'all 0.28s ease',
    },
    …
```

The comment on the first two entries shows the ordering is deliberate where it
was noticed — radius and typeface are placed *before* `style()` so the theme
wins. The structural block was not given the same treatment, and its own `TODO`
names the problem.

**A theme cannot give a button a border.** `border: 0` lands after the variant,
so the only way through is `!important`, and it is contagious: the shorthand
outranks the longhand, so every state that adjusts the border needs
`!important` too.

The clearest demonstration is that our theme's `fixed` block has carried
`border: '1px solid transparent'` since we wrote it, and it has never once
applied — `fixed` is spread into `componentStyle`, which becomes `style()`,
which the reset then overrides. Computed borders across our own buttons on
10.2.1 split exactly on which variants shout:

| variant | `!important` in theme | computed border |
|---|---|---|
| `ghost` | yes | `1px solid rgba(26,26,26,.08)` |
| `warn` | yes | `1px solid rgba(139,58,58,.15)` |
| `segmented` | yes | `1px solid rgba(26,26,26,.08)` |
| `secondary` | no | **`0px none`** |
| `success` | no | **`0px none`** |
| `tertiary` | no | **`0px none`** |

Every button in the bottom half is inheriting `fixed`'s border declaration and
rendering none of it.

```ts
// app.theme.ts — the three bordered variants of our eight
ghost: {
  border: `1px solid rgba(26, 26, 26, 0.08) !important`,
  // The border shorthand above is !important, so the hover accent
  // must be too or it never wins.
  '&:hover': { borderColor: `${palette.secondary} !important` },
},
warn: {
  border: `1px solid rgba(139, 58, 58, 0.15) !important`,
  '&:hover': { borderColor: `rgba(139, 58, 58, 0.4) !important` },
},
segmented: {
  border: `1px solid ${palette.disabled} !important`,
  '&[aria-pressed="true"]': { borderColor: `${palette.primary} !important` },
},
```

Our button theme carries nine `!important` declarations. **Seven are this
issue**: three borders, three border-colour states, and `transition`, which the
structural block also sets last. None of them express anything; they exist only
to outrank the component. This matters more under an open registry than it did
under twelve names: *hollow* is one of the two
archetypes any design system draws, so a theme that cannot express a border
without `!important` cannot express half its buttons cleanly — and `!important`
is exactly the tool a theme should never need, because it is also what a
consuming app would reach for to override the theme.

`overflow: 'hidden'` and `outline: 0` sit in the same block and are equally
unthemeable, though we have not needed either yet.

**Ask:** move the structural block **before** `this.style()`, as the radius and
typeface entries already are. Structural properties a component genuinely must
own (`position: relative` for the ripple, the `& .symbolLeft` rules) can stay
last in a separate object; `border`, `outline`, `overflow` and `transition` are
presentational and belong to the theme. Resolving the existing `TODO` would let
us delete every `!important` above.

---

## 5. Extend versus replace — ANSWERED in 10.2.0

_The registry extends and cannot replace; `primary` and `disabled` are reserved and documented as always present. That is a clear contract and closes this. No action._

"Let a design system enforce its own rules" implies **replacing** the set, not only adding to it — otherwise uni's twelve defaults remain legal in every consuming app and the system cannot be enforced.

If a registry is replaced and `primary` or `disabled` is dropped, what happens to:

- `getThemeColor`'s fallback, which resolves `colors['primary']` **by name**;
- the `disabled` variant, which the base theme defines and components lean on for the disabled state?

**Ask:** state the contract. Either some names are reserved and always present (documented as such), or the internals stop referring to them by literal. Either answer is fine; silence is not, because a system that drops `primary` would fail in a way that looks like a theming bug.

---

## 6. Sizing — a question, not an ask

`Size` is closed in the same way `Variant` is today:

```ts
export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
```

Uni's response mentions "the flexibility of sizing them". If that means the existing seven t-shirt steps, that is workable — our theme already carries per-size `height`, `borderRadius`, `fontSize`, `padding` and `letterSpacing` for buttons. If a design system is expected to bring its own size ladder, `Size` needs the registry treatment too.

**Unchanged in 10.2.1** — `Size` is still the closed seven-name union quoted above, while `Variant` next to it is now open. Worth an explicit decision either way, since a system with, say, `compact | default | roomy` cannot express that today. Our own use is a mild version of the same pinch: the segmented pill needed a 21px step, which landed on `xs` because that was the nearest free name rather than because the control is extra-small.

---

## 7. Requested changes

Four remain. The first is the only one we would call blocking.

1. **Give `uni-button`'s focus ring a themed colour** (§1) — it is the one site the 10.2.0 decoupling missed, it is a WCAG 2.4.7 failure rather than a wrong colour, and `ghost` exhibits it today with no registry involved. `variantOptions` already provides the mechanism.
2. **Order the theme above the component's reset** (§4) — move `UniButtonComponent`'s structural block before `this.style()`, resolving its own `TODO`, so a variant can set `border`, `outline`, `overflow` and `transition` without `!important`.
3. **Audit hard-coded variant literals** (§3); `UniIconButtonComponent`'s `variant() === 'ghost'` is still the one found.
4. **Decide whether `Size` follows `Variant`** into a registry (§6).

**Closed by 10.2.0:** the registry itself; the checkbox / radio / toggle colour lookup; the unthemed-variant dev warning; the extend-versus-replace contract.

---

## 8. Docs and the MCP index

The three doc complaints from revision 3 are **fixed** in the published `uni-mcp@10.2.0`: components are stamped `10.1.0` rather than `9.0.0`, the inherited `BaseComponent` inputs (`variant`, `size`) are listed on button, drawer, toggle and checkbox, and the Drawer "Overlay" story renders `mode="over"` (with `side` correctly kept for "Dashboard Shell").

One gap remains, and it is worth a note because it is invisible from the outside: **the MCP package version and the Uni version it indexes have drifted apart.** `uni-mcp@10.2.0` stamps every component `10.1.0`, and its bundled changelog data has no 10.2.0 or 10.2.1 entry — so the release that introduced the registry is the one the index cannot describe. An agent asking `get-changelog --since 10.2.0` gets "no releases found; latest 9.0.0"-shaped answers and reasons from a pre-registry API.

**Ask:** publish the index with the release it documents, or stamp it with the Uni version it was built from so a consumer can tell how far behind it is.

_(For the record, the "v9.0.0" staleness we reported in revision 3 was largely our own: `npx -y @uni-design-system/uni-mcp@latest` had cached a 4.7.2 install whose `package.json` pinned `^4.7.2`, so `@latest` could never resolve past 4.x. Clearing the npx cache fixes that half. The version-drift above is real and separate.)_

---

## 9. Acceptance criteria

Scoped to the four open asks. The 10.2.0 criteria (registry compiles, checkbox renders the themed accent, unthemed variant warns once) are met and not repeated.

1. `<button text-button variant="destructive">` shows a **visible** keyboard focus ring, and so does `variant="ghost"` — checked by reading the emitted rule, not by eye, since the current failure emits `outlineOffset` and drops `outline`.
2. A variant can set `border`, `outline`, `overflow` and `transition` from the theme with **no `!important`**, and a hover or `aria-pressed` state can adjust that border the same way.
3. With that in place, the theme's `fixed` block setting `border: 1px solid transparent` actually renders a 1px transparent border — today it renders `0px none`.
4. No component branches on a variant name literal.
5. Omitting `variant` is unchanged from 10.2.1 output for every existing consumer, except that `ghost` gains a visible focus ring.

---

## Appendix: the intent set this app would define

Offered as evidence that the model holds at our scale — six intents cover every button in the product, which matches Uni's point that a system needs a small set.

| intent | today | what the theme would draw |
|---|---|---|
| `primary` | `.btn-dark`, `.btn-save-changes` | filled ink green — the committing action |
| `secondary` | `.btn-amber`, `.act-btn-amber` | filled camel — a promoted alternative |
| `subtle` | `.btn-ghost`, `.act-btn-ghost`, `.btn-discard` | hollow — recessive actions (Cancel, Track, Discard) |
| `destructive` | `.btn-danger` **and** `.btn-danger-ghost` | the theme's choice; ours would be filled |
| `success` | `.act-btn-success` | filled sage — completion (Mark Delivered) |
| `info` | `.act-btn-blue` | filled slate — navigational/informational |

Two notes from doing the mapping:

- **`ghost` is the one existing name that is presentational, not intent.** It says how a colour is applied rather than which action it represents — which is why it needed its own `&.tone-*` blocks in the tag theme, and why `UniIconButtonComponent` branches on it. Renaming it to an intent (`subtle`) as part of the registry work would remove the last presentational name from the set.
- Our current theme defines **7 of the 12** slots and the base button theme defines the same 7. The union was never the constraint we were hitting — the naming was.
