import { UniCheckboxComponent } from './checkbox/checkbox.component';
import { UniComboboxComponent } from './combobox/combobox.component';
import { UniDateInputComponent } from './date-input/date-input.component';
import { UniDateTimeInputComponent } from './date-time-input/date-time-input.component';
import { UniInputBoxComponent } from './input-box/input-box.component';
import { UniInputComponent } from './input/input.component';
import { UniBoxDirective } from './layout/box/box.directive';
import { UniCenterDirective } from './layout/center/center.directive';
import { UniGridAreaDirective } from './layout/grid/grid-area/grid-area.directive';
import { UniGridDirective } from './layout/grid/grid.directive';
import { UniRowDirective } from './layout/row/row.directive';
import { UniStackDirective } from './layout/stack/stack.directive';
import { UniWrapDirective } from './layout/wrap/wrap.directive';
import { UniMultiSelectDropdownComponent } from './multi-select-dropdown/multi-select-dropdown.component';
import { UniMultiSelectComponent } from './multi-select/multi-select.component';
import { UniRadioComponent } from './radio/radio.component';
import { UniSearchInputComponent } from './search-input/search-input.component';
import { UniSelectComponent } from './select-input/select-input.component';
import { UniSliderComponent } from './slider/slider.component';
import { UniTagInputComponent } from './tag-input/tag-input.component';
import { UniTextDirective } from './text/text.directive';
import { UniTextareaComponent } from './textarea/textarea.component';
import { UniTimeInputComponent } from './time-input/time-input.component';
import { UniToggleComponent } from './toggle/toggle.component';

/**
 * Every layout and typography attribute directive, for
 * `imports: [...UNI_LAYOUT]`.
 *
 * These are attribute selectors, so an element carrying one that was never
 * imported compiles cleanly and silently does nothing. Spreading the family is
 * the cheapest way not to hit that.
 */
export const UNI_LAYOUT = [
  UniBoxDirective,
  UniRowDirective,
  UniStackDirective,
  UniCenterDirective,
  UniWrapDirective,
  UniGridDirective,
  UniGridAreaDirective,
  UniTextDirective,
] as const;

/** Every form control, for `imports: [...UNI_FORMS]`. */
export const UNI_FORMS = [
  UniInputComponent,
  UniInputBoxComponent,
  UniTextareaComponent,
  UniSelectComponent,
  UniCheckboxComponent,
  UniRadioComponent,
  UniToggleComponent,
  UniComboboxComponent,
  UniMultiSelectComponent,
  UniMultiSelectDropdownComponent,
  UniSearchInputComponent,
  UniTagInputComponent,
  UniSliderComponent,
  UniDateInputComponent,
  UniTimeInputComponent,
  UniDateTimeInputComponent,
] as const;
