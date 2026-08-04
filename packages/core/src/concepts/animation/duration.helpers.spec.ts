import { describe, expect, it } from 'vitest';
import {
  EXPAND_DEFAULT_SPEED,
  EXPAND_MAX_DURATION,
  EXPAND_MIN_DURATION,
  EXPAND_REFERENCE_HEIGHT,
  expandDuration,
} from './duration.helpers';

describe('expandDuration', () => {
  it('runs at exactly the configured speed at the reference height', () => {
    expect(expandDuration(EXPAND_REFERENCE_HEIGHT)).toBeCloseTo(EXPAND_DEFAULT_SPEED);
    expect(expandDuration(EXPAND_REFERENCE_HEIGHT, 0.5)).toBeCloseTo(0.5);
  });

  it('scales sublinearly with height', () => {
    // 4× the height doubles the duration (√4 = 2), it does not quadruple it.
    expect(expandDuration(EXPAND_REFERENCE_HEIGHT / 4)).toBeCloseTo(EXPAND_DEFAULT_SPEED / 2);
  });

  it('clamps the envelope at the default speed', () => {
    expect(expandDuration(0)).toBeCloseTo(EXPAND_MIN_DURATION);
    expect(expandDuration(1)).toBeCloseTo(EXPAND_MIN_DURATION);
    expect(expandDuration(10_000)).toBeCloseTo(EXPAND_MAX_DURATION);
  });

  it('scales the envelope with a themed speed instead of capping to the default', () => {
    // A theme that doubles transitionSpeed gets a proportionally wider envelope.
    expect(expandDuration(10_000, EXPAND_DEFAULT_SPEED * 2)).toBeCloseTo(EXPAND_MAX_DURATION * 2);
    expect(expandDuration(0, EXPAND_DEFAULT_SPEED * 2)).toBeCloseTo(EXPAND_MIN_DURATION * 2);
  });

  it('tolerates degenerate heights', () => {
    expect(expandDuration(-50)).toBeCloseTo(EXPAND_MIN_DURATION);
    expect(expandDuration(Number.NaN)).toBeCloseTo(EXPAND_MIN_DURATION);
  });
});
