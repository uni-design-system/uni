import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniCenterComponent } from '../layout';
import { UniTextComponent } from '../text';
import { UniDialogButtonsComponent } from './dialog-buttons/dialog-buttons.component';
import { UniDialogHeaderComponent } from './dialog-header/dialog-header.component';
import { UniDialogComponent as Dialog } from './dialog.component';

type StoryType = Dialog;

const meta: Meta<StoryType> = {
  title: 'Components/Dialog',
  component: Dialog,
  decorators: [
    moduleMetadata({
      imports: [
        UniButtonComponent,
        UniTextComponent,
        UniCenterComponent,
        UniDialogHeaderComponent,
        UniDialogButtonsComponent,
      ],
    }),
  ],
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <Button (click)="dialog.open()">Open Dialog</Button>
        <Dialog #dialog>
          <DialogHeader color="primary">Sample Dialog</DialogHeader>
          <div center-layout [width]="300" [height]="200">
            <Text>Dialog</Text>
          </div>
          <DialogButtons></DialogButtons>
        </Dialog>
      `,
    };
  },
  argTypes: {
    // Core Inputs
    show: {
      control: 'boolean',
      description:
        'Boolean input that controls whether the dialog is shown or hidden. When set to true, the dialog will open; when set to false, it will close. Default: undefined',
    },
    defaultCloseButton: {
      control: 'boolean',
      description:
        'When true, displays a default close button in the top-right corner of the dialog. This provides a consistent way for users to dismiss the dialog. Default: undefined',
    },

    // Methods
    open: {
      description: 'Method used to open the dialog programmatically. Usage: dialogRef.open()',
      table: {
        category: 'Methods',
        type: { summary: '() => void' },
      },
    },
    close: {
      description: 'Method used to close the dialog programmatically. Usage: dialogRef.close()',
      table: {
        category: 'Methods',
        type: { summary: '() => void' },
      },
    },

    // Outputs/Events
    showing: {
      description:
        'Output event that emits a boolean value indicating whether the dialog is being shown (true) or hidden (false). Useful for syncing dialog state with component state.',
      table: {
        category: 'Outputs',
        type: { summary: 'EventEmitter<boolean>' },
      },
      action: 'showing changed',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
