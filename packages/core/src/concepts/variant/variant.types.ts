/**
 * The set of variant names, as an open registry.
 *
 * A variant names an *intent* — what an action means — and it is the theme's job
 * to describe the visual application of that intent. So the set cannot be Uni's
 * to fix: a design system needs its own vocabulary (`destructive`, `subtle`,
 * `info`), not a translation layer onto ours.
 *
 * Declared as an interface rather than a union so consumers can extend it by
 * declaration merging:
 *
 * ```ts
 * declare module '@uni-design-system/uni-core' {
 *   interface UniVariantRegistry {
 *     destructive: true;
 *     subtle: true;
 *   }
 * }
 * ```
 *
 * That buys what an open union like {@link NullableSize}'s `(string & {})`
 * cannot: `variant="destructive"` compiles once registered, and a typo like
 * `variant="destructve"` still fails. It also keeps autocomplete on the theme's
 * `variants` map, which a `string` arm would collapse.
 *
 * **The registry extends; it cannot replace.** Declaration merging has no way to
 * remove a member, so Uni's names stay legal in every consuming app. Enforcing a
 * closed house set is a lint concern, not a type one.
 *
 * **Two names are reserved** and must remain present:
 * - `primary` — every component inherits it as its default variant.
 * - `disabled` — the disabled state resolves to it (`uni-tag` swaps to it
 *   wholesale; `uni-button` and `uni-icon-button` read its style block).
 */
export interface UniVariantRegistry {
  ghost: true;
  primary: true;
  secondary: true;
  tertiary: true;
  quaternary: true;
  warn: true;
  success: true;
  disabled: true;
  light: true;
  onLight: true;
  dark: true;
  onDark: true;
}

/** A style archetype's name. Open — see {@link UniVariantRegistry}. */
export type Variant = keyof UniVariantRegistry;
