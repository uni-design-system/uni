import { FontWeight, TextDecoration, TextTransform } from './typography.types';
import { SizeMap } from '../core.types';

/**
 * A CSS length value: bare numbers are treated as px; strings pass through
 * verbatim, so any unit Emotion accepts ('1.2rem', '2em', 'clamp(...)') works.
 */
export type CssLength = number | string;

export interface TextStyle {
  fontFamily: string;
  fontSize: CssLength;
  lineHeight: CssLength;
  fontScale?: SizeMap;
  fontWeight?: FontWeight;
  fontStyle?: 'italic';
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  letterSpacing?: CssLength;
  textIndent?: CssLength;
  wordSpacing?: CssLength;
  whiteSpace?: 'nowrap';
}

export interface TypeFaceDefinition {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: 'uppercase';
  fontStyle?: 'italic';
  fontWeight?: string | number;
}
