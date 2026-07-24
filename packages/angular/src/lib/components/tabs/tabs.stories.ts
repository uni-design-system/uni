import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { UniTabsComponent } from './tabs.component';
import { UniTabComponent } from './tab.component';
import { UniTextComponent } from '../text';

type StoryType = UniTabsComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/Tabs',
  component: UniTabsComponent,
  decorators: [moduleMetadata({ imports: [UniTabComponent, UniTextComponent] })],
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
          <uni-text typeface="body-1-long">
            Arrow keys move between tabs (disabled tabs are skipped), Home and End jump
            to the extremes, and only the selected panel is rendered.
          </uni-text>
        </uni-tab>
        <uni-tab label="Activity">
          <uni-text typeface="body-1-long">Recent activity would render here.</uni-text>
        </uni-tab>
        <uni-tab label="Settings">
          <uni-text typeface="body-1-long">Settings content, instantiated on selection.</uni-text>
        </uni-tab>
      </uni-tabs>
    `,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    template: `
      <uni-tabs>
        <uni-tab label="Open"><uni-text typeface="body-1-long">Open items.</uni-text></uni-tab>
        <uni-tab label="Archived" [disabled]="true">
          <uni-text typeface="body-1-long">Unreachable while disabled.</uni-text>
        </uni-tab>
        <uni-tab label="All"><uni-text typeface="body-1-long">Everything.</uni-text></uni-tab>
      </uni-tabs>
    `,
  }),
};
