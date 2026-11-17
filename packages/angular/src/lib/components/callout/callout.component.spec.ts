/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/popover/test.mjs`). Spotlight geometry is
 * asserted at the cdk layer (`spotlightStyles` unit tests) and as generated
 * style strings here; hit-testing, scroll tracking, and viewport centering
 * are browser-only and covered by Storybook stories.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UniCalloutDismissal } from './callout.model';
import { UniCalloutComponent } from './callout.component';
import { createTheme, LightTheme } from '@uni-design-system/uni-core';
import { ThemeService } from '../../theming';

@Component({
  imports: [UniCalloutComponent],
  template: `
    <button id="opener">Open</button>
    <input id="spot-target" />
    <uni-callout
      [(open)]="open"
      key="intro"
      [target]="target()"
      [backdrop]="backdrop()"
      [targetInteractive]="targetInteractive()"
      [dismissOnBackdrop]="dismissOnBackdrop()"
      [ariaLabel]="ariaLabel()"
      header="Meet search"
      (dismissed)="dismissals.push($event)"
    >
      Type to filter everything.
      <button callout-actions id="action-ok">Got it</button>
    </uni-callout>
  `,
})
class HostComponent {
  open = signal(false);
  target = signal<HTMLElement | string | undefined>('spot-target');
  backdrop = signal<'spotlight' | 'dim' | 'none' | undefined>(undefined);
  targetInteractive = signal(true);
  dismissOnBackdrop = signal(false);
  ariaLabel = signal<string | undefined>(undefined);
  dismissals: UniCalloutDismissal[] = [];
}

describe('UniCalloutComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  const flush = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  const callout = () =>
    fixture.debugElement.query((el) => el.name === 'uni-callout')!
      .componentInstance as UniCalloutComponent;
  const opener = () => host.querySelector<HTMLButtonElement>('#opener')!;
  const target = () => host.querySelector<HTMLInputElement>('#spot-target')!;
  const panel = () => document.getElementById(callout().panelId)!;
  const action = () => host.querySelector<HTMLButtonElement>('#action-ok')!;
  const scrimChildren = () => panel().previousElementSibling!.children;

  const openCallout = async () => {
    opener().focus();
    fixture.componentInstance.open.set(true);
    await flush();
    await flush();
  };

  const pressTab = (shiftKey = false) =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true })
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.nativeElement;
    document.body.appendChild(host);
    fixture.detectChanges();
    await flush();
  });

  afterEach(() => {
    host.remove();
  });

  it('opens with initial focus on the first action, labelled by the header', async () => {
    await openCallout();

    expect(panel().getAttribute('role')).toBe('dialog');
    expect(panel().hasAttribute('aria-modal')).toBe(false);
    const labelledBy = panel().getAttribute('aria-labelledby')!;
    expect(document.getElementById(labelledBy)?.textContent).toBe('Meet search');
    expect(document.activeElement).toBe(action());
  });

  it('an explicit ariaLabel wins over the header labelling', async () => {
    fixture.componentInstance.ariaLabel.set('Meet search, step 1 of 6');
    await openCallout();

    expect(panel().getAttribute('aria-label')).toBe('Meet search, step 1 of 6');
    expect(panel().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('Escape dismisses with reason and restores focus to the opener', async () => {
    await openCallout();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await flush();

    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissals.at(-1)).toEqual({ key: 'intro', reason: 'escape' });
    expect(document.activeElement).toBe(opener());
  });

  it('driving open to false reports a programmatic dismissal', async () => {
    await openCallout();
    fixture.componentInstance.open.set(false);
    await flush();

    expect(fixture.componentInstance.dismissals.at(-1)).toEqual({
      key: 'intro',
      reason: 'programmatic',
    });
  });

  it('spotlights the target: anchor name applied, window click-through, strips blocking', async () => {
    await openCallout();

    const anchorName = target().style.getPropertyValue('anchor-name');
    expect(anchorName).toMatch(/^--uni-anchor/);

    const styles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('');
    // pad 6 + ring 2 = 8px hole inset, tied to the target's anchor name.
    expect(styles).toContain(`position-anchor:${anchorName}`);
    expect(styles).toContain('calc(anchor(top) - 8px)');
    expect(styles).toContain('pointer-events:none');
    // window + 4 strips, no cover while the target stays interactive
    expect(scrimChildren().length).toBe(5);
  });

  it('duet loop: Tab cycles panel focusables plus the target, shift-aware', async () => {
    await openCallout();
    expect(document.activeElement).toBe(action());

    pressTab();
    expect(document.activeElement).toBe(target());

    pressTab();
    await flush();
    // wraps back to the panel's first focusable (the close button)
    expect(panel().contains(document.activeElement)).toBe(true);

    pressTab(true);
    expect(document.activeElement).toBe(target());
  });

  it('focus stays in the target after dismiss when the user moved there', async () => {
    await openCallout();
    pressTab(); // action → target
    expect(document.activeElement).toBe(target());

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await flush();
    expect(document.activeElement).toBe(target());
  });

  it('targetInteractive=false renders the cover and keeps the callout open on cover clicks', async () => {
    fixture.componentInstance.targetInteractive.set(false);
    await openCallout();

    expect(scrimChildren().length).toBe(6); // window + 4 strips + cover
    (scrimChildren()[5] as HTMLElement).click();
    await flush();
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('backdrop clicks close with reason when dismissOnBackdrop is set', async () => {
    fixture.componentInstance.dismissOnBackdrop.set(true);
    await openCallout();

    (scrimChildren()[1] as HTMLElement).click(); // a strip
    await flush();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissals.at(-1)?.reason).toBe('backdrop');
  });

  it('dim mode renders one full cover and no anchored panel', async () => {
    fixture.componentInstance.target.set(undefined);
    await openCallout();

    expect(scrimChildren().length).toBe(1);
    const styles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .filter((text) => text.includes(panel().className.split(' ')[0]))
      .join('');
    expect(styles).not.toContain('position-anchor');
  });

  it('backdrop="none" shows no scrim pieces and lets Tab pass through', async () => {
    fixture.componentInstance.backdrop.set('none');
    await openCallout();

    expect(scrimChildren().length).toBe(0);
    const before = document.activeElement;
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(before);
  });

  it("treats target='' as unset and defaults the backdrop to dim", async () => {
    fixture.componentInstance.target.set('');
    await openCallout();
    expect(scrimChildren().length).toBe(1); // the full dim cover
  });

  it('keeps the anchor and spotlight through the close fade, then tears down', async () => {
    vi.useFakeTimers();
    await openCallout();
    const anchorName = target().style.getPropertyValue('anchor-name');
    expect(anchorName).toMatch(/^--uni-anchor/);

    fixture.componentInstance.open.set(false);
    await flush();

    // Mid-fade: still anchored, spotlight pieces still rendered.
    expect(target().style.getPropertyValue('anchor-name')).toBe(anchorName);
    expect(scrimChildren().length).toBe(5);

    vi.advanceTimersByTime(300); // past transitionMs (250)
    fixture.detectChanges();
    expect(target().style.getPropertyValue('anchor-name')).toBe('');
    expect(scrimChildren().length).toBe(0);
    vi.useRealTimers();
  });

  /**
   * A panel opened by the previous step's click entered the top layer after
   * the callout's pieces, so it stacked above them and buried the next step.
   * Every retarget re-shows scrim and panel, which moves them back on top —
   * so a tour can point at the control that opens a panel and then at
   * something inside it.
   */
  it('re-shows scrim and panel, in that order, on every retarget', async () => {
    fixture.componentInstance.open.set(true);
    await flush();
    const order: string[] = [];
    vi.spyOn(panel(), 'showPopover').mockImplementation(() => void order.push('panel'));
    const scrim = panel().previousElementSibling as HTMLElement;
    vi.spyOn(scrim, 'showPopover').mockImplementation(() => void order.push('scrim'));

    fixture.componentInstance.target.set(opener());
    await flush();
    expect(order).toEqual(['scrim', 'panel']);
    vi.restoreAllMocks();
  });

  describe('arrow', () => {
    const box = (top: number, left: number, width: number, height: number) =>
      ({ top, left, width, height, right: left + width, bottom: top + height }) as DOMRect;

    /** The CSS emotion emitted for the arrow's class. */
    const arrowRule = (): string => {
      const arrow = panel().lastElementChild as HTMLElement;
      const classes = arrow.className.split(/\s+/).filter(Boolean);
      let text = '';
      for (const sheet of Array.from(document.styleSheets)) {
        for (const rule of Array.from(sheet.cssRules)) {
          const selector = (rule as CSSStyleRule).selectorText;
          if (selector && classes.some((c) => selector.includes(`.${c}`))) {
            text += (rule as CSSStyleRule).cssText.replace(/\s+/g, '');
          }
        }
      }
      return text;
    };

    afterEach(() => vi.restoreAllMocks());

    it('sits on the top edge when the panel lands below its target, as asked', async () => {
      vi.spyOn(target(), 'getBoundingClientRect').mockReturnValue(box(100, 400, 100, 40));
      vi.spyOn(panel(), 'getBoundingClientRect').mockReturnValue(box(158, 290, 320, 120));
      await openCallout();

      expect(arrowRule()).toContain('top:-4px');
      expect(arrowRule()).not.toContain('bottom:-4px');
    });

    /**
     * No room below: `position-try-fallbacks` puts the panel above. The arrow
     * used to stay on the top edge, pointing away from the control.
     */
    it('moves to the bottom edge when the browser flips the panel above', async () => {
      vi.spyOn(target(), 'getBoundingClientRect').mockReturnValue(box(700, 400, 100, 40));
      vi.spyOn(panel(), 'getBoundingClientRect').mockReturnValue(box(562, 290, 320, 120));
      await openCallout();

      expect(arrowRule()).toContain('bottom:-4px');
      expect(arrowRule()).not.toContain('top:-4px');
    });

    it('follows the panel when a scroll flips it back', async () => {
      vi.spyOn(target(), 'getBoundingClientRect').mockReturnValue(box(700, 400, 100, 40));
      const panelBox = vi
        .spyOn(panel(), 'getBoundingClientRect')
        .mockReturnValue(box(562, 290, 320, 120));
      await openCallout();
      expect(arrowRule()).toContain('bottom:-4px');

      panelBox.mockReturnValue(box(758, 290, 320, 120));
      window.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await flush();
      expect(arrowRule()).toContain('top:-4px');
    });
  });

  describe('scrim', () => {
    /** The CSS emotion emitted for an element's classes. */
    const ruleFor = (element: Element): string => {
      const classes = element.className.split(/\s+/).filter(Boolean);
      let text = '';
      for (const sheet of Array.from(document.styleSheets)) {
        for (const rule of Array.from(sheet.cssRules)) {
          const selector = (rule as CSSStyleRule).selectorText;
          if (selector && classes.some((c) => selector.includes(`.${c}`))) {
            text += (rule as CSSStyleRule).cssText.replace(/\s+/g, '');
          }
        }
      }
      return text;
    };

    const useTheme = (options: Record<string, unknown>) =>
      TestBed.inject(ThemeService).registerTheme(
        createTheme({
          id: 'Veil',
          name: 'Veil',
          colors: LightTheme.colors,
          backdrops: { scrim: { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)' } },
          components: { callout: { options } },
        }),
        { select: true }
      );

    /**
     * The dialog sets the page back with the theme's `scrim` backdrop; a tour
     * beside it should not dim the page some other way. A shadow cannot carry
     * a filter, so the frost rides on the strips around the hole.
     */
    it('takes its paint and its filter from a named backdrop', async () => {
      useTheme({ backdrop: 'scrim' });
      fixture.componentInstance.targetInteractive.set(false);
      await openCallout();

      const [win, ...rest] = Array.from(scrimChildren());
      const strips = rest.slice(0, 4);
      const cover = rest[4];
      expect(ruleFor(win)).toContain('200vmaxrgba(255,255,255,0.6)');
      for (const strip of strips) expect(ruleFor(strip)).toContain('backdrop-filter:blur(2px)');
      // The cover sits on the control being shown: never frosted.
      expect(ruleFor(cover)).not.toContain('backdrop-filter');
    });

    it('frosts the full cover when there is no target', async () => {
      useTheme({ backdrop: 'scrim' });
      fixture.componentInstance.target.set(undefined);
      await openCallout();

      const cover = scrimChildren()[0];
      expect(ruleFor(cover)).toContain('backdrop-filter:blur(2px)');
      expect(ruleFor(cover)).toContain('rgba(255,255,255,0.6)');
    });

    it('feathers the hole from the same paint when `spotlightFeather` is set', async () => {
      useTheme({ backdrop: 'scrim', spotlightFeather: 10 });
      await openCallout();

      expect(ruleFor(scrimChildren()[0])).toContain('inset0010px4pxrgba(255,255,255,0.6)');
    });

    it('is unchanged without either option: one hard-edged layer, no filter', async () => {
      await openCallout();

      const [win, strip] = Array.from(scrimChildren());
      expect(ruleFor(win)).toContain('box-shadow:000200vmaxrgba(0,0,0,0.45);');
      expect(ruleFor(win)).not.toContain('inset0');
      expect(ruleFor(strip)).not.toContain('backdrop-filter');
    });
  });

  it('cleans up its document listener when destroyed while open', async () => {
    await openCallout();
    fixture.destroy();

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
