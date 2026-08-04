import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniTooltipComponent } from './tooltip.component';

@Component({
  imports: [UniTooltipComponent],
  template: `<uni-tooltip label="Expand"><button type="button">go</button></uni-tooltip>`,
})
class InteractiveHost {}

describe('UniTooltipComponent', () => {
  let fixture: ComponentFixture<UniTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UniTooltipComponent);
    fixture.componentRef.setInput('label', 'More info');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the bubble declaratively as a popover with tooltip semantics', () => {
    const tip = (fixture.nativeElement as HTMLElement).querySelector('[role="tooltip"]')!;
    expect(tip).not.toBeNull();
    expect(tip.getAttribute('popover')).toBe('manual');
    expect(tip.id).toBe(fixture.componentInstance.tooltipId);
    expect(tip.textContent).toContain('More info');
  });

  it('describes the host via aria-describedby once rendered', async () => {
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-describedby')).toBe(fixture.componentInstance.tooltipId);
    // No focusable content projected: host joins the tab order
    expect(host.getAttribute('tabindex')).toBe('0');
  });

  it('keeps tap-to-toggle on a non-interactive host', async () => {
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const tip = host.querySelector('[role="tooltip"]')!;
    host.click();
    expect(tip.getAttribute('fade')).toBe('in');
    host.click();
    expect(tip.getAttribute('fade')).toBe('out');
  });

  it('suppresses after activating a wrapped control, re-arming when the pointer leaves', async () => {
    const hostFixture = TestBed.createComponent(InteractiveHost);
    hostFixture.detectChanges();
    const tooltip: UniTooltipComponent = hostFixture.debugElement.query(
      (node) => node.componentInstance instanceof UniTooltipComponent,
    ).componentInstance;
    const el: HTMLElement = hostFixture.nativeElement;
    const tip = el.querySelector('[role="tooltip"]')!;

    tooltip.showTooltip();
    expect(tip.getAttribute('fade')).toBe('in');

    // Activating the button hides the bubble instead of toggling it.
    el.querySelector('button')!.click();
    expect(tip.getAttribute('fade')).toBe('out');

    // Complete the fade-out (jsdom fires no real animation events).
    tip.dispatchEvent(
      Object.assign(new Event('animationend'), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animationName: (tooltip as any).tooltipFadeOut,
      }),
    );

    // The pointer never left: the hover machinery must not re-show.
    tooltip.isMouseInside.set(true);
    await hostFixture.whenStable();
    expect(tip.getAttribute('fade')).toBe('out');

    // Leaving re-arms; the next hover shows again.
    tooltip.mouseleave();
    tooltip.isMouseInside.set(true);
    await hostFixture.whenStable();
    expect(tip.getAttribute('fade')).toBe('in');
  });
});
