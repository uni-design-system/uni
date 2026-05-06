import { CSSProperties } from 'react';
import { ImageProps } from './image.model';
import { FilterStyle } from '../filter/filter.style';

export const ImageStyle = (props: Partial<ImageProps>): CSSProperties => {
  const { fit, opacity, height, width, ...rest } = props;

  const filter = FilterStyle({ ...rest });

  const objectFit = height || width ? {} : { objectFit: fit };

  return {
    ...objectFit,
    width: (width && `${width}px`) || '100vw',
    height: (height && `${height}px`) || '100vh',
    opacity,
    ...filter,
  };
};
