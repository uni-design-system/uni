/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/popover/test.mjs`). Native light dismissal
 * and real geometry are browser-only — jsdom's popover stubs (test-setup.ts)
 * drive the `toggle` lifecycle, and positioning is asserted as the generated
 * anchor style strings.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniPopoverComponent } from './popover.component';

@Component({
  imports: [UniPopoverComponent],
  template: `
    <uni-popover
      [mode]="mode()"
      [header]="header()"
      [closable]="closable()"
      [anchor]="anchor()"
      [(open)]="open"
    >
      <button trigger id="trigger-button">Open</button>
      @if (withForm()) {
        <!-- autofocus is the panel behaviour under test (APG: seed focus into a form popover) -->
        <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -->
        <input autofocus id="inner-input" />
        <button popover-footer id="apply">Apply</button>
      } @else {
        Plain content
      }
    </uni-popover>
    <input id="detached-field" />
  `,
})
class HostComponent {
  mode = signal<'rich' | 'tooltip'>('rich');
  header = signal<string | undefined>(undefined);
  closable = signal(false);
  anchor = signal<HTMLElement | string | undefined>(undefined);
  withForm = signal(false);
  open = signal(false);
}

describe('UniPopoverComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  const flush = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  const popover = () =>
    fixture.debugElement.children[0].componentInstance as UniPopoverComponent;
  const trigger = () => host.querySelector<HTMLButtonElement>('#trigger-button')!;
  const panel = () => document.getElementById(popover().panelId)!;

  const emotionRuleFor = (className: string): string =>
    Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .filter((text) => text.includes(className))
      .join('');

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
    vi.useRealTimers();
  });

  describe('rich mode', () => {
    it('opens on trigger click and wires the disclosure ARIA', async () => {
      trigger().click();
      await flush();

      expect(fixture.componentInstance.open()).toBe(true);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-controls')).toBe(popover().panelId);
    });

    it('mirrors aria-expanded back to false on close', async () => {
      popover().showPopover();
      await flush();
      popover().hidePopover();
      await flush();

      expect(fixture.componentInstance.open()).toBe(false);
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('uses native light dismissal (popover="auto")', () => {
      expect(panel().getAttribute('popover')).toBe('auto');
    });

    it('drives the native popover from the open model', async () => {
      fixture.componentInstance.open.set(true);
      await flush();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');

      fixture.componentInstance.open.set(false);
      await flush();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('renders the header with aria-labelledby and honours [autofocus]', async () => {
      fixture.componentInstance.header.set('Filters');
      fixture.componentInstance.withForm.set(true);
      fixture.detectChanges();

      popover().showPopover();
      await flush();

      const labelledBy = panel().getAttribute('aria-labelledby')!;
      expect(document.getElementById(labelledBy)?.textContent).toBe('Filters');
      expect(document.activeElement).toBe(document.getElementById('inner-input'));
    });

    it('returns focus to the trigger when the panel closes with focus inside', async () => {
      fixture.componentInstance.withForm.set(true);
      fixture.detectChanges();
      popover().showPopover();
      await flush();

      popover().hidePopover();
      await flush();
      expect(document.activeElement).toBe(trigger());
    });

    it('the close button hides the panel and restores trigger focus', async () => {
      fixture.componentInstance.closable.set(true);
      fixture.detectChanges();
      popover().showPopover();
      await flush();

      const close = panel().querySelector<HTMLButtonElement>('button[icon-button]')!;
      close.click();
      await flush();

      expect(fixture.componentInstance.open()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });
  });

  describe('detached anchor', () => {
    it('anchors the panel to the referenced element while the trigger keeps controller ARIA', async () => {
      fixture.componentInstance.anchor.set('detached-field');
      fixture.detectChanges();

      popover().showPopover();
      await flush();

      const field = document.getElementById('detached-field')!;
      const anchorName = field.style.getPropertyValue('anchor-name');
      expect(anchorName).toMatch(/^--uni-anchor/);
      expect(emotionRuleFor(panel().className)).toContain(anchorName);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-controls')).toBe(popover().panelId);
    });

    it("treats '' as unset and anchors to the trigger", async () => {
      fixture.componentInstance.anchor.set('');
      fixture.detectChanges();
      popover().showPopover();
      await flush();

      const triggerSpan = trigger().parentElement!;
      expect(triggerSpan.style.getPropertyValue('anchor-name')).toMatch(/^--uni-anchor/);
    });
  });

  describe('tooltip mode', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      fixture.componentInstance.mode.set('tooltip');
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
    });

    const triggerSpan = () => trigger().parentElement!;
    const enter = () =>
      triggerSpan().dispatchEvent(new Event('mouseenter', { bubbles: false }));
    const leave = () =>
      triggerSpan().dispatchEvent(new Event('mouseleave', { bubbles: false }));

    it('is manual, role=tooltip, described-by, and never aria-expanded', () => {
      expect(panel().getAttribute('popover')).toBe('manual');
      expect(panel().getAttribute('role')).toBe('tooltip');
      expect(trigger().getAttribute('aria-describedby')).toBe(popover().panelId);
      expect(trigger().hasAttribute('aria-expanded')).toBe(false);
      expect(trigger().hasAttribute('aria-controls')).toBe(false);
    });

    it('opens after the hover delay, not before', () => {
      enter();
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(false);

      vi.advanceTimersByTime(200);
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(true);
    });

    it('stays open while the pointer rests inside the panel, closes after leaving', () => {
      enter();
      vi.advanceTimersByTime(600);
      fixture.detectChanges();
      leave();
      panel().dispatchEvent(new Event('mouseenter'));
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(true);

      panel().dispatchEvent(new Event('mouseleave'));
      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(false);
    });

    it('opens instantly on focus', () => {
      triggerSpan().dispatchEvent(new Event('focusin'));
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(true);
    });

    it('Escape dismisses without moving focus', () => {
      trigger().focus();
      triggerSpan().dispatchEvent(new Event('focusin'));
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(fixture.componentInstance.open()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });

    it('warns in dev mode when tooltip content contains focusables', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentInstance.withForm.set(true);
      fixture.detectChanges();

      popover().showPopover();
      await Promise.resolve();
      fixture.detectChanges();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[uni-popover]'));
      warn.mockRestore();
    });
  });
});
