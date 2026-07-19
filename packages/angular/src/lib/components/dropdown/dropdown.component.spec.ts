import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDropdownComponent } from './dropdown.component';

describe('UniDropdownComponent', () => {
  let fixture: ComponentFixture<UniDropdownComponent>;
  let trigger: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDropdownComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDropdownComponent);
    trigger = document.createElement('button');
    document.body.appendChild(trigger);
    fixture.componentRef.setInput('trigger', trigger);
    fixture.detectChanges();
  });

  afterEach(() => {
    trigger.remove();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('wires the ARIA popup contract onto the trigger', () => {
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(fixture.componentInstance.popoverId);
  });

  it('sets aria-haspopup when requested', () => {
    const withPopup = TestBed.createComponent(UniDropdownComponent);
    const popupTrigger = document.createElement('button');
    document.body.appendChild(popupTrigger);
    withPopup.componentRef.setInput('trigger', popupTrigger);
    withPopup.componentRef.setInput('ariaHasPopup', 'menu');
    withPopup.detectChanges();

    expect(popupTrigger.getAttribute('aria-haspopup')).toBe('menu');
    popupTrigger.remove();
  });

  it('tracks popover open state and reflects it on the trigger', () => {
    const component = fixture.componentInstance;
    component.toggleDropdown(); // stubbed popover dispatches the toggle event
    expect(component.showing()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    component.hideDropdown();
    expect(component.showing()).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
