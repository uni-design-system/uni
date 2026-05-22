import { Meta, StoryObj } from '@storybook/angular';
import { DatasourceStoryComponent } from './datasource.component';

const meta: Meta<DatasourceStoryComponent> = {
  title: 'CDK/Datasource',
  component: DatasourceStoryComponent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<DatasourceStoryComponent>;

export const Primary: Story = {
  args: {},
};
