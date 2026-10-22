import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniInputComponent } from './input.component';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniInputComponent', () => {
  let fixture: ComponentFixture<UniInputComponent>;

  const input = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniInputComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
  });

  it('applies the label as the accessible name', () => {
    expect(input().getAttribute('aria-label')).toBe('Email');
  });

  it('updates the value model on input', () => {
    input().value = 'hi@example.com';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('hi@example.com');
  });

  it('marks touched on blur and exposes aria-invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched()).toBe(true);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('defaults to a text input', () => {
    expect(input().type).toBe('text');
  });

  it('reaches the native element with the type', () => {
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
    expect(input().type).toBe('email');
  });

  it('sets readonly as a DOM property, not just an attribute', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(input().readOnly).toBe(true);
  });

  it('emits no attribute for a passthrough that was never set', () => {
    for (const attr of ['autocomplete', 'inputmode', 'list', 'name', 'min', 'max', 'step']) {
      expect(input().hasAttribute(attr)).toBe(false);
    }
  });

  it('reflects the passthroughs that were set', () => {
    fixture.componentRef.setInput('autocomplete', 'email');
    fixture.componentRef.setInput('inputMode', 'email');
    fixture.componentRef.setInput('list', 'domains');
    fixture.detectChanges();
    expect(input().getAttribute('autocomplete')).toBe('email');
    expect(input().getAttribute('inputmode')).toBe('email');
    expect(input().getAttribute('list')).toBe('domains');
  });

  // Signal Forms treats multiple patterns as all-must-match; the native
  // attribute can only express one, so it is reflected only when unambiguous.
  it('reflects a single pattern natively and omits ambiguous ones', () => {
    fixture.componentRef.setInput('pattern', [/^\d+$/]);
    fixture.detectChanges();
    expect(input().getAttribute('pattern')).toBe('^\\d+$');

    fixture.componentRef.setInput('pattern', [/^\d+$/, /4$/]);
    fixture.detectChanges();
    expect(input().hasAttribute('pattern')).toBe(false);
  });
});

/**
 * The three presentation choices other controls already exposed and the text
 * fields did not, so apps reached past the component boundary (`::ng-deep`,
 * encapsulation off) to make them.
 */
describe('UniInputComponent chrome', () => {
  let fixture: ComponentFixture<UniInputComponent>;

  const row = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('uni-input-box > *')!;
  const input = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniInputComponent);
    fixture.componentRef.setInput('label', 'Subject');
    fixture.detectChanges();
  });

  // The row's own block opens with the theme's colour pair; the border is the
  // themed `1px solid`; the inset is the 8px on the inner control's padding.
  // (`border:medium` elsewhere in the rule is the platform reset on the inner
  // control, which is not chrome.)
  it('is framed by default: fill, border, inset and a focus treatment', () => {
    const rule = emittedRuleFor(row());
    expect(rule).toMatch(/\{color:[^;]+;background-color:[^;]+;display:flex/);
    expect(rule).toContain('border:1pxsolid');
    expect(rule).toContain('border-radius');
    expect(rule).toContain('padding:0px0px0px8px');
    expect(rule).toContain(':focus');
  });

  it('unframed drops the chrome, the leading inset and the focus treatment', () => {
    fixture.componentRef.setInput('unframed', true);
    fixture.detectChanges();
    const rule = emittedRuleFor(row());
    expect(rule).not.toMatch(/\{color:[^;]+;background-color:[^;]+;display:flex/);
    expect(rule).not.toContain('border:1pxsolid');
    expect(rule).not.toContain('border-radius');
    expect(rule).not.toContain('box-shadow:0');
    expect(rule).not.toContain('padding:0px0px0px8px');
    expect(rule).not.toContain(':focus');
  });

  it('still exposes the error state while unframed', () => {
    fixture.componentRef.setInput('unframed', true);
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('dirty', true);
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('aligns the text with align, as uni-number-input does', () => {
    expect(emittedRuleFor(input())).not.toContain('text-align');
    fixture.componentRef.setInput('align', 'center');
    fixture.detectChanges();
    expect(emittedRuleFor(input())).toContain('text-align:center');
  });

  it('reads a bare unframed attribute as true', async () => {
    const Host = Component({
      selector: 'uni-test-host',
      imports: [UniInputComponent],
      template: `<uni-input label="Subject" unframed />`,
    })(class TestHost {});
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const hostFixture = TestBed.createComponent(Host);
    hostFixture.detectChanges();
    const instance = hostFixture.debugElement
      .query((node) => (node.nativeElement as HTMLElement | null)?.matches?.('uni-input') === true)
      .injector.get(UniInputComponent);
    expect(instance.unframed()).toBe(true);
  });
});
