import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniStackComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';
import { UniPopoverComponent as Popover } from './popover.component';

type StoryType = Popover;

const meta: Meta<StoryType> = {
  title: 'Components/Popover',
  component: Popover,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniStackComponent, UniTextComponent],
    }),
  ],
  render: (args) => {
    const { placement, autoClose, ...props } = args;
    return {
      props,
      template: `
        <Popover placement="${placement}" [autoClose]="${autoClose}" #popover>
          <Button trigger>Open Popover</Button>
          <Stack gap="sm">
            <div>
              <Text typeface="title-small" display="block">
              This is a Popover.
              </Text>
              It is possible to add any markup you want to a Popover.
            </div>
            <div>
              <Button symbolLeft="thumb_up" size="sm" variant="secondary" (click)="popover.hidePopover()">OK!</Button>
            </div>
          </Stack>
        </Popover>
      `,
    };
  },
  argTypes: {
    placement: {
      description:
        'Controls the orientation of the popover in relation to the trigger.  ' +
        'If the placement of the popover falls outside the viewport, ' +
        'the placement will be automatically assigned so that it remains in view.',
    },
    autoClose: {
      description:
        'Controls whether or not clicking anywhere outside the popover will close the popover.',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    placement: 'right-start',
    autoClose: true,
  },
};
