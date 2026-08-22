import { afterRenderEffect, ElementRef, inject, type Signal } from '@angular/core';
import type { CSSObject } from '@emotion/css/create-instance';
import type { ColorKey, ContainerColorToken, Radius, Shadow } from '@uni-design-system/uni-core';
import {
  anchorStyles,
  discreteOverlayTransition,
  motionSafe,
  newAnchorName,
  transformOriginFor,
} from '../../cdk';
import type { ThemeService } from '../../theming';

/** Entry/exit timing, matching `uni-dropdown` so every popup panel in the
    library opens the same way. */
const POPUP_TRANSITION_MS = 100;

/**
 * Whether the browser can keep a top-layer popup attached to its field.
 *
 * The top layer and anchor positioning must be adopted together, and support
 * for them does not arrive together: Safari shipped `popover` in 17 but
 * `position-anchor` only in 26. Promoting the popup without anchor support
 * would strand it — a top-layer element has no positioned ancestor, so the
 * fallback's `position: absolute; top: 100%` would resolve against the
 * viewport and drop the list a full screen height down the page. So the
 * `popover` attribute is gated on this too, not just the anchored CSS.
 *
 * Undefined `CSS` (jsdom) reads as unsupported, which is also what keeps the
 * popup in the normal flow — and the component specs unchanged — under test.
 */
export const supportsAnchoredPopup = (): boolean =>
  typeof CSS !== 'undefined' && CSS.supports?.('position-anchor: --a') === true;

/** `popover` attribute value for a listbox popup, or null where unsupported.
    Always `manual`: these controls already own dismissal (focusout, Escape,
    commit), and `auto`'s light-dismiss fires on pointerdown outside the
    popup — which includes their own field, closing the list behind the
    component's back on every click into the input. */
export const listboxPopupAttr = (): 'manual' | null =>
  supportsAnchoredPopup() ? 'manual' : null;

/**
 * A document-unique `anchor-name`, plus the style fragment that puts it on the
 * field wrapper. Spread `style` into the wrapper's `css()` and pass `name` to
 * {@link listboxPopupStyles}.
 */
export function newListboxAnchor(): { name: string; style: CSSObject } {
  const name = newAnchorName();
  return { name, style: { anchorName: name } };
}

/**
 * Shows the popup in the top layer as soon as it renders, and scales its
 * entry animation out of the edge it actually opened from.
 *
 * The popups are `@if`-rendered, and a `popover` element is `display: none`
 * until `showPopover()` runs — so appearing in the DOM is not enough. Runs on
 * every render pass; `showPopover()` on an already-open popup throws, which is
 * the cheapest way to ask "is it open?".
 *
 * The origin is measured rather than assumed: `position-try-fallbacks` may
 * have flipped the popup above its field near the bottom of the viewport, and
 * the static `top center` would then grow it from the wrong edge. Measuring
 * forces layout, so it lands before the first frame of the transition.
 *
 * Call from an injection context (a field initializer or the constructor);
 * the component's host element is the anchor.
 */
export function promoteListboxPopup(ref: Signal<ElementRef<HTMLElement> | undefined>): void {
  const anchor = inject(ElementRef).nativeElement as HTMLElement;

  afterRenderEffect(() => {
    const element = ref()?.nativeElement;
    // The attribute, not the `popover` IDL property: the property is what the
    // gate already decided, and jsdom does not reflect it.
    if (!element?.isConnected || !element.hasAttribute('popover')) return;
    try {
      element.showPopover();
    } catch {
      return; // Already open — its origin was set when it opened.
    }
    const origin = transformOriginFor(
      element.getBoundingClientRect(),
      anchor.getBoundingClientRect()
    );
    if (origin) element.style.transformOrigin = origin;
  });
}

/**
 * The theme options every listbox popup shares — the "list trio" plus the
 * active-option fill. Component option interfaces (searchInput, tagInput,
 * timeInput, combobox) satisfy this structurally; their extra options ride
 * alongside. `ColorKey`-typed so the wider `searchInput` contract (custom
 * theme color tokens) stays satisfiable; `colorPair` resolves any registered
 * token at runtime.
 */
export interface UniListboxPopupOptions {
  /** Popup surface; its on-color pair is derived and cascades to options. */
  listColor?: ColorKey;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover option fill; the on-color pair is derived. Must contrast
      with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ColorKey;
}

/**
 * The anchored half: the popup in the top layer, tracked to its field by the
 * browser with no scroll or resize listeners. This is what lets the list
 * escape an `overflow: hidden` ancestor, which the in-flow fallback below
 * cannot do.
 *
 * `anchor-size(width)` matches the field's width the way `left: 0; right: 0`
 * did in flow. Only the block flip is offered: the popup is as wide as its
 * own field, so flipping it inline would only slide it off that field.
 *
 * `border: none` drops the UA's `[popover]` border. Its `background-color:
 * Canvas` needs no reset — the base rules' `colorPair` beats it on origin
 * alone — and must not get one: `background` is a shorthand, so resetting it
 * here would erase that painted surface and leave the list transparent.
 *
 * `border-box` keeps the popup exactly as wide as its field: `anchor-size`
 * yields the anchor's border-box width, which the base rules' padding would
 * otherwise widen by 8px.
 */
const anchoredPopupStyles = (anchor: string): CSSObject => ({
  ...anchorStyles(anchor, 'bottom-start', { mainAxis: 4 }),
  positionTryFallbacks: 'flip-block',
  width: 'anchor-size(width)',
  boxSizing: 'border-box',
  border: 'none',
  // Grows out of the field's bottom edge; corrected after measuring when the
  // browser flips the popup above instead (see promoteListboxPopup).
  transformOrigin: 'top center',
  ...(motionSafe(
    discreteOverlayTransition(
      POPUP_TRANSITION_MS,
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    )
  ) as CSSObject),
});

/**
 * Style block for the popup behind every `ListboxNavigation` consumer: a
 * `ul[role="listbox"]` under its field wrapper, with the shared option chrome
 * and active/hover highlight.
 *
 * Extracted because four components (`uni-search-input`, `uni-tag-input`,
 * `uni-time-input`, `uni-combobox`) carried hand-rolled copies, and the parts
 * that silently drift between copies all live here: the surface/elevation
 * trio, and the `activeColor` pair that themes re-point when their container
 * tokens don't contrast (see the Wellsourced overrides).
 *
 * Pass `anchor` (from {@link newListboxAnchor}) to get the top-layer
 * positioning where the browser supports it. Without it — or on a browser that
 * lacks anchor positioning — the popup stays absolutely positioned under a
 * `position: relative` wrapper, which clips inside `overflow: hidden`
 * ancestors but at least stays on its field.
 *
 * Compose extras with the array form — `css([listboxPopupStyles(…), {…}])` —
 * so a component's own `& [role="option"]` block cascades after this one
 * instead of replacing it (an object spread would overwrite the key).
 */
export const listboxPopupStyles = (
  theme: ThemeService,
  options: UniListboxPopupOptions,
  { maxHeight = 280, anchor }: { maxHeight?: number; anchor?: string } = {}
): CSSObject => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 20,
  margin: '4px 0 0',
  padding: 4,
  listStyle: 'none',
  maxHeight,
  overflowY: 'auto',
  ...theme.colorPair((options.listColor ?? 'primary-surface') as ContainerColorToken),
  ...theme.boxShadow(options.listShadow ?? 'menu'),
  ...theme.radius(options.listBorderRadius ?? 'xs'),
  '& [role="option"]': {
    padding: '8px 12px',
    cursor: 'pointer',
    ...theme.typeface('label'),
    ...theme.radius('xxs'),
    '&.active, &:not([aria-disabled="true"]):hover': {
      ...theme.colorPair((options.activeColor ?? 'primary-container') as ContainerColorToken),
    },
  },
  // Last, so the anchored rules win over the in-flow ones they replace.
  ...(anchor ? { '@supports (position-anchor: --a)': anchoredPopupStyles(anchor) } : {}),
});
