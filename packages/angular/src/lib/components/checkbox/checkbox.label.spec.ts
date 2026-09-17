/**
 * The label a checkbox draws: whose typeface it wears, whether it is drawn at
 * all, what sits beside it, and how far away.
 *
 * Assertions read the emitted CSS rather than computed style. jsdom performs no
 * layout — every `getBoundingClientRect()` is zero — so "the host measures
 * exactly the box" cannot be measured here; what can be asserted is the rule
 * that makes it true, which is the part this component is responsible for.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniCheckboxComponent } from './checkbox.component';
import { UNI_THEMES } from '../../theming/theme.token';
import { emittedRuleFor } from '../../../testing/emitted-css';

const render = (
  inputs: Record<string, unknown> = {},
  options?: Record<string, unknown>
): HTMLElement => {
  TestBed.resetTestingModule();
  if (options) {
    const theme = createTheme({
      id: 'Test',
      name: 'Test',
      colors: LightTheme.colors,
      components: { checkbox: { options } },
    });
    TestBed.configureTestingModule({ providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }] });
  }
  const fixture = TestBed.createComponent(UniCheckboxComponent);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
};

describe('UniCheckboxComponent label typography', () => {
  it('wears the theme-stated text role instead of a hardcoded one', () => {
    const host = render({ label: 'Accept terms' }, { textRole: 'caption' });
    const rule = emittedRuleFor(host.querySelector('span')!);

    // `caption` (12/18, 0.4 tracking) in the base scale, not `label` (14/20).
    // A theme is free to make `label` an uppercase eyebrow — most type scales
    // treat it as the caption above a field — and this is how a sentence
    // beside a checkbox escapes that.
    expect(rule).toContain('font-size:12px');
    expect(rule).toContain('letter-spacing:0.4px');
  });

  it('falls back to `label` when the theme states no role', () => {
    const host = render({ label: 'Accept terms' });
    const rule = emittedRuleFor(host.querySelector('span')!);

    // The base theme's `label` role, byte for byte what `uni-text="label"`
    // emitted before the role became themeable.
    expect(rule).toContain('font-size:14px');
    expect(rule).toContain('line-height:20px');
  });

  it('inks the label from the theme, at a specificity a container cannot beat', () => {
    const host = render({ label: 'Accept terms' }, { textColor: 'on-surface-variant' });
    const rule = emittedRuleFor(host.querySelector('span')!);

    // Doubled `&&`, so an explicit ink beats the paired on-color a container
    // directive on the same element contributes.
    expect(rule).toMatch(/\.css-[\w-]+\.css-[\w-]+\{color:/);
  });
});

describe('UniCheckboxComponent labelHidden', () => {
  it('keeps the name in the DOM and draws nothing', () => {
    const host = render({ label: 'Select row', labelHidden: true });
    const span = host.querySelector('span')!;

    // Same string a screen reader announces and a test queries by.
    expect(span.textContent).toBe('Select row');
    expect(host.querySelector('label')!.textContent).toContain('Select row');
    expect(emittedRuleFor(span)).toContain('clip-path:inset(50%)');
  });

  it('takes the hidden label out of flow, so it claims no gap', () => {
    const host = render({ label: 'Select row', labelHidden: true });

    // `position: fixed` is what makes the gap suppression unnecessary: an
    // out-of-flow box is not a flex item, so the label row's `gap` never
    // applies to it and the control measures exactly the box.
    expect(emittedRuleFor(host.querySelector('span')!)).toContain('position:fixed');
    expect(emittedRuleFor(host.querySelector('label')!)).toContain('gap:8px');
  });

  it('measures as the control it contains, not as a block', () => {
    const host = render({ label: 'Select row', labelHidden: true });

    // Without a host display the element is inline, and the flex <label>
    // inside makes it generate block boxes — so it filled its container and a
    // checkbox in a 26px grid track could not be sized by measuring it.
    expect(emittedRuleFor(host)).toContain('display:inline-flex');
    expect(emittedRuleFor(host)).not.toContain('width:100%');
  });

  it('fills the container on request', () => {
    const host = render({ label: 'Select row', fullWidth: true });
    expect(emittedRuleFor(host)).toContain('width:100%');
    expect(emittedRuleFor(host.querySelector('label')!)).toContain('width:100%');
  });
});

describe('UniCheckboxComponent projected content', () => {
  const Host = Component({
    selector: 'uni-test-host',
    imports: [UniCheckboxComponent],
    template: `<uni-checkbox [checked]="checked" (checkedChange)="checked = $event">
      <span>Sofa</span><span>In stock</span>
    </uni-checkbox>`,
  })(class TestHost {
    checked = false;
  });

  it('projects into the control own label, so the whole row toggles it', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    // Inside the <label>, which is the whole point: HTML forbids nesting a
    // <label>, so a consumer cannot wrap one around a uni-checkbox.
    const label = host.querySelector('label')!;
    expect(label.textContent).toContain('Sofa');

    (label.querySelector('span') as HTMLElement).click();
    fixture.detectChanges();

    // No click handler in the consumer, no stopPropagation, no second toggle.
    expect(host.querySelector('input')!.checked).toBe(true);
    expect((fixture.componentInstance as { checked: boolean }).checked).toBe(true);
  });

  it('leaves the input as the only tab stop', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const stops = host.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(stops.length).toBe(1);
    expect(stops[0].tagName).toBe('INPUT');
  });
});

describe('UniCheckboxComponent boolean attributes', () => {
  const Host = Component({
    selector: 'uni-test-host',
    imports: [UniCheckboxComponent],
    template: `<uni-checkbox label="Select row" labelHidden fullWidth></uni-checkbox>`,
  })(class TestHost {});

  it('reads a bare attribute as true', async () => {
    // Without a boolean transform a valueless attribute binds the empty
    // string, which is falsy — so `<uni-checkbox labelHidden>` would compile,
    // read as set, and quietly do nothing.
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(emittedRuleFor(host.querySelector('span')!)).toContain('clip-path:inset(50%)');
    expect(emittedRuleFor(host.querySelector('uni-checkbox')!)).toContain('width:100%');
  });
});

describe('UniCheckboxComponent geometry', () => {
  const box = (host: HTMLElement) => emittedRuleFor(host.querySelector('label')!);

  const cases = [
    { size: 'sm', height: 16 },
    { size: 'md', height: 18 },
    { size: 'lg', height: 20 },
  ] as const;

  for (const { size, height } of cases) {
    it(`sizes the box for size="${size}"`, () => {
      const host = render({ size });
      expect(box(host)).toContain(`height:${height}px`);
      expect(box(host)).toContain(`width:${height}px`);
    });
  }

  it('renders the pre-sizes geometry when no size is given', () => {
    // `lg` is BaseComponent's default and must reproduce what every existing
    // consumer already sees.
    expect(box(render())).toContain('height:20px');
  });

  it('lets a theme still stating one global size outrank the block', () => {
    // Themes are deep-merged over the base, so a theme written before 11.2
    // would otherwise inherit our `sizes` block and lose its own number.
    const host = render({ size: 'sm' }, { size: 24 });
    expect(box(host)).toContain('height:24px');
    expect(box(host)).not.toContain('height:16px');
  });

  it('keeps the box from being squashed by a long label', () => {
    expect(box(render({ label: 'A very long sentence beside a small box' }))).toContain(
      'flex-shrink:0'
    );
  });
});

describe('UniCheckboxComponent gap', () => {
  it('spaces the box from its label with a spacing token', () => {
    expect(emittedRuleFor(render({ label: 'x' }, { gap: 'md' }).querySelector('label')!)).toContain(
      'gap:16px'
    );
  });

  it('resolves `none` through the scale rather than dropping it', () => {
    // `getSpacing('none')` is 0; `theme.gap()` would drop the declaration and
    // leave the row at its default spacing.
    expect(
      emittedRuleFor(render({ label: 'x' }, { gap: 'none' }).querySelector('label')!)
    ).toContain('gap:0px');
  });

  it('is 8px when the theme says nothing, as it always has been', () => {
    expect(emittedRuleFor(render({ label: 'x' }).querySelector('label')!)).toContain('gap:8px');
  });
});
