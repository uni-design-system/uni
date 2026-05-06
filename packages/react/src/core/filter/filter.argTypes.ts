// https://www.w3schools.com/csSref/css3_pr_filter.php

export const filterArgTypes = {
  blur: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Applies a blur effect to the image. A larger value will create more blur.\n' +
      '\n' +
      'If no value is specified, 0 is used.',
  },
  brightness: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Adjusts the brightness of the image.\n' +
      '\n' +
      '0% will make the image completely black.\n' +
      '100% (1) is default and represents the original image.\n' +
      'Values over 100% will provide brighter results.',
  },
  contrast: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Adjusts the contrast of the image.\n' +
      '\n' +
      '0% will make the image completely black.\n' +
      '100% (1) is default, and represents the original image.\n' +
      'Values over 100% will provide results with more contrast.',
  },
  grayscale: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Converts the image to grayscale.\n' +
      '\n' +
      '0% (0) is default and represents the original image.\n' +
      '100% will make the image completely gray (used for black and white images).',
  },
  'hue-rotate': {
    control: { type: 'range', min: 0, max: 360, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Applies a hue rotation on the image. The value defines the number of degrees around the color circle the image samples will be adjusted. 0deg is default, and represents the original image.',
  },
  invert: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Inverts the samples in the image.\n' +
      '\n' +
      '0% (0) is default and represents the original image.\n' +
      '100% will make the image completely inverted.',
  },
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.01 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '1' },
    },
    description:
      'Sets the opacity level for the image. The opacity-level describes the transparency-level, where:\n' +
      '\n' +
      '0% is completely transparent.\n' +
      '100% (1) is default and represents the original image (no transparency).',
  },
  saturate: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Saturates the image.\n' +
      '\n' +
      '0% (0) will make the image completely un-saturated.\n' +
      '100% is default and represents the original image.\n' +
      'Values over 100% provides super-saturated results.',
  },
  sepia: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description:
      'Converts the image to sepia.\n' +
      '\n' +
      '0% (0) is default and represents the original image.\n' +
      '100% will make the image completely sepia.',
  },
};
