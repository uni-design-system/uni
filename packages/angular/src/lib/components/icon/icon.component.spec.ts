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

  describe('size', () => {
    const host = () => fixture.nativeElement as HTMLElement;

    it('sets no inline size by default, so the icon fills its container', () => {
      // The container-driven default is what lets a themed control size its
      // own glyph through padding — setting a size here would break that.
      expect(host().style.width).toBe('');
      expect(host().style.height).toBe('');
    });

    it('treats a bare number as px', () => {
      fixture.componentRef.setInput('size', 20);
      fixture.detectChanges();
      expect(host().style.width).toBe('20px');
      expect(host().style.height).toBe('20px');
    });

    it('passes a CSS length string through untouched', () => {
      fixture.componentRef.setInput('size', '1.25rem');
      fixture.detectChanges();
      expect(host().style.width).toBe('1.25rem');
      expect(host().style.height).toBe('1.25rem');
    });

    it('reverts to filling the container when the size is cleared', () => {
      fixture.componentRef.setInput('size', 20);
      fixture.detectChanges();
      fixture.componentRef.setInput('size', undefined);
      fixture.detectChanges();
      expect(host().style.width).toBe('');
      expect(host().style.height).toBe('');
    });

    it('keeps masking and colour intact when sized', () => {
      fixture.componentRef.setInput('size', 16);
      fixture.detectChanges();
      expect(host().style.getPropertyValue('mask-image')).toContain('data:image/svg+xml');
    });
  });
});
