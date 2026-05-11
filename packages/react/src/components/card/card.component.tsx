import React, { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { ColorToken, ContainerColorToken, ShadowElevation, Size } from '@uni-design-system/uni-core';
import { BoxShadow, Padding, useTheme } from '../../core';
import { Property } from 'csstype';
import Container from '../../core/container/container.component';

export type CardType = 'elevated' | 'filled' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  cardType?: CardType;
  colorToken?: ContainerColorToken;
  elevation?: ShadowElevation;
  width?: Property.Width<number | string>;
  height?: Property.Height<number | string>;
  borderRadius?: Size | 'none';
}

export function Card({
  children,
  cardType,
  elevation,
  colorToken = 'surface',
  width,
  height,
  borderRadius,
  style,
  ...rest
}: CardProps) {
  const { colors, containers } = useTheme();

  const { borderRadii } = containers.card;

  const styles: CSSProperties = {
    height,
    width,
    backgroundColor: colors[colorToken || 'surface'],
    color: colors[(`on-${colorToken}` as ColorToken) || 'on-surface'],
    ...Padding('md', 'all'),
    ...style,
  };

  if (cardType === 'elevated') {
    styles.boxShadow = BoxShadow(elevation || 'raised');
  }

  if (borderRadii && borderRadius !== 'none') {
    styles.borderRadius = borderRadii[borderRadius || 'md'];
  }

  return (
    <Container colorToken={colorToken} style={styles} {...rest}>
      {children}
    </Container>
  );
}
