import React, { ReactNode, useContext } from 'react';

import {
  ColorToken,
  ContentColorToken,
  FontWeight,
  FontWeightMap,
  HorizontalAlign,
  Size,
  TextRole,
} from '@uni-design-system/uni-core';
import { useTheme } from '../theme';
import { ContainerContext } from '../container';

export interface TextProps {
  text?: string;
  children?: ReactNode;
  align?: HorizontalAlign;
  role?: TextRole;
  scale?: Size;
  colorToken?: ContentColorToken;
}

export function Text(props: TextProps) {
  const { text, children, align, role = 'body-1-long', colorToken: overridingColorToken } = props;
  const { colors, typography } = useTheme();

  const { colorToken: containerColorToken } = useContext(ContainerContext);

  const colorToken = containerColorToken ? (`on-${containerColorToken}` as ColorToken) : undefined;

  const { fontSize, letterSpacing, lineHeight, fontWeight, fontFamily, fontStyle, textTransform } = typography[role];

  const style = {
    color: colors[overridingColorToken || colorToken || 'on-surface'],
    fontSize: fontSize + 'px',
    letterSpacing,
    textAlign: align,
    textTransform,
    lineHeight: lineHeight + 'px',
    fontFamily,
    fontStyle,
    fontWeight: FontWeightMap[fontWeight as FontWeight],
  };

  return <div style={style}>{text || children}</div>;
}
