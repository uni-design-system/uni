import type { NullableSize, Radius, Typeface, Variant } from '@uni-design-system/uni-core';
import type { UniDate, UniDateRange } from '../../cdk';

export type { UniDate, UniDateRange };

export type UniCalendarMode = 'single' | 'range';

/** What the calendar reads/writes: a date in `single` mode, a range in `range` mode. */
export type UniCalendarValue = UniDate | UniDateRange | undefined;

/**
 * An availability dot on a day, driven by app data — the scheduling pattern
 * is the first application. `label` extends the day's accessible name
 * (e.g. "3 slots open"); without it the dot is decoration only.
 */
export interface UniCalendarMarker {
  date: UniDate;
  /** Dot color role, default `'primary'`. */
  variant?: Variant;
  /** Screen-reader suffix appended to the day's name. */
  label?: string;
}

/**
 * Theme options for the `calendar` component entry. Selection/range/today
 * colours are deliberately not here — they are the `primary` role pair, so a
 * theme restyles them by restyling its palette.
 */
export interface UniCalendarOptions {
  /** `'max'` renders circles; `'xxs'` the square/GitHub-contributions look. */
  dayBorderRadius?: Radius;
  typeface?: Typeface;
  /** Grid gutter. */
  gap?: NullableSize;
  navPrevSymbol?: string;
  navNextSymbol?: string;
  /** Intl weekday column format. */
  weekdayFormat?: 'narrow' | 'short';
  /** Show the adjacent months' days, muted and non-interactive. */
  showOutsideDays?: boolean;
  /** How today is marked: 1px outline, or a dot under the number. */
  todayStyle?: 'outline' | 'dot';
}
