import { describe, expect, it } from 'vitest';
import {
  anchorArrowStyles,
  anchorStyles,
  newAnchorName,
  spotlightStyles,
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

  it('clips each side to the outer half so borders never cross into the panel', () => {
    expect(anchorArrowStyles('bottom')['clipPath']).toBe(
      'polygon(0 0, calc(100% + 2px) 0, 0 calc(100% + 2px))'
    );
    expect(anchorArrowStyles('top')['clipPath']).toBe(
      'polygon(calc(0% - 2px) 100%, 100% calc(0% - 2px), 100% 100%)'
    );
    expect(anchorArrowStyles('left')['clipPath']).toBe(
      'polygon(calc(0% - 2px) 0, 100% 0, 100% calc(100% + 2px))'
    );
    expect(anchorArrowStyles('right')['clipPath']).toBe(
      'polygon(0 calc(0% - 2px), calc(100% + 2px) 100%, 0 100%)'
    );
  });

  it('aligned placements clip by their side, and overlap is tunable', () => {
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
