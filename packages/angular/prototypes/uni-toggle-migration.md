# Scope: retire `app-toggle` in favour of `uni-toggle`

**Status:** scoped, not started. 2026-08-31.
**Why:** `components/toggle/` is a roll-your-own switch (25-line component + 84 lines of CSS) standing in for a stable design-system component. The house rule is shared components over hand-rolled. Its own docstring justifies it on the Signal Forms `FormCheckboxControl` contract — `uni-toggle` satisfies that contract too, so the justification no longer holds.

---

## 1. Census — 26 call sites, 9 files

Counted with `grep -rnE "<app-toggle([^-]|$)"` (the `-row` wrapper matches a naive `\b` pattern, which inflates the count to 26).

| Shape | Count | Where |
|---|---|---|
| `<app-toggle-row>` | **15** in 7 files | project-edit-panel (2), project-client-invite-panel (2), project-share-access (1), settings/notifications-section, settings/rates-section, admin/verification-section, admin/tokens-section |
| `<app-toggle>` direct | **6** | `designer-panel.html` — 5× `size="md"`, 1× `size="sm"`, all `[checked]` + `(checkedChange)` |
| `<app-toggle>` direct | **5** | `project-presentations.html` — all `size="sm"`, all **`[formField]`** |

`app-toggle-row` hardcodes `size="md"` internally, so migrating that one wrapper covers 15 of the 26 sites.

**Sizes actually in use: `md` (20 sites) and `sm` (6).** The `lg` default (36×20) is used nowhere — dead code.

---

## 2. What blocks a straight swap

### 2a. `size` is bindable but inert (upstream)

`UniToggleComponent extends BaseComponent`, and `BaseComponent` declares `variant = input('primary')` and `size = input('lg')`. With `usesInheritance: true` those are real, bindable inputs on `uni-toggle`.

But `uni-toggle` never reads `this.size()`. Its geometry comes from the theme token:

```js
metrics = computed(() => {
    const toggleSize = this.componentOptions().size || 20;
    const sliderSize = toggleSize * 0.8;
    return { toggleSize, toggleWidth: toggleSize * 2, sliderSize,
             sliderOffset: (toggleSize - sliderSize) / 2 };
});
```

So `<uni-toggle size="sm">` compiles, looks intentional, and does nothing. **We need two sizes and the component offers one global token.**

### 2b. Geometry is hardcoded ratios (upstream)

Width is always `size × 2` and the knob always `size × 0.8`. The app's switch is proportioned differently:

| | track | knob | knob ÷ height | width ÷ height |
|---|---|---|---|---|
| `app-toggle` md (20 sites) | 32×18 | 12 | 0.67 | 1.78 |
| `app-toggle` sm (6 sites) | 28×16 | 10 | 0.63 | 1.75 |
| `uni-toggle` @ size 18 | 36×18 | 14.4 | 0.80 | 2.00 |
| `uni-toggle` @ size 20 (today's default) | 40×20 | 16 | 0.80 | 2.00 |

Setting `toggle.behavior.size: 18` matches the height and nothing else — the track runs 4px wider and the knob is visibly chunkier. There is no token for either ratio.

### 2c. The checked colour has no theme home (upstream)

The checked track reads `getThemeColor(this.variant())`, and `variant` defaults to `'primary'` (#2C3E35). The app's switch checks to `--c-success` **#3A5F43**.

`variant="success"` resolves to the app palette's `success: '#3A5F43'` — an exact match — but it would have to be repeated on all 26 call sites. There is no `toggle.behavior.checkedColor`, which is where a default of this kind belongs.

### 2d. Docs don't list inherited inputs

`get-component toggle` reports 8 inputs and omits `variant` and `size` entirely, because they come from `BaseComponent`. `variant` is the one knob that makes this migration viable, and it reads as unavailable.

---

## 3. Requested Uni changes

Small, and consistent with the drawer work — defaults at the theme component options, per-instance inputs only as overrides.

1. **Honour `size`.** Map `sm | md | lg` through the theme the way buttons already do via `componentStyle(name, variant, size)`, so `toggle.behavior` can carry a size scale rather than one number. Alternative if that is unwanted: drop the inherited `size` input from `uni-toggle` so it cannot mislead.
2. **Token the proportions.** `toggle.behavior.trackRatio` (currently hardcoded 2) and `knobRatio` (0.8), so an existing design can be matched rather than replaced.
3. **`toggle.behavior.checkedColor`**, defaulting to `variant`, so the on-state is a studio-wide default instead of an attribute repeated 26 times.
4. **Docs:** have `get-component` list inherited `BaseComponent` inputs, or note them. Same class of gap as the drawer's missing `mode="over"` example.

Without (1) the app must standardise on a single switch size. Without (2) the switch changes shape everywhere. Both are survivable; (3) is convenience; (4) is documentation.

---

## 4. App-side work, once the above lands

1. **`app.theme.ts` — add `toggle:` options.** There are none today, so `uni-toggle` currently renders on Uni's defaults. Set `size`, `trackColor`, `knobColor`, `checkedColor` to reproduce the current look. Note the off-track is currently a hardcoded `rgba(26, 26, 26, 0.12)`; the palette already has `surfaceVariant: '#EDEDEA'` commented as *"Warm gray fill: skeletons, slider & toggle tracks"*, so this migration also moves the track onto the token it was always meant to use — a small, deliberate colour change.
2. **`components/toggle-row/toggle-row.ts`** — swap its inner `app-toggle` for `uni-toggle`. This is the whole job for 15 of 26 sites. Keep toggle-row's own label + description markup; `uni-toggle`'s `label` input renders a single trailing label and cannot express the two-line row.
3. **`designer-panel.html`** — 6 direct sites, mechanical (`[checked]` / `(checkedChange)` are identical on both). One carries `[title]`, a plain attribute, unaffected.
4. **`project-presentations.html`** — 5 direct sites on `[formField]`. Highest-risk group; see verification.
5. **Delete `components/toggle/`** — component, template, and 84 lines of CSS.

Migration order matters: theme options first, then toggle-row, then the direct sites, then delete. Each step is independently shippable and visually checkable.

---

## 5. Verification

1. **`[formField]` on `uni-toggle`.** The 5 presentation sites bind Signal Forms directly. `uni-toggle` exposes `checked` and `touched` as models plus `invalid`/`dirty`/`required` inputs, which is the `FormCheckboxControl` shape — but its doc comment says *"synced by the Signal Forms `[field]` directive"* while this app binds `[formField]`. Confirm on one control before converting the rest; if it does not bind, this group stays on a wrapper and the scope shrinks to 21 sites.
2. **Side-by-side at each size.** Screenshot before/after for md and sm. The Share tab is the sharpest test: its rows sit directly beneath two other toggle rows in the same panel, so any proportion drift shows immediately.
3. **Disabled state.** `app-toggle` dims the track to `opacity: 0.5`; `uni-toggle` dims the whole label to `0.6` and swaps the track to the `disabled` colour. The locked rows in the Share tab are the visible case.
4. **Focus ring.** `uni-toggle` adds `theme.focusRingStyle(...)` keyed off the hidden input, which `app-toggle` has no equivalent for — a genuine accessibility gain, but check it against the panel background.
5. `pnpm --filter wellsourced-web build` — plain `tsc` will not catch template binding errors.

---

## 6. Size of the job

Roughly a half-day on the app side once the Uni changes land: one theme block, one wrapper, 11 direct call sites, one deletion, plus the visual pass at two sizes. The Uni changes are four small ones, three of them token plumbing.

The 5 `[formField]` sites are the only real unknown. Everything else is mechanical.

**Not worth doing piecemeal.** Migrating a few call sites leaves two switch designs side by side in the same panels — which is precisely the inconsistency this is meant to remove.
