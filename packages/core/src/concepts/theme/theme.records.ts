import { type UniTheme } from './theme.model';
import { DarkTheme } from './themes/dark.theme';
import { LightTheme } from './themes/light.theme';

export const UniThemes: Record<string, UniTheme> = {
  LightTheme,
  DarkTheme,
};

// First Theme is default.
export const DefaultThemeId = Object.keys(UniThemes)[0];
