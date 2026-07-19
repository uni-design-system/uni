import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniNotificationBadgeComponent } from './notification-badge';

const meta: Meta<UniNotificationBadgeComponent> = {
  title: 'Components/Notification Badge',
  component: UniNotificationBadgeComponent,
  tags: ['experimental'],
  decorators: [
    moduleMetadata({
      imports: [UniButtonComponent],
    }),
  ],
  argTypes: {
    count: {
      control: 'number',
      description: 'The number to display in the badge',
    },
    maxCount: {
      control: 'number',
      description: 'Maximum number to display before showing "+"',
    },
    badgeVariant: {
      control: 'select',
      options: ['dot', 'count', 'pill'],
      description: 'Visual style of the badge',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
        'warn',
        'success',
        'ghost',
        'light',
      ],
      description: 'Color variant for the badge',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Position of the badge relative to its parent',
    },
    show: {
      control: 'boolean',
      description: 'Whether to show the badge',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="margin: 20px;">
        <uni-notification-badge
          [count]="count"
          [maxCount]="maxCount"
          [badgeVariant]="badgeVariant"
          [color]="color"
          [position]="position"
          [show]="show">
          <button uni-text-button>
            Button with Badge
          </button>
        </uni-notification-badge>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<UniNotificationBadgeComponent>;

export const Default: Story = {
  args: {
    count: 5,
    badgeVariant: 'count',
    color: 'warn',
    position: 'top-right',
    show: true,
    maxCount: 99,
  },
};

export const Dot: Story = {
  args: {
    badgeVariant: 'dot',
    color: 'warn',
    position: 'top-right',
    show: true,
  },
};

export const Count: Story = {
  args: {
    count: 12,
    badgeVariant: 'count',
    color: 'warn',
    position: 'top-right',
    show: true,
    maxCount: 99,
  },
};

export const Pill: Story = {
  args: {
    count: 1234,
    badgeVariant: 'pill',
    color: 'warn',
    position: 'top-right',
    show: true,
    maxCount: 999,
  },
};

export const LargeCount: Story = {
  args: {
    count: 150,
    badgeVariant: 'count',
    color: 'warn',
    position: 'top-right',
    show: true,
    maxCount: 99,
  },
};

export const DifferentColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 20px; margin: 20px; flex-wrap: wrap;">
        <uni-notification-badge [count]="3" color="primary" position="top-right">
          <button uni-text-button>Primary</button>
        </uni-notification-badge>
        <uni-notification-badge [count]="5" color="secondary" position="top-right">
          <button uni-text-button>Secondary</button>
        </uni-notification-badge>
        <uni-notification-badge [count]="7" color="success" position="top-right">
          <button uni-text-button>Success</button>
        </uni-notification-badge>
        <uni-notification-badge [count]="9" color="warn" position="top-right">
          <button uni-text-button>Warning</button>
        </uni-notification-badge>
        <uni-notification-badge [count]="11" color="tertiary" position="top-right">
          <button uni-text-button>Tertiary</button>
        </uni-notification-badge>
        <uni-notification-badge [count]="13" color="quaternary" position="top-right">
          <button uni-text-button>Quaternary</button>
        </uni-notification-badge>
      </div>
    `,
  }),
};

export const DifferentPositions: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 30px; margin: 50px; flex-wrap: wrap;">
        <uni-notification-badge [count]="1" position="top-right">
          <div style="width: 60px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            Top Right
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="2" position="top-left">
          <div style="width: 60px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            Top Left
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="3" position="bottom-right">
          <div style="width: 60px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            Bottom Right
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="4" position="bottom-left">
          <div style="width: 60px; height: 60px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            Bottom Left
          </div>
        </uni-notification-badge>
      </div>
    `,
  }),
};

export const VariantComparison: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 30px; margin: 50px; flex-wrap: wrap;">
        <uni-notification-badge badgeVariant="dot">
          <div style="width: 80px; height: 80px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center;">
            Dot Variant
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="8" badgeVariant="count">
          <div style="width: 80px; height: 80px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center;">
            Count Variant
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="123" badgeVariant="pill" [maxCount]="99">
          <div style="width: 80px; height: 80px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center;">
            Pill Variant
          </div>
        </uni-notification-badge>
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 30px; margin: 50px; flex-wrap: wrap;">
        <uni-notification-badge [count]="12">
          <div style="width: 48px; height: 48px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            📧
          </div>
        </uni-notification-badge>
        <uni-notification-badge badgeVariant="dot">
          <div style="width: 48px; height: 48px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            🔔
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="999" [maxCount]="99" badgeVariant="pill">
          <div style="width: 48px; height: 48px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            💬
          </div>
        </uni-notification-badge>
      </div>
    `,
  }),
};
