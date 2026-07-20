import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { BoxShadow, Text, useLayout, useTheme } from '../../core';
import {
  UniTheme,
  Button as ButtonModel,
  ButtonType,
  ColorToken,
  Size,
  ContentColorToken,
} from '@uni-design-system/uni-core';
import { IconTextRow } from '../icon-text-row';
import { IconName } from '../../core/icon';
import { useRipple } from 'use-ripple-hook';

// NOTE: react is an experimental sandbox, not at parity with angular. The typed
// `buttons` map was removed from the normalized UniTheme (button styling now
// lives in `components.button.variants`). These local defaults keep react building.
const verticalPadding = { xxs: 2, xs: 5, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const horizontalPadding = { xxs: 4, xs: 8, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36 };
const baseButton: ButtonModel = {
  borderRadius: 100,
  color: 'primary-container',
  contentColor: 'on-primary-container',
  verticalPadding,
  horizontalPadding,
};
const DEFAULT_BUTTONS: Record<ButtonType, ButtonModel> = {
  elevated: { ...baseButton, color: 'surface', contentColor: 'on-surface', shadowElevation: 'raised' },
  filled: { ...baseButton, color: 'primary' },
  'filled-secondary': { ...baseButton, color: 'secondary', contentColor: 'on-secondary' },
  outlined: {
    ...baseButton,
    color: 'transparent',
    borderColor: 'primary',
    contentColor: 'on-primary',
    borderWidth: 1,
  },
  text: { ...baseButton, color: 'transparent', contentColor: 'on-surface' },
  icon: { ...baseButton, color: 'transparent', contentColor: 'on-surface', horizontalPadding: verticalPadding },
  'floating-action': { ...baseButton, color: 'secondary', contentColor: 'on-secondary' },
};

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
  const buttonProps = DEFAULT_BUTTONS[buttonType];

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
  } = DEFAULT_BUTTONS[buttonType];

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
