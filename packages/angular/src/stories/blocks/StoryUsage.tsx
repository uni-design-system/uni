import { Controls, Source, Story, StoryProps } from '@storybook/addon-docs/blocks';
import { ReactElement } from 'react';

export function StoryUsage({
  of,
  exclude,
}: StoryProps & { exclude?: string | string[] }): ReactElement {
  const commonControlExcludes = ['children', 'className', 'style'];
  const excludedControls = [
    ...commonControlExcludes,
    ...(Array.isArray(exclude) ? exclude : exclude ? [exclude] : []),
  ];

  return (
    <div>
      <Story of={of} />
      <Source of={of} dark={true} />
      <Controls of={of} exclude={excludedControls} />
    </div>
  );
}
