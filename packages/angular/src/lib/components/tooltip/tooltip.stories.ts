import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniTextComponent } from '../text';
import { UniTooltipComponent as Tooltip } from './tooltip.component';

type StoryType = Tooltip;

const meta: Meta<StoryType> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    moduleMetadata({
      imports: [UniTextComponent],
    }),
  ],
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <span uni-text>Here is some text with a <uni-tooltip ${argsToTemplate(props)}>tooltip</uni-tooltip> in the middle.
        </span>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    label: 'Bottom-start tooltip',
    placement: 'bottom-start',
    inlineText: true,
  },
};
