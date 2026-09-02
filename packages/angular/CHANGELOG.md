# @uni-design-system/uni-angular

## 10.3.0

### Minor Changes

- [`ab1689a`](https://github.com/uni-design-system/uni/commit/ab1689a8e6ddf26943403ec32e5d4871bc9f0fb6) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-button`: the focus ring is themed, and the theme now outranks the reset.

  **Five of the twelve variants had no visible keyboard focus ring.** The ring
  resolved the variant _name_ as a colour token — the pattern 10.2.0 removed from
  checkbox, radio and toggle, missed on the one component where it costs an
  accessibility failure rather than a wrong colour:

  ```ts
  outline: `2px solid ${this.theme.colors()[this.variant()]}`;
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
  and `transition` were applied _after_ the theme's styles, so a variant
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

## 10.2.1

## 10.2.0

### Minor Changes

- [`1cd0140`](https://github.com/uni-design-system/uni/commit/1cd0140d2e6a4c753f48fb46418ba08769979263) Thanks [@gaenglish](https://github.com/gaenglish)! - Checkbox, radio and toggle take their accent from the theme, not from the
  variant's name.

  **Twelve sites across the three controls resolved a variant name as a colour
  token.** That held together only because every name in the closed union happened
  to also be a colour. Under an open registry the coincidence ends by design:
  `<uni-checkbox variant="destructive">` would look up `colors['destructive']`,
  miss, and **silently render primary** — a wrong-coloured control with no error,
  no warning, and nothing to grep for.

  Checkbox was worse than it looked. Alongside five `getThemeColor` calls it had
  two more through a second resolver that built `on-${variant}`, so an
  unregistered intent also missed its paired content colour and fell back to
  `on-primary` — the tick would have stayed light on a dark fill even after the
  box was fixed.

  The theme now says which colour draws each intent, through a new
  `variantOptions` map on `ComponentTheme`:

  ```ts
  checkbox: {
    variantOptions: {
      primary: { accent: 'primary' },
      warn: { accent: 'warn' },
    },
  }
  ```

  `variantOptions` is per-variant data a component **reads**, as against `variants`,
  which is CSS that gets **applied**. The distinction earns its place here: a
  checkbox's accent lands on the box outline, the checked and indeterminate fills,
  the tick and the focus ring at once, and expressing that as CSS would have meant
  the theme naming `.checkbox-check` and `.radio-inner` — promoting private DOM to
  public theme contract.

  All three controls gain a `checkedColor` input as the per-instance override,
  matching the one `uni-toggle` already had; its resolution order is now input →
  the variant's themed accent → theme option. The base theme defines the same
  seven intents `button` and `iconButton` do, so the library is consistent about
  which exist by default, and `getThemeColor` — triplicated byte-for-byte across
  the three components, with a silent fallback to primary — is gone.

  Rendering is unchanged for anything that does not set `variant`: the default
  still resolves to the primary accent and its paired on-colour.

- [`1cd0140`](https://github.com/uni-design-system/uni/commit/1cd0140d2e6a4c753f48fb46418ba08769979263) Thanks [@gaenglish](https://github.com/gaenglish)! - `Variant` is an open registry: a design system can define its own intents.

  A variant names _what an action means_, and it is the theme's job to describe
  how that intent is drawn. So the set of names was never Uni's to fix — an app
  whose actions are `destructive`, `subtle` and `info` had to translate them onto
  twelve names chosen elsewhere. `Variant` is now `keyof UniVariantRegistry`,
  extended by declaration merging:

  ```ts
  declare module '@uni-design-system/uni-core' {
    interface UniVariantRegistry {
      destructive: true;
    }
  }
  ```

  `variant="destructive"` then compiles wherever a variant is accepted, and
  `variant="destructve"` still does not — which the library's other open-token
  idiom, `Named | (string & {})`, cannot give you, and which would also have
  collapsed the theme's `variants` map keys to `string`.

  Only the type was ever closed: theme validation checks the _shape_ of a
  `variants` block and never its key names, so a custom variant already reached
  `componentStyle` untouched at runtime.

  **The registry extends; it cannot replace.** Declaration merging has no way to
  remove a member, so Uni's twelve names stay legal in a consuming app; enforcing
  a house set is a lint concern rather than a type. Two names are reserved and
  documented as always present: `primary`, which every component inherits as its
  default, and `disabled`, which the disabled state resolves to.

  **An unthemed variant now says so.** With a closed union this was nearly
  impossible; with an open set it is the ordinary state of a work in progress —
  a variant registered and used before its theme block exists. The theme service
  warns once per component and variant in dev, naming what the theme does define,
  mirroring what it already did for an unknown spacing token. Components that
  theme no variants at all stay silent, since a missing key there is not a gap.

## 10.1.0

### Minor Changes

- [`f28c951`](https://github.com/uni-design-system/uni/commit/f28c95117f2844b58a265b59c2ea8b9715156670) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-drawer` gains the API an editor panel needs, and a close it can refuse.

  **Closing can now be vetoed.** Escape, the backdrop, the header's close button
  and the footer's cancel all funnel through one decision that emits
  `closeRequest` with a `reason` — `'escape' | 'backdrop' | 'close-button'`. Set
  `disableAutoClose` and the drawer stops acting on its own: it asks, and waits
  for you to set `open`.

  That split exists because the confirmation it has to accommodate is
  _asynchronous_. A synchronous veto — a preventable event — cannot express
  "ask the user, then decide", so every consumer would prevent unconditionally
  and close manually anyway. Leave `disableAutoClose` off and behaviour is
  unchanged, so adding a listener alone breaks nothing.

  ```html
  <uni-drawer [(open)]="open" [disableAutoClose]="form.dirty()" (closeRequest)="confirmDiscard()" />
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

- [`f28c951`](https://github.com/uni-design-system/uni/commit/f28c95117f2844b58a265b59c2ea8b9715156670) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-drawer` is a three-row panel, and is no longer its own scroll container.

  **The `<dialog>` used to be the scroller.** `over` mode set `overflowY: 'auto'`
  on the panel and put the theme's padding there too, which made a pinned header
  or footer impossible: padding on a scrolling box scrolls away with its content,
  and any row you pinned against it could not sit flush to the panel edge. It also
  set only the one axis — and a single explicit overflow axis computes the other
  to `auto`, which is exactly how a container becomes an accidental scroller.
  `side` had it right already, setting both.

  The panel is now a flex column of three rows — an optional
  `[uni-drawer-header]`, the projected body, an optional `[uni-drawer-buttons]`
  (alias `[drawer-buttons]`) — and **only the body scrolls**. The panel itself is
  `overflow: clip` on both axes, explicitly, never the shorthand. The body carries
  `overscroll-behavior: contain`, so scrolling to its end does not start scrolling
  the page behind it, and `position: relative`, so a stray absolutely positioned
  descendant is contained rather than re-homed into an ancestor.

  Those two must travel together: a positioned body _without_ a clipped shell is
  worse than the status quo, because it pulls phantom overflow into the scroller
  instead of out of the panel.

  **`drawer.behavior.padding` is now the body's padding, not the panel's.** A
  drawer with no header or footer looks the same as before. One that gains either
  gets rows flush to the panel edge, which is the point.

  Two new theme entries, `drawerHeader` and `drawerButtons`, mirror the dialog
  pair knob for knob but default to a panel's posture rather than a dialog's: the
  header's title is left-aligned rather than centered, and the footer trails its
  actions rather than centering them.

  Note one deliberate divergence from `[dialog-buttons]`: the drawer footer's
  **confirm button does not close the drawer**. A panel's save is usually async
  and can fail, so closing is left to the consumer via `(confirmed)`.

- [`67e17ea`](https://github.com/uni-design-system/uni/commit/67e17ea927e3ca24b7abecdcccf134d53ac3656b) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-toggle` honours `size`, and the checked colour has a theme home.

  **`size` did nothing.** `uni-toggle` inherits a bindable `size` input from
  `BaseComponent`, but its geometry came from a single `toggle.behavior.size`
  number, so `<uni-toggle size="sm">` compiled, read as deliberate, and rendered
  identically to every other switch. The theme now carries a `sizes` block and the
  input selects from it.

  **Geometry is stated per size, not derived from ratios.** Each size token is a
  `width` / `height` / `padding` triple — `padding` being the knob's inset — and
  the rest falls out: knob is `height - 2 * padding`, travel is `width - height`,
  radius is `height / 2`. Real switch designs do not hold a constant proportion
  across sizes (a consumer's 32x18 and 28x16 pair differs in both track and knob
  ratio), so a single ratio token could match one size or the other but never
  both.

  `lg` is `BaseComponent`'s default and reproduces the previous geometry exactly —
  40x20, knob 16 — so **no existing toggle moves**. A theme still setting the
  legacy `toggle.behavior.size` number keeps the old derived-ratio behaviour; that
  option is now deprecated in favour of the `sizes` block.

  **Fixed: the knob would have overhung the track at any other proportion.** The
  checked transform was hardcoded to translate by one track height, which is only
  correct while the track is `2x` wide and the knob `0.8x`. It is now derived, so
  the knob lands the same distance from each edge at every size.

  **New `checkedColor`, as an input and a theme option.** The on-state used to be
  the instance's `variant`, which meant an app wanting one switch colour repeated
  an attribute on every call site. `toggle.behavior.checkedColor` sets it once;
  the input overrides per instance; `variant` remains the fallback when neither is
  set. The focus ring follows the resolved colour rather than staying on `variant`.
  An input as well as an option is necessary because `variant` defaults to
  `'primary'` and so cannot be distinguished from unset — without one, a themed
  `checkedColor` would have silently made `variant` inert with no way back.

  **Toggle transitions are a motion token.** It hardcoded `0.3s ease` while
  `uni-radio` already read `theme.motion(options.motion ?? 'control')`, so a theme
  setting a motion scale moved the radio and not the switch.

### Patch Changes

- [`f28c951`](https://github.com/uni-design-system/uni/commit/f28c95117f2844b58a265b59c2ea8b9715156670) Thanks [@gaenglish](https://github.com/gaenglish)! - Document the drawer as an editor panel, and assert the layout that makes it one.

  Both existing Drawer stories were navigation shells, so the shape that actually
  stresses the component — a pinned header, a long scrolling form, a pinned save
  bar — had no worked example. `EditorPanel` is that example, with a
  `uni-number-input` and a `uni-quantity-stepper` near the bottom of the scroll,
  where the sr-only overflow bug used to surface.

  It carries a play function that asserts the scroll geometry: the panel's
  `scrollHeight` equals its `clientHeight`, setting `scrollTop` on it does
  nothing, the footer has no scrollable content of its own, the body scrolls to
  its last element and stops, and no descendant has escaped its scroll container
  to land on the panel. Those assertions live in the story rather than the unit
  spec on purpose — jsdom has no layout engine, so every one of them would pass
  vacuously there.

  The MDX gains the three-row layout, the close-request contract, an input table,
  and theme-option blocks for the two new component entries.

- [`8f85b48`](https://github.com/uni-design-system/uni/commit/8f85b48b06f67e7f44ce29149dd32aae856e2f19) Thanks [@gaenglish](https://github.com/gaenglish)! - New **Experiments → Forms layout pressure** docs page: every form control in an
  `auto 1fr` grid, with a bar showing what it left for its sibling.

  It exists to make one class of bug visible, because nothing else can see it. A
  `1fr` track is `minmax(auto, 1fr)`, and that `auto` floor is the control's own
  min-content size — so a control reporting a larger intrinsic width than it needs
  quietly steals track width from whatever sits beside it, while still looking
  correct in isolation. That shipped once: `uni-quantity-stepper`'s value cell is a
  native `<input>` defaulting to `size="20"`, so it measured ~230px instead of
  ~92px and collapsed a consumer's grid column.

  Neither the specs nor `build-storybook` catch it — the specs assert computed
  styles and ARIA, and jsdom does not do layout — so it took a consumer report.
  The page is deliberately width-constrained, since on a wide canvas nothing
  competes for the track and the defect cannot appear. The measurements are live
  and update as the viewport changes.

- [`67e17ea`](https://github.com/uni-design-system/uni/commit/67e17ea927e3ca24b7abecdcccf134d53ac3656b) Thanks [@gaenglish](https://github.com/gaenglish)! - Signal Forms docs said `[field]`; the directive is `[formField]`.

  `[field]` was the selector in the Angular 21.0 Signal Forms preview and was
  renamed before release. In 21.2 the directive is `FormField`, selector
  `[formField]`, with its required input aliased to `formField` — `[field]` does
  not exist at all. Every form control in this library was documented with the
  name that had been removed, across seven component doc comments and five MDX
  files, and all of it flowed into the MCP index and the generated API reference.
  A consuming app found this, not us.

  Nothing about the components changed: they already satisfy `FormValueControl` /
  `FormCheckboxControl` and always bound correctly.

  **The reason it rotted is that nothing compiled a binding.** No spec or story in
  the library imported `@angular/forms/signals` — the toggle's "Form Signals" story
  hand-bound `[checked]` and `[touched]` as plain props, which demonstrates
  nothing about Signal Forms and would keep passing through any rename. There is
  now a spec that binds a real `form()` to `uni-toggle` through `[formField]` and
  asserts the round trip in both directions, plus `touched` and `required`
  propagation, so the next rename fails CI instead of the docs. The story binds a
  real form too.

- [`f28c951`](https://github.com/uni-design-system/uni/commit/f28c95117f2844b58a265b59c2ea8b9715156670) Thanks [@gaenglish](https://github.com/gaenglish)! - Visually hidden text no longer inflates a consuming app's scroll containers.

  **Eighteen controls quietly added scrollable distance to whatever box happened
  to be above them.** `visuallyHidden` was `position: absolute`, and the controls
  that emit it — `uni-number-input`, `uni-quantity-stepper`, the toggle's hidden
  `<input>`, and fifteen others — are `position: static`. An absolutely positioned
  box resolves its containing block to the nearest _positioned_ ancestor, so each
  1x1 span skipped every `overflow: auto` between it and that ancestor and landed
  in the distant ancestor's scrollable overflow. A consumer reported a fixed side
  panel measuring `scrollHeight: 1891` against `clientHeight: 793` — the whole
  1098px difference came from seven invisible spans that had escaped the panel's
  body scroller.

  The helper is now `position: fixed`, whose containing block is the viewport, so
  it joins no ancestor's scrollable overflow at all. The element stays 1x1 and
  clipped to nothing, so screen reader behaviour is unchanged. Inside a
  `transform`ed ancestor a fixed box re-anchors to that ancestor, which is
  harmless here: where the box lands never mattered, only what it overflowed.

  This class of bug is invisible in isolation — it needs a consumer to nest the
  control inside a scrolling shell before it appears — so it is now covered by a
  test that renders the emitting controls and asserts what actually reaches the
  DOM, not just the recipe.

- [`7545ff3`](https://github.com/uni-design-system/uni/commit/7545ff3e6dd85d29157963488f75f9e3681947c7) Thanks [@gaenglish](https://github.com/gaenglish)! - Stepper buttons now leave focus in their field, and `uni-quantity-stepper`
  follows the theme's field chrome.

  **Clicking `+` or `−` focused nothing.** Taking pointer capture means calling
  `preventDefault()` on `pointerdown`, which also suppresses the browser's default
  focus handling — and the buttons carry `tabindex="-1"`, so focus landed on
  `<body>`. The arrow keys then did nothing, exactly when a user reaching for `+`
  is most likely to try them. `createPressRepeat` gained a `focus` callback,
  invoked on press and handed the pressed button; `uni-number-input` and
  `uni-quantity-stepper` point it at their text field, the way a native spinner
  does. Where there is no field — a read-only quantity stepper, whose buttons are
  themselves the tab stops — focus goes to the button instead. **This affected
  `uni-number-input` as well**, not just the stepper.

  **`uni-quantity-stepper` ignored a theme's field styling.** It carried its own
  `color` / `border` / `borderRadius` tokens, so a theme that restyles `input` —
  Wellsourced fills its fields `#F3F2EF` — left the stepper stark white beside
  them. Those three now default to the shared `input` chrome and are unset in the
  base theme, so the stepper tracks whatever a theme does to its fields; they
  remain available as per-component overrides for parting them deliberately. With
  the focus indicator and the dividers already sourced this way, the container is
  now consistently the field chrome unless a theme says otherwise.

- [`8f85b48`](https://github.com/uni-design-system/uni/commit/8f85b48b06f67e7f44ce29149dd32aae856e2f19) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-quantity-stepper` no longer claims ~230px of width it does not need.

  The value cell is a native `<input>`, which defaults to `size="20"`. Its
  `flex: 1 1 auto` meant `flex-basis` resolved to that intrinsic ~20-character
  width rather than to `valueWidth`, so the control measured ~230px instead of the
  ~92px its buttons and a 3ch value actually need. Worse, that inflated width is
  the control's `auto` size, and a `1fr` grid track is `minmax(auto, 1fr)` — so a
  stepper stole track width from whatever sat beside it in a grid. Reported by
  Wellsourced, who worked around it with `uni-quantity-stepper input { width: 0 }`.

  The input is now sized from its content (`size` bound to the rendered value's
  length), so the intrinsic width tells the truth. `valueWidth` stays the floor via
  `min-width`, which is what keeps stepping 9 → 10 from reflowing the row, and the
  cell still grows past it with the digits — measured at 92px for one to three
  digits, 116px at `12,000`, 140px at `1,234,567`.

  This is deliberately not the `width`-instead-of-`min-width` fix that was also
  suggested: a fixed cell would have pinned the value at `valueWidth` and clipped
  longer numbers, losing the growth the option documents.

  **For consumers carrying the workaround:** it is safe to leave in place — the
  control measures the same 92px either way — but remove it to get the growth
  back, since `width: 0` forces `flex-basis: 0` and pins the cell at the floor.

## 10.0.0

### Major Changes

- [`21b655d`](https://github.com/uni-design-system/uni/commit/21b655df0f93e2e2de6a22ccf38050b474d4e5ab) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-slider` is rebuilt on custom thumbs instead of `<input type="range">`,
  gaining range mode, marks, a value readout and an exact decimal step model. This
  is a breaking change to both the component's value shape and its theme options.

  **Why it could not stay native.** One `<input type="range">` cannot carry two
  thumbs, so range mode, thumb crossing and per-thumb ARIA bounds were all
  unreachable; marks and a value tooltip were unstyleable through it. The
  alternative — a second component for the range case — would have meant two
  keyboard implementations to keep in step, which is the drift the shared step
  model exists to prevent. What the platform was giving us (the slider ARIA
  pattern and the keyboard map) is reimplemented explicitly and covered by 29
  specs.

  **Breaking: value shape.**

  ```ts
  // before
  value = model<number>(0);
  // after — the shape follows `mode`, and `null` is empty
  value = model<number | UniNumberRange | null>(null);
  ```

  A `single` slider still reads and writes a plain number, so
  `[(value)]="volume"` is unchanged. Code that relied on `value()` being
  non-nullable, or that read it without narrowing, now needs to handle `null` and
  the `{ start, end }` range.

  **Breaking: theme options.** `slider.options.color` is **removed**. Fill and
  thumb colour now come from the `variant` role pair, the rule every other
  component follows, so `variant="warn"` recolours a slider with no theme edit. A
  theme that set `color` should delete it and pass `variant` at the call site.
  `trackColor` now defaults to `primary-container` rather than `surface-variant`.

  New options: `thumbBorderRadius`, `minTouchTarget`, `markSize`, `markColor`,
  `labelTypeface`, `labelColor`, `tooltipColor`, `tooltipTextColor`,
  `tooltipShadow`, `tooltipBorderRadius`, `transitionMs`. `trackHeight`,
  `thumbSize` and `borderRadius` are unchanged.

  **New capability.**
  - `mode="range"` — two thumbs, a `{ start, end }` value, `minGap` to fence the
    ends apart. Thumbs may cross and swap, and the dragged one keeps focus.
  - `marks` and `snapToMarks` — labelled stops, spoken in place of the number.
  - `valueDisplay` — `none`, `inline`, `tooltip`, or `input`, which seats a
    compact `uni-number-input` at the trailing edge, two-way bound to the same
    value: drag for the ballpark, type for the exact figure. Single mode only.
  - `origin` — anchor the fill somewhere other than `min`, for sliders spanning ±.
  - `sliding` and `changed` outputs, replacing an implicit per-frame model write.
    **Bind `changed` in forms**; `sliding` fires every frame of a drag.
  - `largeStep`, defaulting to a tenth of the range, for `PageUp`/`PageDown` and
    `Shift+Arrow`.
  - Right-to-left support: the horizontal arrows and the track mirror; the value
    does not.

  **Also new: the `cdk/number` primitives** this is built on, shared with the
  numeric input family still to come — exact scaled-`BigInt` decimal arithmetic
  (`stepDecimal`, `roundDecimal`, `clampDecimal`), locale-aware
  `parseNumber`/`formatNumber` over `Intl`, and `createPressRepeat` for
  hold-to-repeat stepper buttons. Stepping `0.1` twenty times from `0` now lands
  on exactly `2`, and `1.15` rounds to `1.2` where `(1.15).toFixed(1)` gives
  `'1.1'`.

### Minor Changes

- [`2a79bb8`](https://github.com/uni-design-system/uni/commit/2a79bb8ebd8fd0b5cd792697972b6f48b444c80f) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-number-input`: the field for a quantity, a price, a percentage or a
  measurement, with locale-aware parsing, `Intl` formatting on commit,
  prefix/suffix adornments, min/max/step fences and steppers that hold to repeat.

  ```html
  <uni-number-input label="Quantity" [(value)]="qty" [min]="1" />
  <uni-number-input label="Unit price" currency="USD" [(value)]="price" />
  ```

  **Why not `<input type="number">`.** Per the HTML value sanitization algorithm,
  a number input whose text is not a valid floating-point number reports
  `value === ''`. Type `12,50` as most of Europe does, or paste `1,234.56` from a
  spreadsheet, and the app reads an empty field with no way to tell that from a
  blank one — a data-loss bug, and the reason this is `type="text"` with
  `role="spinbutton"`. The platform control also cannot group thousands, cannot
  place an affix outside the editable text, has ~10px unstyleable spinners below
  the WCAG 2.2 target minimum, changes value on the scroll wheel while focused,
  and steps in floats.

  **What it does instead.**
  - **Presets** — `decimal`, `integer`, `currency`, `percent` — supply decimals,
    grouping, affix and `inputmode` together, so a money field is `label`,
    `currency="USD"`, `[(value)]`. `numberFormat` is the escape hatch, merged over
    the preset.
  - **Parses what people actually type**: canonical ASCII always, locale grouping
    (`1.234,56` in German), pasted affixes and currency symbols, accounting
    negatives `(1,234.56)`, localized digit systems, compact `1.5k`, and — behind
    `allowExpressions` — spreadsheet arithmetic like `12*3`, via a shunting-yard
    parser that never calls `eval`.
  - **Unreadable text stays in the field**, flagged with a dashed underline and a
    `rejected` event, rather than being silently swallowed.
  - **Exact arithmetic.** Stepping `0.1` twenty times from `0` lands on exactly
    `2`; `1.15` rounds to `1.2` where `(1.15).toFixed(1)` gives `'1.1'`. A second
    `valueAsString` model carries digits a `number` cannot, and a dev-mode warning
    fires when a bound `value` cannot round-trip.
  - **Percent never divides behind your back**: `preset="percent"` shows `15%` for
    `15`. Models that really are fractions set `valueIsFraction`.
  - Clamping on commit rather than per keystroke, visible fences that disable the
    matching stepper and announce, `wrap` for cyclic fields, `emptyStepValue`,
    four stepper layouts, and hold-to-repeat that announces once on release.

  `uni-slider` gains `valueDisplay="input"`, which seats one of these as its
  readout — drag for the ballpark, type for the exact value.

  Adds `numberInput` to `ComponentName` with a theme entry. Field chrome is not
  duplicated there: colour, border, radius and focus come from the shared `input`
  options via `uni-input-box`, so a number field restyles with every other field.

  `uni-input-box` gains a `managedInset` input. The themed leading inset normally
  rides the inner `<input>`, which is right while the text is the field's leading
  edge and wrong the moment an adornment sits in front — a currency prefix would
  hug the border while the number it belongs to sat indented past it. A field with
  adornments sets `managedInset` and places the inset on whichever element is
  actually first. Existing fields are unaffected: the default is `false`.

- [`e7875ee`](https://github.com/uni-design-system/uni/commit/e7875ee81030a703f4ca1904bb94cb8ddc7f57b9) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-number-range-input`: two linked numeric fields in one chrome with a
  single `{ start, end }` value — price filters, thresholds, tolerances. This
  completes the numeric family alongside `uni-number-input`,
  `uni-quantity-stepper` and the rebuilt `uni-slider`.

  ```html
  <uni-number-range-input label="Price range" currency="USD" [(value)]="price" [minGap]="50" />
  ```

  `start`/`end` deliberately match `UniDateRange`, so the library has one range
  vocabulary, and they never collide with the `min`/`max` **inputs**, which mean
  the fence rather than the value.

  **The rules that make it one field rather than two glued together:**
  - **Either end alone is a valid value.** `{ start: 50 }` means "50 and up",
    which is a real filter. This is where it diverges from `uni-date-time-input`,
    whose two parts are two halves of one answer.
  - **Stepping is fenced; typing swaps.** A stepper can never walk one end through
    the other — its wall is the other end, held off by `minGap`, and each end's
    `aria-valuemin`/`aria-valuemax` report that wall rather than the outer bounds.
    A _typed_ backwards commit is swapped and announced instead, the rule
    `uni-calendar` applies to a backwards date range: clamping against the other
    end would destroy the number just entered.
  - **`minGap` pushes the end you edited**, not the other one, which is what makes
    stepping behave as a fence rather than dragging the range along.
  - A refused draft flags only the end it was typed into; the other stays valid.
  - `preset`, `currency`, `prefix`, `suffix`, `decimals`, `grouping`, `locale` and
    `roundingMode` are forwarded to both ends so the halves always read alike.

  It owns its commit path rather than nesting two `uni-number-input`s, because the
  two behaviours above need _different_ bounds — a stepper must be fenced at the
  other end while a typed commit must arrive un-clamped — and a child field
  applies one bound pair to both. The arithmetic, parsing and formatting are still
  the shared `cdk/number` primitives.

  Adds `numberRangeInput` to `ComponentName` with a theme entry (`partGap`,
  `dividerText`, `dividerColor`). Field chrome is not duplicated there: colour,
  border, radius and focus come from the shared `input` options via
  `uni-input-box`. `dividerText` is literal punctuation rather than an icon token —
  an en dash between two numbers is not a glyph a theme swaps artwork for.

- [`589cecb`](https://github.com/uni-design-system/uni/commit/589cecb178d9119eea3fbc3f3cd9149eefdaa036) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-quantity-stepper`: `− 3 +` for cart lines, table cells and seat counts
  — the numeric core with no field chrome, no label and no room for either.

  ```html
  <uni-quantity-stepper label="Quantity, Blue T-shirt (M)" [(value)]="qty" [min]="1" />
  ```

  A separate component rather than a `chrome="bare"` flag on `uni-number-input`,
  because this control is defined by what it does _not_ have — presets, affixes,
  expressions, four stepper layouts — and eight inputs are easier to write
  correctly than forty plus a list of which ones to leave alone. The arithmetic,
  parsing and hold-to-repeat come from the same `cdk/number` primitives, so
  `1,200` and the keyboard map behave identically in both.
  - **`deleteAtMin`** is the cart pattern in one attribute: at the floor the
    decrement becomes a remove affordance, renamed `Remove {label}`, and emits
    `removed` rather than stepping to zero. Without it every shop reimplements the
    same `value === 1 ? remove() : step(-1)` branch outside the component. (The
    spec called this output `emptied`; that is a native `HTMLMediaElement` event
    name, which `@angular-eslint/no-output-native` rightly rejects, and `removed`
    is already what `uni-tag` calls the same request.)
  - The middle is a real input by default — typing `12` beats tapping `+` eleven
    times, and it takes the same grouped and locale-aware entry the field does.
    `editable=false` renders the number as text for read-mostly tables, and the
    buttons become the tab stops since there is nothing else to focus.
  - `size` is `sm` / `md` / `lg` at 24 / 32 / 40px _outer_ height, so an `md`
    stepper lines up with a 32px field beside it, with the buttons square at that
    height. `md` and `lg` clear the 24×24 pointer target of WCAG 2.2 SC 2.5.8;
    `sm` leaves 22px inside its border and is the dense desktop option.

  Adds `quantityStepper` to `ComponentName` with a theme entry. Unlike the other
  numeric controls it does **not** inherit the shared `input` chrome — it is not a
  field — so it carries its own container tokens, defaulted to the same values
  `input` uses so a cart stepper and a form field look related out of the box.
  Height comes from the entry's `sizes` block rather than an option.

### Patch Changes

- [`ce94c8a`](https://github.com/uni-design-system/uni/commit/ce94c8a6acb5c70351fecfaca3469c46727c2aa4) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-angular`'s build now runs `tsc --noEmit` first, closing the last gap left
  by the earlier "typecheck the builds" change — core and react already did this,
  angular did not.

  `ng-packagr` alone does not surface every type error in the package. A real one
  reached a Storybook build unnoticed: a form control declaring
  `min = input(0)` where `FormValueControl` types the property as
  `InputSignal<number | undefined>` (Signal Forms syncs it from `min()`
  validators), which is a variance error `pnpm build` reported as success. Every
  form control must declare `min`/`max` as `input<number | undefined>(…)` and read
  a `resolvedMin()` computed internally.

  Also here:
  - A `type-check` script, matching core and react, so `turbo type-check` covers
    the whole workspace.
  - `prototypes/**` is excluded from the package tsconfig. Those are standalone
    design explorations that reference modules and dependencies which do not
    exist in this package — excluding them is what makes a real typecheck
    possible over the code that ships.
  - Three latent type errors fixed: `vitest.config.ts` took `defineConfig` from
    `vite`, whose overload does not accept the `test` block (it comes from
    `vitest/config`); `spacing.spec.ts` lost callback inference through an
    untyped `vi.spyOn` return; and `radio.motion.spec.ts` typed a `motion`
    argument as `Record<string, unknown>` rather than `Motions`.

- [`5cf120b`](https://github.com/uni-design-system/uni/commit/5cf120b9cb268e74a2ed062d8df2cf5cf9749750) Thanks [@gaenglish](https://github.com/gaenglish)! - Lint MDX prose for stray `{`, which MDX compiles to a JSX expression.

  Writing `named "Increase {label}"` in a docs bullet makes `label` a reference to
  an undefined variable, and the page dies at runtime with
  `ReferenceError: label is not defined` under Storybook's "The component failed to
  render properly" banner. Nothing caught it: it is a React render error rather
  than a compile error, so **`build-storybook` passes**, and `check-doc-links.mjs`
  only validates link ids. Only opening the page found it — twice.

  `scripts/check-mdx-braces.mjs` now runs as part of the package's `lint` script,
  so `turbo run lint` (and therefore CI) fails on it. It skips the four places a
  brace is legitimate — fenced code blocks, inline code spans including ones that
  soft-wrap across a line, ESM `import`/`export` statements, and JSX tags such as
  `of={Stories.X}` or `rows={[…]}` — plus MDX comment containers. Hits are
  reported as `file:line:column` with the offending line and the fix: backtick the
  text, or escape the brace as `\{`.

  Also available on its own as `pnpm lint:mdx`.

- [`05f991f`](https://github.com/uni-design-system/uni/commit/05f991f0cc6b0895777763ede7605b5e274dc0a1) Thanks [@gaenglish](https://github.com/gaenglish)! - Three cosmetic fixes in the numeric family.

  **`uni-quantity-stepper`'s dividers were heavier than its frame.** The rules
  either side of the value took `dividerColor: 'outline'` — a solid grey — against
  an outer border of the 8%-alpha `light` token, so the control read as three
  pieces stuck together rather than one frame. They now take the **same `border`
  token as the container** and move with it on focus, so a focused stepper is not
  accented on the outside and grey down the middle. `dividerColor` remains as an
  opt-in override for a deliberately distinct rule, and is unset in the base theme.

  **`uni-quantity-stepper` had no focus state.** Every other field gets its focus
  chrome from `uni-input-box`, which the stepper deliberately does not use — and
  its inner input clears its own outline via `removeInputPlatformStyling`, so
  focusing the middle showed nothing at all. The container now carries the same
  `:has(input:focus)` rule and the same `input` theme tokens the box applies
  (`focusOutline`, `focusOutlineOffset`, and the optional `focusBorder` /
  `focusShadow` / `focusColor`), so a stepper highlights exactly like the field
  beside it — including in themes such as Wellsourced that express focus as a
  border and ring rather than an outline. Error state still wins, keeping a
  flagged control visibly flagged while it is corrected.

  **A trailing suffix sat against the right border.** The leading inset was
  already handled, so the two sides did not match. `uni-number-range-input` — which
  has no steppers — now insets both edges of its row, and `uni-number-input` insets
  the trailing edge whenever no stepper occupies it (`stepperLayout="none"`, or a
  read-only field). Where a stepper _is_ present the trailing edge is still left
  to it, because a button is meant to reach the border.

  Both insets ride the row rather than the `<input>`: `uni-input-box` styles
  `& input` at a higher specificity than a component class can reach, so padding
  set on the input itself is silently dropped.

- [`1fe8941`](https://github.com/uni-design-system/uni/commit/1fe89415c65d38c97d610fb5725e8a050432192f) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-tag-input`'s first chip no longer rides the left border.

  The themed leading inset was applied by `uni-input-box` to the inner `<input>`,
  which is the field's leading edge only while it is empty. Once a chip existed,
  the chip sat flush against the border while the text after it stayed indented.
  The chip row now owns the inset — it is the leading content — via the
  `managedInset` input added alongside `uni-number-input`, so the first chip and
  an empty field's placeholder both start at the same 8px as every other field's
  text. Wrapped chip rows are unaffected; vertical padding already handled those.

- Updated dependencies [[`2a79bb8`](https://github.com/uni-design-system/uni/commit/2a79bb8ebd8fd0b5cd792697972b6f48b444c80f), [`e7875ee`](https://github.com/uni-design-system/uni/commit/e7875ee81030a703f4ca1904bb94cb8ddc7f57b9), [`589cecb`](https://github.com/uni-design-system/uni/commit/589cecb178d9119eea3fbc3f3cd9149eefdaa036), [`21b655d`](https://github.com/uni-design-system/uni/commit/21b655df0f93e2e2de6a22ccf38050b474d4e5ab)]:
  - @uni-design-system/uni-core@10.0.0

## 9.0.1

## 9.0.0

### Major Changes

- [`c0c6056`](https://github.com/uni-design-system/uni/commit/c0c6056c61e994a45af9c379f3c99f55eebcb79a) Thanks [@gaenglish](https://github.com/gaenglish)! - Box learns `flex` / `shrink` / `basis` and `marginInline`.

  **`flex`.** `grow` emits `flex-grow` alone, which leaves `flex-basis: auto` — so
  it cannot express `flex: 1`, and any layout wanting siblings to share space
  evenly regardless of content width had to stay in CSS. `[flex]="1"` now emits
  the shorthand; `shrink` and `basis` cover the rest. `grow` is unchanged, so no
  existing layout moves.

  These three go through a new `ThemeService.styleIfSet()`, which treats only
  `undefined` as unset — the shared `style()` helper drops falsy values, which
  would have silently swallowed `[shrink]="0"`, the single most useful value.

  **`marginInline`.** `margin: 0 auto` on a max-width container had no Box
  equivalent, so page shells kept an inline style for it. `marginInline="auto"`
  centers such a container, and a spacing token works too.

  ```html
  <main box-layout maxWidth="1200px" marginInline="auto" padding="lg">…</main>
  ```

  Only the inline axis is exposed. Block margins collapse and fight `gap`, which
  is why the primitives carry no margin otherwise — inline margins do neither, so
  this is a deliberate line rather than a crack in the token-only surface.

- [`8250162`](https://github.com/uni-design-system/uni/commit/8250162c35e418f976080904df4c20783feeb6e2) Thanks [@gaenglish](https://github.com/gaenglish)! - Every deprecated API is removed. The library now carries no `@deprecated`
  symbols at all.

  **Per-component duration options → the `motion` scale.** Six components carried
  their own duration knob that predated the motion scale and _won over_ it:
  `expand.transitionSpeed`, `callout.transitionMs`, `radio.transitionSpeed`,
  `menuItem.transitionSpeed`, `alert.transitionSpeed` and
  `snackbar.transitionDelay`. All are gone, along with the precedence branch each
  one required — timing now comes from the token, full stop.

  Retime the token instead; one edit covers every component pointing at it. To
  retime a single component, define a token of your own and point that
  component's `motion` option at it:

  ```ts
  createTheme({
    …,
    motion: { productive: { duration: 110, easing: 'ease' } },
    components: { menuItem: { options: { motion: 'productive' } } },
  });
  ```

  A `duration: 0` token is how a theme opts out of motion — that is what
  `transitionSpeed: 0` used to mean. Both showcase themes are migrated this way
  (Carbon to a 110ms `productive` token, Wellsourced to an `instant` one).

  **Options that never did anything.** `card.transitionSpeed` and
  `inputBox.transitionSpeed` were read by nothing and never had been. Delete them
  from your theme; nothing replaces them.

  **Renames and obsolete APIs**
  - `inputBox.typeFace` → `typeface` (the casing every other component uses).
  - `uni-tooltip`'s `appendToBody` input — inert since the tooltip moved to the
    native top layer, which escapes any overflow context by itself.
  - Box's `elevation` input → `shadow`, in both the Angular and React packages.
    It was a second name for the same thing.
  - The Angular `icons` re-export → import `BaseIcons` from
    `@uni-design-system/uni-core`. The default set ships with every theme.

  **The HSL color legacy is gone from uni-core.** `uniColor`, `randomRangeValue`,
  `CategorySaturation` and `CategoryLightness` are removed, superseded by the
  deterministic OKLCH engine (`generateThemes` / `generatePalette`) — same input,
  same theme, WCAG-checked. `RoleHues` and the `UniColor` type go with them: they
  were reachable only through `uniColor`, and `RoleHues` had gone stale enough to
  hold saturation values in a table of hues.

  **Deferred output renames.** Three outputs were held back because renaming is
  breaking; this is that release. Each also drops an eslint escape it needed for
  shadowing a native event name or using an `on` prefix.

  | Component            | Before            | After            |
  | -------------------- | ----------------- | ---------------- |
  | `uni-debounce-input` | `(change)`        | `(valueChange)`  |
  | `uni-search-input`   | `(change)`        | `(searchChange)` |
  | `uni-search-input`   | `(search)`        | `(searchSubmit)` |
  | `dragAndDrop`        | `(onFileDropped)` | `(fileDropped)`  |

  **`uni-dropdown`'s `color` input → `containerColor`,** completing the rule the
  layout directives set: every container-pair input in the library is now
  `containerColor`, and plain `color` always means the CSS property.

  **`ThemeService.getSpacing('none')` now returns `0`, not the string `'none'`.**
  `'none'` is not a valid length, so it was silently dropped wherever it landed —
  `uni-menu` carried a comment working around exactly that, which is now deleted.

- [`c0c6056`](https://github.com/uni-design-system/uni/commit/c0c6056c61e994a45af9c379f3c99f55eebcb79a) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-input` gets a `type`, and the input chrome stops needing a wrapper div.

  **Types.** `uni-input` was text-only with no `type` at all, so every email, URL,
  number and phone field had to fall back to `uni-input-box` plus a hand-written
  native `<input>`, and `type="password"` could not go through it. It now takes
  the text-like types: `text` (default), `email`, `password`, `search`, `tel`,
  `url`, `number`.

  Non-text types (`checkbox`, `radio`, `file`, `range`, `color`) stay out — they
  break both the input chrome and the `FormValueControl<string>` value contract —
  as do `date` / `time` / `datetime-local`, which have dedicated components.

  **Native passthroughs.** `autocomplete`, `inputMode`, `list` (a `<datalist>` id),
  `step` and `spellcheck` are plain passthroughs; an unset one emits no attribute.
  `readonly`, `name`, `min`, `max`, `minLength`, `maxLength` and `pattern` are
  Signal Forms' own optional control inputs, so the `[field]` directive syncs them
  from your validators exactly as it already syncs `required` — and they are
  reflected onto the native element so the browser contributes too. Signal Forms
  treats multiple `pattern`s as all-must-match, which the native attribute cannot
  express, so it is reflected only when there is exactly one.

  `uni-textarea` gains `readonly`, `name`, `minLength`, `maxLength`, `autocomplete`
  and `spellcheck`; `uni-debounce-input` gains `type`, `autocomplete` and
  `inputMode`.

  **Sizing.** `uni-input-box`'s host is `display: contents`, so a width or layout
  attribute set on the element itself was silently dropped and every call site
  needed a wrapper `<div>`. It now takes `width`, `fullWidth` and `grow` (joining
  `minWidth`), which reach the real box inside; `uni-input`, `uni-textarea` and
  `uni-select` forward all four. The `display: contents` behavior is now documented
  too — it stays surprising even once sizing works.

  Both `uni-input` and `uni-debounce-input` now accept the adornment slots as
  either element or attribute selectors (`<span pre-input>` as well as
  `<pre-input>`), which had drifted apart between them.

- [`c0c6056`](https://github.com/uni-design-system/uni/commit/c0c6056c61e994a45af9c379f3c99f55eebcb79a) Thanks [@gaenglish](https://github.com/gaenglish)! - The layout primitives and `uni-text` are now **directives**, so they compose.

  They were components with attribute-only selectors, which meant any two of them
  on one element threw NG0300 ("multiple components match"). `<div row-layout
uni-text="title-small">` — the most natural thing to write — threw in dev only,
  so it reached production as a silent style mismatch. `<uni-card box-layout>`
  was blocked for the same reason, and `box.component.ts` documented the
  wrap-it-in-a-div workaround as permanent.

  All eight are pure host-styling wrappers (an `<ng-content>`-only template plus a
  `[class]` host binding), so as directives they render identically and now stack
  freely — with each other, with `uni-text`, and with a component's own host
  element. Angular reconciles the host `class` bindings additively, so each
  contributor's styles survive rather than one silently winning; there is a spec
  pinning that.

  ```html
  <div row-layout uni-text="title-small" padding="md">Heading</div>
  <uni-card box-layout padding="lg">…</uni-card>
  ```

  **BREAKING: class renames.** `UniBoxComponent` → `UniBoxDirective`, and likewise
  for Row, Stack, Center, Wrap, Grid, GridArea and Text. No compatibility aliases:
  a major is where the break belongs, and an alias shipped on day one of a major
  tends to survive to the next one. Rename the symbols in your `imports: []`.

  **BREAKING: the layout directives' `color` is now `containerColor`.**

  Composing the two directives exposed a name collision. `color` was an input on
  both — a _container pair_ on the layout primitives, the CSS `color` property on
  `uni-text` — so on a shared element one binding fed both: the box painted the
  surface, the text took the same token, and the text rendered as ink on identical
  ink. A deprecated alias would have kept that path alive, so there isn't one.

  `color` belongs to `uni-text`, which maps it straight to the CSS property. The
  container pair is an invented concept and now says so:

  ```html
  <!-- before -->
  <div box-layout color="surface">
    <!-- after -->
    <div box-layout containerColor="surface"></div>
  </div>
  ```

  This applies to all seven layout directives (Box and its subclasses) and to
  `uni-scroll-area`, which is attribute-selected too and carried the identical
  hazard. `backgroundColor`, which sets only the background and no paired
  on-color, is unchanged, as is `color` on `uni-icon` / `uni-skeleton` /
  `uni-badge` — there it already means a foreground color, the same sense as
  `uni-text`'s.

  Codemod: rename `color` → `containerColor` on any element carrying a `*-layout`
  or `scroll-area` attribute; leave `color` alone everywhere else.

  The rename fixed the input collision; a second one sat underneath it in CSS.
  `containerColor` emits a background **and** its paired on-color, so both
  directives write `color` to the element — at equal specificity, which left the
  cascade to Emotion's insertion order (text won on `row-layout`, lost on
  `scroll-area`). An explicit `uni-text` `color` is now emitted at doubled
  specificity, so it deterministically wins; with no explicit color, the
  container's on-color still shows through as intended.

  `uni-dropdown` still names its container pair `color`. It is an element selector
  (`<uni-dropdown>`), so the collision needs someone to put `uni-text` on a
  component host — possible, but not the natural path the layout attributes are.

  **New: `UNI_LAYOUT` and `UNI_FORMS`.** These are attribute selectors, so an
  element carrying one whose directive was never imported compiles cleanly and
  silently does nothing. Spreading a family is the cheapest guard:

  ```ts
  imports: [...UNI_LAYOUT];
  ```

- [`c0c6056`](https://github.com/uni-design-system/uni/commit/c0c6056c61e994a45af9c379f3c99f55eebcb79a) Thanks [@gaenglish](https://github.com/gaenglish)! - The spacing scale is open, and `createTheme` finally accepts one.

  The scale was a closed seven-name union on a doubling curve (2/4/8/16/32/64px).
  Real layouts are rarely built exclusively on one — the gaps between 8 and 16,
  and 16 and 32, are where a lot of real spacing lives — and there was no way to
  add a step, because **`ThemeConfig` had no `spacing` field at all**:
  `createTheme` hardcoded the base scale. The Wellsourced showcase theme had to
  bolt its scale on after the fact with a post-hoc spread.

  Three changes, which only work together:
  - `NullableSize` gains a `(string & {})` arm, so any name the theme defines is a
    valid `padding` / `gap` / `marginInline` value while the seven named steps keep
    their autocomplete. `Size` itself stays closed — it also types _component_
    sizes, where an arbitrary name has nothing to resolve against.
  - `Spacing` is spelled out as named-optional-keys plus an index signature
    (mirroring `Typography`), rather than a `Partial<Record<…>>` that would
    collapse to a plain string record and lose the named steps.
  - `createTheme({ spacing })` merges over the base scale.

  ```ts
  createTheme({ id, name, colors, spacing: { tight: '6px', snug: '10px' } });
  ```

  ```html
  <div stack-layout padding="tight" gap="snug">…</div>
  ```

  Because the scale is open, a mistyped token can no longer be a compile error. It
  is dropped — an `undefined` CSS value simply does not render — and
  `ThemeService` now warns once per unknown token in development, naming the
  tokens the active theme does define. Scaffolded `uni-theme.ts` files carry a
  `spacing` block so the static theme file stays the editable source of truth.

  **Behavior change:** `xxl` was in the `Size` union but defined by no base theme,
  so `padding="xxl"` type-checked and rendered nothing. It is now `128px`,
  completing the doubling — any element relying on the silent drop will start
  showing spacing.

### Patch Changes

- Updated dependencies [[`8250162`](https://github.com/uni-design-system/uni/commit/8250162c35e418f976080904df4c20783feeb6e2), [`c0c6056`](https://github.com/uni-design-system/uni/commit/c0c6056c61e994a45af9c379f3c99f55eebcb79a)]:
  - @uni-design-system/uni-core@9.0.0

## 8.4.0

### Minor Changes

- [`1aca747`](https://github.com/uni-design-system/uni/commit/1aca747c7bdff6cf72a9fa349e77a6e7985b97c7) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-callout` and `uni-expand` now read their timing from the theme's `motion`
  scale, so every animated surface in the library is retimed from one place.
  They were the last two carrying their own motion options — in different units,
  under different names (`transitionMs` in milliseconds, `transitionSpeed` in
  seconds).

  A third token joins `popup` and `panel`:

  | Token    | Default           | Used by               |
  | -------- | ----------------- | --------------------- |
  | `reveal` | 350ms ease-in-out | expand, expand-toggle |

  `reveal` is a _base_ speed, not a final duration: `uni-expand` still scales it
  by content height (√-of-height, clamped) so short regions stay snappy and tall
  ones aren't rushed, and its easing now drives the reveal curve, which was
  hardcoded. `uni-expand-toggle` resolves the token the same way, so the chevron
  and the region cannot drift apart. `uni-callout` maps onto `panel`, whose
  250ms matches what it already used.

  **Not breaking.** `transitionMs` and `transitionSpeed` are deprecated but
  still honoured, and deliberately outrank `motion` — a theme that set either
  keeps precisely its current timing rather than being retimed underneath it.
  They are removed next major. Per-instance inputs, like `uni-expand`'s
  `transitionSpeed`, still outrank everything.

  Nothing moves differently by default: callout renders 0.25s ease and expand
  0.35s ease-in-out exactly as before, verified against the rendered styles.

- [`e459f91`](https://github.com/uni-design-system/uni/commit/e459f916e6f097041d04c8209e896b8fd7d11362) Thanks [@gaenglish](https://github.com/gaenglish)! - New `createAnnouncer()` in the CDK's a11y helpers: the polite live region a
  form control uses for its running commentary — commits, clears, refused
  entries, result counts — changes a sighted user sees but that are otherwise
  silent to a screen reader.

  `uni-combobox`, `uni-tag-input`, `uni-time-input`, `uni-date-input`,
  `uni-calendar` and `uni-tour` now share it instead of carrying byte-identical
  copies. The helper holds no DOM and no styling: the `role="status"` element
  stays in each component's own template, where its placement and
  visually-hidden class already belong.

  This fixes a real bug in `uni-tour`, which had a plain signal rather than a
  copy of the shared idiom. Assistive tech reads a live region when its content
  _changes_, so writing the identical string is a no-op — its "Next available"
  gate message was announced on the first step that used it and silently dropped
  on every later one. `createAnnouncer` breaks the equality with a trailing
  space, inaudible to a screen reader, alternating between the two forms so
  nothing accumulates.

  Consuming the helper directly:

  ```ts
  protected readonly announcer = createAnnouncer();
  // this.announcer.announce('Alabama selected.');
  ```

  ```html
  <span role="status" aria-live="polite" [class]="srOnly"> {{ announcer.message() }} </span>
  ```

  The region must already be in the DOM when the component renders — one added
  at the moment it gains text is not reliably announced.

- [`6e2cfb1`](https://github.com/uni-design-system/uni/commit/6e2cfb1f9bfd82c7165e2a853b1729abdda5194a) Thanks [@gaenglish](https://github.com/gaenglish)! - Home and End now move the caret in the combobox-style controls —
  `uni-combobox`, `uni-search-input`, `uni-tag-input` — instead of jumping to
  the ends of the suggestion list. APG reserves those keys for text editing in
  an editable combobox, and a field that claims them makes its own text
  un-navigable exactly when you are most likely to be editing it: with the list
  open. `uni-time-input` already behaved this way.

  Nothing is lost. ArrowUp on a closed list already opens it on the last option,
  ArrowDown on the first, and navigation wraps at both ends, so every position
  Home/End reached is still one keystroke away.

  `uni-multi-select-dropdown` keeps them: its roving focus rides the option
  checkboxes rather than a text field, so there is no caret with a better claim.

  `ListboxNavigation` carries the switch as `homeEndNavigates`, defaulting to
  false — off is the right default for a control built around a text input,
  which is every consumer but one. If you build on the CDK helper directly and
  want the old behavior, pass `homeEndNavigates: true`.

  This also fixes a sharper bug in `uni-search-input` and `uni-tag-input`, where
  Home/End reached the navigation helper unconditionally: pressing either not
  only moved the active option but _opened a closed suggestion list_.

- [`dd33baa`](https://github.com/uni-design-system/uni/commit/dd33baa821922f257980cc3543dcac0ba118a0c3) Thanks [@gaenglish](https://github.com/gaenglish)! - The four listbox popups — `uni-search-input`, `uni-tag-input`,
  `uni-time-input` and `uni-combobox` — now render in the browser's top layer,
  anchored to their field, instead of as absolutely-positioned children of it.
  Put any of them inside a card, a table cell, a scroll area or a dialog and the
  suggestion list is no longer clipped by that ancestor's `overflow`. The browser
  tracks the field natively, so the list follows on scroll and resize with no
  listeners, and flips above the field near the bottom of the viewport.

  They also open the way `uni-dropdown` does now — the same 100 ms scale-and-fade
  — so every popup panel in the library animates alike instead of the listboxes
  alone snapping into place. The origin is measured from where the popup actually
  opened, so one that flips above its field near the bottom of the viewport still
  grows out of the edge it is attached to. Under `prefers-reduced-motion` there is
  no transition at all.

  Nothing changes in the components' APIs or in how they dismiss. The popups use
  `popover="manual"`, not `auto`: these controls already own dismissal through
  focusout, Escape and commit, and `auto`'s light-dismiss fires on pointerdown
  outside the popup — which includes their own input, so it would close the list
  on every click into the field.

  Positioning is gated on CSS anchor positioning support, checked together with
  the top layer rather than separately. Browsers that have `popover` but not
  anchors — Safari 17 through 25 — keep the previous in-flow popup, which still
  clips inside `overflow: hidden` ancestors but stays on its field; promoting it
  there would strand the list a viewport height down the page, since a top-layer
  element has no positioned ancestor to resolve against.

  Shared plumbing lives in `components/forms/listbox-popup.ts` alongside
  `listboxPopupStyles()`, which grew an optional `anchor` and now emits the
  in-flow rules as the base with the anchored ones in an `@supports` block.

- [`2910c67`](https://github.com/uni-design-system/uni/commit/2910c67c9ac0c5b47be7f67c4407514aa22a4f60) Thanks [@gaenglish](https://github.com/gaenglish)! - `Option.disabled` now works in the three remaining `Options<T>` consumers, not
  just `uni-combobox`: `uni-select`, `uni-multi-select-dropdown` and
  `uni-multi-select`. Marking an individual choice `disabled` shows it without
  offering it — the plan that needs an upgrade, the channel that needs a verified
  phone number — instead of dropping it from the array and leaving the list
  lying about what exists.

  `uni-select` passes it to the native `<option>`, so the platform handles
  skipping, greying and announcement. The two multi-selects disable the option's
  checkbox and refuse the toggle even when called directly. In
  `uni-multi-select-dropdown` the arrow keys step over disabled rows and Home/End
  land on the nearest enabled option — `ListboxNavigation` already knew how, it
  just was not being told which rows were disabled — so focus never parks on a
  checkbox that cannot take it.

  `selectAll()` on both multi-selects now selects only enabled options. A
  disabled option is not committable, so nothing may commit one on the user's
  behalf; `deselectAll()` still clears everything. If you relied on `selectAll()`
  returning every value including disabled ones, note that only options you have
  explicitly marked `disabled` are affected. Whole-field `disabled` is unchanged
  and still disables the entire control.

- [`6f76c1d`](https://github.com/uni-design-system/uni/commit/6f76c1d3cc1ba2ed5e2747b6d2142d16cb4f537b) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-alert`, `uni-snackbar`, `uni-radio` and `uni-menu-item` now read their
  timing from the theme's `motion` scale, which completes the migration: every
  animated component in the library is retimed from one place.

  Two tokens join `popup`, `panel` and `reveal`:

  | Token          | Default           | Used by          |
  | -------------- | ----------------- | ---------------- |
  | `notification` | 350ms ease-in-out | alert, snackbar  |
  | `control`      | 300ms ease        | radio, menu-item |

  **One thing moves differently:** `menu-item`'s hover transition goes from
  0.35s to 0.3s, joining `radio` on the shared `control` token. The two were
  never deliberately different — `radio`'s own option documented its 0.3 as
  "matching menuItem", which was not true — so this corrects drift rather than
  changing a decision. A theme that wants the old timing can set the deprecated
  `transitionSpeed`, or retime `control`. Everything else is byte-identical,
  verified against the rendered styles.

  **Deprecated, still honoured, removed next major:**
  `alert.transitionSpeed`, `snackbar.transitionDelay`, `radio.transitionSpeed`
  and `menuItem.transitionSpeed` all still work and still outrank `motion`, so a
  theme that set them keeps its exact timing. `menu-item`'s escape hatch is
  intact too: with neither the option nor a token set it still renders no
  transition at all, and a token with `duration: 0` is the way to ask for
  instant now.

  `card.transitionSpeed` and `input-box.transitionSpeed` are also deprecated,
  for a different reason: **neither was ever read by its component.** Setting
  them has never had any effect. They are removed next major and nothing needs
  to replace them.

  `uni-skeleton` is deliberately left out. Its shimmer is a loop rather than a
  transition, and folding a repeating animation into a scale built around
  entering and leaving would make the scale mean two different things.

- [`228c17f`](https://github.com/uni-design-system/uni/commit/228c17f9fb7a4e4eb8d6a9cd0a6301d02ddd3dd3) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-skeleton` picks up the knobs an app theme could not reach. `color`, `highlightColor` and `borderRadius` are now inputs that take a token name and fall back to the theme option, because one screen routinely needs several of each — text bars and a pill chip do not share a corner (`borderRadius="max"`), and a skeleton on a card wants a different tint than one on the page background.

  The shimmer is now a band swept with `transform` rather than an animated `background-position`: it composites instead of repainting every frame, and its geometry is themeable via two new options, `direction` (`'ltr' | 'rtl'`, default `'ltr'` — the sweep previously ran right-to-left) and `highlightWidth` (band width as a percentage of the block, default `40`). Both ends of the band are the base color, so it dissolves into the block with no alpha and no fringing.

  A new `label` input announces a standalone skeleton: set it and the host becomes `role="status"` with visually hidden text instead of `aria-hidden="true"`. Unlabelled skeletons stay `aria-hidden`, so container-level `aria-busy` patterns are unchanged.

- [`eb795a3`](https://github.com/uni-design-system/uni/commit/eb795a3874c4642e571651dfdebd1a392d62d5ab) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-snackbar` now renders in the browser's top layer, so it can no longer be
  covered by a high `z-index` or clipped by an `overflow: hidden` or transformed
  ancestor. It was the last overlay in the library still competing on stacking
  order: a `<dialog>` opened with `.show()`, which is the _non-modal_ form and
  never enters the top layer, left it relying on `zIndex: Z_INDEX.dialog`. That
  held only because apps mount the bar near the root — anywhere else, a
  confirmation of what just happened could be silently buried.

  The bar is now a `popover="manual"`. Manual rather than auto because a
  snackbar must not light-dismiss: a click anywhere else on the page would tear
  it away from someone still reading it. It is not `showModal()` either — that
  would make the rest of the page inert to announce a transient message.

  `role="status"`, the auto-close timer, its pause-on-hover and pause-on-focus
  behaviour, the entry and exit animations, and the `[(show)]` / `open()` /
  `close()` API are all unchanged.

  The element behind the component changed from `<dialog>` to `<div>`: the bar
  is never modal, and `<dialog>`'s `open` attribute would have been a second,
  competing notion of "shown" alongside the popover's own state. Styles that
  reach inside the component to target `uni-snackbar dialog` need updating —
  `uni-snackbar [role="status"]` is the stable selector.

- [`3b51ace`](https://github.com/uni-design-system/uni/commit/3b51acee92659526c1c8c91668b37db8c5933162) Thanks [@gaenglish](https://github.com/gaenglish)! - Overlay timing is now a theme token. `UniTheme` gains a `motion` scale
  alongside `radii`, `shadows` and the rest, and the overlays point at it by
  name instead of carrying their own hardcoded durations.

  Until now a theme could slow a skeleton shimmer but not a dropdown: `expand`,
  `skeleton` and `callout` each exposed their own motion option while
  `uni-dropdown` hardcoded 100ms and the combobox-style listbox popups copied
  that constant. Retiming the library meant editing components.

  Two tokens ship, because two things genuinely move differently — a small panel
  attached to a control snaps, a larger free-floating surface settles:

  | Token   | Default            | Used by                                                                     |
  | ------- | ------------------ | --------------------------------------------------------------------------- |
  | `popup` | 100ms linear, ×0.8 | dropdown, menu, multi-select, combobox, search-input, tag-input, time-input |
  | `panel` | 250ms ease         | popover                                                                     |

  A token carries `duration` (ms), `easing`, and an optional `scale` for panels
  that grow into place — one token rather than separate duration and easing
  scales, because they are one design decision: slowing a panel without
  softening its curve reads as sluggish rather than calm.

  ```ts
  createTheme({
    id: 'Calm',
    name: 'Calm',
    colors,
    motion: { popup: { duration: 240, easing: 'ease-out', scale: 0.95 } },
  });
  ```

  Tokens you don't restate keep their base values, and a component can still
  point at a token of its own through its `motion` option.

  Nothing moves differently by default — every current duration, easing and
  scale is preserved exactly, verified against the rendered styles. Themes that
  predate the scale keep working: `createTheme` fills it in, the validator does
  not require it, and a theme registered as JSON without it resolves to the base
  timing rather than failing. `motionSafe` remains the floor, so a theme decides
  how overlays move for people who want movement, never whether they move at
  all.

  `callout`'s existing `transitionMs` option and the `expand`/`skeleton`
  durations are untouched for now; folding them into this scale is a follow-up.

### Patch Changes

- [`676ec55`](https://github.com/uni-design-system/uni/commit/676ec5549cf4b10c549538aebd8f5a56fc0cb68a) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-dropdown` now uses the CDK's overlay helpers instead of its own copies of
  them. It predates `cdk/overlay`, so it had been carrying a duplicate
  placement-to-`transform-origin` map, a duplicate focus-restore rule, a
  duplicate discrete-transition block, and hand-written anchor and toggle-state
  code. `TRANSFORM_ORIGINS` had no consumers at all as a result — the shared
  constant existed while the one component that needed it used its own copy.

  No behaviour change: the dropdown's 100 ms linear scale-and-fade, its measured
  transform origin, its focus restore and its ARIA wiring are all identical,
  verified against the rendered styles. Every export in `cdk/overlay` now has a
  consumer, and the component is 35 lines shorter.

  `discreteOverlayTransition()` takes an optional fourth argument, a
  `transition-timing-function`. Omitted, nothing is emitted and the CSS initial
  value stands, so existing callers are untouched.

  One real inconsistency fixed along the way: the listbox popups
  (`uni-combobox`, `uni-search-input`, `uni-tag-input`, `uni-time-input`) were
  introduced to match `uni-dropdown`'s animation but ran on the default `ease`,
  while the dropdown uses `linear` — so a combobox and a multi-select dropdown
  in the same form opened at visibly different rates. They now share the
  dropdown's easing exactly.

## 8.3.1

### Patch Changes

- [`66f4051`](https://github.com/uni-design-system/uni/commit/66f4051c69b6b55ed2c2b95425fd8aa1a1bccdcd) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-combobox` docs: "Allowing new values" — free text never commits implicitly (closed-set contract: typing filters, a non-matching draft reverts with `(rejected)`). The supported create-new pattern is now documented with a working story: drive `[options]` from the debounced `(query)` with `[filterLocally]="false"` and, when nothing matches exactly, append a sentinel option — `{ label: `Create "${text}"`, value: … }`. As a real option it commits through every normal path (arrow + Enter, click, Enter when the filter narrows to it alone); resolve it in `(selected)` by minting the entity and writing the model. Blur intentionally never commits the sentinel — creation takes an explicit Enter or click. Lighter alternative: listen to `(rejected: { query })` and offer creation outside the control. If most values are user-created, use `uni-tag-input` (open set) instead.

- [`dc7aef9`](https://github.com/uni-design-system/uni/commit/dc7aef994abd4e7ac73de64bdea2d3ce5cb18db3) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-dropdown` (and everything riding it — the date picker popup, menus, multi-select): the open/close scale animation now originates from the corner actually touching the trigger. The origin was mapped statically from the _requested_ placement, but `position-try-fallbacks` lets the browser flip the panel at viewport edges — so a `bottom-end` date picker repositioned above its field still animated from the top-right corner. The panel is now measured on each toggle (open and close-start) and the transform origin follows the rendered position, via the new cdk helper `transformOriginFor(panelRect, triggerRect)`.

## 8.3.0

### Minor Changes

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-combobox` — the form-bound, closed-set, single-select autocomplete. `FormValueControl<T | null>` over the cdk's object `Options<T>`, so it drops into Signal Forms via `[field]`; minimum usage is `<uni-combobox label="State" [options]="states" [(value)]="state" />`. Typing filters, it never selects: the draft commits on an active option, a unique exact label match, or (Enter only) a filter narrowed to one enabled option; anything else reverts and emits `(rejected)`. The value contract is identical to `uni-select` (`T | null`, `compareWith`), so swapping one for the other as a list grows is a template-only change. Filtering is local by default; `[filterLocally]="false"` renders `options` verbatim and the app narrows them from the debounced `(query)` output — the async/server-side story. Glyphs are theme icon primitives (`toggleIcon`/`clearIcon`/`selectedIcon`) rendered by `uni-icon`.

  Supporting cdk changes, both non-breaking:
  - `Option<T>` gains optional `description` (secondary line, read as part of the option's name) and `disabled` (visible and announced, not committable).
  - `ListboxNavigation` accepts a `disabled?: (index) => boolean` config hook — arrows skip disabled options, `Home`/`End` land on the nearest enabled one, an all-disabled list never activates. Existing consumers pass nothing and behave identically.

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - Listbox popups (`uni-search-input`, `uni-tag-input`, `uni-time-input`, `uni-combobox`): the active/hover option fill is now the themable `activeColor` option (default `'primary-container'`, on-color derived) instead of a hardcoded token pair. Set it when your theme maps `primary-container` and `primary-surface` to the same color — the keyboard highlight is otherwise invisible; a canvas/hover tint like the one your menus use is usually right (`searchInput: { options: { activeColor: 'tertiary-surface' } }`, and likewise `tagInput`/`timeInput`/`combobox`). The base theme carries the default explicitly so the option is discoverable in each component's Theme options table.

  The four popups now share one style source, the exported `listboxPopupStyles(theme, options, { maxHeight? })` helper (`UniListboxPopupOptions`), so their surface trio and highlight can no longer drift apart. Rendering is unchanged under existing themes; the active row's text color now derives from `listColor`'s on-pair rather than assuming `on-primary-surface`.

- [`6f87212`](https://github.com/uni-design-system/uni/commit/6f87212da2ed421a8a4f2e57047ebcba485c0fd3) Thanks [@gaenglish](https://github.com/gaenglish)! - Popover v2, `uni-callout`, and `uni-tour` — the coach-mark family from the popover prototype, plus shared overlay primitives in the cdk.

  **`uni-popover` v2 (upgrade in place).** Everything v1 shipped keeps its exact behavior (`placement`, `autoClose`, the three methods — `togglePopover`'s event is now optional — and both slots), and the chrome now resolves from a real `popover` theme entry whose defaults match the old hardcoded look. New: a two-way `open` model; `mode="tooltip"` (hover/focus timers, `role="tooltip"` + `aria-describedby`, WCAG 1.4.13 hoverable/dismissable, dev warning on focusable content — `uni-tooltip` remains for the wrap-content case); a detached `anchor` input (element or id, resolved at open) so the panel can hug a field while the trigger keeps the disclosure ARIA — and with no trigger content, no element claims `aria-expanded` it doesn't deserve; structured anatomy (`header` + `closable` ✕, `[popover-header]`/`[popover-footer]` slots that collapse when empty); `arrow`, `maxWidth` (theme default `38ch` — the one visible change for long unwrapped content; set the theme's `maxWidth: 'none'` to opt out), `openDelay`/`closeDelay`, and `opened`/`closed` outputs. Focus follows the APG disclosure pattern: stays on the trigger unless the panel marks `[autofocus]`, returns on close.

  **`uni-callout` (new).** An anchored coach mark that dims the page and cuts a spotlight hole around its target. Every scrim piece is CSS-anchor-positioned, so the hole tracks scroll/resize/layout with zero listeners, and the spotlit element stays genuinely clickable through it (`targetInteractive=false` covers it instead). Non-modal `role="dialog"` with the "duet" focus loop — Tab cycles the panel's controls plus the interactive target — and focus restore that respects a user who moved into the target. `backdrop: 'spotlight' | 'dim' | 'none'`, `dismissible`, `dismissOnBackdrop` (otherwise backdrop clicks pulse the panel), and a `dismissed` output with `reason` (`close-button`/`escape`/`backdrop`/`programmatic`) plus `key` — the storage-free "don't show again" hooks. Retargets in place when `target` changes while open, which is what the tour rides.

  **`uni-tour` (new).** A thin sequencer over one callout: `steps` with per-step placement/backdrop/interactivity, a two-way deep-linkable `active` model, Back/Next/Done with dots-or-fraction progress, and `advanceOn` interaction gates — clicks auto-advance, anything else unlocks Next and announces it through one polite live region. Missing-target steps are skipped in the direction of travel with a dev warning. Escape/✕ (named by `skipLabel`) skip and report the step.

  **cdk.** New `overlay` module (`TRANSFORM_ORIGINS`, `setAnchorName`/`clearAnchorName`, `resolveElement` — `''` is unset, `isToggleOpen`, `discreteOverlayTransition`, `restoreOverlayFocus`, `focusableElements`) extracted from the dropdown's plumbing (dropdown's public API unchanged); `spotlightStyles(anchor, { pad, ringWidth, scrimColor })` beside `anchorStyles`, returning the window/strips/cover pieces as pure `calc(anchor(...))` style objects.

  **Arrow fix.** `anchorArrowStyles` now clips the rotated-square arrow to its outer half with a per-placement `clip-path` cut exactly on the panel-edge diagonal: the two border strokes previously ran the full square and visibly cut into the panel surface; they now terminate precisely at the panel edge, and the panel's own border line — which sits just outside that edge — falls inside the kept half, so the arrow background covers it and the base reads as an opening in the border. Tooltip, popover, and callout inherit the fix with no call-site changes.

## 8.2.0

### Minor Changes

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - Input options: `typeFace` → `typeface`, matching the tooltip/button/tabs casing. The base theme now writes `typeface`, and the input box reads the new key with the old one as a deprecated fallback, so themes that still set `typeFace` render unchanged. The `typeFace` key is deprecated and will be removed in the next major.

- [`96113ee`](https://github.com/uni-design-system/uni/commit/96113eecc54f6d9a7dcf4d97264a4ee4f4367410) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-select`: `compareWith` input for object values.

  The select matched `value` against option values with `===`, so an object value that was structurally but not referentially equal — a saved record matched against options from a fresh fetch — never matched, and the native select silently rendered the first option (or the placeholder) instead of the preselection. The new `compareWith` input, called as `compareWith(optionValue, value)` and defaulting to reference equality, lets object-valued selects pass a key comparison like `(a, b) => a?.id === b?.id`. Primitive values were and remain unaffected.

### Patch Changes

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-notification-badge`: a theme that omits the `offset` option no longer breaks badge positioning — the position values serialized as the invalid length `'undefinedpx'` and the badge lost its corner placement. Missing `offset` now falls back to `0`.

- [`92e5d5e`](https://github.com/uni-design-system/uni/commit/92e5d5e88787bca796325313e2c07b4f7351afcb) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-calendar` / `uni-date-input`: a bound `''` now counts as "no value".

  An empty string — the only typeable empty for a string-typed model, and the natural "no value yet" in consumer code — slipped past the month path's nullish (`??`) guards into the grid math: `viewMonth` became `''`, the month heading threw `RangeError: Invalid time value` from `Intl.format` on every change-detection pass, and the grid rendered zero weeks. This hit on first render (the popup content projects eagerly), not just on open. The guards are now falsy, matching how `displayText`, `splitDateTime`, and the rest of the datetime path already treat `''`, so a calendar or date-input bound to `''` renders the current month exactly like `undefined`. `uni-time-input` and `uni-date-time-input` were already safe. Consumers no longer need to normalize `''` to `undefined` before binding — and note the `value` models were always typed `UniDate | undefined`, so no `$any()` cast is needed for a `string | undefined` draft signal.

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.

- [`96113ee`](https://github.com/uni-design-system/uni/commit/96113eecc54f6d9a7dcf4d97264a4ee4f4367410) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-menu`, `uni-multi-select`, `uni-data-table`: stop tracking loop collections by identity (NG0956).

  `uni-menu` items, `uni-multi-select` options, and `uni-data-table` records tracked by object identity, so a consumer rebuilding the array each change-detection pass — the natural way to write `[menuItems]="[...]"` or re-fetch table rows — recreated every DOM node and tripped NG0956. They now track by `$index` (none of these collections carries a stable key: menu items may be templates or dividers, option values may be objects, records are arbitrary), and data-table columns track by their unique `columnDef`. Consumers no longer need to memoize a stable array; DOM nodes — including a focused menu item — survive a rebuild.

## 8.1.0

### Minor Changes

- [`71bc74c`](https://github.com/uni-design-system/uni/commit/71bc74c0441d4170dc38312967610eac46788326) Thanks [@gaenglish](https://github.com/gaenglish)! - Calendar, date & time entry: `uni-calendar`, `uni-date-input`, `uni-time-input` and `uni-date-time-input`, plus a pure datetime helper layer in the cdk.

  The most-requested form control family anywhere, built native-platform-first with zero runtime dependencies: `Intl` does all formatting and parsing (no date library), the popup rides the native popover top layer with CSS anchor positioning, and every day in the grid is a real `<button>`.
  - **Values are plain ISO strings, never `Date`s** — `UniDate` (`'YYYY-MM-DD'`), `UniTime` (`'HH:mm'`, always 24-hour), `UniDateTime` (`'YYYY-MM-DDTHH:mm'`), `UniDateRange` (`{ start, end }`). A `Date` is a timestamp with a timezone problem; a calendar date is a label on a wall calendar. Strings are timezone-free, JSON-serializable and sortable with `<`, and `[value]="'2026-08-20'"` is a complete, correct binding.
  - **`uni-calendar`** is an inline month grid and a form control in its own right: single and range modes in one component (the value shape switches with `mode`), availability **markers** with screen-reader labels, `minDate`/`maxDate` fences, `disabledDates` as a list or predicate, and a two-way `month` model so an app can drive "jump to June". One tab stop with a roving-tabindex `role="grid"`; the full APG keyboard map (arrows, week `Home`/`End`, `PageUp`/`PageDown` with `Shift` for years) crosses month edges, skips disabled days directionally, and stops at fences without wrapping. Range selection paints a live preview band, swaps a backwards commit instead of erroring, and narrates every step through a `role="status"` region.
  - **`uni-date-input`** is free-typed date entry — no input mask (masks fight paste, IMEs and screen-reader echo). The parser accepts ISO, locale-numeric text with the digit order read from `Intl.DateTimeFormat(locale).formatToParts()`, and the locale's own month names; a missing year resolves to the next occurrence and two-digit years are refused rather than guessed. Unreadable, fenced or unavailable text **stays in the field**, flagged, with a `rejected` event. The popup is the same `uni-calendar`, hosted in a `role="dialog"` popover via the shared `uni-dropdown`; `↑`/`↓` on a committed value step ±1 day.
  - **`uni-time-input`** is a combobox over time slots — byte-for-byte the search-input/tag-input listbox contract via the CDK's `ListboxNavigation`. `9` → 09:00, `930` → 09:30, `3p` → 15:00, and a bare `3` leans PM in a 12-hour field (the bias yields when `minTime`/`maxTime` say otherwise). `slots` pins the choices for scheduling, refusing a typed `5pm` as `'unavailable'`; `↑`/`↓` on a committed value step ±`minuteStep`.
  - **`uni-date-time-input`** seats both parts in one `uni-input-box` chrome under one `role="group"` label, emitting one combined value only when both parts are set. `slotsFor` is the scheduling flow in one attribute: the time part stays disabled until a day is chosen, then offers exactly that day's slots, and changing the day clears a slot that no longer exists. The parts gained an `embedded` input so the composer renders one shared box instead of nested chrome.
  - **cdk `datetime` module** (public export): the string-math and `Intl` layer — `addDays`/`addMonths`/`buildMonthGrid`/`parseDateText`/`parseTimeText`/`timeSlots`/`localeWeekStart` and friends — pure functions, unit-tested hard, usable by apps directly.
  - **uni-core**: `'calendar'`, `'dateInput'`, `'timeInput'`, `'dateTimeInput'` join `ComponentName` with base-theme entries (day geometry per size token, `dayBorderRadius: 'xxs'` for the square look, toggle glyphs, popup/list chrome). Selection, range and today colours are deliberately not options — they are the `primary` role pair, so themes restyle them by restyling the palette.
  - **Naming note:** the fences are `minDate`/`maxDate`/`minTime`/`maxTime`/`minDateTime`/`maxDateTime` rather than the platform's `min`/`max`, because Signal Forms' `FormUiControl` reserves `min`/`max` as numeric signals on form controls.

- [`1a6b382`](https://github.com/uni-design-system/uni/commit/1a6b38273e5c6daaea6355e1ba8cf01d7e851100) Thanks [@gaenglish](https://github.com/gaenglish)! - Themable focus chrome: a shared `focusRing` primitive for every control, plus `focusBorder`/`focusShadow`/`focusColor` options for input boxes.

  **Shared focus ring.** A theme can now restyle the keyboard-focus indicator across the whole library by defining `focusRing` **border** and/or **shadow** primitives: `ThemeService.focusRing()` (and the new selector-less `focusRingStyle()`) replaces its default 2px outline with that border — drawn as an outline hugging the control — plus the ring shadow. A `focusRing` **thickness** primitive sets the ring's outline offset (negative values overlay the control's resting border, reading as a border-color change). Checkbox, radio, toggle and slider now route their hand-rolled focus styles through the shared helper (calendar days and tag chips already did), so one primitive trio gives every control the same focus language. Themes without the primitives render exactly as before.

  **uni-core:** `Thicknesses` is now an open record like `Borders`/`Shadows` (extra named primitives allowed), and `createTheme` accepts a sparse `thicknesses` override merged over the base scale.

  **Also in this release:**
  - Radio and toggle scope their transitions (border/background/transform) instead of `all`, so the focus ring's outline and shadow apply instantly — `transition: all` interpolated the outline from a stale color, flashing a dark ring before the themed ring color landed.
  - The radio's dot grow/retract animation is a token — `radio.options.transitionSpeed` (seconds, default 0.3 preserving the current feel; 0 switches instantly).
  - The checkbox focus ring rounds proportionally again (box radius plus its gap) and the gap itself is a new `checkbox.options.focusRingGap` option; a `focusRingStyle` call's explicit gap wins over the theme's `focusRing` thickness, then the branch defaults.

  The `input` component options could previously restyle focus only through `focusOutline`/`focusOutlineOffset`. The new optional trio mirrors the error-state trio (`errorBorder`/`errorShadow`/`errorColor`) and applies while any projected control has focus: `focusBorder` swaps the border primitive, `focusShadow` draws a ring (e.g. a soft `0 0 0 3px` spread), and `focusColor` swaps the background. All three default to `undefined`, so existing themes render exactly as before, and they yield to the error state so a flagged field stays visibly flagged while being corrected.

  The Wellsourced showcase theme now defines the `focusRing` pair for its app's `.search-input:focus` look — an ochre (`secondary`) 1px border with a 10% ring of the same hue, tinted per palette in light and dark — so text fields (which rest on a canvas tint and snap to the clean surface on focus), checkboxes, radios, toggles, sliders, calendar days and tag chips all share one focus treatment.

## 8.0.0

### Major Changes

- [`760b761`](https://github.com/uni-design-system/uni/commit/760b761ad77533e7e01f7a56731f74e470bbd948) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-tag` v2: themable, opt-in removal, two style axes

  v1 was a single hardcoded look with the palette welded into its template, an
  unconditional remove button, and no theme entry — a filter chip, a status pill
  and a recipient token all rendered identically. v2 makes the chip a real themed
  component and the building block `uni-tag-input` composes.

  **Breaking (uni-angular)**
  - **`(close)` is now `(removed)`.** The old name shadowed the native `close`
    event and needed an eslint suppression to compile.
  - **The remove button is opt-in** — set `[removable]="true"`. Previously every
    tag, including a plain category label, shipped a "Remove …" button into the
    accessibility tree.
  - Codemod: rename `(close)` → `(removed)` and add `[removable]="true"` wherever
    a `(close)` handler exists.

  **Fixed**
  - **A falsy value can now be removed.** `handleClose` guarded with `if (v)`, so
    a tag keyed `''` or `0` silently could not be dismissed. Every defined value
    emits, and a tag with no value emits `undefined`.
  - The remove control now sizes from the chip instead of the icon-button's own
    `sm` size — it was 22px inside a 24px chip, and taller than an `sm` chip
    entirely.

  **New**
  - **Two orthogonal style axes**: `variant` picks the colour role, `tone` picks
    the archetype (`soft` / `solid` / `outline`). Both resolve from the new `tag`
    theme entry, with tones as nested `&.tone-*` selectors inside each variant so
    a theme author restyles both axes in one place.
  - **`'tag'` joins core's `ComponentName`**, with a `TagTone` type and a full
    theme entry (`options` for radius/typeface/gap/symbols, `variants` per colour
    role, `sizes` carrying geometry only).
  - **`interactive`** turns the chip body into a `<button>` with `selected` mapped
    to `aria-pressed`, keeping the remove control a sibling — nesting them would
    be invalid HTML and would strand the inner control for keyboard users.
  - **Lead slot**: `avatarSrc`, `avatarName` (initials fallback), `iconName`,
    `symbolName` and `dot` convenience inputs, plus a `[tag-lead]` slot for
    anything richer. Lead elements size from the chip height, and all are
    `aria-hidden` so the chip's text stays its accessible name.
  - **Glyphs are theme icon primitives, not Material ligatures.** The remove and
    selected affordances resolve through the new `removeIcon` / `selectedIcon`
    theme options (defaulting to the built-in `close` and `check`), so they mask
    `currentColor`, recolour with the chip's tone, and can be swapped per theme.
    They also contribute no text to the DOM, which a ligature does — one less way
    for an accessible name to be polluted. `symbolName` remains as the escape
    hatch for glyphs the theme's icon set doesn't carry.
  - **`invalid`** sets `aria-invalid` and a dashed underline, so the state does
    not rely on colour alone (WCAG 1.4.1); `disabled`, `maxWidth` truncation with
    a `title`, and `removeLabel` for overriding the remove button's name.
  - The component ships with 21 specs, having previously had none.

- [`6a4c7da`](https://github.com/uni-design-system/uni/commit/6a4c7da4c7c3f5758d8c66d1be714319c983e39e) Thanks [@gaenglish](https://github.com/gaenglish)! - `ThemeService`: validated writes, runtime theme registration, live options

  The theme registry was bootstrap-frozen and nothing validated theme writes —
  and a brand theme applied via `applyPalette` never appeared in
  `uni-theme-switch`, leaving the select on a bogus value with no way back.

  **Breaking**
  - `ThemeService.theme` is now a **readonly signal**. Direct `theme.set(...)`
    calls (already discouraged in the docs) must move to `setTheme(input)`,
    which validates and returns `ThemeParseResult` — acceptance or the complete
    list of rejection reasons — leaving the active theme untouched on rejection.
  - `selectTheme(name)` now returns `boolean` and, for an unknown name, **does
    nothing** — previously it silently kept the old theme while still recording
    the bad key in `selectedThemeKey` and localStorage.
  - `themeOptions` is now a `computed` (was a once-written writable signal).

  **New**
  - **`registerTheme(input, { select? })`** validates and adds a theme to the
    live registry — it appears in `themeOptions`/`uni-theme-switch` immediately.
    **`unregisterTheme(id)`** removes it, falling back to the first remaining
    theme when it was active. Themes injected via `UNI_THEMES` are validated at
    startup; malformed entries are excluded with a console warning listing every
    reason.
  - **`applyPalette` registers the generated theme under `CustomTheme`**, so
    "Your Brand" is an ordinary, selectable option: it shows in the switcher,
    survives switching away and back, and `clearCustomPalette` unregisters it.
  - **`uni-select` fix:** a selection pointing at an option added in the same
    change-detection pass now applies (per-option `[selected]` binding; the
    select-level `[value]` write landed before new options existed and was
    ignored by the browser) — any consumer with a growing options list was
    affected.

### Minor Changes

- [`970c36d`](https://github.com/uni-design-system/uni/commit/970c36d3d2f57e3cc2ad18fc1b5498eb382c45d4) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-multi-select-dropdown`: a real accessible name, keyboard navigation, debounced filtering — and its first specs

  This was the weakest component in the library on exactly the axes the roadmap's
  combobox item names, and it had **no spec file at all**, which is why the
  missing accessible name survived since it was written.
  - **New `label` input, and the trigger finally names the field.** Its
    accessible name now reads "Fruits, 2 selected, Apple, Cherry". Previously it
    announced only the current selection — a screen reader user heard
    "Option 1, Option 3" with no way to tell which field it belonged to. The
    selection count comes along, so "how many did I pick" is not left to counting
    commas.
  - **Arrow keys, Home and End walk the options** from anywhere in the panel,
    including the filter box. Reaching the last of thirty options previously
    meant thirty `Tab` presses. Wrapping and the index arithmetic come from the
    CDK's shared `ListboxNavigation`, so the keys behave exactly as they do in
    `uni-search-input` and `uni-tag-input`.
  - **The filter is debounced** (new `debounceTime`, default 200ms) instead of
    re-filtering on every keystroke — the open item in TODO.md.
  - **An empty filter result says so** through `role="status"`, rather than
    leaving the panel blank.
  - **The options are grouped** as a `role="group"` labelled from `label`.
  - **20 specs**, covering the accessible name, selection and toggling, disabled
    behaviour, filtering and debounce, keyboard navigation, and the form-control
    contract.

  **A deliberate non-change:** the options stay real checkboxes rather than
  becoming a multi-selectable `listbox`. APG notes that multi-select listboxes are
  handled inconsistently across screen readers and suggests a checkbox group
  instead, and real checkboxes keep each option's state announced natively — so
  converting would have traded a well-supported pattern for a fashionable one,
  and duplicated the checkbox's animated visual into this component where it
  would drift.

- [`de83fe4`](https://github.com/uni-design-system/uni/commit/de83fe497a2f48569a7c49eea2e7ca640d931254) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-tag-input`, plus a shared listbox contract in the CDK

  The type-to-add chip field — recipients, filters, labels. It is the **open-set**
  control: anything typed can become a token, whether or not it matches a
  suggestion. Closed-set picking stays with `uni-select` /
  `uni-multi-select-dropdown`, which is the deliberate split — the two look alike
  but differ on the one thing that decides the value type, so a single component
  would force one of them to carry an API it can never use.
  - **`FormValueControl<UniTagItem[]>`.** `{ value: 'a@b.com' }` is a complete
    item; `label`, `avatarSrc`, `invalid` and `disabled` are optional enrichment.
  - **Invalid entries stay in the value, flagged**, rather than being dropped — a
    field that silently swallows a typo'd address is worse than one that shows it
    in red, and Enter on the chip lifts it back into the input to fix. Duplicates
    and over-`max` entries are refused through `(rejected)` with a reason.
  - **Full keyboard contract**: separators commit, Tab commits without trapping,
    Backspace on an empty field _focuses_ the last chip rather than deleting it
    blind, and on a chip Backspace and Delete both remove but move focus in
    opposite directions — what makes pruning a list feel right.
  - **The whole field is one tab stop.** Chips carry `tabindex="-1"`, so Tab never
    walks through eight recipients to reach the next control.
  - **Announces through a `role="status"` live region** on every add, remove and
    rejection; the removal route is described once per field rather than by every
    chip.
  - **`preset="email"`** wires an address validator, a paste parser that unwraps
    `Name <a@b.com>` and keeps an unterminated tail in the field, and Space as a
    separator.
  - **`'tagInput'` joins core's `ComponentName`** with a theme entry for the chip
    field's own tokens. Field chrome is not duplicated — it comes from `input` via
    `uni-input-box`, so a tag input restyles with every other field.

  **Also in this release**
  - **`ListboxNavigation` in the CDK** (`createListboxNavigation`) owns the
    combobox bookkeeping every type-ahead control needs: open state, active
    option, wrap-around arithmetic, Home/End, and `aria-activedescendant` wiring
    that can never point at an option a narrowing filter has removed.
    `uni-search-input` now uses it — behaviour unchanged, and it gains Home/End
    for free — and the multi-select combobox upgrade will too. Three hand-rolled
    copies of one keyboard contract is how they drift.
  - **`uni-tag` gains `controlTabIndex`**, so a composite that owns its own roving
    focus can take its chips out of the tab order, and **`selected` is now
    optional**: an interactive chip carries `aria-pressed` only when it is
    genuinely a toggle. Announcing "not pressed" on a recipient chip is worse than
    announcing nothing.

- [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062) Thanks [@gaenglish](https://github.com/gaenglish)! - Themes registered from JSON get the built-in icons back

  `registerTheme` and `setTheme` now hydrate a theme's icons on the way in: the
  built-in set is merged _under_ whatever icons the payload carries, so the
  theme's own icons still win.

  This is what makes a theme fetched as JSON usable. Transports elide `BaseIcons`
  — roughly 71% of a serialized theme, and bytes the consumer already ships — so
  without hydration a fetched theme would validate cleanly and then render no
  icons at all. The rule is the same one `createTheme` already applies at
  construction (`{...BaseIcons, ...icons}`), so a theme behaves identically
  whether it was built in-process or arrived over the wire.

  Themes provided through `UNI_THEMES` are unaffected: they already carry the full
  set, so hydration is a no-op.

### Patch Changes

- [`3279186`](https://github.com/uni-design-system/uni/commit/3279186e2cee806056cfb446699ab108d30fb608) Thanks [@gaenglish](https://github.com/gaenglish)! - Menu items no longer look preselected when opened with the mouse

  Opening a `uni-menu` by click left the first item highlighted before the
  pointer had touched it, reading as a preselected default. Two correct
  behaviours combined badly: `onOpened()` implements ARIA roving focus by calling
  `.focus()` on an item every open, and the item styles deliberately painted
  `:focus` the same as `:hover`. Nothing was wrong with the focus itself — only
  with painting it after a pointer open.
  - **The highlight now keys on `:focus-visible`.** Programmatic focus following a
    click doesn't match it, while keyboard-driven focus does — so mouse users get
    no phantom highlight, and keyboard users keep the focus cursor. Roving-focus
    bookkeeping is untouched: a mouse open still moves focus to the first item, so
    screen readers announce it exactly as before.
  - **New `HOVER_OR_KEYBOARD_FOCUS` constant exported from uni-core**, holding
    that selector. Emotion merges styles by _exact selector text_, so a component's
    base rule and any theme variant restyling it have to agree character for
    character — a variant keyed `'&:hover, &:focus'` would both fail to override
    and reintroduce the phantom highlight. Naming the selector once removes the
    trap; the base theme's `menuItem.warn` tone and the Carbon/Wellsourced
    showcase themes now use it.

  Themes with their own `menuItem` variants should key the highlight with
  `HOVER_OR_KEYBOARD_FOCUS`. Note that `:focus-visible` is a browser heuristic:
  after a user has been navigating by keyboard, a subsequent click may still show
  the highlight, which is the intended "this person is using the keyboard"
  behaviour rather than a regression.

- Updated dependencies [[`3279186`](https://github.com/uni-design-system/uni/commit/3279186e2cee806056cfb446699ab108d30fb608), [`de83fe4`](https://github.com/uni-design-system/uni/commit/de83fe497a2f48569a7c49eea2e7ca640d931254), [`760b761`](https://github.com/uni-design-system/uni/commit/760b761ad77533e7e01f7a56731f74e470bbd948), [`6a4c7da`](https://github.com/uni-design-system/uni/commit/6a4c7da4c7c3f5758d8c66d1be714319c983e39e), [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062)]:
  - @uni-design-system/uni-core@8.0.0

## 7.3.0

### Minor Changes

- [`c828982`](https://github.com/uni-design-system/uni/commit/c828982442e5bdc1d6884551160bbceac8ecf8f7) Thanks [@gaenglish](https://github.com/gaenglish)! - `expand` gains a themable, size-aware speed

  The reveal/collapse duration was hardcoded at 350ms, so a consumer wanting a
  snappier disclosure — or wanting adjacent styling to fade on the same clock —
  had nothing to reference. A fixed duration also reads differently at different
  sizes: sluggish on a two-line region, rushed on a full-page one.
  - **New `transitionSpeed` option in the `expand` theme options** (seconds,
    default `0.35`, matching alert/card `transitionSpeed`) sets the base
    duration. `'expand'` joins core's `ComponentName` union, so custom and
    derived themes can type an `expand` entry.
  - **Duration scales with content height.** The actual duration is
    `transitionSpeed × √(height ÷ 240px)`, clamped to ~0.15–0.6s at the default
    speed (the envelope scales proportionally with a themed speed), so perceived
    speed stays steady across region sizes. The curve and its constants
    (`expandDuration`, `EXPAND_DEFAULT_SPEED`, `EXPAND_MIN_DURATION`,
    `EXPAND_MAX_DURATION`, `EXPAND_REFERENCE_HEIGHT`) are exported from
    uni-core.
  - **New per-instance `transitionSpeed` input** sets an exact duration for one
    region, bypassing the scaling: `<uni-expand [transitionSpeed]="0.15">`.
  - **The resolved duration is exposed as the public `duration` signal** on
    `uni-expand`, so adjacent styling can move on the reveal's clock with a
    plain binding — `[style.transition-duration]="expand.duration() + 's'"` —
    keeping all timing in the theme/signal pipeline, with no custom CSS.
  - **`expand-toggle` gains a matching `transitionSpeed` input** and otherwise
    follows the theme token instead of its own hardcoded 350ms. Expand Area
    binds the region's resolved `duration` to its toggle, keeping chevron and
    reveal on one clock even when size-scaled or overridden.
  - **Speed is theme-reactive**: swapping themes at runtime retimes regions and
    chevrons live.
  - **Enter/leave easing is now `ease-in-out`** (was `ease-in`), matching the
    chevron rotation so trigger and region decelerate together.
  - **`UniExpandOptions` is exported** from uni-angular for
    `getComponentOptions<UniExpandOptions>('expand')` consumers.

- [`6e8b429`](https://github.com/uni-design-system/uni/commit/6e8b4297190ce6974114d7fc6c52e37866902633) Thanks [@gaenglish](https://github.com/gaenglish)! - Menus join the theme model: `menu` + `menuItem` component options, item tones, and dividers

  The menu was the only composite component with no theme surface of its own —
  panel chrome came from the shared `dropdown` entry and every item-level knob
  (height 38, `primary-container` hover, `check` active symbol, `label` type
  role) was hardcoded. Every Uni menu therefore looked identical, and the gaps a
  real product hits first (a red Delete, a separator before it, disabled rows)
  were only reachable via `::ng-deep`.
  - **New `menu` theme options** (`'menu'` joins core's `ComponentName` union):
    `minWidth`, panel `color`/`border`/`borderRadius`/`shadow` (each falling
    back to the `dropdown` options when unset, so menus follow generic popovers
    until a theme deliberately splits them), `paddingVertical`/
    `paddingHorizontal` (panel inset — `xs` inset plus item `borderRadius`
    yields the "hover pill" look; `none` yields full-bleed rows), and
    `dividerBorder`/`dividerSpacing` for separators.
  - **New `menuItem` theme options + variants** (`'menuItem'` joins
    `ComponentName`): `height`, `paddingHorizontal`, `gap`, `borderRadius`,
    `typeface`, `textColor`, `hoverColor`, `activeSymbol` (undefined removes the
    trailing check), and `transitionSpeed`. Theme `variants` on `menuItem` carry
    tones — the base theme ships a `warn` tone for destructive actions.
  - **`MenuItem` grows `variant`, `disabled`, and `{ divider: true }`.**
    `variant: 'warn'` routes through the theme's `menuItem` variants; `disabled`
    items render in the disabled color, carry `aria-disabled`, and are skipped
    by keyboard navigation; dividers render as `role="separator"` rules styled
    by the `menu` options. `isDivider` and the `UniMenuOptions`/
    `UniMenuItemOptions` interfaces are exported from uni-angular.
  - **`uni-dropdown` panel chrome is now input-overridable**
    (`border`/`borderRadius`/`shadow`/`color`), falling back to the `dropdown`
    theme options — this is the mechanism `uni-menu` uses; other consumers are
    unchanged.
  - **Default-rendering change:** menus now have `minWidth: 184` from the base
    theme (previously they sized to the widest item). All other defaults
    reproduce the previous look, including the 0.35s hover transition.
  - **The Carbon experiment themes gain menu styling** (sharp full-bleed 40px
    rows, IBM Plex, `$layer-hover`, red danger option, ~110ms motion) with a new
    Carbon Menu story demonstrating that the same component renders both
    aesthetics untouched.

### Patch Changes

- [`ba4e38d`](https://github.com/uni-design-system/uni/commit/ba4e38d88ad65bbba8badf2b42115acfd4d433e2) Thanks [@gaenglish](https://github.com/gaenglish)! - Tooltip no longer blinks after activating a wrapped control

  Clicking a button inside `uni-tooltip` used to fall through to the bubble's
  tap-to-toggle handler and then re-show on the still-hovering pointer — a
  state-flipping label ("Expand" → "Collapse") visibly blinked off and back on
  after the click.
  - **Activating an interactive element inside the host now hides the bubble
    and suppresses it** until the pointer leaves and returns (or focus moves
    away). Tap-to-toggle is unchanged for non-interactive hosts (inline text).
  - **`expand-toggle` drops its icon-only tooltip.** The rotating chevron plus
    `aria-expanded` and the button's accessible name already say everything the
    bubble restated; use the `label` input when a disclosure needs a visible
    name.

## 7.2.0

### Minor Changes

- [`8d77ed7`](https://github.com/uni-design-system/uni/commit/8d77ed75af1edf414baa7b9ea52a6982470b0c7c) Thanks [@gaenglish](https://github.com/gaenglish)! - Centre `icon-button`'s glyph, fix `expand-toggle`'s rotation, make `expand`
  block-level and motion-safe, and give `expand-toggle` a label

  Gaps found while building collapsible sections in a consuming app, where each
  one had to be worked around locally.
  - **`icon-button` centres its glyph.** Sizing `iconName` from the size token
    (shipped in the previous release) made the glyph smaller than the button —
    an `sm` button is a 22px box around an 18px icon — but the button was
    `display: block`, so the glyph sat in the top-left corner with all the slack
    on its right and bottom. It is now a centring flex box; flex is still
    block-level, so the button's own layout is unchanged, and the
    absolutely-positioned accessible-name span stays out of the flex flow.
    **Visual change** for every `icon-button`: glyphs shift to the middle of the
    box. `symbolName` ligatures centre too, which also means the known
    oversized-ligature case (a 24px glyph in a 22px `sm` box) now clips evenly on
    all sides instead of only bottom-right. Covered by a test.
  - **`expand-toggle` rotates the glyph instead of its host.** This is a fix to
    existing behaviour, visible in 7.1.0 and earlier: the 180° turn was applied to
    the component host, which is both the tooltip's positioning box (`uni-tooltip`
    sets `anchor-name` on its own element, nested inside the host) and taller than
    the glyph, since an inline-level box reserves baseline descender space. So the
    bubble bobbed along an arc as the chevron turned, and the chevron itself
    drifted off-centre rather than spinning in place. The transform now lands on
    `uni-icon` — a centred square sized to the glyph, and the only box here that
    rotates symmetrically. The host keeps its `toggled` attribute, so any consumer
    styling keyed on it still works.
  - **`uni-expand` is now `display: block`.** As a custom element it defaulted to
    `display: inline`, so its animated grid laid out as a block-in-inline box and
    the revealed content's spacing came out subtly wrong. Every consumer was
    writing `uni-expand { display: block }` by hand. **Visual change** for anyone
    who was relying on the inline default or already shipping that override — the
    override is now redundant and can be deleted.
  - **The reveal respects `prefers-reduced-motion`** (WCAG 2.3.3). The
    expand/collapse keyframes ran unconditionally; they're now wrapped in
    `motionSafe`, as is `expand-toggle`'s chevron rotation. Under reduced motion
    the region appears and disappears instantly. `overflow: hidden` moved inside
    the guard deliberately: it exists to clip the box mid-animation, and leaving
    it applied at rest would crop decorations that legitimately paint outside the
    region (focus rings, offset outlines). Angular removes a leaving node on the
    next frame when it detects no animation, so nothing hangs.
  - **`expand-toggle` takes `label` and `sublabel`.** It was chevron-only, so any
    disclosure that names its section — most of them — had to hand-roll the whole
    trigger row and its styles, which is how consumers end up with a private
    copy of this component. With `label` set the toggle renders a full-width row
    (chevron, label, muted qualifier) as a single button whose accessible name is
    the label, instead of an icon button sitting next to unrelated text. Only the
    chevron rotates, so the label stays upright. Omit `label` and the icon-only
    shape is unchanged, tooltip and all — `uni-expand-area` is unaffected.

- [`c532c95`](https://github.com/uni-design-system/uni/commit/c532c95d4a7adbf7c4015b8b556e3994c70948ed) Thanks [@gaenglish](https://github.com/gaenglish)! - Size `icon-button`'s `iconName` glyph from its size token

  `icon-button` rendered a `symbolName` ligature at a font size, but an `iconName`
  mask with no size at all — and the base `iconButton` size tokens carry no
  padding, so the icon filled the entire button box edge to edge. That made
  `symbolName` → `iconName` a visual regression rather than a like-for-like swap,
  which matters now that `uni-icon` is the preferred path (a mask paints on the
  first frame, where a ligature waits on the variable font).
  - `iconName` is now sized from the size token's `fontSize` — the same value that
    scales the rest of the control — so the glyph sits inside the button and grows
    with `size`. Concretely, `size="sm"` renders an 18px glyph in a 22px button
    instead of a 22px one.
  - **Visual change** for existing `iconName` call sites: glyphs get slightly
    smaller and gain breathing room. Themes that size icon-buttons with padding
    (e.g. the Carbon example) set a matching `fontSize`, so they land on the same
    glyph size either way and are unaffected.
  - Known gap, now covered by a test that documents rather than blesses it:
    `uni-symbol` takes its size from `opticalSize` (default 24) and ignores the
    button's size token, so a `sm` button renders a 24px ligature in a 22px box.
    Masked icons do not have that problem — one more reason to prefer `iconName`.

### Patch Changes

- [`c532c95`](https://github.com/uni-design-system/uni/commit/c532c95d4a7adbf7c4015b8b556e3994c70948ed) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `uni-icon` ignoring `size="24"` written as a static attribute

  `size` appended `px` only to numbers, but a static template attribute arrives as
  a string — so `<uni-icon name="mail" size="24" />` emitted the invalid
  `width: 24`. Browsers drop an invalid declaration, which silently fell back to
  the stylesheet's `width: 100%; height: 100%`.

  That failed in two different ways depending on the container, neither of them
  obvious: inside a fixed box the icon quietly filled it (a 16px glyph rendering
  at 30px), and inside a content-sized flex row `height: 100%` collapsed to zero,
  so the icon vanished while still occupying full width and pushing its label
  across the row.

  A bare numeric string is now treated as px, matching the number form. Genuine
  CSS lengths (`'1.25rem'`, `'50%'`, `calc(…)`) still pass through untouched.
  `[size]="24"` was unaffected throughout, since property binding passes a real
  number.

## 7.1.0

### Minor Changes

- [`c2421c0`](https://github.com/uni-design-system/uni/commit/c2421c04d01f36d74b489613d22997553f256d4f) Thanks [@gaenglish](https://github.com/gaenglish)! - Expand `BaseIcons` to 59 icons and add `uni-icon` sizing

  The 34-icon set shipped in 7.0.0 covered the library's own components but not a
  real application — an app migrating off inline `<svg>` (or off `uni-symbol`, in
  Angular) ran out of names almost immediately. Everything here is additive; all
  34 existing names are unchanged.
  - **25 new icons**, same Material Symbols Outlined 300 source and the same
    `0 -960 960 960` grid as the rest of the set: navigation (`link`, `expand`,
    `gridView`, `listView`), actions (`moreHorizontal`, `copy`, `send`,
    `refresh`, `dragHandle`, `qrCode`), feedback (`star`, `verified`) and
    user/system (`group`, `shieldPerson`, `clock`, `mail`, `chat`, `image`,
    `document`, `payment`, `bank`, `trendingUp`, `extension`, `webhook`,
    `logout`).
    - `moreHorizontal` ships alongside `more` because that one is `more_vert` and
      row-aligned menus need the horizontal kebab.
    - `star` is separate from `favorite`, which is the heart.
  - **`uni-icon` gains an optional `size` input** (`CssLength` — bare numbers are
    px, strings pass through, so `20` and `'1.25rem'` both work). Left unset,
    behaviour is unchanged: the icon fills its container, which is what lets a
    themed control size its own glyph through padding. Set, it applies
    width/height as inline styles, so an explicit size wins over the
    fill-the-container rule regardless of style injection order. This removes the
    per-call-site `width`/`height` CSS rule that replacing an inline `<svg>` with
    `<uni-icon>` would otherwise need.
  - The MCP `create-icon-tokens` tool now lists the built-in icon names above the
    token map it returns. Apps routinely hand-draw their own `close`, `check` or
    `plus`; encoding those into theme tokens works but adds redundant artwork on a
    foreign grid when the theme already ships the glyph. The tool cannot recognise
    a shape, so it hands the caller the list to check against before adding
    anything.

## 7.0.0

### Minor Changes

- [`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7) Thanks [@gaenglish](https://github.com/gaenglish)! - Replace `BaseIcons` with a normalized 34-icon Material Symbols set

  The built-in icon set was 11 glyphs drawn from four different grids
  (`0 0 24 24`, `0 0 50 50`, `0 0 64 64`, `0 -960 960 960`), so `checkCircle` and
  `xCircle` rendered as solid filled discs next to a hairline `alertCircle` and an
  oversized `close` — three optical weights in one set.
  - `BaseIcons` is now Material Symbols Outlined at weight 300, every glyph on a
    single `0 -960 960 960` grid, grouped by intent: navigation (`menu`,
    `chevronUp/Down/Left/Right`, `arrowLeft/Right`, `home`, `externalLink`),
    actions (`search`, `close`, `plus`, `minus`, `more`, `delete`, `edit`,
    `download`, `upload`, `share`, `filter`), feedback (`check`, `checkCircle`,
    `xCircle`, `alertCircle`, `info`, `warning`, `lock`) and user/system
    (`profile`, `settings`, `notification`, `favorite`, `help`, `calendar`).
  - All 11 previously shipped names are preserved, so existing `<uni-icon>` call
    sites and theme overrides keep working. Their **appearance changes**: the
    filled `checkCircle`/`xCircle` are now outlined, and the set reads lighter
    overall. `spinner` is carried over verbatim, keyframes intact.
  - New `IconName` and `BaseIconName` types. `IconName` is
    `BaseIconName | (string & {})`, so built-ins autocomplete and typos surface
    while themes can still register arbitrary names via `createTheme({ icons })`.
    `uni-icon`'s `name` input is typed with it instead of `keyof Icons`.
  - **Breaking**: removes the unused `IconToken`, `IconStyle`, `ToggleableIcon`
    and `IconConfig` exports. Nothing in the library referenced them and
    `IconToken`'s 60-name union contradicted the actual `BaseIcons` keys. Use
    `IconName` instead.
  - New exported `svgToIconUri(svg, options?)` — the supported way to bring your
    own icons (a brand set, a designer handoff) into a theme. It normalizes the
    source (drops the xml declaration, comments and fixed `width`/`height` so the
    mask scales), percent-encodes it, and **rejects artwork that cannot survive
    masking**: no `viewBox`, an embedded raster `<image>`, an external reference,
    a gradient/pattern fill, or more than one paint color. That last one is the
    trap worth naming — masks use the alpha channel, so a multi-color logo
    flattens to a silhouette in `currentColor`; pass `{ allowMultiColor: true }`
    when that is intended. `createTheme({ icons })` merges the result over
    `BaseIcons` per name, so a built-in name reskins and a new name is added.
  - New MCP tool `create-icon-tokens`, the agent-facing front end to
    `svgToIconUri`: hand it a project's inline `<svg>` (or a brand set) and it
    returns a paste-ready `icons` map for `uni-theme.ts`. It encodes via the same
    helper, so tokens are byte-identical to the built-in set, and adds the
    set-level checks a per-icon helper cannot make — which names override
    built-ins, and whether the artwork mixes viewBox grids. Bad artwork is
    reported per icon rather than failing the batch, and re-running is safe
    (already-encoded URIs pass through). The server instructions now point agents
    at it whenever they encounter inline SVG.
  - `BaseIcons` is generated by `scripts/generate-icons.mjs` (`pnpm icons:generate`),
    which fetches from the canonical Material Symbols source and validates every
    glyph before writing — a malformed path, an off-grid viewBox or geometry
    outside the grid aborts the run. `pnpm icons:check` verifies the committed
    file without writing. Add or change icons in that script's manifest and
    regenerate; the file is not hand-edited. `icon.records.spec.ts` asserts the
    same invariants against the committed output.

### Patch Changes

- Updated dependencies [[`f7727aa`](https://github.com/uni-design-system/uni/commit/f7727aa8895bd67f285ba4830858f994490bb7f7)]:
  - @uni-design-system/uni-core@7.0.0

## 6.1.0

## 6.0.1

### Patch Changes

- [`4bfb057`](https://github.com/uni-design-system/uni/commit/4bfb057c55651c0375e7f35dd6f804e8d5c69e88) Thanks [@gaenglish](https://github.com/gaenglish)! - Canonical MDX docs structure across the entire library
  - Component docs pages now follow one flow (spec in AGENTS.md): imports → Overview →
    Usage (the compact playground: story + source + knobs) → named variation examples →
    **Theme options** → Accessibility → Do/Don't. Property/API/Methods/Events tables are
    retired — the playground's controls are the API reference.
  - New `ThemeOptions` docs block renders a component's per-theme option tokens live from
    the active Storybook theme (with color swatches), distinguishing per-theme options
    from per-instance inputs; data-table's raw `ThemeDataBlock` dump is replaced.
  - All ~55 component pages conform: the 7 form-control pages (200–390 lines of legacy
    API tables) rewritten; empty Overviews authored (card, tag, icon-button, scroll-area,
    expand-area, data-table); accessibility bullets added across navigation, feedback,
    and form components.
  - The MCP index now carries when-to-use guidance for 55 of 70 components (was 41) and
    accessibility guidance for 36 (was 21) — the remainder are subcomponents documented
    on their parent pages and internal directives.

## 6.0.0

### Major Changes

- [`a02afee`](https://github.com/uni-design-system/uni/commit/a02afee3c1c4721ff626445684f41de432443731) Thanks [@gaenglish](https://github.com/gaenglish)! - Layout components are attribute-only, on any element

  **Breaking:** the shorthand element selectors `Box`, `Stack`, `Row`, `Grid`, `Wrap`,
  and `GridArea` are removed — a concept inherited from another library that conflicted
  with semantic HTML. Migrate to the attribute form: `<Box padding="md">` →
  `<div box-layout padding="md">` (GridArea → `grid-area-layout`).

  In exchange, the attribute selectors now apply to **any element**, not just `div` —
  layout and semantics compose: `<main box-layout [grow]="1" padding="md">`,
  `<nav stack-layout gap="sm">`, `<section stack-layout>`.

  Also documented, unchanged in behavior: the sizing convention (number = px via
  binding, `[height]="420"`; plain attribute = CSS length, `height="420px"`) and
  Stack/Row's `fit-content` min-size defaults (set `[minHeight]="0"` / `[minWidth]="0"`
  for scroll containment). All internal usages, stories, and docs are migrated —
  including the Divider story's `<Center>`, which had silently never rendered (Center
  never had an element selector).

- [`f1796fb`](https://github.com/uni-design-system/uni/commit/f1796fbb42015dafb3a122f6effe69bc2b07d525) Thanks [@gaenglish](https://github.com/gaenglish)! - Selector unification: one form per component

  **Breaking:** every PascalCase alias selector is removed (`Card`, `Menu`, `Symbol`,
  `Icon`, `Dialog`, `Button`, `Tabs`, `Snackbar`, `SelectInput`, `Confirmation`, … — a
  concept inherited from another library). Each component now has exactly one canonical
  form, chosen by what the component is:
  - **Widgets and content-renderers** keep their `uni-*` element: `<uni-card>`,
    `<uni-menu>`, `<uni-symbol>`, `<uni-icon>`, `<uni-tabs>`, `<uni-select>`,
    `<uni-confirmation-dialog>`, …
  - **Decorators of native elements** are attribute-only, and their `div`-locks are
    lifted: `[uni-badge]`, `[uni-dialog-header]` (e.g. on `<header>`),
    `[uni-dialog-buttons]`/`[dialog-buttons]` (e.g. on `<footer>`),
    `[uni-scroll-area]`/`[scroll-area]`, `[uni-menu-item]`/`[menu-item]` (e.g. on
    `<li>`).
  - **Host-locked selectors stay host-locked** where the native element carries the
    behavior: `dialog[uni-dialog]`, `button[uni-text-button]`/`button[text-button]`,
    `button[uni-icon-button]`/`button[icon-button]`.

  Migration is mechanical: `<Card>` → `<uni-card>`, `<Button …>` →
  `<button text-button …>`, `<Dialog …>` → `<dialog uni-dialog …>`, `<Badge …>` →
  `<div uni-badge …>`, `<ScrollArea …>` → `<div scroll-area …>`. All internal usages,
  stories, and docs are migrated; `llms.txt` and the MCP index reflect the canonical
  forms.

- [`a62e9b1`](https://github.com/uni-design-system/uni/commit/a62e9b116f0b57cf2a1e647155bc2fbc02b02b87) Thanks [@gaenglish](https://github.com/gaenglish)! - Text is attribute-only, with a value shorthand and element-aware defaults

  **Breaking:** the `uni-text` and `Text` element selectors are removed. Text is now the
  attribute `[uni-text]` on any element, keeping your HTML semantics:
  - **Value shorthand** — the attribute value is the typeface:
    `<h1 uni-text="display-small">`, `<span uni-text="caption">`, dynamic via
    `[uni-text]="role()"`. The explicit `typeface` input still works (the attribute
    value wins when both are set).
  - **Element-aware defaults** — with no value, the typeface is inferred from the host:
    `h1`→headline-large, `h2`→headline-medium, `h3`→headline-small, `h4`→title-large,
    `p`→body-1-long, `small`/`figcaption`→caption, `blockquote`→quote, `label`→label,
    else title-small. Plain semantic markup is correctly set with zero configuration.

  Migrate `<uni-text typeface="body-1-long">…</uni-text>` →
  `<p uni-text>…</p>` (or `<span uni-text="body-1-long">` where no semantic element
  fits). All internal usages, stories, and docs are migrated.

### Minor Changes

- [`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f) Thanks [@gaenglish](https://github.com/gaenglish)! - Search input stripped back and made generic; debounce input dressed in the shared chrome
  - **`uni-debounce-input`** now wears the themed input chrome via `uni-input-box`
    (color, border, typeface, focus ring) and gains `label` (accessible name),
    `placeholder`, `disabled`, `pre-input`/`post-input` attribute slots for adornments,
    ARIA passthroughs (`role`, `ariaExpanded`, `ariaControls`, `ariaActivedescendant`)
    for composite widgets, and `clear()`/`focus()` methods. Debounce behavior unchanged.
  - **`uni-search-input` redesigned**: the opinionated solid-primary pill bar with the
    embedded `title-large` label is gone. It's now a standard themed field — decorative
    leading magnifier, clear button while a query exists (refocusing on clear), Enter
    emits `search`, Escape closes/clears.
  - **Type-ahead added**: pass `suggestions` (refresh from `change`) and the field
    becomes an ARIA combobox — keyboard-navigable listbox (ArrowUp/Down, Enter selects,
    emitting `suggestionSelected` + `search`), `aria-activedescendant` wiring, focus-out
    closing. New `searchInput` theme options: `searchSymbol`, `clearSymbol`, suggestion
    list `listColor`/`listShadow`/`listBorderRadius`, `maxSuggestions`.
  - Visual breaking change for SearchInput consumers (deliberate strip-back); code API
    is compatible (`label`/`width`/`change`/`search` retained; `label` is now the
    accessible name + placeholder fallback rather than displayed text).

- [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316) Thanks [@gaenglish](https://github.com/gaenglish)! - Checkbox, radio, and toggle conform to theme tokens
  - The last hardcoded control colors (`#FFF`, `#ccc`, `#d0d0d0`, `#e0e0e0`,
    `rgba(0,0,0,0.2)`) are gone. Chrome now resolves from new option tokens —
    checkbox `boxColor: 'surface'`; radio `ringColor: 'outline'` / `fillColor:
'surface'` (radio gains a theme entry for the first time); toggle `trackColor:
'surface-variant'` / `knobColor: 'surface'` — so all three finally render
    correctly on dark and brand themes.
  - The checkbox's check/dash strokes wear the variant's paired on-color
    (`on-primary`, `on-warn`, …) instead of assuming white; disabled states use the
    `disabled`/`on-disabled` tokens; the toggle knob's shadow is the theme's
    brand-tinted `raised` stack, and its hover uses the button convention's
    brightness filter instead of a fixed grey.

- [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-stat` KPI tile
  - Muted label + large headline value (numbers auto-compact via
    `Intl.NumberFormat`: `48234` → "48.2K") set in a new `stat` type-scale role
    (32px semibold, proportional figures).
  - Optional signed `delta` whose ink is decided by direction × `upIsGood` — churn
    going down reads green, tickets going up reads red — with the arrow glyph
    accompanied by screen-reader "up"/"down" text so state never rides color alone;
    `caption` names the comparison period.
  - Optional decorative 12-point sparkline (`trend` input): stroke in the outline hue,
    endpoint dotted in the accent, `aria-hidden`.
  - Fully token-driven via `stat.options`: card-recipe frame (`color`/`border`/
    `borderRadius`), `labelTypeface`/`valueTypeface`, `positiveColor`/`negativeColor`
    (the semantic inks, AA-guaranteed on surface), `trendColor`/`trendAccent`, spacing.

- [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix invisible icons; icons become first-class theme primitives
  - **Bug**: `uni-icon` resolves icons from `theme.icons`, but every theme shipped
    `icons: {}` — the icon record was never wired in, so all icons (dialog close, button
    spinner, search/clear affordances) rendered nothing.
  - **Fix + pattern**: the default icon set now lives in core (`BaseIcons`, in
    `concepts/iconography`) and `createTheme` merges a theme's `icons` over it — themes
    can override or add icons under any name (inline SVG data URIs, masked with
    `currentColor` so they recolor with the theme). The angular `icons` record re-exports
    `BaseIcons` (deprecated).
  - `uni-icon` also sets the standard `mask-image` (was webkit-only, so icons were
    invisible in Firefox regardless) and renders nothing for unknown names instead of a
    broken `url("undefined")`.
  - The emitted `uni-theme.ts` gains an editable `icons` section, and the MCP's
    `generate-uni-theme` guidance instructs agents: never inline SVG in components —
    define an icon once in the theme's `icons` map and render it via `<uni-icon>`.

### Patch Changes

- Updated dependencies [[`5a6fc60`](https://github.com/uni-design-system/uni/commit/5a6fc601952e0cbda80810a1c9062588c675d89f), [`8953d59`](https://github.com/uni-design-system/uni/commit/8953d59aa5f5eed57801534c7cbf5ff05453c316), [`7a6da4f`](https://github.com/uni-design-system/uni/commit/7a6da4f60979795f10e85493d1d13543f6a5a0e1), [`fea0b2e`](https://github.com/uni-design-system/uni/commit/fea0b2e78da327f3acea144958af2d0dbbefb699)]:
  - @uni-design-system/uni-core@6.0.0

## 5.2.0

### Minor Changes

- [`1f5ee1d`](https://github.com/uni-design-system/uni/commit/1f5ee1dce290aceceec628677fdc9e36b5c5031f) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-avatar` and `uni-avatar-group` components
  - Graceful fallback chain: image → initials derived from `name` (first + last) →
    themed symbol. Accessible by default: `role="img"` + `aria-label` from the name,
    `aria-hidden` when purely decorative.
  - Fully token-driven: variants color from the role's `*-container` tokens, sizes from
    the theme's `avatar` size records, corner radius from `options.borderRadius`
    (`max` = circles; a `sharp` theme gets square avatars), initials typeface from
    `options.typeface`, fallback symbol from `options.fallbackSymbol`.
  - `uni-avatar-group` stacks avatars with a token-driven overlap (spacing token) and
    separator ring (`ringColor`/`ringWidth` options); `max` collapses the overflow into
    a themed "+N" chip that is itself a `uni-avatar` (verbatim `text` input).

- [`dca84b1`](https://github.com/uni-design-system/uni/commit/dca84b1f5a49d56608bac098c26b0e90992ed49d) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-breadcrumb` component
  - WAI-ARIA breadcrumb: labelled `nav` landmark wrapping an ordered list, the last item
    marked `aria-current="page"`, separators decorative (`aria-hidden`).
  - Data-driven `items` (root first). Items with `href` render as real anchors; without
    one they render as link-styled buttons emitting `itemClicked` for SPA routing.
  - Token-driven via `breadcrumb.options`: `typeface`, link `color`, `currentColor`,
    `separatorSymbol` (material symbol), and `gap` spacing.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Button corner rounding and typography conform to component-options tokens
  - `button` and `iconButton` themes gain `options: { borderRadius: 'max' }`; the hardcoded
    per-size pixel radii (11/13/18/24) and the icon button's inline `borderRadius: 999` are
    removed. Components resolve the token through `theme.radius()`, so the theme's radii
    scale — shape languages (`sharp` → square, `playful` → pill) and custom radii
    primitives — now restyles buttons like every other tokened component.
  - Back-compat: the options radius is applied before theme `sizes`/`fixed` styles, so
    hand-authored themes that still set a size-level `borderRadius` keep winning; icon
    buttons fall back to the legacy circle when a theme predates iconButton options.
  - `button` themes also gain `options: { typeface: 'button' }`: the hardcoded
    `fontFamily: 'Euphemia'` (a font no theme loads) is removed from `fixed` and the sizes;
    labels now render the type scale's `button` role (Red Hat Display, medium, capitalize),
    with per-size `fontSize` still applied by `sizes`. Point the token at any typography
    role — including custom ones — to restyle every button label.
  - New `UniButtonOptions` interface (`borderRadius`, `typeface`) exported from the button
    model.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Card frame conforms to token primitives
  - The card theme's hardcoded frame (`borderStyle`/`borderWidth`/`borderRadius: '8px'` in
    `fixed`, `borderColor` per variant) is replaced by tokens: the card resolves its border
    from the **border primitive named by its variant** (`borders.primary` …
    `borders.success`), its corner radius from the radii scale (`options.borderRadius:
'xs'` — same 8px by default), and an optional `options.elevation` shadow token.
  - `UniCardOptions` gains `border` (pin every card to one primitive — including a custom
    one — instead of variant-following) and documents the existing `borderRadius`/
    `elevation`; redefining a border primitive in a theme now restyles cards and every
    other component sharing that token.
  - Token styles apply under the merged theme style, so hand-authored themes that still
    set card `fixed`/`variants` frame styles keep winning. No visual change for default
    themes — this is pure tokenization.

- [`17cf662`](https://github.com/uni-design-system/uni/commit/17cf6621dd78e4af0c8af3575f6a5d103d9fca53) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-drawer` and `uni-app-bar` — the dashboard shell
  - **`uni-drawer`** has two modes sharing one content slot: `side` renders an in-flow
    `<aside>` that pushes content (width-animated open/close, divider border primitive at
    its edge, `aria-hidden` while closed); `over` renders a native `<dialog>` in the top
    layer — focus trap, Escape, and scrim backdrop come from the platform, sliding in
    from `position` (`start`/`end`). `open` is a two-way `model()`; Escape and backdrop
    clicks keep it in sync. Tokens: `drawer.options` (`color`, `width`, `divider`,
    `elevation`, `padding`, `backdrop`).
  - **`uni-app-bar`**: leading/trailing content projection slots around a `title` (or
    custom center content), trailing pushed to the far edge; optional `sticky`. Tokens:
    `appBar.options` (`color`, `height`, `divider`, `typeface`, `padding`, `gap`,
    optional `elevation`).
  - The Drawer "DashboardShell" story documents the composition recipe: app bar with a
    menu toggle + side drawer + content.

- [`7844dde`](https://github.com/uni-design-system/uni/commit/7844ddec88f40027dafcaed5192f88d3c0cec54f) Thanks [@gaenglish](https://github.com/gaenglish)! - Progress gauge derives from the palette instead of hardcoded pastels

  The gauge's track colors were fixed pastel hexes (`#b3d4ea`, `#b3e7c2`, …) that ignored
  the active theme entirely — secondary and success even shared the same green. Tracks now
  use the role's `*-container` token (the palette's soft tint of that role) and arcs the
  role base, so gauges follow any brand palette, in both light and dark modes.

- [`4ccf18b`](https://github.com/uni-design-system/uni/commit/4ccf18ba86dc81c344597c7bc3e46f5d92f3c232) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-skeleton` loading placeholder
  - Three shapes: `text` (multi-line, ending on a short line like real copy), `rect`,
    and `circle`; explicit `width`/`height` accept CSS strings or px numbers.
  - Painted with surface tokens (`skeleton.options`: `color`, `highlightColor`,
    `borderRadius`, `gap`) so placeholders sit naturally on light and dark themes; the
    shimmer sweep (`animation`/`duration` options) only runs when the user allows motion
    and degrades to static blocks under `prefers-reduced-motion`.
  - `aria-hidden` — placeholders are invisible to assistive tech by design.

- [`5d9062a`](https://github.com/uni-design-system/uni/commit/5d9062ac36f782f2ebbc7012367121b0b86baf9c) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-slider` component — clears the declared-but-unbuilt `ComponentName` entry
  - Native `<input type="range">` under the hood: platform keyboard interaction
    (arrows, Home/End, Page Up/Down) and ARIA slider semantics for free; Signal Forms
    contract (`FormValueControl<number>`) matching Input/Textarea.
  - `min`/`max`/`step` inputs (fractional steps supported), required accessible `label`.
  - Token-driven via `slider.options`: fill/thumb `color`, `trackColor`, `borderRadius`,
    and geometry (`trackHeight`, `thumbSize`). The fill level rides a CSS custom
    property, so dragging never regenerates Emotion styles; Firefox uses the native
    `::-moz-range-progress`, WebKit a gradient stop.

- [`15a8f73`](https://github.com/uni-design-system/uni/commit/15a8f731f70bcd84211b7ff16b9272a2c6f2adc8) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-tabs` / `uni-tab` components
  - Full WAI-ARIA tabs pattern: `tablist`/`tab`/`tabpanel` roles with wired
    `aria-selected`/`aria-controls`/`aria-labelledby`, roving tabindex, automatic
    activation on ArrowLeft/ArrowRight (wrapping, disabled tabs skipped), Home/End,
    and motion-safe transitions.
  - `selectedIndex` is a two-way `model()`; selection snaps to the nearest enabled tab.
    Panel content is captured per-tab and only the selected panel is instantiated.
  - Every visual knob is a theme option token (`tabs.options`): `typeface`, `textColor`,
    `activeTextColor`, `indicatorColor`, `indicatorThickness` (thickness token),
    `divider` (border primitive), `gap`/`padding` (spacing tokens), `borderRadius`, and
    optional `activeColor` — the defaults render underline tabs; `borderRadius: 'max'` +
    `activeColor` turns them into segmented pills with no component changes.

- [`b04b97b`](https://github.com/uni-design-system/uni/commit/b04b97bd109e36cbb8fcda31c73680d85509ab0a) Thanks [@gaenglish](https://github.com/gaenglish)! - New `uni-textarea` component
  - Multi-line text field with the same Signal Forms contract as `uni-input`
    (`FormValueControl<string>`: `value` model, `disabled`/`invalid`/`dirty`/`required`,
    touched-aware error styling, `aria-*` wiring).
  - Reuses `uni-input-box` for its chrome, so it inherits the input's themed color,
    border, typeface, focus outline, and disabled treatment automatically; the box's
    field selectors now cover `textarea` (with auto height and vertical padding), and
    the box accepts a `height` override.
  - Theme options follow the token pattern: `textarea: { options: { rows: 3, resize:
'vertical' } }` in the derived component themes; the `rows` input overrides per
    instance.

- [`8f55b4c`](https://github.com/uni-design-system/uni/commit/8f55b4ca34bfa7006c5d55c895b323931a3d6a1b) Thanks [@gaenglish](https://github.com/gaenglish)! - Theme Builder becomes the full playground (PRD §5.2)
  - **Light & dark side by side**: both palettes generate on every input change,
    independent of the storybook-wide mode toggle, each rendered in its own panel.
  - **Contrast report panel**: live pass/fail matrix over all checked pairs (summary +
    failing rows always visible, full detail on demand). Failures only occur with hard
    brand pins; the panel says so and points at soft targets.
  - **Shape language input** (`sharp`/`modern`/`playful`): applies `ShapeRadii` live via
    the new `radii` pass-through on `BrandPaletteConfig`/`createThemeFromPalette`.
  - **Export paths**: copy the static `uni-theme.ts` (via `emitThemeFile`), copy a
    pre-encoded `ng add` command, or copy W3C DTCG JSON for both modes via the new
    `emitDtcgTokens()` interop emitter in uni-core (Style Dictionary compatible).

## 5.1.0

### Patch Changes

- [`f2951db`](https://github.com/uni-design-system/uni/commit/f2951db7f6267f29b56d127151ff843d445c40a4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix `ng add` against real published packages (found by fresh `ng new` e2e):
  - The schematic bundle is CJS, but ng-packagr stamps `"type": "module"` into the
    published package.json, so Node loaded it as ESM and the CLI reported "no ng add
    actions". A nested `schematics/package.json` (`"type": "commonjs"`) scopes the
    bundle back to CJS.
  - The emitted `uni-theme.ts` used dot access on `Colors` (which has an index
    signature), failing under `ng new`'s strict `noPropertyAccessFromIndexSignature`.
    The emitter (and the MCP tool's guidance) now uses bracket access throughout.
  - `uni-angular`'s peer range on `uni-core` is now `workspace:^` (publishes as `^5.x`)
    instead of `workspace:*` (published as an exact pin). Alongside changesets'
    `onlyUpdatePeerDependentsWhenOutOfRange`, this stops minor releases from being
    inflated to majors by the peer-dependents rule — the cause of the 4.0.0 and 5.0.0
    version jumps.

## 5.0.0

### Minor Changes

- [`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b) Thanks [@gaenglish](https://github.com/gaenglish)! - OKLCH theme generation engine (`concepts/generation`)
  - New `generateThemes(input)` / `generateUniThemes(input)`: brand seed(s) in, complete
    WCAG-AA light+dark `Colors` pair out, with a machine-readable `ContrastReport`
    (110 checked pairs per theme pair). Pure and deterministic.
  - All palette math moved from HSL to perceptual OKLCH: uniform lightness slots across
    hues, per-category chroma model (`CategoryChroma`), dark-mode accent chroma decoupling
    (C ≤ 0.16), and a contrast guard-rail that adjusts lightness only — never hue.
  - Brand colors ride as soft `targets` (kept verbatim when already AA, lightness-adjusted
    when not) alongside the existing hard `brand` pins; accepted by `generatePalette`,
    `createThemeFromPalette`, and Angular's `BrandPaletteConfig`.
  - Semantic inks re-tuned per role: error 27°/C 0.20, warn 55°/C 0.18 (rotated off amber —
    dark yellow reads brown), success 152°/C 0.16.
  - `createTheme` accepts optional `radii`/`shadows` overrides; `ShapeRadii` presets
    (`sharp` / `modern` / `playful`) emitted via the `shape` generation input.
  - Theme Builder ships nine curated AA-clean presets built on soft targets.
  - Deprecated (thin wrappers/tables retained): `uniColor`, `randomRangeValue`,
    `CategorySaturation`, `CategoryLightness`. `schemeHues` moved to `color.utils`.
  - `createTheme` deep-merges optional `borders` and `components` overrides over its
    derived defaults — themes can define custom named primitives and rewire per-component
    options without restating untouched sections.
  - New `emitThemeFile()` renders a static `uni-theme.ts` — literal colors, visible border
    primitives, sparse component overrides — the editable source of truth; the engine
    never ships to the browser.
  - New `ng add @uni-design-system/uni-angular` schematic: installs the peer set, writes
    the generated theme file, registers `UNI_THEMES` in `app.config.ts`, adds typeface
    links, scaffolds a themed smoke test, and prints the contrast summary.
  - New MCP tool `generate-uni-theme`: returns the static theme file content, provider
    snippet, and contrast report, with agent guidance to edit the file for restyling.
  - `uni-core` gains its first Vitest suite, including a 1,080-seed contrast property
    corpus with zero tolerance in both modes; the schematic gets its own spec suite.

### Patch Changes

- Updated dependencies [[`f7f0bdd`](https://github.com/uni-design-system/uni/commit/f7f0bdddfac855955e022a852c2bfdccf8013a7b)]:
  - @uni-design-system/uni-core@5.0.0

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

### Patch Changes

- Updated dependencies [[`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9)]:
  - @uni-design-system/uni-core@4.0.0

## 3.0.2

### Patch Changes

- [`dcaf166`](https://github.com/uni-design-system/uni/commit/dcaf1668fb94716b192c65137a14f3ea561a0142) Thanks [@gaenglish](https://github.com/gaenglish)! - Extending the Symbol component to support theme options.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.2

## 3.0.1

### Patch Changes

- [`fabbb73`](https://github.com/uni-design-system/uni/commit/fabbb73e7b2124e14b3cc263b2b8ca43e0cf80bd) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting new components and formatting.

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.1

## 3.0.0

### Minor Changes

- [`54a945c`](https://github.com/uni-design-system/uni/commit/54a945c51635898acb0c8ec0dd93ee234c580228) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting Components, Themes, and CDK

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@3.0.0

## 2.0.4

### Patch Changes

- [`ad5dd15`](https://github.com/uni-design-system/uni/commit/ad5dd151d245765b9d24a6ad1370a3e9d0d6b63e) Thanks [@gaenglish](https://github.com/gaenglish)! - Exporting multiple Angular Components

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.4

## 2.0.3

### Patch Changes

- [`eb80cff`](https://github.com/uni-design-system/uni/commit/eb80cffaaba0009c1c30875f93ea7e75dcf92302) Thanks [@gaenglish](https://github.com/gaenglish)! - fix: setting dist directory in publishConfig

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @uni-design-system/uni-core@2.0.2

## 2.0.1

### Patch Changes

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

- Updated dependencies [[`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4), [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4)]:
  - @uni-design-system/uni-core@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515)]:
  - @uni-design-system/uni-core@1.1.0

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release

### Patch Changes

- Updated dependencies [[`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756)]:
  - @uni-design-system/uni-core@1.0.0
