import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniNotificationBadgeComponent } from './notification-badge';

describe('UniNotificationBadgeComponent', () => {
  let fixture: ComponentFixture<UniNotificationBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniNotificationBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniNotificationBadgeComponent);
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
  });

  it('hides the visual indicator from screen readers and announces text instead', () => {
    const host: HTMLElement = fixture.nativeElement;
    const indicator = host.querySelector('.notification-badge-indicator');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    expect(host.textContent).toContain('5 notifications');
  });

  it('prefers a custom ariaLabel', () => {
    fixture.componentRef.setInput('ariaLabel', '5 unread messages');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('5 unread messages');
  });

  it('caps the displayed count at maxCount', () => {
    fixture.componentRef.setInput('count', 150);
    fixture.detectChanges();
    expect(fixture.componentInstance.displayValue()).toBe('99+');
  });
});
