import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PermissionsStoryComponent } from './permissions.component';
import { PermissionService } from './permission.service';

type StoryType = PermissionsStoryComponent;

const meta: Meta<StoryType> = {
  title: 'CDK/Permissions API',
  component: PermissionsStoryComponent,
  decorators: [
    moduleMetadata({
      imports: [],
      providers: [PermissionService],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
