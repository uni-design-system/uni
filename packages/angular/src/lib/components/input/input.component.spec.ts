import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniInputComponent } from './input.component';

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
