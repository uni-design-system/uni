import { uniqueId } from '../a11y/a11y';

/**
 * Native CSS Anchor Positioning helpers (Baseline 2026). These replace the
 * former @floating-ui/dom dependency: the browser tracks the anchor natively
 * (no scroll/resize listeners), and `position-try-fallbacks` flips the panel
 * at viewport edges where supported (Chrome 125+, Firefox 147+, Safari 26+;
 * older Baseline browsers still position correctly but do not auto-flip).
 */

export type Placement =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-start'
  | 'right-start'
  | 'bottom-start'
  | 'left-start'
  | 'top-end'
  | 'right-end'
  | 'bottom-end'
  | 'left-end';

/** Distances between the anchor and the positioned panel, in px. */
export interface AnchorOffset {
  /** Gap along the placement axis (anchor → panel). */
  mainAxis?: number;
  /** Shift along the cross axis, from the aligned edge. */
  alignmentAxis?: number;
}

/** Returns a document-unique dashed-ident usable as a CSS `anchor-name`. */
export function newAnchorName(): string {
  return `--${uniqueId('uni-anchor')}`;
}

const POSITION_AREA: Record<Placement, string> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top-start': 'top span-right',
  'top-end': 'top span-left',
  'bottom-start': 'bottom span-right',
  'bottom-end': 'bottom span-left',
  'left-start': 'left span-bottom',
  'left-end': 'left span-top',
  'right-start': 'right span-bottom',
  'right-end': 'right span-top',
};

const MAIN_MARGIN: Record<string, string> = {
  top: 'marginBottom',
  bottom: 'marginTop',
  left: 'marginRight',
  right: 'marginLeft',
};

/**
 * Emotion style object anchoring a panel to `anchor` at `placement`.
 * Spread into the panel's `css()` styles. The trigger element must carry
 * `anchor-name: <anchor>` (see `newAnchorName`).
 */
export function anchorStyles(
  anchor: string,
  placement: Placement,
  offset: AnchorOffset = {}
): Record<string, string | number> {
  const [side, align] = placement.split('-') as [string, string | undefined];

  const styles: Record<string, string | number> = {
    position: 'fixed',
    positionAnchor: anchor,
    positionArea: POSITION_AREA[placement],
    positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
    // Popover UA styles set inset:0 + margin:auto; anchored elements must not
    inset: 'auto',
    margin: 0,
  };

  styles[MAIN_MARGIN[side]] = offset.mainAxis ?? 0;

  const cross = offset.alignmentAxis ?? 0;
  if (align && cross) {
    const horizontal = side === 'top' || side === 'bottom';
    const crossMargin = horizontal
      ? align === 'start'
        ? 'marginLeft'
        : 'marginRight'
      : align === 'start'
        ? 'marginTop'
        : 'marginBottom';
    styles[crossMargin] = cross;
  }

  return styles;
}

/**
 * Absolute positioning for a rotated-square arrow sitting on the panel edge
 * that faces the anchor. Static per placement: if the browser flips the panel
 * via position-try, the arrow stays on the configured side (cosmetic-only
 * degradation, matching the flip-support caveat above).
 */
export function anchorArrowStyles(placement: Placement, size = 8): Record<string, string | number> {
  const [side, align] = placement.split('-') as [string, string | undefined];
  const overlap = -(size / 2);
  const styles: Record<string, string | number> = {
    position: 'absolute',
    width: size,
    height: size,
    transform: 'rotate(45deg)',
  };

  // Edge facing the anchor
  const facing: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  styles[facing[side]] = overlap;

  // Cross-axis position along that edge
  const horizontal = side === 'top' || side === 'bottom';
  const crossProp = horizontal ? 'left' : 'top';
  const crossPropEnd = horizontal ? 'right' : 'bottom';
  if (!align) {
    styles[crossProp] = `calc(50% - ${size / 2}px)`;
  } else if (align === 'start') {
    styles[crossProp] = size * 1.5;
  } else {
    styles[crossPropEnd] = size * 1.5;
  }

  return styles;
}
