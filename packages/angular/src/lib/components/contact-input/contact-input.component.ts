import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Size, TagTone, Variant } from '@uni-design-system/uni-core';

import { UniAvatarComponent } from '../avatar/avatar.component';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { EMAIL_PATTERN, UniTagInputComponent } from '../tag-input/tag-input.component';
import type { UniTagItem, UniTagRejection, UniTagSuggestion } from '../tag-input/tag-input.model';
import { UniTagSuggestionDirective } from '../tag-input/tag-suggestion.directive';
import type { UniContact, UniContactInputOptions } from './contact-input.model';

/**
 * Recipient field for picking people: removable chips, a text input, and a
 * list of known contacts that opens on focus and narrows as the user types —
 * each row drawn as a person (avatar, name, address, a trailing note).
 *
 * A thin composition of `uni-tag-input` with a mail client's manners baked
 * in: ArrowDown walks the matches and Enter picks the active one, Backspace
 * in an empty field removes the last person, and text that is neither a known
 * contact nor a valid address stays in the field to be fixed (`rejected`
 * says why). Reach for `uni-tag-input` itself when the tokens are not people.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-contact-input, ContactInput',
  imports: [UniAvatarComponent, UniTagInputComponent, UniTagSuggestionDirective],
  templateUrl: './contact-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'contactInput' }],
  host: { '[class]': 'className()' },
})
export class UniContactInputComponent
  extends BaseComponent<UniContactInputOptions>
  implements FormValueControl<UniContact[]>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniContact[]>([]);
  readonly disabled = input(false);
  readonly touched = model(false);
  /** Angular 22 marks the bound field touched through this output. */
  readonly touch = output<void>();
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name for the field, e.g. "To". */
  label = input.required<string>();
  placeholder = input<string>();
  /** Everyone who can be suggested, in the order (and groups) to offer them. */
  contacts = input<UniContact[]>([]);
  /**
   * Accept a typed value that is not a known contact. On by default — a typed
   * email address becomes a chip; `false` restricts the field to `contacts`.
   */
  allowCustom = input(true);
  /** What a typed value must satisfy under `allowCustom`. Defaults to an email address. */
  validate = input<(raw: string) => boolean>();
  /**
   * `false` renders `contacts` verbatim; narrow them app-side from `(query)`
   * when the directory lives on a server.
   */
  filterLocally = input(true);
  /**
   * Keep the first match highlighted so Enter or Tab picks it without
   * arrowing. Off by default: nothing is highlighted until ArrowDown, and
   * Enter commits what is typed.
   */
  autoHighlight = input(false);
  debounceTime = input(250);
  /** Maximum number of people; `[max]` in templates (see `uni-tag-input`). */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the alias keeps the public binding name while the class member steps aside from Angular 22's FormValueControl, which reserves it for the value type
  maxLength = input<number | undefined>(undefined, { alias: 'max' });
  /** Drop the field chrome and render a bare row — an email client's To line. */
  unframed = input(false, { transform: booleanAttribute });
  /** The text field's `autocomplete` token; see `uni-tag-input`. */
  autocomplete = input('off');

  // Chip presentation, forwarded to uni-tag. Unbound, each falls back to the
  // `tagInput` theme entry's `chipVariant` / `chipTone` / `chipSize`.
  tagVariant = input<Variant>();
  tagTone = input<TagTone>();
  tagSize = input<Size>();

  // --- Events --------------------------------------------------------------
  added = output<UniContact>();
  removed = output<UniContact>();
  /** Typed text that did not become a person; an `invalid` one stays in the field. */
  rejected = output<UniTagRejection>();
  /** Debounced typed text, for loading contacts remotely. */
  query = output<string>();
  /** Typed text on every change — e.g. to clear an error once it is edited. */
  draftChange = output<string>();

  private readonly field = viewChild.required(UniTagInputComponent);

  /** Uncommitted text, mirrored from the inner field to filter by. */
  private readonly draft = signal('');

  private readonly known = computed(
    () => new Map(this.contacts().map((contact) => [contact.value, contact]))
  );

  private readonly selected = computed(
    () => new Map(this.value().map((contact) => [contact.value, contact]))
  );

  /** The value as the chips the inner field renders. */
  protected readonly items = computed<UniTagItem[]>(() =>
    this.value().map((contact) => ({
      value: contact.value,
      avatarName: contact.name || contact.value,
      ...(contact.name ? { label: contact.name } : {}),
      ...(contact.avatarSrc ? { avatarSrc: contact.avatarSrc } : {}),
      ...(contact.disabled ? { disabled: true } : {}),
    }))
  );

  /** Contacts matching the typed text by name, address or value. */
  protected readonly suggestions = computed<UniTagSuggestion[]>(() => {
    const text = this.draft().trim().toLowerCase();
    const matches = (contact: UniContact) =>
      [contact.name, contact.email, contact.value].some((part) =>
        part?.toLowerCase().includes(text)
      );
    return this.contacts()
      .filter((contact) => !this.filterLocally() || !text || matches(contact))
      .map((contact) => ({
        value: contact.value,
        avatarName: contact.name || contact.value,
        ...(contact.name ? { label: contact.name } : {}),
        ...(contact.avatarSrc ? { avatarSrc: contact.avatarSrc } : {}),
        ...(contact.group ? { group: contact.group } : {}),
      }));
  });

  /** A known contact always commits; anything else only under `allowCustom`. */
  protected readonly accepts = (raw: string): boolean => {
    if (this.known().has(raw)) return true;
    if (!this.allowCustom()) return false;
    return this.validate()?.(raw) ?? EMAIL_PATTERN.test(raw);
  };

  /** Put the caret in the field. */
  focus(): void {
    this.field().focus();
  }

  /** The person a chip or a suggestion stands for. */
  protected contactOf(item: UniTagItem | UniTagSuggestion): UniContact {
    return (
      this.selected().get(item.value) ??
      this.known().get(item.value) ?? {
        value: item.value,
        ...(item.label ? { name: item.label } : {}),
      }
    );
  }

  /** The line under the name: the address, when there is a name above it. */
  protected detailOf(contact: UniContact): string | undefined {
    return contact.email ?? (contact.name ? contact.value : undefined);
  }

  protected onItems(items: UniTagItem[]): void {
    this.value.set(items.map((item) => this.contactOf(item)));
  }

  protected onTouch(): void {
    this.touched.set(true);
    this.touch.emit();
  }

  protected onDraft(text: string): void {
    this.draft.set(text);
    this.draftChange.emit(text);
  }

  // --- Styling -------------------------------------------------------------

  protected readonly className = computed(() =>
    // A bare row grows into the room its layout offers; the inner field fills it.
    css(this.unframed() ? { display: 'flex', flex: '1 1 auto', minWidth: 0 } : { display: 'block' })
  );

  protected readonly rowClass = computed(() => {
    const options = this.componentOptions();
    const truncate = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
    return css({
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
      ...this.theme.gap(options.rowGap ?? 'sm'),
      '& .uni-contact-text': { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
      '& .uni-contact-line': { display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 },
      '& .uni-contact-name': {
        ...this.theme.typeface(options.nameTypeface ?? 'body-2-short'),
        ...truncate,
      },
      // Asides inherit the row's ink — which flips with the active fill — and
      // step back by opacity, so they stay legible on either surface.
      '& .uni-contact-note, & .uni-contact-detail': {
        ...this.theme.typeface(options.detailTypeface ?? 'caption'),
        opacity: 0.7,
      },
      '& .uni-contact-note': { flex: 'none' },
      '& .uni-contact-detail': truncate,
    });
  });
}
