import React from 'react';
import { Button, ButtonProps } from './button.component';

export default {
  title: 'Components/Buttons',
  component: Button,
};

export const Filled = (args: ButtonProps) => <Button {...args} />;

Filled.args = {
  disabled: false,
  buttonType: 'filled',
  text: 'Filled Button',
};

Filled.story = {
  name: 'Filled Button',
};

export const FilledSecondary = (args: ButtonProps) => <Button {...args} />;

FilledSecondary.args = {
  disabled: false,
  buttonType: 'filled-secondary',
  text: 'Secondary Button',
};

FilledSecondary.story = {
  name: 'Secondary Filled Button',
};

export const Elevated = (args: ButtonProps) => <Button {...args} />;

Elevated.args = {
  disabled: false,
  buttonType: 'elevated',
  text: 'Elevated Button',
};

Elevated.story = {
  name: 'Elevated Button',
};

export const DisabledElevated = (args: ButtonProps) => <Button {...args} />;

DisabledElevated.args = {
  disabled: true,
  buttonType: 'elevated',
  text: 'Elevated Button',
};

DisabledElevated.story = {
  name: 'Disabled Elevated Button',
};

export const Outlined = (args: ButtonProps) => <Button {...args} />;

Outlined.args = {
  disabled: false,
  buttonType: 'outlined',
  text: 'Outlined Button',
};

Outlined.story = {
  name: 'Outlined Button',
};

export const DisabledOutlined = (args: ButtonProps) => <Button {...args} />;

DisabledOutlined.args = {
  disabled: true,
  buttonType: 'outlined',
  text: 'Outlined Button',
};

DisabledOutlined.story = {
  name: 'Disabled Outlined Button',
};
