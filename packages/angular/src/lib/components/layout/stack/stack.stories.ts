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
          <Card><CardContent><span uni-text>Card 1</span></CardContent></Card>
          <Card><CardContent><span uni-text>Card 2</span></CardContent></Card>
          <Card><CardContent><span uni-text>Card 3</span></CardContent></Card>
          <Card><CardContent><span uni-text>Card 4</span></CardContent></Card>
          <Card><CardContent><span uni-text>Card 5</span></CardContent></Card>
        </div>`,
    };
  },
  args: { gap: 'lg' },
};
