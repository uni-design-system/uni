export const transitionArgTypes = {
  fadeDuration: {
    control: { type: 'range', min: 0, max: 2, step: 0.01 },
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
    description: 'The amount of time (in seconds) for the fade transition to complete.',
  },
};
