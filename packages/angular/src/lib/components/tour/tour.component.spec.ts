/**
 * Behaviours ported from the vanilla prototype's Playwright suite
 * (`packages/angular/prototypes/popover/test.mjs`), tour section. The tour
 * layer is pure sequencing logic over one callout — everything ports.
 */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UniTourStep } from './tour.model';
import { UniTourComponent } from './tour.component';

@Component({
  imports: [UniTourComponent],
  template: `
    <button id="outside">Outside</button>
    <input id="search-field" />
    <div id="report-panel">read-only</div>
    <input id="name-field" />
    <button id="create-button">Create</button>
    <uni-tour
      [steps]="steps"
      (stepChanged)="events.push('step:' + $event.key)"
      (finished)="events.push('finished')"
      (skipped)="events.push('skipped:' + $event.key)"
      (started)="events.push('started')"
    />
  `,
})
class HostComponent {
  tour = viewChild.required(UniTourComponent);
  events: string[] = [];
  steps: UniTourStep[] = [
    { key: 'welcome', title: 'Welcome to Projects', body: 'A quick look around.' },
    { key: 'search', target: 'search-field', title: 'Find anything', body: 'Type to filter.' },
    {
      key: 'report',
      target: 'report-panel',
      title: 'Weekly report',
      body: 'Read-only glance.',
      targetInteractive: false,
    },
    {
      key: 'name',
      target: 'name-field',
      title: 'Name it',
      body: 'Type a name to continue.',
      advanceOn: { event: 'input' },
    },
    {
      key: 'create',
      target: 'create-button',
      title: 'Create it',
      body: 'Click Create to finish setup.',
      advanceOn: { event: 'click' },
    },
    { key: 'ghost', target: 'does-not-exist', title: 'Ghost', body: 'Never shown.' },
    { key: 'done', title: 'All set', body: 'Enjoy.' },
  ];
}

describe('UniTourComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  const flush = async () => {
    await Promise.resolve();
    fixture.detectChanges();
  };

  const tour = () => fixture.componentInstance.tour();
  const panel = (): HTMLElement =>
    document.querySelector<HTMLElement>('[role="dialog"][aria-label]')!;
  const buttons = () =>
    Array.from(panel().querySelectorAll<HTMLButtonElement>('button[text-button]'));
  const nextButton = () => buttons().find((b) => /Next|Done/.test(b.textContent ?? ''));
  const backButton = () => buttons().find((b) => (b.textContent ?? '').includes('Back'));
  const status = () => host.querySelector('[role="status"]')!;
  const arrow = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    panel().querySelector<HTMLElement>('button')?.focus();
    document.dispatchEvent(event);
    fixture.detectChanges();
  };

  const start = async (at = 0) => {
    tour().start(at);
    await flush();
    await flush();
  };

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
    vi.restoreAllMocks();
  });

  it('labels each step with its title and progress', async () => {
    await start();
    expect(panel().getAttribute('aria-label')).toBe('Welcome to Projects, step 1 of 7');
    expect(fixture.componentInstance.events).toEqual(['started', 'step:welcome']);
  });

  it('hides Back on the first step and shows it from the second', async () => {
    await start();
    expect(backButton()).toBeUndefined();

    nextButton()!.click();
    await flush();
    expect(panel().getAttribute('aria-label')).toContain('Find anything');
    expect(backButton()).toBeDefined();
  });

  it('navigates with arrow keys while focus is in the panel', async () => {
    await start(1);
    arrow('ArrowRight');
    await flush();
    expect(panel().getAttribute('aria-label')).toContain('Weekly report');

    arrow('ArrowLeft');
    await flush();
    expect(panel().getAttribute('aria-label')).toContain('Find anything');
  });

  it('does not navigate when focus is in the spotlit target', async () => {
    await start(1);
    host.querySelector<HTMLInputElement>('#search-field')!.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    fixture.detectChanges();
    expect(panel().getAttribute('aria-label')).toContain('Find anything');
  });

  it('input gate: Next unlocks on typing, announced, without auto-advance', async () => {
    await start(3);
    expect(nextButton()!.disabled).toBe(true);

    const field = host.querySelector<HTMLInputElement>('#name-field')!;
    field.dispatchEvent(new Event('input'));
    await flush();

    expect(nextButton()!.disabled).toBe(false);
    expect(status().textContent).toBe('Next available');
    expect(panel().getAttribute('aria-label')).toContain('Name it'); // still here

    field.dispatchEvent(new Event('input'));
    await flush();
    expect(panel().getAttribute('aria-label')).toContain('Name it'); // still no auto-advance
  });

  it('click gate: renders no Next and advances on the target click, skipping the ghost step', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await start(4);
    expect(nextButton()).toBeUndefined();

    host.querySelector<HTMLButtonElement>('#create-button')!.click();
    await flush();

    // ghost (step 6) has a missing target → warned and skipped to "done"
    expect(warn).toHaveBeenCalledWith('[uni-tour] step "ghost" target missing — skipped');
    expect(panel().getAttribute('aria-label')).toBe('All set, step 7 of 7');
  });

  it('skips missing targets backwards too', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await start(6);
    arrow('ArrowLeft');
    await flush();

    expect(warn).toHaveBeenCalledWith('[uni-tour] step "ghost" target missing — skipped');
    expect(panel().getAttribute('aria-label')).toContain('Create it');
  });

  it('the last step reads Done and finishes the tour', async () => {
    await start(6);
    expect(nextButton()!.textContent).toContain('Done');

    nextButton()!.click();
    await flush();

    expect(fixture.componentInstance.events).toContain('finished');
    expect(tour().active()).toBeNull();
  });

  it('Escape skips and reports the step', async () => {
    await start();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await flush();

    expect(fixture.componentInstance.events).toContain('skipped:welcome');
    expect(tour().active()).toBeNull();
  });

  it('is deep-linkable through the active model', async () => {
    tour().active.set(2);
    await flush();
    await flush();
    expect(panel().getAttribute('aria-label')).toContain('Weekly report');
  });
});
