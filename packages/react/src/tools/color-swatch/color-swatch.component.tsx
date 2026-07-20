import React, { CSSProperties, ReactNode } from 'react';
import { HSLAToString, RGB, RGBToHSL, ShadowElevation } from '@uni-design-system/uni-core';
import { BoxShadow, Padding, Text, useTheme } from '../../core';

export type CardType = 'elevated' | 'filled' | 'outlined';

export interface ColorSwatchProps {
  rgba: RGB;
  children?: ReactNode;
  cardType?: CardType;
  elevation?: ShadowElevation;
  width?: string | number;
  height?: string | number;
}

export function ColorSwatch({
  rgba,
  children,
  cardType = 'elevated',
  elevation,
  width,
  height,
}: ColorSwatchProps) {
  const theme = useTheme();

  // NOTE (react is an experimental sandbox, not at parity with angular):
  // `containers` was removed from the normalized UniTheme. Local fallback.
  const borderRadii = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 } as const;

  const cardStyle: CSSProperties = {
    height,
    width,
    display: 'inline-block',
    backgroundColor: theme.colors['background'],
    color: theme.colors['on-background'],
    borderRadius: borderRadii?.sm,
    ...Padding('xs', 'all'),
    margin: 8,
  };

  if (cardType === 'elevated') {
    cardStyle.boxShadow = BoxShadow(elevation || 'pressed');
  }

  const hsla = RGBToHSL(rgba);

  const HSLColor = HSLAToString({
    hue: Math.round(hsla.hue || 0),
    saturation: Math.round(hsla.hue || 0),
    lightness: Math.round(hsla.lightness || 0),
  });
  const swatchColor = `rgb(${rgba.red}, ${rgba.green}, ${rgba.blue})`;

  const swatchStyle: CSSProperties = {
    backgroundColor: swatchColor,
    height: 200,
    width: 200,
    display: 'inline-block',
    borderRadius: borderRadii?.xs,
  };

  return (
    <div style={cardStyle}>
      <div style={swatchStyle} />
      <Text role="headline-medium">{children}</Text>
      <Text role="title-small">{swatchColor}</Text>
      <Text role="title-small">{HSLColor}</Text>
    </div>
  );
}
