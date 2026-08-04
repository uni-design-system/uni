import { Source, Story, StoryProps } from '@storybook/addon-docs/blocks';
import { ReactElement } from 'react';
import { sourceTransform } from '../addons/source-transform';
import { ThemedSurface } from './ThemedSurface';

export function StoryExample({ of }: StoryProps): ReactElement {
  return (
    <div>
      <ThemedSurface>
        <Story of={of} />
      </ThemedSurface>
      <Source of={of} dark={true} transform={sourceTransform} />
    </div>
  );
}
