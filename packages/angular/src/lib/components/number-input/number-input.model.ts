import type { ColorKey, IconName, NullableSize } from '@uni-design-system/uni-core';
import type { UniNumberRejectReason } from '../../cdk';

/**
 * Where the stepper buttons sit.
 *
 * `stacked` is the dense desktop default; `split` (− … +) is the touch and
 * quantity language; `trailing` puts − and + together at the end; `none` hides
 * them, leaving the arrow keys as the only step route.
 */
export type UniStepperLayout = 'stacked' | 'split' | 'trailing' | 'none';

/** A refused commit. The raw text stays in the field rather than being dropped. */
export interface UniNumberRejection {
  raw: string;
  reason: UniNumberRejectReason;
}

/** A committed step, for callers that need to distinguish it from typing. */
export interface UniNumberStepped {
  from: number | null;
  to: number;
  /** The signed amount applied, e.g. `-10` for a large step down. */
  by: number;
}

/**
 * Theme-level options for `uni-number-input`.
 *
 * Field chrome — colour, border, radius, focus outline — is **not** duplicated
 * here. It comes from the shared `input` options via `uni-input-box`, exactly
 * like tag-input, date-input and combobox, so a number field restyles with
 * every other field.
 */
export interface UniNumberInputOptions {
  stepperLayout?: UniStepperLayout;
  /** Glyph for the `+` button in the split and trailing layouts. */
  incrementIcon?: IconName;
  /** Glyph for the `−` button in the split and trailing layouts. */
  decrementIcon?: IconName;
  /** Glyph for the upper arrow in the stacked layout. */
  stepUpIcon?: IconName;
  /** Glyph for the lower arrow in the stacked layout. */
  stepDownIcon?: IconName;
  /** Width of a stepper column in px. */
  stepperWidth?: number;
  /** Minimum pointer target for a stepper button, in px — WCAG 2.2 SC 2.5.8. */
  minTouchTarget?: number;
  /** Colour of the prefix/suffix adornments. */
  affixColor?: ColorKey;
  /** Space between an adornment and the editable text. */
  affixGap?: NullableSize;
  /** Default text alignment; the `align` input overrides it per instance. */
  align?: 'start' | 'end' | 'center';
  /** `font-variant-numeric: tabular-nums`, so held stepping does not jitter. */
  tabularNumerals?: boolean;
  /** Hold this long before the stepper starts repeating. */
  repeatDelayMs?: number;
  /** Repeat period once it starts. */
  repeatIntervalMs?: number;
  /** Repeat period at full speed. */
  repeatFastIntervalMs?: number;
  /** Hold this long before the repeat begins accelerating. */
  repeatRampMs?: number;
}
