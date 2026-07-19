import { Source, Story, StoryProps } from '@storybook/addon-docs/blocks';
import { ReactElement } from 'react';
import { sourceTransform } from '../addons/source-transform';

export function StoryExample({ of }: StoryProps): ReactElement {
  return (
    <div>
      <Story of={of} />
      <Source of={of} dark={true} transform={sourceTransform} />
    </div>
  );
}
