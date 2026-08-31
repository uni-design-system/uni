/**
 * The drawer's own policy: the three-row layout, who scrolls, who pins, and
 * the close decision every route funnels through.
 *
 * The scroll *geometry* of criteria 1-4 in the adoption RFC cannot be asserted
 * here — jsdom has no layout, so `scrollHeight` and `clientHeight` are both 0.
 * Those live in the Storybook play function on the EditorPanel story, which
 * runs in a real browser. What is checked here is the CSS contract that makes
 * them true, and everything about the component that does not need layout.
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDrawerComponent } from './drawer.component';
import { UniDrawerHeaderComponent } from './drawer-header/drawer-header.component';
import { UniDrawerButtonsComponent } from './drawer-buttons/drawer-buttons.component';
import type { UniDrawerCloseRequest } from './drawer.model';

describe('UniDrawerComponent', () => {
  let fixture: ComponentFixture<UniDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDrawerComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDrawerComponent);
  });

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const dialog = (): HTMLDialogElement => host().querySelector('dialog')!;

  /**
   * The CSS emotion actually emitted for an element's classes. Needed where a
   * rule's effect depends on cascade behaviour jsdom does not reproduce.
   */
  const emittedRuleFor = (element: HTMLElement): string => {
    const classes = element.className.split(/\s+/).filter(Boolean);
    let text = '';
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        const selector = (rule as CSSStyleRule).selectorText;
        if (selector && classes.some((c) => selector.includes(`.${c}`))) {
          text += (rule as CSSStyleRule).cssText.replace(/\s+/g, '');
        }
      }
    }
    return text;
  };

  const openOverlay = (): HTMLDialogElement => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    return dialog();
  };

  it('side mode renders an aside, hidden from AT while closed', () => {
    fixture.detectChanges();
    const aside = host().querySelector('aside')!;
    expect(aside).not.toBeNull();
    expect(aside.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(aside.getAttribute('aria-hidden')).toBeNull();
  });

  it('over mode renders a native dialog', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.detectChanges();
    expect(dialog()).not.toBeNull();
  });

  it('has no accessible name until one is given', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.detectChanges();
    // Deliberately unnamed rather than defaulted to "Navigation": an editor
    // panel inheriting that would announce itself as something it is not.
    expect(dialog().getAttribute('aria-label')).toBeNull();

    fixture.componentRef.setInput('ariaLabel', 'Main navigation');
    fixture.detectChanges();
    expect(dialog().getAttribute('aria-label')).toBe('Main navigation');
  });

  it('stays hidden while closed', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.detectChanges();

    // The panel is a flex column, and in a real browser `display: flex` from
    // the emotion class outranks the UA stylesheet's
    // `dialog:not([open]) { display: none }` — so without an explicit rule the
    // closed drawer drops into normal flow and renders behind the page, on
    // first paint and again after every close.
    //
    // Asserted against the emitted rule, not the computed style: jsdom's own
    // UA sheet wins here regardless, so `getComputedStyle` reports `none`
    // whether or not the rule exists, and the guard would never fail.
    expect(emittedRuleFor(dialog())).toContain(':not([open]){display:none;}');
  });

  it('keeps the panel displayed through the closing animation', () => {
    const panel = openOverlay();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    // `closing` is set but `open` is not removed until animationend, so the
    // slide-out is still visible rather than vanishing on the first frame.
    expect(panel.hasAttribute('closing')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('flex');
  });

  it('takes a per-instance width over the theme default', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.detectChanges();
    expect(getComputedStyle(dialog()).width).toBe('280px');

    fixture.componentRef.setInput('width', 480);
    fixture.detectChanges();
    expect(getComputedStyle(dialog()).width).toBe('480px');
  });

  describe('the panel is never the scroll container', () => {
    it('clips both axes on the panel and scrolls only the body', () => {
      const panel = openOverlay();
      const body = panel.querySelector('div')!;

      // Both axes explicitly. Setting only one computes the other to `auto`,
      // which is exactly how a panel becomes an accidental scroller.
      const panelStyle = getComputedStyle(panel);
      expect(panelStyle.overflowX).toBe('clip');
      expect(panelStyle.overflowY).toBe('clip');

      const bodyStyle = getComputedStyle(body);
      expect(bodyStyle.overflowY).toBe('auto');
      expect(bodyStyle.overflowX).toBe('hidden');
      expect(bodyStyle.overscrollBehavior).toBe('contain');
    });

    it('gives the body a containing block so no descendant escapes it', () => {
      const body = openOverlay().querySelector('div')!;
      expect(getComputedStyle(body).position).toBe('relative');
    });

    it('pads the body rather than the panel, so a pinned row can sit flush', () => {
      const panel = openOverlay();
      expect(getComputedStyle(panel).padding).toBe('0px');
      expect(getComputedStyle(panel.querySelector('div')!).padding).toBe('16px');
    });
  });

  describe('close requests', () => {
    let requests: UniDrawerCloseRequest[];

    beforeEach(() => {
      requests = [];
      fixture.componentInstance.closeRequest.subscribe((r) => requests.push(r));
    });

    it('routes Escape through the animated close and syncs open state', () => {
      const panel = openOverlay();
      const cancel = new Event('cancel', { cancelable: true });
      panel.dispatchEvent(cancel);
      fixture.detectChanges();

      expect(cancel.defaultPrevented).toBe(true);
      expect(requests).toEqual([{ reason: 'escape' }]);
      expect(fixture.componentInstance.open()).toBe(false);
      expect(panel.hasAttribute('closing')).toBe(true);
    });

    it('closes when the backdrop (the dialog element itself) is clicked', () => {
      openOverlay().dispatchEvent(new Event('click', { bubbles: true }));
      fixture.detectChanges();

      expect(requests).toEqual([{ reason: 'backdrop' }]);
      expect(fixture.componentInstance.open()).toBe(false);
    });

    it('asks but does not act while disableAutoClose is set', () => {
      fixture.componentRef.setInput('disableAutoClose', true);
      const panel = openOverlay();

      panel.dispatchEvent(new Event('cancel', { cancelable: true }));
      panel.dispatchEvent(new Event('click', { bubbles: true }));
      fixture.detectChanges();

      // Both routes asked; neither closed. The consumer's async "discard
      // unsaved changes?" confirm decides, and sets `open` itself.
      expect(requests).toEqual([{ reason: 'escape' }, { reason: 'backdrop' }]);
      expect(fixture.componentInstance.open()).toBe(true);
      expect(panel.hasAttribute('closing')).toBe(false);
    });
  });

  it('directs initial focus past the native first-focusable', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.componentRef.setInput('headline', 'Edit item');
    fixture.componentRef.setInput('initialFocus', '#target');
    fixture.detectChanges();

    const field = document.createElement('input');
    field.id = 'target';
    dialog().appendChild(field);

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(document.activeElement).toBe(field);
  });
});

@Component({
  imports: [UniDrawerComponent, UniDrawerHeaderComponent, UniDrawerButtonsComponent],
  template: `
    <uni-drawer mode="over" [open]="true">
      <div uni-drawer-header>Edit line</div>
      <p id="projected">form</p>
      <div drawer-buttons confirmButtonText="Save"></div>
    </uni-drawer>
  `,
})
class PanelHost {}

describe('UniDrawerComponent rows', () => {
  let fixture: ComponentFixture<PanelHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanelHost] }).compileComponents();
    fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
  });

  const dialog = (): HTMLDialogElement =>
    (fixture.nativeElement as HTMLElement).querySelector('dialog')!;

  it('projects header, body and footer into three rows in that order', () => {
    const rows = Array.from(dialog().children) as HTMLElement[];
    expect(rows).toHaveLength(3);
    expect(rows[0].hasAttribute('uni-drawer-header')).toBe(true);
    expect(rows[1].querySelector('#projected')).not.toBeNull();
    expect(rows[2].hasAttribute('drawer-buttons')).toBe(true);
  });

  it('pins the header and footer while the body takes the slack', () => {
    const [header, body, footer] = Array.from(dialog().children) as HTMLElement[];
    // `flex: none` normalises to its longhands.
    expect(getComputedStyle(header).flex).toBe('0 0 auto');
    expect(getComputedStyle(footer).flex).toBe('0 0 auto');
    // `minHeight: 0` is what lets a flex child actually shrink below its
    // content and scroll, rather than pushing the footer off the panel.
    expect(getComputedStyle(body).minHeight).toBe('0px');
  });

  it('is labelled by its header rather than needing an ariaLabel', () => {
    const titleId = dialog().getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(dialog().getAttribute('aria-label')).toBeNull();
    expect(dialog().querySelector(`#${titleId}`)?.textContent).toContain('Edit line');
  });

  it('routes the footer cancel through the same close decision', () => {
    const cancel = Array.from(dialog().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cancel')
    )!;
    const drawer = fixture.debugElement.children[0].componentInstance as UniDrawerComponent;

    cancel.click();
    fixture.detectChanges();
    expect(drawer.open()).toBe(false);
  });
});
