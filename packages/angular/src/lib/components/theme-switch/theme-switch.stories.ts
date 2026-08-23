import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button';
import { UniCardComponent, UniCardContentComponent, UniCardHeaderComponent } from '../card';
import { UniRowDirective, UniStackDirective } from '../layout';
import { UniTextDirective } from '../text';
import { UniThemeSwitchComponent as ThemeSwitch } from './theme-switch.component';

type StoryType = ThemeSwitch;

const meta: Meta<StoryType> = {
  title: 'Core/Theme Switch',
  component: ThemeSwitch,
  decorators: [
    moduleMetadata({
      imports: [
        UniButtonComponent,
        UniCardComponent,
        UniCardHeaderComponent,
        UniCardContentComponent,
        UniRowDirective,
        UniStackDirective,
        UniTextDirective,
      ],
    }),
  ],
  render: () => ({
    template: `
      <div stack-layout gap="md" [width]="420">
        <uni-theme-switch></uni-theme-switch>
        <uni-card>
          <uni-card-header>Live preview</uni-card-header>
          <uni-card-content>
            <div stack-layout gap="md">
              <span uni-text typeface="body-2-long">
                Pick a theme above — every registered theme (UNI_THEMES) restyles
                this card and these buttons instantly.
              </span>
              <div row-layout gap="sm">
                <button text-button variant="primary">Primary</button>
                <button text-button variant="secondary">Secondary</button>
                <button text-button variant="warn">Danger</button>
              </div>
            </div>
          </uni-card-content>
        </uni-card>
      </div>
    `,
  }),
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the underlying select. Default: "Theme"',
    },
    themeChanged: {
      description: 'Emits the selected theme key after it has been applied.',
      table: { category: 'Outputs', type: { summary: 'EventEmitter<ThemeName>' } },
      action: 'themeChanged',
    },
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {},
};
