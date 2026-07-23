import type { Colors } from '../theme.model';
import { generatePalette } from '../../color';
import { generateShadows } from '../../generation/shadow.generator';
import { BASE_PALETTE_CONFIG, createTheme } from './base.theme';

export const darkColors: Colors = generatePalette({ ...BASE_PALETTE_CONFIG, mode: 'dark' });

export const DarkTheme = createTheme({
  id: 'DarkTheme',
  name: 'Dark Theme',
  colors: darkColors,
  shadows: generateShadows(darkColors, 'dark'),
});
