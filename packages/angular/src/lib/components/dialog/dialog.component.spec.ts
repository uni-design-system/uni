import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogComponent } from './dialog.component';

describe('UniDialogComponent', () => {
  let fixture: ComponentFixture<UniDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDialogComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('uses ariaLabel as the accessible name when no header is present', () => {
    fixture.componentRef.setInput('ariaLabel', 'Confirm deletion');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Confirm deletion');
    expect(host.getAttribute('aria-labelledby')).toBeNull();
  });

  it('prefers aria-labelledby once a title registers', () => {
    const component = fixture.componentInstance;
    component.hasTitle.set(true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-labelledby')).toBe(component.titleId);
  });

  it('routes native cancel (Escape) through the animated close', () => {
    const host: HTMLElement = fixture.nativeElement;

    const cancel = new Event('cancel', { cancelable: true });
    host.dispatchEvent(cancel);

    // preventDefault stops the instant native close; the closing attribute
    // drives the fade-out animation instead
    expect(cancel.defaultPrevented).toBe(true);
    expect(host.hasAttribute('closing')).toBe(true);
  });
});
