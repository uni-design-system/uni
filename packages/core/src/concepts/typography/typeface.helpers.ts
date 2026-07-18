import type { TextStyle, TypeFaceDefinition } from './text.model';

const px = (value: number): string => `${value}px`;

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
  ...(style.fontWeight !== undefined && { fontWeight: style.fontWeight }),
  ...(style.fontStyle && { fontStyle: style.fontStyle }),
});

export const toTypefaces = (
  typography: Record<string, TextStyle>
): Record<string, TypeFaceDefinition> =>
  Object.fromEntries(Object.entries(typography).map(([role, style]) => [role, toTypeface(style)]));
