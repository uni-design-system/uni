/**
 * A radio group's two levels of type — the heading and the choices under it —
 * plus per-option content, geometry and spacing.
 *
 * Assertions read the emitted CSS: jsdom performs no layout, so the rule that
 * makes a claim true is the assertable part, not the measurement.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniRadioComponent } from './radio.component';
import { UniRadioOptionDirective } from './radio-option.directive';
import { UNI_THEMES } from '../../theming/theme.token';
import { emittedRuleFor } from '../../../testing/emitted-css';

const OPTIONS = [
  { label: 'Basic', value: 'basic' },
  { label: 'Pro', value: 'pro' },
];

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
      components: { radio: { options } },
    });
    TestBed.configureTestingModule({ providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }] });
  }
  const fixture = TestBed.createComponent(UniRadioComponent);
  fixture.componentRef.setInput('options', OPTIONS);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
};

const heading = (host: HTMLElement) => host.querySelector('span')!;
const optionLabel = (host: HTMLElement) => host.querySelector('label span')!;

describe('UniRadioComponent typography', () => {
  it('gives the heading and the options separate roles', () => {
    // Both were `label` until 11.2, so a group had no hierarchy between its
    // heading and its choices — the same role at the same size.
    const host = render(
      { label: 'Plan' },
      { groupTextRole: 'title-medium', textRole: 'caption' }
    );

    expect(emittedRuleFor(heading(host))).toContain('font-size:16px');
    expect(emittedRuleFor(optionLabel(host))).toContain('font-size:12px');
  });

  it('falls back to `label` for both, exactly as before', () => {
    const host = render({ label: 'Plan' });
    expect(emittedRuleFor(heading(host))).toContain('line-height:20px');
    expect(emittedRuleFor(optionLabel(host))).toContain('line-height:20px');
  });

  it('inks each level independently', () => {
    const host = render({ label: 'Plan' }, { groupTextColor: 'on-surface-variant' });
    expect(emittedRuleFor(heading(host))).toMatch(/\.css-[\w-]+\.css-[\w-]+\{color:/);
    expect(emittedRuleFor(optionLabel(host))).not.toMatch(/\.css-[\w-]+\.css-[\w-]+\{color:/);
  });
});

describe('UniRadioComponent labelHidden', () => {
  it('hides the heading but keeps it as the group name', () => {
    const host = render({ label: 'Plan', labelHidden: true });
    const group = host.querySelector('[role="radiogroup"]')!;

    // The heading still carries the id aria-labelledby points at, so the
    // group is still named — it is simply not drawn.
    expect(heading(host).textContent).toBe('Plan');
    expect(group.getAttribute('aria-labelledby')).toBe(heading(host).getAttribute('id'));
    expect(emittedRuleFor(heading(host))).toContain('clip-path:inset(50%)');
  });

  it('leaves the option labels visible', () => {
    const host = render({ label: 'Plan', labelHidden: true });
    expect(emittedRuleFor(optionLabel(host))).not.toContain('clip-path:inset(50%)');
  });
});

describe('UniRadioComponent geometry and spacing', () => {
  const optionRule = (host: HTMLElement) => emittedRuleFor(host.querySelector('label')!);

  const cases = [
    { size: 'sm', height: 16 },
    { size: 'md', height: 18 },
    { size: 'lg', height: 20 },
  ] as const;

  for (const { size, height } of cases) {
    it(`sizes the circle for size="${size}"`, () => {
      const rule = optionRule(render({ size }));
      expect(rule).toContain(`width:${height}px`);
      // The dot stays 60% of the circle at every size.
      expect(rule).toContain(`width:${height * 0.6}px`);
    });
  }

  it('renders the pre-sizes geometry when no size is given', () => {
    expect(optionRule(render())).toContain('width:20px');
  });

  it('lets a theme still stating one global size outrank the block', () => {
    const rule = optionRule(render({ size: 'sm' }, { size: 24 }));
    expect(rule).toContain('width:24px');
    expect(rule).not.toContain('width:16px');
  });

  it('spaces circle from label, and option from option, as tokens', () => {
    expect(optionRule(render({}, { gap: 'md' }))).toContain('gap:16px');
    expect(
      emittedRuleFor(render({}, { groupGap: 'lg' }).querySelector('[role="radiogroup"]')!)
    ).toContain('gap:32px');
  });

  it('keeps 8px beside the circle and 12px between rows by default', () => {
    // 12px is not a step on the base spacing scale; it is what this group has
    // always drawn, so it stays a literal rather than dev-warning on a miss.
    expect(optionRule(render())).toContain('gap:8px');
    expect(emittedRuleFor(render().querySelector('[role="radiogroup"]')!)).toContain('gap:12px');
  });

  it('fills the container on request', () => {
    expect(optionRule(render({ fullWidth: true }))).toContain('width:100%');
  });
});

describe('UniRadioComponent option template', () => {
  const Host = Component({
    selector: 'uni-test-host',
    imports: [UniRadioComponent, UniRadioOptionDirective],
    template: `<uni-radio [options]="options" [(value)]="value">
      <ng-template uniRadioOption let-option>
        <span class="row-title">{{ option.label }}</span>
        <span class="row-value">{{ option.value }}</span>
      </ng-template>
    </uni-radio>`,
  })(class TestHost {
    options = OPTIONS;
    value = '';
  });

  it('renders once per option, with that option as its context', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const titles = Array.from(host.querySelectorAll('.row-title')).map((el) => el.textContent);
    expect(titles).toEqual(['Basic', 'Pro']);
    expect(host.querySelector('.row-value')!.textContent).toBe('basic');
  });

  it('keeps each row inside its own label, so the whole row selects', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    (host.querySelectorAll('.row-title')[1] as HTMLElement).click();
    fixture.detectChanges();

    expect((fixture.componentInstance as { value: string }).value).toBe('pro');
  });
});
