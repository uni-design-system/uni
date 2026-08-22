import { useMemo } from 'react';
import {
  Z_INDEX,
  type Border,
  type ColorKey,
  type ColorToken,
  type ContainerColorToken,
  type NullableSize,
  type NullableStyleExpression,
  type OptionalSize,
  type Radius,
  type Shadow,
  type Thickness,
  type UniTheme,
  type ZIndexableElements,
} from '@uni-design-system/uni-core';

import { safeParseInt } from '../../utils';
import { useTheme } from './theming';

/**
 * Token → CSS resolvers for a single theme. This is the React port of the
 * Angular `ThemeService` style methods: same names, same arguments, same
 * output, so a layout primitive written against either framework resolves a
 * token to identical CSS.
 *
 * Every resolver returns `undefined` for a missing token so callers can spread
 * it unconditionally: `{ ...styles.padding(padding) }`.
 */
export function createThemeStyles(theme: UniTheme) {
  const colors = theme.colors;
  const spacing = theme.spacing;
  const radii = theme.radii;
  const borders = theme.borders;
  const shadows = theme.shadows;
  const thicknesses = theme.thicknesses;

  const getContentColor = (token: ContainerColorToken, useVariant?: boolean) =>
    useVariant ? colors[`on-${token}-variant` as ColorToken] : colors[`on-${token}` as ColorToken];

  return {
    theme,
    colors,
    colorPalette: () => colors,

    getSpacing: (size: NullableSize) => (size === 'none' ? 'none' : spacing[size]),
    getThickness: (thickness: Thickness) => thicknesses[thickness],

    getContentColor,

    /** Background + matching on-color for a container token, as one pair. */
    colorPair: (token?: ContainerColorToken, colorVariant?: boolean): NullableStyleExpression => {
      if (!token) return undefined;
      return { color: getContentColor(token, colorVariant), backgroundColor: colors[token] };
    },

    color: (color?: ColorKey): NullableStyleExpression =>
      !color ? undefined : { color: colors[color] },

    backgroundColor: (token?: ColorKey): NullableStyleExpression =>
      !token ? undefined : { backgroundColor: colors[token] },

    backgroundImage: (url?: string): NullableStyleExpression =>
      !url ? undefined : { backgroundImage: `url(${url})` },

    borderColor: (borderColor: ColorToken): NullableStyleExpression => ({
      borderColor: colors[borderColor],
    }),

    /** An SVG-drawn dashed outline — CSS `dashed` cannot control dash length. */
    getDashedBorder: (color?: ColorKey, radius?: Radius): NullableStyleExpression => {
      if (!color) return undefined;

      const r = radius && radii[radius];
      const borderRadius = r ? safeParseInt(r) : 0;
      const strokeColor = colors[color]?.replace('#', '%23');

      return {
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${borderRadius}' ry='${borderRadius}' stroke='${strokeColor}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
        borderRadius,
      };
    },

    radius: (size?: Radius): NullableStyleExpression =>
      !size ? undefined : { borderRadius: radii[size] },

    getRadiusLeft: (size?: Radius): NullableStyleExpression =>
      !size ? undefined : { borderBottomLeftRadius: radii[size], borderTopLeftRadius: radii[size] },

    getRadiusRight: (size?: Radius): NullableStyleExpression =>
      !size
        ? undefined
        : { borderBottomRightRadius: radii[size], borderTopRightRadius: radii[size] },

    getRadiusTop: (size?: Radius): NullableStyleExpression =>
      !size ? undefined : { borderTopLeftRadius: radii[size], borderTopRightRadius: radii[size] },

    getRadiusBottom: (size?: Radius): NullableStyleExpression =>
      !size
        ? undefined
        : { borderBottomLeftRadius: radii[size], borderBottomRightRadius: radii[size] },

    padding: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { padding: spacing[size] },

    horizontalPadding: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingInline: spacing[size] },

    verticalPadding: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingBlock: spacing[size] },

    paddingLeft: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingLeft: spacing[size] },

    paddingRight: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingRight: spacing[size] },

    paddingTop: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingTop: spacing[size] },

    paddingBottom: (size: OptionalSize): NullableStyleExpression =>
      !size ? undefined : { paddingBottom: spacing[size] },

    border: (border?: Border): NullableStyleExpression =>
      !border ? undefined : { border: borders[border] },

    borderTop: (border?: Border): NullableStyleExpression =>
      !border ? undefined : { borderTop: borders[border] },

    borderBottom: (border?: Border): NullableStyleExpression =>
      !border ? undefined : { borderBottom: borders[border] },

    borderLeft: (border?: Border): NullableStyleExpression =>
      !border ? undefined : { borderLeft: borders[border] },

    borderRight: (border?: Border): NullableStyleExpression =>
      !border ? undefined : { borderRight: borders[border] },

    boxShadow: (shadow?: Shadow): NullableStyleExpression =>
      !shadow ? undefined : { boxShadow: shadows[shadow] },

    gap: (gap: OptionalSize): NullableStyleExpression =>
      !gap || gap === 'none' ? undefined : { gap: spacing[gap] },

    zIndex: (element?: ZIndexableElements): NullableStyleExpression =>
      !element ? undefined : { zIndex: Z_INDEX[element] },

    /** One property, dropped when the value is absent (or falsy, as in Angular). */
    style: (prop: string, value?: string | number): NullableStyleExpression =>
      !value ? undefined : { [prop]: value },
  };
}

export type ThemeStyles = ReturnType<typeof createThemeStyles>;

/** The active theme's token → CSS resolvers, recomputed only when the theme changes. */
export function useThemeStyles(): ThemeStyles {
  const theme = useTheme();
  return useMemo(() => createThemeStyles(theme), [theme]);
}
