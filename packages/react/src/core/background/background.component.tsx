import React, { CSSProperties, ReactNode } from 'react';
import { Property } from 'csstype';

export interface BackgroundProps {
  className?: string;
  children?: ReactNode;
  image?: Property.BackgroundImage;
  imageUrl?: string;
  gradiant?: Property.BackgroundImage;
  position?: Property.BackgroundPosition; // https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
  size?: Property.BackgroundSize; // https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
  attachment?: 'fixed' | 'local' | 'scroll';
  minHeight?: Property.MinHeight;
  color?: string;
}

export const Background = ({
  children,
  image,
  imageUrl,
  gradiant,
  position,
  size,
  attachment,
  className,
  minHeight,
  color,
}: BackgroundProps): JSX.Element => {
  if (!!imageUrl) {
    image = `url(${imageUrl})`;
  }

  const style: CSSProperties = {
    backgroundColor: color,
    backgroundImage: image || gradiant,
    backgroundPosition: position,
    backgroundSize: size,
    minHeight,
    backgroundAttachment: attachment,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
