/**
 * Hold-to-repeat for stepper buttons: press once to step once, hold to keep
 * stepping, faster the longer you hold. Getting a quantity from 1 to 200 is
 * otherwise 199 clicks.
 *
 * Like the other cdk helpers this owns **no DOM and attaches no listeners to
 * an element** — the component's template hands it the events, which keeps the
 * ARIA and the markup where they belong:
 *
 * ```html
 * <button
 *   type="button"
 *   tabindex="-1"
 *   [disabled]="atMax()"
 *   (pointerdown)="increment.press($event)"
 *   (pointerup)="increment.release()"
 *   (pointercancel)="increment.cancel()"
 *   (lostpointercapture)="increment.release()"
 * >
 * ```
 *
 * It does register one `window` blur listener, because a hold that survives
 * the window losing focus is a value that keeps climbing while the user is
 * somewhere else. That listener is torn down with the injection context, so
 * `createPressRepeat` must be called from one — a field initializer, as with
 * `useTimer()`.
 */
import { DestroyRef, inject, signal, type Signal } from '@angular/core';

/** Milliseconds spent interpolating from `intervalMs` down to `fastIntervalMs`. */
const RAMP_WINDOW_MS = 500;

const DEFAULTS = {
  /** Held this long before repeating starts, so a normal click steps once. */
  delayMs: 500,
  /** Repeat period once it starts — 10 steps a second. */
  intervalMs: 100,
  /** Repeat period at full speed — 40 steps a second. */
  fastIntervalMs: 25,
  /** Held this long before the acceleration begins. */
  rampMs: 2000,
} as const;

/** Repeat timings, normally sourced from a component's theme options. */
export interface PressRepeatTiming {
  delayMs?: number;
  intervalMs?: number;
  fastIntervalMs?: number;
  rampMs?: number;
}

export interface PressRepeatConfig {
  /**
   * Perform one step. `repeat` is `false` for the initial press and `true` for
   * every automatic repeat, so a caller can stay silent during the run.
   */
  onStep: (repeat: boolean) => void;
  /**
   * The hold ended. `repeated` says whether it ever auto-repeated, which is
   * the cue to announce the final value: a screen reader narrating two hundred
   * intermediate values is a denial of service, so announcing belongs here and
   * not in `onStep`.
   */
  onRelease?: (repeated: boolean) => void;
  /** Consulted on press; a disabled button must not start a run. */
  disabled?: () => boolean;
  /**
   * When this returns `false`, a press steps exactly once and the repeat timer
   * is never armed — `onRelease` still fires, with `repeated: false`. Lets a
   * caller turn hold-to-repeat off without a second set of event bindings.
   */
  repeat?: () => boolean;
  timing?: () => PressRepeatTiming;
}

export interface PressRepeat {
  /** True while a press is in flight — bind it to the button's pressed state. */
  readonly holding: Signal<boolean>;
  /**
   * Begin a hold and step once immediately. Given a pointer event, it also
   * takes pointer capture, so sliding off the button mid-hold neither strands
   * the repeat nor drops the release.
   */
  press(event?: PointerEvent): void;
  /** End a hold normally, firing `onRelease`. */
  release(): void;
  /** End a hold without firing `onRelease` — for `Escape` and `pointercancel`. */
  cancel(): void;
}

export function createPressRepeat(config: PressRepeatConfig): PressRepeat {
  const destroyRef = inject(DestroyRef);
  const holding = signal(false);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startedAt = 0;
  let repeated = false;

  const timing = (): Required<PressRepeatTiming> => ({ ...DEFAULTS, ...config.timing?.() });

  /** Linear ramp: flat until `rampMs`, then down to `fastIntervalMs`. */
  const intervalFor = (elapsed: number): number => {
    const { intervalMs, fastIntervalMs, rampMs } = timing();
    if (elapsed <= rampMs) return intervalMs;
    const progress = Math.min(1, (elapsed - rampMs) / RAMP_WINDOW_MS);
    return intervalMs + (fastIntervalMs - intervalMs) * progress;
  };

  const stopTimer = (): void => {
    if (timer != null) clearTimeout(timer);
    timer = null;
  };

  const tick = (): void => {
    repeated = true;
    config.onStep(true);
    // Re-armed rather than set on an interval, so the period can shorten
    // between ticks as the hold accelerates.
    timer = setTimeout(tick, intervalFor(Date.now() - startedAt));
  };

  const end = (notify: boolean): void => {
    stopTimer();
    if (!holding()) return;
    holding.set(false);
    const didRepeat = repeated;
    repeated = false;
    startedAt = 0;
    if (notify) config.onRelease?.(didRepeat);
  };

  const onWindowBlur = (): void => end(false);
  window.addEventListener('blur', onWindowBlur);
  destroyRef.onDestroy(() => {
    stopTimer();
    window.removeEventListener('blur', onWindowBlur);
  });

  return {
    holding: holding.asReadonly(),

    press(event?: PointerEvent): void {
      if (config.disabled?.()) return;
      if (holding()) return;

      if (event) {
        // Keeps the pointer stream on the button even when the finger slides
        // off it, so `pointerup` still arrives and the run still ends.
        event.preventDefault();
        const target = event.currentTarget;
        // jsdom and older engines lack the method entirely.
        if (target instanceof Element && typeof target.setPointerCapture === 'function') {
          try {
            target.setPointerCapture(event.pointerId);
          } catch {
            // A synthetic or already-released pointer id; the run is still fine.
          }
        }
      }

      holding.set(true);
      repeated = false;
      startedAt = Date.now();
      config.onStep(false);
      if (config.repeat?.() === false) return;
      timer = setTimeout(tick, timing().delayMs);
    },

    release(): void {
      end(true);
    },

    cancel(): void {
      end(false);
    },
  };
}
