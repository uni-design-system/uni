import { ImageFit } from './image.types';
import { FilterProps } from '../filter';

export interface ImageProps extends FilterProps {
  url?: string | undefined;
  alt?: string;
  fit?: ImageFit;
  height?: number;
  width?: number;
}
