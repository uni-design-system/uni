/**
 * The parse table and format pipeline. These are the cases the platform's
 * `<input type="number">` gets wrong — European grouping, pasted affixes,
 * accounting negatives, localized digits — so each is asserted explicitly.
 */
import {
  evaluateExpression,
  formatNumber,
  localeNumberParts,
  losesPrecision,
  parseNumber,
  rawNumberText,
  resolveNumberFormat,
  settleNumber,
  speakNumber,
  toAsciiDigits,
} from './number.helper';

/** Parse helper — the components always pass a resolved format. */
const parse = (raw: string, config = {}, options = {}) =>
  parseNumber(raw, resolveNumberFormat({ locale: 'en-US', ...config }), options);

const format = (canonical: string, config = {}) =>
  formatNumber(canonical, resolveNumberFormat({ locale: 'en-US', ...config }));

describe('number helpers', () => {
  describe('localeNumberParts', () => {
    it('reads separators out of the locale', () => {
      expect(localeNumberParts('en-US')).toMatchObject({ group: ',', decimal: '.' });
      expect(localeNumberParts('de-DE')).toMatchObject({ group: '.', decimal: ',' });
    });

    it('reads currency placement and precision out of Intl', () => {
      const usd = localeNumberParts('en-US', 'USD');
      expect(usd.currencySymbol).toBe('$');
      expect(usd.currencyLeading).toBe(true);
      expect(usd.currencyDecimals).toBe(2);

      // Yen has no minor unit; the component must not invent two decimals.
      expect(localeNumberParts('en-US', 'JPY').currencyDecimals).toBe(0);

      // German writes the symbol after the number.
      expect(localeNumberParts('de-DE', 'EUR').currencyLeading).toBe(false);
    });
  });

  describe('toAsciiDigits', () => {
    it('maps localized digit systems back to ASCII', () => {
      expect(toAsciiDigits('١٢٣٤٫٥')).toBe('1234.5'); // Arabic-Indic
      expect(toAsciiDigits('१२३४.५')).toBe('1234.5'); // Devanagari
      expect(toAsciiDigits('١٬٢٣٤')).toBe('1234'); // Arabic thousands separator
      expect(toAsciiDigits('1234.5')).toBe('1234.5');
    });
  });

  describe('evaluateExpression', () => {
    it('evaluates the four operations with precedence and parentheses', () => {
      expect(evaluateExpression('12*3')).toBe('36');
      expect(evaluateExpression('(2+3)*1.5')).toBe('7.5');
      expect(evaluateExpression('1200/4+50')).toBe('350');
      expect(evaluateExpression('100-1')).toBe('99');
    });

    it('refuses anything that is not a well-formed expression', () => {
      expect(evaluateExpression('2+')).toBeNull();
      expect(evaluateExpression('(2+3')).toBeNull();
      expect(evaluateExpression('abc')).toBeNull();
      expect(evaluateExpression('12')).toBeNull(); // a bare number is not an expression
    });
  });

  describe('parseNumber', () => {
    it('always accepts canonical ASCII, whatever the locale', () => {
      expect(parse('1234.56')).toEqual({ status: 'ok', value: '1234.56', viaExpression: false });
      expect(parse('-1234.56').status).toBe('ok');
      expect(parse('.5')).toMatchObject({ value: '0.5' });
      expect(parse('1234.56', { locale: 'de-DE' })).toMatchObject({ value: '1234.56' });
    });

    it('accepts locale-grouped text the platform control calls invalid', () => {
      expect(parse('1,234.56')).toMatchObject({ value: '1234.56' });
      expect(parse('1.234,56', { locale: 'de-DE' })).toMatchObject({ value: '1234.56' });
    });

    it('accepts all three space characters a French paste may carry', () => {
      // Written as escapes on purpose: these three are visually identical in
      // source, and which one a copy-paste carries is nobody's fault.
      for (const space of ['\u0020', '\u00A0', '\u202F']) {
        expect(parse(`1${space}234,56`, { locale: 'fr-FR' })).toMatchObject({ value: '1234.56' });
      }
    });

    it('strips pasted affixes', () => {
      expect(parse('$1,234.56', { currency: 'USD' }, { currency: 'USD' })).toMatchObject({
        value: '1234.56',
      });
      expect(parse('5kg', { suffix: 'kg' })).toMatchObject({ value: '5' });
      expect(parse('15%', { preset: 'percent' })).toMatchObject({ value: '15' });
    });

    it('reads an accounting negative', () => {
      expect(parse('(1,234.56)')).toMatchObject({ value: '-1234.56' });
      expect(parse('(0)')).toMatchObject({ value: '0' });
    });

    it('reads localized digits', () => {
      expect(parse('١٢٣٤٫٥', { locale: 'ar-EG' })).toMatchObject({ value: '1234.5' });
    });

    it('reads compact entry only when the format is compact', () => {
      const compact = { numberFormat: { notation: 'compact' as const } };
      expect(parse('1.5k', compact)).toMatchObject({ value: '1500' });
      expect(parse('2m', compact)).toMatchObject({ value: '2000000' });
      expect(parse('1.5k').status).toBe('error');
    });

    it('keeps unparseable text out of the value', () => {
      expect(parse('12..5')).toEqual({ status: 'error', reason: 'unparseable' });
      expect(parse('abc')).toEqual({ status: 'error', reason: 'unparseable' });
      expect(parse('')).toEqual({ status: 'empty' });
      expect(parse('   ')).toEqual({ status: 'empty' });
    });

    it('refuses a fraction under the integer preset', () => {
      expect(parse('1.5', { preset: 'integer' })).toEqual({
        status: 'error',
        reason: 'not-integer',
      });
      expect(parse('12', { preset: 'integer' })).toMatchObject({ value: '12' });
    });

    it('evaluates expressions only when asked', () => {
      expect(parse('12*3').status).toBe('error');
      expect(parse('12*3', {}, { allowExpressions: true })).toEqual({
        status: 'ok',
        value: '36',
        viaExpression: true,
      });
    });

    it('never divides a percent value behind the user, unless it is a fraction', () => {
      expect(parse('15', { preset: 'percent' })).toMatchObject({ value: '15' });
      expect(parse('15', { preset: 'percent', valueIsFraction: true })).toMatchObject({
        value: '0.15',
      });
    });
  });

  describe('formatNumber', () => {
    it('groups from five digits under min2, so a year stays a year', () => {
      expect(format('2026')).toBe('2026');
      expect(format('10000')).toBe('10,000');
      expect(format('1234.5')).toBe('1234.5');
    });

    it('groups money from four digits and pads to the currency precision', () => {
      expect(format('1234.5', { currency: 'USD' })).toBe('1,234.50');
      expect(format('1234', { currency: 'JPY' })).toBe('1,234');
    });

    it('uses the locale separators in both positions', () => {
      expect(format('1234.5', { locale: 'de-DE', currency: 'EUR' })).toBe('1.234,50');
    });

    it('honours an explicit decimals override', () => {
      expect(format('1.15', { decimals: 1 })).toBe('1.2');
      expect(format('1.15', { decimals: 1, roundingMode: 'half-even' })).toBe('1.2');
      expect(format('1.25', { decimals: 1, roundingMode: 'half-even' })).toBe('1.2');
      expect(format('2', { decimals: [2, 2] })).toBe('2.00');
    });

    it('turns off grouping when asked', () => {
      expect(format('10000', { grouping: false })).toBe('10000');
      expect(format('1234', { grouping: 'always' })).toBe('1,234');
    });

    it('shifts a fraction model into display units', () => {
      expect(format('0.15', { preset: 'percent', valueIsFraction: true })).toBe('15');
      expect(format('15', { preset: 'percent' })).toBe('15');
    });

    it('renders compact notation', () => {
      expect(format('1500', { numberFormat: { notation: 'compact' } })).toBe('1.5K');
    });

    it('keeps a negative sign', () => {
      expect(format('-10000')).toBe('-10,000');
    });
  });

  describe('rawNumberText and settleNumber', () => {
    it('strips grouping and affixes for the focused field', () => {
      const money = resolveNumberFormat({ locale: 'en-US', currency: 'USD' });
      expect(formatNumber('1234.56', money)).toBe('1,234.56');
      expect(rawNumberText('1234.56', money)).toBe('1234.56');
    });

    it('settles a committed value to the field precision, in model units', () => {
      const fraction = resolveNumberFormat({ preset: 'percent', valueIsFraction: true });
      expect(settleNumber('0.15', fraction)).toBe('0.15');
      const oneDecimal = resolveNumberFormat({ decimals: 1 });
      expect(settleNumber('1.15', oneDecimal)).toBe('1.2');
    });
  });

  describe('speakNumber', () => {
    it('carries the affixes into aria-valuetext', () => {
      const money = resolveNumberFormat({ locale: 'en-US', currency: 'USD' });
      expect(speakNumber('1234.56', money)).toBe('$1,234.56');

      const percent = resolveNumberFormat({ preset: 'percent' });
      expect(speakNumber('15', percent)).toBe('15 percent');

      const weight = resolveNumberFormat({ suffix: 'kg', unitAnnouncement: 'kilograms' });
      expect(speakNumber('72', weight)).toBe('72 kilograms');
    });

    it('says Empty rather than nothing', () => {
      expect(speakNumber(null, resolveNumberFormat())).toBe('Empty');
    });
  });

  describe('losesPrecision', () => {
    it('flags numbers that are already past the safe range', () => {
      expect(losesPrecision(0.1)).toBe(false);
      expect(losesPrecision(1234.56)).toBe(false);
      expect(losesPrecision(Number.MAX_SAFE_INTEGER)).toBe(false);
      expect(losesPrecision(Number.MAX_SAFE_INTEGER + 2)).toBe(true);
      expect(losesPrecision(Infinity)).toBe(true);
    });

    it('flags exact strings a number cannot carry', () => {
      // 2^53 + 1 is not representable, so the projection comes back even.
      expect(losesPrecision('9007199254740993')).toBe(true);
      expect(losesPrecision('1.00000000000000001')).toBe(true);
      expect(losesPrecision('1234.56')).toBe(false);
      expect(losesPrecision('0.1')).toBe(false);
    });
  });

  describe('resolveNumberFormat', () => {
    it('picks inputmode so the keypad has the keys the field needs', () => {
      // numeric only when negatives and decimals are both impossible.
      expect(resolveNumberFormat({ preset: 'integer', min: 0 }).inputMode).toBe('numeric');
      expect(resolveNumberFormat({ preset: 'integer', min: -5 }).inputMode).toBe('decimal');
      expect(resolveNumberFormat({ preset: 'integer' }).inputMode).toBe('decimal');
      expect(resolveNumberFormat({ preset: 'decimal' }).inputMode).toBe('decimal');
    });

    it(`places the currency symbol on the locale's side`, () => {
      expect(resolveNumberFormat({ locale: 'en-US', currency: 'USD' }).prefix).toBe('$');
      expect(resolveNumberFormat({ locale: 'en-US', currency: 'USD' }).suffix).toBe('');
      expect(resolveNumberFormat({ locale: 'de-DE', currency: 'EUR' }).suffix).toBe('€');
    });
  });
});
