import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UniAppBarComponent } from './app-bar.component';
import { UniAvatarComponent } from '../avatar';
import { UniIconButtonComponent } from '../icon-button';

type StoryType = UniAppBarComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Navigation/App Bar',
  component: UniAppBarComponent,
  decorators: [moduleMetadata({ imports: [UniAvatarComponent, UniIconButtonComponent] })],
  argTypes: {
    title: { control: 'text', description: 'Bar title; or project custom center content.' },
    sticky: {
      control: 'boolean',
      description: 'Stick the bar to the top of its scroll container. Default: false',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <uni-app-bar [title]="title" [sticky]="sticky">
        <button leading icon-button symbolName="menu">Open navigation</button>
        <button trailing icon-button symbolName="notifications">Notifications</button>
        <uni-avatar trailing name="Grace Hopper" size="sm" />
      </uni-app-bar>
    `,
  }),
  args: { title: 'Console' },
};
