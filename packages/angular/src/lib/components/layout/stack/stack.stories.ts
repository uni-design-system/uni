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
          <Card><CardContent><Text>Card 1</Text></CardContent></Card>
          <Card><CardContent><Text>Card 2</Text></CardContent></Card>
          <Card><CardContent><Text>Card 3</Text></CardContent></Card>
          <Card><CardContent><Text>Card 4</Text></CardContent></Card>
          <Card><CardContent><Text>Card 5</Text></CardContent></Card>
        </div>`,
    };
  },
  args: { gap: 'lg' },
};
