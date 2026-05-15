import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { BoxShadow, Text, useLayout, useTheme } from '../../core';
import {
  UniTheme,
  ButtonType,
  ColorToken,
  Size,
  ContentColorToken,
} from '@uni-design-system/uni-core';
import { IconTextRow } from '../icon-text-row';
import { IconName } from '../../core/icon';
import { useRipple } from 'use-ripple-hook';

export interface ButtonProps {
  text?: string;
  children?: ReactNode;
  buttonType?: ButtonType;
  active?: boolean;
  disabled?: boolean;
  iconName?: IconName;
  contentColor?: ContentColorToken;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disableRipple?: boolean;
  style?: CSSProperties;
}

export const Button = ({
  text,
  children,
  buttonType = 'filled',
  disabled = false,
  iconName,
  contentColor: overrideContentColor,
  onClick,
  disableRipple = false,
  style: userStyle,
  ...rest
}: ButtonProps): JSX.Element => {
  const { deviceSize } = useLayout();
  const theme = useTheme();
  const [ref, createRipple] = useRipple({ disabled: disableRipple || buttonType === 'elevated' });
  const buttonProps = theme.buttons[buttonType];

  const getOnColorToken = (color: ColorToken) => `on-${color}` as ContentColorToken;
  const contentColor = overrideContentColor || getOnColorToken(buttonProps.color);

  const [hover, setHover] = useState<boolean>(false);
  const [click, setClick] = useState<boolean>(false);

  const style = Style(theme, buttonType, deviceSize, hover, disabled, click);

  useEffect(() => {
    setTimeout(() => {
      setClick(false);
    }, 250);
  }, [click]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setClick(true);
    onClick && onClick(event);
  };

  return (
    <button
      onMouseDown={createRipple}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      disabled={disabled}
      style={{ ...style, ...userStyle }}
      ref={ref}
      {...rest}
    >
      {iconName ? (
        <IconTextRow iconName={iconName} color={contentColor} textRole="button">
          {text || children}
        </IconTextRow>
      ) : (
        <Text align="center" role="button" colorToken={contentColor}>
          {text || children}
        </Text>
      )}
    </button>
  );
};

function Style(
  theme: UniTheme,
  buttonType: ButtonType,
  size: Size = 'md',
  hover: boolean,
  disabled: boolean,
  click: boolean
): CSSProperties {
  const {
    color,
    horizontalPadding,
    verticalPadding,
    borderColor,
    borderWidth,
    borderRadius,
    contentColor,
  } = theme.buttons[buttonType];

  const styles: CSSProperties = {
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    cursor: 'pointer',
    paddingTop: verticalPadding[size] + 'px',
    paddingBottom: verticalPadding[size] + 'px',
    paddingLeft: horizontalPadding[size] + 'px',
    paddingRight: horizontalPadding[size] + 'px',
    borderRadius: borderRadius + 'px',
    backgroundColor: theme.colors[color],
    borderColor: theme.colors[borderColor as ColorToken],
    borderWidth: borderWidth + 'px',
    borderStyle: buttonType === 'outlined' ? 'solid' : 'none',
  };

  if (buttonType === 'elevated' && !disabled) {
    styles.boxShadow = BoxShadow(hover ? 'focussed' : 'raised');
  }

  if (disabled && buttonType === 'elevated') {
    styles.boxShadow = BoxShadow('pressed');
    styles.color = theme.colors[contentColor];
  }

  if (disabled) {
    styles.cursor = 'not-allowed';
  }

  if (click && buttonType === 'elevated' && !disabled) {
    styles.boxShadow = BoxShadow('pressed');
  }

  return styles;
}
