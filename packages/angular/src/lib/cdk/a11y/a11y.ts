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
