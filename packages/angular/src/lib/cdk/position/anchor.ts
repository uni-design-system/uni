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
 * The half of the arrow square kept by `clip-path`, in the square's local
 * (pre-rotation) coordinates: the outer triangle, extended `overlap`px past
 * the panel-edge diagonal. Without the clip, the two bordered edges run the
 * full square and their strokes visibly cut into the panel surface; with it,
 * they terminate inside the panel's own border line, and the retained sliver
 * of arrow background covers the panel border under the arrow base so it
 * reads as an opening. Keyed by the side of the anchor the panel sits on.
 */
const ARROW_CLIP: Record<string, (overlap: number) => string> = {
  // Arrow at the panel's top edge, borders top + left → keep the top-left half.
  bottom: (d) => `polygon(0 0, calc(100% + ${d}px) 0, 0 calc(100% + ${d}px))`,
  // Arrow at the panel's bottom edge, borders right + bottom.
  top: (d) => `polygon(calc(0% - ${d}px) 100%, 100% calc(0% - ${d}px), 100% 100%)`,
  // Arrow at the panel's right edge, borders right + top.
  left: (d) => `polygon(calc(0% - ${d}px) 0, 100% 0, 100% calc(100% + ${d}px))`,
  // Arrow at the panel's left edge, borders left + bottom.
  right: (d) => `polygon(0 calc(0% - ${d}px), calc(100% + ${d}px) 100%, 0 100%)`,
};

/**
 * Absolute positioning for a rotated-square arrow sitting on the panel edge
 * that faces the anchor. Static per placement: if the browser flips the panel
 * via position-try, the arrow stays on the configured side (cosmetic-only
 * degradation, matching the flip-support caveat above).
 *
 * `overlap` extends the clipped half past the panel edge so the arrow base
 * covers the panel's border line; the 2px default covers the 1px borders every
 * shipped theme uses — a theme with heavier panel borders should pass
 * `overlap` ≥ its border width + 1.
 */
export function anchorArrowStyles(
  placement: Placement,
  size = 8,
  overlap = 2
): Record<string, string | number> {
  const [side, align] = placement.split('-') as [string, string | undefined];
  const styles: Record<string, string | number> = {
    position: 'absolute',
    width: size,
    height: size,
    transform: 'rotate(45deg)',
    clipPath: ARROW_CLIP[side](overlap),
  };

  // Edge facing the anchor: half the square pokes out past the panel edge
  const facing: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  styles[facing[side]] = -(size / 2);

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

export interface SpotlightOptions {
  /** Gap between the target's box and the hole edge, px. */
  pad?: number;
  /** Ring border width, px — border-color and radius come from the caller. */
  ringWidth?: number;
  /** Scrim paint; scheme-invariant by convention, like `::backdrop`. */
  scrimColor?: string;
}

export interface SpotlightStyles {
  /** Paints the scrim + ring. `pointer-events: none` — purely visual. */
  window: Record<string, string | number>;
  /** Click-blockers surrounding the hole; the hole itself is genuinely empty. */
  strips: Record<'top' | 'bottom' | 'left' | 'right', Record<string, string | number>>;
  /** Hole-sized click-blocker, shown when the target must not be interactive. */
  cover: Record<string, string | number>;
}

/**
 * Scrim pieces that cut a spotlight hole around the element carrying
 * `anchor-name: <anchor>`. Every inset is `calc(anchor(<side>) ± px)`, so the
 * browser tracks the target through scroll/resize/layout with zero listeners.
 *
 * The window paints everything: its `border` is the focus ring and its huge
 * spread shadow is the scrim (an outer shadow of a rounded rect covers the
 * whole viewport except the rect, rounded corners included). It is
 * click-through; the four strips do the click-blocking, and the optional
 * cover blocks the hole itself. Callers append these to a fixed, transparent,
 * `pointer-events: none` full-viewport container (each piece is
 * `position: fixed`).
 */
export function spotlightStyles(anchor: string, options: SpotlightOptions = {}): SpotlightStyles {
  const pad = options.pad ?? 6;
  const ringWidth = options.ringWidth ?? 2;
  const scrimColor = options.scrimColor ?? 'rgba(0, 0, 0, 0.45)';

  const holeInset = (extra: number): Record<string, string> =>
    Object.fromEntries(
      (['top', 'left', 'right', 'bottom'] as const).map((side) => [
        side,
        `calc(anchor(${side}) - ${pad + extra}px)`,
      ])
    );

  const piece = { position: 'fixed', positionAnchor: anchor } as const;
  const blocker = { ...piece, pointerEvents: 'auto', background: 'transparent' } as const;

  return {
    window: {
      ...piece,
      ...holeInset(ringWidth), // the ring sits outside the padded hole
      pointerEvents: 'none',
      borderWidth: ringWidth,
      borderStyle: 'solid',
      boxShadow: `0 0 0 200vmax ${scrimColor}`,
    },
    strips: {
      top: { ...blocker, top: 0, left: 0, right: 0, bottom: `calc(anchor(top) + ${pad}px)` },
      bottom: { ...blocker, bottom: 0, left: 0, right: 0, top: `calc(anchor(bottom) + ${pad}px)` },
      left: {
        ...blocker,
        left: 0,
        right: `calc(anchor(left) + ${pad}px)`,
        top: `calc(anchor(top) - ${pad}px)`,
        bottom: `calc(anchor(bottom) - ${pad}px)`,
      },
      right: {
        ...blocker,
        right: 0,
        left: `calc(anchor(right) + ${pad}px)`,
        top: `calc(anchor(top) - ${pad}px)`,
        bottom: `calc(anchor(bottom) - ${pad}px)`,
      },
    },
    cover: { ...blocker, ...holeInset(0) },
  };
}
