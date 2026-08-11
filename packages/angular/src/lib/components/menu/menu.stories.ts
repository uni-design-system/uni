import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniBoxComponent } from '../layout';
import { UniTextComponent } from '../text';
import { UniMenuComponent as Menu } from './menu.component';

type StoryType = Menu;

const meta: Meta<StoryType> = {
  title: 'Components/Actions/Menu',
  component: Menu,
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent, UniBoxComponent, UniTextComponent],
    }),
  ],
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
        <div box-layout color="primary" padding="sm">
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
