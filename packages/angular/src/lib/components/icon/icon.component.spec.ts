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

    /**
     * `size="24"` in a template is a static attribute, so it arrives as a
     * string. Treating it as unitless emitted the invalid `width: 24`, which the
     * browser drops — the icon then silently filled its container instead, and
     * collapsed to nothing inside a content-sized flex row.
     */
    it('treats a bare numeric string as px, like the static attribute form', () => {
      fixture.componentRef.setInput('size', '24');
      fixture.detectChanges();
      expect(host().style.width).toBe('24px');
      expect(host().style.height).toBe('24px');
    });

    it('handles a fractional numeric string and stray whitespace', () => {
      fixture.componentRef.setInput('size', ' 13.5 ');
      fixture.detectChanges();
      expect(host().style.width).toBe('13.5px');
    });

    it.each(['1.25rem', '2em', '50%'])('leaves the CSS length %s alone', (value) => {
      fixture.componentRef.setInput('size', value);
      fixture.detectChanges();
      expect(host().style.width).toBe(value);
    });

    it('does not px-suffix a function-valued length', () => {
      // Exact serialisation is the DOM's business — browsers reorder `calc()`
      // terms — so assert only that the value survives as a function.
      fixture.componentRef.setInput('size', 'calc(1rem + 2px)');
      fixture.detectChanges();
      expect(host().style.width).toContain('calc(');
      expect(host().style.width).not.toMatch(/^\d+px$/);
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
