import type {
  Motion,
  Border,
  ContainerColorToken,
  Radius,
  Shadow,
  Typeface,
} from '@uni-design-system/uni-core';
import type { IconName } from '../icon/icon.record';

/**
 * Theme options for the `popover` component entry. Defaults reproduce the
 * pre-theme hardcoded look; the `tooltip*` options apply only in
 * `mode="tooltip"`.
 */
export interface UniPopoverOptions {
  color: ContainerColorToken;
  border: Border;
  borderRadius: Radius;
  shadow: Shadow;
  typeface: Typeface;
  /** Typeface for the `header` title row. */
  headerTypeface: Typeface;
  /** Body padding in rich mode. */
  padding: string;
  /** Body padding in tooltip mode (tighter). */
  tooltipPadding: string;
  /** Default panel max-width; an instance `maxWidth` input overrides. */
  maxWidth: string;
  /** Main-axis gap between anchor and panel, px. */
  offset: number;
  arrowSize: number;
  /** Icon primitive for the `closable` button. */
  closeSymbol: IconName;
  /** Hover open delay in tooltip mode, ms. */
  tooltipOpenDelay: number;
  /** Pointer-leave close delay in tooltip mode, ms. */
  tooltipCloseDelay: number;  /** Named motion primitive for the open/close animation. */
  motion: Motion;
}
