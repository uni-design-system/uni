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
      // Pin the Core section to the top of the sidebar — Theme (the umbrella
      // concept) first within it — everything else keeps alphabetical order.
      storySort: {
        order: ['Core', ['Introduction', 'Theme', 'Typography', 'Iconography'], '*'],
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
