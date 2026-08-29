# Number Input, Stepper, Range & Slider — design spec

Status: **proposal / prototype**  ·  Target: `@uni-design-system/uni-angular`
Prototype: [`index.html`](./index.html) (open in a browser, no build step)

Closes the roadmap's "Number input with increment/decrement steppers". Four
deliverables, one dependency chain, plus the cdk primitives they share:

1. **`uni-number-input`** — the field. Typed entry with locale-aware
   parsing, `Intl` formatting on commit, prefix/suffix adornments,
   min/max/step, and steppers that hold-to-repeat.
2. **`uni-quantity-stepper`** — the same core with no field chrome:
   `− 3 +` for table rows and cart lines.
3. **`uni-number-range-input`** — two linked fields, one chrome, one
   `{ start, end }` value. Price filters, thresholds, tolerances.
4. **`uni-slider`** — bounded values by pointer, with the same step model
   and the same keyboard map. Optionally paired with a compact number
   field as its readout.

Shared, in the cdk: `NumericStepModel` (clamp / snap / step / fence / wrap),
`parseNumber` + `formatNumber` (pure `Intl`, no number library), and
`PressRepeat` (the hold-to-accelerate ramp). Two components implementing
the same keyboard map independently is how two keyboard maps drift.

---

## Why not `<input type="number">`

The library is native-platform-first, so the burden of proof is on *not*
using the platform control. It fails on five counts, and the first is a
data-loss bug:

- **Bad input is indistinguishable from empty.** Per the HTML value
  sanitization algorithm, a `type="number"` input whose text isn't a valid
  floating-point number reports `value === ''`. Type `12,50` (as most of
  Europe does) or `1,234.56` (as everyone pasting from a spreadsheet does)
  and the app reads an empty field. `validity.badInput` is the only tell,
  and nothing shows the user what went wrong.
- **No grouping, ever.** `1,234.56` is *invalid input* to the platform
  control, so a thousands separator is unreachable — the exact requirement
  that starts this component.
- **No affixes.** No currency prefix, no unit suffix, no way to put them
  outside the editable text so the caret doesn't have to walk over them.
- **The spinners are unusable and unstyleable.** ~10 CSS px tall — under
  the 24×24 minimum of WCAG 2.2 SC 2.5.8 — hover-revealed in Chrome,
  absent on mobile, differently shaped everywhere, and not themeable.
  And a **focused** number input changes value on scroll-wheel, which
  silently corrupts forms people are merely scrolling past.
- **Float stepping.** `step` arithmetic is done in doubles: stepping
  `0.1` up from `0.2` yields `0.30000000000000004` in the value, and
  `stepMismatch` validity messages are untranslatable browser copy.

What we keep from the platform: the `spinbutton` ARIA pattern, real
`<button>`s for the steppers, `inputmode` so phones show the right keypad,
and `Intl.NumberFormat` for **both** formatting and parsing — separators,
currency placement, and digit systems all come from the locale.
**Zero runtime dependencies, no number library.**

---

## Value shape — a number, with an exact escape hatch

```ts
value         = model<number | null>(null);   // the ordinary binding
valueAsString = model<string | null>(null);   // canonical decimal, exact
```

`null` is empty. Not `0` (a real answer), not `NaN` (which poisons every
comparison downstream), not `undefined`. Whether empty is *allowed* is
`required`'s business, not the value's.

**Internally the field's source of truth is a canonical decimal string** —
optional sign, digits, optional `.`, no grouping, no affix: `-1234.56`.
Parsing produces one, stepping and rounding operate on it as a scaled
integer, and `value` is its `Number()` projection, emitted on every commit.
This is not ceremony:

```
0.1 + 0.2               → 0.30000000000000004     // float stepping
scaled: 1 + 2 = 3, ÷10  → '0.3'                   // what we do

(1.15).toFixed(1)       → '1.1'    // 1.15 is really 1.1499999999999999
scaled half-up on '1.15'→ '1.2'    // what an invoice expects
```

Bind `value` and money is off by a cent in the fifth decimal place after
enough arithmetic; bind `valueAsString` and it never is. Both models stay
in sync — writing either updates the other — so the common case is still
`[(value)]="qty"` and the strict case is a one-word change. In dev mode the
component warns once when a bound `value` can't round-trip
(`String(Number(s)) !== s`, or `|value| > Number.MAX_SAFE_INTEGER`):
silent precision loss is the whole reason this second model exists.

> **Alternative considered:** a `mode` input that switches `value`'s type,
> the way `uni-calendar`'s `mode` switches between `UniDate` and
> `UniDateRange`. Rejected here — a `number | string | null` union forces
> *every* consumer to narrow a type they already know, to serve a minority
> of fields. Two models cost nothing to ignore.

---

## Part 1 — `uni-number-input`

### Anatomy

```
        ┌─────┬──────────────────────────────────┬─────┐
        │  −  │  $   1,234.56             /mo    │  +  │   ← stepperLayout="split"
        └─────┴──────────────────────────────────┴─────┘
           ▲     ▲        ▲                 ▲       ▲
           │     │        │                 │       └ increment (hold to repeat)
           │     │        │                 └ suffix adornment (aria-hidden)
           │     │        └ editable text — raw while focused, formatted on blur
           │     └ prefix adornment (aria-hidden)
           └ decrement — disabled at the min fence, and it says so

        ┌──────────────────────────────────────────┬───┐
        │  1,234.56                                │ ▲ │   ← stepperLayout="stacked"
        │                                          │ ▼ │
        └──────────────────────────────────────────┴───┘
```

Chrome is `uni-input-box`, so error/disabled/focus states come free and
stay consistent with every other field. Affixes are **adornments, not
text**: they live outside the `<input>`, so caret math, select-all, and
paste never have to step over them, and `prefix`/`suffix` can be any
string without becoming parseable input.

`stepperLayout`: `'stacked'` (default, dense desktop) · `'split'`
(− … +, the touch and quantity language) · `'trailing'` (− + together at
the end) · `'none'`. Stacked arrows are visually 12px tall; each gets
padding to a **24×24 hit area** regardless, and on coarse pointers the
theme swaps stacked → split, because two 12px targets stacked on a
thumb-sized finger is a coin toss.

### API

```ts
// Signal Forms block (explicit, per AGENTS.md — not extracted to a base class)
value = model<number | null>(null);
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

// Exact binding (opt-in; see Value shape)
valueAsString = model<string | null>(null);

// Configuration
label       = input.required<string>();          // accessible name, e.g. "Unit price"
placeholder = input<string>();
preset      = input<NumberPreset>('decimal');    // 'decimal' | 'integer' | 'currency' | 'percent'
currency    = input<string>();                   // ISO 4217, e.g. 'USD' — implies preset 'currency'
locale      = input<string>();                   // default: document lang → navigator
prefix      = input<string>();                   // static adornment, e.g. '$', '≈'
suffix      = input<string>();                   // static adornment, e.g. 'kg', '/mo'
decimals    = input<number | [min: number, max: number]>();  // fraction digits
grouping    = input<'auto' | 'always' | 'min2' | false>();   // Intl useGrouping
numberFormat= input<Intl.NumberFormatOptions>(); // escape hatch; merged last
roundingMode= input<UniRoundingMode>('half-up'); // 'half-up' | 'half-even' | 'ceil' | 'floor' | 'trunc'
align       = input<'start' | 'end' | 'center'>();
valueIsFraction  = input(false);                 // percent preset: value 0.15 displays as 15%
unitAnnouncement = input<string>();              // spoken long form of an abbreviated suffix
readOnly    = input(false);

// Range & stepping
min        = input<number>();
max        = input<number>();
step       = input(1);
largeStep  = input<number>();                    // PageUp/Down + Shift+Arrow; default step × 10
smallStep  = input<number>();                    // Alt+Arrow; unset = disabled
stepOrigin = input<'min' | 'zero'>('min');       // snap grid anchor
wrap       = input(false);                       // cyclic fields (hours, degrees)
clampOnCommit = input(true);                     // false → out-of-range is rejected, not clamped
emptyStepValue= input<number>();                 // ↑ on an empty field; default min ?? 0

// Entry behaviour
commitOnBlur    = input(true);
selectOnFocus   = input(false);                  // true for quantity-ish fields
allowExpressions= input(false);                  // '12*3' → 36; see Typed entry
wheel           = input(false);                  // scroll-to-step, off for the reason above
repeat          = input(true);                   // hold-to-repeat on the stepper buttons
parse           = input<(raw: string, locale: string) => string | null>();

// Events
stepped  = output<{ from: number | null; to: number; by: number }>();
rejected = output<{ raw: string; reason: NumberRejectReason }>();

type NumberRejectReason =
  | 'unparseable' | 'min' | 'max' | 'step' | 'precision' | 'not-integer';
```

Minimum agent-writable usage is one line:
`<uni-number-input label="Quantity" [(value)]="qty" [min]="1" />`, and a
money field is `label`, `currency="USD"`, `[(value)]` — the preset supplies
grouping, two decimals, the symbol's locale-correct side, and
`inputmode="decimal"`.

**Presets** are the agent-facing surface; `numberFormat` is the escape
hatch, merged over the preset so one option can be overridden without
rebuilding the rest:

| preset | decimals | grouping | affix | inputmode |
|---|---|---|---|---|
| `decimal` | `[0, 3]` | `min2` | — | `decimal` |
| `integer` | `0` | `min2` | — | `numeric` (`decimal` if `min < 0`) |
| `currency` | from `Intl` for the currency (JPY → 0, USD → 2) | `always` | symbol, on the locale's side | `decimal` |
| `percent` | `[0, 2]` | `min2` | `%` suffix | `decimal` |

`min2` is the default because a year field must render `2026`, not
`2,026`, while a price must render `10,000`. Money overrides to `always`.

**Percent does not silently multiply.** `preset="percent"` formats with
`style: 'decimal'` plus a literal `%` suffix, so `value = 15` displays
`15%`. Intl's own `style: 'percent'` divides by 100, and a control that
turns 15 into 0.15 behind the user's back is a bug generator. Apps whose
model *is* a fraction set `valueIsFraction` and get Intl percent style,
`min`/`max`/`step` interpreted in fraction units, and `0.15 → 15%`.

`align` defaults to `'start'` — a number field that right-aligns while the
text field above it left-aligns reads as broken. Tables and numeric
columns should set `'end'`; that's a layout decision, made where the
layout is.

There is deliberately **no `allowNegative`**: `min >= 0` already says it,
and inferring it keeps two inputs from disagreeing. Same for
`allowDecimals` — that's `decimals = 0`, or `preset="integer"`.

### Display: raw while typing, formatted on commit

The field is free text, parsed on `Enter` / blur / step, then re-rendered
in the resolved format. On focus it reverts to the plain canonical string:

```
blurred   $1,234.56 /mo
focused   1234.56
typing    1234.5|
blurred   $1,234.50 /mo
```

**Input masks and live grouping were rejected** — same call as
`uni-date-input`. Formatting as you type means restoring a caret across
separators that appear and vanish mid-word; it breaks paste, IMEs, and
screen-reader echo, and every implementation of it has a bug where
deleting a comma eats a digit. Formatting on commit has one failure mode
(the number looks plain while you edit it) and no caret arithmetic at all.

> **Alternative considered:** `formatWhileTyping` as an opt-in. Deferred —
> it is not one option, it is a second caret model to test on every
> browser. Revisit only with a real complaint attached.

### Typed entry — what parses

Separators, minus sign, and digit set all come from
`Intl.NumberFormat(locale).formatToParts()`, never hardcoded. Accepted, in
order:

1. **Canonical / ASCII** — `1234.56`, `-1234.56`, `+3`, `.5`, `5.`
   (what agents and APIs write; always accepted regardless of locale)
2. **Locale-grouped** — `1,234.56` (en), `1.234,56` (de),
   `1 234,56` (fr, ordinary space, NBSP, or narrow NBSP — all three, since
   which one a copy-paste carries is nobody's fault)
3. **Affixed** — `$1,234.56`, `1 234,56 €`, `15%`, `5kg`: the currency
   symbol, code, percent sign, and the field's own `prefix`/`suffix` are
   stripped before parsing. People paste from spreadsheets.
4. **Localized digits** — `١٢٣٤٫٥` in `ar`, `१२३४.५` in `hi`, mapped back
   through the locale's numbering system.
5. **Compact** — `1.5k` → `1500`, `2m` → `2000000`, when
   `numberFormat.notation === 'compact'` is in play.
6. **Accounting negatives** — `(1,234.56)` → `-1234.56`. Finance people
   type parentheses; refusing them is a papercut with no upside.
7. **Expressions**, when `allowExpressions` is on — `12*3`, `100/4+5`,
   `(2+3)*1.5`. A ~30-line shunting-yard over `+ − × ÷ ( )` and digits.
   **Never `eval`.** Spreadsheet muscle memory is the single most
   requested feature on quantity and price fields, and it is off by
   default because a field that *silently truncates* `12*3` to `12` is
   worse than one that rejects it.

Anything else **stays in the field**, styled invalid, with a `rejected`
event — the same principle as tag-input and date-input. A field that
swallows `12..5` and shows you an empty box has lost your work and told
you nothing.

### The stepping model

```ts
// cdk — shared by number-input, quantity-stepper, and slider
stepValue(current, { step, min, max, origin, wrap, direction })
```

- **Snap grid.** Steps land on `origin + n·step`, where `origin` is `min`
  when defined (`stepOrigin='min'`, matching the platform) or `0`. A field
  with `min=5, step=10` steps 5 → 15 → 25. A value that's off-grid snaps
  to the nearest grid point *in the direction of travel* on the first
  press, rather than jumping past it.
- **Arithmetic is scaled-integer**, never float — see Value shape.
- **Clamping happens on commit, not per keystroke.** A `min=10` field that
  clamps live can never be typed into: the `1` becomes `10` before the `5`
  arrives. On commit, out-of-range either clamps (default, announced) or
  is refused with `rejected({ reason: 'min' | 'max' })`.
- **Fences are visible.** At `max`, the increment button is `disabled`
  (not a silent no-op) and the live region says *"Maximum, 100."* The
  fence stops the value; it never wraps — unless `wrap` is set, which is
  for genuinely cyclic fields (24 → 0 hours, 359 → 0 degrees).
- **Empty + step** commits `emptyStepValue ?? min ?? 0`, so ↑ on a blank
  quantity field gives you `1`, not `NaN`.
- **Hold to repeat** (`PressRepeat`, cdk): 500 ms delay, then 10/s,
  accelerating to 40/s after 2 s. Pointer capture, so sliding off the
  button mid-hold doesn't strand the repeat; cancelled by `pointercancel`,
  blur, window blur, and `Escape`. Getting from 1 to 200 is otherwise 199
  clicks. The live region announces **on release only** — a screen reader
  narrating 200 intermediate values is a denial-of-service.
- **Wheel is off by default.** When `wheel` is on it steps only while the
  field is focused *and* hovered, and calls `preventDefault` only when the
  value actually changed, so a page doesn't get scroll-trapped on a field
  sitting at its max.

### Keyboard map (focus in the input — the only tab stop)

| Key | Behaviour |
|---|---|
| printable | edits the draft; no live reformat |
| `ArrowUp` / `ArrowDown` | ±`step`, committed immediately |
| `Shift+Arrow`, `PageUp` / `PageDown` | ±`largeStep` |
| `Alt+Arrow` | ±`smallStep` when set (Figma's fine-nudge convention) |
| `Home` / `End` | `min` / `max` — **no-op when that bound is undefined**; nothing sensible lives at an unbounded fence |
| `Enter` | parses and commits; reformats. Never submits the form while an uncommitted draft is in the field |
| `Escape` | reverts the draft to the committed value; cancels an in-flight hold-repeat |
| `Tab` | commits, then moves on — never traps |
| blur | commits when `commitOnBlur`, marks `touched` |

Arrow-to-step and Enter-to-commit are exactly `uni-date-input`'s and
`uni-time-input`'s contract; `Home`/`End`-to-fence is exactly the
slider's. Learned once.

### States

| State | Visual | ARIA |
|---|---|---|
| rest / focus / error / disabled | from `uni-input-box` — not duplicated | `aria-invalid` gated on `invalid && (touched \|\| dirty)` |
| at `min` / at `max` | that stepper button dims and is `disabled` | `disabled`; fence announced via live region |
| unparseable draft | invalid border **+ a dashed underline on the text** | `aria-invalid` only once committed-and-failed |
| clamped on commit | value snaps, 400 ms pulse on the changed digits | announced: *"Maximum is 100. Value set to 100."* |
| read-only | text selectable, steppers hidden, no caret | `aria-readonly` |
| stepping (held) | pressed state on the button | value updates silently; announced on release |

The dashed underline is not decoration: colour alone can't carry "this
isn't a number" (WCAG 1.4.1), and the same underline already means the
same thing on an invalid `uni-tag`.

### ARIA contract

- The control is `<input type="text" inputmode="decimal">` with
  `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
  `type="text"` is deliberate — it is the only way to keep the user's
  malformed text (see Why not, above).
- **`aria-valuetext` carries the formatted string with affixes** —
  *"$1,234.56 per month"*, *"15 percent"*, *"72 kilograms"*. `aria-valuenow`
  alone announces "1234.56", which is the one thing about a money field
  that isn't the point. `prefix`/`suffix` adornments are `aria-hidden` so
  they aren't read twice; long-form unit words come from
  `unitAnnouncement = input<string>()` when the visible suffix is an
  abbreviation.
- An **empty** field omits `aria-valuenow` entirely (per APG) and sets
  `aria-valuetext` to the localized *"Empty"*.
- The stepper buttons are real `<button>`s named *"Increase {{label}}"* /
  *"Decrease {{label}}"*, with `tabindex="-1"` — pointer affordances. The
  keyboard path is the arrow keys, and the same reasoning already governs
  `uni-combobox`'s chevron and `uni-tag-input`'s per-chip ✕. (Contrast
  combobox's clear ✕, which *is* tab-reachable because it's the only
  keyboard route to clearing.)
- One `role="status"` region per field announces clamps, fences,
  rejections, and expression results (*"12 × 3 = 36."*) — each of which is
  otherwise a purely visual event.
- `inputmode` follows the preset: `numeric` only when negatives and
  decimals are both impossible, since several mobile keypads omit `−` and
  `.` from the numeric layout entirely.
- `required` → `aria-required`; `ariaDescribedBy` passes through for
  app-rendered errors, per the form-control rule.

### Theme entry

Add `'numberInput'` to `ComponentName` and register:

```ts
numberInput: {
  options: {
    stepperLayout: 'stacked',            // 'split' on coarse pointers
    incrementSymbol: 'add',              // split/trailing layouts
    decrementSymbol: 'remove',
    stepUpSymbol: 'keyboard_arrow_up',   // stacked layout
    stepDownSymbol: 'keyboard_arrow_down',
    stepperWidth: 32,
    minTouchTarget: 24,                  // WCAG 2.5.8 floor for stacked arrows
    affixColor: 'on-primary-surface-variant',
    affixGap: 'xs',
    align: 'start',
    tabularNumerals: true,               // font-variant-numeric: tabular-nums
    repeatDelayMs: 500,
    repeatIntervalMs: 100,
    repeatFastIntervalMs: 25,
    repeatRampMs: 2000,
  },
}
```

`tabularNumerals` earns its place: with proportional figures a held-down
stepper makes the number visibly jitter as `1` and `8` swap widths, and
a column of prices stops lining up.

Field chrome (colour, border, radius, focus outline) is **not** duplicated
here — it comes from `input`, via `uni-input-box`, exactly like tag-input,
date-input, and combobox.

---

## Part 2 — `uni-quantity-stepper`

The cart line, the table cell, the seat count. Same core, no field chrome,
no floating label, no room for either:

```
    ┌─────┬───────┬─────┐        ┌─────┬───────┬─────┐
    │  −  │   3   │  +  │        │  🗑  │   1   │  +  │  ← at min=1 with `deleteAtMin`
    └─────┴───────┴─────┘        └─────┴───────┴─────┘
```

```ts
value = model<number | null>(null);
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

label = input.required<string>();      // "Quantity, Blue T-shirt (M)" — never visible, always needed
min = input(0); max = input<number>(); step = input(1);
size = input<Size>('md');              // 'sm' | 'md' | 'lg'
editable = input(true);                // false → the number is text, not an input
deleteAtMin = input(false);            // − becomes 🗑 at min; emits `emptied` instead of stepping
emptied = output<void>();
```

The middle stays a real input by default: typing `12` beats tapping `+`
eleven times, and it's the same parse/commit path as Part 1 (so `1,200`
and `12*3` behave identically). `editable=false` is for read-mostly
tables.

`deleteAtMin` is the cart pattern in one attribute — at quantity 1 the
decrement button becomes a remove affordance, renamed *"Remove
{{label}}"*, and emits `emptied` rather than stepping to 0. Without it
every shop reimplements the same `(value)===1 ? remove() : step(-1)`
branch outside the component.

> **Alternative considered:** `chrome="bare"` on `uni-number-input`
> instead of a second component. Rejected on the API surface: this control
> is defined by what it *doesn't* have (label rendering, placeholder,
> affixes, presets, expressions, four stepper layouts), and a preset
> component with eight inputs is more agent-writable than a general one
> with forty and a list of which ones to leave alone. It is a thin
> delegation, exactly like `uni-date-time-input` over its two parts.

Sizing: `sm` 24px / `md` 32px / `lg` 40px overall height, with the buttons
square at that height — so the 24×24 target floor holds at every size.

---

## Part 3 — `uni-number-range-input`

```
        ┌──────────────────┬───┬──────────────────┐
        │  $  50           │ – │  $  500          │
        └──────────────────┴───┴──────────────────┘
              Minimum              Maximum
```

```ts
export interface UniNumberRange { start?: number; end?: number }
```

`{ start, end }`, deliberately the same field names as `UniDateRange` —
one range vocabulary in the library, and `start`/`end` avoid colliding
with the `min`/`max` **inputs**, which mean the fence, not the value.

```ts
value = model<UniNumberRange | undefined>();
label = input.required<string>();             // "Price range" — names the group
startLabel = input('Minimum'); endLabel = input('Maximum');
min = input<number>(); max = input<number>(); step = input(1);
minGap = input<number>();                     // enforced distance between the ends
// preset / currency / prefix / suffix / decimals / locale forwarded to both parts
```

Rules that make it one field rather than two glued ones:

- **A backwards commit swaps the ends** rather than erroring — the same
  rule `uni-calendar` applies to a backwards date range. The user pointed
  at the range they meant.
- **Either end alone is a valid value.** `{ start: 50 }` means "$50 and
  up", which is a real filter — this is where it diverges from
  `uni-date-time-input`, whose two parts are two halves of one answer
  (a time without a day isn't one).
- The ends fence each other: `start`'s effective max is `end − minGap`
  and vice versa, so the steppers can't walk one end through the other.
- One label names the group; the parts are named *"Price range,
  Minimum"* / *"Price range, Maximum"*. Two tab stops, honestly — it *is*
  two questions.

---

## Part 4 — `uni-slider`

For bounded, low-precision values where the *position* is the information:
volume, opacity, weightings, price filters. Same `NumericStepModel`, same
keyboard map as the field, so nothing new is learned.

### Anatomy

```
    Opacity                                              64 %
    ├────────────────────●──────────────────────────────────┤
    0                                                     100

    ├──────●═════════════════════════●──────────────────────┤   ← mode="range"
          $50                       $500

    ├───────●────┬──────┬──────┬──────┬─────────────────────┤   ← marks + snapToMarks
           1     2      3      4      5
```

### API

```ts
export interface UniSliderMark { value: number; label?: string }

value = model<number | UniNumberRange | null>(null);   // shape follows `mode`
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

label      = input.required<string>();
mode       = input<'single' | 'range'>('single');
min        = input(0); max = input(100); step = input(1);
largeStep  = input<number>();
origin     = input<number>();                  // fill anchor; default min, set 0 for ±ranges
marks      = input<UniSliderMark[]>([]);       // { value, label? }
snapToMarks= input(false);                     // marks become the only stops
valueDisplay = input<'none' | 'inline' | 'tooltip' | 'input'>('none');
formatValue= input<(v: number) => string>();   // default: the number-input format pipeline
minGap     = input<number>();                  // range mode
size       = input<Size>('md');
variant    = input<Variant>('primary');

sliding    = output<number | UniNumberRange>();  // continuous, during drag
changed    = output<number | UniNumberRange>();  // committed, on release / keyup
```

(`sliding`/`changed` rather than the DOM's `input`/`change`: the library
names outputs in the past tense — `removed`, `selected`, `opened`,
`stepped` — and an output literally named `input` sitting next to
`input()` declarations is a lint report waiting to happen.)

`valueDisplay="input"` seats a compact `uni-number-input` at the trailing
edge, two-way bound to the same model — the **number field is the
slider's readout and its precise-entry escape hatch**, which is the pairing
that makes bounded numeric input actually usable: drag for the ballpark,
type for the exact value. That composition is the reason these ship
together.

Two events, deliberately: `sliding` fires every frame of a drag (for a live
preview), `changed` fires once on release. A form should bind `changed`;
piping a 60 Hz stream into a model is how sliders get blamed for jank.

### Interaction

- **Click anywhere on the track jumps the nearest thumb there**, then
  keeps dragging — no "grab the thumb first" tax.
- **Thumbs may cross in range mode; they swap** (calendar's rule again),
  with the dragged thumb keeping focus through the swap so the drag never
  jumps out from under the pointer.
- The thumb's **hit area is ≥24×24** even when the visual dot is 16px.
- `snapToMarks` makes the marks the only valid stops (t-shirt sizing,
  Likert scales); otherwise marks are decoration on a continuous track.
- Drag is `pointer` events with capture — one code path for mouse, touch,
  and pen — and `touch-action: none` on the thumb only, so a vertical
  page scroll that starts on the track still scrolls.
- RTL: the track's *visual* direction flips, the value's does not.

### Keyboard map (focus on a thumb)

| Key | Behaviour |
|---|---|
| `ArrowUp` / `ArrowDown` | +`step` / −`step` — always, in every writing direction |
| `ArrowRight` / `ArrowLeft` | toward / away from the **visual** end of the track, so in RTL they mirror along with it (APG's rule; the horizontal arrows follow the picture, the vertical ones follow the number) |
| `Shift+Arrow`, `PageUp` / `PageDown` | ±`largeStep` (default: `(max − min) / 10`, snapped to `step`) |
| `Home` / `End` | `min` / `max` — always defined here, unlike the field |
| `Tab` | next thumb, then out. Range mode is two tab stops |

### ARIA contract

- Each thumb is a `<div role="slider" tabindex="0">` with
  `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and **`aria-valuetext`
  in the display format** (*"$500"*, *"64 percent"*, *"Medium"* for a
  marks-only slider) — the same reason the field carries it.
- Range mode wraps both thumbs in a `role="group"` named by `label`;
  the thumbs are named *"{{label}}, minimum"* / *"maximum"*, and each
  thumb's `aria-valuemin`/`max` reflect the *other thumb's* position, so a
  screen-reader user is told where the wall actually is.
- Marks with labels render in a `role="presentation"` row; their text is
  folded into `aria-valuetext` at the matching value rather than being
  separately focusable.
- Live region only for fences and swaps — `aria-valuetext` already
  narrates ordinary movement, and doubling it is noise.
- `showError()` gates `aria-invalid` per the form-control rule.

### Theme entries

```ts
quantityStepper: {
  options: {
    incrementSymbol: 'add',
    decrementSymbol: 'remove',
    deleteSymbol: 'delete',
    borderRadius: 'xs',
    tabularNumerals: true,
    valueWidth: '3ch',        // grows with the digits; never reflows the row
  },
},
numberRangeInput: {
  options: { partGap: 'sm', dividerSymbol: '–', dividerColor: 'outline' },
},
slider: {
  options: {
    trackHeight: 4,
    trackColor: 'primary-container',
    thumbSize: 16,            // hit area is padded to minTouchTarget regardless
    thumbBorderRadius: 'max',
    minTouchTarget: 24,
    markSize: 3,
    tooltipShadow: 'menu',
    tooltipBorderRadius: 'xs',
    labelTypeface: 'label',
    transitionMs: 120,        // click-to-jump only; drag is never animated
  },
},
```

Fill and thumb colour are **not** options — they are the `variant` role
pair, the same rule every other component follows. Drag is unanimated on
purpose: a transition on a dragged thumb reads as lag.

---

## What the prototype already proves

`index.html` is behaviour-complete for everything above; `test.mjs`
(Playwright, `node test.mjs`) drives it headlessly and asserts **81
behaviours** — worth porting straight into the Vitest specs:

**Parsing & format**

- `1234.56`, `1,234.56`, `1.234,56` (de), `1 234,56` (fr, all three space
  characters), `$1,234.56`, `(1,234.56)` → `-1234.56`, `15%`, `5kg`,
  `١٢٣٤٫٥` (ar), `1.5k` — each to the right canonical string
- `12..5` and `abc` stay in the field, flagged, `rejected('unparseable')`
- focus strips grouping and affixes; blur restores them; no caret jumps
- `preset="percent"` with `value=15` shows `15%` and **stays 15**;
  `valueIsFraction` shows `15%` for `0.15`
- JPY renders 0 decimals, USD 2, both from `Intl`
- `allowExpressions`: `12*3` → 36, `(2+3)*1.5` → 7.5, `2+` rejected,
  and the same strings rejected when the flag is off

**Stepping & precision**

- `0.1` step from `0.2` gives exactly `0.3`; 20 steps of `0.1` from `0`
  gives exactly `2`
- `1.15` with `decimals=1` rounds to `1.2` (half-up), where
  `(1.15).toFixed(1)` gives `"1.1"`; under `half-even` ties go to the
  even digit — `1.25 → 1.2`, `1.35 → 1.4`. (An earlier draft claimed
  half-even turns 1.15 into 1.1 — that "expectation" is itself the float
  artifact, since decimal 1.15 is a true tie and rounds to the even 1.2;
  the prototype's tests caught it.)
- `min=5 step=10` steps 5 → 15 → 25; an off-grid `7` snaps to `15` on ↑
- clamping happens on commit, never per keystroke: `min=10` accepts the
  keystroke sequence `1`,`5`
- fences disable the matching button and announce; `wrap` cycles
  `23 → 0`
- ↑ on an empty field commits `emptyStepValue ?? min ?? 0`
- hold-to-repeat ramps, releases cleanly on `pointercancel` / blur /
  `Escape`, and announces exactly once, on release
- `valueAsString` survives 17 significant digits that `value` cannot; the
  dev-mode precision warning fires once

**Keyboard & ARIA**

- full keyboard map for the field; `Home`/`End` no-op when unbounded
- `aria-valuetext` carries affixes; empty omits `aria-valuenow`
- stepper buttons are `tabindex="-1"` and Tab crosses the whole widget in
  one stop
- clamps, fences, rejections, and expression results each announce once
- `showError()` gating: invalid renders only after touch or dirty

**Companions**

- quantity stepper: type `12`, `deleteAtMin` swaps the − for 🗑 at min and
  emits `emptied`, `editable=false` renders text with no caret
- range input: backwards commit swaps the ends, `minGap` fences both
  steppers, `{ start }` alone is a valid value
- slider: click-to-jump, drag with pointer capture, thumb swap in range
  mode keeps focus, `sliding` vs `changed` firing counts across one drag,
  `snapToMarks`, RTL mirroring, `valueDisplay="input"` staying in sync
  both directions
- light/dark parity on the real generated palettes

---

## Out of scope (v1)

- **Unit conversion.** `suffix` is a static adornment; a `units` picker
  that renumbers the value on switch (kg ⇄ lb, px ⇄ rem) needs a unit-table
  contract and a canonical-base-unit value shape. Decided 2026-08-29 (GE):
  static affixes now, conversion when a real consumer arrives — and it
  should land as a `uni-unit-input` over this core, not as six more inputs
  here.
- **Drag-to-scrub** the value from the label (Figma/Blender). Pointer-only,
  fights text selection, and duplicates what the slider already does well.
- **Masked numeric formats** — phone numbers, card numbers, postcodes.
  Those are formatted *strings*, not quantities; they belong to a masked
  text input with a completely different value contract.
- **Vertical sliders** and **more than two thumbs.**
- **Currency selection** (an amount plus a currency picker) — same shape as
  the unit question, same answer.
- **Live grouping while typing** — see Display, above.

## Open questions

1. **`null` vs `undefined` for empty.** This spec says `null`, following
   `uni-combobox`'s `T | null`; `uni-calendar` and `uni-date-input` use
   `undefined`. The library now has both, and the number components make
   it three. Worth settling library-wide in one pass rather than per
   component — a signals-forms control that can't say "empty" the same way
   twice is an agent-facing trap.
2. **Should `allowExpressions` default on?** It is delightful and it is
   also a parser in a form field. Current line: off, revisit after the
   prototype's rejection copy is real.
3. **`stepOrigin` default.** `'min'` matches the platform, but a field
   with `min=0.5, step=1` then steps 0.5/1.5/2.5, which surprises people
   who expect integers. `'zero'` surprises people who know the platform.
   Neither is wrong; the default should be whichever the first three real
   consumers assume.
4. **Percent as a separate preset vs a `scale` input.** `valueIsFraction`
   is a boolean patching over what is really "the value is the display
   number ÷ 100". A general `scale = input(1)` would also cover basis
   points and per-mille — and would be one more thing to misread.
5. **Does the slider belong in this bundle at all?** It shares the step
   model and the keyboard map, which is the whole argument. But it is the
   only piece here that isn't a text field, and it could ship a release
   later without blocking the other three.
6. **`Home`/`End` stealing caret movement** in the field while text is
   selected — inherited tension, same as combobox's open question 3. If it
   changes it should change for every text-hosting control at once.

## Checklist to ship (per `packages/angular/AGENTS.md`)

- [ ] cdk: `NumericStepModel`, `parseNumber` / `formatNumber` /
      `localeNumberParts`, scaled-decimal arithmetic, `PressRepeat` —
      pure functions, unit-tested hard (this is where the bugs live)
- [ ] `'numberInput'`, `'quantityStepper'`, `'numberRangeInput'`,
      `'slider'` added to `ComponentName`; theme entries in `base.theme.ts`
- [ ] `number-input/`, `quantity-stepper/`, `number-range-input/`,
      `slider/` components, models, barrels; export from `components/index.ts`
- [ ] Specs covering the keyboard maps, the parse table, the precision
      cases, **and** the ARIA contracts (port from `test.mjs`)
- [ ] `.stories.ts` + `.mdx` each (Overview with the
      field-vs-stepper-vs-slider rule / Usage / Money / Units / Presets /
      Theme options / Accessibility / Do / Don't)
- [ ] `ACCESSIBILITY.md`: both keyboard maps + the `aria-valuetext` note
- [ ] `pnpm lint && pnpm test && pnpm build && pnpm docs:api`
