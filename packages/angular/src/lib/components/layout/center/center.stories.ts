import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniCenterDirective as Center } from './center.directive';
import { UniTextDirective } from '../../text';

type StoryType = Center & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Layout/Center',
  component: Center,
  decorators: [moduleMetadata({ imports: [UniTextDirective] })],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <div center-layout  ${argsToTemplate(props)}>
          <span uni-text="headline-large">${ngContent}</span>
        </div>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    ngContent: 'Centered Content',
    height: 180,
    width: '100%',
  },
};
