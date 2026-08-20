/**
 * Canonical date/time value shapes shared by `uni-calendar`,
 * `uni-date-input`, `uni-time-input` and `uni-date-time-input`.
 *
 * Plain ISO strings, never `Date`s: a calendar date is a label on a wall
 * calendar, not an instant. `new Date('2026-08-20')` is midnight UTC — which
 * is 19 Aug in Honolulu — the classic off-by-one every `Date`-valued picker
 * ships. Strings are timezone-free, JSON-serializable and sortable with `<`.
 * Zoned scheduling is the app's concern; these components never touch
 * `Date.getTimezoneOffset()`.
 */

/** A calendar date, `'YYYY-MM-DD'`. */
export type UniDate = string;

/** A wall-clock time, `'HH:mm'` (24-hour). Display format is separate. */
export type UniTime = string;

/** A combined date and time, `'YYYY-MM-DDTHH:mm'`. */
export type UniDateTime = string;

/** A start–end date range. Both ends are inclusive. */
export interface UniDateRange {
  start?: UniDate;
  end?: UniDate;
}
