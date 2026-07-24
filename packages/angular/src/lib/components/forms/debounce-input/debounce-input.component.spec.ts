import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDebounceInputComponent } from './debounce-input.component';

describe('UniDebounceInputComponent', () => {
  let fixture: ComponentFixture<UniDebounceInputComponent>;

  const inputEl = (): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [UniDebounceInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDebounceInputComponent);
    fixture.componentRef.setInput('label', 'Filter');
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('wears the shared input chrome and the accessible name', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('uni-input-box')).not.toBeNull();
    expect(inputEl().getAttribute('aria-label')).toBe('Filter');
  });

  it('emits once after the pause, not per keystroke', () => {
    const emissions: string[] = [];
    fixture.componentInstance.change.subscribe((v) => emissions.push(v));

    for (const value of ['o', 'ok', 'okl']) {
      inputEl().value = value;
      inputEl().dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(100);
    }
    expect(emissions).toEqual([]);
    vi.advanceTimersByTime(400);
    expect(emissions).toEqual(['okl']);
  });

  it('clear() cancels pending emits and emits an empty value immediately', () => {
    const emissions: string[] = [];
    fixture.componentInstance.change.subscribe((v) => emissions.push(v));

    inputEl().value = 'draft';
    inputEl().dispatchEvent(new Event('input'));
    fixture.componentInstance.clear();
    vi.advanceTimersByTime(1000);

    expect(emissions).toEqual(['']);
    expect(fixture.componentInstance.value()).toBe('');
  });
});
