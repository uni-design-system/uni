import { describe, expect, it } from 'vitest';
import { toTypeface } from './typeface.helpers';

describe('toTypeface', () => {
  it('converts numeric lengths to px', () => {
    expect(toTypeface({ fontFamily: 'Roboto', fontSize: 16, lineHeight: 24, letterSpacing: 0.15 })).toEqual({
      fontFamily: 'Roboto',
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '0.15px',
    });
  });

  it('passes string lengths through verbatim', () => {
    expect(
      toTypeface({ fontFamily: 'Roboto', fontSize: '1.2rem', lineHeight: '1.5', letterSpacing: '0.02em' })
    ).toEqual({
      fontFamily: 'Roboto',
      fontSize: '1.2rem',
      lineHeight: '1.5',
      letterSpacing: '0.02em',
    });
  });
});
