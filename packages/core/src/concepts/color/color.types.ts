// https://designerup.co/blog/ui-design-choosing-color-palettes/
// https://designerup.co/blog/practical-guide-to-perfect-ui-color-palettes/

// Palette Attributes
export type ColorScheme =
  | 'monochromatic'
  | 'analogous'
  | 'complimentary'
  | 'splitComplimentary'
  | 'triadic';
export type ColorCategory = 'jewel' | 'pastel' | 'earth' | 'neutral' | 'florescent' | 'shades';

// Color Attributes
export type ColorStyles = 'solid' | 'transparent' | 'gradient';

// Color Factory Output Types
export type ColorOutput = 'HEX' | 'RGB' | 'RGBA' | 'HSL' | 'HSLA';

// Variants used in element states, e.g. button
export type ColorModes = 'base' | 'hover' | 'active' | 'disabled';

//
export type ColorRole = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'ghost';

/*
 *
 * Color Tokens
 *
 * */

export type ColorToken =
  | ElementColorToken
  | UtilityColorToken
  | ContainerColorToken
  | ContentColorToken
  | string;

export type ElementColorToken = 'primary' | 'secondary' | 'tertiary' | 'error';

export type UtilityColorToken = 'outline' | 'shadow' | 'surface-tint' | 'transparent';

export type UtilityColorRole =
  | 'warn' // Red - used to indicate error, danger, wrong.
  | 'alert' // Yellow - used for temporary alert, caution, warnings.
  | 'success' // Green - used to indicate success saved or correct.
  | 'info'; // Blue  - used for information.

export type ContainerColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'warn'
  | 'success'
  | 'primary-container'
  | 'secondary-container'
  | 'tertiary-container'
  | 'error-container'
  | 'warn-container'
  | 'success-container'
  | 'disabled-container'
  | 'inverse-container'
  | 'primary-surface'
  | 'secondary-surface'
  | 'tertiary-surface'
  | 'quaternary-surface'
  | 'disabled-surface'
  | 'inverse-surface'
  | 'background'
  | 'surface'
  | 'surface-variant'
  | 'scrim'
  | 'transparent';

export type ContentColorToken =
  | 'on-primary'
  | 'on-secondary'
  | 'on-tertiary'
  | 'on-quaternary'
  | 'on-error'
  | 'on-warn'
  | 'on-success'
  | 'on-disabled'
  | 'on-primary-container'
  | 'on-secondary-container'
  | 'on-tertiary-container'
  | 'on-error-container'
  | 'on-warn-container'
  | 'on-success-container'
  | 'on-disabled-container'
  | 'on-inverse-container'
  | 'on-primary-container-variant'
  | 'on-secondary-container-variant'
  | 'on-tertiary-container-variant'
  | 'on-quaternary-container-variant'
  | 'on-disabled-container-variant'
  | 'on-inverse-container-variant'
  | 'on-warn-container-variant'
  | 'on-success-container-variant'
  | 'on-primary-container-border'
  | 'on-secondary-container-border'
  | 'on-tertiary-container-border'
  | 'on-quaternary-container-border'
  | 'on-warn-container-border'
  | 'on-success-container-border'
  | 'on-disabled-container-border'
  | 'on-inverse-container-border'
  | 'on-primary-surface'
  | 'on-secondary-surface'
  | 'on-tertiary-surface'
  | 'on-quaternary-surface'
  | 'on-disabled-surface'
  | 'on-inverse-surface'
  | 'on-primary-surface-variant'
  | 'on-secondary-surface-variant'
  | 'on-tertiary-surface-variant'
  | 'on-quaternary-surface-variant'
  | 'on-disabled-surface-variant'
  | 'on-inverse-surface-variant'
  | 'on-background'
  | 'on-background-variant'
  | 'on-surface'
  | 'on-surface-variant'
  | 'on-inverse-surface-primary';
