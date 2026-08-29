import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Size, TagTone, Variant } from '@uni-design-system/uni-core';

import { createAnnouncer, createListboxNavigation, uniqueId, visuallyHidden } from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import {
  listboxPopupAttr,
  listboxPopupStyles,
  newListboxAnchor,
  promoteListboxPopup,
} from '../forms/listbox-popup';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniInputBoxOptions } from '../input-box/input-box.model';
import { UniTagComponent } from '../tag';
import type {
  UniTagInputOptions,
  UniTagItem,
  UniTagRejection,
  UniTagSuggestion,
} from './tag-input.model';

/** Loose address check — deliberately permissive, matching what mail clients accept. */
const EMAIL = /^[^\s@,;]+@[^\s@,;.]+\.[^\s@,;]+$/;

/** `Name <a@b.com>` / `"Name" <a@b.com>` → the address, plus the display name. */
const unwrapAddress = (raw: string): { value: string; label?: string } => {
  const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (!match) return { value: raw.trim() };
  const label = match[1].trim();
  return { value: match[2].trim(), ...(label ? { label } : {}) };
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-tag-input',
  imports: [UniInputBoxComponent, UniTagComponent],
  templateUrl: './tag-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'tagInput' }],
  host: { '[class]': 'className()' },
})
export class UniTagInputComponent
  extends BaseComponent<UniTagInputOptions>
  implements FormValueControl<UniTagItem[]>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniTagItem[]>([]);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name for the field, e.g. "To". */
  label = input.required<string>();
  placeholder = input<string>();
  /** `email` wires an address validator, paste parser and space separator. */
  preset = input<'text' | 'email'>('text');
  separators = input<string[]>([',', ';']);
  commitOnBlur = input(true);
  allowDuplicates = input(false);
  max = input<number>();
  validate = input<(raw: string) => boolean>();
  parse = input<(pasted: string) => string[]>();

  // Chip presentation, forwarded to uni-tag.
  tagVariant = input<Variant>('primary');
  tagTone = input<TagTone>('soft');
  tagSize = input<Size>();

  // --- Autocomplete (same contract as uni-search-input: the app filters) ----
  suggestions = input<UniTagSuggestion[]>([]);
  /** Debounced text the app should filter `suggestions` from. */
  query = output<string>();
  debounceTime = input(250);

  // --- Events --------------------------------------------------------------
  added = output<UniTagItem>();
  removed = output<UniTagItem>();
  rejected = output<UniTagRejection>();

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly chipRefs = viewChildren<ElementRef<HTMLElement>>('chip');
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listbox');

  /** Ties the popup to the field so the browser tracks it in the top layer. */
  private readonly anchor = newListboxAnchor();
  /** `manual` where the top layer is usable, else null — see the popup helper. */
  protected readonly popupAttr = listboxPopupAttr();

  constructor() {
    super();
    promoteListboxPopup(this.listRef);
  }

  /** Uncommitted text in the field. */
  protected readonly draft = signal('');
  /** Index of the focused chip, or -1 when focus is in the text input. */
  protected readonly focusedChip = signal(-1);
  /** Adds, removes and refusals are otherwise silent to a screen reader. */
  protected readonly announcer = createAnnouncer();

  protected readonly hintId = uniqueId('uni-tag-input-hint');
  protected readonly srOnly = css(visuallyHidden);

  private queryTimer?: ReturnType<typeof setTimeout>;

  protected readonly visibleSuggestions = computed(() => {
    const taken = new Set(this.value().map((item) => item.value));
    return this.suggestions()
      .filter((suggestion) => this.allowDuplicates() || !taken.has(suggestion.value))
      .slice(0, this.componentOptions().maxSuggestions ?? 8);
  });

  /** Shared combobox bookkeeping — identical contract to uni-search-input. */
  protected readonly list = createListboxNavigation({
    count: () => this.visibleSuggestions().length,
    idPrefix: 'uni-tag-listbox',
  });

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly separatorKeys = computed(() =>
    this.preset() === 'email' ? [...this.separators(), ' '] : this.separators()
  );

  protected readonly describedBy = computed(() =>
    [this.ariaDescribedBy(), this.hintId].filter(Boolean).join(' ')
  );

  protected labelOf(item: UniTagItem | UniTagSuggestion): string {
    return item.label ?? item.value;
  }

  // --- Committing ----------------------------------------------------------

  /** Split pasted text into candidate tokens. */
  private parseRaw(raw: string): string[] {
    const custom = this.parse();
    if (custom) return custom(raw);

    const pattern = this.preset() === 'email' ? /[,;\n\t]+/ : new RegExp(`[${this.separators().map((s) => `\\${s}`).join('')}\n\t]+`);
    return raw.split(pattern);
  }

  private isValid(candidate: string): boolean {
    const custom = this.validate();
    if (custom) return custom(candidate);
    return this.preset() === 'email' ? EMAIL.test(candidate) : true;
  }

  /**
   * Turn typed text into a chip. Invalid entries are kept and flagged rather
   * than dropped; duplicates and over-max are refused with a reason.
   */
  protected commit(raw: string): boolean {
    const trimmed = raw.trim();
    if (!trimmed) return false;

    const { value: candidate, label } = this.preset() === 'email' ? unwrapAddress(trimmed) : { value: trimmed, label: undefined };
    if (!candidate) return false;

    const current = this.value();
    if (!this.allowDuplicates() && current.some((item) => item.value === candidate)) {
      this.reject(candidate, 'duplicate');
      return false;
    }

    const max = this.max();
    if (max !== undefined && current.length >= max) {
      this.reject(candidate, 'max');
      return false;
    }

    const match = this.suggestions().find((suggestion) => suggestion.value === candidate);
    const item: UniTagItem = {
      value: candidate,
      ...(label || match?.label ? { label: label ?? match?.label } : {}),
      ...(match?.avatarSrc ? { avatarSrc: match.avatarSrc } : {}),
      ...(this.isValid(candidate) ? {} : { invalid: true }),
    };

    this.value.update((items) => [...items, item]);
    this.added.emit(item);
    this.announcer.announce(`${this.labelOf(item)} added. ${this.value().length} ${this.countNoun()}.`);
    return true;
  }

  private reject(raw: string, reason: UniTagRejection['reason']): void {
    this.rejected.emit({ raw, reason });
    // The visual cue is a brief pulse a screen reader cannot see.
    this.announcer.announce(
      reason === 'duplicate' ? `${raw} is already added.` : `${raw} was not added: limit reached.`
    );
  }

  protected removeAt(index: number, focus: 'left' | 'right' | 'input' = 'input'): void {
    const item = this.value()[index];
    if (!item || item.disabled) return;

    this.value.update((items) => items.filter((_, i) => i !== index));
    this.removed.emit(item);
    this.announcer.announce(`${this.labelOf(item)} removed. ${this.value().length} ${this.countNoun()}.`);

    const remaining = this.value().length;
    if (focus === 'left' && index > 0) this.focusChip(index - 1);
    else if (focus === 'right' && index < remaining) this.focusChip(index);
    else this.focusInput();
  }

  private countNoun(): string {
    return this.value().length === 1 ? 'item' : 'items';
  }


  // --- Focus ---------------------------------------------------------------

  protected focusInput(): void {
    this.focusedChip.set(-1);
    queueMicrotask(() => this.inputRef().nativeElement.focus());
  }

  private focusChip(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.value().length - 1));
    this.focusedChip.set(clamped);
    queueMicrotask(() => {
      const chip = this.chipRefs()[clamped]?.nativeElement;
      chip?.querySelector<HTMLElement>('button')?.focus();
    });
  }

  // --- Keyboard: focus in the text input -----------------------------------

  protected onInputKeydown(event: KeyboardEvent): void {
    if (this.list.navigate(event)) return;

    const input = this.inputRef().nativeElement;
    const empty = input.value === '';

    if (this.separatorKeys().includes(event.key) && !empty) {
      event.preventDefault();
      this.commitDraft();
      return;
    }

    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const active = this.list.activeIndex();
        if (this.list.open() && active >= 0) this.selectSuggestion(this.visibleSuggestions()[active]);
        else this.commitDraft();
        break;
      }
      case 'Tab':
        // Never trap: commit what is typed, then let focus move on.
        if (!empty) this.commitDraft();
        break;
      case 'Backspace':
        if (empty && this.value().length) {
          // Focus the last chip rather than deleting blind — a second
          // Backspace, now on the chip, removes it.
          event.preventDefault();
          this.focusChip(this.value().length - 1);
        }
        break;
      case 'ArrowLeft':
        if (input.selectionStart === 0 && this.value().length) {
          event.preventDefault();
          this.focusChip(this.value().length - 1);
        }
        break;
      case 'Escape':
        if (this.list.open()) this.list.hide();
        else this.setDraft('');
        break;
    }
  }

  protected onInput(value: string): void {
    this.setDraft(value);
    this.list.show();
    this.list.setActive(-1);

    clearTimeout(this.queryTimer);
    this.queryTimer = setTimeout(() => this.query.emit(value), this.debounceTime());
  }

  protected onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!text) return;
    event.preventDefault();

    const tokens = this.parseRaw(text);

    // A trailing fragment with no separator after it is still being typed, so
    // it stays in the field rather than committing as a half-address. With a
    // custom `parse` the app owns tokenization and every token is complete.
    const separators = [...this.separatorKeys(), '\n', '\t'].map((key) =>
      key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const endsWithSeparator = new RegExp(`[${separators.join('')}]\\s*$`).test(text);
    const tail = this.parse() || endsWithSeparator ? '' : (tokens.pop() ?? '');

    tokens.forEach((token) => this.commit(token));
    this.setDraft(tail.trim());
  }

  protected onBlur(): void {
    this.touched.set(true);
    if (this.commitOnBlur()) this.commitDraft();
  }

  protected onFocusOut(event: FocusEvent): void {
    this.list.closeOnFocusOut(event);
  }

  // --- Keyboard: focus on a chip -------------------------------------------

  protected onChipKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) this.focusChip(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index < this.value().length - 1) this.focusChip(index + 1);
        else this.focusInput();
        break;
      case 'Home':
        event.preventDefault();
        this.focusChip(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusChip(this.value().length - 1);
        break;
      case 'Backspace':
        // Two deletion keys with different focus outcomes: hold Backspace to
        // eat backwards, Delete to eat forwards, without the cursor jumping.
        event.preventDefault();
        this.removeAt(index, 'left');
        break;
      case 'Delete':
        event.preventDefault();
        this.removeAt(index, 'right');
        break;
      case 'Enter':
      case 'F2':
        event.preventDefault();
        this.editChip(index);
        break;
      case 'Escape':
        event.preventDefault();
        this.focusInput();
        break;
      default:
        // A printable key means the user wants to type, not navigate chips.
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          this.setDraft(this.draft() + event.key);
          this.focusInput();
        }
    }
  }

  /** Lift a chip back into the input for correction. */
  protected editChip(index: number): void {
    const item = this.value()[index];
    if (!item || item.disabled) return;

    this.value.update((items) => items.filter((_, i) => i !== index));
    this.removed.emit(item);
    const text = item.label && item.label !== item.value ? `${item.label} <${item.value}>` : item.value;
    this.setDraft(text);
    this.focusInput();
  }

  protected selectSuggestion(suggestion: UniTagSuggestion): void {
    this.commit(suggestion.value);
    this.setDraft('');
    this.list.hide();
    this.focusInput();
  }

  private commitDraft(): void {
    if (this.commit(this.draft())) this.setDraft('');
    else this.setDraft('');
    this.list.hide();
  }

  private setDraft(text: string): void {
    this.draft.set(text);
    const input = this.inputRef?.().nativeElement;
    if (input) input.value = text;
  }

  // --- Styling -------------------------------------------------------------

  /** The host is the popup's anchor — the box the list mirrors the width of,
      and the one its entry animation is measured against. The wrapper below
      has the same geometry but is only the fallback's positioning context. */
  protected readonly className = computed(() => css({ display: 'block', ...this.anchor.style }));

  protected readonly wrapperClass = computed(() => css({ position: 'relative' }));

  /**
   * The shared field chrome, from the same `input` theme entry
   * `uni-input-box` resolves — not a duplicate token, because the inset has to
   * match every other field or a chip field stops lining up with the text
   * field above it.
   */
  private readonly fieldChrome = this.theme.getComponentOptions<UniInputBoxOptions>('input');

  protected readonly fieldClass = computed(() => {
    const options = this.componentOptions();
    return css({
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      // Wrapped chip rows keep clear of the field border; one 24px chip row
      // plus this padding fills the themed 32px minimum exactly.
      ...this.theme.paddingTop('xs'),
      ...this.theme.paddingBottom('xs'),
      // The leading inset lives here rather than on the inner <input> (see
      // `managedInset`): the chips are this field's leading edge, and an inset
      // on the text alone leaves the first chip riding the border.
      ...this.theme.paddingLeft(this.fieldChrome().paddingLeft),
      ...this.theme.gap(options.chipGap),
    });
  });

  protected readonly inputClass = computed(() =>
    css({
      flex: 1,
      minWidth: this.componentOptions().minInputWidth ?? '12ch',
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      padding: 0,
    })
  );

  protected readonly listClass = computed(() =>
    css(listboxPopupStyles(this.theme, this.componentOptions(), { anchor: this.anchor.name }))
  );
}
