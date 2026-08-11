import { computed, signal, type Signal } from '@angular/core';

import { uniqueId } from '../a11y/a11y';

export interface ListboxNavigationConfig {
  /** How many options are currently navigable. Read reactively. */
  count: () => number;
  /** Id prefix for the listbox and its options. */
  idPrefix?: string;
  /** Wrap past the ends. Default true. */
  wrap?: boolean;
}

/**
 * The keyboard and ARIA bookkeeping shared by every combobox-style popup:
 * open state, the active option index, and the `aria-activedescendant` id
 * wiring. Deliberately owns no markup and no filtering — each control renders
 * its own options and decides what a suggestion *is*.
 *
 * Extracted because three controls need the identical contract
 * (`uni-search-input`, `uni-tag-input`, and the multi-select upgrade), and the
 * parts that silently drift between hand-rolled copies all live here: the
 * wrap-around arithmetic, Home/End, and keeping the active id in sync with the
 * option list.
 *
 * `Enter` and `Escape` are deliberately *not* handled: what they mean depends
 * on the control (submit a search, commit a typed token, clear the field), and
 * `activeIndex()` is all a caller needs to decide.
 */
export class ListboxNavigation {
  /** Id for the `role="listbox"` element; wire as `aria-controls`. */
  readonly listboxId: string;

  private readonly _open = signal(false);
  private readonly _activeIndex = signal(-1);
  private readonly wrap: boolean;

  /** Whether the popup is showing. Also false when there is nothing to show. */
  readonly open: Signal<boolean> = computed(() => this._open() && this.config.count() > 0);

  /** Index of the highlighted option, or -1 when none is active. */
  readonly activeIndex: Signal<number> = computed(() => {
    const index = this._activeIndex();
    // A shrinking option list must never leave the active id dangling.
    return index < this.config.count() ? index : -1;
  });

  /** Value for `aria-activedescendant`, or null when nothing is active. */
  readonly activeDescendantId: Signal<string | null> = computed(() => {
    const index = this.activeIndex();
    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  constructor(private readonly config: ListboxNavigationConfig) {
    this.listboxId = uniqueId(config.idPrefix ?? 'uni-listbox');
    this.wrap = config.wrap ?? true;
  }

  /** Stable per-option id, for `role="option"` elements. */
  optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  show(): void {
    this._open.set(true);
  }

  /** Close and drop the active option, so reopening starts clean. */
  hide(): void {
    this._open.set(false);
    this._activeIndex.set(-1);
  }

  setActive(index: number): void {
    this._activeIndex.set(index);
  }

  /**
   * Handle ArrowDown / ArrowUp / Home / End, opening the popup if needed.
   * Returns true when the key was consumed, so a caller can fall through to
   * its own handling for everything else.
   */
  navigate(event: KeyboardEvent): boolean {
    const count = this.config.count();
    if (count === 0) return false;

    const target = this.nextIndex(event.key, count);
    if (target === null) return false;

    event.preventDefault();
    this._open.set(true);
    this._activeIndex.set(target);
    return true;
  }

  private nextIndex(key: string, count: number): number | null {
    const current = this.activeIndex();

    switch (key) {
      case 'ArrowDown':
        return this.step(current, 1, count);
      case 'ArrowUp':
        // Opening with ArrowUp lands on the last option, matching menus.
        return current < 0 ? count - 1 : this.step(current, -1, count);
      case 'Home':
        return 0;
      case 'End':
        return count - 1;
      default:
        return null;
    }
  }

  private step(current: number, delta: number, count: number): number {
    const next = current + delta;
    if (this.wrap) return (next + count) % count;
    return Math.min(Math.max(next, 0), count - 1);
  }

  /** Close when focus leaves the control entirely (not on internal moves). */
  closeOnFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const container = event.currentTarget as HTMLElement | null;
    if (!next || !container?.contains(next)) this.hide();
  }
}

/** Factory mirroring the signal-API style used elsewhere in the CDK. */
export const createListboxNavigation = (config: ListboxNavigationConfig): ListboxNavigation =>
  new ListboxNavigation(config);
