import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTabsComponent } from './tabs.component';
import { UniTabComponent } from './tab.component';

// Content projection needs a host component; TestBed compiles it with the
// JIT compiler at runtime, which works under the spec transform as long as
// the host stays minimal.
@Component({
  imports: [UniTabsComponent, UniTabComponent],
  template: `
    <uni-tabs [(selectedIndex)]="index">
      <uni-tab label="One"><p>first panel</p></uni-tab>
      <uni-tab label="Two"><p>second panel</p></uni-tab>
      <uni-tab label="Three" [disabled]="true"><p>third panel</p></uni-tab>
      <uni-tab label="Four"><p>fourth panel</p></uni-tab>
    </uni-tabs>
  `,
})
class Host {
  index = 0;
}

describe('UniTabsComponent', () => {
  let fixture: ComponentFixture<Host>;

  const tabs = (): HTMLButtonElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="tab"]'));
  const panel = (): HTMLElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector('[role="tabpanel"]');
  const tablist = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('[role="tablist"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders a tab per child and only the selected panel', () => {
    expect(tabs().length).toBe(4);
    expect(panel()?.textContent).toContain('first panel');
    expect(fixture.nativeElement.textContent).not.toContain('second panel');
  });

  it('wires the ARIA contract: selection, controls, labelling, roving tabindex', () => {
    const [first, second] = tabs();
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(first.getAttribute('tabindex')).toBe('0');
    expect(second.getAttribute('aria-selected')).toBe('false');
    expect(second.getAttribute('tabindex')).toBe('-1');
    expect(first.getAttribute('aria-controls')).toBe(panel()?.id);
    expect(panel()?.getAttribute('aria-labelledby')).toBe(first.id);
  });

  it('selects on click and two-way binds selectedIndex', () => {
    tabs()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.index).toBe(1);
    expect(panel()?.textContent).toContain('second panel');
  });

  it('arrow keys move selection and skip disabled tabs, wrapping at the ends', () => {
    tablist().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('second panel');

    // Third tab is disabled — ArrowRight jumps from Two to Four.
    tablist().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('fourth panel');

    // Wraps from the last enabled back to the first.
    tablist().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('first panel');
  });

  it('Home and End jump to the first and last enabled tab', () => {
    tablist().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('fourth panel');

    tablist().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('first panel');
  });

  it('ignores clicks on disabled tabs', () => {
    tabs()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.index).toBe(0);
    expect(panel()?.textContent).toContain('first panel');
  });
});
