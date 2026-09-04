import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { UniButtonComponent } from '../button';
import { UniInputComponent } from '../input';
import { UniBoxDirective, UniCenterDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text';
import { UniDialogButtonsComponent } from './dialog-buttons/dialog-buttons.component';
import { UniDialogHeaderComponent } from './dialog-header/dialog-header.component';
import { UniDialogComponent as Dialog } from './dialog.component';

type StoryType = Dialog;

const meta: Meta<StoryType> = {
  title: 'Components/Surfaces/Dialog',
  component: Dialog,
  decorators: [
    moduleMetadata({
      imports: [
        UniButtonComponent,
        UniInputComponent,
        UniTextDirective,
        UniBoxDirective,
        UniCenterDirective,
        UniStackDirective,
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
        <button text-button (click)="dialog.open()">Open Dialog</button>
        <dialog uni-dialog #dialog>
          <header dialog-header color="primary">Sample Dialog</header>
          <div center-layout [width]="300" [height]="200">
            <span uni-text>Dialog</span>
          </div>
          <footer dialog-buttons></footer>
        </dialog>
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

/**
 * Opens the dialog the way a user does, then waits for it. The stories open on
 * a click rather than on load so the docs page renders a trigger, not a modal.
 */
const openPanel = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /open dialog/i }));
  return waitFor(() => {
    const panel = canvasElement.ownerDocument.querySelector('dialog');
    if (!panel?.open) throw new Error('dialog not open');
    return panel;
  });
};

/**
 * The dialog's rows, in order. The optional close button is out of flow, so it
 * is not one of them.
 */
const rowsOf = (panel: HTMLDialogElement) =>
  (Array.from(panel.children) as HTMLElement[]).filter(
    (row) => getComputedStyle(row).position !== 'absolute'
  );

/** The scrolling row, found by what it does rather than by its index. */
const bodyOf = (rows: HTMLElement[]) =>
  rows.find((row) => getComputedStyle(row).overflowY === 'auto')!;

/** The base theme's `inset: 'lg'`, in px. */
const INSET = 32;

/**
 * The scroll invariants, in a real browser: jsdom reports every height as 0,
 * so the unit spec can only assert the CSS contract behind these.
 *
 * A form far longer than any viewport, so the dialog is guaranteed to reach
 * its cap. From there the header and the action row pin while only the body
 * moves.
 */
export const LongContent: Story = {
  render: () => ({
    props: {
      show: false,
      attributes: Array.from({ length: 24 }, (_, i) => i + 1),
    },
    template: `
      <div box-layout padding="md">
        <span uni-text="body-1-long" display="block">
          The dialog opens over this. Close it and reopen from the button.
        </span>
        <button text-button variant="primary" size="md" (click)="show = true">Open dialog</button>
      </div>
      <dialog uni-dialog [(show)]="show">
        <header dialog-header>Edit line item</header>
        <div stack-layout gap="md" padding="md">
          <uni-input label="SKU" placeholder="WS-00000" />
          <!-- Long enough to overflow at any plausible viewport: the point of
               the story is that this scrolls while the rows above and below it
               do not. -->
          @for (n of attributes; track n) {
            <uni-input [label]="'Attribute ' + n" placeholder="Value" />
          }
        </div>
        <footer dialog-buttons confirmButtonText="Save" cancelButtonText="Cancel"></footer>
      </dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const panel = await openPanel(canvasElement);
    const rows = rowsOf(panel);
    const body = bodyOf(rows);
    const [header] = rows;
    const footer = rows[rows.length - 1];

    await expect(rows).toHaveLength(3);
    await expect(body).toBeTruthy();

    // 1. The surface stops at the themed inset rather than running to the
    //    viewport edge — the dialog's difference from the drawer, which is
    //    deliberately viewport-tall.
    const height = panel.getBoundingClientRect().height;
    await expect(height).toBeLessThanOrEqual(window.innerHeight - INSET * 2);

    // 2. It got there: with this much content the body has to scroll, and it
    //    stops at its last field.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    // Rounded: scroll offsets are fractional once content lands on subpixels.
    await expect(Math.round(body.scrollTop)).toBe(
      Math.round(body.scrollHeight - body.clientHeight)
    );
    await expect(getComputedStyle(body).overscrollBehaviorY).toBe('contain');

    // 3. The three rows account for every pixel inside the surface padding:
    //    nothing has been pushed out of view, and no phantom content has
    //    inflated it.
    const style = getComputedStyle(panel);
    const inset = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const rowHeights = rows.reduce((total, row) => total + row.getBoundingClientRect().height, 0);
    await expect(Math.round(rowHeights)).toBe(Math.round(panel.clientHeight - inset));

    // 4. The surface refuses to scroll even when told to. Before this change
    //    it was the scroller, and a long form took its own header and action
    //    buttons off the screen with it.
    panel.scrollTop = 999;
    await expect(panel.scrollTop).toBe(0);

    // 5. Both pinned rows have no scrollable content of their own, so a wheel
    //    over either moves nothing.
    await expect(header.scrollHeight).toBe(header.clientHeight);
    await expect(footer.scrollHeight).toBe(footer.clientHeight);

    // 6. No descendant escaped the body's scroll container to land on the
    //    surface, which is what would inflate its scrollHeight.
    const escapees = Array.from(panel.querySelectorAll<HTMLElement>('*')).filter(
      (element) =>
        getComputedStyle(element).position === 'absolute' && element.offsetParent === panel
    );
    await expect(escapees).toHaveLength(0);
  },
};

/**
 * The other half of the contract: a short dialog is still sized by its
 * content, nowhere near the cap, with nothing to scroll.
 */
export const ShrinkToContent: Story = {
  render: () => ({
    props: { show: false },
    template: `
      <div box-layout padding="md">
        <button text-button variant="primary" size="md" (click)="show = true">Open dialog</button>
      </div>
      <dialog uni-dialog [(show)]="show">
        <header dialog-header>Discard changes?</header>
        <div box-layout padding="md">
          <span uni-text="body-1-long">Your edits to this line item will be lost.</span>
        </div>
        <footer dialog-buttons confirmButtonText="Discard" cancelButtonText="Keep editing"></footer>
      </dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const panel = await openPanel(canvasElement);
    const body = bodyOf(rowsOf(panel));

    // Content-sized: well short of the cap, and the body has nothing to scroll.
    await expect(panel.getBoundingClientRect().height).toBeLessThan(
      window.innerHeight - INSET * 2
    );
    await expect(body.scrollHeight).toBe(body.clientHeight);
    body.scrollTop = 999;
    await expect(body.scrollTop).toBe(0);
  },
};

/**
 * No header, so the dialog is named by `ariaLabel` and dismissed by the
 * `defaultCloseButton` — the floating close in the corner of the surface.
 */
export const WithoutHeader: Story = {
  render: () => ({
    props: { show: false },
    template: `
      <button text-button variant="primary" (click)="show = true">Open dialog</button>
      <dialog uni-dialog [(show)]="show" ariaLabel="Keyboard shortcuts" [defaultCloseButton]="true">
        <div box-layout padding="lg" [width]="320">
          <span uni-text="body-1-long" display="block">
            Press <strong>Escape</strong> to close, or use the button in the corner.
            With no header to be labelled by, the dialog announces its
            <code>ariaLabel</code> instead.
          </span>
        </div>
      </dialog>
    `,
  }),
};

/**
 * Driven from outside instead of by the template reference: `[(show)]` opens
 * and closes it, and `(showing)` reports back — false only once the closing
 * animation has finished.
 */
export const Controlled: Story = {
  render: () => ({
    props: { show: false, lastEvent: 'closed' },
    template: `
      <div stack-layout gap="md" padding="md" alignItems="flex-start">
        <button text-button variant="primary" (click)="show = true">Open dialog</button>
        <span uni-text="body-2">Dialog reports: {{ lastEvent }}</span>
      </div>
      <dialog
        uni-dialog
        [(show)]="show"
        (showing)="lastEvent = $event ? 'open' : 'closed'"
      >
        <header dialog-header>Controlled dialog</header>
        <div box-layout padding="md" [width]="320">
          <span uni-text="body-1-long" display="block">
            Confirm and Cancel both close it, and so do Escape and a backdrop
            click — every route keeps <code>show</code> in sync.
          </span>
        </div>
        <footer dialog-buttons confirmButtonText="Save" cancelButtonText="Cancel"></footer>
      </dialog>
    `,
  }),
};
