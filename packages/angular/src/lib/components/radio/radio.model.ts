export interface UniRadioOption {
  /**
   * The label displayed for this radio option
   */
  label: string;
  /**
   * The value associated with this radio option
   */
  value: string;
  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

export interface UniRadioOptions {
  /**
   * The size of the radio buttons
   */
  size: number;
}
