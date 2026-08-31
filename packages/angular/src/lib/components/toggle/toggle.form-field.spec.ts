/**
 * The one test in this library that actually compiles a Signal Forms binding.
 *
 * Every form control here implements `FormValueControl`/`FormCheckboxControl`,
 * but nothing bound one — so when Angular renamed the directive's selector from
 * `[field]` (the 21.0 preview) to `[formField]`, the library's docs went stale
 * across seven components and five MDX files and no test noticed. A consuming
 * app found it, not us.
 *
 * `uni-toggle` stands in for the family: the contract it satisfies is shared, so
 * if the selector or the control interface moves again, this fails to compile
 * or fails outright rather than rotting in prose.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { UniToggleComponent } from './toggle.component';

@Component({
  imports: [UniToggleComponent, FormField],
  template: `<uni-toggle label="Enable feature" [formField]="settings.enabled" />`,
})
class FormHost {
  readonly model = signal({ enabled: false });
  readonly settings = form(this.model, (path) => {
    required(path.enabled);
  });
}

describe('uni-toggle bound with [formField]', () => {
  let fixture: ComponentFixture<FormHost>;

  const toggle = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHost] }).compileComponents();
    fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
  });

  it('drives the control from the field state', () => {
    expect(toggle().checked).toBe(false);

    fixture.componentInstance.model.set({ enabled: true });
    fixture.detectChanges();
    expect(toggle().checked).toBe(true);
  });

  it('writes user interaction back into the model', () => {
    toggle().checked = true;
    toggle().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.model().enabled).toBe(true);
  });

  it('marks the field touched, which is what gates error display', () => {
    expect(fixture.componentInstance.settings.enabled().touched()).toBe(false);

    toggle().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.settings.enabled().touched()).toBe(true);
  });

  it('syncs required() from the schema onto the control', () => {
    // The `required` input is a11y-only — it exists so the directive can push
    // validator state down to aria-required.
    expect(toggle().getAttribute('aria-required')).toBe('true');
  });
});
