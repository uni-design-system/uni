import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';

import {
  createListboxNavigation,
  motionSafe,
  visuallyHidden,
  type Option,
  type Options,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { listboxPopupStyles } from '../forms/listbox-popup';
import { UniIconComponent } from '../icon';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniComboboxOptions, UniComboboxRejection } from './combobox.model';

/**
 * Form-bound, closed-set, single-select autocomplete: `FormValueControl<T | null>`
 * over object `Options<T>`, type-to-filter, commit-on-select. Typing produces a
 * draft — a filter, never a value; the value changes only when an option
 * commits, `clear()` runs, or the model is written from outside. Select
 * semantics, not search: a real label, a chevron, no magnifier, nothing
 * submits. For short lists with no need to type, prefer `uni-select` — the
 * value contract is identical, so swapping is a template-only change.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-combobox, Combobox',
  imports: [UniIconButtonComponent, UniIconComponent, UniInputBoxComponent],
  templateUrl: './combobox.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'combobox' }],
  host: { '[class]': 'className()' },
})
export class UniComboboxComponent<T>
  extends BaseComponent<UniComboboxOptions>
  implements FormValueControl<T | null>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<T | null>(null);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name for the field, e.g. "State"; echoed on the listbox. */
  label = input.required<string>();
  placeholder = input<string>();
  options = input<Options<T>>([]);
  /**
   * Equality used to match `value` against option values, called as
   * `compareWith(optionValue, value)`. Defaults to reference equality, which
   * never matches an object value rebuilt from elsewhere (e.g. a saved record
   * against options from a fresh fetch) — pass a key comparison like
   * `(a, b) => a?.id === b?.id` for object values.
   */
  compareWith = input<(optionValue: T, value: T) => boolean>((a, b) => a === b);
  width = input<string | number>('100%');
  /** Show a ✕ while a value is set; an emptied field on blur also clears. */
  clearable = input(true);
  /** Blur commits an exact-match draft; a non-matching draft reverts. */
  commitOnBlur = input(true);
  /** i18n-able empty row, also announced when a filter matches nothing. */
  emptyText = input('No matches');

  // --- Filtering (local by default — the closed set is already in memory) ---
  /** `false` renders `options` verbatim; narrow them app-side from `query`. */
  filterLocally = input(true);
  /** Filter predicate; default is locale-lowercased label-contains. */
  filterWith = input<(option: Option<T>, query: string) => boolean>();
  debounceTime = input(250);

  // --- Events ---------------------------------------------------------------
  /** Debounced draft text, for async option lists. */
  query = output<string>();
  /** An option committed. */
  selected = output<Option<T>>();
  cleared = output<void>();
  /** A commit was refused (no match); the field reverted. */
  rejected = output<UniComboboxRejection>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listbox');
  /** Cancelled on destroy — a late tick would emit on a destroyed OutputRef. */
  private queryTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.queryTimer));
  }

  protected readonly srOnly = css(visuallyHidden);
  protected readonly announcement = signal('');

  /** null → the field shows the committed label; a string is an uncommitted draft. */
  protected readonly draft = signal<string | null>(null);

  /**
   * Popup visibility. Component-owned rather than `list.open()` — the shared
   * signal gates on `count() > 0`, which would hide the "No matches" row and
   * misreport `aria-expanded` over an empty filter.
   */
  protected readonly popupOpen = signal(false);

  /** Index in options() of the option matching value(), else -1. */
  protected readonly committedIndex = computed(() => {
    const value = this.value();
    if (value === null || value === undefined) return -1;
    return this.options().findIndex((option) => this.compareWith()(option.value, value));
  });

  /** A value with no matching option renders '' but is preserved — options may
      still be loading; the field self-heals when they arrive. */
  protected readonly committedLabel = computed(() => {
    const index = this.committedIndex();
    return index >= 0 ? this.options()[index].label : '';
  });

  protected readonly displayValue = computed(() => this.draft() ?? this.committedLabel());

  /** Indices into options() surviving the filter. The draft filters; the
      committed label does not — reopening always shows the full set. */
  protected readonly filteredIndices = computed<number[]>(() => {
    const query = this.draft();
    const all = this.options().map((_, index) => index);
    if (!this.filterLocally() || query === null || query === '') return all;
    const filter =
      this.filterWith() ??
      ((option: Option<T>, q: string) =>
        option.label.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
    return all.filter((index) => filter(this.options()[index], query));
  });

  /** Shared combobox bookkeeping, in filtered-list positions — the fourth
      consumer of the contract behind search-input, tag-input and time-input. */
  protected readonly list = createListboxNavigation({
    count: () => this.filteredIndices().length,
    idPrefix: 'uni-combobox-listbox',
    disabled: (position) => !!this.options()[this.filteredIndices()[position]]?.disabled,
  });

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  // --- Committing ------------------------------------------------------------

  private commit(optIndex: number): boolean {
    const option = this.options()[optIndex];
    if (!option || option.disabled) return false;
    this.value.set(option.value);
    this.draft.set(null);
    this.closeList();
    this.setFieldText(this.displayValue());
    this.announce(`${option.label} selected.`);
    this.selected.emit(option);
    return true;
  }

  protected clear(): void {
    this.value.set(null);
    this.draft.set(null);
    this.closeList();
    this.setFieldText('');
    this.announce('Selection cleared.');
    this.cleared.emit();
    this.inputRef().nativeElement.focus();
  }

  /**
   * Draft resolution, used by Enter, Tab and blur:
   * 1. an active option in the list → commit it;
   * 2. else a unique exact label match (locale-case-insensitive) → commit it;
   * 3. Enter only: the filter narrowed to exactly one enabled option → commit it
   *    (on Enter the user can see the single candidate; on blur they're gone,
   *    and committing a value they never saw confirmed is how forms grow
   *    mystery data);
   * 4. else the caller keeps the list open (Enter) or reverts (Tab/blur).
   */
  private resolveDraft(enterOnly: boolean): boolean {
    const filtered = this.filteredIndices();
    const active = this.list.activeIndex();
    if (this.popupOpen() && active >= 0 && active < filtered.length) {
      return this.commit(filtered[active]);
    }
    const draft = this.draft();
    if (draft === null) return true;
    if (draft === '') {
      // An emptied field on Tab/blur is a deliberate "no value" — but only
      // clearable fields may null the model this way.
      if (this.clearable() && this.value() !== null && !enterOnly) {
        this.value.set(null);
        this.announce('Selection cleared.');
        this.cleared.emit();
      }
      this.draft.set(null);
      this.setFieldText(this.displayValue());
      return true;
    }
    const normalize = (text: string) => text.toLocaleLowerCase();
    const exact = this.options()
      .map((option, index) => ({ option, index }))
      .filter(
        ({ option }) => !option.disabled && normalize(option.label) === normalize(draft)
      );
    if (exact.length === 1) return this.commit(exact[0].index);
    if (enterOnly) {
      const enabled = filtered.filter((index) => !this.options()[index].disabled);
      if (enabled.length === 1) return this.commit(enabled[0]);
    }
    return false;
  }

  private revertDraft(): string | null {
    const draft = this.draft();
    if (draft === null) return null;
    this.draft.set(null);
    this.setFieldText(this.displayValue());
    return draft;
  }

  private reject(): void {
    const query = this.revertDraft();
    if (query) {
      this.announce(`No match for “${query}”.`);
      this.rejected.emit({ query });
    }
  }

  // --- Keyboard --------------------------------------------------------------

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.altKey) {
        // Alt+Down opens without activating; Alt+Up closes keeping the draft.
        if (event.key === 'ArrowDown') {
          if (!this.popupOpen()) this.openList(-1);
        } else {
          this.closeList();
        }
        return;
      }
      if (!this.popupOpen()) {
        this.popupOpen.set(true);
        this.list.show();
        if (event.key === 'ArrowDown') {
          const committed = this.committedFilteredPos();
          if (committed >= 0) {
            this.list.setActive(committed);
            this.scrollToActive();
            return;
          }
        }
        // Fall through: Down lands on the first enabled option, Up on the last.
      }
      if (this.list.navigate(event)) this.scrollToActive();
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      // Only while the list is open — closed, they belong to the caret.
      if (this.popupOpen() && this.list.navigate(event)) this.scrollToActive();
      return;
    }
    switch (event.key) {
      case 'Enter':
        // Never submits a form while the list is open.
        if (this.popupOpen()) event.preventDefault();
        if (!this.resolveDraft(true)) {
          const count = this.filteredIndices().length;
          this.announce(
            count === 0 ? `${this.emptyText()}.` : `${count} results. Use the arrow keys.`
          );
        }
        return;
      case 'Escape':
        // One layer at a time: close the list, then revert the draft.
        // Never clears the committed value — Escape on a form control must
        // not be destructive.
        if (this.popupOpen()) this.closeList();
        else if (this.draft() !== null) this.revertDraft();
        return;
      case 'Tab':
        // Resolve rules 1–2 (never rule 3), then let focus move on.
        if (this.commitOnBlur() && !this.resolveDraft(false)) this.reject();
        this.closeList();
    }
  }

  protected onInput(): void {
    const text = this.inputRef().nativeElement.value;
    this.draft.set(text);
    this.popupOpen.set(true);
    this.list.show();
    // Typing never selects — rules 2/3 make Enter still work without arrowing.
    this.list.setActive(-1);
    clearTimeout(this.queryTimer);
    this.queryTimer = setTimeout(() => {
      this.query.emit(text);
      // Filtering is otherwise silent to a screen reader.
      if (this.filterLocally() && text !== '') {
        const count = this.filteredIndices().length;
        this.announce(
          count === 0 ? `${this.emptyText()}.` : `${count} result${count === 1 ? '' : 's'}.`
        );
      }
    }, this.debounceTime());
  }

  // --- Pointer ---------------------------------------------------------------

  /** Click-to-browse: pointer users get the select affordance. Focus alone
      never opens — Tab-through forms must not spray popups. */
  protected onFieldClick(): void {
    if (this.disabled() || this.popupOpen()) return;
    this.openList(this.committedFilteredPos());
  }

  protected onToggleMousedown(event: MouseEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.inputRef().nativeElement.focus();
    if (this.popupOpen()) this.closeList();
    else this.openList(this.committedFilteredPos());
  }

  protected onOptionClick(optIndex: number): void {
    if (this.options()[optIndex]?.disabled) return;
    this.commit(optIndex);
    this.inputRef().nativeElement.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.touched.set(true);
    if (this.commitOnBlur() && !this.resolveDraft(false)) this.reject();
    else this.draft.set(null);
    this.closeList();
  }

  // --- Internals -------------------------------------------------------------

  /** Filtered position of the committed option when visible and enabled, else -1. */
  private committedFilteredPos(): number {
    const committed = this.committedIndex();
    if (committed < 0 || this.options()[committed].disabled) return -1;
    return this.filteredIndices().indexOf(committed);
  }

  private openList(activeFilteredPos: number): void {
    this.popupOpen.set(true);
    this.list.show();
    this.list.setActive(activeFilteredPos);
    this.scrollToActive();
  }

  private closeList(): void {
    this.popupOpen.set(false);
    this.list.hide();
  }

  private scrollToActive(): void {
    const position = this.list.activeIndex();
    if (position < 0) return;
    queueMicrotask(() =>
      this.listRef()?.nativeElement.children[position]?.scrollIntoView?.({ block: 'nearest' })
    );
  }

  private setFieldText(text: string): void {
    const element = this.inputRef()?.nativeElement;
    if (element) element.value = text;
  }

  private announce(message: string): void {
    // Re-announce identical text by breaking the string equality.
    this.announcement.set(this.announcement() === message ? `${message} ` : message);
  }

  // --- Styling ----------------------------------------------------------------

  protected readonly className = computed(() =>
    css({ display: 'block', position: 'relative', width: this.width() })
  );

  protected readonly rowClass = computed(() =>
    css({ display: 'flex', alignItems: 'center', flex: 1, width: '100%', minWidth: 0 })
  );

  protected readonly inputClass = computed(() =>
    css({
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
    })
  );

  /** Pointer-only affordance: keyboard already has ArrowDown, and the input
      itself announces expanded state. */
  protected readonly toggleClass = computed(() =>
    css({
      flex: 'none',
      width: 28,
      height: 28,
      display: 'grid',
      placeItems: 'center',
      border: 0,
      padding: 0,
      background: 'transparent',
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
      ...this.theme.color('on-background-variant'),
      '& uni-icon': {
        ...motionSafe({ transition: 'transform 0.15s ease' }),
        transform: this.popupOpen() ? 'rotate(180deg)' : 'none',
      },
    })
  );

  protected readonly listClass = computed(() => {
    const options = this.componentOptions();
    return css([
      listboxPopupStyles(this.theme, options, {
        // A scroll height, never a cap: a closed-set control must not render a
        // reachable-by-keyboard-only subset (contrast searchInput.maxSuggestions).
        maxHeight: (options.maxVisibleOptions ?? 8) * 36 + 8,
      }),
      {
        '& [role="option"]': {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 36,
          boxSizing: 'border-box',
          padding: '5px 10px',
          '&.active, &:not([aria-disabled="true"]):hover': {
            '& .check': { color: 'inherit' },
            '& .desc': { color: 'inherit', opacity: 0.8 },
          },
          '&[aria-disabled="true"]': {
            ...this.theme.color('on-disabled'),
            cursor: 'not-allowed',
            '& .desc': { color: 'inherit' },
          },
        },
        // Fixed-width check column so labels align with or without the icon.
        '& .check': { flex: 'none', width: 18, ...this.theme.color('primary') },
        '& .text': { minWidth: 0, flex: 1, display: 'flex', alignItems: 'baseline', gap: 8 },
        '& .option-label': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        '& .desc': {
          marginLeft: 'auto',
          whiteSpace: 'nowrap',
          fontSize: '0.85em',
          ...this.theme.color(options.descriptionColor ?? 'on-primary-surface-variant'),
        },
        '& .empty': {
          padding: 10,
          ...this.theme.typeface('label'),
          ...this.theme.color(options.descriptionColor ?? 'on-primary-surface-variant'),
        },
      },
    ]);
  });
}
