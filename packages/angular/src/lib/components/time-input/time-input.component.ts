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
  createListboxNavigation,
  formatTime,
  localeDefaultHour12,
  parseTimeText,
  timeSlots,
  visuallyHidden,
  type UniTime,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { listboxPopupStyles } from '../forms/listbox-popup';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import type { UniTimeInputOptions, UniTimeInputRejection } from './time-input.model';

const toMinutes = (time: UniTime): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (minutes: number): UniTime =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Time field: a combobox over time options — the same listbox contract as
 * uni-search-input and uni-tag-input. Type `3p`, `930` or `15:00`, or pick
 * `3:00 PM` from the list; the form always gets 24-hour `'HH:mm'` (`hour12`
 * affects display only). The list is assistive, not exhaustive: any
 * parseable time commits, unless `slots` pins the choices (a slot picker) —
 * then a typed time must match one. Unreadable or unavailable text stays in
 * the field, flagged, with a `rejected` event.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-time-input, TimeInput',
  imports: [NgTemplateOutlet, UniIconButtonComponent, UniInputBoxComponent],
  templateUrl: './time-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'timeInput' }],
  host: { '[class]': 'className()' },
})
export class UniTimeInputComponent
  extends BaseComponent<UniTimeInputOptions>
  implements FormValueControl<UniTime | undefined>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniTime | undefined>();
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Accessible name for the field, e.g. "Start time". */
  label = input.required<string>();
  placeholder = input<string>();
  /** Generated list granularity, in minutes. */
  minuteStep = input(30);
  /** Earliest allowed time (inclusive), `'09:00'`. */
  minTime = input<UniTime>();
  /** Latest allowed time (inclusive), `'17:00'`. */
  maxTime = input<UniTime>();
  /** Exact allowed times (scheduling). When set, typed entry must match one. */
  slots = input<UniTime[]>();
  /** 12-hour display; defaults from the locale. The value stays 24-hour. */
  hour12 = input<boolean>();
  /** BCP 47 tag for the display format; defaults to the document language. */
  locale = input<string>();
  commitOnBlur = input(true);
  /** Renders without its own input-box chrome, for composers like uni-date-time-input. */
  embedded = input(false);

  // --- Events ----------------------------------------------------------------
  /** A typed commit was refused; the raw text stays in the field. */
  rejected = output<UniTimeInputRejection>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly listRef = viewChild<ElementRef<HTMLUListElement>>('listbox');

  protected readonly srOnly = css(visuallyHidden);
  /** A refused commit — styles the field and sets aria-invalid until edited. */
  protected readonly draftInvalid = signal(false);
  protected readonly announcement = signal('');

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? (document.documentElement.lang || navigator.language || 'en-US')
  );

  protected readonly resolvedHour12 = computed(
    () => this.hour12() ?? localeDefaultHour12(this.resolvedLocale())
  );

  /** The listed times: pinned `slots` verbatim, else the generated step grid. */
  protected readonly options = computed(
    () => this.slots() ?? timeSlots(this.minuteStep(), this.minTime(), this.maxTime())
  );

  protected readonly optionLabels = computed(() =>
    this.options().map((time) => this.formatValue(time))
  );

  /** Shared combobox bookkeeping — identical contract to uni-search-input. */
  protected readonly list = createListboxNavigation({
    count: () => this.options().length,
    idPrefix: 'uni-time-listbox',
  });

  protected readonly displayText = computed(() => {
    const value = this.value();
    return value ? this.formatValue(value) : '';
  });

  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.formatValue('09:00')
  );

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected formatValue(time: UniTime): string {
    return formatTime(time, this.resolvedLocale(), this.resolvedHour12());
  }

  // --- Committing -------------------------------------------------------------

  protected setValue(time: UniTime | undefined, silent = false): void {
    this.value.set(time);
    this.draftInvalid.set(false);
    this.setFieldText(this.displayText());
    if (!silent) this.announce(time ? `${this.formatValue(time)}.` : 'Time cleared.');
  }

  private refuse(raw: string, reason: UniTimeInputRejection['reason'], shown = raw): void {
    this.draftInvalid.set(true);
    const message = {
      unparseable: `Couldn't read “${shown}” as a time.`,
      'out-of-range': `${shown} is outside the allowed times.`,
      unavailable: `${shown} isn't available.`,
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
    let parsed = parseTimeText(trimmed, this.resolvedHour12());
    if (!parsed) {
      this.refuse(trimmed, 'unparseable');
      return false;
    }
    const min = this.minTime();
    const max = this.maxTime();
    const inBounds = (time: UniTime) => !(min && time < min) && !(max && time > max);
    const slots = this.slots();
    if (!slots && !inBounds(parsed)) {
      // The PM bias yields if it pushed the time out of bounds.
      const unbiased = parseTimeText(trimmed, false);
      if (unbiased && inBounds(unbiased)) parsed = unbiased;
      else {
        this.refuse(trimmed, 'out-of-range');
        return false;
      }
    }
    if (slots && !slots.includes(parsed)) {
      // Announce the formatted time — "5:00 PM isn't available."
      this.refuse(trimmed, 'unavailable', this.formatValue(parsed));
      return false;
    }
    this.setValue(parsed);
    return true;
  }

  /** Step a committed value ±minuteStep (±1 slot when pinned), clamped. */
  private stepValue(direction: 1 | -1): void {
    const committed = this.value();
    if (!committed) return;
    const slots = this.slots();
    if (slots?.length) {
      const sorted = [...slots].sort();
      const index = sorted.indexOf(committed);
      const next =
        index >= 0
          ? sorted[index + direction]
          : direction > 0
            ? sorted.find((slot) => slot > committed)
            : [...sorted].reverse().find((slot) => slot < committed);
      if (next) this.setValue(next);
      return;
    }
    const step = this.minuteStep();
    const current = toMinutes(committed);
    const snapped =
      direction > 0
        ? Math.floor(current / step) * step + step
        : Math.ceil(current / step) * step - step;
    if (snapped < 0 || snapped >= 24 * 60) return;
    const candidate = fromMinutes(snapped);
    const min = this.minTime();
    const max = this.maxTime();
    if ((min && candidate < min) || (max && candidate > max)) return; // fence
    this.setValue(candidate);
  }

  // --- Keyboard ----------------------------------------------------------------

  protected onInputKeydown(event: KeyboardEvent): void {
    const element = this.inputRef()!.nativeElement;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        // A committed value with the list closed steps like a spinner —
        // ArrowUp means later, like the date field's ArrowUp means tomorrow —
        // while the list opens from an empty or edited field (or the toggle).
        if (!this.list.open() && this.value() && element.value === this.displayText()) {
          this.stepValue(direction === 1 ? -1 : 1);
          break;
        }
        if (!this.list.open()) {
          this.openList();
          if (this.list.activeIndex() < 0)
            this.list.setActive(direction === 1 ? 0 : this.options().length - 1);
        } else {
          const count = this.options().length;
          this.list.setActive((this.list.activeIndex() + direction + count) % count);
        }
        this.scrollToActive();
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const active = this.list.activeIndex();
        if (this.list.open() && active >= 0) this.setValue(this.options()[active]);
        else this.commit(element.value);
        this.list.hide();
        break;
      }
      case 'Escape':
        if (this.list.open()) {
          this.list.hide();
        } else {
          this.setFieldText(this.displayText());
          this.draftInvalid.set(false);
        }
        break;
      case 'Tab':
        // Never trap: commit what is typed, then let focus move on.
        if (element.value.trim() && element.value !== this.displayText())
          this.commit(element.value);
        this.list.hide();
        break;
    }
  }

  protected onInput(): void {
    this.draftInvalid.set(false);
    // Typing never selects an option — Enter must commit the draft, not
    // whatever happens to sit nearest; the list only scrolls alongside.
    this.list.show();
    this.list.setActive(-1);
    const parsed = parseTimeText(this.inputRef()!.nativeElement.value, this.resolvedHour12());
    if (parsed) {
      const options = this.options();
      let nearest = options.findIndex((time) => time >= parsed);
      if (nearest < 0) nearest = options.length - 1;
      this.scrollToIndex(nearest);
    }
  }

  protected onToggle(): void {
    if (this.list.open()) {
      this.list.hide();
    } else {
      this.openList();
      this.inputRef()?.nativeElement.focus();
    }
  }

  protected selectOption(time: UniTime): void {
    this.setValue(time);
    this.list.hide();
    this.inputRef()?.nativeElement.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.list.hide();
    this.touched.set(true);
    const element = this.inputRef()?.nativeElement;
    if (element && this.commitOnBlur() && element.value !== this.displayText())
      this.commit(element.value);
  }

  // --- Internals -------------------------------------------------------------------

  private openList(): void {
    this.list.show();
    const committed = this.value();
    if (committed) this.list.setActive(this.options().indexOf(committed));
    this.scrollToActive();
  }

  private scrollToActive(): void {
    this.scrollToIndex(this.list.activeIndex());
  }

  private scrollToIndex(index: number): void {
    if (index < 0) return;
    queueMicrotask(() =>
      this.listRef()?.nativeElement.children[index]?.scrollIntoView?.({ block: 'nearest' })
    );
  }

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
  protected readonly embeddedClass = computed(() =>
    css({ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 })
  );

  protected readonly listClass = computed(() => {
    const options = this.componentOptions();
    return css(
      listboxPopupStyles(this.theme, options, {
        maxHeight: (options.maxVisibleOptions ?? 7) * 36,
      })
    );
  });
}
