import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCheckboxComponent } from './checkbox.component';

describe('UniCheckboxComponent', () => {
  let fixture: ComponentFixture<UniCheckboxComponent>;

  const input = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input[type="checkbox"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCheckboxComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCheckboxComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reflects and updates the checked model on user change', () => {
    expect(input().checked).toBe(false);

    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.checked()).toBe(true);
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('supports indeterminate and clears it on interaction', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(input().indeterminate).toBe(true);

    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.indeterminate()).toBe(false);
  });

  it('sets aria-invalid only after the user has interacted', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBeNull();

    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('associates the label text with the input via the wrapping label', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    expect(label?.textContent).toContain('Accept terms');
    expect(label?.querySelector('input')).not.toBeNull();
  });
});
