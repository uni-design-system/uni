import React, { ReactNode } from 'react';
import { ContentColorToken, getValue, HorizontalAlign, TextRole } from '@uni-design-system/uni-core';

import { alignCenter, expand, fix, row, Text, Icon, useTheme } from '../../core';
import { IconName } from '../../core/icon';

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
  const textHeight = textProps.fontSize;
  const textLineHeight = textProps.lineHeight || textHeight;
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
