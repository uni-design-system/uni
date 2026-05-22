import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniBoxComponent } from '../layout';
import { UniTextComponent } from '../text';
import { UniMenuComponent as Menu } from './menu.component';

type StoryType = Menu;

const meta: Meta<StoryType> = {
  title: 'Components/Menu',
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
          <Menu ${argsToTemplate(props)}>
            <button text-button variant="ghost" symbolRight="arrow_drop_down">Menu</button>
          </Menu>
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
