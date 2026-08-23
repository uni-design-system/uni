/**
 * Covers the timing resolution only — the reveal's own animation is CSS and
 * belongs to Storybook. What matters here is that the `motion` token drives
 * the clock and that a per-instance `transitionSpeed` input still outranks it.
 */
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';

import { UniExpandComponent } from './expand.component';
import { UNI_THEMES } from '../../theming/theme.token';

describe('UniExpandComponent timing', () => {
  const withExpandOptions = (options: Record<string, unknown>) => {
    const theme = createTheme({
      id: 'Test',
      name: 'Test',
      colors: LightTheme.colors,
      components: { expand: { options } },
    });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }],
    });
    const fixture = TestBed.createComponent(UniExpandComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => localStorage.clear());

  it('takes its base speed from the motion token', () => {
    // `reveal` is 350ms; the component works in seconds.
    const fixture = withExpandOptions({ motion: 'reveal' });
    expect(fixture.componentInstance.duration()).toBeCloseTo(0.35, 5);
  });

  it('follows a retimed token', () => {
    const theme = createTheme({
      id: 'Slow',
      name: 'Slow',
      colors: LightTheme.colors,
      motion: { reveal: { duration: 800, easing: 'ease-out' } },
    });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: { Slow: theme } }],
    });
    const fixture = TestBed.createComponent(UniExpandComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.duration()).toBeCloseTo(0.8, 5);
  });

  it('lets a per-instance transitionSpeed outrank the token', () => {
    const fixture = withExpandOptions({ motion: 'reveal' });
    fixture.componentRef.setInput('transitionSpeed', 0.1);
    fixture.detectChanges();

    expect(fixture.componentInstance.duration()).toBe(0.1);
  });
});
