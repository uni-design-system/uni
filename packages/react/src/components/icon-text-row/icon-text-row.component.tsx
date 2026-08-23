import React, { ReactNode } from 'react';
import {
  type CssLength,
  ContentColorToken,
  getValue,
  HorizontalAlign,
  TextRole,
} from '@uni-design-system/uni-core';

import { alignCenter, expand, fix, row, Text, Icon, useTheme } from '../../core';
import { IconName } from '../../core/icon';

/**
 * The type scale stores CSS lengths (`number | string`), but this row does
 * arithmetic on them and sizes the icon in px. Numbers pass through; a string
 * is read as its leading numeric part, which is what the arithmetic has always
 * assumed — a non-px unit (`1rem`) therefore reads as `1`, so keep the scale
 * numeric if you use this component.
 */
const toPx = (value: CssLength | undefined, fallback: number): number => {
  if (typeof value === 'number') return value;
  const parsed = typeof value === 'string' ? parseFloat(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

export interface IconTextRowProps {
  iconName: IconName;
  color: ContentColorToken;
  align?: HorizontalAlign;
  text?: string;
  textRole?: TextRole;
  children?: ReactNode;
}

export const IconTextRow = ({
  iconName,
  color,
  align = 'left',
  text,
  textRole = 'title-medium',
  children,
}: IconTextRowProps): JSX.Element => {
  const theme = useTheme();
  const textProps = getValue(theme, `typography.${textRole}`, theme.typography['title-medium']);
  const textHeight = toPx(textProps.fontSize, 16);
  const textLineHeight = toPx(textProps.lineHeight, textHeight);
  const textMargin = text || children ? textLineHeight - textHeight : 0;

  function RowIcon() {
    return (
      <div style={{ ...fix, maxHeight: textLineHeight }}>
        <Icon name={iconName} width={textLineHeight} height={textLineHeight} color={color} />
      </div>
    );
  }

  function RowText() {
    return (
      <div style={{ ...expand, paddingLeft: textMargin, paddingRight: textMargin }}>
        <Text align={align} colorToken={color} role={textRole}>
          {text || children}
        </Text>
      </div>
    );
  }

  function RowCenter() {
    return align === 'center' ? <div style={{ ...expand }} /> : null;
  }

  return ['left', 'center'].includes(align) ? (
    <div style={{ ...row, ...alignCenter }}>
      <RowCenter />
      <RowIcon />
      <RowText />
      <RowCenter />
    </div>
  ) : (
    <div style={{ ...row, ...alignCenter }}>
      <RowText />
      <RowIcon />
    </div>
  );
};
