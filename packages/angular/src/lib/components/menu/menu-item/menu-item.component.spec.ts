import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMenuItemComponent } from './menu-item.component';

describe('UniMenuItemComponent', () => {
  let fixture: ComponentFixture<UniMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniMenuItemComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniMenuItemComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has menuitem semantics and programmatic focusability', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('menuitem');
    expect(host.getAttribute('tabindex')).toBe('-1');
  });

  it('reflects disabled and active state as ARIA attributes', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-disabled')).toBeNull();
    expect(host.getAttribute('aria-current')).toBeNull();

    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.getAttribute('aria-current')).toBe('true');
  });

  it('focus() moves focus to the host element', () => {
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(fixture.nativeElement);
    (fixture.nativeElement as HTMLElement).remove();
  });
});
