import React from 'react';
import { Switch, SwitchProps } from './switch.component';

export default {
  title: 'Components / Switch',
  component: Switch,
  argTypes: {
    size: {},
  },
};

export const SwitchPlayground = ({ ...props }: SwitchProps) => <Switch {...props} />;
