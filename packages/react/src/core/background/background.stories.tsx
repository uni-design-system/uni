import React from 'react';
import { Background, BackgroundProps } from './background.component';

export default {
  title: 'Components/Background',
  component: Background,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ImageBackground = (args: BackgroundProps) => {
  return <Background {...args} />;
};

const ImageBackgroundArgs: BackgroundProps = {
  imageUrl: 'promenade.webp',
  size: 'cover',
  minHeight: '100vh',
};

ImageBackground.args = ImageBackgroundArgs;
