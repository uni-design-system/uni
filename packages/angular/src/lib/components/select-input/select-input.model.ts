import type { ColorKey } from '@uni-design-system/uni-core';
import type { IconName } from '../icon/icon.record';

/**
 * Theme options for `uni-select`. The box itself is `uni-input-box`'s; what
 * belongs to the select is the dropdown affordance, which until 11.0.0 was
 * hardcoded — `select` was declared in `ComponentName` with no theme entry
 * behind it, so a theme could not reach it at all.
 */
export interface UniSelectOptions {
  /** Glyph for the dropdown affordance. Defaults to `chevronDown`. */
  toggleIcon?: IconName;
  /** Ink for that glyph. Defaults to `on-background-variant`, as `uni-combobox`. */
  toggleColor?: ColorKey;
  /** Square size of the glyph in px. Defaults to 20, matching `uni-combobox`. */
  toggleSize?: number;
}
