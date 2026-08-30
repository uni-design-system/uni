import { Meta, StoryObj } from '@storybook/angular';
import { UniLayoutPressureComponent } from './layout-pressure.component';

const meta: Meta<UniLayoutPressureComponent> = {
  title: 'Experiments/Forms layout pressure',
  component: UniLayoutPressureComponent,
  parameters: {
    componentSubtitle: 'Every form control in an auto 1fr grid, with what it leaves behind',
  },
};

export default meta;
type Story = StoryObj<UniLayoutPressureComponent>;

export const FormControls: Story = {};
