/**
 * The hold ramp and, more importantly, every way a hold can end. A run that
 * outlives the pointer is a value that keeps climbing on its own, so the
 * cancellation paths carry as much weight here as the timing does.
 */
import { TestBed } from '@angular/core/testing';
import { createPressRepeat, type PressRepeat, type PressRepeatConfig } from './press-repeat';

describe('createPressRepeat', () => {
  let steps: boolean[];
  let releases: boolean[];

  const build = (config: Partial<PressRepeatConfig> = {}): PressRepeat =>
    TestBed.runInInjectionContext(() =>
      createPressRepeat({
        onStep: (repeat) => steps.push(repeat),
        onRelease: (repeated) => releases.push(repeated),
        ...config,
      })
    );

  beforeEach(() => {
    vi.useFakeTimers();
    steps = [];
    releases = [];
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('steps once on press and does not repeat before the delay', () => {
    const repeat = build();
    repeat.press();

    expect(steps).toEqual([false]);
    expect(repeat.holding()).toBe(true);

    vi.advanceTimersByTime(499);
    expect(steps).toEqual([false]);
  });

  it('repeats at the base interval once the delay passes', () => {
    const repeat = build();
    repeat.press();

    vi.advanceTimersByTime(500);
    expect(steps).toEqual([false, true]);

    // 10 a second while the hold is young.
    vi.advanceTimersByTime(300);
    expect(steps.filter(Boolean)).toHaveLength(4);
  });

  it('accelerates after the ramp begins', () => {
    const repeat = build();
    repeat.press();

    // Through the flat phase.
    vi.advanceTimersByTime(2000);
    const beforeRamp = steps.length;

    // Past the ramp window, the period is fastIntervalMs — four times as many
    // steps in the same span.
    vi.advanceTimersByTime(1000);
    const rampedSteps = steps.length - beforeRamp;

    vi.advanceTimersByTime(1000);
    const fastSteps = steps.length - beforeRamp - rampedSteps;

    expect(fastSteps).toBeGreaterThan(rampedSteps);
    expect(fastSteps).toBeGreaterThan(30);
  });

  it('announces once on release, reporting whether it repeated', () => {
    const repeat = build();

    repeat.press();
    repeat.release();
    expect(releases).toEqual([false]); // a plain click

    steps = [];
    releases = [];
    repeat.press();
    vi.advanceTimersByTime(1000);
    repeat.release();
    expect(releases).toEqual([true]); // a genuine hold
  });

  it('stops stepping once released', () => {
    const repeat = build();
    repeat.press();
    vi.advanceTimersByTime(1000);
    const atRelease = steps.length;

    repeat.release();
    vi.advanceTimersByTime(2000);

    expect(steps).toHaveLength(atRelease);
    expect(repeat.holding()).toBe(false);
  });

  it('cancels silently, for Escape and pointercancel', () => {
    const repeat = build();
    repeat.press();
    vi.advanceTimersByTime(1000);

    repeat.cancel();
    vi.advanceTimersByTime(2000);

    expect(releases).toEqual([]);
    expect(repeat.holding()).toBe(false);
  });

  it('ends the run when the window loses focus', () => {
    const repeat = build();
    repeat.press();
    vi.advanceTimersByTime(1000);
    const atBlur = steps.length;

    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(2000);

    expect(repeat.holding()).toBe(false);
    expect(steps).toHaveLength(atBlur);
    // A window blur is not a deliberate release, so nothing is announced.
    expect(releases).toEqual([]);
  });

  it('refuses to start while disabled', () => {
    const repeat = build({ disabled: () => true });
    repeat.press();

    expect(steps).toEqual([]);
    expect(repeat.holding()).toBe(false);
  });

  it('ignores a second press while one is in flight', () => {
    const repeat = build();
    repeat.press();
    repeat.press();

    expect(steps).toEqual([false]);
  });

  it('releasing without a press announces nothing', () => {
    const repeat = build();
    repeat.release();

    expect(releases).toEqual([]);
  });

  it('steps once and never repeats when repeat is off', () => {
    const repeat = build({ repeat: () => false });
    repeat.press();

    vi.advanceTimersByTime(5000);
    expect(steps).toEqual([false]);

    repeat.release();
    expect(releases).toEqual([false]);
  });

  it('takes its timings from the config', () => {
    const repeat = build({ timing: () => ({ delayMs: 100, intervalMs: 50 }) });
    repeat.press();

    vi.advanceTimersByTime(100);
    expect(steps).toEqual([false, true]);

    vi.advanceTimersByTime(100);
    expect(steps.filter(Boolean)).toHaveLength(3);
  });

  it('hands focus over on press, since preventDefault would strand it', () => {
    // Taking pointer capture means preventing the default, which suppresses the
    // browser's own focus handling — so a spinner button would otherwise leave
    // focus nowhere and the arrow keys dead.
    const focused: unknown[] = [];
    const repeat = build({ focus: (button) => focused.push(button) });

    const button = document.createElement('button');
    button.setPointerCapture = () => undefined;
    const event = new Event('pointerdown') as PointerEvent;
    Object.defineProperty(event, 'currentTarget', { value: button });
    Object.defineProperty(event, 'pointerId', { value: 3 });

    repeat.press(event);

    // The pressed button comes through, as a fallback for controls with no
    // field of their own to focus.
    expect(focused).toEqual([button]);
  });

  it('does not ask for focus when the press is refused', () => {
    const focused: unknown[] = [];
    const repeat = build({ disabled: () => true, focus: () => focused.push(true) });
    repeat.press();
    expect(focused).toEqual([]);
  });

  it('takes pointer capture so a slide off the button still releases', () => {
    const repeat = build();
    const button = document.createElement('button');
    const captured: number[] = [];
    button.setPointerCapture = (id: number) => captured.push(id);
    button.hasPointerCapture = () => false;

    const event = new Event('pointerdown') as PointerEvent;
    Object.defineProperty(event, 'currentTarget', { value: button });
    Object.defineProperty(event, 'pointerId', { value: 7 });

    repeat.press(event);

    expect(captured).toEqual([7]);
    expect(steps).toEqual([false]);
  });
});
