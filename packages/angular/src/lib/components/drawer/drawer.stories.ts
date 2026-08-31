import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from 'storybook/test';
import { UniDrawerComponent } from './drawer.component';
import { UniDrawerHeaderComponent } from './drawer-header/drawer-header.component';
import { UniDrawerButtonsComponent } from './drawer-buttons/drawer-buttons.component';
import { UniAppBarComponent } from '../app-bar';
import { UniButtonComponent } from '../button';
import { UniIconButtonComponent } from '../icon-button';
import { UniInputComponent } from '../input';
import { UniNumberInputComponent } from '../number-input';
import { UniQuantityStepperComponent } from '../quantity-stepper';
import { UniBoxDirective, UniRowDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text';

type StoryType = UniDrawerComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/Drawer',
  component: UniDrawerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        UniAppBarComponent,
        UniButtonComponent,
        UniIconButtonComponent,
        UniInputComponent,
        UniNumberInputComponent,
        UniQuantityStepperComponent,
        UniDrawerHeaderComponent,
        UniDrawerButtonsComponent,
        UniBoxDirective,
        UniRowDirective,
        UniStackDirective,
        UniTextDirective,
      ],
    }),
  ],
  argTypes: {
    mode: {
      control: 'select',
      options: ['side', 'over'],
      description: "'side' pushes content in-flow; 'over' floats with a scrim. Default: 'side'",
    },
    position: {
      control: 'select',
      options: ['start', 'end'],
      description: "Edge the drawer attaches to. Default: 'start'",
    },
    open: { control: 'boolean', description: 'Two-way bindable open state.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

/** The dashboard shell recipe: app bar + side drawer + content. */
export const DashboardShell: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <section stack-layout height="420px" overflow="hidden">
        <uni-app-bar title="Console">
          <button leading icon-button symbolName="menu" (click)="open = !open">Toggle navigation</button>
          <button trailing icon-button symbolName="account_circle">Account</button>
        </uni-app-bar>
        <div row-layout [grow]="1" [minHeight]="0">
          <uni-drawer mode="side" [(open)]="open">
            <nav stack-layout gap="sm" aria-label="Main">
              <span uni-text="title-small" display="block">Dashboard</span>
              <span uni-text="title-small" display="block">Reports</span>
              <span uni-text="title-small" display="block">Settings</span>
            </nav>
          </uni-drawer>
          <main box-layout [grow]="1" padding="md" [minWidth]="0">
            <h2 uni-text="headline-small">Content</h2>
            <span uni-text="body-1-long" display="block">
              The side drawer pushes this content; toggle it from the app bar.
            </span>
          </main>
        </div>
      </section>
    `,
  }),
};

/**
 * The editor-panel shape: a pinned header, a long scrolling form, and a pinned
 * save bar — the layout a drawer needs before it can replace a hand-rolled
 * side panel.
 *
 * The play function is the acceptance test for that layout. It asserts the
 * scroll *geometry*, which is why it lives here and not in the unit spec:
 * jsdom has no layout engine, so `scrollHeight` and `clientHeight` are both 0
 * there and every one of these assertions would pass vacuously.
 */
export const EditorPanel: Story = {
  render: () => ({
    props: {
      open: false,
      dirty: false,
      quantity: 3,
      attributes: Array.from({ length: 24 }, (_, i) => i + 1),
      onCloseRequest() {
        // A real panel would run its "discard unsaved changes?" confirm here
        // and set `open` when it resolves. The story only needs to prove the
        // drawer asked and then stayed put.
      },
    },
    template: `
      <div box-layout padding="md">
        <h2 uni-text="headline-small">Product board</h2>
        <span uni-text="body-1-long" display="block">
          The panel opens over this. Close it and reopen from the button.
        </span>
        <button text-button variant="primary" size="md" (click)="open = true">Edit line item</button>
      </div>
      <uni-drawer
        mode="over"
        position="end"
        [width]="480"
        headline="Edit line item"
        initialFocus="input"
        [disableAutoClose]="dirty"
        [(open)]="open"
        (closeRequest)="onCloseRequest()"
      >
        <div stack-layout gap="md">
          <uni-input label="SKU" placeholder="WS-00000" />
          <uni-input label="Description" placeholder="Describe the line" />
          <!-- Long enough that the body overflows at any plausible viewport:
               the point of the story is that this scrolls while the rows above
               and below it do not. -->
          @for (n of attributes; track n) {
            <uni-input [label]="'Attribute ' + n" placeholder="Value" />
          }
          <uni-number-input label="Unit price" [value]="24.5" />
          <uni-quantity-stepper label="Quantity" [(value)]="quantity" />
        </div>
        <div drawer-buttons confirmButtonText="Save" cancelButtonText="Cancel"></div>
      </uni-drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const panel = await waitFor(() => {
      const dialog = canvasElement.ownerDocument.querySelector('dialog');
      if (!dialog?.open) throw new Error('drawer not open');
      return dialog;
    });
    const rows = Array.from(panel.children) as HTMLElement[];
    const body = rows.find((row) => getComputedStyle(row).overflowY === 'auto')!;
    const footer = rows[rows.length - 1];

    await expect(body).toBeTruthy();

    // 1. The three rows exactly fill the panel: nothing has been pushed out of
    //    view, and no phantom content has inflated it.
    //
    //    Note this is *not* the RFC's literal `scrollHeight === clientHeight`.
    //    Under `overflow: clip` Chrome still reports a descendant's layout
    //    overflow in the panel's `scrollHeight`, reaching through the body's
    //    own scroll container — so that equality holds only while the form is
    //    short enough not to scroll, which is the one case that proves nothing.
    //    What actually matters is below: the panel cannot be scrolled, and the
    //    rows account for every pixel of it.
    const rowHeights = rows.reduce((total, row) => total + row.getBoundingClientRect().height, 0);
    await expect(Math.round(rowHeights)).toBe(Math.round(panel.getBoundingClientRect().height));

    // 2. The panel refuses to scroll even when told to. This is the invariant
    //    that broke the consuming app: their panel scrolled 1098px of nothing.
    panel.scrollTop = 999;
    await expect(panel.scrollTop).toBe(0);

    // 3. The footer is pinned — it has no scrollable content of its own, so a
    //    wheel over it moves nothing.
    await expect(footer.scrollHeight).toBe(footer.clientHeight);

    // 4. The body is the scroller, and it stops at its last element.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    // Rounded: scroll offsets are fractional once content lands on subpixels.
    await expect(Math.round(body.scrollTop)).toBe(
      Math.round(body.scrollHeight - body.clientHeight)
    );
    await expect(getComputedStyle(body).overscrollBehaviorY).toBe('contain');

    // 5. No descendant has escaped its scroll container to land on the panel.
    //    This is the sr-only bug, asserted where it actually reproduced.
    const escapees = Array.from(panel.querySelectorAll<HTMLElement>('*')).filter(
      (element) =>
        getComputedStyle(element).position === 'absolute' && element.offsetParent === panel
    );
    await expect(escapees).toHaveLength(0);

    // 7. Initial focus went where the panel asked — the first field — rather
    //    than to the header's close button, which is what the platform's own
    //    "first focusable" rule would have chosen.
    await expect(canvasElement.ownerDocument.activeElement).toBe(panel.querySelector('input'));

    // The header labels the panel, so it needs no ariaLabel of its own.
    await expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
    await expect(panel.getAttribute('aria-label')).toBeNull();

    const heading = within(panel).getByText('Edit line item');
    await expect(heading).toBeTruthy();
  },
};

/**
 * The same panel with `scrim` off: the page behind stays undimmed and fully
 * legible, so the user can keep reading the board they are editing against.
 *
 * The drawer is still modal — focus is trapped and the page behind is inert.
 * `scrim` is a visibility choice, not a modality one.
 */
export const WithoutScrim: Story = {
  render: () => ({
    props: {
      open: false,
      rows: Array.from({ length: 10 }, (_, i) => i + 1),
    },
    template: `
      <div box-layout padding="md">
        <h2 uni-text="headline-small">Product board</h2>
        @for (row of rows; track row) {
          <span uni-text="body-1-long" display="block">Line item {{ row }} — still readable.</span>
        }
        <button text-button variant="primary" size="md" (click)="open = true">Edit line item</button>
      </div>
      <uni-drawer
        mode="over"
        position="end"
        [width]="480"
        [scrim]="false"
        headline="Edit line item"
        [(open)]="open"
      >
        <div stack-layout gap="md">
          <uni-input label="SKU" placeholder="WS-00000" />
          <uni-input label="Description" placeholder="Describe the line" />
        </div>
        <div drawer-buttons confirmButtonText="Save"></div>
      </uni-drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.ownerDocument.querySelector('dialog')!;
    await expect(panel.open).toBe(true);
    // The backdrop is transparent rather than absent: the element still exists
    // and still swallows clicks, which is what keeps the drawer modal.
    const backdrop = getComputedStyle(panel, '::backdrop');
    await expect(backdrop.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

export const Overlay: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <button text-button variant="primary" size="md" (click)="open = true">Open drawer</button>
      <uni-drawer mode="over" position="start" [(open)]="open" ariaLabel="Main navigation">
        <span uni-text="title-small" display="block">Dashboard</span>
        <span uni-text="title-small" display="block">Reports</span>
        <span uni-text="title-small" display="block">Settings</span>
        <button text-button variant="secondary" size="sm" (click)="open = false">Close</button>
      </uni-drawer>
    `,
  }),
};
