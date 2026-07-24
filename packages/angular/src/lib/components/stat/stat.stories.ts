import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { UniStatComponent } from './stat.component';

type StoryType = UniStatComponent;

const meta: Meta<StoryType> = {
  title: 'Components/Data Display/Stat',
  component: UniStatComponent,
  render: (args) => {
    const { ...props } = args;
    return { props, template: `<uni-stat ${argsToTemplate(props)}></uni-stat>` };
  },
  argTypes: {
    label: { control: 'text', description: 'What is being measured, sentence case.' },
    value: {
      control: 'text',
      description: 'Headline number: strings verbatim, numbers auto-compact (48234 → "48.2K").',
    },
    delta: { control: 'text', description: 'Signed change, e.g. "+12.4%". Sign drives the arrow.' },
    upIsGood: {
      control: 'boolean',
      description: 'Whether upward movement is good — flip for churn, errors, cost. Default: true',
    },
    caption: { control: 'text', description: 'Names the comparison period, e.g. "vs last month".' },
    trend: { control: 'object', description: 'Recent values for the decorative sparkline.' },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: {
    label: 'Monthly recurring revenue',
    value: '$48.2K',
    delta: '+12.4%',
    caption: 'vs last month',
    trend: [31, 34, 33, 38, 37, 41, 40, 44, 43, 46, 47, 48],
  },
};

export const DownIsGood: Story = {
  name: 'Down is good (churn)',
  args: {
    label: 'Churn rate',
    value: '2.1%',
    delta: '-0.4%',
    upIsGood: false,
    caption: 'vs last month',
    trend: [3.2, 3.1, 3.0, 2.8, 2.9, 2.7, 2.6, 2.4, 2.5, 2.3, 2.2, 2.1],
  },
};

export const KpiRow: Story = {
  name: 'KPI row',
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;">
        <uni-stat label="Monthly recurring revenue" [value]="48234" delta="+12.4%" caption="vs last month" [trend]="[31,34,33,38,37,41,40,44,43,46,47,48]" />
        <uni-stat label="Active users" [value]="12900" delta="+3.1%" caption="vs last week" [trend]="[9,10,10,11,10,11,12,11,12,12,13,12.9]" />
        <uni-stat label="Churn rate" value="2.1%" delta="-0.4%" [upIsGood]="false" caption="vs last month" />
        <uni-stat label="Open tickets" [value]="87" delta="+16" [upIsGood]="false" caption="vs yesterday" />
      </div>
    `,
  }),
};
