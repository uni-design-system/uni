import { applicationConfig, type Preview } from '@storybook/angular';
import { UNI_THEMES } from '../src/lib/theming';
import { UniThemes } from '@uni-design-system/uni-core';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [{ provide: UNI_THEMES, useValue: UniThemes }],
    }),
  ],
};

export default preview;
