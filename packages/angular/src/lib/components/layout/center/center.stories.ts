import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniCenterComponent as Center } from './center.component';
import { UniTextComponent } from '../../text';

type StoryType = Center & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Layout/Center',
  component: Center,
  decorators: [moduleMetadata({ imports: [UniTextComponent] })],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <div center-layout  ${argsToTemplate(props)}>
          <Text role="headline-large">${ngContent}</Text>
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
