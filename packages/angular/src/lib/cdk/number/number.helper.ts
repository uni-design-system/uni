/**
 * Locale-aware number parsing and formatting, on top of the exact arithmetic
 * in `decimal.helper.ts`. `Intl.NumberFormat` supplies both directions —
 * separators, currency placement and digit systems all come from the locale
 * and none of them is hardcoded per language. No number library.
 *
 * The reason this exists rather than `<input type="number">`: per the HTML
 * value sanitization algorithm, a number input whose text is not a valid
 * floating-point number reports `value === ''`. Type `12,50` as most of Europe
 * does, or paste `1,234.56` from a spreadsheet, and the app reads an empty
 * field with no way to tell that from a blank one.
 */
import { memoize } from '../helpers/memoize.helper';
import {
  decimalScale,
  isCanonicalDecimal,
  normalizeDecimal,
  roundDecimal,
  shiftDecimal,
  toDecimal,
} from './decimal.helper';
import type {
  UniLocaleNumberParts,
  UniNumberFormatConfig,
  UniNumberParseResult,
  UniResolvedNumberFormat,
} from './number.model';

/** Preset defaults. `null` decimals means "ask `Intl` about the currency". */
const PRESETS = {
  decimal: { decimals: [0, 3] as [number, number], grouping: 'min2', inputMode: 'decimal' },
  integer: { decimals: [0, 0] as [number, number], grouping: 'min2', inputMode: 'numeric' },
  currency: { decimals: null, grouping: 'always', inputMode: 'decimal' },
  percent: { decimals: [0, 2] as [number, number], grouping: 'min2', inputMode: 'decimal' },
} as const;

/**
 * First code point of each localized digit run we map back to ASCII:
 * Arabic-Indic, Extended Arabic-Indic (Persian/Urdu), Devanagari, Bengali,
 * Thai. Anything outside these still parses in its ASCII form.
 */
const DIGIT_ZEROS = [0x0660, 0x06f0, 0x0966, 0x09e6, 0x0e50];

/** Arabic decimal separator and thousands separator. */
const ARABIC_DECIMAL = '٫';
const ARABIC_GROUP = '٬';

/**
 * Locale separators plus, when a currency is given, its symbol, side and
 * fraction digits. Memoized: constructing an `Intl.NumberFormat` is expensive
 * and a field re-resolves this on every keystroke.
 */
export const localeNumberParts = memoize(
  (locale: string, currency?: string): UniLocaleNumberParts => {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = parts.find((part) => part.type === 'group')?.value ?? ',';
    const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';

    if (!currency) {
      return {
        group,
        decimal,
        currencySymbol: '',
        currencyLeading: true,
        currencyDecimals: 2,
      };
    }

    const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    const currencyParts = formatter.formatToParts(1);
    const symbolIndex = currencyParts.findIndex((part) => part.type === 'currency');
    const integerIndex = currencyParts.findIndex((part) => part.type === 'integer');

    return {
      group,
      decimal,
      currencySymbol: currencyParts[symbolIndex]?.value ?? '',
      currencyLeading: symbolIndex < integerIndex,
      currencyDecimals: formatter.resolvedOptions().maximumFractionDigits ?? 2,
    };
  }
);

/**
 * Map localized digits and Arabic separators to ASCII, so `١٢٣٤٫٥` parses in
 * `ar` and `१२३४.५` in `hi`.
 */
export const toAsciiDigits = (text: string): string => {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const zero = DIGIT_ZEROS.find((start) => code >= start && code <= start + 9);
    if (zero != null) out += String(code - zero);
    else if (char === ARABIC_DECIMAL) out += '.';
    else if (char === ARABIC_GROUP) continue;
    else out += char;
  }
  return out;
};

/**
 * Evaluate `+ − × ÷ ( )` over decimal literals — shunting-yard, roughly thirty
 * lines, and **never `eval`**. Returns a canonical decimal, or `null` when the
 * text is not a well-formed expression.
 *
 * Floats are acceptable here in a way they are not elsewhere: this is a
 * convenience path for spreadsheet muscle memory (`12*3`, `100/4+5`), and the
 * result is settled to ten decimals before re-entering exact arithmetic.
 * Division is the only operation that can produce a non-terminating decimal,
 * and no exact representation would help there either.
 */
export const evaluateExpression = (text: string): string | null => {
  const source = text.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!/^[\d.\s+\-*/()]+$/.test(source)) return null;
  // A bare number is not an expression — it belongs on the ordinary path.
  if (!/[\d)]\s*[+\-*/]\s*[\d(.]/.test(source) && !source.includes('(')) return null;

  const tokens = source.match(/\d+\.?\d*|\.\d+|[+\-*/()]/g);
  if (!tokens) return null;

  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output: (number | string)[] = [];
  const operators: string[] = [];
  let previous: string | null = null;

  for (const token of tokens) {
    if (/^[\d.]/.test(token)) {
      output.push(Number(token));
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop() as string);
      }
      if (!operators.length) return null;
      operators.pop();
    } else {
      // Unary minus: push an implicit 0 so `-3` and `(2+-3)` both work.
      if (token === '-' && (previous === null || previous in precedence || previous === '(')) {
        output.push(0);
      }
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop() as string);
      }
      operators.push(token);
    }
    previous = token;
  }

  while (operators.length) {
    const operator = operators.pop() as string;
    if (operator === '(') return null;
    output.push(operator);
  }

  const stack: number[] = [];
  for (const token of output) {
    if (typeof token === 'number') {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) return null;
    stack.push(
      token === '+'
        ? left + right
        : token === '-'
          ? left - right
          : token === '*'
            ? left * right
            : left / right
    );
  }

  if (stack.length !== 1 || !Number.isFinite(stack[0])) return null;
  return normalizeDecimal(Number(stack[0].toFixed(10)).toString());
};

/** Fill in every preset, locale and currency default. */
export const resolveNumberFormat = (
  config: UniNumberFormatConfig = {}
): UniResolvedNumberFormat => {
  const presetName = config.currency ? 'currency' : (config.preset ?? 'decimal');
  const preset = PRESETS[presetName];
  const locale = config.locale || 'en-US';
  const parts = localeNumberParts(locale, config.currency);

  const [minimumFractionDigits, maximumFractionDigits] = Array.isArray(config.decimals)
    ? config.decimals
    : config.decimals != null
      ? [config.decimals, config.decimals]
      : (preset.decimals ?? [parts.currencyDecimals, parts.currencyDecimals]);

  const isPercent = presetName === 'percent';
  const isInteger = presetName === 'integer';

  // Adornments live outside the editable text, so the caret never walks over
  // them and `prefix`/`suffix` can be any string without becoming parseable.
  const prefix = config.prefix || (config.currency && parts.currencyLeading ? parts.currencySymbol : '');
  const suffix =
    config.suffix ||
    (config.currency && !parts.currencyLeading ? parts.currencySymbol : '') ||
    (isPercent ? '%' : '');

  return {
    locale,
    parts,
    prefix,
    suffix,
    minimumFractionDigits,
    maximumFractionDigits,
    grouping: config.grouping !== undefined ? config.grouping : (preset.grouping as never),
    compact: config.numberFormat?.notation === 'compact',
    isInteger,
    shift: config.valueIsFraction ? 2 : 0,
    roundingMode: config.roundingMode ?? 'half-up',
    inputMode: isInteger && (config.min == null || config.min < 0) ? 'decimal' : preset.inputMode,
    unitAnnouncement: config.unitAnnouncement,
  };
};

/**
 * Read a user's text into a canonical decimal in **model units**.
 *
 * Accepted, in order: canonical/ASCII (always, whatever the locale — it is
 * what agents and APIs write), locale-grouped, affixed, localized digits,
 * compact (`1.5k`), accounting negatives (`(1,234.56)` → `-1234.56`), and
 * expressions when `allowExpressions` is set.
 */
export const parseNumber = (
  raw: string,
  format: UniResolvedNumberFormat,
  options: { allowExpressions?: boolean; currency?: string } = {}
): UniNumberParseResult => {
  const original = toAsciiDigits(String(raw)).trim();
  if (original === '') return { status: 'empty' };

  let text = original;
  const { prefix, suffix, parts } = format;

  // People paste from spreadsheets: strip this field's own affixes, the
  // currency symbol and code, and any stray percent sign.
  if (prefix) text = text.split(prefix).join('');
  if (suffix) text = text.split(suffix).join('');
  if (options.currency) {
    text = text.split(parts.currencySymbol).join('');
    text = text.replace(new RegExp(options.currency, 'i'), '');
  }
  text = text.replace(/%/g, '');
  // `\s` covers NBSP and the narrow/thin spaces a French copy-paste carries.
  text = text.replace(/\s/g, '');
  if (text === '') return { status: 'error', reason: 'unparseable' };

  // Finance types parentheses for a negative; refusing them is a papercut.
  let negative = false;
  const accounting = /^\((.+)\)$/.exec(text);
  if (accounting) {
    negative = true;
    text = accounting[1];
  }

  let magnitude = 0;
  if (format.compact) {
    const compact = /^(.+?)([kKmMbB])$/.exec(text);
    if (compact) {
      text = compact[1];
      magnitude = { k: 3, m: 6, b: 9 }[compact[2].toLowerCase() as 'k' | 'm' | 'b'];
    }
  }

  let canonical: string | null = null;
  if (isCanonicalDecimal(text)) {
    canonical = text;
  } else {
    const degrouped = text.split(parts.group).join('').split(parts.decimal).join('.');
    if (isCanonicalDecimal(degrouped)) {
      canonical = degrouped;
    } else if (options.allowExpressions) {
      // Evaluate the ORIGINAL text: parentheses here are grouping, not the
      // accounting negative stripped above.
      const evaluated = evaluateExpression(original);
      if (evaluated != null) {
        return { status: 'ok', value: shiftDecimal(evaluated, -format.shift), viaExpression: true };
      }
    }
  }

  if (canonical == null) return { status: 'error', reason: 'unparseable' };

  canonical = normalizeDecimal(canonical);
  if (magnitude) canonical = shiftDecimal(canonical, magnitude);
  if (negative && !canonical.startsWith('-') && canonical !== '0') canonical = `-${canonical}`;
  if (format.isInteger && decimalScale(canonical) > 0) {
    return { status: 'error', reason: 'not-integer' };
  }

  return { status: 'ok', value: shiftDecimal(canonical, -format.shift), viaExpression: false };
};

/** Insert the locale's group separator every three integer digits. */
const applyGrouping = (integer: string, separator: string): string =>
  integer.replace(/\B(?=(\d{3})+(?!\d))/g, () => separator);

/**
 * Canonical decimal (model units) → the display number, without affixes.
 *
 * `min2` grouping — the default — starts at five integer digits, so a year
 * renders `2026` rather than `2,026` while a price still renders `10,000`.
 */
export const formatNumber = (canonical: string, format: UniResolvedNumberFormat): string => {
  const display = shiftDecimal(canonical, format.shift);

  if (format.compact) {
    return new Intl.NumberFormat(format.locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(Number(display));
  }

  const rounded = roundDecimal(display, format.maximumFractionDigits, format.roundingMode);
  const negative = rounded.startsWith('-');
  const [integerPart, fractionPart = ''] = (negative ? rounded.slice(1) : rounded).split('.');
  const fraction = fractionPart.padEnd(format.minimumFractionDigits, '0');

  const grouped =
    format.grouping === false
      ? integerPart
      : format.grouping === 'min2'
        ? integerPart.length > 4
          ? applyGrouping(integerPart, format.parts.group)
          : integerPart
        : integerPart.length > 3
          ? applyGrouping(integerPart, format.parts.group)
          : integerPart;

  return (
    (negative ? '-' : '') + grouped + (fraction ? format.parts.decimal + fraction : '')
  );
};

/**
 * The plain text the field shows while focused: the display number with no
 * grouping and no affixes, so the caret never has to walk over a separator
 * that appears and vanishes mid-word.
 */
export const rawNumberText = (canonical: string, format: UniResolvedNumberFormat): string =>
  roundDecimal(shiftDecimal(canonical, format.shift), format.maximumFractionDigits, format.roundingMode);

/** Round a committed value to the field's precision, in model units. */
export const settleNumber = (canonical: string, format: UniResolvedNumberFormat): string =>
  shiftDecimal(rawNumberText(canonical, format), -format.shift);

/**
 * The `aria-valuetext` string: the formatted number with its affixes spoken.
 * `aria-valuenow` alone announces "1234.56", which is the one thing about a
 * money field that is not the point. An empty field says "Empty" per APG.
 */
export const speakNumber = (
  canonical: string | null,
  format: UniResolvedNumberFormat,
  emptyText = 'Empty'
): string => {
  if (canonical == null) return emptyText;
  const number = formatNumber(canonical, format);
  const unit = format.unitAnnouncement || format.suffix;
  const spoken = unit ? (unit === '%' ? ' percent' : ` ${unit}`) : '';
  return format.prefix + number + spoken;
};

/** Model-units canonical decimal → the bound `number`. */
export const toNumber = (canonical: string): number => Number(canonical);

/**
 * True when a value cannot survive the trip through `number` — the reason the
 * components also expose an exact `valueAsString` model, and the trigger for
 * the dev-mode warning. Silent precision loss is the whole point of that
 * second model, so it is worth saying out loud once.
 *
 * A `number` can only be checked for magnitude, since it has already lost
 * whatever it was going to lose. A canonical string can be checked properly:
 * `'9007199254740993'` comes back as `'9007199254740992'`.
 */
export const losesPrecision = (value: number | string): boolean => {
  if (typeof value === 'number') {
    return !Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER;
  }
  const canonical = toDecimal(value);
  const projected = Number(canonical);
  return !Number.isFinite(projected) || String(projected) !== canonical;
};
