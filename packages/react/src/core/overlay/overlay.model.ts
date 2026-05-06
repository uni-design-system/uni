import { ReactNode } from 'react';

export interface OverlayProps {
  children?: ReactNode;
  blurPx?: number;
  hueRotateDeg?: number;
  hueDeg?: number;
  saturation?: number;
  lightness?: number;
  transparency?: number;
  isOpen?: boolean;
  fadeDuration?: number;
}
