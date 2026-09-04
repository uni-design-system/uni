/**
 * The dialog's own policy: labelling, the animated close, and the CSS contract
 * behind the three-row layout — a pinned header and buttons with only the body
 * scrolling, on a surface that stays content-sized until it reaches the
 * viewport inset.
 *
 * The scroll *geometry* cannot be asserted here: jsdom has no layout, so
 * `scrollHeight` and `clientHeight` are both 0. That lives in the Storybook
 * play functions on the LongContent and ShrinkToContent stories, which run in
 * a real browser.
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogButtonsComponent } from './dialog-buttons/dialog-buttons.component';
import { UniDialogHeaderComponent } from './dialog-header/dialog-header.component';
import { UniDialogComponent } from './dialog.component';

describe('UniDialogComponent', () => {
  let fixture: ComponentFixture<UniDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDialogComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('uses ariaLabel as the accessible name when no header is present', () => {
    fixture.componentRef.setInput('ariaLabel', 'Confirm deletion');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Confirm deletion');
    expect(host.getAttribute('aria-labelledby')).toBeNull();
  });

  it('prefers aria-labelledby once a title registers', () => {
    const component = fixture.componentInstance;
    component.hasTitle.set(true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-labelledby')).toBe(component.titleId);
  });

  it('routes native cancel (Escape) through the animated close', () => {
    const host: HTMLElement = fixture.nativeElement;

    const cancel = new Event('cancel', { cancelable: true });
    host.dispatchEvent(cancel);

    // preventDefault stops the instant native close; the closing attribute
    // drives the fade-out animation instead
    expect(cancel.defaultPrevented).toBe(true);
    expect(host.hasAttribute('closing')).toBe(true);
  });
});

@Component({
  imports: [UniDialogComponent, UniDialogHeaderComponent, UniDialogButtonsComponent],
  template: `
    <dialog uni-dialog [show]="true">
      <header dialog-header>Edit line</header>
      <p id="projected">form</p>
      <footer dialog-buttons confirmButtonText="Save"></footer>
    </dialog>
  `,
})
class DialogHost {}

describe('UniDialogComponent rows', () => {
  let fixture: ComponentFixture<DialogHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DialogHost] }).compileComponents();
    fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();
  });

  const panel = (): HTMLDialogElement =>
    (fixture.nativeElement as HTMLElement).querySelector('dialog')!;

  /**
   * The CSS emotion actually emitted for an element's classes. Needed where
   * the assertion is about what the component declares, not what the UA
   * stylesheet happens to compute on top of it.
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

  /** The scrolling row, found by what it does rather than by its index. */
  const bodyRow = (): HTMLElement =>
    Array.from(panel().children).find(
      (row) => getComputedStyle(row as HTMLElement).overflowY === 'auto'
    ) as HTMLElement;

  it('projects header, body and footer into three rows in that order', () => {
    const rows = Array.from(panel().children) as HTMLElement[];
    expect(rows).toHaveLength(3);
    expect(rows[0].hasAttribute('dialog-header')).toBe(true);
    expect(rows[1].querySelector('#projected')).not.toBeNull();
    expect(rows[2].hasAttribute('dialog-buttons')).toBe(true);
  });

  it('is never the scroll container: clips both axes and scrolls only the body', () => {
    // Both axes explicitly. Setting only one computes the other to `auto`,
    // which is exactly how a surface becomes an accidental scroller.
    const panelStyle = getComputedStyle(panel());
    expect(panelStyle.overflowX).toBe('clip');
    expect(panelStyle.overflowY).toBe('clip');

    const bodyStyle = getComputedStyle(bodyRow());
    expect(bodyStyle.overflowY).toBe('auto');
    expect(bodyStyle.overflowX).toBe('hidden');
    expect(bodyStyle.overscrollBehavior).toBe('contain');
    // A containing block, so no absolute descendant escapes into an ancestor.
    expect(bodyStyle.position).toBe('relative');
  });

  it('pins the header and footer while the body takes the slack', () => {
    const [header, , footer] = Array.from(panel().children) as HTMLElement[];
    // `flex: none` normalises to its longhands.
    expect(getComputedStyle(header).flex).toBe('0 0 auto');
    expect(getComputedStyle(footer).flex).toBe('0 0 auto');
    // `minHeight: 0` is what lets a flex child shrink below its content and
    // scroll, rather than pushing the buttons off the surface.
    expect(getComputedStyle(bodyRow()).minHeight).toBe('0px');
  });

  it('never grows the body, so the surface stays content-sized', () => {
    // The one place this differs from the drawer, which is viewport-tall and
    // wants `1 1 auto`. A dialog must not stretch to a cap it has not reached.
    expect(getComputedStyle(bodyRow()).flex).toBe('0 1 auto');
    // And the surface declares no height of its own, so it keeps shrinking to
    // its rows. `max-height` must not be mistaken for one.
    expect(emittedRuleFor(panel())).not.toMatch(/[;{]height:/);
  });

  it('caps at the themed inset so it scrolls only at the screen edge', () => {
    const style = getComputedStyle(panel());
    expect(style.maxHeight).toBe('calc(100dvh - 64px)');
    expect(style.maxWidth).toBe('calc(100vw - 64px)');
  });

  it('is labelled by its projected header, so the rows still reach the dialog', () => {
    // Wrapping the projected body in a div does not move the rows' injector:
    // projected content keeps its declaration-site context, which is how
    // `inject(UniDialogComponent, { host: true, skipSelf: true })` still
    // resolves from inside the three-row template.
    const titleId = panel().getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(panel().getAttribute('aria-label')).toBeNull();
    expect(panel().querySelector(`#${titleId}`)?.textContent).toContain('Edit line');
  });

  it('insets all three rows with `padding`, and the body alone with `bodyPadding`', () => {
    // Unlike the drawer, the surface keeps its padding: the header sits inside
    // it, which is what makes the default header read as an inset pill.
    expect(getComputedStyle(panel()).padding).toBe('8px');
    // `bodyPadding` is unset in the base theme, so the body declares none.
    expect(emittedRuleFor(bodyRow())).not.toMatch(/padding/);
  });
});

@Component({
  imports: [UniDialogComponent, UniDialogHeaderComponent],
  template: `
    <dialog uni-dialog [show]="true"><header uni-dialog-header>Legacy</header></dialog>
  `,
})
class LegacyHeaderHost {}

it('still projects and pins the legacy [uni-dialog-header] spelling', async () => {
  await TestBed.configureTestingModule({ imports: [LegacyHeaderHost] }).compileComponents();
  const fixture = TestBed.createComponent(LegacyHeaderHost);
  fixture.detectChanges();

  const panel = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  const [header] = Array.from(panel.children) as HTMLElement[];
  expect(header.hasAttribute('uni-dialog-header')).toBe(true);
  expect(getComputedStyle(header).flex).toBe('0 0 auto');
});
