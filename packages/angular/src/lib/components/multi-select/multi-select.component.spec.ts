/**
 * First specs for this component — added alongside `Option.disabled` support,
 * so they cover the disabled contract rather than the whole surface.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniMultiSelectComponent } from './multi-select.component';

describe('UniMultiSelectComponent', () => {
  let fixture: ComponentFixture<UniMultiSelectComponent<string>>;
  let host: HTMLElement;
  let emitted: (string[] | undefined)[];

  const OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana', disabled: true },
    { label: 'Cherry', value: 'cherry' },
  ];

  const checkboxes = () =>
    Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniMultiSelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent<UniMultiSelectComponent<string>>(UniMultiSelectComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('options', OPTIONS);

    emitted = [];
    fixture.componentInstance.updates.subscribe((value) => emitted.push(value));
    fixture.detectChanges();
  });

  it('disables the disabled option only', () => {
    expect(checkboxes().map((box) => box.disabled)).toEqual([false, true, false]);
  });

  it('refuses to toggle a disabled option even when called directly', () => {
    fixture.componentInstance.handleCheck(true, 'banana');
    expect(emitted).toEqual([]);
  });

  it('still toggles enabled options', () => {
    fixture.componentInstance.handleCheck(true, 'apple');
    expect(emitted).toEqual([['apple']]);
  });

  it('leaves disabled options out of selectAll', () => {
    // A disabled option is not committable, so "select all" must not commit
    // one on the user's behalf.
    fixture.componentInstance.selectAll();
    expect(emitted).toEqual([['apple', 'cherry']]);
  });
});
