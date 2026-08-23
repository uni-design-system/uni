import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSearchInputComponent } from './search-input.component';

describe('UniSearchInputComponent', () => {
  let fixture: ComponentFixture<UniSearchInputComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const inputEl = (): HTMLInputElement => host().querySelector('input')!;

  // Typing goes through the debounce (a macrotask even at 0ms) — flush it.
  const type = async (value: string) => {
    inputEl().value = value;
    inputEl().dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  };
  const key = (key: string) => {
    inputEl().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSearchInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSearchInputComponent);
    fixture.componentRef.setInput('label', 'Search docs');
    fixture.componentRef.setInput('debounceTime', 0);
    fixture.detectChanges();
  });

  it('wears the input chrome with a decorative magnifier and combobox ARIA', () => {
    expect(host().querySelector('uni-input-box')).not.toBeNull();
    expect(host().querySelector('uni-symbol[aria-hidden="true"]')).not.toBeNull();
    expect(inputEl().getAttribute('role')).toBe('combobox');
    expect(inputEl().getAttribute('aria-label')).toBe('Search docs');
    expect(inputEl().getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the clear button only with a query, and clearing refocuses + emits', async () => {
    let changed: string | undefined;
    fixture.componentInstance.searchChange.subscribe((v) => (changed = v));
    expect(host().querySelector('button[post-input]')).toBeNull();

    await type('theme');
    const clear = host().querySelector<HTMLButtonElement>('button[post-input]');
    expect(clear).not.toBeNull();

    clear!.click();
    fixture.detectChanges();
    expect(inputEl().value).toBe('');
    expect(changed).toBe('');
    expect(document.activeElement).toBe(inputEl());
  });

  it('emits searchSubmit on Enter with the current query', async () => {
    let searched: string | undefined;
    fixture.componentInstance.searchSubmit.subscribe((v) => (searched = v));
    await type('oklch');
    key('Enter');
    expect(searched).toBe('oklch');
  });

  it('opens a listbox for suggestions and selects with arrows + Enter', async () => {
    let selected: string | undefined;
    fixture.componentInstance.suggestionSelected.subscribe((v) => (selected = v));
    fixture.componentRef.setInput('suggestions', ['alpha', 'beta', 'gamma']);
    await type('a');

    const listbox = host().querySelector('[role="listbox"]')!;
    expect(listbox).not.toBeNull();
    expect(listbox.querySelectorAll('[role="option"]').length).toBe(3);
    expect(inputEl().getAttribute('aria-expanded')).toBe('true');

    key('ArrowDown');
    key('ArrowDown');
    expect(inputEl().getAttribute('aria-activedescendant')).toContain('-1');
    key('Enter');
    expect(selected).toBe('beta');
    expect(inputEl().value).toBe('beta');
    expect(host().querySelector('[role="listbox"]')).toBeNull();
  });

  it('leaves Home and End to the caret instead of opening the list', async () => {
    // Regression: Home/End used to reach ListboxNavigation unconditionally
    // here, so they both stole the caret and *opened* a closed popup.
    fixture.componentRef.setInput('suggestions', ['alpha', 'beta', 'gamma']);
    await type('a');
    key('Escape');
    expect(host().querySelector('[role="listbox"]')).toBeNull();

    const home = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true });
    inputEl().dispatchEvent(home);
    fixture.detectChanges();

    expect(host().querySelector('[role="listbox"]')).toBeNull();
    expect(home.defaultPrevented).toBe(false);
  });

  it('Escape closes the list first, then clears the query', async () => {
    fixture.componentRef.setInput('suggestions', ['alpha']);
    await type('a');
    expect(host().querySelector('[role="listbox"]')).not.toBeNull();

    key('Escape');
    expect(host().querySelector('[role="listbox"]')).toBeNull();
    expect(inputEl().value).toBe('a');

    key('Escape');
    expect(inputEl().value).toBe('');
  });
});
