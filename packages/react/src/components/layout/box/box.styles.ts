import { css } from '@emotion/css';

import type {
  ContainerColorToken,
  OptionalAlignContent,
  OptionalAlignItems,
  OptionalAlignSelf,
  OptionalBorder,
  OptionalColor,
  OptionalDisplay,
  OptionalFlexDirection,
  OptionalJustifyContent,
  OptionalOverflow,
  OptionalPosition,
  OptionalRadius,
  OptionalSize,
  OptionalTextAlign,
  OptionalWrap,
  Shadow,
  Variant,
  ZIndexableElements,
} from '@uni-design-system/uni-core';

import { useThemeStyles, type ThemeStyles } from '../../../core/theme';

/**
 * Every style prop the Box primitive understands. Spacing, radius, border,
 * shadow and color props take **theme tokens**; sizing props (height/width/
 * min/max/inset) take a **number (px) or a CSS length string**.
 */
export interface BoxStyleProps {
  /** Container color token — paints the background and its matching on-color. */
  color?: ContainerColorToken;
  backgroundColor?: OptionalColor;
  borderRadius?: OptionalRadius;
  borderRadiusLeft?: OptionalRadius;
  borderRadiusRight?: OptionalRadius;
  borderRadiusTop?: OptionalRadius;
  borderRadiusBottom?: OptionalRadius;
  padding?: OptionalSize;
  paddingHorizontal?: OptionalSize;
  paddingVertical?: OptionalSize;
  paddingLeft?: OptionalSize;
  paddingRight?: OptionalSize;
  paddingTop?: OptionalSize;
  paddingBottom?: OptionalSize;
  border?: OptionalBorder;
  borderTop?: OptionalBorder;
  borderBottom?: OptionalBorder;
  borderLeft?: OptionalBorder;
  borderRight?: OptionalBorder;
  /** Draws `border` as an SVG dashed outline instead of a solid one. */
  dashBorder?: boolean;
  alignSelf?: OptionalAlignSelf;
  alignItems?: OptionalAlignItems;
  alignContent?: OptionalAlignContent;
  justifyContent?: OptionalJustifyContent;
  grow?: number;
  display?: OptionalDisplay;
  position?: OptionalPosition;
  inset?: number | string;
  /** Number = px (`height={420}`); string = CSS length (`height="420px"`). */
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  /** Number = px (`width={420}`); string = CSS length (`width="50%"`). */
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  /** When true (default), flex direction flips under `dir="rtl"`. */
  ignoreDir?: boolean;
  gridArea?: string;
  gridColumn?: string;
  gridRow?: string;
  overflow?: OptionalOverflow;
  shadow?: Shadow;
  gap?: OptionalSize;
  fullWidth?: boolean;
  fullHeight?: boolean;
  flexDirection?: OptionalFlexDirection;
  textAlign?: OptionalTextAlign;
  wrapItems?: OptionalWrap;
  zIndex?: ZIndexableElements;
}

/**
 * The runtime key list used to split style props from the DOM props that pass
 * through to the rendered element. Kept exhaustive by `assertExhaustive` below.
 */
export const BOX_STYLE_PROP_KEYS = [
  'color',
  'backgroundColor',
  'borderRadius',
  'borderRadiusLeft',
  'borderRadiusRight',
  'borderRadiusTop',
  'borderRadiusBottom',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'border',
  'borderTop',
  'borderBottom',
  'borderLeft',
  'borderRight',
  'dashBorder',
  'alignSelf',
  'alignItems',
  'alignContent',
  'justifyContent',
  'grow',
  'display',
  'position',
  'inset',
  'height',
  'minHeight',
  'maxHeight',
  'width',
  'minWidth',
  'maxWidth',
  'ignoreDir',
  'gridArea',
  'gridColumn',
  'gridRow',
  'overflow',
  'shadow',
  'gap',
  'fullWidth',
  'fullHeight',
  'flexDirection',
  'textAlign',
  'wrapItems',
  'zIndex',
] as const satisfies readonly (keyof BoxStyleProps)[];

// Compile-time guard: every BoxStyleProps key must appear in the list above,
// or it would silently leak onto the DOM element as an unknown attribute.
type AssertNever<T extends never> = T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the alias IS the check
type _NoMissingKeys = AssertNever<
  Exclude<keyof BoxStyleProps, (typeof BOX_STYLE_PROP_KEYS)[number]>
>;

const STYLE_PROP_SET = new Set<string>(BOX_STYLE_PROP_KEYS);

/** Split a props bag into Box style props and the rest (DOM/element props). */
export function splitBoxProps<P extends BoxStyleProps>(
  props: P
): [BoxStyleProps, Omit<P, keyof BoxStyleProps>] {
  const styleProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const key of Object.keys(props)) {
    const target = STYLE_PROP_SET.has(key) ? styleProps : rest;
    target[key] = (props as Record<string, unknown>)[key];
  }

  return [styleProps as BoxStyleProps, rest as Omit<P, keyof BoxStyleProps>];
}

/**
 * The Box class name, resolved token-for-token the same way the Angular
 * `UniBoxComponent` resolves it — including declaration order, so overlapping
 * props (e.g. `display` after `alignSelf`) win identically in both frameworks.
 */
export function boxClassName(props: BoxStyleProps, styles: ThemeStyles): string {
  const { border, dashBorder = false, ignoreDir = true, flexDirection } = props;

  return css([
    {
      ...styles.colorPair(props.color),
      ...styles.backgroundColor(props.backgroundColor),
      display: props.alignSelf ? 'flex' : 'block',
      position: props.position,
      inset: props.inset,
      boxSizing: 'border-box',
      height: props.height,
      minHeight: props.minHeight,
      maxHeight: props.maxHeight,
      width: props.width,
      minWidth: props.minWidth,
      maxWidth: props.maxWidth,
      flexWrap: props.wrapItems,
      overflow: props.overflow,
      ...styles.padding(props.padding),
      ...styles.horizontalPadding(props.paddingHorizontal),
      ...styles.verticalPadding(props.paddingVertical),
      ...styles.paddingLeft(props.paddingLeft),
      ...styles.paddingRight(props.paddingRight),
      ...styles.paddingTop(props.paddingTop),
      ...styles.paddingBottom(props.paddingBottom),
      ...styles.boxShadow(props.shadow),
      ...styles.radius(props.borderRadius),
      ...styles.getRadiusLeft(props.borderRadiusLeft),
      ...styles.getRadiusRight(props.borderRadiusRight),
      ...styles.getRadiusTop(props.borderRadiusTop),
      ...styles.getRadiusBottom(props.borderRadiusBottom),
      ...styles.borderTop(props.borderTop),
      ...styles.borderBottom(props.borderBottom),
      ...styles.borderLeft(props.borderLeft),
      ...styles.borderRight(props.borderRight),
      ...styles.gap(props.gap),
      ...styles.style('display', props.display),
      ...styles.style('alignSelf', props.alignSelf),
      ...styles.style('alignItems', props.alignItems),
      ...styles.style('justifyContent', props.justifyContent),
      ...styles.style('alignContent', props.alignContent),
      ...styles.style('flexGrow', props.grow),
      ...styles.style('flexDirection', props.flexDirection),
      ...styles.style('gridArea', props.gridArea),
      ...styles.style('gridColumn', props.gridColumn),
      ...styles.style('gridRow', props.gridRow),
      ...styles.style('textAlign', props.textAlign),
      ...styles.zIndex(props.zIndex),
    },
    border && !dashBorder && { ...styles.border(border) },
    border && dashBorder && { ...styles.getDashedBorder(border as Variant, props.borderRadius) },

    props.fullWidth && { width: '100%' },
    props.fullHeight && { height: '100%' },

    ignoreDir &&
      (flexDirection ?? 'row') === 'row' && {
        '&:dir(rtl)': { flexDirection: 'row-reverse' },
      },
    ignoreDir &&
      (flexDirection ?? 'row') === 'row-reverse' && {
        '&:dir(rtl)': { flexDirection: 'row' },
      },
  ]);
}

/** The Box class name for the active theme. */
export function useBoxClassName(props: BoxStyleProps): string {
  const styles = useThemeStyles();
  return boxClassName(props, styles);
}
