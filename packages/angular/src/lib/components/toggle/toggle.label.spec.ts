/**
 * The label a toggle draws. Same contract as `uni-checkbox` — the two render
 * the label identically and a theme should not have to say it twice.
 *
 * Assertions read the emitted CSS: jsdom performs no layout, so the rule that
 * makes a claim true is the assertable part, not the measurement.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniToggleComponent } from './toggle.component';
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
      components: { toggle: { options } },
    });
    TestBed.configureTestingModule({ providers: [{ provide: UNI_THEMES, useValue: { Test: theme } }] });
  }
  const fixture = TestBed.createComponent(UniToggleComponent);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
};

describe('UniToggleComponent label', () => {
  it('wears the theme-stated text role', () => {
    const rule = emittedRuleFor(
      render({ label: 'Email me' }, { textRole: 'caption' }).querySelector('span')!
    );
    expect(rule).toContain('font-size:12px');
  });

  it('falls back to `label`, exactly as before', () => {
    const rule = emittedRuleFor(render({ label: 'Email me' }).querySelector('span')!);
    expect(rule).toContain('font-size:14px');
    expect(rule).toContain('line-height:20px');
  });

  it('inks the label at a specificity a container cannot beat', () => {
    const rule = emittedRuleFor(
      render({ label: 'Email me' }, { textColor: 'on-surface-variant' }).querySelector('span')!
    );
    expect(rule).toMatch(/\.css-[\w-]+\.css-[\w-]+\{color:/);
  });

  it('hides the label while keeping it as the name', () => {
    const host = render({ label: 'Notify', labelHidden: true });
    expect(host.querySelector('span')!.textContent).toBe('Notify');
    expect(emittedRuleFor(host.querySelector('span')!)).toContain('position:fixed');
  });

  it('measures as the control it contains, and fills only on request', () => {
    expect(emittedRuleFor(render({ label: 'x' }))).toContain('display:inline-flex');
    expect(emittedRuleFor(render({ label: 'x', fullWidth: true }))).toContain('width:100%');
  });

  it('spaces the track from its label with a spacing token, 8px by default', () => {
    expect(emittedRuleFor(render({ label: 'x' }).querySelector('label')!)).toContain('gap:8px');
    expect(
      emittedRuleFor(render({ label: 'x' }, { gap: 'md' }).querySelector('label')!)
    ).toContain('gap:16px');
  });

  it('keeps the track from being squashed by a long label', () => {
    expect(emittedRuleFor(render({ label: 'x' }).querySelector('label')!)).toContain(
      'flex-shrink:0'
    );
  });
});

describe('UniToggleComponent projected content', () => {
  const Host = Component({
    selector: 'uni-test-host',
    imports: [UniToggleComponent],
    template: `<uni-toggle label="Dark mode" labelHidden><span>Dark mode</span></uni-toggle>`,
  })(class TestHost {});

  it('projects into the control own label, so the whole row toggles it', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const label = host.querySelector('label')!;
    expect(label.textContent).toContain('Dark mode');

    (label.querySelectorAll('span')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(host.querySelector('input')!.checked).toBe(true);
  });
});
