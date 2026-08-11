# Tag & Tag Input — design spec

Status: **proposal / prototype**  ·  Target: `@uni-design-system/uni-angular`
Prototype: [`index.html`](./index.html) (open in a browser, no build step)

Two deliverables, one dependency chain:

1. **`uni-tag` v2** — a fresh take on the chip. Today's tag is display-only,
   hardcoded to `primary` + `max` radius, and *always* renders a remove
   button. The rewrite makes it themed, sized, stateful, and composable.
2. **`uni-tag-input`** — the type-to-add token field built on it. First
   application: an email recipient field (the Gmail "To:" pattern).

---

## Part 1 — `uni-tag` v2

### What's wrong with v1

```html
<div box-layout color="primary" borderRadius="max" display="inline-block">
  <div row-layout paddingLeft="sm" gap="xs">
    <span uni-text typeface="tag">{{ label() }}</span>
    <button icon-button symbolName="close" size="sm" (click)="handleClose()">…</button>
  </div>
</div>
```

- **No theme entry.** `tag` isn't in `ComponentName`, so there is nothing to
  restyle per-theme — the palette is welded into the template. Every other
  themed component reads `componentOptions()`.
- **The remove button is unconditional.** A tag used as a category label
  ships a dead "Remove …" button into the a11y tree.
- **One look.** No variants, no sizes, no states. A filter chip, a status
  pill, and a recipient token all render identically.
- **No leading slot,** so the recipient-avatar pattern is impossible.
- `close.emit()` is skipped when `value` is falsy (`if (v)`), so a tag with
  `value=""` or `value={{0}}` silently can't be removed.

### Anatomy

```
┌─────────────────────────────────────────────┐
│  ▒▒  Alice Chen                        ✕   │   ← host: uni-tag (inline-flex)
└─────────────────────────────────────────────┘
   ▲   ▲                                  ▲
   │   │                                  └── remove button (opt-in)
   │   └── label (truncates, title on overflow)
   └── lead slot: avatar | symbol | dot | custom
```

Structurally the chip is **body + trailing action**, never nested buttons:

```html
<!-- static -->
<uni-tag>  <span class="uni-tag-body">…lead…label…</span>  <button …>✕</button>  </uni-tag>
<!-- interactive -->
<uni-tag>  <button class="uni-tag-body">…</button>          <button …>✕</button>  </uni-tag>
```

Nesting the ✕ inside an interactive chip would be invalid HTML and an
un-clickable target for keyboard users; siding them keeps both operable.

### API

```ts
// Presentation
variant   = input<Variant>('primary');          // color role — theme-driven
tone      = input<TagTone>('soft');             // 'soft' | 'solid' | 'outline'
size      = input<Size>('md');                  // 'sm' | 'md' | 'lg'
label     = input<string>();                    // or project content
value     = input<string | number>();           // echoed on removed/activated
maxWidth  = input<string | number>();           // truncation budget, e.g. '14ch'

// Lead (convenience — anything richer goes in the [tag-lead] slot)
avatarSrc = input<string>();
avatarName= input<string>();                    // initials fallback
symbolName= input<string>();                    // material symbol ligature
dot       = input<boolean>(false);              // status dot in the variant color

// Behaviour
removable   = input(false);                     // ← now opt-in (breaking, deliberate)
interactive = input(false);                     // chip body becomes a <button>
selected    = input(false);                     // aria-pressed / aria-selected
invalid     = input(false);                     // error styling + aria-invalid
disabled    = input(false);                     // dim, not removable, not clickable
removeLabel = input<string>();                  // a11y name override for ✕

// Events
removed   = output<string | number | undefined>();  // ← renamed from `close`
activated = output<string | number | undefined>();  // interactive chips only
```

**Migration.** `close` → `removed` and the remove button becoming opt-in are
both breaking; they land together in the next major with a codemod
(`close` → `removed`, add `removable` wherever a `(close)` handler exists).

### States

| State | Visual | ARIA |
|---|---|---|
| rest | tone × variant from theme | — |
| hover (interactive) | `brightness(0.96)` on solid, container tint on soft | — |
| focus-visible | `theme.focusRing()` on the focused sub-element only | — |
| selected | solid fill of the variant, check symbol in lead | `aria-pressed` (toggle) / `aria-selected` (listbox child) |
| invalid | `warn`/`error` palette + 1px dashed underline | `aria-invalid="true"` |
| disabled | `disabled-container` / `on-disabled`, no pointer events | `disabled` on the buttons |

The dashed underline matters: colour alone can't carry "this address is
malformed" (WCAG 1.4.1).

### Theme entry

Add `'tag'` to `ComponentName` and register:

```ts
tag: {
  options: {
    borderRadius: 'max',      // 'xs' gives the rectangular/GitHub-label language
    typeface: 'tag',          // already exists in the type scale (15/20/600)
    gap: 'xs',
    removeSymbol: 'close',
    selectedSymbol: 'check',
  },
  fixed: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    border: '1px solid transparent',
    transition: 'background-color .2s ease, color .2s ease',
  },
  // Variant = colour role. Tone = archetype, expressed as nested selectors so
  // a theme author can restyle both axes in one place (same trick the button
  // uses for `&:hover`).
  variants: {
    primary: {
      backgroundColor: c['primary-container'],
      color: c['on-primary-container'],
      '&.tone-solid':   { backgroundColor: c.primary, color: c['on-primary'] },
      '&.tone-outline': { backgroundColor: 'transparent', color: c.primary,
                          borderColor: c['on-primary-container-border'] },
    },
    // …secondary, tertiary, warn, success, ghost, disabled follow the same shape
  },
  // Geometry only — family/weight come from the typeface option.
  sizes: {
    sm: { height: 20, fontSize: 12, padding: '0 8px' },
    md: { height: 24, fontSize: 13, padding: '0 10px' },
    lg: { height: 32, fontSize: 15, padding: '0 12px' },
  },
}
```

Lead-element sizing derives from the chip height (`height - 6`), so an avatar
in an `lg` chip is 26px without a second token.

> **Alternative considered:** a `tone` map inside `options` instead of nested
> `&.tone-*` selectors. Rejected — it would put colour decisions somewhere a
> theme author doesn't look, and `variants` already accepts nested selectors.

### Accessibility contract

- A static tag is **text**, not a widget — no role, no tabindex. Screen
  readers read the label as content.
- `removable` adds one real `<button>` named `Remove {{label}}` (or
  `removeLabel`). Inside `uni-tag-input` this button is `tabindex="-1"`; the
  keyboard path to removal is Backspace on the focused chip, and the field's
  `aria-describedby` says so once, rather than every chip advertising it.
- `interactive` makes the body a `<button type="button">`; `selected` maps to
  `aria-pressed`. Inside a listbox the parent overrides role/selection.
- Icons and dots are `aria-hidden`; the chip's text is the accessible name.
- The enter/exit animation is behind the global reduced-motion rule.

---

## Part 2 — `uni-tag-input`

### Value shape

```ts
export interface UniTagItem {
  value: string;         // canonical — what a form submits ("alice@ex.com")
  label?: string;        // display — defaults to value ("Alice Chen")
  avatarSrc?: string;
  invalid?: boolean;     // failed validate(); stays in the value so it's fixable
  disabled?: boolean;    // locked chip (e.g. the thread owner) — not removable
}
```

`uni-tag-input implements FormValueControl<UniTagItem[]>`. `{ value: 'a@b.com' }`
is a complete item, so the minimum an agent has to write is
`[value]="[{value:'a@b.com'}]"` — and the `email` preset fills `label`/avatar
from suggestions automatically.

Invalid entries stay **in** the value rather than being rejected. A field that
swallows a typo'd address is worse than one that shows it in red.

### API

```ts
// Signal Forms block (explicit, per AGENTS.md — not extracted to a base class)
value = model<UniTagItem[]>([]);
disabled = input(false); touched = model(false); invalid = input(false);
dirty = input(false); required = input(false); ariaDescribedBy = input<string>();

// Configuration
label       = input.required<string>();     // "To"
placeholder = input<string>();
preset      = input<'text' | 'email'>('text');   // wires validate + parse + separators
separators  = input<string[]>([',', ';']);       // keys that commit
commitOnBlur= input(true);
allowDuplicates = input(false);
max         = input<number>();
validate    = input<(raw: string) => boolean>();
parse       = input<(pasted: string) => string[]>();
tagVariant  = input<Variant>('primary');
tagTone     = input<TagTone>('soft');
tagSize     = input<Size>('md');

// Autocomplete (same contract as uni-search-input)
suggestions = input<UniTagSuggestion[]>([]);   // { value, label?, description?, avatarSrc? }
query       = output<string>();                // debounced; app refreshes suggestions
debounceTime= input(250);

// Events
added    = output<UniTagItem>();
removed  = output<UniTagItem>();
rejected = output<{ raw: string; reason: 'duplicate' | 'max' | 'invalid' }>();
```

The `email` preset sets:
`validate` → RFC-ish address check,
`parse` → split on `,` `;` newline/tab, unwrapping `Name <a@b.com>` and
`"Name" <a@b.com>`,
`separators` → `[',', ';', ' ']` (space is a separator only for emails, where
it can't appear inside a token).

### Layout

Chips **wrap**; the field grows in height. The text input is a flex child with
`min-width: 12ch` so it never collapses to a sliver, and `flex: 1` so clicking
the empty area to the right of the last chip lands in the input.

```
┌────────────────────────────────────────────────────┐
│ (A) Alice Chen ✕   (B) bob@ex.com ✕   carol@…      │  ← min-height 36, grows
└────────────────────────────────────────────────────┘
```

Chrome is `uni-input-box` with `height="auto"`, so error/disabled/focus states
come free and stay consistent with every other field.

> Collapse-when-blurred (`+3 more`) is deliberately **out of scope for v1** —
> it adds a second focus/measure cycle for a behaviour only mail clients want.
> Revisit as a `collapsible` input once the base field is stable.

### Keyboard map

**Focus is in the text input**

| Key | Behaviour |
|---|---|
| printable | filters suggestions, opens the listbox |
| `Enter` | commits the active suggestion if one is highlighted, else the typed text |
| `Tab` | commits typed text, then moves focus on (never traps) |
| `,` `;` (+ `Space` for `email`) | commits typed text |
| `ArrowDown` / `ArrowUp` | moves through suggestions (wraps) |
| `Backspace` (empty input) | focuses the last chip — does **not** delete it |
| `ArrowLeft` (caret at 0) | focuses the last chip |
| `Escape` | closes the listbox; if already closed, clears the typed text |
| paste | runs `parse()`, commits every token, keeps the tail in the input |
| blur | commits typed text when `commitOnBlur`, marks touched |

**Focus is on a chip.** The whole field is **one tab stop** — the text input.
Chips carry `tabindex="-1"` and are entered with `Backspace`/`ArrowLeft`, so
Tab never walks through eight recipients to reach the Send button. The ✕ is
`tabindex="-1"` too; the keyboard route to removal is Backspace/Delete on the
chip, advertised once through the field's `aria-describedby`.

| Key | Behaviour |
|---|---|
| `ArrowLeft` / `ArrowRight` | previous / next chip; Right past the last returns to the input |
| `Home` / `End` | first / last chip |
| `Backspace` | removes it, focus moves **left** (or to the input) |
| `Delete` | removes it, focus moves **right** (or to the input) |
| `Enter` / `F2` | edits: chip is lifted back into the input as text, caret at end |
| `Escape` | returns focus to the input |
| typing a printable char | returns focus to the input and inserts the character |

Two deletion keys with different focus outcomes is the detail that makes
bulk-pruning a recipient list feel right: hold Backspace to eat backwards,
hold Delete to eat forwards, without the cursor jumping.

Double-click on a chip is the pointer equivalent of `Enter` (edit); a single
click on the ✕ removes.

### ARIA contract

- The text input is `role="combobox"` with `aria-expanded`, `aria-controls`
  pointing at the listbox, and `aria-activedescendant` on the highlighted
  option — identical to `uni-search-input`, so the pattern is learned once.
- The chip set is a `<ul>`; each chip is an `<li>` whose body is a focusable
  `<button>` with `aria-describedby` → a visually hidden
  "Press Backspace to remove" hint rendered **once** per field.
- Every add/remove announces through a `role="status"` live region:
  *"Alice Chen added. 3 recipients."* / *"bob@ex.com removed. 2 recipients."*
  Without it, keyboard removal is silent.
- The field's accessible name is `label`; the count is part of the live
  region rather than the name, so the name doesn't churn on every edit.
- `showError()` gates `aria-invalid` on `invalid && (touched || dirty)`, per
  the library's form-control rule. Per-chip invalidity is independent and
  shows immediately — it's feedback about a token the user just typed.
- Rejections (duplicate / over max) also route to the live region, since the
  visual cue is a 400ms pulse a screen reader can't see.

### Theme entry

```ts
tagInput: {
  options: {
    chipGap: 'xs',
    chipSize: 'md',
    minInputWidth: '12ch',
    listColor: 'primary-surface',
    listShadow: 'menu',
    listBorderRadius: 'xs',
    maxSuggestions: 8,
  },
}
```

Field chrome (colour, border, radius, focus outline) is **not** duplicated
here — it comes from `input`, via `uni-input-box`.

---

---

## What the prototype already proves

`index.html` is behaviour-complete for everything above; `test.mjs`
(Playwright, `node test.mjs`) drives it headlessly and asserts 32 behaviours —
worth porting straight into the Vitest spec:

- commit via Enter / `,` / `;` / Space / Tab / blur, and label enrichment from
  the directory (typing `carol@uni.dev` yields a **Carol Nwosu** chip)
- duplicate and over-`max` rejection, with the existing chip pulsing
- listbox open/close, `aria-expanded`, `aria-activedescendant`, arrow-key
  traversal, Enter picking the highlighted option
- Backspace on an empty field **focuses** the last chip rather than deleting
  it blind; a second Backspace removes it and focus moves left
- Delete removes and focus moves right; Home/End; ArrowRight past the last
  chip returns to the input; a printable key on a chip resumes typing
- Enter/F2 lifts a chip back into the input as `Name <email>`
- paste of `Priya Raman <priya@uni.dev>, sam@uni.dev; nope@@x` → three chips,
  the malformed one flagged, an unterminated tail left in the field
- disabled chips render **no** remove button; Tab from the field skips chips

## Open questions

1. **`tone` as an input vs. more `Variant` values.** The spec adds a second
   axis; the alternative is variant names like `primary-outline`. The axis is
   cleaner but it's the first component with two style dimensions.
2. **Space as a separator** is on for `email` and off otherwise. Correct for
   addresses, wrong for people's names — worth confirming against the next
   use case (label pickers?).
3. **Suggestion filtering** lives in the app (component just renders what it's
   given, like `uni-search-input`). Cheap local filtering could be opt-in via
   `filterLocally` for the static-list case.
4. **`uni-tag-input` vs. combobox overlap** — the roadmap's "Combobox /
   autocomplete" item wants a form-bound object-option control. Multi-select
   combobox and tag input are ~80% the same widget; worth deciding now whether
   tag-input *is* the multi-select combobox.

## Checklist to ship (per `packages/angular/AGENTS.md`)

- [ ] `'tag'` + `'tagInput'` added to `ComponentName`; theme entries in `base.theme.ts`
- [ ] `tag.component.ts` rewrite + `tag.model.ts`; codemod for `close` → `removed`
- [ ] `tag-input/` component, model, barrel; export from `components/index.ts`
- [ ] Specs covering the keyboard map **and** the ARIA contract
- [ ] `.stories.ts` + `.mdx` (Overview / Usage / variations / Theme options / Accessibility / Do / Don't)
- [ ] `ACCESSIBILITY.md`: both keyboard maps
- [ ] `pnpm lint && pnpm test && pnpm build && pnpm docs:api`
