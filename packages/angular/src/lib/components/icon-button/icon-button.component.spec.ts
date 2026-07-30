import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniIconButtonComponent } from './icon-button.component';

describe('UniIconButtonComponent', () => {
  let fixture: ComponentFixture<UniIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniIconButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniIconButtonComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes ariaLabel as the accessible name', () => {
    fixture.componentRef.setInput('ariaLabel', 'Close');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Close');
  });

  it('renders a visually-hidden slot so projected text names the button', () => {
    const srSpan = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(srSpan).not.toBeNull();
  });

  it('marks the button busy while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(host.hasAttribute('disabled')).toBe(true);
  });

  describe('glyph sizing', () => {
    const iconEl = () =>
      (fixture.nativeElement as HTMLElement).querySelector('uni-icon') as HTMLElement | null;
    const symbolEl = () =>
      (fixture.nativeElement as HTMLElement).querySelector('uni-symbol') as HTMLElement | null;

    /**
     * The base size tokens carry no padding, so an unsized mask fills the whole
     * button box edge to edge. Sizing from the token's `fontSize` keeps the glyph
     * inside the button and makes it scale with `size`.
     */
    it('sizes iconName from the size token fontSize, inside the button box', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('iconName', 'close');
      fixture.detectChanges();

      // sm = 22px box, fontSize 18 — the glyph fits rather than filling it.
      expect(iconEl()!.style.width).toBe('18px');
      expect(iconEl()!.style.height).toBe('18px');
    });

    /**
     * Documents a known gap rather than asserting it is correct: `uni-symbol`
     * takes its size from `opticalSize` (default 24) and ignores the button's
     * size token, so a `sm` button renders a 24px ligature in a 22px box. Masked
     * icons do not have that problem, which is one more reason to prefer
     * `iconName` over `symbolName`.
     */
    it('symbolName does not track the size token (known uni-symbol gap)', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('symbolName', 'close');
      fixture.detectChanges();
      expect(getComputedStyle(symbolEl()!).fontSize).toBe('24px');
    });

    /**
     * Sizing the glyph below the button box (the test above) only looks right
     * if the box also centres it — otherwise the glyph sits in the top-left
     * corner with all the slack on its right and bottom.
     */
    it('centres the glyph in the button box', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('iconName', 'close');
      fixture.detectChanges();

      const style = getComputedStyle(fixture.nativeElement as HTMLElement);
      expect(style.display).toBe('flex');
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('tracks the size token, not a fixed value', () => {
      fixture.componentRef.setInput('iconName', 'close');
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      const small = iconEl()!.style.width;

      fixture.componentRef.setInput('size', 'xl');
      fixture.detectChanges();
      const large = iconEl()!.style.width;

      expect(parseFloat(large)).toBeGreaterThan(parseFloat(small));
    });
  });
});
