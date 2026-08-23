import type { ColorScheme } from './color.types';

export const cycle = (angle: number): number => {
  if (angle > 360) return angle - 360;
  if (angle < 0) return angle + 360;
  return angle;
};

export const getAnalogousHues = (hue: number): number[] => [cycle(hue + 30), cycle(hue + 60)];
export const getComplimentaryHue = (hue: number): number => cycle(hue + 180);
export const getTriadicHues = (hue: number): number[] => [cycle(hue + 120), cycle(hue - 120)];
export const getSplitComplimentaryHues = (hue: number): number[] => [
  cycle(hue + 150),
  cycle(hue - 150),
];

export interface RoleHueSet {
  primary: number;
  secondary: number;
  tertiary: number;
}

/**
 * Derive the primary/secondary/tertiary hues from a seed hue using the color
 * wheel relationships in {@link ColorScheme}. Pure angle math — works in any
 * hue space (HSL historically, OKLCH in the generation engine).
 */
export const schemeHues = (hue: number, scheme: ColorScheme): RoleHueSet => {
  switch (scheme) {
    case 'monochromatic':
      return { primary: hue, secondary: hue, tertiary: hue };
    case 'analogous': {
      const [a, b] = getAnalogousHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
    case 'complimentary': {
      const [a] = getAnalogousHues(hue);
      return { primary: hue, secondary: getComplimentaryHue(hue), tertiary: a };
    }
    case 'splitComplimentary': {
      const [a, b] = getSplitComplimentaryHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
    case 'triadic': {
      const [a, b] = getTriadicHues(hue);
      return { primary: hue, secondary: a, tertiary: b };
    }
  }
};
