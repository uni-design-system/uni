import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSelectComponent } from './select-input.component';

describe('UniSelectComponent', () => {
  let fixture: ComponentFixture<UniSelectComponent<string>>;

  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
  ];

  const select = (): HTMLSelectElement =>
    (fixture.nativeElement as HTMLElement).querySelector('select')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniSelectComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniSelectComponent<string>);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('ariaLabel', 'Favorite color');
    fixture.detectChanges();
  });

  it('exposes ariaLabel on the native select', () => {
    expect(select().getAttribute('aria-label')).toBe('Favorite color');
  });

  it('maps the selected index back to the option value', () => {
    select().value = '1';
    select().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('blue');
  });
});
