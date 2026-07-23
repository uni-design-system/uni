import type { Colors, Shadows } from '../theme/theme.model';
import { hexToRgb } from '../color/color.helper';
import { hexToOklch, oklchToHex } from './oklch.helper';

const rgba = (hex: string, alpha: number): string => {
  const { red, green, blue } = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

/**
 * Brand-tinted, theme-scoped elevation shadows (PRD §3.5.C).
 *
 * Light mode replaces the dead-neutral black stacks with a shadow ink pulled
 * toward the brand hue — dark and low-chroma enough to read as shadow, tinted
 * enough to kill the grey "mud" where shadows meet brand surfaces. Dark mode
 * goes near-zero: elevation is carried by the surface lightness steps, with
 * only a faint veil kept on floating overlays (menus/dialogs genuinely need
 * separation) and the `warn` glow tinted by the theme's own error color.
 */
export const generateShadows = (colors: Colors, mode: 'light' | 'dark' = 'light'): Shadows => {
  const error = colors['error'] ?? '#CC2827';

  if (mode === 'dark') {
    return {
      raised: 'none',
      menu: `0px 4px 12px ${rgba('#000000', 0.45)}`,
      dialog: `0px 8px 28px ${rgba('#000000', 0.55)}`,
      warn: `0 0 5px ${rgba(error, 0.55)}, inset 0 0 5px ${rgba(error, 0.35)}`,
    };
  }

  // Shadow ink: near-black carrying ~6–8% of the brand hue's chroma.
  const { h } = hexToOklch(colors['primary'] ?? '#000000');
  const ink = oklchToHex({ l: 0.22, c: 0.035, h });
  return {
    raised: `${rgba(ink, 0.2)} 0px 2px 1px -1px, ${rgba(ink, 0.14)} 0px 1px 1px 0px, ${rgba(ink, 0.12)} 0px 1px 3px 0px`,
    menu: `${rgba(ink, 0.2)} 0px 3px 3px -2px, ${rgba(ink, 0.14)} 0px 3px 4px 0px, ${rgba(ink, 0.12)} 0px 1px 8px 0px`,
    dialog: `${rgba(ink, 0.2)} 0px 3px 5px -1px, ${rgba(ink, 0.14)} 0px 6px 10px 0px, ${rgba(ink, 0.12)} 0px 1px 18px 0px`,
    warn: `0 0 5px ${rgba(error, 0.5)}, inset 0 0 5px ${rgba(error, 0.3)}`,
  };
};
