/**
 * The deprecated-option contract, which is the whole backward-compatibility
 * claim of the motion migration: a theme that set `transitionSpeed` before the
 * scale existed must keep its exact timing, not be retimed underneath it.
 */
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';

import { UniRadioComponent } from './radio.component';
import { UNI_THEMES } from '../../theming/theme.token';

/** Emotion writes the timing into a stylesheet, not the markup. */
const stylesFor = (root: HTMLElement) => {
  const classes = new Set(
    Array.from(root.querySelectorAll<HTMLElement>('[class]')).flatMap((el) =>
      Array.from(el.classList)
    )
  );
  return Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .filter((text) => Array.from(classes).some((cls) => text.includes(`.${cls}`)))
    .join('');
};

describe('UniRadioComponent motion', () => {
  const render = (options: Record<string, unknown>, motion?: Record<string, unknown>) => {
    const theme = createTheme({
      id: 'Test',
      name: 'Test',
      colors: LightTheme.colors,
      components: { radio: { options } },
      ...(motion ? { motion } : {}),
    });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }],
    });
    const fixture = TestBed.createComponent(UniRadioComponent);
    fixture.componentRef.setInput('options', [{ label: 'A', value: 'a' }]);
    fixture.detectChanges();
    return stylesFor(fixture.nativeElement as HTMLElement);
  };

  beforeEach(() => localStorage.clear());

  it('takes its timing from the control token', () => {
    expect(render({ motion: 'control' })).toContain('0.3s');
  });

  it('follows a retimed control token', () => {
    const html = render({ motion: 'control' }, { control: { duration: 90, easing: 'linear' } });
    expect(html).toContain('0.09s');
    expect(html).toContain('linear');
  });

  it('still honours a theme setting the deprecated transitionSpeed', () => {
    // Wins over the token, so pre-existing themes are untouched.
    expect(render({ motion: 'control', transitionSpeed: 0.75 })).toContain('0.75s');
  });

  it('supports an instant token, the way transitionSpeed: 0 did', () => {
    expect(render({ motion: 'instant' }, { instant: { duration: 0, easing: 'linear' } })).toContain(
      '0s'
    );
  });
});
