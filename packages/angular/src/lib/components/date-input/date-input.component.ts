import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  addDays,
  formatDate,
  localeDatePlaceholder,
  monthOf,
  parseDateText,
  todayIso,
  visuallyHidden,
  type UniDate,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniCalendarComponent } from '../calendar/calendar.component';
import type { UniCalendarMarker } from '../calendar/calendar.model';
import { UniDropdownComponent } from '../dropdown/dropdown.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniDateInputOptions, UniDateInputRejection } from './date-input.model';

/**
 * Date field with free-typed parsing and a popup calendar. Type `aug 20`,
 * `8/20/2026` or `2026-08-20`, or pick from the grid — the form gets the
 * same canonical `'YYYY-MM-DD'` string either way. Parsing is `Intl`-driven
 * (locale digit order and month names, never hardcoded); unreadable text
 * stays in the field, flagged, with a `rejected` event. The popup is a
 * native popover hosting the same `uni-calendar` an app could render inline.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-date-input, DateInput',
  imports: [
    NgTemplateOutlet,
    UniCalendarComponent,
    UniDropdownComponent,
    UniIconButtonComponent,
    UniInputBoxComponent,
  ],
  templateUrl: './date-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dateInput' }],
  host: { '[class]': 'className()' },
})
export class UniDateInputComponent
  extends BaseComponent<UniDateInputOptions>
  implements FormValueControl<UniDate | undefined>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniDate | undefined>();
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name for the field, e.g. "Appointment date". */
  label = input.required<string>();
  /** Defaults to the locale's digit pattern, e.g. `MM/DD/YYYY`. */
  placeholder = input<string>();
  /** How the committed value renders, e.g. `{ dateStyle: 'long' }`. */
  displayFormat = input<Intl.DateTimeFormatOptions>({ dateStyle: 'medium' });
  /** BCP 47 tag; defaults to the document language, then the browser's. */
  locale = input<string>();
  commitOnBlur = input(true);
  /** Custom parser, replacing the built-in ISO/locale/month-name parsing. */
  parse = input<(raw: string, locale: string) => UniDate | null>();
  /** Renders without its own input-box chrome, for composers like uni-date-time-input. */
  embedded = input(false);

  // --- Forwarded to the popup calendar --------------------------------------
  minDate = input<UniDate>();
  maxDate = input<UniDate>();
  disabledDates = input<UniDate[] | ((date: UniDate) => boolean)>();
  markers = input<UniCalendarMarker[]>([]);
  weekStart = input<0 | 1 | 2 | 3 | 4 | 5 | 6>();

  // --- Events ----------------------------------------------------------------
  /** Popup shown. */
  opened = output<void>();
  /** Popup hidden. */
  closed = output<void>();
  /** A typed commit was refused; the raw text stays in the field. */
  rejected = output<UniDateInputRejection>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('field');
  // #toggle sits on the icon-button component, so read the element explicitly.
  private readonly toggleRef = viewChild('toggle', { read: ElementRef });
  private readonly popupRef = viewChild<ElementRef<HTMLElement>>('popupDialog');
  private readonly dropdown = viewChild(UniDropdownComponent);
  private readonly calendar = viewChild(UniCalendarComponent);

  protected readonly srOnly = css(visuallyHidden);
  /** A refused commit — styles the field and sets aria-invalid until edited. */
  protected readonly draftInvalid = signal(false);
  protected readonly announcement = signal('');

  protected readonly toggleElement = computed(() => this.toggleRef()?.nativeElement);
  protected readonly popupOpen = computed(() => this.dropdown()?.showing() ?? false);

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? (document.documentElement.lang || navigator.language || 'en-US')
  );

  protected readonly displayText = computed(() => {
    const value = this.value();
    return value ? formatDate(value, this.resolvedLocale(), this.displayFormat()) : '';
  });

  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? localeDatePlaceholder(this.resolvedLocale())
  );

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly toggleLabel = computed(() => {
    const value = this.value();
    return value
      ? `Change date, ${formatDate(value, this.resolvedLocale(), { dateStyle: 'full' })}`
      : 'Choose date';
  });

  // --- Committing -------------------------------------------------------------

  private fullDate(date: UniDate): string {
    return formatDate(date, this.resolvedLocale(), { dateStyle: 'full' });
  }

  private isDayBlocked(date: UniDate): boolean {
    const dates = this.disabledDates();
    if (!dates) return false;
    return Array.isArray(dates) ? dates.includes(date) : dates(date);
  }

  protected setValue(date: UniDate | undefined, silent = false): void {
    this.value.set(date);
    this.draftInvalid.set(false);
    this.setFieldText(this.displayText());
    if (!silent) this.announce(date ? `${this.fullDate(date)}.` : 'Date cleared.');
  }

  private refuse(raw: string, reason: UniDateInputRejection['reason']): void {
    this.draftInvalid.set(true);
    const message = {
      unparseable: `Couldn't read “${raw}” as a date.`,
      'out-of-range': `${raw} is outside the allowed dates.`,
      disabled: `${raw} isn't available.`,
    }[reason];
    this.announce(message);
    this.rejected.emit({ raw, reason });
  }

  protected commit(raw: string): boolean {
    const trimmed = raw.trim();
    if (!trimmed) {
      this.setValue(undefined);
      return true;
    }
    const custom = this.parse();
    const parsed = custom
      ? custom(trimmed, this.resolvedLocale())
      : parseDateText(trimmed, this.resolvedLocale());
    if (!parsed) {
      this.refuse(trimmed, 'unparseable');
      return false;
    }
    const min = this.minDate();
    const max = this.maxDate();
    if ((min && parsed < min) || (max && parsed > max)) {
      this.refuse(trimmed, 'out-of-range');
      return false;
    }
    if (this.isDayBlocked(parsed)) {
      this.refuse(trimmed, 'disabled');
      return false;
    }
    this.setValue(parsed);
    return true;
  }

  /** Step a committed value ±1 day, skipping blocked days, stopping at fences. */
  private step(direction: 1 | -1): void {
    const committed = this.value();
    if (!committed) return;
    let date = addDays(committed, direction);
    let guard = 0;
    while (this.isDayBlocked(date) && guard++ < 400) date = addDays(date, direction);
    const min = this.minDate();
    const max = this.maxDate();
    if ((min && date < min) || (max && date > max)) return; // fence
    this.setValue(date);
  }

  // --- Keyboard ----------------------------------------------------------------

  protected onInputKeydown(event: KeyboardEvent): void {
    const element = this.inputRef()!.nativeElement;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.commit(element.value);
        break;
      case 'Escape':
        if (this.popupOpen()) {
          this.closePopup();
        } else {
          this.setFieldText(this.displayText());
          this.draftInvalid.set(false);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Alt or an empty field opens the popup; on a committed value the
        // caret has nowhere to go, so stepping is what a spinner would do.
        if (event.altKey || element.value.trim() === '') this.openPopup();
        else if (this.value() && element.value === this.displayText()) this.step(-1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.value() && element.value === this.displayText()) this.step(1);
        break;
    }
  }

  protected onInput(): void {
    this.draftInvalid.set(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.touched.set(true);
    if (this.popupOpen()) return;
    const element = this.inputRef()?.nativeElement;
    if (element && this.commitOnBlur() && element.value !== this.displayText())
      this.commit(element.value);
  }

  // --- Popup ---------------------------------------------------------------------

  protected openPopup(): void {
    if (this.disabled() || this.popupOpen()) return;
    this.dropdown()?.toggleDropdown();
  }

  protected closePopup(): void {
    if (this.popupOpen()) this.dropdown()?.hideDropdown();
  }

  protected onPopupShowing(): void {
    // The grid opens on the committed value's month (or today's). Falsy
    // guard: a bound '' counts as no value, like everywhere else.
    this.calendar()?.month.set(monthOf(this.value() || todayIso()));
    this.calendar()?.focusActiveDay();
    this.opened.emit();
  }

  protected onPopupHiding(): void {
    this.closed.emit();
    // Focus returns to the field (not the toggle) when it was in the popup —
    // this runs before the dropdown's own restoreFocus, which then no-ops.
    const active = document.activeElement;
    const popup = this.popupRef()?.nativeElement;
    if (!active || active === document.body || (popup && popup.contains(active)))
      this.inputRef()?.nativeElement.focus();
  }

  protected onCalendarPick(date: UniDate): void {
    this.setValue(date);
    this.closePopup();
  }

  /** The popup is a focus-holding dialog: Tab cycles inside it (APG pattern). */
  protected onPopupKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closePopup();
      return;
    }
    if (event.key !== 'Tab') return;
    const popup = this.popupRef()?.nativeElement;
    if (!popup) return;
    const focusables = Array.from(
      popup.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    ).filter((button) => button.tabIndex >= 0);
    if (!focusables.length) return;
    const index = focusables.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      focusables[(index + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
    event.preventDefault();
    next.focus();
  }

  // --- Internals -------------------------------------------------------------------

  private setFieldText(text: string): void {
    const element = this.inputRef()?.nativeElement;
    if (element) element.value = text;
  }

  private announce(message: string): void {
    this.announcement.set(this.announcement() === message ? `${message} ` : message);
  }

  // --- Styling -----------------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'block', position: 'relative' }));

  protected readonly rowClass = computed(() =>
    css({ display: 'flex', alignItems: 'center', flex: 1, width: '100%', minWidth: 0 })
  );

  protected readonly inputClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css([
      {
        flex: 1,
        minWidth: 0,
        border: 0,
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
      },
      this.draftInvalid() && {
        color: colors['warn'],
        // Shape and colour, not colour alone (WCAG 1.4.1).
        textDecoration: `underline dashed ${colors['warn']} 1.5px`,
        textUnderlineOffset: 3,
      },
    ]);
  });

  protected readonly toggleWrapClass = computed(() =>
    css({ display: 'flex', alignItems: 'center', ...this.theme.paddingRight('xxs') })
  );

  /** Embedded mode: the composer owns the box; keep only the flex row. */
  protected readonly embeddedClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css([
      { display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 },
      this.draftInvalid() && { color: colors['warn'] },
    ]);
  });
}
