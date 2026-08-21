export interface Option<T = unknown> {
  label: string;
  value: T;
  /** Secondary line, e.g. an email under a name. Read as part of the option's name. */
  description?: string;
  /** Visible and announced, but not committable; listbox navigation skips it. */
  disabled?: boolean;
}

export type Options<T = unknown> = Option<T>[];
