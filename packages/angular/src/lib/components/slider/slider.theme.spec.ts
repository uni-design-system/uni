/**
 * The thumb's theme options: by default a solid variant dot ringed in the page
 * background; a theme can invert that into a surface dot ringed in the variant,
 * with a lift — the Wellsourced rate-slider look.
 *
 * Assertions read the emitted `::after` rule: the dot is a pseudo-element, so
 * there is no computed style to read from jsdom.
 */
import { TestBed } from '@angular/core/testing';
import { BaseTheme, createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniSliderComponent } from './slider.component';
import { UNI_THEMES } from '../../theming/theme.token';
import { emittedRuleFor } from '../../../testing/emitted-css';

const SHADOW = '0 1px 4px rgba(0, 0, 0, 0.18)';

const renderThumb = (
  inputs: Record<string, unknown> = {},
  options?: Record<string, unknown>
): string => {
  TestBed.resetTestingModule();
  // The service persists the active theme name; a previous render's choice
  // would otherwise win over the injected `Test` theme.
  localStorage.clear();
  if (options) {
    const theme = createTheme({
      id: 'Test',
      name: 'Test',
      colors: LightTheme.colors,
      shadows: { ...BaseTheme.shadows, lift: SHADOW },
      components: { slider: { options } },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }],
    });
  }
  const fixture = TestBed.createComponent(UniSliderComponent);
  fixture.componentRef.setInput('label', 'Rate');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const thumb = (fixture.nativeElement as HTMLElement).querySelector('[role="slider"]')!;
  const rule = emittedRuleFor(thumb);
  // Only the dot's rule — the hit area carries its own background-less box.
  return rule.slice(rule.indexOf('::after'));
};

/** jsdom may serialize a hex color as `rgb(…)`; compare in its terms. */
const normalize = (color: string): string => {
  const probe = document.createElement('i');
  probe.style.color = color;
  return probe.style.color.replace(/\s+/g, '');
};

describe('UniSliderComponent thumb theme options', () => {
  it('defaults to a variant dot ringed 2px in the background, with no shadow', () => {
    const dot = renderThumb();
    const c = LightTheme.colors;

    expect(dot).toContain(`background-color:${normalize(c['primary']!)}`);
    expect(dot).toContain(`border:2pxsolid${normalize(c['background']!)}`);
    expect(dot).not.toContain('box-shadow');
  });

  it('draws a surface dot ringed in the variant, with a lift', () => {
    const dot = renderThumb(
      { variant: 'secondary' },
      {
        thumbColor: 'surface',
        thumbBorderColor: 'fill',
        thumbBorderWidth: 3,
        thumbShadow: 'lift',
      }
    );
    const c = LightTheme.colors;

    expect(dot).toContain(`background-color:${normalize(c['surface']!)}`);
    expect(dot).toContain(`border:3pxsolid${normalize(c['secondary']!)}`);
    expect(dot).toContain(`box-shadow:${SHADOW.replace(/\s+/g, '')}`);
  });

  it('greys a variant ring out when disabled, keeping the surface dot', () => {
    const dot = renderThumb(
      { variant: 'secondary', disabled: true },
      { thumbColor: 'surface', thumbBorderColor: 'fill' }
    );
    const c = LightTheme.colors;

    expect(dot).toContain(`background-color:${normalize(c['surface']!)}`);
    expect(dot).toContain(`border:2pxsolid${normalize(c['on-disabled']!)}`);
  });
});
