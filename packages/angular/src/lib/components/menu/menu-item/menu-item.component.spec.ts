import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMenuItemComponent } from './menu-item.component';
import { ThemeService } from '../../../theming';

/** Joined text of every emotion style tag that mentions the given class. */
const stylesFor = (className: string) =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .filter((text) => text.includes(`.${className}`))
    .join('');

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

  it('derives its look from the menuItem theme options', () => {
    const className = (fixture.nativeElement as HTMLElement).className;
    // Base theme menuItem options: height 38, the `control` motion token's
    // 0.3s hover transition, and the typeface applied on the host so labels
    // and templated content inherit it.
    expect(stylesFor(className)).toContain('height:38px');
    expect(stylesFor(className)).toContain('transition:all 0.3s ease');
    expect(stylesFor(className)).toContain('font-size');
  });

  describe('highlight state', () => {
    /** Selector text that would paint on programmatic (pointer-open) focus. */
    const BARE_FOCUS = /:focus(?![-\w])/;

    it('paints on hover and keyboard focus, never on programmatic focus', () => {
      const styles = stylesFor((fixture.nativeElement as HTMLElement).className);
      expect(styles).toContain(':focus-visible');
      // `onOpened()` focuses an item on every open, including pointer opens —
      // a bare `:focus` rule would highlight an item the mouse user never
      // touched, reading as a preselected default.
      expect(styles).not.toMatch(BARE_FOCUS);
    });

    it('keeps variant tones on the same selector so they still override', () => {
      fixture.componentRef.setInput('variant', 'warn');
      fixture.detectChanges();

      const className = (fixture.nativeElement as HTMLElement).className;
      const styles = stylesFor(className);
      const warnContainer = TestBed.inject(ThemeService).colors()['warn-container'];

      // Emotion merges by exact selector text: a variant keyed `&:hover,
      // &:focus` would miss the override *and* reintroduce the phantom
      // highlight, so the tone must ride the same selector as the base rule.
      expect(styles).toContain(warnContainer);
      expect(styles).not.toMatch(BARE_FOCUS);
    });
  });

  describe('description', () => {
    const description = () =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '[data-part="description"]'
      );

    it('renders nothing extra without one', () => {
      fixture.componentRef.setInput('label', 'Freight');
      fixture.detectChanges();
      expect(description()).toBeNull();
    });

    it('trails the label on the same line in the theme descriptionColor', () => {
      fixture.componentRef.setInput('label', 'Freight');
      fixture.componentRef.setInput('description', 'Carrier charges');
      fixture.detectChanges();

      const desc = description()!;
      expect(desc.textContent?.trim()).toBe('Carrier charges');
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Freight');

      const styles = stylesFor(desc.className);
      expect(styles).toContain('margin-left:auto');
      expect(styles).toContain('white-space:nowrap');
      expect(styles).toContain(TestBed.inject(ThemeService).colors()['on-surface-variant']);
      // One line: the row aligns on the baseline and the item keeps its height.
      expect(stylesFor(desc.parentElement!.className)).toContain('align-items:baseline');
      expect(stylesFor((fixture.nativeElement as HTMLElement).className)).toContain('height:38px');
    });

    it('takes the disabled color with the rest of a disabled item', () => {
      fixture.componentRef.setInput('label', 'Freight');
      fixture.componentRef.setInput('description', 'Carrier charges');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(stylesFor((fixture.nativeElement as HTMLElement).className)).toMatch(
        /\[aria-disabled="true"\] \[data-part="description"\]\{color:inherit/
      );
    });
  });

  it('lets the hoverColor input override the theme option', () => {
    const themedClass = (fixture.nativeElement as HTMLElement).className;

    fixture.componentRef.setInput('hoverColor', 'secondary-container');
    fixture.detectChanges();

    const overriddenClass = (fixture.nativeElement as HTMLElement).className;
    expect(overriddenClass).not.toBe(themedClass);

    const secondaryContainer = TestBed.inject(ThemeService).colors()['secondary-container'];
    expect(stylesFor(overriddenClass)).toContain(secondaryContainer);
  });
});
