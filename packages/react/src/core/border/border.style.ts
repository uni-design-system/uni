import { Border, ColorToken, getValue, UniTheme } from '@uni-design-system/uni-core';
import { CSSProperties } from 'react';

export function BorderStyle(border: Border | undefined, theme: UniTheme): CSSProperties {
  if (!border) return {};

  const borderTopColor = extractColor(theme, border, 'colorTop');
  const borderBottomColor = extractColor(theme, border, 'colorBottom');
  const borderLeftColor = extractColor(theme, border, 'colorLeft');
  const borderRightColor = extractColor(theme, border, 'colorRight');
  const borderTopWidth = getValue(border, 'widthTop', 'width');
  const borderBottomWidth = getValue(border, 'widthBottom', 'width');
  const borderLeftWidth = getValue(border, 'widthLeft', 'width');
  const borderRightWidth = getValue(border, 'widthRight', 'width');

  return {
    borderTopColor,
    borderBottomColor,
    borderLeftColor,
    borderRightColor,
    borderTopWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderRightWidth,
  };
}

function extractColor(theme: UniTheme, border: Border, key: string): string | undefined {
  const colorToken = getValue(border, key, 'color') as ColorToken;
  return colorToken ? theme.colors[colorToken] : undefined;
}
