/**
 * The named size scale. Closed on purpose — it also types *component* sizes
 * (`uni-tag`, `uni-icon-button`, `BaseComponent`), where an arbitrary name has
 * nothing to resolve against.
 */
export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * A spacing token: the named scale, plus any extra key a theme defines in its
 * `spacing` map. The `(string & {})` arm keeps autocomplete on the seven names
 * while letting an app name the steps its design actually uses — real layouts
 * are not built exclusively on a doubling scale.
 *
 * The cost is that an unknown token no longer fails to compile; `ThemeService`
 * warns in dev when one misses the theme.
 */
export type NullableSize = Size | 'none' | (string & {});
export type OptionalSize = NullableSize | undefined;

export type AbsoluteSize =
  | 'xx-small'
  | 'x-small'
  | 'small'
  | 'medium'
  | 'large'
  | 'x-large'
  | 'xx-large'
  | 'xxx-large';
