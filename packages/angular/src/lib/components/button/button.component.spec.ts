import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniButtonComponent } from './button.component';

describe('UniButtonComponent', () => {
  let fixture: ComponentFixture<UniButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniButtonComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('is disabled and marked busy while loading', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.hasAttribute('disabled')).toBe(true);
  });

  it('is disabled via the disable input', () => {
    fixture.componentRef.setInput('disable', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).hasAttribute('disabled')).toBe(true);
  });
});
