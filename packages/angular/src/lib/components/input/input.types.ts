/**
 * The text-like native input types `uni-input` supports.
 *
 * Deliberately not the full native list: `checkbox`, `radio`, `file`, `range`,
 * `color`, `submit` and `hidden` are not text-like — they break both the
 * `uni-input-box` chrome and the `FormValueControl<string>` value contract —
 * and `date` / `time` / `datetime-local` have dedicated components
 * (`uni-date-input`, `uni-time-input`, `uni-date-time-input`) that handle
 * locale parsing and keyboard interaction properly.
 */
export type UniInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

/** Values for the native `inputmode` hint, which picks the on-screen keyboard. */
export type UniInputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';
