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
