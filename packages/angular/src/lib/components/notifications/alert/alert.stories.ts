import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../../button';
import { UniDialogHeaderComponent } from '../../dialog';
import { UniCenterDirective } from '../../layout';
import { UniTextDirective } from '../../text';
import { UniAlertComponent as Alert } from './alert.component';

type StoryType = Alert & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Feedback/Alert',
  component: Alert,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniTextDirective, UniCenterDirective, UniDialogHeaderComponent],
    }),
  ],
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <button text-button (click)="alert.open()">Show Alert</button>
        <uni-alert #alert ${argsToTemplate(props)}>
          ${ngContent}
        </uni-alert>
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
