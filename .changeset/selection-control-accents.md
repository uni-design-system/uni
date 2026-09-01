---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Checkbox, radio and toggle take their accent from the theme, not from the
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
