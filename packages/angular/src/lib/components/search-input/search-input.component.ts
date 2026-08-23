import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { createListboxNavigation } from '../../cdk';
import { UniDebounceInputComponent } from '../forms/debounce-input/debounce-input.component';
import {
  listboxPopupAttr,
  listboxPopupStyles,
  newListboxAnchor,
  promoteListboxPopup,
} from '../forms/listbox-popup';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniSymbolComponent } from '../symbol';
import type { UniSearchInputOptions } from './search-input.model';

/**
 * Generic search field: shared input chrome with a leading magnifier, a clear
 * button while there's a query, Enter to submit, and optional type-ahead —
 * pass `suggestions` (refresh them from `change`) and the field becomes an
 * ARIA combobox with a keyboard-navigable listbox. Escape closes the list
 * first, then clears the query.
 */
@Component({
  selector: 'uni-search-input',
  imports: [UniDebounceInputComponent, UniIconButtonComponent, UniSymbolComponent],
  templateUrl: './search-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'searchInput' }],
  host: { '[class]': 'className()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSearchInputComponent extends BaseComponent<UniSearchInputOptions> {
  /** Accessible name for the field, also the placeholder fallback. */
  label = input.required<string>();
  placeholder = input<string>();
  width = input<string | number>('100%');
  debounceTime = input(400);
  /**
   * Type-ahead entries. Keep them fresh from `change` emissions; the list
   * shows while the field has focus and entries exist.
   */
  suggestions = input<string[]>([]);

  /** The debounced query, emitted as the user types. */
  searchChange = output<string>();
  /** A committed search: Enter, or a suggestion chosen from the list. */
  searchSubmit = output<string>();
  suggestionSelected = output<string>();

  protected readonly field = viewChild.required(UniDebounceInputComponent);
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listbox');

  /** Ties the popup to the field so the browser tracks it in the top layer. */
  private readonly anchor = newListboxAnchor();
  /** `manual` where the top layer is usable, else null — see the popup helper. */
  protected readonly popupAttr = listboxPopupAttr();

  constructor() {
    super();
    promoteListboxPopup(this.listRef);
  }

  protected readonly visibleSuggestions = computed(() =>
    this.suggestions().slice(0, this.componentOptions().maxSuggestions ?? 8)
  );

  /** Shared combobox bookkeeping: open state, active option, ARIA ids. */
  protected readonly list = createListboxNavigation({
    count: () => this.visibleSuggestions().length,
    idPrefix: 'uni-search-listbox',
  });

  readonly listboxId = this.list.listboxId;

  protected readonly hasQuery = computed(() => !!this.field()?.value());

  protected handleChange(value: string) {
    this.list.show();
    this.list.setActive(-1);
    this.searchChange.emit(value);
  }

  protected submit() {
    const active = this.list.activeIndex();
    if (this.list.open() && active >= 0) {
      this.select(this.visibleSuggestions()[active]);
      return;
    }
    this.list.hide();
    this.searchSubmit.emit(this.field().value() ?? '');
  }

  protected select(suggestion: string) {
    this.field().value.set(suggestion);
    this.list.hide();
    this.suggestionSelected.emit(suggestion);
    this.searchSubmit.emit(suggestion);
  }

  protected clear() {
    this.field().clear();
    this.list.hide();
    this.field().focus();
  }

  protected onKeydown(event: KeyboardEvent) {
    // Arrows and Home/End belong to the shared listbox contract.
    if (this.list.navigate(event)) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.submit();
        break;
      case 'Escape':
        // Escape backs out one layer at a time: close the list, then clear.
        if (this.list.open()) this.list.hide();
        else if (this.hasQuery()) this.clear();
        break;
    }
  }

  protected onFocusOut(event: FocusEvent) {
    this.list.closeOnFocusOut(event);
  }

  protected readonly className = computed(() =>
    css({
      display: 'block',
      position: 'relative',
      width: this.width(),
      ...this.anchor.style,
      '& .uni-search-lead': {
        fontSize: 20,
        ...this.theme.color('on-background-variant'),
        ...this.theme.paddingLeft('sm'),
      },
    })
  );

  protected readonly listClass = computed(() =>
    css(listboxPopupStyles(this.theme, this.componentOptions(), { anchor: this.anchor.name }))
  );
}
