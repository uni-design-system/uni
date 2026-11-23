/** One `input()`, `model()` or `output()` declaration, as read from source. */
export interface SignalMember {
  name: string;
  kind: 'input' | 'input.required' | 'model' | 'model.required' | 'output';
  /** The type the member holds; inferred from the default or transform when no generic is given. */
  type: string;
  /** Source text of the initial value. Absent for required members and outputs. */
  default?: string;
  /** Template-facing name from `{ alias: '…' }`, when the options bag sets one. */
  alias?: string;
  /** The preceding JSDoc block, flattened to one line. */
  doc: string;
}

/** Every public signal member declared in a class source, in source order. */
export function parseMembers(src: string): SignalMember[];

/** The JSDoc block immediately preceding an offset, flattened to one line. */
export function jsdocBefore(src: string, index: number): string;

/**
 * Read `<Type>(arg, …)` starting at `from`: the generic argument, if any, and
 * the call's top-level arguments. Null when `from` does not start a call.
 */
export function readCall(src: string, from: number): { type: string; args: string[] } | null;

/** The first generic argument: `input<T, TransformT>` reports `T` alone. */
export function firstTypeArg(type: string): string;
