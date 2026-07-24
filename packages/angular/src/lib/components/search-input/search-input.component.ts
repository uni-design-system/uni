import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { uniqueId } from '../../cdk';
import { UniDebounceInputComponent } from '../forms/debounce-input/debounce-input.component';
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

  // TODO(v4): rename to searchChange/searchSubmit — renaming is breaking
  // eslint-disable-next-line @angular-eslint/no-output-native
  change = output<string>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  search = output<string>();
  suggestionSelected = output<string>();

  protected readonly field = viewChild.required(UniDebounceInputComponent);

  readonly listboxId = uniqueId('uni-search-listbox');
  protected readonly listOpen = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly visibleSuggestions = computed(() =>
    this.suggestions().slice(0, this.componentOptions().maxSuggestions ?? 8)
  );

  protected readonly showList = computed(
    () => this.listOpen() && this.visibleSuggestions().length > 0
  );

  protected readonly activeOptionId = computed(() =>
    this.activeIndex() >= 0 ? `${this.listboxId}-${this.activeIndex()}` : undefined
  );

  protected readonly hasQuery = computed(() => !!this.field()?.value());

  protected handleChange(value: string) {
    this.listOpen.set(true);
    this.activeIndex.set(-1);
    this.change.emit(value);
  }

  protected submit() {
    const active = this.activeIndex();
    if (this.showList() && active >= 0) {
      this.select(this.visibleSuggestions()[active]);
      return;
    }
    this.listOpen.set(false);
    this.search.emit(this.field().value() ?? '');
  }

  protected select(suggestion: string) {
    this.field().value.set(suggestion);
    this.listOpen.set(false);
    this.activeIndex.set(-1);
    this.suggestionSelected.emit(suggestion);
    this.search.emit(suggestion);
  }

  protected clear() {
    this.field().clear();
    this.listOpen.set(false);
    this.activeIndex.set(-1);
    this.field().focus();
  }

  protected onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.submit();
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        const count = this.visibleSuggestions().length;
        if (count === 0) return;
        event.preventDefault();
        this.listOpen.set(true);
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        this.activeIndex.set((this.activeIndex() + delta + count) % count);
        break;
      }
      case 'Escape':
        if (this.showList()) this.listOpen.set(false);
        else if (this.hasQuery()) this.clear();
        break;
    }
  }

  protected onFocusOut(event: FocusEvent) {
    // Close unless focus moved somewhere inside the component.
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.listOpen.set(false);
    }
  }

  protected readonly className = computed(() =>
    css({
      display: 'block',
      position: 'relative',
      width: this.width(),
      '& .uni-search-lead': {
        fontSize: 20,
        ...this.theme.color('on-background-variant'),
        ...this.theme.paddingLeft('sm'),
      },
    })
  );

  protected readonly listClass = computed(() => {
    const options = this.componentOptions();
    return css({
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 20,
      margin: '4px 0 0',
      padding: 4,
      listStyle: 'none',
      maxHeight: 280,
      overflowY: 'auto',
      ...this.theme.backgroundColor(options.listColor ?? 'primary-surface'),
      ...this.theme.boxShadow(options.listShadow ?? 'menu'),
      ...this.theme.radius(options.listBorderRadius ?? 'xs'),
      '& [role="option"]': {
        padding: '8px 12px',
        cursor: 'pointer',
        ...this.theme.typeface('label'),
        ...this.theme.color('on-primary-surface'),
        ...this.theme.radius('xxs'),
        '&.active, &:hover': {
          ...this.theme.backgroundColor('primary-container'),
          ...this.theme.color('on-primary-container'),
        },
      },
    });
  });
}
