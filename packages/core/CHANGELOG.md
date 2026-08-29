# @uni-design-system/uni-core

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

## 9.0.1

### Patch Changes

- [`f926cd5`](https://github.com/uni-design-system/uni/commit/f926cd513a5cac593adef559e21bada4dada76ee) Thanks [@gaenglish](https://github.com/gaenglish)! - `uni-react`'s Switch reads the `success` color token instead of hand-rolling an
  HSL string from a color-generation internal, and both packages now typecheck as
  part of their build.

  The Switch built its "on" color as `hsl(${RoleHues.success.default}, 32%, 50%)`
  — a fixed green assembled from the HSL generation tables rather than the theme,
  so it never recolored with the theme and broke when those tables were removed.
  It now reads `useTheme().colors.success`.

  The reason that reached a deploy is the build. `vite build` transpiles with
  esbuild, which strips types without checking them, and it treats
  `@uni-design-system/uni-core` as an external — so neither the type layer nor the
  module graph ever verified that an imported core export exists. `pnpm turbo run
build` passed on a package whose source did not compile.
  - `core` and `react` now run `tsc --noEmit` as the first half of `build`, so a
    removed or renamed core export fails the consumer's build.
  - A `type-check` turbo task exists for running that pass alone.
  - CI builds **both** Storybooks, not just Angular's. These bundle uni-core
    instead of externalizing it, so they are the step that resolves its exports
    against real consumer source.

  This also cleared four pre-existing type errors in `IconTextRow`, which did
  arithmetic on `fontSize` / `lineHeight` — typed `CssLength` (`number | string`)
  — and passed the result to props typed `number`. They are coerced through one
  documented helper now.

## 9.0.0

### Major Changes

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

## 8.3.1

## 8.3.0

### Minor Changes

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - `'combobox'` joins `ComponentName`, with a base-theme entry: `toggleIcon: 'chevronDown'`, `clearIcon: 'close'`, `selectedIcon: 'check'` (BaseIcons names rendered by `uni-icon` — not Material Symbol ligatures), the listbox surface trio (`listColor`/`listShadow`/`listBorderRadius`), `activeColor`, `descriptionColor`, and `maxVisibleOptions: 8` — a scroll height, never a cap. Field chrome comes from the `input` entry via `uni-input-box`, as everywhere.

- [`eb8b7ae`](https://github.com/uni-design-system/uni/commit/eb8b7aebd900e647a8b35da791fce88a8c9a1217) Thanks [@gaenglish](https://github.com/gaenglish)! - Listbox popups (`uni-search-input`, `uni-tag-input`, `uni-time-input`, `uni-combobox`): the active/hover option fill is now the themable `activeColor` option (default `'primary-container'`, on-color derived) instead of a hardcoded token pair. Set it when your theme maps `primary-container` and `primary-surface` to the same color — the keyboard highlight is otherwise invisible; a canvas/hover tint like the one your menus use is usually right (`searchInput: { options: { activeColor: 'tertiary-surface' } }`, and likewise `tagInput`/`timeInput`/`combobox`). The base theme carries the default explicitly so the option is discoverable in each component's Theme options table.

  The four popups now share one style source, the exported `listboxPopupStyles(theme, options, { maxHeight? })` helper (`UniListboxPopupOptions`), so their surface trio and highlight can no longer drift apart. Rendering is unchanged under existing themes; the active row's text color now derives from `listColor`'s on-pair rather than assuming `on-primary-surface`.

- [`6f87212`](https://github.com/uni-design-system/uni/commit/6f87212da2ed421a8a4f2e57047ebcba485c0fd3) Thanks [@gaenglish](https://github.com/gaenglish)! - `'popover'`, `'callout'`, and `'tour'` join `ComponentName`, with base-theme entries. The popover defaults reproduce the previously hardcoded look (`primary-surface`, `quaternary` border, `xs` radius, `raised` shadow, `6px 12px` padding, 7px offset) plus the tooltip-mode options; the callout entry carries the scrim/spotlight geometry (`scrimColor`, `spotlightPadding`, `spotlightRadius`, `ringWidth` — the ring color is deliberately the `variant` role, not an option); the tour entry is just `progressStyle` and `footerGap`, since its skin is the callout's.

## 8.2.0

### Minor Changes

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - `createTheme` accepts a sparse `typography` override, deep-merged over the base type scale — restate only the roles (or the individual `TextStyle` fields within a role) that change, and add product-specific roles under any name. Closes the gap where a derived theme (e.g. the Carbon experiment) had to spread `typography` over the created theme by hand.

- [`57a8c4c`](https://github.com/uni-design-system/uni/commit/57a8c4c73c852a6b14c2e2916cad9bd0a1566787) Thanks [@gaenglish](https://github.com/gaenglish)! - Input options: `typeFace` → `typeface`, matching the tooltip/button/tabs casing. The base theme now writes `typeface`, and the input box reads the new key with the old one as a deprecated fallback, so themes that still set `typeFace` render unchanged. The `typeFace` key is deprecated and will be removed in the next major.

### Patch Changes

- [`e706e38`](https://github.com/uni-design-system/uni/commit/e706e3887f47d8821cc1652410ad37a43d52a428) Thanks [@gaenglish](https://github.com/gaenglish)! - Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.

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

### Minor Changes

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

- [`6a4c7da`](https://github.com/uni-design-system/uni/commit/6a4c7da4c7c3f5758d8c66d1be714319c983e39e) Thanks [@gaenglish](https://github.com/gaenglish)! - Theme validation contract: `parseTheme` / `assertTheme` / `isUniTheme`

  Every theme scale is `Partial<Record<…>>`, so a malformed theme — hand
  written, generated, or fetched as JSON — rendered as silent `undefined` CSS
  with no diagnosis. Core now ships a **dependency-free** structural validator
  (core stays zero-dep; no zod outside the MCP):
  - **`parseTheme(input): ThemeParseResult`** collects every issue rather than
    failing fast: `{ success, theme?, issues: [{ path, message }] }` with dotted
    paths like `colors.primary` or `typography.label.fontSize`. Acceptance /
    rejection **with reasons** is the API.
  - **`assertTheme(input)`** throws with all reasons; **`isUniTheme`** is the
    type-guard form; **`formatThemeIssues`** renders issues for logs.
  - The contract requires what components can't render without: 16
    `REQUIRED_COLOR_TOKENS`, all 22 canonical `REQUIRED_TEXT_ROLES` (with
    `fontFamily`/`fontSize`/`lineHeight`), the spacing/radii/shadow/thickness
    scale keys, and recursively-valid component style expressions. All
    `REQUIRED_*` sets are exported for tooling (MCP, docs, registries). Themes
    remain free to add arbitrary named primitives on every scale.
  - Because a `UniTheme` is plain serializable data, the same contract
    validates JSON round-trips — the foundation for theme distribution and
    runtime theme registries (ROADMAP Track 1).

- [`5414517`](https://github.com/uni-design-system/uni/commit/5414517d52d17943a4730752ab5d90c304c37062) Thanks [@gaenglish](https://github.com/gaenglish)! - A wire format for themes: `hydrateTheme` / `dehydrateTheme`

  A `UniTheme` is plain serializable data, which makes JSON the natural transport
  for distributing themes — but a serialized theme is ~50 KB and **~71% of that is
  the 61 built-in icon data URIs that every uni-core consumer already ships**.
  - **`dehydrateTheme(theme)`** returns the wire form: icons identical to
    `BaseIcons` are dropped, genuine overrides kept. A theme goes from ~50 KB to
    ~14 KB, and still passes `parseTheme`.
  - **`hydrateTheme(theme)`** restores the built-in set on the way in, applying
    the same `{...BaseIcons, ...icons}` contract `createTheme` applies at
    construction — the theme's own icons win, built-ins fill the rest.
  - **`generateUniThemes` now returns the `ContrastReport`** alongside the
    light/dark pair, so a caller can generate registration-ready themes and their
    WCAG audit in one call instead of falling back to `emitThemeFile` (which
    returns TypeScript source) just to see the report.
  - **`summarizeContrast(report)`** is extracted and exported, so the generated
    theme file's header and every other consumer word the audit identically.

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

## 7.2.0

### Minor Changes

- [`e72ec94`](https://github.com/uni-design-system/uni/commit/e72ec9410bb12d677c9c9102ccaf3e5bf4e8790e) Thanks [@gaenglish](https://github.com/gaenglish)! - Add `funnel` and `building` icons

  Two gaps found while migrating a real app off inline SVG — both cases where the
  existing set forced the app to keep hand-drawn artwork.
  - **`funnel`** (`filter_alt`) — `filter` is `filter_list`, the stacked-lines
    metaphor. Apps that name the feature itself a funnel ("Funnel Analytics") draw
    the shape, and substituting stacked lines loses the reference.
  - **`building`** (`apartment`) — pairs with `home` for residential-vs-commercial
    distinctions, which had no built-in counterpart.

  Both are Material Symbols Outlined 300 on the shared `0 -960 960 960` grid, so
  the set is now 61 icons. Note `building` carries more internal detail than most
  of the set; it reads well from ~14px but goes muddy below ~12px, so prefer a
  larger size or `home`'s simpler silhouette in very small badges.

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

### Major Changes

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

## 6.1.0

### Minor Changes

- [`28323ec`](https://github.com/uni-design-system/uni/commit/28323eca4ff239953de6dee9c34d34704627171e) Thanks [@gaenglish](https://github.com/gaenglish)! - TextStyle now accepts CSS length strings, not just px numbers
  - `fontSize`, `lineHeight`, `letterSpacing`, `textIndent`, and `wordSpacing` on
    `TextStyle` are widened from `number` to the new exported `CssLength`
    (`number | string`). Bare numbers still mean px, matching Emotion's own
    convention; strings pass through verbatim, so any unit the CSS engine accepts
    works — `'1.2rem'`, `'2em'`, `'clamp(1rem, 2vw, 1.5rem)'`, unitless
    line-height multipliers like `'1.5'`, etc.
  - `toTypeface` no longer blindly appends `px`: numbers are converted, strings
    are passed through untouched. Existing numeric themes are unaffected.

## 6.0.1

## 6.0.0

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

### Minor Changes

- [`c1dc853`](https://github.com/uni-design-system/uni/commit/c1dc853f762a27c466b033709ec84876b708995c) Thanks [@gaenglish](https://github.com/gaenglish)! - Brand-tinted, theme-scoped elevation shadows (PRD §3.5.C)
  - New `generateShadows(colors, mode)`: light themes replace the dead-neutral
    `rgba(0,0,0,…)` stacks with a shadow ink pulled toward the brand hue; dark themes go
    near-zero (`raised: none`) with only a faint veil on floating overlays — elevation
    reads from the surface lightness steps instead. The `warn` glow is tinted with the
    theme's own error color in both modes.
  - `generateThemes` now returns `lightShadows`/`darkShadows`; `generateUniThemes`,
    `createThemeFromPalette` (Theme Builder), the emitted `uni-theme.ts`, and the shipped
    stock Light/Dark themes all carry them.

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

## 4.0.0

### Minor Changes

- [`ef9b3b5`](https://github.com/uni-design-system/uni/commit/ef9b3b5d2c7bc68dc2a114b04b3960a759d631b9) Thanks [@gaenglish](https://github.com/gaenglish)! - Porting Components

## 3.0.2

## 3.0.1

## 3.0.0

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- [`e2cad74`](https://github.com/uni-design-system/uni/commit/e2cad74631b3a9d2caf4816bcadedf19db99fec4) Thanks [@gaenglish](https://github.com/gaenglish)! - Fix: switch to bundled dual-package distribution via Vite to resolve strict ESM relative path failures

- [`be0fb26`](https://github.com/uni-design-system/uni/commit/be0fb2626c248fed37c2609d50eb1bfae40269e4) Thanks [@gaenglish](https://github.com/gaenglish)! - Setting Fixed Versioning for all packages.

## 1.1.0

### Minor Changes

- [`4a049de`](https://github.com/uni-design-system/uni/commit/4a049def689d56d6b6cc1d2da73c9facd93ed515) Thanks [@gaenglish](https://github.com/gaenglish)! - Adding cjs support

## 1.0.0

### Major Changes

- [`7d18157`](https://github.com/uni-design-system/uni/commit/7d18157cb131098688b70286513643423c37c756) Thanks [@gaenglish](https://github.com/gaenglish)! - init release
