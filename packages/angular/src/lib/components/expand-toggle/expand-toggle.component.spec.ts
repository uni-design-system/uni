/**
 * The labelled trigger's type is the theme's. It used to be the literal
 * `uni-text="label"` / `"caption"` — the checkbox finding (11.2.0) unfixed
 * here — so a theme whose `label` is a 9px caps eyebrow drew a tiny badge
 * beside a 20px chevron and nothing could reach it.
 */
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme, type Typeface } from '@uni-design-system/uni-core';
import { UniExpandToggleComponent } from './expand-toggle.component';
import { ThemeService } from '../../theming';
import { UNI_THEMES } from '../../theming/theme.token';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniExpandToggleComponent typography', () => {
  // One id per render: the service keeps themes by id across TestBed resets,
  // so reusing one would hand a later test the first test's options.
  let n = 0;
  const render = (options: Record<string, unknown> = {}) => {
    const theme = createTheme({
      id: `Test${++n}`,
      name: 'Test',
      colors: LightTheme.colors,
      components: { expand: { options } },
    });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }],
    });
    const fixture = TestBed.createComponent(UniExpandToggleComponent);
    fixture.componentRef.setInput('label', 'Dimensions & Materials');
    fixture.componentRef.setInput('sublabel', 'for POs & custom orders');
    fixture.detectChanges();
    const spans = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[uni-text]')
    );
    const service = TestBed.inject(ThemeService);
    /** The role's font-size, as the directive emits it. */
    const fontSize = (role: Typeface) =>
      `font-size:${(service.typeface(role) as { fontSize: string | number }).fontSize}`;
    return { fixture, label: spans[0], sublabel: spans[1], fontSize };
  };

  beforeEach(() => localStorage.clear());

  it('sets the label and sublabel in the label and caption roles by default', () => {
    const { label, sublabel, fontSize } = render();
    expect(emittedRuleFor(label)).toContain(fontSize('label'));
    expect(emittedRuleFor(sublabel)).toContain(fontSize('caption'));
  });

  it('reads textRole and sublabelRole from the expand theme entry', () => {
    const { label, sublabel, fontSize } = render({
      textRole: 'body-1-short',
      sublabelRole: 'body-2-short',
    });
    expect(emittedRuleFor(label)).toContain(fontSize('body-1-short'));
    expect(emittedRuleFor(sublabel)).toContain(fontSize('body-2-short'));
  });

  it('reads textColor and sublabelColor as ink', () => {
    const { label, sublabel } = render({ textColor: 'primary', sublabelColor: 'warn' });
    // Doubled `&&` — the ink rule `uni-text` emits for an explicit colour. The
    // CSSOM reports the value as `rgb()`, so the token's hex is not compared.
    const inked = /\.css-[\w-]+\.css-[\w-]+\{color:/;
    expect(emittedRuleFor(label)).toMatch(inked);
    expect(emittedRuleFor(sublabel)).toMatch(inked);
    expect(emittedRuleFor(label)).not.toBe(emittedRuleFor(sublabel));
  });

  it('inherits the surrounding ink when no textColor is set', () => {
    const { label } = render();
    expect(emittedRuleFor(label)).not.toMatch(/\.css-[\w-]+\.css-[\w-]+\{color:/);
  });
});
