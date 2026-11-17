import { describe, expect, it } from 'vitest';
import { meanColor, nameHue, normalizeHex } from './color.naming';

describe('normalizeHex', () => {
  it.each([
    ['434c5a', '#434C5A'],
    ['#434C5A', '#434C5A'],
    ['  #434c5a  ', '#434C5A'],
    ['434c5aff', '#434C5A'],
    ['abc', '#AABBCC'],
    ['rgb(67, 76, 90)', '#434C5A'],
    ['rgba(67,76,90,1)', '#434C5A'],
    ['rgb(300, 0, 0)', '#FF0000'],
  ])('reads %j as %s', (input, expected) => {
    expect(normalizeHex(input)).toBe(expected);
  });

  it.each(['zzz', '#12345', '', 42, null, undefined, {}])('refuses %j', (input) => {
    expect(normalizeHex(input)).toBeNull();
  });
});

describe('nameHue', () => {
  it.each([
    ['#434C5A', 'a dark slate blue'], // Hale Navy
    ['#2F3D4C', 'a dark slate blue'],
    ['#0F4C81', 'a dark blue'], // Classic Blue
    ['#F6F6EE', 'an off-white'], // Chantilly Lace
    ['#EEEFEA', 'an off-white'],
    ['#2F2F30', 'a near-black'], // Tricorn Black
    ['#CCC6B8', 'a light gray'],
    ['#A64B33', 'a red'],
    ['#D4A373', 'an orange'],
  ])('names %s %s', (hex, expected) => {
    expect(nameHue(hex)).toBe(expected);
  });

  it('reads every spelling normalizeHex does, and says nothing for the rest', () => {
    expect(nameHue('rgb(67, 76, 90)')).toBe('a dark slate blue');
    expect(nameHue('zzz')).toBe('');
    expect(nameHue(null)).toBe('');
  });
});

describe('meanColor', () => {
  it('averages the region rather than reading one pixel', () => {
    // A 3×3 block of #434C5A with one white pixel in the middle: the dot the
    // pointer happens to sit on must not be the answer.
    const pixels: number[] = [];
    for (let i = 0; i < 9; i++) pixels.push(...(i === 4 ? [255, 255, 255, 255] : [0x43, 0x4c, 0x5a, 255]));

    const mean = meanColor(pixels)!;
    expect(mean).not.toBe('#FFFFFF');
    expect(mean).toBe('#58606C');
  });

  it('returns a flat block unchanged, and null for an empty one', () => {
    expect(meanColor(new Uint8ClampedArray([67, 76, 90, 255, 67, 76, 90, 255]))).toBe('#434C5A');
    expect(meanColor([])).toBeNull();
  });
});
