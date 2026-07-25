import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  UniDialogButtonsComponent,
  UniDialogComponent as Dialog,
  UniDialogHeaderComponent,
} from '../../lib/components/dialog';
import { UniButtonComponent } from '../../lib/components/button';
import { UniBoxComponent } from '../../lib/components/layout';
import { UniTextComponent } from '../../lib/components/text';

/**
 * Experiment: the Uni dialog re-themed to mirror IBM Carbon's dialog pattern
 * (https://carbondesignsystem.com/patterns/dialog-pattern/) purely through a
 * derived theme — no dialog-specific styling in the stories below. The Carbon
 * themes are registered globally in .storybook/preview.ts; each story pins
 * the `uniTheme` global rather than providing its own theme registry.
 */
const meta: Meta<Dialog> = {
  title: 'Experiments/Carbon Dialog',
  component: Dialog,
  globals: { uniTheme: 'CarbonLight' },
  decorators: [
    moduleMetadata({
      imports: [
        UniButtonComponent,
        UniTextComponent,
        UniBoxComponent,
        UniDialogHeaderComponent,
        UniDialogButtonsComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<Dialog>;

/** Carbon "transactional modal": passive copy, Cancel + primary action. */
export const Transactional: Story = {
  render: () => ({
    template: `
      <button text-button (click)="dialog.open()">Open modal</button>
      <dialog uni-dialog #dialog>
        <div box-layout [width]="480">
          <header uni-dialog-header>Add a custom domain</header>
          <div box-layout paddingHorizontal="md" paddingBottom="xl" style="padding-right: 20%">
            <span uni-text typeface="body-2-long" color="on-primary-surface-variant" display="block">
              Custom domains direct requests for your apps in this space to a URL that you own.
              A custom domain can be a shared domain, a shared subdomain, or a shared domain
              and host.
            </span>
          </div>
          <footer dialog-buttons confirmButtonText="Add" cancelButtonText="Cancel"></footer>
        </div>
      </dialog>
    `,
  }),
};

/** Carbon "danger modal": destructive confirmation with the danger action. */
export const Danger: Story = {
  render: () => ({
    template: `
      <button text-button (click)="dialog.open()">Delete repository</button>
      <dialog uni-dialog #dialog>
        <div box-layout [width]="480">
          <header uni-dialog-header>Delete repository?</header>
          <div box-layout paddingHorizontal="md" paddingBottom="xl" style="padding-right: 20%">
            <span uni-text typeface="body-2-long" color="on-primary-surface-variant" display="block">
              Are you sure you want to delete the uni-carbon repository? This action cannot be
              undone and all branches, releases, and settings will be permanently removed.
            </span>
          </div>
          <footer
            dialog-buttons
            confirmButtonText="Delete"
            confirmButtonVariant="warn"
            cancelButtonText="Cancel"
          ></footer>
        </div>
      </dialog>
    `,
  }),
};

/** The same dialog under Carbon's Gray 90 dark theme. */
export const DarkGray90: Story = {
  globals: { uniTheme: 'CarbonDark' },
  render: () => ({
    template: `
      <button text-button (click)="dialog.open()">Open modal</button>
      <dialog uni-dialog #dialog>
        <div box-layout [width]="480">
          <header uni-dialog-header>Add a custom domain</header>
          <div box-layout paddingHorizontal="md" paddingBottom="xl" style="padding-right: 20%">
            <span uni-text typeface="body-2-long" color="on-primary-surface-variant" display="block">
              Custom domains direct requests for your apps in this space to a URL that you own.
              A custom domain can be a shared domain, a shared subdomain, or a shared domain
              and host.
            </span>
          </div>
          <footer dialog-buttons confirmButtonText="Add" cancelButtonText="Cancel"></footer>
        </div>
      </dialog>
    `,
  }),
};
