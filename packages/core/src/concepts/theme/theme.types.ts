import type { ContentColorToken } from '../color';

export type themes = 'uni' | 'carbon' | 'material' | 'bootstrap';

export type Variant =
  | 'ghost'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'warn'
  | 'success'
  | 'disabled'
  | 'light'
  | 'onLight'
  | 'dark'
  | 'onDark';

export type TextColor = ContentColorToken | Variant;

/**
 * A tag's style archetype, orthogonal to its {@link Variant} colour role: the
 * variant says *which* colour, the tone says *how* it is applied. Themes express
 * tones as nested `&.tone-*` selectors inside each variant, so both axes stay in
 * one place.
 */
export type TagTone = 'soft' | 'solid' | 'outline';
