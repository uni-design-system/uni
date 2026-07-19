import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniToggleComponent } from './toggle.component';

describe('UniToggleComponent', () => {
  let fixture: ComponentFixture<UniToggleComponent>;

  const input = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniToggleComponent);
    fixture.detectChanges();
  });

  it('announces as a switch', () => {
    expect(input().getAttribute('role')).toBe('switch');
  });

  it('updates the checked model on change', () => {
    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('sets aria-invalid once touched and invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });
});
