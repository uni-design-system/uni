import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { UniNotificationBadgeComponent } from './notification-badge';
import { ThemeService } from '../../theming';
import { emittedRuleFor } from '../../../testing/emitted-css';

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

  /**
   * An inline-block wrapper sits on the text baseline and keeps line-height
   * below it, which dropped a wrapped nav link under its flex siblings. The
   * wrapper must not move what it wraps.
   */
  it('wraps as inline-flex so the wrapped element keeps its place in a flex row', () => {
    const rule = emittedRuleFor(fixture.nativeElement as HTMLElement);
    expect(rule).toContain('display:inline-flex');
    expect(rule).toContain('align-items:center');
  });

  /** `typeface` was declared in the options interface and never read. */
  it('sets the count in the theme typeface option', () => {
    const theme = TestBed.inject(ThemeService);
    theme.registerTheme(
      createTheme({
        id: 'SerifCount',
        name: 'Serif Count',
        colors: LightTheme.colors,
        components: { notificationBadge: { options: { typeface: 'headline-large' } } },
      }),
      { select: true }
    );
    fixture.detectChanges();

    const span = (fixture.nativeElement as HTMLElement).querySelector('[uni-text]')!;
    const { fontSize } = theme.typeface('headline-large') as { fontSize: string | number };
    expect(emittedRuleFor(span)).toContain(`font-size:${fontSize}`);
  });

  describe('sizes', () => {
    const indicatorRule = () =>
      emittedRuleFor(fixture.nativeElement as HTMLElement).split('.notification-badge-indicator')[1];

    it('draws the default (lg) disc at 20px, as before the sizes block', () => {
      expect(indicatorRule()).toContain('height:20px');
      expect(indicatorRule()).toContain('min-width:20px');
    });

    it('reads the disc size for `size` from the theme sizes block', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(indicatorRule()).toContain('height:14px');
    });

    it('lets a count widen instead of clipping it to a fixed square', () => {
      fixture.componentRef.setInput('count', 150);
      fixture.detectChanges();
      const span = (fixture.nativeElement as HTMLElement).querySelector('[uni-text]')!;
      expect(span.getAttribute('style')).toBeNull();
      expect(indicatorRule()).not.toMatch(/[^-]width:20px/);
    });
  });

  it('keeps a usable position when the theme omits the offset option', () => {
    TestBed.inject(ThemeService).registerTheme(
      createTheme({
        id: 'NoOffset',
        name: 'No Offset',
        colors: LightTheme.colors,
        components: { notificationBadge: { options: { offset: undefined } } },
      }),
      { select: true }
    );
    fixture.detectChanges();

    // Without the fallback the position serialized as the invalid 'undefinedpx'.
    const styles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('');
    expect(styles).not.toContain('undefinedpx');
  });
});
