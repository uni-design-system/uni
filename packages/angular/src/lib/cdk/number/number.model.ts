/**
 * Canonical numeric value shapes shared by `uni-number-input`,
 * `uni-quantity-stepper`, `uni-number-range-input` and `uni-slider`.
 *
 * The components' internal source of truth is a **canonical decimal string** —
 * optional sign, digits, an optional `.`, no grouping and no affix:
 * `'-1234.56'`. The bound `number` is its projection, emitted on commit.
 *
 * Nothing numeric passes through a float, because floats give wrong answers to
 * questions people ask of money: `0.1 + 0.2` is `0.30000000000000004`, and
 * `(1.15).toFixed(1)` is `'1.1'` — 1.15 is really 1.1499999999999999, so the
 * platform rounds a tie that isn't there. See `decimal.helper.ts`.
 */

/** A start–end numeric range. Either end alone is a valid value. */
export interface UniNumberRange {
  start?: number;
  end?: number;
}

/**
 * How a tie is resolved when rounding to a fraction-digit count.
 *
 * `half-up` is the invoice default (ties away from zero: `1.15` → `1.2`);
 * `half-even` is banker's rounding, which removes the upward bias across a
 * column of figures (`1.25` → `1.2`, `1.35` → `1.4`).
 */
export type UniRoundingMode = 'half-up' | 'half-even' | 'ceil' | 'floor' | 'trunc';

/** Format archetype. Supplies decimals, grouping, affix and `inputmode`. */
export type UniNumberPreset = 'decimal' | 'integer' | 'currency' | 'percent';

/**
 * Thousands-separator policy, mapped onto `Intl`'s `useGrouping`.
 *
 * `min2` — the default — groups only from five integer digits, so a year
 * renders `2026` rather than `2,026` while a price still renders `10,000`.
 */
export type UniNumberGrouping = 'auto' | 'always' | 'min2' | false;

/** Why a typed commit was refused. The raw text stays in the field. */
export type UniNumberRejectReason =
  | 'unparseable'
  | 'min'
  | 'max'
  | 'step'
  | 'precision'
  | 'not-integer';

/** Fences and snap grid for `stepDecimal`. */
export interface UniNumberStepConfig {
  /** Grid spacing. Steps land on `origin + n · step`. Default `1`. */
  step?: number | string;
  min?: number | string;
  max?: number | string;
  /**
   * Snap-grid anchor. `'min'` matches the platform's `<input type="number">`
   * (a field with `min=5, step=10` steps 5 → 15 → 25); `'zero'` anchors the
   * grid at 0 regardless of the fence.
   */
  stepOrigin?: 'min' | 'zero';
  /**
   * Cycle past a fence instead of stopping at it — for genuinely cyclic
   * fields only (23 → 0 hours, 359 → 0 degrees). Needs both `min` and `max`.
   */
  wrap?: boolean;
}

/** The outcome of clamping a value to its fences. */
export interface UniNumberClamp {
  /** The clamped canonical decimal. */
  value: string;
  /** Which fence was hit, or `null` when the value was already in range. */
  hit: 'min' | 'max' | null;
}

/**
 * Separators, currency placement and fraction digits read out of `Intl` for a
 * locale. Nothing here is hardcoded per language — `1.234,56` is German input,
 * not malformed input, and only the locale knows that.
 */
export interface UniLocaleNumberParts {
  /** Thousands separator: `','` (en), `'.'` (de), a narrow no-break space (fr). */
  group: string;
  /** Decimal separator: `'.'` (en), `','` (de). */
  decimal: string;
  /** Currency symbol, when a currency was given: `'$'`, `'€'`, `'¥'`. */
  currencySymbol: string;
  /** True when the locale writes the symbol before the number. */
  currencyLeading: boolean;
  /** Fraction digits `Intl` uses for the currency — JPY 0, USD 2. */
  currencyDecimals: number;
}

/**
 * What a component knows about its own formatting, before resolution. Mirrors
 * the component inputs so a control can forward its signals almost verbatim.
 */
export interface UniNumberFormatConfig {
  preset?: UniNumberPreset;
  /** ISO 4217 code, e.g. `'USD'`. Implies the `currency` preset. */
  currency?: string;
  /** BCP 47 tag. Defaults to `'en-US'`; components pass the document's. */
  locale?: string;
  /** Fixed fraction digits, or `[min, max]`. Overrides the preset. */
  decimals?: number | [min: number, max: number];
  grouping?: UniNumberGrouping;
  /** Static adornment, rendered outside the editable text. */
  prefix?: string;
  suffix?: string;
  roundingMode?: UniRoundingMode;
  /**
   * The model is a fraction: `0.15` displays as `15`. Without it, a percent
   * field displays `15` for `15` and never divides behind the user's back.
   */
  valueIsFraction?: boolean;
  /** Escape hatch, merged over the preset. Only `notation` is read today. */
  numberFormat?: Intl.NumberFormatOptions;
  /** Read only to decide `inputmode` — a field that can go negative needs `-`. */
  min?: number;
  /** Spoken long form of an abbreviated suffix, for `aria-valuetext`. */
  unitAnnouncement?: string;
}

/** A format config with every preset and locale default filled in. */
export interface UniResolvedNumberFormat {
  locale: string;
  parts: UniLocaleNumberParts;
  prefix: string;
  suffix: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
  grouping: UniNumberGrouping;
  /** `1.5k` in, `1.5K` out. */
  compact: boolean;
  /** Fraction entry is refused outright rather than rounded away. */
  isInteger: boolean;
  /** Display value is the model value × `10^shift`. */
  shift: number;
  roundingMode: UniRoundingMode;
  /** `numeric` only when negatives and decimals are both impossible. */
  inputMode: 'decimal' | 'numeric';
  unitAnnouncement?: string;
}

/**
 * The outcome of reading a user's text. Refused text is never swallowed: the
 * caller keeps it in the field and flags it, so nobody loses their work to a
 * silently emptied box.
 */
export type UniNumberParseResult =
  | { status: 'empty' }
  | { status: 'ok'; value: string; viaExpression: boolean }
  | { status: 'error'; reason: UniNumberRejectReason };
