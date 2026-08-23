import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { UniTabsComponent } from './tabs.component';
import { UniTabComponent } from './tab.component';
import { UniTextDirective } from '../text';

type StoryType = UniTabsComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/Tabs',
  component: UniTabsComponent,
  decorators: [moduleMetadata({ imports: [UniTabComponent, UniTextDirective] })],
  argTypes: {
    selectedIndex: {
      control: 'number',
      description: 'Index of the selected tab; two-way bindable. Default: 0',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <uni-tabs [selectedIndex]="selectedIndex ?? 0">
        <uni-tab label="Overview">
          <span uni-text="body-1-long">
            Arrow keys move between tabs (disabled tabs are skipped), Home and End jump
            to the extremes, and only the selected panel is rendered.
          </span>
        </uni-tab>
        <uni-tab label="Activity">
          <span uni-text="body-1-long">Recent activity would render here.</span>
        </uni-tab>
        <uni-tab label="Settings">
          <span uni-text="body-1-long">Settings content, instantiated on selection.</span>
        </uni-tab>
      </uni-tabs>
    `,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    template: `
      <uni-tabs>
        <uni-tab label="Open"><span uni-text="body-1-long">Open items.</span></uni-tab>
        <uni-tab label="Archived" [disabled]="true">
          <span uni-text="body-1-long">Unreachable while disabled.</span>
        </uni-tab>
        <uni-tab label="All"><span uni-text="body-1-long">Everything.</span></uni-tab>
      </uni-tabs>
    `,
  }),
};
