---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

`Variant` is an open registry: a design system can define its own intents.

A variant names *what an action means*, and it is the theme's job to describe
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

Only the type was ever closed: theme validation checks the *shape* of a
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
