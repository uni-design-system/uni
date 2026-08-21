/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/popover/test.mjs`). Spotlight geometry is
 * asserted at the cdk layer (`spotlightStyles` unit tests) and as generated
 * style strings here; hit-testing, scroll tracking, and viewport centering
 * are browser-only and covered by Storybook stories.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { UniCalloutDismissal } from './callout.model';
import { UniCalloutComponent } from './callout.component';

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

  it('cleans up its document listener when destroyed while open', async () => {
    await openCallout();
    fixture.destroy();

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
