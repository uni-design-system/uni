import { BaseIcons } from '@uni-design-system/uni-core';
import type { Icons } from '@uni-design-system/uni-core';

export type IconName = keyof Icons;

/**
 * @deprecated The default icon set now ships with every theme — import
 * `BaseIcons` from `@uni-design-system/uni-core`. Kept as a re-export for
 * existing imports.
 */
export const icons: Record<IconName, string> = BaseIcons;
