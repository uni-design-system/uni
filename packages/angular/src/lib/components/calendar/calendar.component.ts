import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { css } from '@emotion/css';
import type { Size, StyleExpression, Variant } from '@uni-design-system/uni-core';

import {
  addDays,
  addMonths,
  buildMonthGrid,
  dayOfWeek,
  formatDate,
  formatMonthHeading,
  inclusiveDayCount,
  monthOf,
  localeWeekStart,
  todayIso,
  uniqueId,
  visuallyHidden,
  weekdayNames,
  type UniDate,
  type UniDateRange,
} from '../../cdk';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import { UniIconButtonComponent } from '../icon-button/icon-button.component';
import type {
  UniCalendarMarker,
  UniCalendarMode,
  UniCalendarOptions,
  UniCalendarValue,
} from './calendar.model';

/** One rendered day cell — precomputed so the template stays declarative. */
interface CalendarCell {
  date: UniDate;
  day: number;
  outside: boolean;
  disabled: boolean;
  today: boolean;
  selected: boolean;
  inBand: boolean;
  tabIndex: number;
  ariaLabel: string;
  markers: UniCalendarMarker[];
  cellClass: string;
  dayClass: string;
}

interface RangeBand {
  start: UniDate;
  end: UniDate;
  preview: boolean;
}

/**
 * Inline month calendar: single-date or start–end range selection, day
 * markers (availability dots), min/max fences and disabled dates. One tab
 * stop with a roving-tabindex `role="grid"`; every day is a real button
 * named with its full date. Values are plain ISO strings (`'YYYY-MM-DD'`),
 * never `Date` objects, so bindings are timezone-free and serializable.
 * Selection and today colours come from the theme's `primary` role pair;
 * geometry and glyphs come from the `calendar` theme entry.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-calendar, Calendar',
  imports: [UniIconButtonComponent],
  templateUrl: './calendar.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'calendar' }],
  host: { '[class]': 'className()', '(focusout)': 'onHostFocusOut($event)' },
})
export class UniCalendarComponent
  extends BaseComponent<UniCalendarOptions>
  implements FormValueControl<UniCalendarValue>
{
  // --- Signal Forms block (explicit per AGENTS.md, not a base class) --------
  readonly value = model<UniCalendarValue>();
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly dirty = input(false);
  readonly required = input(false);
  readonly ariaDescribedBy = input<string>();

  // --- Configuration -------------------------------------------------------
  /** `'single'` reads/writes a `UniDate`; `'range'` a `UniDateRange`. */
  mode = input<UniCalendarMode>('single');
  /** Shown month, `'YYYY-MM'` — two-way, so an app can drive "jump to June". */
  month = model<string>();
  /** Earliest selectable date (inclusive). */
  minDate = input<UniDate>();
  /** Latest selectable date (inclusive). */
  maxDate = input<UniDate>();
  /** Blocked days: a list of dates, or a predicate. */
  disabledDates = input<UniDate[] | ((date: UniDate) => boolean)>();
  /** Availability dots; `label` extends the day's accessible name. */
  markers = input<UniCalendarMarker[]>([]);
  /** BCP 47 tag; defaults to the document language, then the browser's. */
  locale = input<string>();
  /** First day of week, 0 = Sunday; defaults from the locale's week info. */
  weekStart = input<0 | 1 | 2 | 3 | 4 | 5 | 6>();
  /** Names the grid when it stands alone (otherwise the heading names it). */
  ariaLabel = input<string>();
  /** Day geometry token; `sm`/`md`/`lg` map to the theme's `calendar` sizes. */
  override size = input<Size>('md');

  // --- Events (value/month changes flow through the models) -----------------
  /** Each committed day, including both ends of a range. */
  selected = output<UniDate>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly headingId = uniqueId('uni-calendar-heading');
  protected readonly srOnly = css(visuallyHidden);

  /** Pending range start — set by the first commit, cleared by the second. */
  protected readonly pendingStart = signal<UniDate | null>(null);
  /** Hover/focus candidate painting the preview band while a range is pending. */
  protected readonly previewDate = signal<UniDate | null>(null);
  /** Live-region text; selections are otherwise silent for a screen reader. */
  protected readonly announcement = signal('');

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? (document.documentElement.lang || navigator.language || 'en-US')
  );

  protected readonly resolvedWeekStart = computed(
    () => this.weekStart() ?? localeWeekStart(this.resolvedLocale())
  );

  /** The month on screen: the `month` model, else the value's month, else today's. */
  protected readonly viewMonth = computed(
    () => this.month() ?? monthOf(this.anchorDate() ?? todayIso())
  );

  private readonly anchorDate = computed(() => {
    const value = this.value();
    return this.mode() === 'range'
      ? (value as UniDateRange | undefined)?.start
      : (value as UniDate | undefined);
  });

  /**
   * The roving-tabindex day. Re-derives when the view or value changes
   * (selected day in view → today in view → first enabled day); keyboard
   * navigation writes it directly.
   */
  protected readonly focusedDate = linkedSignal<UniDate>(() => this.pickFocus());

  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly heading = computed(() =>
    formatMonthHeading(this.viewMonth(), this.resolvedLocale())
  );

  protected readonly weekdays = computed(() =>
    weekdayNames(
      this.resolvedLocale(),
      this.resolvedWeekStart(),
      this.componentOptions().weekdayFormat ?? 'short'
    )
  );

  private readonly disabledDateSet = computed(() => {
    const dates = this.disabledDates();
    return Array.isArray(dates) ? new Set(dates) : null;
  });

  private readonly markersByDate = computed(() => {
    const map = new Map<UniDate, UniCalendarMarker[]>();
    for (const marker of this.markers()) {
      const existing = map.get(marker.date);
      if (existing) existing.push(marker);
      else map.set(marker.date, [marker]);
    }
    return map;
  });

  /** The committed range, or the pending preview band. */
  private readonly rangeBand = computed<RangeBand | null>(() => {
    if (this.mode() !== 'range') return null;
    const pending = this.pendingStart();
    const preview = this.previewDate();
    if (pending && preview) {
      const [start, end] = preview < pending ? [preview, pending] : [pending, preview];
      return { start, end, preview: true };
    }
    if (pending) return { start: pending, end: pending, preview: true };
    const value = this.value() as UniDateRange | undefined;
    if (value?.start && value?.end) return { start: value.start, end: value.end, preview: false };
    return null;
  });

  protected isDayDisabled(date: UniDate): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if ((min && date < min) || (max && date > max)) return true;
    const dates = this.disabledDates();
    if (!dates) return false;
    const set = this.disabledDateSet();
    return set ? set.has(date) : (dates as (date: UniDate) => boolean)(date);
  }

  private isSelected(date: UniDate): boolean {
    if (this.mode() === 'single') return this.value() === date;
    const pending = this.pendingStart();
    if (pending) return pending === date;
    const value = this.value() as UniDateRange | undefined;
    return value?.start === date || value?.end === date;
  }

  /** The full render model: one precomputed cell per grid position. */
  protected readonly gridWeeks = computed<CalendarCell[][]>(() => {
    const locale = this.resolvedLocale();
    const band = this.rangeBand();
    const today = todayIso();
    const focused = this.focusedDate();
    const markers = this.markersByDate();
    const cellBase = this.cellClass();
    const dayBase = this.dayClass();
    const todayClass = this.todayClass();

    return buildMonthGrid(this.viewMonth(), this.resolvedWeekStart()).map((week) =>
      week.map((cell) => {
        const date = cell.date;
        const selected = !cell.outside && this.isSelected(date);
        const inBand = !cell.outside && !!band && date >= band.start && date <= band.end;
        const dayMarkers = cell.outside ? [] : (markers.get(date) ?? []).slice(0, 3);
        const markerLabel = dayMarkers
          .filter((marker) => marker.label)
          .map((marker) => marker.label)
          .join(', ');
        const isToday = date === today;
        return {
          date,
          day: Number(date.slice(8, 10)),
          outside: cell.outside,
          disabled: this.isDayDisabled(date),
          today: isToday,
          selected,
          inBand,
          tabIndex: date === focused && !cell.outside ? 0 : -1,
          ariaLabel:
            formatDate(date, locale, { dateStyle: 'full' }) + (markerLabel ? `, ${markerLabel}` : ''),
          markers: dayMarkers,
          cellClass: [
            cellBase,
            inBand && (band!.preview ? this.previewClass() : this.inRangeClass()),
            inBand && date === band!.start && this.bandStartClass(),
            inBand && date === band!.end && this.bandEndClass(),
          ]
            .filter(Boolean)
            .join(' '),
          dayClass: [dayBase, isToday && todayClass, selected && this.selectedClass()]
            .filter(Boolean)
            .join(' '),
        };
      })
    );
  });

  // --- Selection -------------------------------------------------------------

  protected select(date: UniDate): void {
    if (this.disabled() || this.isDayDisabled(date)) return;
    this.setViewMonth(monthOf(date));
    this.focusedDate.set(date);
    const locale = this.resolvedLocale();
    const full = (d: UniDate) => formatDate(d, locale, { dateStyle: 'full' });

    if (this.mode() === 'single') {
      this.value.set(date);
      this.announce(`${full(date)} selected.`);
    } else if (!this.pendingStart()) {
      this.pendingStart.set(date);
      this.previewDate.set(date);
      this.announce(`Start date ${full(date)}. Choose an end date.`);
    } else {
      let [start, end] = [this.pendingStart()!, date];
      if (end < start) [start, end] = [end, start]; // backwards commit swaps
      this.pendingStart.set(null);
      this.previewDate.set(null);
      this.value.set({ start, end });
      const days = inclusiveDayCount(start, end);
      this.announce(
        `Range selected, ${full(start)} to ${full(end)}. ${days} ${days === 1 ? 'day' : 'days'}.`
      );
    }
    this.selected.emit(date);
  }

  private cancelPending(): void {
    this.pendingStart.set(null);
    this.previewDate.set(null);
    this.announce('Range selection cancelled.');
  }

  // --- Navigation ------------------------------------------------------------

  protected onNav(direction: 1 | -1): void {
    this.setViewMonth(monthOf(addMonths(`${this.viewMonth()}-01`, direction)));
  }

  private setViewMonth(month: string): void {
    if (this.month() !== month) this.month.set(month);
  }

  /**
   * Move the roving focus. A landing on a disabled day keeps going in the
   * same direction until an enabled day; the min/max fence stops the caret,
   * it never wraps. Month edges never block — the grid follows.
   */
  private moveFocus(target: UniDate, direction: 1 | -1): void {
    const min = this.minDate();
    const max = this.maxDate();
    if ((min && target < min) || (max && target > max)) return;
    let date = target;
    let guard = 0;
    while (this.isDayDisabled(date)) {
      date = addDays(date, direction);
      if ((min && date < min) || (max && date > max) || ++guard > 500) return;
    }
    this.setViewMonth(monthOf(date));
    this.focusedDate.set(date);
    if (this.pendingStart()) this.previewDate.set(date);
    this.focusDay(date);
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const focused = this.focusedDate();
    const week = (dayOfWeek(focused) - this.resolvedWeekStart() + 7) % 7;
    const handlers: Record<string, () => void> = {
      ArrowLeft: () => this.moveFocus(addDays(focused, -1), -1),
      ArrowRight: () => this.moveFocus(addDays(focused, 1), 1),
      ArrowUp: () => this.moveFocus(addDays(focused, -7), -1),
      ArrowDown: () => this.moveFocus(addDays(focused, 7), 1),
      Home: () => this.moveFocus(addDays(focused, -week), 1),
      End: () => this.moveFocus(addDays(focused, 6 - week), -1),
      PageUp: () => this.moveFocus(addMonths(focused, event.shiftKey ? -12 : -1), -1),
      PageDown: () => this.moveFocus(addMonths(focused, event.shiftKey ? 12 : 1), 1),
      Enter: () => this.select(focused),
      ' ': () => this.select(focused),
    };
    if (event.key === 'Escape') {
      // Only a pending range consumes Escape; otherwise it bubbles so a
      // hosting popover can light-dismiss.
      if (this.pendingStart()) {
        event.preventDefault();
        event.stopPropagation();
        this.cancelPending();
      }
      return;
    }
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  protected onDayHover(date: UniDate): void {
    if (this.pendingStart() && !this.isDayDisabled(date)) this.previewDate.set(date);
  }

  /** Focus the roving day — used by popup hosts when the calendar opens. */
  focusActiveDay(): void {
    this.focusDay(this.focusedDate());
  }

  protected onHostFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) this.touched.set(true);
  }

  private focusDay(date: UniDate): void {
    queueMicrotask(() =>
      this.host.nativeElement.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus()
    );
  }

  private pickFocus(): UniDate {
    const view = this.viewMonth();
    const anchor = this.anchorDate();
    if (anchor && monthOf(anchor) === view && !this.isDayDisabled(anchor)) return anchor;
    const today = todayIso();
    if (monthOf(today) === view && !this.isDayDisabled(today)) return today;
    return this.firstEnabledInView(view);
  }

  private firstEnabledInView(view: string): UniDate {
    const first = `${view}-01`;
    let date = first;
    for (let i = 0; i < 31 && monthOf(date) === view; i++) {
      if (!this.isDayDisabled(date)) return date;
      date = addDays(date, 1);
    }
    return first;
  }

  private announce(message: string): void {
    // Re-announce identical text by breaking the string equality.
    this.announcement.set(this.announcement() === message ? `${message} ` : message);
  }

  // --- Styling ---------------------------------------------------------------

  private readonly daySize = computed(
    () => (this.componentTheme().sizes?.[this.size()] ?? {}) as StyleExpression
  );

  protected readonly className = computed(() =>
    css([(this.componentTheme().fixed ?? { display: 'inline-block' }) as StyleExpression])
  );

  protected readonly navClass = computed(() =>
    css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...this.theme.gap('xs'),
      marginBottom: 4,
    })
  );

  protected readonly headingClass = computed(() =>
    css({ flex: 1, textAlign: 'center', ...this.theme.typeface('title-small') })
  );

  protected readonly gridClass = computed(() =>
    css({ display: 'grid', ...this.theme.gap(this.componentOptions().gap ?? 'xxs') })
  );

  protected readonly rowClass = computed(() =>
    css({
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      justifyItems: 'center',
      ...this.theme.gap(this.componentOptions().gap ?? 'xxs'),
    })
  );

  protected readonly weekdayClass = computed(() =>
    css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...this.daySize(),
      height: 'auto',
      ...this.theme.typeface(this.componentOptions().typeface ?? 'label'),
      ...this.theme.color('on-background-variant'),
      '& abbr': { textDecoration: 'none' },
    })
  );

  /** The gridcell — range bands paint here so they read as one bar. */
  protected readonly cellClass = computed(() => css({ position: 'relative', display: 'flex' }));

  protected readonly inRangeClass = computed(() =>
    css({ ...this.theme.backgroundColor('primary-container'), borderRadius: 0 })
  );

  protected readonly previewClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css({
      backgroundColor: `color-mix(in srgb, ${colors['primary-container']} 55%, transparent)`,
      outline: `1px dashed ${colors['primary']}`,
      outlineOffset: -1,
    });
  });

  protected readonly bandStartClass = computed(() =>
    css({ ...this.theme.getRadiusLeft(this.componentOptions().dayBorderRadius ?? 'max') })
  );

  protected readonly bandEndClass = computed(() =>
    css({ ...this.theme.getRadiusRight(this.componentOptions().dayBorderRadius ?? 'max') })
  );

  protected readonly dayClass = computed(() => {
    const options = this.componentOptions();
    const colors = this.theme.colorPalette();
    return css({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 0,
      padding: 0,
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      ...this.theme.typeface(options.typeface ?? 'label'),
      ...this.daySize(),
      ...this.theme.radius(options.dayBorderRadius ?? 'max'),
      '&:hover:not(:disabled)': { ...this.theme.colorPair('primary-container') },
      ...this.theme.focusRing(),
      '&:disabled': {
        color: colors['on-disabled'],
        cursor: 'default',
        pointerEvents: 'none',
      },
    });
  });

  protected readonly todayClass = computed(() => {
    const colors = this.theme.colorPalette();
    // Outline (or dot), never fill — so today and selected can coincide and
    // both stay legible (WCAG 1.4.1: no state carried by colour alone).
    return (this.componentOptions().todayStyle ?? 'outline') === 'outline'
      ? css({ boxShadow: `inset 0 0 0 1.5px ${colors['primary']}` })
      : css({
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: 999,
            backgroundColor: colors['primary'],
          },
        });
  });

  protected readonly selectedClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css({
      ...this.theme.colorPair('primary'),
      // A marker dot survives selection by switching to the on-colour.
      '& [data-dot]': { backgroundColor: colors['on-primary'] },
    });
  });

  protected readonly outsideDayClass = computed(() => {
    const colors = this.theme.colorPalette();
    return css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...this.theme.typeface(this.componentOptions().typeface ?? 'label'),
      ...this.daySize(),
      color: colors['on-disabled'],
    });
  });

  protected readonly dotsClass = computed(() =>
    css({
      position: 'absolute',
      bottom: 2,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 2,
      pointerEvents: 'none',
    })
  );

  /** One dot class per marker variant present, resolved from the palette. */
  protected readonly dotClasses = computed(() => {
    const colors = this.theme.colorPalette();
    const classes = new Map<Variant, string>();
    for (const marker of this.markers()) {
      const variant = marker.variant ?? 'primary';
      if (!classes.has(variant)) {
        classes.set(
          variant,
          css({ width: 4, height: 4, borderRadius: 999, backgroundColor: colors[variant] })
        );
      }
    }
    return classes;
  });

  protected dotClassFor(variant: Variant | undefined): string {
    return this.dotClasses().get(variant ?? 'primary') ?? '';
  }

  protected readonly showOutside = computed(() => this.componentOptions().showOutsideDays ?? false);
}
