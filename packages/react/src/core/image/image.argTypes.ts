import { filterArgTypes } from '../filter/filter.argTypes';

export const imageArgTypes = {
  url: {
    control: { type: 'text' },
    table: { summary: 'string' },
  },
  fit: {
    options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
    control: { type: 'inline-radio' },
    table: {
      type: { summary: 'string literal' },
      defaultValue: { summary: 'cover' },
    },
  },
  height: {
    control: { type: 'number' },
  },
  width: {
    control: { type: 'number' },
  },
  ...filterArgTypes,
};
