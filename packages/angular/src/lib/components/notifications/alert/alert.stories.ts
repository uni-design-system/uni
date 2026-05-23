import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../../button';
import { UniDialogHeaderComponent } from '../../dialog';
import { UniCenterComponent } from '../../layout';
import { UniTextComponent } from '../../text';
import { UniAlertComponent as Alert } from './alert.component';

type StoryType = Alert & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Notifications/Alert',
  component: Alert,
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
        <Button (click)="alert.open()">Show Alert</Button>
        <Alert #alert ${argsToTemplate(props)}>
          ${ngContent}
        </Alert>
      `,
    };
  },
  argTypes: {
    symbolName: {
      description:
        'Name of the symbol to be used in the left side of the Alert. Setting the icon name will override this value.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
      description: 'The alert container color as defined in the theme.',
    },
    open: { description: 'Method used to open the alert dialog.' },
    close: { description: 'Method used to close the alert dialog.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    ngContent: 'This is an alert!',
    variant: 'tertiary',
    symbolName: 'privacy_tip',
  },
};
