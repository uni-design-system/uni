/**
 * Exact decimal arithmetic over canonical decimal strings, using scaled
 * `BigInt`s. No number library — `BigInt` is the platform's own exact integer
 * type, and every operation here is integer arithmetic with a remembered
 * decimal point.
 *
 * A **canonical decimal** is `/^-?\d+(\.\d+)?$/`: optional sign, digits, an
 * optional fraction, no grouping, no affix, no exponent. Everything in this
 * file takes and returns that shape.
 *
 * Why not floats, concretely:
 *
 * ```
 * 0.1 + 0.2                → 0.30000000000000004    // IEEE 754
 * scaled: 1n + 2n = 3n, ÷10 → '0.3'                  // here
 *
 * (1.15).toFixed(1)        → '1.1'   // 1.15 is really 1.1499999999999999,
 *                                    // so the platform breaks a tie that
 *                                    // does not exist in the decimal value
 * roundDecimal('1.15', 1)  → '1.2'   // what an invoice expects
 * ```
 *
 * The scale (fraction-digit count) is carried alongside the integer rather
 * than inferred, so `'1.50'` and `'1.5'` compare equal but a value's own
 * precision survives a round trip.
 */
import type { UniNumberClamp, UniNumberStepConfig, UniRoundingMode } from './number.model';

/** Canonical decimal, permitting a leading `+` and a bare `.5` / `5.` form. */
const CANONICAL = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/** `1.5e-7`, `1e21` — what `String(number)` produces outside 1e-7…1e21. */
const EXPONENTIAL = /^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/;

/** True when `text` is already a canonical decimal (leading/trailing space allowed). */
export const isCanonicalDecimal = (text: string): boolean => CANONICAL.test(text.trim());

/** Fraction-digit count. `'1.250'` → 3, `'12'` → 0, `'5.'` → 0. */
export const decimalScale = (value: string): number => {
  const point = value.indexOf('.');
  return point < 0 ? 0 : value.length - point - 1;
};

/**
 * Canonical decimal → integer scaled by `10^scale`. Fraction digits beyond
 * `scale` are truncated, so callers that must not lose them pass a `scale` at
 * least `decimalScale(value)`.
 */
export const toScaled = (value: string, scale: number): bigint => {
  let text = value.trim();
  const negative = text.startsWith('-');
  if (negative || text.startsWith('+')) text = text.slice(1);

  const [integer, fraction = ''] = text.split('.');
  const padded = (fraction + '0'.repeat(scale)).slice(0, scale);
  const digits = (integer + padded).replace(/^0+(?=\d)/, '');
  const scaled = BigInt(digits || '0');
  return negative ? -scaled : scaled;
};

/** Scaled integer → canonical decimal, with trailing fraction zeros trimmed. */
export const fromScaled = (scaled: bigint, scale: number): string => {
  const negative = scaled < 0n;
  let digits = (negative ? -scaled : scaled).toString();

  if (scale > 0) {
    digits = digits.padStart(scale + 1, '0');
    digits = `${digits.slice(0, -scale)}.${digits.slice(-scale)}`;
    // `0+$` stops at the point, so '10.00' loses only its fraction zeros.
    digits = digits.replace(/0+$/, '').replace(/\.$/, '');
  }

  if (digits === '' || digits === '0') return '0';
  return (negative ? '-' : '') + digits;
};

/**
 * Strip a leading `+`, leading zeros and trailing fraction zeros: `'+01.50'`
 * → `'1.5'`. Requires a canonical decimal; guard with `isCanonicalDecimal`.
 */
export const normalizeDecimal = (value: string): string => {
  const scale = decimalScale(value);
  return fromScaled(toScaled(value, scale), scale);
};

/**
 * Any numeric input → canonical decimal, expanding the exponential notation
 * `String(number)` produces outside 1e-7…1e21. A `step` of `1e-7` would
 * otherwise reach the arithmetic as the literal text `'1e-7'`.
 *
 * Throws on text that is not numeric at all — every caller here passes either
 * a `number` input or text already cleared by the parser.
 */
export const toDecimal = (value: number | string): string => {
  const text = String(value).trim();
  if (CANONICAL.test(text)) return normalizeDecimal(text);

  const match = EXPONENTIAL.exec(text);
  if (!match) throw new RangeError(`Not a decimal number: ${JSON.stringify(text)}`);

  const [, sign, integer, fraction = '', exponent] = match;
  const digits = integer + fraction;
  const point = integer.length + Number(exponent);

  let expanded: string;
  if (point <= 0) expanded = `0.${'0'.repeat(-point)}${digits}`;
  else if (point >= digits.length) expanded = digits + '0'.repeat(point - digits.length);
  else expanded = `${digits.slice(0, point)}.${digits.slice(point)}`;

  return normalizeDecimal((sign === '-' ? '-' : '') + expanded);
};

/** `-1` when `a < b`, `1` when `a > b`, `0` when equal. `'1.50'` equals `'1.5'`. */
export const compareDecimal = (a: string, b: string): -1 | 0 | 1 => {
  const scale = Math.max(decimalScale(a), decimalScale(b));
  const left = toScaled(a, scale);
  const right = toScaled(b, scale);
  return left < right ? -1 : left > right ? 1 : 0;
};

/**
 * Round to `fractionDigits`, breaking ties per `mode`. Exact where
 * `Number.prototype.toFixed` is not — see the file header.
 */
export const roundDecimal = (
  value: string,
  fractionDigits: number,
  mode: UniRoundingMode = 'half-up'
): string => {
  const digits = Math.max(0, Math.trunc(fractionDigits));
  const scale = decimalScale(value);
  if (scale <= digits) return normalizeDecimal(value);

  const scaled = toScaled(value, scale);
  const divisor = 10n ** BigInt(scale - digits);
  let quotient = scaled / divisor; // BigInt division truncates toward zero
  const remainder = scaled % divisor;
  if (remainder === 0n) return fromScaled(quotient, digits);

  const negative = scaled < 0n;
  const twiceRemainder = (remainder < 0n ? -remainder : remainder) * 2n;
  const away = () => {
    quotient += negative ? -1n : 1n;
  };

  switch (mode) {
    case 'trunc':
      break;
    case 'ceil':
      if (!negative) quotient += 1n;
      break;
    case 'floor':
      if (negative) quotient -= 1n;
      break;
    case 'half-even':
      if (twiceRemainder > divisor || (twiceRemainder === divisor && quotient % 2n !== 0n)) away();
      break;
    default: // half-up — a tie goes away from zero
      if (twiceRemainder >= divisor) away();
  }

  return fromScaled(quotient, digits);
};

/**
 * Multiply by `10^places`, exactly. Used for the percent preset's
 * fraction ⇄ display shift (`0.15` ⇄ `15`) and for deriving a default
 * large step of `step × 10` without touching a float.
 */
export const shiftDecimal = (value: string, places: number): string => {
  const currentScale = decimalScale(value);
  let scaled = toScaled(value, currentScale);
  let scale = currentScale - places;
  if (scale < 0) {
    scaled *= 10n ** BigInt(-scale);
    scale = 0;
  }
  return fromScaled(scaled, scale);
};

/**
 * Hold a value inside its fences, reporting which one it hit so the caller can
 * announce it. Clamping belongs on commit, never per keystroke: a `min=10`
 * field that clamps live can never be typed into, because the `1` becomes `10`
 * before the `5` arrives.
 */
export const clampDecimal = (
  value: string,
  min?: number | string,
  max?: number | string
): UniNumberClamp => {
  if (min != null && compareDecimal(value, toDecimal(min)) < 0) {
    return { value: toDecimal(min), hit: 'min' };
  }
  if (max != null && compareDecimal(value, toDecimal(max)) > 0) {
    return { value: toDecimal(max), hit: 'max' };
  }
  return { value, hit: null };
};

/**
 * One step from `current`, in `direction` (`1` up, `-1` down).
 *
 * Steps land on the grid `origin + n · step`, where `origin` is `min` by
 * default. A value that is *off* the grid snaps to the nearest grid point **in
 * the direction of travel** rather than jumping past it: with `min=5, step=10`
 * the grid is 5, 15, 25, and stepping up from 7 gives 15, not 17.
 *
 * Fences stop the value; they never wrap unless `wrap` is set and both bounds
 * are defined. Returns `current` unchanged when `step` is zero.
 */
export const stepDecimal = (
  current: string,
  direction: 1 | -1,
  config: UniNumberStepConfig = {}
): string => {
  const step = toDecimal(config.step ?? 1);
  const origin =
    config.stepOrigin === 'zero' || config.min == null ? '0' : toDecimal(config.min);

  // One shared scale keeps every term an exact integer.
  const scale = Math.max(
    decimalScale(current),
    decimalScale(step),
    decimalScale(origin),
    config.min == null ? 0 : decimalScale(toDecimal(config.min)),
    config.max == null ? 0 : decimalScale(toDecimal(config.max))
  );

  const stepBy = toScaled(step, scale);
  if (stepBy === 0n) return current;

  const value = toScaled(current, scale);
  const anchor = toScaled(origin, scale);

  let offset = (value - anchor) % stepBy;
  if (offset < 0n) offset += stepBy;

  let next: bigint;
  if (offset === 0n) next = value + (direction > 0 ? stepBy : -stepBy);
  else next = direction > 0 ? value + (stepBy - offset) : value - offset;

  const min = config.min == null ? null : toScaled(toDecimal(config.min), scale);
  const max = config.max == null ? null : toScaled(toDecimal(config.max), scale);

  if (config.wrap && min != null && max != null) {
    // The cycle includes one step past `max` so 23 → 0 rather than 23 → 23.
    const span = max - min + stepBy;
    let position = (next - min) % span;
    if (position < 0n) position += span;
    next = min + position;
  } else {
    if (max != null && next > max) next = max;
    if (min != null && next < min) next = min;
  }

  return fromScaled(next, scale);
};
