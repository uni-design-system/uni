/**
 * The contract that lets `Variant` be an open registry.
 *
 * Before this, the selection controls resolved the variant *name* as a colour
 * token — safe only because all twelve names happened to also be colours. Under
 * an open set that coincidence ends by design: `variant="destructive"` would
 * miss and silently render primary, which is a wrong-coloured control with
 * nothing to grep for. The theme now says which colour draws each intent, and a
 * variant the theme never styled says so once in dev.
 *
 * Asserted against the emitted CSS rather than computed style: these colours sit
 * behind `:checked` and `:focus` combinators, where jsdom's cascade is not a
 * trustworthy oracle.
 */
import type { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LightTheme } from '@uni-design-system/uni-core';
import { UniCheckboxComponent } from '../components/checkbox/checkbox.component';
import { UniRadioComponent } from '../components/radio/radio.component';
import { UniToggleComponent } from '../components/toggle/toggle.component';
import { emittedRuleFor } from '../../testing/emitted-css';

const c = LightTheme.colors;

/**
 * A colour reaches the stylesheet in two forms: `fill`, `stroke` and
 * `background-color` are normalised to `rgb(…)`, while `outline` keeps the raw
 * hex. Match either, so an assertion does not silently depend on which property
 * a control happens to use.
 */
const asRgb = (value: string) => {
  const n = parseInt(value.slice(1), 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
};
const shows = (rules: string, token: string) => {
  const value = c[token]!;
  return rules.includes(value.toLowerCase()) || rules.includes(asRgb(value));
};

/** Every emotion rule for a fixture's host subtree, lowercased for matching. */
const rulesOf = (fixture: ComponentFixture<unknown>): string => {
  const host = fixture.nativeElement as HTMLElement;
  return [host, ...Array.from(host.querySelectorAll<HTMLElement>('*'))]
    .map((el) => emittedRuleFor(el))
    .join('')
    .toLowerCase();
};

/**
 * Fixtures within one test share the TestBed injector, and therefore one
 * ThemeService — which is where the warn-once Set lives, so the dedupe test
 * needs two instances rather than two modules.
 */
const render = <T,>(type: Type<T>, inputs: Record<string, unknown> = {}): ComponentFixture<T> => {
  const fixture = TestBed.createComponent(type);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  return fixture;
};

beforeEach(async () => {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [UniCheckboxComponent, UniRadioComponent, UniToggleComponent],
  }).compileComponents();
});

describe('variant roles', () => {
  // Radio renders one input per option, so with none it emits an empty group
  // and no accent at all — it needs a row to colour.
  const controls = [
    ['uni-checkbox', UniCheckboxComponent, {}],
    ['uni-radio', UniRadioComponent, { options: [{ label: 'A', value: 'a' }] }],
    ['uni-toggle', UniToggleComponent, {}],
  ] as const;

  for (const [name, type, setup] of controls) {
    describe(name, () => {
      it('defaults to the primary accent — the pre-registry rendering', () => {
        expect(shows(rulesOf(render(type as Type<unknown>, setup)), 'primary')).toBe(true);
      });

      it('wears the themed accent for an explicit variant, not a silent primary', () => {
        const rules = rulesOf(render(type as Type<unknown>, { ...setup, variant: 'warn' }));
        expect(shows(rules, 'warn')).toBe(true);
        expect(shows(rules, 'primary')).toBe(false);
      });

      it('lets the checkedColor input override the variant', () => {
        const rules = rulesOf(
          render(type as Type<unknown>, { ...setup, variant: 'warn', checkedColor: 'success' })
        );
        expect(shows(rules, 'success')).toBe(true);
        expect(shows(rules, 'warn')).toBe(false);
      });
    });
  }

  it('pairs the checkbox tick with the accent, not a name-derived on-color', () => {
    // `getOnColor` used to build `on-${variant}`, so an unregistered intent fell
    // back to on-primary and the tick stayed light on a dark fill.
    expect(shows(rulesOf(render(UniCheckboxComponent, { variant: 'warn' })), 'on-warn')).toBe(true);
  });
});

describe('unthemed variant warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => warn.mockRestore());

  it('says nothing for the default variant on any control', () => {
    render(UniCheckboxComponent);
    render(UniRadioComponent);
    render(UniToggleComponent);
    expect(warn).not.toHaveBeenCalled();
  });

  it('says nothing for a variant the theme does define', () => {
    render(UniCheckboxComponent, { variant: 'success' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('names the component, the variant and what the theme does define', () => {
    // `light` is a real Variant, but the selection controls theme the same
    // seven intents button does — so this is the unthemed case.
    render(UniCheckboxComponent, { variant: 'light' });

    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]![0]);
    expect(message).toContain('[uni]');
    expect(message).toContain('"light"');
    expect(message).toContain('"checkbox"');
    expect(message).toContain('primary');
  });

  it('warns once per component/variant pair, not once per instance', () => {
    render(UniCheckboxComponent, { variant: 'light' });
    render(UniCheckboxComponent, { variant: 'light' });
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
