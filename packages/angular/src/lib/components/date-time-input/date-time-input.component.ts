import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';

import {
  joinDateTime,
  splitDateTime,
  type UniDate,
  type UniDateTime,
  type UniTime,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniCalendarMarker } from '../calendar/calendar.model';
import { UniDateInputComponent } from '../date-input/date-input.component';
import { UniInputBoxComponent } from '../input-box/input-box.component';
import { UniTimeInputComponent } from '../time-input/time-input.component';
import type { UniDateTimeInputOptions } from './date-time-input.model';

interface DateTimeParts {
  date?: UniDate;
  time?: UniTime;
}

/**
 * One field for a date and a time: a thin composer seating a uni-date-input
 * and a uni-time-input in one input-box chrome under one label, yielding one
 * combined `'YYYY-MM-DDTHH:mm'` value. The value emits only when both parts
 * are set — a time without a day is not an answer — and clearing the date
 * clears it. With `slotsFor`, the time part stays disabled until a day is
 * chosen and offers exactly that day's slots: the scheduling flow in one
 * attribute. Two honest tab stops (it is two questions); apps needing a
 * different arrangement compose the primitives directly.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-date-time-input, DateTimeInput',
  imports: [UniDateInputComponent, UniInputBoxComponent, UniTimeInputComponent],
  templateUrl: './date-time-input.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'dateTimeInput' }],
  host: { '[class]': 'className()', '(focusout)': 'onHostFocusOut($event)' },
})
export class UniDateTimeInputComponent
  extends BaseComponent<UniDateTimeInputOptions>
  implements FormValueControl<UniDateTime | undefined>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniDateTime | undefined>();
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** Names the group; the parts are announced as "Date" and "Time" under it. */
  label = input.required<string>();
  /** Earliest allowed moment; the date and time fences are split from it. */
  minDateTime = input<UniDateTime>();
  /** Latest allowed moment; the date and time fences are split from it. */
  maxDateTime = input<UniDateTime>();

  // --- Forwarded wholesale ----------------------------------------------------
  disabledDates = input<UniDate[] | ((date: UniDate) => boolean)>();
  markers = input<UniCalendarMarker[]>([]);
  /** Fixed time choices; superseded per-day by `slotsFor` when that is set. */
  slots = input<UniTime[]>();
  minuteStep = input(30);
  hour12 = input<boolean>();
  weekStart = input<0 | 1 | 2 | 3 | 4 | 5 | 6>();
  locale = input<string>();
  /** Scheduling: the day's available times. Gates the time part on a date. */
  slotsFor = input<(date: UniDate) => UniTime[]>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * The two part-values. An external `value` write re-derives both; an
   * internal partial state (a date without a time round-trips through
   * `undefined`) must not be wiped by its own echo.
   */
  private readonly parts = linkedSignal<UniDateTime | undefined, DateTimeParts>({
    source: this.value,
    computation: (value, previous) => {
      if (value) return splitDateTime(value);
      const kept = previous?.value;
      if (kept && joinDateTime(kept.date, kept.time) === undefined) return kept;
      return {};
    },
  });

  protected readonly dateValue = computed(() => this.parts().date);
  protected readonly timeValue = computed(() => this.parts().time);

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  private readonly minParts = computed(() => splitDateTime(this.minDateTime()));
  private readonly maxParts = computed(() => splitDateTime(this.maxDateTime()));

  protected readonly dateMin = computed(() => this.minParts().date);
  protected readonly dateMax = computed(() => this.maxParts().date);

  // The time fence applies only on the boundary date itself — 'after 9:00'
  // on the min date, any time on later days.
  protected readonly timeMin = computed(() => {
    const { date, time } = this.minParts();
    return time && date && this.dateValue() === date ? time : undefined;
  });

  protected readonly timeMax = computed(() => {
    const { date, time } = this.maxParts();
    return time && date && this.dateValue() === date ? time : undefined;
  });

  /** The chosen day's slots when `slotsFor` is set, else the fixed list. */
  protected readonly effectiveSlots = computed(() => {
    const slotsFor = this.slotsFor();
    if (!slotsFor) return this.slots();
    const date = this.dateValue();
    return date ? slotsFor(date) : [];
  });

  protected readonly timeDisabled = computed(
    () => this.disabled() || (!!this.slotsFor() && !this.dateValue())
  );

  // --- Part plumbing -----------------------------------------------------------

  protected onDatePartChange(date: UniDate | undefined): void {
    let time = this.parts().time;
    if (!date) {
      time = undefined; // clearing the date clears the combined value
    } else {
      const slotsFor = this.slotsFor();
      // Changing the day clears a slot that no longer exists.
      if (slotsFor && time && !slotsFor(date).includes(time)) time = undefined;
    }
    this.setParts({ date, time });
  }

  protected onTimePartChange(time: UniTime | undefined): void {
    this.setParts({ date: this.parts().date, time });
  }

  private setParts(parts: DateTimeParts): void {
    this.parts.set(parts);
    this.value.set(joinDateTime(parts.date, parts.time));
  }

  protected onHostFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) this.touched.set(true);
  }

  // --- Styling --------------------------------------------------------------------

  protected readonly className = computed(() => css({ display: 'block' }));

  protected readonly groupClass = computed(() =>
    css({
      display: 'flex',
      alignItems: 'stretch',
      flex: 1,
      width: '100%',
      minWidth: 0,
      ...this.theme.gap(this.componentOptions().partGap ?? 'sm'),
    })
  );

  protected readonly datePartClass = computed(() =>
    css({ flex: 1.4, minWidth: 0, display: 'flex', '& > *': { flex: 1, minWidth: 0 } })
  );

  protected readonly timePartClass = computed(() =>
    css({ flex: 1, minWidth: 0, display: 'flex', '& > *': { flex: 1, minWidth: 0 } })
  );

  protected readonly dividerClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css({
      width: 1,
      alignSelf: 'stretch',
      flex: 'none',
      backgroundColor: colors[this.componentOptions().dividerColor ?? 'outline'],
    });
  });
}
