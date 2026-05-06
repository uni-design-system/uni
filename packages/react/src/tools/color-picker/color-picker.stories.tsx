import React from 'react';
import { ColorPicker, ColorPickerProps } from './color-picker.component';

export default {
  title: 'Tools/Color Picker',
  component: ColorPicker,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ColorPickerPlayground = (args: ColorPickerProps) => <ColorPicker {...args} />;

const ColorPickerPlaygroundProps: Partial<ColorPickerProps> = {
  imageUrl: 'promenade.webp',
  imageHeight: 683,
  imageWidth: 1024,
  sampleSize: 40,
};

ColorPickerPlayground.args = ColorPickerPlaygroundProps;
