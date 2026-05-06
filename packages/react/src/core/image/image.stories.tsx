import React from 'react';
import { Image } from './image.component';
import { ImageProps } from './image.model';
import { imageArgTypes } from './image.argTypes';

export default {
  title: 'Core/Image',
  component: Image,
  argTypes: { ...imageArgTypes },
  parameters: {
    layout: 'fullscreen',
  },
};

export const ImagePlayground = (args: ImageProps) => <Image {...args} />;

const ImagePlaygroundProps: Partial<ImageProps> = {
  fit: 'contain',
  url: 'https://www.rollingstone.com/wp-content/uploads/2018/06/rs-108784-e569415749457a65514cfe8b509d7ead8b7b4013.jpg?w=500',
};

ImagePlayground.args = ImagePlaygroundProps;
