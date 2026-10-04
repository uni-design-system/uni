import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
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
import { UniAvatarComponent } from '../avatar/avatar.component';
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
import { UniTagSuggestionDirective } from './tag-suggestion.directive';

/** A rendered popup row: a group heading, or an option with its option index. */
type SuggestionRow =
  | { kind: 'heading'; key: string; text: string }
  | { kind: 'option'; key: string; index: number; suggestion: UniTagSuggestion };

/** What became of a typed token. `invalid` only occurs under `keepInvalidText`. */
type CommitResult = 'added' | 'refused' | 'invalid';

/** Loose address check — deliberately permissive, matching what mail clients accept. */
export const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;.]+\.[^\s@,;]+$/;

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
  imports: [NgTemplateOutlet, UniAvatarComponent, UniInputBoxComponent, UniTagComponent],
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
  /**
   * Angular 22 marks the bound field touched through this output; the
   * `touched` model above is bound inward by the directive and no longer
   * propagates back out. Emitted wherever this control already decided
   * the user was done with it.
   */
  readonly touch = output<void>();
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
  /**
   * Maximum number of tags. Declared as the contract's `maxLength` — for an
   * array value that is exactly what it means, and Angular 22 types it as a
   * number — while staying `[max]` in templates.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the alias keeps the public binding name while the class member steps aside from Angular 22's FormValueControl, which reserves it for the value type
  maxLength = input<number | undefined>(undefined, { alias: 'max' });
  validate = input<(raw: string) => boolean>();
  parse = input<(pasted: string) => string[]>();

  /**
   * Drop the field chrome (border, fill, inset) and render the bare chip row —
   * an email client's To line. The surrounding layout draws any hairline and
   * focus cue; the error state is still exposed through `aria-invalid`.
   */
  unframed = input(false, { transform: booleanAttribute });
  /**
   * Backspace in an empty field removes the last tag outright, as mail
   * clients do. Off by default: the two-step (focus the chip, then remove)
   * never deletes blind.
   */
  backspaceRemoves = input(false);
  /**
   * Refuse a draft that fails validation instead of committing it as a
   * flagged chip: the text stays in the field to be fixed and `rejected`
   * fires with `reason: 'invalid'`.
   */
  keepInvalidText = input(false);

  /**
   * The text field's `autocomplete` token. The field has its own suggestion
   * list, so browser autofill is off by default and password managers are
   * told to skip it. Chrome can still ignore `off` on a field it takes for an
   * email or address; pass another token if its dropdown competes with yours.
   */
  autocomplete = input('off');

  // Chip presentation, forwarded to uni-tag. Unbound, each falls back to the
  // theme's `chipVariant` / `chipTone` / `chipSize`.
  tagVariant = input<Variant>();
  tagTone = input<TagTone>();
  tagSize = input<Size>();

  // --- Autocomplete (same contract as uni-search-input: the app filters) ----
  suggestions = input<UniTagSuggestion[]>([]);
  /** Debounced text the app should filter `suggestions` from. */
  query = output<string>();
  debounceTime = input(250);
  /** Show the suggestions on focus and on click, before anything is typed. */
  openOnFocus = input(false);
  /**
   * Keep the first suggestion active while the list is open, so Enter or Tab
   * picks it without arrowing. A draft that is already valid under the
   * field's validator still commits as typed.
   */
  autoHighlight = input(false);

  /** Uncommitted text, on every change and undebounced (cf. `query`). */
  draftChange = output<string>();

  // --- Events --------------------------------------------------------------
  added = output<UniTagItem>();
  removed = output<UniTagItem>();
  rejected = output<UniTagRejection>();

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly chipRefs = viewChildren<ElementRef<HTMLElement>>('chip');
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listbox');
  /** Optional `<ng-template uniTagSuggestion>` replacing a row's content. */
  protected readonly rowTemplate = contentChild(UniTagSuggestionDirective);

  /** Ties the popup to the field so the browser tracks it in the top layer. */
  private readonly anchor = newListboxAnchor();
  /** `manual` where the top layer is usable, else null — see the popup helper. */
  protected readonly popupAttr = listboxPopupAttr();

  constructor() {
    super();
    // A late tick would emit on a destroyed OutputRef.
    inject(DestroyRef).onDestroy(() => clearTimeout(this.queryTimer));
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
  /** The active row was highlighted by `autoHighlight`, not chosen by arrow keys. */
  private autoActive = false;

  protected readonly visibleSuggestions = computed(() => {
    const taken = new Set(this.value().map((item) => item.value));
    return this.suggestions()
      .filter((suggestion) => this.allowDuplicates() || !taken.has(suggestion.value))
      .slice(0, this.componentOptions().maxSuggestions ?? 8);
  });

  /** The options with a heading before the first of each run sharing a group.
      Headings sit outside the option sequence, so option indexes — and with
      them the ids and the active index — count options only. */
  protected readonly rows = computed<SuggestionRow[]>(() => {
    const rows: SuggestionRow[] = [];
    let group: string | undefined;
    this.visibleSuggestions().forEach((suggestion, index) => {
      if (suggestion.group && suggestion.group !== group) {
        rows.push({ kind: 'heading', key: `heading:${index}`, text: suggestion.group });
      }
      group = suggestion.group;
      rows.push({ kind: 'option', key: suggestion.value, index, suggestion });
    });
    return rows;
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

  protected readonly hint = computed(() =>
    this.backspaceRemoves()
      ? 'Press Backspace in an empty field to remove the last entry.'
      : 'Press Backspace to reach the last entry, then Backspace again to remove it.'
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

    const pattern =
      this.preset() === 'email'
        ? /[,;\n\t]+/
        : new RegExp(
            `[${this.separators()
              .map((s) => `\\${s}`)
              .join('')}\n\t]+`
          );
    return raw.split(pattern);
  }

  private isValid(candidate: string): boolean {
    const custom = this.validate();
    if (custom) return custom(candidate);
    return this.preset() === 'email' ? EMAIL_PATTERN.test(candidate) : true;
  }

  /** The canonical value (and display name) a typed token stands for. */
  private candidateOf(raw: string): { value: string; label?: string } {
    const trimmed = raw.trim();
    return this.preset() === 'email' ? unwrapAddress(trimmed) : { value: trimmed };
  }

  /**
   * Turn typed text into a chip. Invalid entries are kept and flagged rather
   * than dropped — unless `keepInvalidText` refuses them — and duplicates and
   * over-max are refused with a reason.
   */
  protected commit(raw: string): CommitResult {
    const trimmed = raw.trim();
    if (!trimmed) return 'refused';

    const { value: candidate, label } = this.candidateOf(trimmed);
    if (!candidate) return 'refused';

    const current = this.value();
    if (!this.allowDuplicates() && current.some((item) => item.value === candidate)) {
      this.reject(candidate, 'duplicate');
      return 'refused';
    }

    const max = this.maxLength();
    if (max !== undefined && current.length >= max) {
      this.reject(candidate, 'max');
      return 'refused';
    }

    const valid = this.isValid(candidate);
    if (!valid && this.keepInvalidText()) {
      this.reject(trimmed, 'invalid');
      return 'invalid';
    }

    const match = this.suggestions().find((suggestion) => suggestion.value === candidate);
    const item: UniTagItem = {
      value: candidate,
      ...(label || match?.label ? { label: label ?? match?.label } : {}),
      ...(match?.avatarSrc ? { avatarSrc: match.avatarSrc } : {}),
      ...(match?.avatarName ? { avatarName: match.avatarName } : {}),
      ...(valid ? {} : { invalid: true }),
    };

    this.value.update((items) => [...items, item]);
    this.added.emit(item);
    this.announcer.announce(
      `${this.labelOf(item)} added. ${this.value().length} ${this.countNoun()}.`
    );
    return 'added';
  }

  private reject(raw: string, reason: UniTagRejection['reason']): void {
    this.rejected.emit({ raw, reason });
    // The visual cue is a brief pulse a screen reader cannot see.
    const messages: Record<UniTagRejection['reason'], string> = {
      duplicate: `${raw} is already added.`,
      max: `${raw} was not added: limit reached.`,
      invalid: `${raw} is not valid.`,
    };
    this.announcer.announce(messages[reason]);
  }

  protected removeAt(index: number, focus: 'left' | 'right' | 'input' = 'input'): void {
    const item = this.value()[index];
    if (!item || item.disabled) return;

    this.value.update((items) => items.filter((_, i) => i !== index));
    this.removed.emit(item);
    this.announcer.announce(
      `${this.labelOf(item)} removed. ${this.value().length} ${this.countNoun()}.`
    );

    const remaining = this.value().length;
    if (focus === 'left' && index > 0) this.focusChip(index - 1);
    else if (focus === 'right' && index < remaining) this.focusChip(index);
    else this.focusInput();
  }

  private countNoun(): string {
    return this.value().length === 1 ? 'item' : 'items';
  }

  // --- Focus ---------------------------------------------------------------

  /** Put the caret in the text field. */
  focus(): void {
    this.focusInput();
  }

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
    if (this.list.navigate(event)) {
      // The user chose this row; it now outranks whatever is typed.
      this.autoActive = false;
      return;
    }

    const input = this.inputRef().nativeElement;
    const empty = input.value === '';

    if (this.separatorKeys().includes(event.key) && !empty) {
      // Under `keepInvalidText` a space in text that is not yet a value is
      // just a space — "ada lo" is a search for a name, not a failed commit.
      if (event.key === ' ' && this.keepInvalidText() && !this.draftIsValid()) return;
      event.preventDefault();
      this.commitDraft();
      return;
    }

    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const picked = this.pickable();
        if (picked) this.selectSuggestion(picked);
        else this.commitDraft();
        break;
      }
      case 'Tab': {
        if (empty) break;
        const picked = this.autoHighlight() ? this.pickable() : undefined;
        if (picked) {
          // The highlighted suggestion completes what was typed; focus stays
          // so the next entry can follow.
          event.preventDefault();
          this.selectSuggestion(picked);
        } else if (this.commitDraft() === 'invalid') {
          // The refused text is still in the field — stay with it.
          event.preventDefault();
        }
        // Otherwise never trap: the draft is committed and focus moves on.
        break;
      }
      case 'Backspace':
        if (empty && this.value().length) {
          event.preventDefault();
          // Mail-client behaviour, or the default two-step: focus the last
          // chip rather than deleting blind — a second Backspace, now on the
          // chip, removes it.
          if (this.backspaceRemoves()) this.removeAt(this.value().length - 1);
          else this.focusChip(this.value().length - 1);
        }
        break;
      case 'ArrowLeft':
        if (input.selectionStart === 0 && this.value().length) {
          event.preventDefault();
          this.focusChip(this.value().length - 1);
        }
        break;
      case 'Escape':
        if (this.list.open()) {
          // One layer at a time: the list closes, an enclosing dialog waits.
          event.preventDefault();
          event.stopPropagation();
          this.list.hide();
        } else this.setDraft('');
        break;
    }
  }

  /** Whether the draft would commit as a valid value under a real validator. */
  private draftIsValid(): boolean {
    const hasValidator = !!this.validate() || this.preset() === 'email';
    const { value } = this.candidateOf(this.draft());
    return hasValidator && !!value && this.isValid(value);
  }

  /**
   * The suggestion Enter or Tab should pick, if any: the active row — except
   * that a row highlighted automatically yields to a draft that is itself a
   * valid value (a typed address is not replaced by the first match).
   */
  private pickable(): UniTagSuggestion | undefined {
    const active = this.list.activeIndex();
    if (!this.list.open() || active < 0) return undefined;
    if (this.autoActive && this.draftIsValid()) return undefined;
    return this.visibleSuggestions()[active];
  }

  /** Show the list with the highlight where `autoHighlight` puts it. */
  private openList(): void {
    this.list.show();
    this.autoActive = this.autoHighlight();
    this.list.setActive(this.autoActive ? 0 : -1);
  }

  /** Focus, and a click into an already-focused field after Escape. */
  protected onFieldFocus(): void {
    if (!this.openOnFocus() || this.disabled() || this.list.open()) return;
    if (this.visibleSuggestions().length) this.openList();
  }

  protected onInput(value: string): void {
    this.setDraft(value);
    this.openList();

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

    // Under `keepInvalidText` a refused fragment stays in the field to be fixed.
    const kept = tokens.filter((token) => this.commit(token) === 'invalid').map((t) => t.trim());
    this.setDraft([...kept, tail.trim()].filter(Boolean).join(' '));
  }

  /** A press on any blank part of the field — beside the chips, under a
      wrapped row, in space the layout stretched it into — lands in the input. */
  protected onFieldMousedown(event: MouseEvent): void {
    if (this.disabled()) return;
    const target = event.target as HTMLElement;
    if (target.closest('uni-tag, input, [role="listbox"]')) return;
    event.preventDefault();
    this.inputRef().nativeElement.focus();
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.touch.emit();
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
    const text =
      item.label && item.label !== item.value ? `${item.label} <${item.value}>` : item.value;
    this.setDraft(text);
    this.focusInput();
  }

  protected selectSuggestion(suggestion: UniTagSuggestion): void {
    this.commit(suggestion.value);
    this.setDraft('');
    // An open-on-focus field keeps offering who is left; `open` is false
    // anyway once nothing is.
    if (this.openOnFocus()) this.openList();
    else this.list.hide();
    this.focusInput();
  }

  private commitDraft(): CommitResult {
    const result = this.commit(this.draft());
    if (result !== 'invalid') this.setDraft('');
    this.list.hide();
    return result;
  }

  private setDraft(text: string): void {
    const changed = text !== this.draft();
    this.draft.set(text);
    const input = this.inputRef?.().nativeElement;
    if (input) input.value = text;
    if (changed) this.draftChange.emit(text);
  }

  // --- Styling -------------------------------------------------------------

  /** The host is the popup's anchor — the box the list mirrors the width of,
      and the one its entry animation is measured against. The wrapper below
      has the same geometry but is only the fallback's positioning context. */
  protected readonly className = computed(() =>
    css({
      // A bare row takes whatever room its layout offers — beside a "To"
      // caption in a flex row it grows to the far edge, and stretches with it.
      ...(this.unframed()
        ? { display: 'flex', flex: '1 1 auto', minWidth: 0 }
        : { display: 'block' }),
      ...this.anchor.style,
    })
  );

  protected readonly wrapperClass = computed(() =>
    css({
      position: 'relative',
      ...(this.unframed()
        ? {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minWidth: 0,
            cursor: 'text',
          }
        : {}),
    })
  );

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
      // on the text alone leaves the first chip riding the border. A bare
      // row has no border to keep clear of.
      ...(this.unframed() ? {} : this.theme.paddingLeft(this.fieldChrome().paddingLeft)),
      ...this.theme.gap(options.chipGap),
      cursor: 'text',
      // Fill a stretched bare row, so the chips stay centred in it.
      ...(this.unframed() ? { flex: '1 1 auto' } : {}),
    });
  });

  /** The cell after the chips: takes the rest of the row, never a sliver. */
  protected readonly inputCellClass = computed(() =>
    css({
      display: 'flex',
      flex: 1,
      minWidth: this.componentOptions().minInputWidth ?? '12ch',
    })
  );

  protected readonly inputClass = computed(() =>
    css({
      // Fills its cell — an <input> otherwise keeps its intrinsic width and
      // leaves dead space beside it.
      flex: 1,
      width: '100%',
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      padding: 0,
    })
  );

  protected readonly listClass = computed(() =>
    css([
      listboxPopupStyles(this.theme, this.componentOptions(), { anchor: this.anchor.name }),
      {
        // The default row: optional avatar, label, description under it.
        '& .uni-tag-suggestion': { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
        '& .uni-tag-suggestion-text': { display: 'flex', flexDirection: 'column', minWidth: 0 },
        '& .uni-tag-suggestion-description': { opacity: 0.75 },
      },
    ])
  );
}
