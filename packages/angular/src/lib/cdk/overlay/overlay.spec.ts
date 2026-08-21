import { afterEach, describe, expect, it } from 'vitest';
import {
  TRANSFORM_ORIGINS,
  clearAnchorName,
  discreteOverlayTransition,
  focusableElements,
  isToggleOpen,
  resolveElement,
  restoreOverlayFocus,
  setAnchorName,
} from './overlay';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('TRANSFORM_ORIGINS', () => {
  it('covers all 12 placements with origins on the anchor-facing edge', () => {
    expect(Object.keys(TRANSFORM_ORIGINS)).toHaveLength(12);
    expect(TRANSFORM_ORIGINS['bottom']).toBe('top center');
    expect(TRANSFORM_ORIGINS['top-end']).toBe('bottom right');
  });
});

describe('anchor names', () => {
  it('sets and clears the anchor-name style', () => {
    const el = document.createElement('div');
    setAnchorName(el, '--uni-anchor-1');
    expect(el.style.getPropertyValue('anchor-name')).toBe('--uni-anchor-1');
    clearAnchorName(el);
    expect(el.style.getPropertyValue('anchor-name')).toBe('');
  });
});

describe('resolveElement', () => {
  it('passes elements through and looks up id strings at call time', () => {
    const el = document.createElement('div');
    el.id = 'field';
    document.body.appendChild(el);
    expect(resolveElement(el)).toBe(el);
    expect(resolveElement('field')).toBe(el);
  });

  it("treats '', null-ish, and unknown ids as unset", () => {
    expect(resolveElement('')).toBeNull();
    expect(resolveElement(null)).toBeNull();
    expect(resolveElement(undefined)).toBeNull();
    expect(resolveElement('nope')).toBeNull();
  });
});

describe('isToggleOpen', () => {
  it('reads the newState of a toggle event', () => {
    const open = new Event('toggle') as Event & { newState?: string };
    open.newState = 'open';
    const closed = new Event('toggle') as Event & { newState?: string };
    closed.newState = 'closed';
    expect(isToggleOpen(open)).toBe(true);
    expect(isToggleOpen(closed)).toBe(false);
  });
});

describe('discreteOverlayTransition', () => {
  it('derives the transition properties from the hidden keys plus display/overlay', () => {
    const block = discreteOverlayTransition(250, { opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' });
    expect(block['transitionProperty']).toBe('opacity, translate, display, overlay');
    expect(block['transitionDuration']).toBe('250ms');
    expect(block['transitionBehavior']).toBe('allow-discrete');
    expect(block['opacity']).toBe(0);
    expect(block['&:popover-open']).toEqual({ opacity: 1, translate: '0 0' });
    expect(block['@starting-style']).toEqual({ '&:popover-open': { opacity: 0, translate: '0 6px' } });
  });

  it('kebab-cases camelCase style keys in the property list', () => {
    const block = discreteOverlayTransition(100, { transformOrigin: 'top' }, { transformOrigin: 'top' });
    expect(block['transitionProperty']).toBe('transform-origin, display, overlay');
  });
});

describe('restoreOverlayFocus', () => {
  const setup = () => {
    const panel = document.createElement('div');
    const inside = document.createElement('button');
    panel.appendChild(inside);
    const target = document.createElement('button');
    const elsewhere = document.createElement('button');
    document.body.append(panel, target, elsewhere);
    return { panel, inside, target, elsewhere };
  };

  it('restores when focus was dropped on body or left inside the panel', () => {
    const { panel, inside, target } = setup();
    (document.activeElement as HTMLElement)?.blur?.();
    restoreOverlayFocus(panel, target);
    expect(document.activeElement).toBe(target);

    inside.focus();
    restoreOverlayFocus(panel, target);
    expect(document.activeElement).toBe(target);
  });

  it('does not steal focus resting elsewhere', () => {
    const { panel, target, elsewhere } = setup();
    elsewhere.focus();
    restoreOverlayFocus(panel, target);
    expect(document.activeElement).toBe(elsewhere);
  });
});

describe('focusableElements', () => {
  it('collects focusables in DOM order, skipping disabled controls', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button id="a">A</button>
      <button disabled id="b">B</button>
      <input id="c" />
      <a id="d" href="#">D</a>
      <span>text</span>
    `;
    document.body.appendChild(root);
    expect(focusableElements(root).map((el) => el.id)).toEqual(['a', 'c', 'd']);
  });
});
