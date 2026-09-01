/**
 * Test helpers for asserting the CSS a component actually emitted.
 *
 * Outside `src/lib`, so it is unreachable from `public-api.ts` and never ships.
 *
 * Why this exists: jsdom is a weak oracle for anything that depends on the
 * cascade. It applies its own UA stylesheet, does not expand every shorthand,
 * and resolves some selectors it does not truly support — so a
 * `getComputedStyle` assertion can pass whether or not the rule under test is
 * present, and a guard written that way silently protects nothing. Reading the
 * emitted rule instead asserts what Emotion wrote, which is the thing the
 * component is actually responsible for.
 *
 * Use `getComputedStyle` for plain, single-declaration properties; reach for
 * this when the rule is behind a pseudo-class, a combinator, or a shorthand.
 */

/**
 * Whether `selector` targets exactly this class.
 *
 * A plain `includes('.' + name)` is wrong: emotion hashes vary in length, so
 * `.css-abc` substring-matches `.css-abc9` and a test picks up rules belonging
 * to an entirely different element. That reads as a colour "leaking" between
 * components and sends you hunting a bug that is not there.
 */
function matches(selector: string, className: string): boolean {
  return new RegExp(`\\.${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(
    selector
  );
}

/** Every Emotion rule matching any of `element`'s classes, whitespace stripped. */
export function emittedRuleFor(element: Element): string {
  // `getAttribute`, not `className`: on an SVG element `className` is an
  // `SVGAnimatedString`, and `uni-checkbox` renders its box and tick as SVG.
  //
  // Emotion classes only. Components also carry static hooks like
  // `.checkbox-box` and `.toggle-slider`, and those appear in the selectors of
  // *every* instance ever rendered — the stylesheet is global and accumulates
  // across a file's tests. Matching them collects rules belonging to earlier
  // fixtures, which looks exactly like a colour leaking between variants.
  const classes = (element.getAttribute('class') ?? '')
    .split(/\s+/)
    .filter((name) => name.startsWith('css-'));
  let text = '';
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // A cross-origin sheet cannot be read; nothing of ours lives there.
      continue;
    }
    for (const rule of Array.from(rules)) {
      const selector = (rule as CSSStyleRule).selectorText;
      if (selector && classes.some((c) => matches(selector, c))) {
        text += (rule as CSSStyleRule).cssText.replace(/\s+/g, '');
      }
    }
  }
  return text;
}
