import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniNotificationBadgeComponent } from './notification-badge';
import { UniBoxComponent, UniCenterComponent, UniWrapComponent } from '../layout';

const meta: Meta<UniNotificationBadgeComponent> = {
  title: 'Components/Feedback/Notification Badge',
  component: UniNotificationBadgeComponent,
  tags: ['experimental'],
  decorators: [
    moduleMetadata({
      imports: [UniWrapComponent, UniCenterComponent, UniBoxComponent, UniButtonComponent],
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
      <div box-layout padding="md">
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
      <div wrap-layout gap="md" padding="md">
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
      <div wrap-layout gap="lg" padding="lg">
        <uni-notification-badge [count]="1" position="top-right">
          <div center-layout [width]="60" [height]="60" color="surface-variant" border="light" borderRadius="xs">
            Top Right
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="2" position="top-left">
          <div center-layout [width]="60" [height]="60" color="surface-variant" border="light" borderRadius="xs">
            Top Left
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="3" position="bottom-right">
          <div center-layout [width]="60" [height]="60" color="surface-variant" border="light" borderRadius="xs">
            Bottom Right
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="4" position="bottom-left">
          <div center-layout [width]="60" [height]="60" color="surface-variant" border="light" borderRadius="xs">
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
      <div wrap-layout gap="lg" padding="lg">
        <uni-notification-badge badgeVariant="dot">
          <div center-layout [width]="80" [height]="80" color="surface-variant" border="light" borderRadius="xs">
            Dot Variant
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="8" badgeVariant="count">
          <div center-layout [width]="80" [height]="80" color="surface-variant" border="light" borderRadius="xs">
            Count Variant
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="123" badgeVariant="pill" [maxCount]="99">
          <div center-layout [width]="80" [height]="80" color="surface-variant" border="light" borderRadius="xs">
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
      <div wrap-layout gap="lg" padding="lg">
        <uni-notification-badge [count]="12">
          <div center-layout [width]="48" [height]="48" color="surface-variant" border="light" borderRadius="max">
            📧
          </div>
        </uni-notification-badge>
        <uni-notification-badge badgeVariant="dot">
          <div center-layout [width]="48" [height]="48" color="surface-variant" border="light" borderRadius="max">
            🔔
          </div>
        </uni-notification-badge>
        <uni-notification-badge [count]="999" [maxCount]="99" badgeVariant="pill">
          <div center-layout [width]="48" [height]="48" color="surface-variant" border="light" borderRadius="max">
            💬
          </div>
        </uni-notification-badge>
      </div>
    `,
  }),
};
