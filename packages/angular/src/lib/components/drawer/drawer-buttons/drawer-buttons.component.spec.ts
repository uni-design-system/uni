/**
 * The drawer footer's two shapes — see the dialog footer's spec. Seven of a
 * consumer's panel footers were none of Cancel/Save, and carried the slot
 * attribute without importing the component to keep their real footer.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDrawerButtonsComponent } from './drawer-buttons.component';
import { UniDrawerComponent } from '../drawer.component';
import { emittedRuleFor } from '../../../../testing/emitted-css';

@Component({
  imports: [UniDrawerComponent, UniDrawerButtonsComponent],
  template: `
    <uni-drawer mode="over" [open]="true" ariaLabel="Edit">
      <p>form</p>
      @if (custom()) {
        <div drawer-buttons [loading]="loading()">
          @if (footnote()) {
            <span drawer-footnote id="note">Total: $1,204.00</span>
          }
          <button id="keep">Keep</button>
          <button id="use">Use</button>
          <button id="discard">Discard</button>
        </div>
      } @else {
        <div drawer-buttons [loading]="loading()" (confirmed)="onConfirmed()"></div>
      }
    </uni-drawer>
  `,
})
class FooterHost {
  custom = signal(false);
  footnote = signal(false);
  loading = signal(false);
  confirmed = 0;
  onConfirmed() {
    this.confirmed++;
  }
}

describe('UniDrawerButtonsComponent', () => {
  let fixture: ComponentFixture<FooterHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FooterHost] }).compileComponents();
    fixture = TestBed.createComponent(FooterHost);
    fixture.detectChanges();
  });

  const footer = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[drawer-buttons]')!;
  const buttons = () => Array.from(footer().querySelectorAll('button')).map((b) => b.textContent?.trim());

  it('renders the Cancel/Save pair when nothing is projected', () => {
    expect(buttons()).toEqual(['Cancel', 'Save']);
  });

  it('Save emits confirmed and, unlike the dialog, never closes the drawer itself', () => {
    const drawer = fixture.debugElement.children[0].componentInstance as UniDrawerComponent;
    footer().querySelectorAll('button')[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.confirmed).toBe(1);
    expect(drawer.open()).toBe(true);
  });

  it('projected actions replace the pair and keep the row chrome', () => {
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    expect(buttons()).toEqual(['Keep', 'Use', 'Discard']);
    const row = footer().firstElementChild as HTMLElement;
    expect(emittedRuleFor(row)).toContain('justify-content:flex-end');
  });

  it('centres its items on the cross axis', () => {
    const row = footer().firstElementChild as HTMLElement;
    expect(getComputedStyle(row).alignItems).toBe('center');
  });

  it('loading marks Save busy', () => {
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    const save = footer().querySelectorAll('button')[1];
    expect(save.getAttribute('aria-busy')).toBe('true');
  });

  it('projects a footnote on the leading edge', () => {
    fixture.componentInstance.custom.set(true);
    fixture.componentInstance.footnote.set(true);
    fixture.detectChanges();
    const cell = footer().querySelector<HTMLElement>('span')!;
    expect(cell.querySelector('#note')).not.toBeNull();
    expect(emittedRuleFor(cell)).toContain('order:-1');
  });
});
