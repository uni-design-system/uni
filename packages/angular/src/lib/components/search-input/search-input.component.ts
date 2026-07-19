import { Component, HostBinding, input, output } from '@angular/core';
import { css } from '@emotion/css';
import { UniDebounceInputComponent } from '../forms/debounce-input/debounce-input.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniBoxComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  selector: 'SearchInput, uni-search-input',
  standalone: true,
  imports: [UniDebounceInputComponent, UniTextComponent, UniBoxComponent, UniIconButtonComponent],
  templateUrl: './search-input.component.html',
})
export class UniSearchInputComponent {
  label = input.required<string>();
  width = input<string | number>('100%');

  // TODO(v4): rename to searchChange/searchSubmit — renaming is breaking
  // eslint-disable-next-line @angular-eslint/no-output-native
  change = output<string>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  search = output<string>();

  @HostBinding('class') get className() {
    return css([
      {
        display: 'flex',
        alignItems: 'center',
      },
    ]);
  }

  handleSearchInput(searchInput: string) {
    this.change.emit(searchInput);
  }

  handleSearch(searchInput: string | undefined) {
    this.search.emit(searchInput ?? '');
  }
}
