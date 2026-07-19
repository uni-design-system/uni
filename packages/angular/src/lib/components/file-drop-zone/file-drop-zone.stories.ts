import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { UniStackComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';
import { UniFileDropZoneComponent as FileDropZone } from './file-drop-zone.component';

type StoryType = FileDropZone;

const meta: Meta<StoryType> = {
  title: 'Components/File Drop Zone',
  component: FileDropZone,
  decorators: [
    moduleMetadata({
      imports: [UniTextComponent, UniStackComponent],
    }),
  ],
  argTypes: {
    allowedFileExtensions: {
      control: 'text',
      description:
        'An array of one or more file extensions used to restrict the file types being attached.  The File Attachment will remain unrestricted if not defined.',
    },
    height: {
      control: 'number',
      description: 'The height of the drop zone.',
    },
    border: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'warn', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    label: 'Image',
    browseButtonText: 'Browse for image',
    allowedFileExtensions: ['png', 'jpg'],
  },
};

export const WithHelpTemplate: Story = {
  args: {
    label: 'Image',
    browseButtonText: 'Browse for image',
    allowedFileExtensions: ['png', 'jpg'],
  },
  render: (args) => {
    const { ...props } = args;
    return {
      props,
      template: `
      <uni-file-drop-zone ${argsToTemplate(props)} [helpTemplate]="myTemplate" />
      <ng-template #myTemplate>
        <div stack-layout alignItems="center">
          <Text typeface="title-medium">Title Text</Text>
          <Text typeface="subtitle-1">Subtitle Text</Text>
        </div>
      </ng-template>
      `,
    };
  },
};
