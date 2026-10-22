import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTextareaComponent } from './textarea.component';
import { emittedRuleFor } from '../../../testing/emitted-css';

describe('UniTextareaComponent', () => {
  let fixture: ComponentFixture<UniTextareaComponent>;

  const textarea = (): HTMLTextAreaElement =>
    (fixture.nativeElement as HTMLElement).querySelector('textarea')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniTextareaComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniTextareaComponent);
    fixture.componentRef.setInput('label', 'Message');
    fixture.detectChanges();
  });

  it('applies the label as the accessible name', () => {
    expect(textarea().getAttribute('aria-label')).toBe('Message');
  });

  it('unframed drops the field chrome', () => {
    const row = (): HTMLElement =>
      (fixture.nativeElement as HTMLElement).querySelector('uni-input-box > *')!;
    expect(emittedRuleFor(row())).toContain('border:1pxsolid');

    fixture.componentRef.setInput('unframed', true);
    fixture.detectChanges();
    expect(emittedRuleFor(row())).not.toContain('border:1pxsolid');
    expect(emittedRuleFor(row())).not.toContain(':focus');
  });

  it('updates the value model on input', () => {
    textarea().value = 'Hello there';
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('Hello there');
  });

  it('marks touched on blur and exposes aria-invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    textarea().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched()).toBe(true);
    expect(textarea().getAttribute('aria-invalid')).toBe('true');
  });

  it('takes rows from the theme options and lets the input override them', () => {
    expect(textarea().rows).toBe(3); // theme default
    fixture.componentRef.setInput('rows', 8);
    fixture.detectChanges();
    expect(textarea().rows).toBe(8);
  });
});
