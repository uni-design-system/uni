import {
  applicationConfig,
  componentWrapperDecorator,
  moduleMetadata,
  type Preview,
} from '@storybook/angular';
import { UNI_THEMES } from '../src/lib/theming';
import { UniThemes } from '@uni-design-system/uni-core';
import { CarbonThemes } from '../src/stories/themes/carbon.theme';
import { WellsourcedThemes } from '../src/stories/themes/wellsourced.theme';
import { SbUniThemeComponent } from './theme-provider.component';

/** Every theme the toolbar can switch to; first key is the default. */
const AllThemes = { ...UniThemes, ...CarbonThemes, ...WellsourcedThemes };

const preview: Preview = {
  parameters: {
    options: {
      // Sidebar order: concepts first, then components ordered
      // building-blocks → controls → output → containers, then the non-visual
      // utilities, then experiments. Within a group a base component leads its
      // family (Input then Input Box, Expand then its parts) rather than
      // following a strict alphabet.
      //
      // Anything omitted here falls back to file-path order, which reads as
      // random on screen — it put Button Group before Button and Expand Area
      // before Expand. Add new pages to this list.
      storySort: {
        order: [
          'Core',
          ['Introduction', 'Theme', 'Theme Builder', 'Theme Switch', 'Typography', 'Iconography'],
          'Components',
          [
            'Primitives',
            ['Text', 'Icon', 'Symbol', 'Divider'],
            'Layout',
            ['Box', 'Row', 'Stack', 'Grid', 'Center', 'Wrap'],
            'Actions',
            ['Button', 'Button Group', 'Icon Button', 'Menu'],
            'Forms',
            [
              'Input',
              'Input Box',
              'Textarea',
              'Select',
              'Multi Select',
              'Multi Select Dropdown',
              'Checkbox',
              'Radio',
              'Toggle',
              'Slider',
              'Search Input',
              'Debounce Input',
              'Tag Input',
              'File Drop Zone',
            ],
            'Navigation',
            ['App Bar', 'Breadcrumb', 'Drawer', 'Tabs'],
            'Data Display',
            [
              'Avatar',
              'Badge',
              'Tag',
              'Stat',
              'Data Table',
              'Data Search',
              'Sort Header',
              'Paginator',
              'JSON View',
            ],
            'Feedback',
            [
              'Alert',
              'Snackbar',
              'Progress Bar',
              'Progress Gauge',
              'Skeleton',
              'Tooltip',
              'Notification Badge',
            ],
            'Surfaces',
            [
              'Card',
              'Dialog',
              'Popover',
              'Expand',
              'Expand Area',
              'Expand Toggle',
              'Scroll Area',
              'Background',
            ],
          ],
          'Utilities',
          ['Datasource', 'Local Storage', 'Notifications', 'Permissions', 'Timer'],
          'Experiments',
          ['Carbon Dialog', 'Carbon Menu'],
          '*',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    uniTheme: {
      description: 'Uni theme applied to the story',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.entries(AllThemes).map(([value, theme]) => ({ value, title: theme.name })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { uniTheme: Object.keys(AllThemes)[0] },
  decorators: [
    applicationConfig({
      providers: [{ provide: UNI_THEMES, useValue: AllThemes }],
    }),
    // The wrapper must be a known element of every story's module for the
    // componentWrapperDecorator template below to compile.
    moduleMetadata({ imports: [SbUniThemeComponent] }),
    componentWrapperDecorator(SbUniThemeComponent, ({ globals }) => ({
      uniTheme: globals['uniTheme'],
    })),
  ],
};

export default preview;
