import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniMenuComponent as Menu } from '../../lib/components/menu';
import { UniIconButtonComponent } from '../../lib/components/icon-button';
import { UniBoxDirective } from '../../lib/components/layout';

/**
 * Experiment: the Uni menu re-themed to mirror IBM Carbon's overflow menu
 * (https://carbondesignsystem.com/components/overflow-menu/usage/) purely
 * through the `menu` / `menuItem` theme options — no menu-specific styling in
 * the stories below. Sharp full-bleed panel, 40px options in IBM Plex,
 * $layer-hover rows, a full-bleed divider, and the red danger option: the
 * same component that renders the default theme's rounded, inset menu.
 */
const meta: Meta<Menu> = {
  title: 'Experiments/Carbon Menu',
  component: Menu,
  globals: { uniTheme: 'CarbonLight' },
  decorators: [
    moduleMetadata({
      imports: [UniIconButtonComponent, UniBoxDirective],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <div box-layout color="background" padding="lg">
        <uni-menu [menuItems]="menuItems" placement="bottom-start">
          <button uni-icon-button variant="ghost" size="sm" symbolName="more_vert" ariaLabel="Options"></button>
        </uni-menu>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<Menu>;

/** Carbon overflow menu with a grouped danger option. */
export const OverflowMenu: Story = {
  args: {
    menuItems: [
      { label: 'Stop app', symbolName: 'stop_circle' },
      { label: 'Restart app', symbolName: 'restart_alt' },
      { label: 'Rename app', symbolName: 'edit' },
      { divider: true },
      { label: 'Delete app', symbolName: 'delete', variant: 'warn' },
    ],
  },
};

/** The same menu under Carbon's Gray 90 dark theme. */
export const DarkGray90: Story = {
  globals: { uniTheme: 'CarbonDark' },
  args: OverflowMenu.args,
};
