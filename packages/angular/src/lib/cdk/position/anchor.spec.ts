import { describe, expect, it } from 'vitest';
import {
  anchorArrowStyles,
  anchorStyles,
  newAnchorName,
  spotlightStyles,
  transformOriginFor,
  type Placement,
} from './anchor';

const PLACEMENTS: Placement[] = [
  'top',
  'right',
  'bottom',
  'left',
  'top-start',
  'right-start',
  'bottom-start',
  'left-start',
  'top-end',
  'right-end',
  'bottom-end',
  'left-end',
];

describe('newAnchorName', () => {
  it('mints unique dashed-idents', () => {
    const a = newAnchorName();
    const b = newAnchorName();
    expect(a).toMatch(/^--[\w-]+$/);
    expect(a).not.toBe(b);
  });
});

describe('anchorStyles', () => {
  it('maps every placement to a position-area and resets popover UA styles', () => {
    for (const placement of PLACEMENTS) {
      const styles = anchorStyles('--a', placement);
      expect(styles['positionAnchor']).toBe('--a');
      expect(styles['positionArea']).toBeTruthy();
      expect(styles['inset']).toBe('auto');
      expect(styles['margin']).toBe(0);
      expect(styles['positionTryFallbacks']).toContain('flip-block');
    }
  });

  it('puts the main-axis gap on the margin facing the panel', () => {
    expect(anchorStyles('--a', 'bottom', { mainAxis: 7 })['marginTop']).toBe(7);
    expect(anchorStyles('--a', 'top', { mainAxis: 7 })['marginBottom']).toBe(7);
    expect(anchorStyles('--a', 'left', { mainAxis: 7 })['marginRight']).toBe(7);
    expect(anchorStyles('--a', 'right', { mainAxis: 7 })['marginLeft']).toBe(7);
  });

  it('applies the alignment-axis shift from the aligned edge', () => {
    expect(anchorStyles('--a', 'bottom-start', { alignmentAxis: 12 })['marginLeft']).toBe(12);
    expect(anchorStyles('--a', 'bottom-end', { alignmentAxis: 12 })['marginRight']).toBe(12);
    expect(anchorStyles('--a', 'right-start', { alignmentAxis: 12 })['marginTop']).toBe(12);
    expect(anchorStyles('--a', 'right-end', { alignmentAxis: 12 })['marginBottom']).toBe(12);
  });
});

describe('anchorArrowStyles', () => {
  it('offsets the facing edge by half the square and centers bare placements', () => {
    const styles = anchorArrowStyles('bottom');
    expect(styles['top']).toBe(-4);
    expect(styles['left']).toBe('calc(50% - 4px)');
    expect(styles['transform']).toBe('rotate(45deg)');
  });

  it('positions start/end arrows from the aligned edge', () => {
    expect(anchorArrowStyles('bottom-start')['left']).toBe(12);
    expect(anchorArrowStyles('bottom-end')['right']).toBe(12);
    expect(anchorArrowStyles('right-start')['top']).toBe(12);
    expect(anchorArrowStyles('right-end')['bottom']).toBe(12);
  });

  it('clips each side to the outer half, cut exactly on the panel edge', () => {
    expect(anchorArrowStyles('bottom')['clipPath']).toBe('polygon(0 0, 100% 0, 0 100%)');
    expect(anchorArrowStyles('top')['clipPath']).toBe('polygon(0 100%, 100% 0, 100% 100%)');
    expect(anchorArrowStyles('left')['clipPath']).toBe('polygon(0 0, 100% 0, 100% 100%)');
    expect(anchorArrowStyles('right')['clipPath']).toBe('polygon(0 0, 100% 100%, 0 100%)');
  });

  it('aligned placements clip by their side, and overlap extends into the panel', () => {
    expect(anchorArrowStyles('bottom-end')['clipPath']).toBe(
      anchorArrowStyles('bottom')['clipPath']
    );
    expect(anchorArrowStyles('bottom', 8, 3)['clipPath']).toBe(
      'polygon(0 0, calc(100% + 3px) 0, 0 calc(100% + 3px))'
    );
  });
});

describe('spotlightStyles', () => {
  const { window: win, strips, cover } = spotlightStyles('--spot');

  it('sizes the window to the hole plus the ring, painting the scrim as spread shadow', () => {
    // pad 6 + ring 2 = 8px from the target box — the geometry the prototype
    // suite asserts against the live layout.
    for (const side of ['top', 'left', 'right', 'bottom']) {
      expect(win[side]).toBe(`calc(anchor(${side}) - 8px)`);
    }
    expect(win['positionAnchor']).toBe('--spot');
    expect(win['pointerEvents']).toBe('none');
    expect(win['borderWidth']).toBe(2);
    expect(win['boxShadow']).toBe('0 0 0 200vmax rgba(0, 0, 0, 0.45)');
  });

  it('pins click-blocking strips around the hole', () => {
    expect(strips.top).toMatchObject({
      top: 0,
      left: 0,
      right: 0,
      bottom: 'calc(anchor(top) + 6px)',
      pointerEvents: 'auto',
    });
    expect(strips.bottom['top']).toBe('calc(anchor(bottom) + 6px)');
    expect(strips.left).toMatchObject({
      left: 0,
      right: 'calc(anchor(left) + 6px)',
      top: 'calc(anchor(top) - 6px)',
      bottom: 'calc(anchor(bottom) - 6px)',
    });
    expect(strips.right['left']).toBe('calc(anchor(right) + 6px)');
  });

  it('sizes the cover to the padded hole and honours custom options', () => {
    expect(cover['top']).toBe('calc(anchor(top) - 6px)');
    expect(cover['pointerEvents']).toBe('auto');

    const custom = spotlightStyles('--x', { pad: 10, ringWidth: 3, scrimColor: 'rgb(0 0 0 / 0.6)' });
    expect(custom.window['top']).toBe('calc(anchor(top) - 13px)');
    expect(custom.window['boxShadow']).toBe('0 0 0 200vmax rgb(0 0 0 / 0.6)');
    expect(custom.cover['top']).toBe('calc(anchor(top) - 10px)');
  });
});

describe('transformOriginFor', () => {
  const rect = (top: number, left: number, width: number, height: number) => ({
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  });
  // A 100×32 field at (100, 100)–(200, 132).
  const trigger = rect(100, 100, 100, 32);

  it('anchors a panel below the trigger at its top edge', () => {
    // bottom-end as requested: right edges aligned, panel below.
    expect(transformOriginFor(rect(136, 20, 180, 200), trigger)).toBe('top right');
    // bottom-start: left edges aligned.
    expect(transformOriginFor(rect(136, 100, 180, 200), trigger)).toBe('top left');
  });

  it('flips to the bottom edge when the browser repositioned the panel above', () => {
    // The reported bug: a bottom-end picker flipped above its field must
    // collapse from bottom right, not keep the requested top right.
    expect(transformOriginFor(rect(-104, 20, 180, 200), trigger)).toBe('bottom right');
  });

  it('anchors side placements at the edge facing the trigger', () => {
    // right of the trigger, vertically centered on it
    expect(transformOriginFor(rect(66, 204, 150, 100), trigger)).toBe('center left');
    // left of the trigger, bottom edges aligned (left-end)
    expect(transformOriginFor(rect(32, 0, 96, 100), trigger)).toBe('bottom right');
  });

  it('centers the cross axis when the panel is centered on the trigger', () => {
    // panel below, horizontally centered: equal overhang both sides
    expect(transformOriginFor(rect(136, 60, 180, 200), trigger)).toBe('top center');
  });

  it('returns null for a panel with no box (hidden, or jsdom)', () => {
    expect(transformOriginFor(rect(0, 0, 0, 0), trigger)).toBeNull();
  });
});
