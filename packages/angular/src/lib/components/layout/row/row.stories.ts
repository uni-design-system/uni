import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { UniRowComponent as Row } from './row.component';
import { UniButtonComponent } from '../../button';

type StoryType = Row;

const meta: Meta<StoryType> = {
  title: 'Layout/Row',
  component: Row,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

export const ButtonRow: Story = {
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <div row-layout ${argsToTemplate(props)}>
          <button text-button>Button 1</button>
          <button text-button>Button 2</button>
          <button text-button>Button 3</button>
        </div>`,
    };
  },
  args: { gap: 'lg' },
};
