import { generateShadows } from '../../generation/shadow.generator';
import { createTheme, lightColors } from './base.theme';

export const LightTheme = createTheme({
  id: 'LightTheme',
  name: 'Light Theme',
  colors: lightColors,
  shadows: generateShadows(lightColors, 'light'),
});
