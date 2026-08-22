import { signal, type Signal } from '@angular/core';

let nextUniqueId = 0;

/**
 * Returns a document-unique id for wiring ARIA relationships
 * (aria-controls, aria-describedby, aria-labelledby, ...).
 */
export function uniqueId(prefix = 'uni'): string {
  return `${prefix}-${nextUniqueId++}`;
}

/**
 * Selector matching natively focusable elements. Used to locate the
 * interactive element inside a projected trigger so ARIA attributes land
 * on the element that actually receives focus.
 */
export const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Resolves the element that should carry ARIA state for a trigger:
 * the element itself when focusable, otherwise its first focusable descendant.
 */
export function resolveFocusTarget(element: HTMLElement): HTMLElement {
  if (element.matches(FOCUSABLE_SELECTOR)) return element;
  return element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? element;
}

/**
 * Visually hides content while keeping it available to screen readers.
 * Use for text alternatives (e.g. badge counts, icon-only affordances).
 */
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/**
 * Wraps animation/transition styles so they only apply when the user has
 * not requested reduced motion (WCAG 2.3.3).
 */
export function motionSafe<T extends object>(styles: T) {
  return { '@media (prefers-reduced-motion: no-preference)': styles };
}

export interface Announcer {
  /**
   * Current live-region text. Bind it to a visually hidden element that is
   * already in the DOM when the component renders — a region added at the
   * moment it gains text is not reliably announced:
   *
   * ```html
   * <span role="status" aria-live="polite" [class]="srOnly">
   *   {{ announcer.message() }}
   * </span>
   * ```
   */
  readonly message: Signal<string>;
  /** Announce `text`, even when it repeats what was just announced. */
  announce(text: string): void;
}

/**
 * A polite live region's text, for the running commentary a form control owes
 * a screen reader: commits, clears, refused entries, result counts — changes
 * a sighted user sees but that are otherwise silent.
 *
 * Extracted because five controls (`uni-combobox`, `uni-tag-input`,
 * `uni-time-input`, `uni-date-input`, `uni-calendar`) carried byte-identical
 * copies, including the repeat trick below — the kind of subtlety that is
 * quietly dropped when the sixth control hand-rolls its own.
 *
 * Announcing the same text twice must still be heard: assistive tech reads a
 * live region when its content *changes*, so setting an identical string is a
 * no-op and the second "No match." would be silent. A trailing space breaks
 * the equality without changing a word of what is read. Successive repeats
 * alternate between the padded and unpadded form, so nothing accumulates.
 *
 * Deliberately holds no DOM and no styling: the region belongs to the
 * component's own template, where its placement and visually-hidden class are
 * already the component's business.
 */
export function createAnnouncer(): Announcer {
  const message = signal('');

  return {
    message: message.asReadonly(),
    announce(text: string): void {
      message.set(message() === text ? `${text} ` : text);
    },
  };
}
