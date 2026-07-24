import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniStackComponent as Stack } from './stack.component';
import { UniTextComponent } from '../../text';
import { UniCardComponent, UniCardContentComponent } from '../../card';

type StoryType = Stack;

const meta: Meta<StoryType> = {
  title: 'Layout/Stack',
  component: Stack,
  decorators: [
    moduleMetadata({
      imports: [UniCardComponent, UniCardContentComponent, UniTextComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

export const StackedCards: Story = {
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <div stack-layout ${argsToTemplate(props)}>
          <uni-card><uni-card-content><span uni-text>Card 1</span></uni-card-content></uni-card>
          <uni-card><uni-card-content><span uni-text>Card 2</span></uni-card-content></uni-card>
          <uni-card><uni-card-content><span uni-text>Card 3</span></uni-card-content></uni-card>
          <uni-card><uni-card-content><span uni-text>Card 4</span></uni-card-content></uni-card>
          <uni-card><uni-card-content><span uni-text>Card 5</span></uni-card-content></uni-card>
        </div>`,
    };
  },
  args: { gap: 'lg' },
};
