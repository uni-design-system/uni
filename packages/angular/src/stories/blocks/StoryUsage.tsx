import { Controls, Source, Story, StoryProps } from '@storybook/addon-docs/blocks';
import { ReactElement } from 'react';
import { sourceTransform } from '../addons/source-transform';
import { CommonControlExcludes } from './helpers';

export function StoryUsage({
  of,
  exclude,
}: StoryProps & { exclude?: string | string[] }): ReactElement {
  const excludedControls = [
    ...CommonControlExcludes,
    'children',
    ...(Array.isArray(exclude) ? exclude : exclude ? [exclude] : []),
  ];

  return (
    <div>
      <Story of={of} />
      <Source of={of} dark={true} transform={sourceTransform} />
      <Controls of={of} exclude={excludedControls} />
    </div>
  );
}
