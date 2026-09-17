# Uni: the selection controls need a themeable label

**For:** Uni Design System dev team
**From:** Wellsourced (web app, Angular 22.1.5)
**Package:** verified against `@uni-design-system/uni-angular@11.1.0` + `uni-core@11.1.0` (installed)
**Date:** 2026-09-16

Everything below is quoted from the installed 11.1.0 build. The MCP index still
reports checkbox at v10.3.0 and was not used as a source.

We have just moved every checkbox in this app onto `uni-checkbox` — eleven call
sites across a data table, two dialogs, a print sidebar and the sign-in page.
The component's behaviour is right (the `indeterminate` model, the tick motion,
`FormCheckboxControl`). **What we could not do is use it without writing CSS
against its private DOM.** Two global rules remain in our `styles.css`, and both
of them reach inside the component:

```css
uni-checkbox > label > span[uni-text] { font-size: 14px; line-height: 18px; … }
uni-checkbox.label-sr-only > label { gap: 0; }
uni-checkbox.label-sr-only > label > span { width: 1px; …clip-path: inset(50%); }
```

That is the thing to kill. Each section below names the constraint that forces
one of those rules, and proposes the smallest API that removes it — in every
case reusing a mechanism Uni already has somewhere else.

`uni-toggle` and `uni-radio` render the label the same way and need the same
changes; §1 and §4 apply to all three.

---

## 1. The label's typeface is hard-coded — the consuming theme cannot reach it

### What happens

```html
<!-- UniCheckboxComponent template, 11.1.0 -->
  @if (label()) {
    <span uni-text="label">{{ label() }}</span>
  }
</label>
```

`uni-text="label"` is a literal. The `label` **role** in our theme is the
uppercase eyebrow used for field captions:

```ts
// app.theme.ts
label: caps(9, 9, 1.26),   // 9px, uppercase, 1.26 letter-spacing, 600
```

So every checkbox in the app rendered its sentence as a 9px all-caps badge —
`KEEP ME SIGNED IN FOR 30 DAYS` beside a 20px box. Nothing in the theme can
change that: `components.checkbox.options` has no text key, and `variants` /
`sizes` are `StyleExpression`s applied to the host, which never reach the span.

This is not our theme being unusual. `label` is the _caption above a field_ in
most type scales; the text beside a checkbox is body copy. The component has
picked one and made it unreachable.

Identical in `uni-toggle`. Worse in `uni-radio`, where the group label **and**
each option label are both `uni-text="label"` — so a radio group has no
typographic hierarchy between its heading and its choices, and the choices are
9px caps.

### Ask

```ts
interface UniCheckboxOptions {
  /** Typeface role for the rendered label. Defaults to `'label'`. */
  textRole?: TextRole;
  /** Content colour token for the rendered label. Defaults to inherited ink. */
  textColor?: ContentColorToken;
}
```

```ts
// component
labelClass = computed(() =>
  this.theme.textClass(
    this.componentOptions().textRole ?? 'label',
    this.componentOptions().textColor
  )
);
```

```html
<span [class]="labelClass()">{{ label() }}</span>
```

**Precedent, all in 11.1.0:** `UniMultiSelectDropdownOptions.textRole`,
`UniDialogHeaderOptions.textRole`, `UniDrawerHeaderOptions.textRole`,
`UniPaginatorOptions.textRole`. `ThemeService.textClass(role, color)` is already
public and is exactly this call.

`textColor` matters for the same reason: our sign-in page needs its checkbox
sentence in the page's softer ink, and today that is a second CSS rule
(`.remember span { color: var(--ink-soft) }`) reaching into your DOM.

Defaulting to `'label'` keeps every existing theme pixel-identical.

For radio: `textRole` for the option labels, `groupTextRole` (or
`labelTextRole`) for the group heading, both defaulting to `'label'`.

---

## 2. A checkbox cannot be named without printing the name

### What happens

`label` is the only naming input, and it renders as visible text. There is no
`ariaLabel`, and the inner `<input>` takes no attribute passthrough — putting
`aria-label` on `<uni-checkbox>` names nothing, because the host is not the
control.

Every selection checkbox has this shape: the thing it selects is already on
screen beside it, so the name is needed for assistive tech and must not be
drawn. Three of our surfaces are exactly this — a data table's select column, a
purchase-order queue row, a dialog's item list. Our workaround is the
`label-sr-only` rule above: clip the span to 1px **and** zero the label's flex
`gap`, because at `gap: 8` an invisible span still reserves 8px beside the box
and the control no longer fits its column.

This also produced a live layout bug in our app before the sweep: a screen that
passed `[label]="'Select every line from ' + vendorName"` was rendering that
sentence inside a 26px grid track.

### Ask

```ts
/** Keep the label as the accessible name, but do not draw it. */
labelHidden = input(false);
```

```html
@if (label()) {
<span [class]="labelHidden() ? srOnlyClass : labelClass()">{{ label() }}</span>
}
```

…with the label's `gap` suppressed when `labelHidden()` is true, so the control
measures exactly `options.size`.

**Precedent:** `uni-icon-button` already does this — its projected text is
rendered into `<span [class]="srOnlyClass"><ng-content /></span>` and documented
as "the button's accessible name (visually hidden)". `visuallyHidden` is in
core, is used at 48 sites in the bundle, and since 10.1 is `position: fixed`, so
it no longer escapes a scroll container. Reusing it here costs nothing.

An `ariaLabel` input would also close this, but hidden text is better: it keeps
the name in the DOM, so `getByLabelText` and axe see the same string the user's
screen reader announces.

---

## 3. A row cannot be the hit target, because `<label>` cannot nest

### What happens

The component renders its own `<label>` wrapper. HTML forbids a `<label>` inside
a `<label>`, so the natural markup for "the whole row toggles this checkbox" —
wrap the row in a label — becomes illegal the moment the row contains a
`uni-checkbox`. Four of our lists had exactly that markup before the sweep.

What we had to write instead, everywhere:

```html
<div class="row" (click)="toggle(id)">
  <uni-checkbox
    class="label-sr-only"
    [label]="'Select ' + title"
    [checked]="isSelected(id)"
    (click)="$event.stopPropagation()"   <!-- or the row toggles twice -->
    (checkedChange)="toggle(id)"
  />
  <span uni-text="body-1-short">{{ title }}</span>
  <span class="chip">{{ reason }}</span>
</div>
```

A `div` with a click handler, a duplicated toggle path, a `stopPropagation` that
every developer has to remember, and a name passed twice — once hidden for AT,
once visibly in a span the checkbox does not know about. All of it because the
real label is unavailable.

### Ask

Project content into the component's own `<label>`:

```html
<label [class]="checkboxLabel()">
  <input … />
  <div class="checkbox">…</div>
  @if (label()) { <span [class]="…">{{ label() }}</span> }
  <ng-content />
</label>
```

Then the row above is just:

```html
<uni-checkbox [checked]="isSelected(id)" (checkedChange)="toggle(id)" fullWidth>
  <span uni-text="body-1-short">{{ title }}</span>
  <span class="chip">{{ reason }}</span>
</uni-checkbox>
```

One control, native label association, whole row clickable and keyboard
operable, no synthetic click handler, no `stopPropagation`, and the title keeps
its own typeface. When both are supplied, `label` should be treated as the
accessible name (rendered sr-only) and the projection as the visible content —
the same relationship `uni-icon-button` already has between its icon and its
projected text.

Paired ask: **`fullWidth` input** on the label, so the hit area fills its
container. Precedent: `uni-button`, `uni-input-box`.

Content projection is house-normal (`uni-tab`, `uni-app-bar`, `uni-card-*`,
`uni-icon-button`), and it is additive — no existing template changes.

---

## 4. `gap` is a literal, and `size` is theme-global

```ts
// checkboxLabel(), 11.1.0
display: 'flex',
alignItems: 'center',
gap: 8,                                   // literal
'& .checkbox': {
  height: this.componentOptions().size,   // one number for the whole app
  width: this.componentOptions().size,
},
```

**`gap: 8`** is unthemeable, and it is the reason §2 needs a second CSS rule.
Ask: `gap?: NullableSize` in `UniCheckboxOptions`, defaulting to `8`.
Precedent: `UniPaginatorOptions.gap: NullableSize`.

**`size`** is one number per theme. The inherited `size` input is inert here —
`BaseComponent.size` only feeds `style()`, and checkbox never applies `style()`
to the box — which the docs half-admit ("only has an effect where the component
theme defines a `sizes` block"), but no `sizes` StyleExpression can reach the
inner `.checkbox` div either. In practice a checkbox in a 12.5px-type data table
wants a 16px box and the same app's forms want 20px, and there is no way to say
so. Ask: let the theme express it per size —

```ts
size?: string | number | Partial<Record<Size, string | number>>;
```

— resolved as `sizes[size()] ?? sizes.lg`, so `<uni-checkbox size="sm">` works
and a plain number stays valid. This is the same shape `variantOptions` took
for the accent problem: per-axis data the component reads, rather than CSS the
consumer has to aim at private DOM.

---

## 5. While you are in here — `checked` cannot be driven one-way

`checked` is a `model()`, and the internal write happens on `change`. If the app
binds `[checked]` one-way and then **declines** the change — a server refusal, a
row that turns out not to be selectable, an optimistic update that rolls back to
the same value — the parent expression's value has not changed, Angular writes
nothing, and the box keeps showing a state the application does not hold. There
is no way to correct it short of changing the bound value to something else and
back.

Not a blocker for us (we hold the value in a signal that always flips), and we
know the `[(checked)]` answer. But it is a sharp edge worth either fixing
(reconcile from the input whenever the bound expression is evaluated) or naming
in the guidelines: _"bind `[(checked)]`, or hold the value yourself — a refused
change will not snap back."_ The same applies to `indeterminate`.

---

## 6. Requested changes

| #   | Ask                                                                   | Type                         | Kills                                                                   |
| --- | --------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| 1   | `textRole` + `textColor` options on checkbox / toggle / radio         | additive, default-compatible | our 5-property typography override, and a per-page colour rule          |
| 2   | `labelHidden` input, rendered with the existing `visuallyHidden`      | additive                     | our `.label-sr-only` rule (3 declarations)                              |
| 3   | `<ng-content />` inside the control's own `<label>`, plus `fullWidth` | additive                     | the `div` + `stopPropagation` + duplicated-name pattern at 4 call sites |
| 4   | `gap` option; per-size `size` option                                  | additive                     | a second reason for the sr-only rule; unblocks dense tables             |
| 5   | one-way `checked` reconciliation, or a line in the guidelines         | docs or fix                  | a trap                                                                  |

All five are additive. Nothing here changes the rendering of an existing
template under an existing theme.

---

## 7. Acceptance criteria

1. With `components.checkbox.options.textRole = 'body-2-long'`, the label
   renders 14/18 sentence case, and **no** consumer stylesheet mentions
   `uni-checkbox`.
2. `<uni-checkbox label="Select row" labelHidden />` has an accessible name of
   "Select row" (axe + `getByLabelText`), renders no visible text, and its host
   measures exactly `options.size` wide — no residual gap.
3. `<uni-checkbox><span uni-text="body-1-short">Sofa</span></uni-checkbox>`
   toggles when the projected text is clicked, with no click handler in the
   consumer, and the checkbox is the only tab stop.
4. `<uni-checkbox size="sm">` renders the theme's small box; a theme that sets
   `options.size` to a plain number still renders as it does today.
5. Unchanged themes render byte-identical CSS to 11.1.0.
6. `uni-toggle` and `uni-radio` pass 1, 2 and 4 with the same option names.

---

## Appendix A: our call sites (11, after the sweep)

| Surface                             | Shape                                          | Needs  |
| ----------------------------------- | ---------------------------------------------- | ------ |
| `data-table` select-all + row cells | name hidden, 32px column                       | §2, §4 |
| `component-queue` card + line rows  | name hidden, 26px grid track                   | §2     |
| `category-review-dialog` list rows  | row is the hit target                          | §2, §3 |
| `project-presentations` item list   | row is the hit target, thumb + chip in the row | §2, §3 |
| `proposal-print-preview` sidebar    | visible labels, long item titles               | §1     |
| `login` "Keep me signed in"         | visible label, page's own ink                  | §1     |

## Appendix B: the overrides we would delete

```css
/* apps/web/src/styles.css — both reach into uni-checkbox's private DOM */

/* §1 — the theme's `label` role is a 9px uppercase eyebrow. The [uni-text]
   qualifier is load-bearing: uni's typography arrives as an emotion class, so
   three element selectors (0,0,3) lose the cascade to it. */
uni-checkbox > label > span[uni-text] {
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

/* §2 + §4 — name for AT, nothing drawn, and the 8px gap taken back. */
uni-checkbox.label-sr-only {
  display: inline-flex;
}
uni-checkbox.label-sr-only > label {
  gap: 0;
}
uni-checkbox.label-sr-only > label > span {
  width: 1px;
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}
```

Both are the kind of rule that breaks silently on a minor upgrade — they depend
on the element order inside your template and on emotion's class specificity.
That is why we would rather not have them.
