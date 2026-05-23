import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../../button';
import { UniDialogHeaderComponent } from '../../dialog';
import { UniCenterComponent } from '../../layout';
import { UniTextComponent } from '../../text';
import { UniSnackbarComponent as Snackbar } from './snackbar.component';

type StoryType = Snackbar & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Notifications/Snackbar',
  component: Snackbar,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniTextComponent, UniCenterComponent, UniDialogHeaderComponent],
    }),
  ],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <Button (click)="snackbar.open()">Show Snackbar</Button>
        <Snackbar #snackbar ${argsToTemplate(props)}>
          ${ngContent}
        </Snackbar>
      `,
    };
  },
  argTypes: {
    actionLabel: {
      description:
        'Setting an action label replaces the default close icon and allows for an action to be defined.',
    },
    timeout: {
      description:
        'This is the time in milliseconds that the snackbar will stay on the screen.  Setting this value to `disabled` will keep the snackbar displayed until the user manually closes it.',
      control: 'text',
    },
    symbolName: {
      description: 'The Material Symbol name. The `symbolName` overrides the `iconName`',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    ngContent: 'The record has been removed.',
    variant: 'warn',
    actionLabel: 'undo',
    timeout: '5000',
    symbolName: 'delete_sweep',
  },
};
