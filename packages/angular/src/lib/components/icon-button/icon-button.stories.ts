import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { icons } from '../icon/icon.record';
import { UniIconButtonComponent as IconButton } from './icon-button.component';

type StoryType = IconButton;

const meta: Meta<StoryType> = {
  title: 'Components/Icon Button',
  component: IconButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
      description: 'The color and style of the button as defined by the loaded theme.',
    },
    size: {
      defaultValue: 'lg',
      options: ['sm', 'md', 'lg', 'xl'],
      control: 'radio',
      description: 'The size of the button as defined by the loaded theme.',
    },
    loading: {
      control: 'boolean',
      description:
        'Used to disable the button and active the loading animation to prevent repetitive clicks.',
    },
    iconName: {
      control: 'select',
      options: Object.keys(icons),
      description: 'The name of the icon as defined by the loaded theme.',
    },
    symbolName: {
      control: 'text',
      description:
        'The Material Symbol name. The `symbolName` overrides the `iconName` \n' +
        '\n' +
        'There aare over 3k symbols are available.  Use the official Material Symbol manifest to find the appropriate symbol name. \n' +
        '\n' +
        'Here are some options to try: `home` `done` `undo` `add` `logout` `phone_iphone` `phone_android` `qr_code`',
    },
  },
  render: (args) => {
    const { iconName, variant, size, ...props } = args;
    return {
      props,
      template: `
        <button icon-button iconName="${iconName}" variant="${variant}" size="${size}" ${argsToTemplate(
          props
        )}></button>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    iconName: 'search',
    size: 'lg',
    variant: 'ghost',
  },
};
