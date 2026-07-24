import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniIconComponent } from './icon.component';

describe('UniIconComponent', () => {
  let fixture: ComponentFixture<UniIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniIconComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniIconComponent);
    fixture.componentRef.setInput('name', 'close');
    fixture.detectChanges();
  });

  it('masks the default theme icon over currentColor', () => {
    const host = fixture.nativeElement as HTMLElement;
    // Standard + webkit mask carry the theme's data-URI SVG.
    expect(host.style.getPropertyValue('mask-image')).toContain('data:image/svg+xml');
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders nothing (not a broken url) for unknown icon names', () => {
    fixture.componentRef.setInput('name', 'no-such-icon');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('mask-image')).toBe(
      'none'
    );
  });
});
