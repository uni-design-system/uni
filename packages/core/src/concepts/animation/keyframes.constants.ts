import type { StyleExpression } from '../style/style.types';

export type PercentageString = `${number}%`;
export type KeyframesExpression = Record<PercentageString, StyleExpression>;

export const fadeIn: KeyframesExpression = {
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
};

export const fadeOut: KeyframesExpression = {
  '0%': {
    opacity: 1,
  },
  '100%': {
    opacity: 0,
  },
};

export const expandFadeIn = {
  '0%': {
    gridTemplateRows: '0fr',
    opacity: 0,
  },
  '100%': {
    gridTemplateRows: '1fr',
    opacity: 1,
  },
};

export const collapseFadeOut = {
  '0%': {
    gridTemplateRows: '1fr',
    opacity: 1,
  },
  '100%': {
    gridTemplateRows: '0fr',
    opacity: 0,
  },
};
