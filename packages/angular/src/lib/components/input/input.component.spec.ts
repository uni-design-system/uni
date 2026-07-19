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
});
