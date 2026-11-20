import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniBoxDirective } from '../layout';
import { UniTextDirective } from '../text';
import { UniMenuComponent as Menu } from './menu.component';

type StoryType = Menu;

const meta: Meta<StoryType> = {
  title: 'Components/Actions/Menu',
  component: Menu,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniBoxDirective, UniTextDirective],
    }),
  ],
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <div box-layout containerColor="primary" padding="sm">
          <uni-menu ${argsToTemplate(props)}>
            <button text-button variant="ghost" symbolRight="arrow_drop_down">Menu</button>
          </uni-menu>
        </div>
      `,
    };
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    menuItems: [
      { label: 'Language', symbolName: 'translate' },
      { label: 'Settings', symbolName: 'settings' },
      { label: 'Logout', symbolName: 'logout' },
    ],
  },
};

/**
 * Item tones and structure come from the data, styling from the theme: a
 * divider groups the destructive action, `variant: 'warn'` renders it in the
 * theme's danger tone, and `disabled` items are skipped by keyboard
 * navigation.
 */
export const Tones: Story = {
  args: {
    menuItems: [
      { label: 'Rename', symbolName: 'edit' },
      { label: 'Duplicate', symbolName: 'content_copy' },
      { label: 'Share', symbolName: 'share', disabled: true },
      { divider: true },
      { label: 'Delete', symbolName: 'delete', variant: 'warn' },
    ],
  },
};

/**
 * A `{ heading: '…' }` item names the items that follow it, up to the next
 * heading or divider. The heading is text, not a command: arrow keys, Home,
 * End and typeahead pass over it, and the items under it are announced as a
 * group with that name.
 */
export const Headings: Story = {
  args: {
    menuItems: [
      { heading: 'Edit' },
      { label: 'Rename', symbolName: 'edit' },
      { label: 'Duplicate', symbolName: 'content_copy' },
      { divider: true },
      { heading: 'Send' },
      { label: 'Share', symbolName: 'share' },
      { label: 'Export', symbolName: 'download' },
      { divider: true },
      { label: 'Delete', symbolName: 'delete', variant: 'warn' },
    ],
  },
};
