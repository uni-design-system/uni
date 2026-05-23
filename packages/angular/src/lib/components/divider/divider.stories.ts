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
        <Center height="200px">
          <Divider border="${border}" orientation="${orientation}" />
        </Center>
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
