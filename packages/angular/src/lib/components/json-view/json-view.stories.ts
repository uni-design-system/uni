import { Meta, StoryObj } from '@storybook/angular';
import { UniJsonViewComponent } from './json-view.component';

type StoryType = UniJsonViewComponent;

const meta: Meta<StoryType> = {
  title: 'Components/JSON View',
  component: UniJsonViewComponent,
  argTypes: {
    json: {
      description:
        'The JSON data to be displayed. This can be any valid JavaScript object or array that can be serialized to JSON.\n',
    },
    rows: {
      description:
        'Sets the number of visible rows in the textarea. Default is 6 rows.\n',
    },
    fontSize: {
      description:
        'Controls the font size of the text. Can be an AbsoluteSize value (xx-small, x-small, small, medium, large, x-large, xx-large, xxx-large) or any valid CSS size value. Default is "medium".\n',
    },
    width: {
      description:
        'Sets the width of the component. Can be a number (pixels) or a string (e.g., "100%", "300px"). Default is "100%".\n',
    },
    selectOnClick: {
      description:
        'When true (default), clicking on the JSON view will automatically select all content, making it easy to copy.\n',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    json: { a: { b: ['c', 'd', 'e', 'f'], g: ['h', 'i'] }, j: 'k' },
  },
};
