export type ZIndexableElements =
  | 'dropdown'
  | 'sticky'
  | 'fixed'
  | 'backdrop'
  | 'dialog'
  | 'popover'
  | 'tooltip'
  | 'overlay';

export const Z_INDEX: Record<ZIndexableElements, number> = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  dialog: 1050,
  popover: 1060,
  tooltip: 1070,
  overlay: 1080,
};
