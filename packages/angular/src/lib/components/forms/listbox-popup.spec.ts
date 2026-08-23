/**
 * The anchored popup path cannot be exercised through a component under
 * jsdom — there is no `CSS` global, so the feature gate is permanently false
 * and every component spec runs the in-flow fallback. These specs drive the
 * gate directly, both ways, so the top-layer branch is not shipped untested.
 */
import type { ThemeService } from '../../theming';
import {
  listboxPopupAttr,
  listboxPopupStyles,
  newListboxAnchor,
  supportsAnchoredPopup,
} from './listbox-popup';

/**
 * Only the resolvers the popup styles call. The style ones contribute nothing;
 * `motion` returns the base `popup` token, which is what the theme resolves.
 */
const theme = {
  colorPair: () => ({}),
  boxShadow: () => ({}),
  radius: () => ({}),
  typeface: () => ({}),
  motion: () => ({ duration: 100, easing: 'linear', scale: 0.8 }),
} as unknown as ThemeService;

/** Installs a `CSS.supports` answering `yes` for the duration of one test. */
const withAnchorSupport = (supported: boolean, run: () => void) => {
  const global = globalThis as { CSS?: unknown };
  const original = Object.getOwnPropertyDescriptor(global, 'CSS');
  Object.defineProperty(global, 'CSS', {
    value: { supports: () => supported },
    configurable: true,
    writable: true,
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(global, 'CSS', original);
    else delete global.CSS;
  }
};

describe('listbox popup', () => {
  describe('feature gate', () => {
    it('reads an absent CSS global as unsupported', () => {
      // jsdom's baseline — and the reason the component specs stay in flow.
      expect(supportsAnchoredPopup()).toBe(false);
      expect(listboxPopupAttr()).toBeNull();
    });

    it('promotes to the top layer only where anchors are supported', () => {
      withAnchorSupport(true, () => {
        expect(supportsAnchoredPopup()).toBe(true);
        expect(listboxPopupAttr()).toBe('manual');
      });
    });

    it('stays in flow where popover exists but anchors do not', () => {
      // Safari 17–25. Promoting here would strand the popup: a top-layer
      // element has no positioned ancestor, so the fallback's `top: 100%`
      // would resolve against the viewport.
      withAnchorSupport(false, () => {
        expect(supportsAnchoredPopup()).toBe(false);
        expect(listboxPopupAttr()).toBeNull();
      });
    });

    it('never uses auto — these controls own their own dismissal', () => {
      withAnchorSupport(true, () => expect(listboxPopupAttr()).not.toBe('auto'));
    });
  });

  describe('anchor names', () => {
    it('mints a dashed-ident usable as a CSS anchor-name', () => {
      expect(newListboxAnchor().name).toMatch(/^--/);
    });

    it('gives each field its own, so two on a page do not cross-anchor', () => {
      expect(newListboxAnchor().name).not.toBe(newListboxAnchor().name);
    });

    it('exposes the name as a style fragment for the field wrapper', () => {
      const anchor = newListboxAnchor();
      expect(anchor.style).toEqual({ anchorName: anchor.name });
    });
  });

  describe('styles', () => {
    const SUPPORTS = '@supports (position-anchor: --a)';

    it('keeps the in-flow fallback as the unconditional base', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--a' });

      // Browsers without anchor positioning read only these.
      expect(styles).toMatchObject({ position: 'absolute', top: '100%', left: 0, right: 0 });
    });

    it('adds the anchored block when given an anchor', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--field-1' }) as Record<
        string,
        Record<string, unknown>
      >;

      expect(styles[SUPPORTS]).toMatchObject({
        position: 'fixed',
        positionAnchor: '--field-1',
        width: 'anchor-size(width)',
      });
    });

    it('offers only the block flip — the popup is as wide as its own field', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
        string,
        Record<string, unknown>
      >;

      expect(styles[SUPPORTS].positionTryFallbacks).toBe('flip-block');
    });

    it('drops the UA popover border', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
        string,
        Record<string, unknown>
      >;

      expect(styles[SUPPORTS].border).toBe('none');
    });

    it('never touches background — the shorthand would erase the painted surface', () => {
      // Regression: `background: transparent` here to reset the UA's `Canvas`
      // wiped `colorPair`'s background-color from the base rules, and the list
      // rendered see-through with the page showing behind it. The UA value
      // needs no reset — author styles beat it on origin alone.
      const anchored = (
        listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<string, Record<string, unknown>>
      )[SUPPORTS];

      expect(anchored.background).toBeUndefined();
      expect(anchored.backgroundColor).toBeUndefined();
    });

    it('sizes to the field with border-box, so padding does not widen it', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
        string,
        Record<string, unknown>
      >;

      // `anchor-size` yields the anchor's border-box width; content-box would
      // add the base rules' 4px padding on each side.
      expect(styles[SUPPORTS]).toMatchObject({
        width: 'anchor-size(width)',
        boxSizing: 'border-box',
      });
    });

    it('omits the anchored block entirely without an anchor', () => {
      const styles = listboxPopupStyles(theme, {});

      expect(styles[SUPPORTS]).toBeUndefined();
      expect(styles).toMatchObject({ position: 'absolute' });
    });

    it('declares the anchored block last, so it wins over the rules it replaces', () => {
      const keys = Object.keys(listboxPopupStyles(theme, {}, { anchor: '--a' }));

      expect(keys[keys.length - 1]).toBe(SUPPORTS);
    });

    it('opens with the same scale-and-fade as uni-dropdown', () => {
      const anchored = (
        listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
          string,
          Record<string, Record<string, Record<string, unknown>>>
        >
      )[SUPPORTS];
      const motion = anchored['@media (prefers-reduced-motion: no-preference)'];

      expect(motion).toMatchObject({
        transitionBehavior: 'allow-discrete',
        opacity: 0,
        transform: 'scale(0.8)',
        // display/overlay must ride along or the popup cannot animate into
        // and out of the top layer.
        transitionProperty: 'opacity, transform, display, overlay',
      });
      expect(motion['&:popover-open']).toMatchObject({ opacity: 1, transform: 'scale(1)' });
      // Without a starting style the entry transition has nothing to run from.
      expect(motion['@starting-style']['&:popover-open']).toMatchObject({ opacity: 0 });
    });

    it('matches uni-dropdown down to the easing', () => {
      // Parity is the point: a multi-select-dropdown and a combobox sitting in
      // the same form must not open at visibly different rates. `linear` is
      // the dropdown's, and the one place an overlay here leaves the default.
      const motion = (
        listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
          string,
          Record<string, Record<string, unknown>>
        >
      )[SUPPORTS]['@media (prefers-reduced-motion: no-preference)'];

      expect(motion.transitionDuration).toBe('100ms');
      expect(motion.transitionTimingFunction).toBe('linear');
    });

    it('puts the whole transition behind prefers-reduced-motion', () => {
      const anchored = (
        listboxPopupStyles(theme, {}, { anchor: '--a' }) as Record<
          string,
          Record<string, unknown>
        >
      )[SUPPORTS];

      // The hidden state lives inside the media query too — otherwise a
      // reduced-motion user would get opacity: 0 with nothing to restore it.
      expect(anchored.opacity).toBeUndefined();
      expect(anchored['&:popover-open']).toBeUndefined();
      expect(anchored['@media (prefers-reduced-motion: no-preference)']).toBeDefined();
    });

    it('still carries the shared option chrome', () => {
      const styles = listboxPopupStyles(theme, {}, { anchor: '--a', maxHeight: 120 });

      expect(styles.maxHeight).toBe(120);
      expect(styles['& [role="option"]']).toBeDefined();
    });
  });
});
