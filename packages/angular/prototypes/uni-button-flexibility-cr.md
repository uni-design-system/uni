# Uni: what must move alongside `Variant = keyof UniVariantRegistry`

**For:** Uni Design System dev team
**From:** Wellsourced (web app, Angular 21.2.12)
**Package:** `@uni-design-system/uni-angular@10.1.0`, `@uni-design-system/uni-core@10.1.0`
**Date:** 2026-09-01 · **Revision 2** — rewritten after Uni's response

Quoted from the installed 10.1.0 build. The MCP index still reports several components at v9.0.0 and was not used as a source.

---

## Revision note

Revision 1 asked for a third axis — a `tone` (`solid | hollow | ghost`) generalised from `uni-tag`, plus a per-instance `shape`. **That is withdrawn.** Uni's response is correct and this revision is built on it:

> Variants describe intent. It is the theme's job to describe the visual application of that intent.

The mistake in revision 1 was naming: `warnSolid` puts a **visual application** into a **semantic** slot. Once a variant says "solid", no theme can re-render that intent any other way — which defeats the point of loading a different theme. `solid`, `hollow` and `pill` are all answers to "how should this theme draw it", and they belong in the theme.

The combinatorial argument in revision 1 also answered the wrong question. It assumed names would be generated across axes. They are not: a design system *chooses* a small set of intents, and adding a colour does not imply adding an archetype. Two axes hold.

**What remains** is everything that has to change so unlimited variants actually work. With a closed 12-name union these were latent; with an open registry they become live defects.

---

## 1. The blocker: `Variant` is also a colour-token key

This is the one that must land with the registry, not after it.

```ts
// uni-core/dist/types/concepts/theme/theme.types.d.ts
export type TextColor = ContentColorToken | Variant;
```

```js
// UniToggleComponent — the variant name is resolved as a colour
accent = computed(() => this.checkedColor() ?? this.componentOptions().checkedColor ?? this.variant());
backgroundColor: this.getThemeColor(this.accent())

getThemeColor(token) {
    const colors = this.theme.colors();
    return colors[token] ? colors[token] : colors['primary'];   // silent fallback
}
```

**Ten sites across three form controls** resolve a variant this way:

| component | sites |
|---|---|
| `UniCheckboxComponent` | 5 |
| `UniRadioComponent` | 4 |
| `UniToggleComponent` | 1 |

Today this is safe only because every name in `Variant` happens to also be a colour token. Under intent naming that coincidence ends by design: `<uni-checkbox variant="destructive">` looks up `colors['destructive']`, misses, and **silently renders primary**. The consumer sees a wrong-coloured control with no error, no warning, and nothing to grep for.

**Ask:** separate the colour-role lookup from the archetype lookup. Either these controls take an explicit colour input (as `uni-toggle` already does with `checkedColor`, which is the right shape), or a variant's theme entry supplies the colour and the components stop treating the name as a token.

---

## 2. An unthemed variant fails silently

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

If a design system replaces the registry with its own intents and does not keep `ghost`, this branch is unreachable but still compiles. It is one occurrence, so the fix is small — but it is worth auditing for others before the registry ships, since every such literal is an assumption that uni's own names survive.

---

## 4. Extend versus replace

"Let a design system enforce its own rules" implies **replacing** the set, not only adding to it — otherwise uni's twelve defaults remain legal in every consuming app and the system cannot be enforced.

If a registry is replaced and `primary` or `disabled` is dropped, what happens to:

- `getThemeColor`'s fallback, which resolves `colors['primary']` **by name**;
- the `disabled` variant, which the base theme defines and components lean on for the disabled state?

**Ask:** state the contract. Either some names are reserved and always present (documented as such), or the internals stop referring to them by literal. Either answer is fine; silence is not, because a system that drops `primary` would fail in a way that looks like a theming bug.

---

## 5. Sizing — a question, not an ask

`Size` is closed in the same way `Variant` is today:

```ts
export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
```

Uni's response mentions "the flexibility of sizing them". If that means the existing seven t-shirt steps, that is workable — our theme already carries per-size `height`, `borderRadius`, `fontSize`, `padding` and `letterSpacing` for buttons. If a design system is expected to bring its own size ladder, `Size` needs the registry treatment too.

Worth an explicit decision either way, since a system with, say, `compact | default | roomy` cannot express that today.

---

## 6. Requested changes

1. **Decouple variant from colour lookup** in `uni-checkbox`, `uni-radio`, `uni-toggle` (10 sites) — blocking, must ship with the registry.
2. **Dev warning for an unthemed `component/variant` pair**, mirroring `resolveSpacing`.
3. **Audit hard-coded variant literals**; `UniIconButtonComponent`'s `variant() === 'ghost'` is the one found.
4. **Document the extend-versus-replace contract**, including which names (if any) are reserved.
5. **Decide whether `Size` follows `Variant`** into a registry.
6. **Docs:** `get-component` reports drawer and toggle at v9.0.0 against 10.1.0 installs, omits inherited `BaseComponent` inputs (`variant`, `size`), and the Drawer "Overlay" example renders `mode="side"`.

---

## 7. Acceptance criteria

1. A consumer registers `destructive`, themes it, and `<button text-button variant="destructive">` renders it — while `variant="destructve"` fails to compile.
2. `<uni-checkbox variant="destructive">` renders the themed colour, not a silent primary.
3. Registering a variant without a theme entry produces exactly one dev warning naming the component, the variant, and the variants the theme does define.
4. A consumer can replace the registry with its own intents, and the documented reserved names (if any) are the only uni names it must keep.
5. Omitting `variant` is byte-identical to 10.1.0 output for every existing consumer.

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
