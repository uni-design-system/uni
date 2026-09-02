/**
 * Two things a button owes its theme.
 *
 * Both were reported by a consuming app against 10.2.1 and both are asserted
 * against the emitted CSS rather than computed style, because both failed in
 * ways that look fine: a dropped `outline` still leaves `outline-offset`
 * behind, and an overridden `border` still renders a button.
 */
import { TestBed } from '@angular/core/testing';
import { LightTheme } from '@uni-design-system/uni-core';
import { UniButtonComponent } from './button.component';
import { emittedRuleFor } from '../../../testing/emitted-css';

const c = LightTheme.colors;
const asRgb = (value: string) => {
  const n = parseInt(value.slice(1), 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
};
/** A colour reaches the sheet as raw hex (`outline`) or `rgb()` (`border`). */
const shows = (rules: string, token: string) =>
  rules.includes(c[token]!.toLowerCase()) || rules.includes(asRgb(c[token]!));

const render = (variant?: string): string => {
  const fixture = TestBed.createComponent(UniButtonComponent);
  if (variant) fixture.componentRef.setInput('variant', variant);
  fixture.detectChanges();
  return emittedRuleFor(fixture.nativeElement as HTMLElement).toLowerCase();
};

beforeEach(async () => {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({ imports: [UniButtonComponent] }).compileComponents();
});

describe('button focus ring (WCAG 2.4.7)', () => {
  it('is visible for every variant the theme defines', () => {
    for (const variant of ['primary', 'secondary', 'tertiary', 'warn', 'success', 'ghost']) {
      const rules = render(variant);
      expect(rules, variant).toContain(':focus-visible');
      // The failure mode this guards: `2px solid undefined` is dropped by the
      // parser, leaving the rule with only an offset.
      expect(rules, variant).not.toContain('undefined');
      expect(rules.match(/outline:2pxsolid[^;]+/)?.[0], variant).toBeTruthy();
    }
  });

  it('keeps each variant the ring colour it already had', () => {
    // Anything else would be a silent restyle of every focused button.
    for (const variant of ['primary', 'secondary', 'tertiary', 'warn', 'success']) {
      expect(shows(render(variant), variant), variant).toBe(true);
    }
  });

  it('gives `ghost` a visible ring instead of a transparent one', () => {
    // `colors.ghost` is `rgba(0,0,0,0)`, so resolving the variant *name* as a
    // colour drew the ring in transparent — present, and invisible.
    const rules = render('ghost');
    expect(rules).not.toContain('2pxsolidrgba(0,0,0,0)');
    expect(shows(rules, 'primary')).toBe(true);
  });

  it('gives a ring to a variant the theme never styled', () => {
    // `light` has no colour token at all, so the old lookup emitted
    // `2px solid undefined`. A consumer-registered intent behaves identically.
    const rules = render('light');
    expect(rules).not.toContain('undefined');
    expect(shows(rules, 'primary')).toBe(true);
  });
});

describe('theme outranks the component reset', () => {
  it("renders `secondary`'s border — the theme's own hollow archetype", () => {
    // base.theme marks this variant "Hollow" and declares `1px solid`, which
    // the component's `border: 0` erased because it was applied afterwards.
    expect(shows(render('secondary'), 'secondary')).toBe(true);
    expect(render('secondary')).toMatch(/border:1pxsolid/);
  });

  it('still resets the border for variants that ask for none', () => {
    // The reset is not gone, only outranked: `primary` declares `border: '0'`.
    expect(render('primary')).not.toMatch(/border:1pxsolid/);
  });

  it("emits the theme's border, not the reset — so no `!important` is needed", () => {
    // Emotion merges the objects, so exactly one `border` declaration survives.
    // Which one it is *is* the ordering: with the reset applied last, this rule
    // read `border:0` and a theme had to shout to be heard.
    const rules = render('secondary');
    expect(rules).toMatch(/border:1pxsolid/);
    expect(rules).not.toMatch(/border:0[;}]/);
    // and the winning declaration carries no `!important` of its own
    expect(rules.match(/border:1pxsolid[^;]*/)?.[0]).not.toContain('!important');
  });
});
