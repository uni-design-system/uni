import React from 'react';
import { GrainyGradientBackground, GrainyGradientProps } from './grainy-gradient-background.component';

export default {
  title: 'Components/Background',
  component: GrainyGradientBackground,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    noiseFrequency: {
      control: { type: 'range', min: 0, max: 5, step: 0.01 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0.65' },
      },
    },
    noiseOctaves: {
      control: { type: 'range', min: 0, max: 6, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '3' },
      },
    },
    size: {
      control: { type: 'range', min: 0, max: 2400, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '250' },
      },
    },
    angle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '20' },
      },
      description: 'The angle of the gradient.',
    },
    gradientColor: {
      control: { type: 'color' },
    },
    backgroundColor: {
      control: { type: 'color' },
    },
  },
};

export const GrainyGradient = (args: GrainyGradientProps) => {
  return <GrainyGradientBackground {...args} />;
};

const GrainyGradientBackgroundArgs: GrainyGradientProps = {
  minHeight: '100vh',
};

GrainyGradient.args = GrainyGradientBackgroundArgs;
