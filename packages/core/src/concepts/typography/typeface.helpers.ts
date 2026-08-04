import type { CssLength, TextStyle, TypeFaceDefinition } from './text.model';
import type { FontWeight } from './typography.types';
import { FontWeightMap } from './typography.records';

const px = (value: CssLength): string => (typeof value === 'number' ? `${value}px` : value);

// Keyword weights ('medium', 'semi-bold', …) are design tokens, not valid CSS
// font-weight values — resolve them to their numeric equivalents.
const weight = (value: FontWeight): number =>
  typeof value === 'number' ? value : FontWeightMap[value];

/**
 * Converts a TextStyle (numeric, design-token oriented) into a
 * TypeFaceDefinition (CSS-ready) so a theme's `typefaces` map can be
 * derived from its `typography` block instead of being duplicated.
 */
export const toTypeface = (style: TextStyle): TypeFaceDefinition => ({
  fontFamily: style.fontFamily,
  fontSize: px(style.fontSize),
  lineHeight: px(style.lineHeight),
  ...(style.letterSpacing !== undefined && { letterSpacing: px(style.letterSpacing) }),
  ...(style.textTransform === 'uppercase' && { textTransform: 'uppercase' as const }),
  ...(style.fontWeight !== undefined && { fontWeight: weight(style.fontWeight) }),
  ...(style.fontStyle && { fontStyle: style.fontStyle }),
});

export const toTypefaces = (
  typography: Record<string, TextStyle>
): Record<string, TypeFaceDefinition> =>
  Object.fromEntries(Object.entries(typography).map(([role, style]) => [role, toTypeface(style)]));
