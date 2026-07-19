import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniButtonGroupComponent as ButtonGroup } from './button-group.component';

type StoryType = ButtonGroup & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Button Group',
  component: ButtonGroup,
  decorators: [
    moduleMetadata({
      imports: [UniIconButtonComponent],
    }),
  ],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <ButtonGroup ${argsToTemplate(props)}>
          <button icon-button symbolName="align_horizontal_left" size="sm"></button>
          <button icon-button symbolName="align_horizontal_center" size="sm"></button>
          <button icon-button symbolName="align_horizontal_right" size="sm"></button>
        </ButtonGroup>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
