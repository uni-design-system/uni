import React from 'react';
import { ImageProps } from './image.model';
import { ImageStyle } from './image.style';

export const Image = ({ url, alt, height, width, opacity, fit = 'cover', ...rest }: ImageProps): JSX.Element | null => {
  return url ? <img src={url} alt={alt} style={ImageStyle({ fit, opacity, height, width, ...rest })} /> : null;
};
