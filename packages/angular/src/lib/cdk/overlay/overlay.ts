/**
 * Shared plumbing for top-layer overlays built on the native `popover`
 * attribute (dropdown, popover, callout, tooltip, the listbox popups,
 * snackbar). Pure functions and data — no DOM ownership — so each component
 * keeps its own template while the anchor bookkeeping, discrete-transition
 * block, and focus-restore rule stay single-sourced.
 *
 * These are deliberately à-la-carte rather than one factory: the overlays
 * share *mechanics* but not *lifecycles*. A dropdown toggles from a trigger
 * click and restores focus; a tooltip follows hover and never takes focus; a
 * callout traps focus behind a scrim; a listbox popup is rendered by `@if`
 * with focus staying in the field; a snackbar has no anchor at all and closes
 * on a timer. Take what a component needs and leave the rest.
 *
 * **Choosing `popover="auto"` vs `"manual"`** — the one decision worth making
 * deliberately. `auto` brings native light-dismiss: an outside pointerdown or
 * Escape closes it. That is right for a panel the user opened and can dismiss
 * by looking away — dropdown, popover, callout, tooltip.
 *
 * `manual` is right when the control already owns dismissal, and light-dismiss
 * would fight it. Two cases in this library:
 *   - the listbox popups, whose own field is *outside* the popup, so `auto`
 *     would close the list on every click into the input;
 *   - the snackbar, which would be torn away from someone still reading it by
 *     a click anywhere on the page.
 *
 * `manual` means the component must close it — nothing else will.
 */
import { FOCUSABLE_SELECTOR } from '../a11y/a11y';
import type { Placement } from '../position/anchor';

/** Placement → `transform-origin`, so scale animations grow from the anchor. */
export const TRANSFORM_ORIGINS: Record<Placement, string> = {
  top: 'bottom center',
  right: 'center left',
  bottom: 'top center',
  left: 'center right',
  'top-start': 'bottom left',
  'top-end': 'bottom right',
  'right-start': 'top left',
  'right-end': 'bottom left',
  'bottom-start': 'top left',
  'bottom-end': 'top right',
  'left-start': 'top right',
  'left-end': 'bottom right',
};

/** Write a CSS `anchor-name` onto an element (detached anchors and targets). */
export function setAnchorName(el: HTMLElement, name: string): void {
  el.style.setProperty('anchor-name', name);
}

export function clearAnchorName(el: HTMLElement): void {
  el.style.removeProperty('anchor-name');
}

/**
 * Resolve an element-or-id reference. Id strings are looked up at call time —
 * never cache the result across opens, the element may have been re-rendered.
 * `''` and null-ish mean "unset" (falsy guard: an empty string is the only
 * typeable empty for a string-typed input).
 */
export function resolveElement(
  ref: HTMLElement | string | null | undefined
): HTMLElement | null {
  if (!ref) return null;
  return typeof ref === 'string' ? document.getElementById(ref) : ref;
}

/** True when a native `toggle` event reports the overlay opening. */
export function isToggleOpen(event: Event): boolean {
  return (event as ToggleEvent).newState === 'open';
}

/**
 * The discrete-transition block that animates an element into and out of the
 * top layer: `transition-behavior: allow-discrete` over the `hidden` keys plus
 * `display`/`overlay`, the shown state under `:popover-open`, and
 * `@starting-style` so entry transitions run from the hidden state.
 *
 * `display` and `overlay` must ride along or the element cannot animate into
 * and out of the top layer at all — it would simply appear and vanish.
 *
 * `timingFunction` is omitted from the output when not given, leaving the CSS
 * initial value (`ease`), so callers that never asked for one are unaffected.
 */
export function discreteOverlayTransition(
  durationMs: number,
  hidden: Record<string, string | number>,
  shown: Record<string, string | number>,
  timingFunction?: string
): Record<string, unknown> {
  return {
    transitionProperty: [...Object.keys(hidden), 'display', 'overlay']
      .map((key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))
      .join(', '),
    transitionDuration: `${durationMs}ms`,
    ...(timingFunction ? { transitionTimingFunction: timingFunction } : {}),
    transitionBehavior: 'allow-discrete',
    ...hidden,
    '&:popover-open': shown,
    '@starting-style': {
      '&:popover-open': hidden,
    },
  };
}

/**
 * Returns focus to `target` when an overlay closes while focus was inside its
 * panel (or was dropped on `<body>` by the top layer closing), so keyboard
 * users are never stranded (WCAG 2.4.3). Focus resting anywhere else is left
 * alone.
 */
export function restoreOverlayFocus(panel: HTMLElement, target: HTMLElement | null): void {
  const active = document.activeElement;
  if (active === document.body || (active && panel.contains(active))) {
    target?.focus();
  }
}

/**
 * The focusable elements inside `root`, in DOM order. Filters disabled
 * controls, and hidden ones where the environment can tell: jsdom reports
 * `offsetParent` as null for every element, so the visibility filter applies
 * only when the document actually lays out (some element has an offsetParent).
 */
export function focusableElements(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !(el as HTMLElement & { disabled?: boolean }).disabled
  );
  const laidOut = all.some((el) => el.offsetParent !== null);
  return laidOut ? all.filter((el) => el.offsetParent !== null) : all;
}
