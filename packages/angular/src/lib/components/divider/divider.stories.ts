import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniCenterComponent } from '../layout';
import { UniDividerComponent as Divider } from './divider.component';

type StoryType = Divider;

const meta: Meta<StoryType> = {
  title: 'Components/Divider',
  component: Divider,
  decorators: [
    moduleMetadata({
      imports: [UniCenterComponent],
    }),
  ],
  render: (args) => {
    const { border, orientation, ...props } = args;
    return {
      props,
      template: `
        <div center-layout height="200px">
          <uni-divider border="${border}" orientation="${orientation}" />
        </div>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    orientation: 'horizontal',
    border: 'primary',
  },
};
