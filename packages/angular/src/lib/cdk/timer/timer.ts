import { computed, DestroyRef, inject, signal } from '@angular/core';

export function useTimer() {
  const destroyRef = inject(DestroyRef);

  const msRemaining = signal<number>(0);
  const isPaused = signal<boolean>(false);
  const isActive = computed(() => msRemaining() > 0);

  let intervalId: any = null;
  let endTime = 0;
  let onCompleteCallback: (() => void) | undefined;

  const stop = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  };

  const tick = () => {
    const remaining = Math.max(0, endTime - Date.now());
    msRemaining.set(remaining);

    if (remaining <= 0) {
      stop();
      if (onCompleteCallback) onCompleteCallback();
    }
  };

  const start = (durationMs: number, onComplete?: () => void) => {
    stop();
    onCompleteCallback = onComplete;
    isPaused.set(false);
    msRemaining.set(durationMs);
    endTime = Date.now() + durationMs;
    intervalId = setInterval(tick, 100);
  };

  const pause = () => {
    if (!isActive() || isPaused()) return;
    stop();
    isPaused.set(true);
  };

  const resume = () => {
    if (!isActive() || !isPaused()) return;
    isPaused.set(false);
    endTime = Date.now() + msRemaining();
    intervalId = setInterval(tick, 100);
  };

  destroyRef.onDestroy(() => stop());

  return {
    start,
    pause,
    resume,
    stop: () => {
      stop();
      msRemaining.set(0);
    },
    msRemaining,
    isPaused,
    isActive,
    secondsRemaining: computed(() => Math.ceil(msRemaining() / 1000)),
  };
}
