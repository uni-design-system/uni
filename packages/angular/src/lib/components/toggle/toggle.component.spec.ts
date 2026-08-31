import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniToggleComponent } from './toggle.component';
import { ThemeService } from '../../theming';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniToggleComponent', () => {
  let fixture: ComponentFixture<UniToggleComponent>;

  const input = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniToggleComponent);
    fixture.detectChanges();
  });

  it('announces as a switch', () => {
    expect(input().getAttribute('role')).toBe('switch');
  });

  it('updates the checked model on change', () => {
    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('sets aria-invalid once touched and invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });
});

/**
 * Geometry is asserted against the emitted CSS rather than computed style: the
 * knob's travel lives behind `:checked + .toggle-switch .toggle-slider`, and a
 * jsdom cascade assertion there can pass whether or not the rule exists.
 */
describe('UniToggleComponent geometry', () => {
  let fixture: ComponentFixture<UniToggleComponent>;

  const track = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.toggle-switch')!;
  const hidden = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  const render = (size?: string): void => {
    fixture = TestBed.createComponent(UniToggleComponent);
    if (size) fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniToggleComponent] }).compileComponents();
  });

  // The theme's `sizes` block states width/height/padding; knob and travel are
  // derived. Travel is the load-bearing one: it used to be hardcoded to one
  // track height, which is right only at the old 2x / 0.8x proportions.
  const cases = [
    { size: 'sm', width: 28, height: 16, knob: 10, travel: 12, inset: 3 },
    { size: 'md', width: 32, height: 18, knob: 12, travel: 14, inset: 3 },
    { size: 'lg', width: 40, height: 20, knob: 16, travel: 20, inset: 2 },
  ] as const;

  for (const { size, width, height, knob, travel, inset } of cases) {
    it(`sizes the track and knob for size="${size}"`, () => {
      render(size);
      const rule = emittedRuleFor(track().parentElement!);

      expect(rule).toContain(`width:${width}px`);
      expect(rule).toContain(`height:${height}px`);
      expect(rule).toContain(`width:${knob}px`);
      expect(rule).toContain(`top:${inset}px`);
      expect(rule).toContain(`left:${inset}px`);
      // Radius is half the height, so the track stays a stadium at every size.
      expect(rule).toContain(`border-radius:${height / 2}px`);
      expect(emittedRuleFor(hidden())).toContain(`translateX(${travel}px)`);
    });
  }

  it('renders identically to the pre-sizes geometry when no size is given', () => {
    // `lg` is BaseComponent's default, and must reproduce what every existing
    // consumer already sees: 40x20, knob 16, one track height of travel.
    render();
    expect(emittedRuleFor(track().parentElement!)).toContain('width:40px');
    expect(emittedRuleFor(hidden())).toContain('translateX(20px)');
  });

  it('honours the legacy single-number token over the sizes block', () => {
    // A theme still setting `toggle.behavior.size` opted into the old
    // derived-ratio geometry (width 2x, knob 0.8x) before `sizes` existed, so
    // it wins and applies whatever the `size` input says.
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'LegacyToggleSize',
        name: 'Legacy Toggle Size',
        colors: LightTheme.colors,
        components: { toggle: { options: { size: 18 } } },
      }),
      { select: true }
    );
    render('sm');

    const rule = emittedRuleFor(track().parentElement!);
    expect(rule).toContain('width:36px');
    expect(rule).toContain('height:18px');
    expect(emittedRuleFor(hidden())).toContain('translateX(18px)');
  });
});

describe('UniToggleComponent checked color', () => {
  let fixture: ComponentFixture<UniToggleComponent>;

  const hidden = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniToggleComponent);
  });

  const colorFor = (token: 'primary' | 'success' | 'warn'): string =>
    TestBed.inject(ThemeService).colors()[token]!.toLowerCase();

  // The serialized rule mixes forms — the browser normalizes `background-color`
  // to `rgb(...)` but leaves the focus ring's `outline` as the raw hex — so the
  // hex is matched against the ring, lowercased on both sides.
  const accentRule = (): string => emittedRuleFor(hidden()).toLowerCase();

  it('wears the variant when nothing else is set', () => {
    fixture.componentRef.setInput('variant', 'warn');
    fixture.detectChanges();
    expect(accentRule()).toContain(colorFor('warn'));
  });

  it('lets the checkedColor input beat the variant', () => {
    fixture.componentRef.setInput('variant', 'warn');
    fixture.componentRef.setInput('checkedColor', 'success');
    fixture.detectChanges();
    expect(accentRule()).toContain(colorFor('success'));
    expect(accentRule()).not.toContain(colorFor('warn'));
  });
});
