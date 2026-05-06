import React from 'react';
import { Overlay } from './overlay.component';
import { OverlayProps } from './overlay.model';
import { transitionArgTypes } from '../transition/transition.argTypes';

export default {
  title: 'Core/Overlay',
  component: Overlay,
  argTypes: {
    hueDeg: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
      description: 'The hue in degrees.',
    },

    saturation: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
      description: 'A number from 1-100 to define the color saturation percentage.',
    },

    lightness: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
      description: 'A number from 1-100 to define the color lightness percentage.',
    },

    transparency: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0.5' },
      },
      description: 'A decimal of 1 to define the color lightness percentage.',
    },

    blurPx: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
      description: 'The amount of blur defined in pixels.',
    },

    hueRotateDeg: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
      description: 'The hue in degrees.',
    },
    ...transitionArgTypes,
  },
};

export const OverlayPlayground = (args: OverlayProps) => <Overlay {...args} />;

const OverlayPlaygroundProps: Partial<OverlayProps> = {
  isOpen: true,
};

OverlayPlayground.args = OverlayPlaygroundProps;
