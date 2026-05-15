import { InjectionToken } from '@angular/core';
import { type UniTheme, UniThemes } from '@uni-design-system/uni-core';

export const UNI_THEMES = new InjectionToken<Record<string, UniTheme>>('', {
  providedIn: 'root',
  factory: () => UniThemes,
});
