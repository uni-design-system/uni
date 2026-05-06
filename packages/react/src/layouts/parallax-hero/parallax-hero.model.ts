import { ReactNode } from 'react';

export interface ImageLayer {
  name: string;
  src: string;
  depth: number;
}

export interface ParallaxHeroProps {
  layers: ImageLayer[];
  children: ReactNode;
}
