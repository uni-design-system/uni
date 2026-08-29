/**
 * The exact layer under all four numeric components. Every stepping, clamping
 * and formatting behaviour above it assumes these are precise, so the cases
 * that distinguish this arithmetic from the platform's are asserted against
 * the platform's own answer wherever there is one.
 */
import {
  clampDecimal,
  compareDecimal,
  decimalScale,
  fromScaled,
  isCanonicalDecimal,
  normalizeDecimal,
  roundDecimal,
  shiftDecimal,
  stepDecimal,
  toDecimal,
  toScaled,
} from './decimal.helper';

describe('decimal helpers', () => {
  describe('shape', () => {
    it('recognises canonical decimals', () => {
      expect(isCanonicalDecimal('1234.56')).toBe(true);
      expect(isCanonicalDecimal('-1234.56')).toBe(true);
      expect(isCanonicalDecimal('+3')).toBe(true);
      expect(isCanonicalDecimal('.5')).toBe(true);
      expect(isCanonicalDecimal('5.')).toBe(true);
      expect(isCanonicalDecimal('1,234.56')).toBe(false);
      expect(isCanonicalDecimal('12..5')).toBe(false);
      expect(isCanonicalDecimal('abc')).toBe(false);
      expect(isCanonicalDecimal('')).toBe(false);
    });

    it('counts fraction digits', () => {
      expect(decimalScale('1.250')).toBe(3);
      expect(decimalScale('12')).toBe(0);
      expect(decimalScale('5.')).toBe(0);
    });

    it('round-trips through the scaled integer', () => {
      expect(toScaled('1.25', 2)).toBe(125n);
      expect(toScaled('-1.25', 2)).toBe(-125n);
      expect(toScaled('.5', 1)).toBe(5n);
      expect(toScaled('0', 2)).toBe(0n);
      expect(fromScaled(125n, 2)).toBe('1.25');
      expect(fromScaled(-125n, 2)).toBe('-1.25');
      expect(fromScaled(0n, 2)).toBe('0');
    });

    it('trims only fraction zeros, never integer ones', () => {
      expect(fromScaled(1000n, 2)).toBe('10');
      expect(fromScaled(10000n, 2)).toBe('100');
      expect(fromScaled(10n, 2)).toBe('0.1');
    });

    it('normalises sign and padding', () => {
      expect(normalizeDecimal('+01.50')).toBe('1.5');
      expect(normalizeDecimal('-0.0')).toBe('0');
      expect(normalizeDecimal('007')).toBe('7');
    });
  });

  describe('toDecimal', () => {
    it('expands the exponential notation String(number) produces', () => {
      // Outside 1e-7…1e21 the platform switches notation, which is not
      // canonical and would reach the arithmetic as literal text.
      expect(String(1e-7)).toBe('1e-7');
      expect(toDecimal(1e-7)).toBe('0.0000001');
      expect(toDecimal(1e21)).toBe('1' + '0'.repeat(21));
      expect(toDecimal(1.5e-7)).toBe('0.00000015');
      expect(toDecimal(2.5e3)).toBe('2500');
      expect(toDecimal(-1.2345e2)).toBe('-123.45');
    });

    it('accepts plain numbers and canonical text', () => {
      expect(toDecimal(0.1)).toBe('0.1');
      expect(toDecimal('1234.56')).toBe('1234.56');
      expect(toDecimal(-0)).toBe('0');
    });

    it('refuses text that is not a number', () => {
      expect(() => toDecimal('12..5')).toThrow(RangeError);
      expect(() => toDecimal('abc')).toThrow(RangeError);
    });
  });

  describe('compareDecimal', () => {
    it('compares across differing precision', () => {
      expect(compareDecimal('1.50', '1.5')).toBe(0);
      expect(compareDecimal('1.5', '1.45')).toBe(1);
      expect(compareDecimal('-2', '-1.9')).toBe(-1);
      expect(compareDecimal('0', '-0')).toBe(0);
    });
  });

  describe('roundDecimal', () => {
    it('rounds a true tie half-up, where toFixed cannot', () => {
      // 1.15 is really 1.1499999999999999 as a double, so the platform
      // breaks a tie that does not exist in the decimal value.
      expect((1.15).toFixed(1)).toBe('1.1');
      expect(roundDecimal('1.15', 1)).toBe('1.2');
    });

    it('sends half-even ties to the even digit', () => {
      expect(roundDecimal('1.25', 1, 'half-even')).toBe('1.2');
      expect(roundDecimal('1.35', 1, 'half-even')).toBe('1.4');
      // The same two ties under half-up go away from zero every time.
      expect(roundDecimal('1.25', 1, 'half-up')).toBe('1.3');
      expect(roundDecimal('1.35', 1, 'half-up')).toBe('1.4');
    });

    it('rounds negatives away from zero under half-up', () => {
      expect(roundDecimal('-1.15', 1)).toBe('-1.2');
      expect(roundDecimal('-1.14', 1)).toBe('-1.1');
    });

    it('honours the directional modes in both signs', () => {
      expect(roundDecimal('1.15', 1, 'ceil')).toBe('1.2');
      expect(roundDecimal('-1.15', 1, 'ceil')).toBe('-1.1');
      expect(roundDecimal('1.15', 1, 'floor')).toBe('1.1');
      expect(roundDecimal('-1.15', 1, 'floor')).toBe('-1.2');
      expect(roundDecimal('1.19', 1, 'trunc')).toBe('1.1');
      expect(roundDecimal('-1.19', 1, 'trunc')).toBe('-1.1');
    });

    it('leaves a value already inside the precision alone', () => {
      expect(roundDecimal('1.5', 3)).toBe('1.5');
      expect(roundDecimal('2', 0)).toBe('2');
      expect(roundDecimal('1.999', 0)).toBe('2');
    });
  });

  describe('shiftDecimal', () => {
    it('multiplies by a power of ten exactly', () => {
      expect(shiftDecimal('0.15', 2)).toBe('15');
      expect(shiftDecimal('15', -2)).toBe('0.15');
      expect(shiftDecimal('1.5', 1)).toBe('15');
      expect(shiftDecimal('1', 1)).toBe('10');
      expect(shiftDecimal('-0.5', 2)).toBe('-50');
    });
  });

  describe('clampDecimal', () => {
    it('reports which fence was hit', () => {
      expect(clampDecimal('150', 0, 100)).toEqual({ value: '100', hit: 'max' });
      expect(clampDecimal('-5', 0, 100)).toEqual({ value: '0', hit: 'min' });
      expect(clampDecimal('50', 0, 100)).toEqual({ value: '50', hit: null });
    });

    it('treats an absent bound as unbounded', () => {
      expect(clampDecimal('999999').hit).toBeNull();
      expect(clampDecimal('-999', 0).hit).toBe('min');
      expect(clampDecimal('999', undefined, 100).hit).toBe('max');
    });
  });

  describe('stepDecimal', () => {
    it('steps decimals without float drift', () => {
      expect(stepDecimal('0.2', 1, { step: 0.1 })).toBe('0.3');
      // The reason this file exists.
      expect(0.1 + 0.2).not.toBe(0.3);
    });

    it('accumulates exactly over many steps', () => {
      let value = '0';
      for (let i = 0; i < 20; i++) value = stepDecimal(value, 1, { step: 0.1 });
      expect(value).toBe('2');
    });

    it('lands on the min-anchored grid', () => {
      expect(stepDecimal('5', 1, { step: 10, min: 5 })).toBe('15');
      expect(stepDecimal('15', 1, { step: 10, min: 5 })).toBe('25');
      expect(stepDecimal('15', -1, { step: 10, min: 5 })).toBe('5');
    });

    it('snaps an off-grid value in the direction of travel', () => {
      expect(stepDecimal('7', 1, { step: 10, min: 5 })).toBe('15');
      expect(stepDecimal('7', -1, { step: 10, min: 5 })).toBe('5');
    });

    it('anchors on zero when asked, ignoring the fence', () => {
      expect(stepDecimal('7', 1, { step: 10, min: 5, stepOrigin: 'zero' })).toBe('10');
      expect(stepDecimal('7', -1, { step: 10, min: 5, stepOrigin: 'zero' })).toBe('5');
    });

    it('stops at a fence rather than passing it', () => {
      expect(stepDecimal('100', 1, { step: 1, min: 0, max: 100 })).toBe('100');
      expect(stepDecimal('0', -1, { step: 1, min: 0, max: 100 })).toBe('0');
      expect(stepDecimal('99.5', 1, { step: 1, min: 0, max: 100 })).toBe('100');
    });

    it('cycles when wrap is set', () => {
      const hours = { step: 1, min: 0, max: 23, wrap: true } as const;
      expect(stepDecimal('23', 1, hours)).toBe('0');
      expect(stepDecimal('0', -1, hours)).toBe('23');
      expect(stepDecimal('22', 1, hours)).toBe('23');
    });

    it('needs both bounds to wrap', () => {
      expect(stepDecimal('23', 1, { step: 1, min: 0, wrap: true })).toBe('24');
    });

    it('returns the value unchanged when the step is zero', () => {
      expect(stepDecimal('5', 1, { step: 0 })).toBe('5');
    });

    it('steps negatives across zero', () => {
      expect(stepDecimal('-0.1', 1, { step: 0.1 })).toBe('0');
      expect(stepDecimal('0', -1, { step: 0.1 })).toBe('-0.1');
    });
  });
});
