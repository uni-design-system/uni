/**
 * The footer's two shapes: the fallback pair, and a projected row that keeps
 * the chrome. Until 11.8 there was no `<ng-content>`, so importing the
 * component silently replaced whatever a consumer projected with Cancel/Save
 * — and every dialog that confirmed asynchronously had to draw its own
 * footer outside the dialog's layout.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogButtonsComponent } from './dialog-buttons.component';
import { UniDialogComponent } from '../dialog.component';
import { emittedRuleFor } from '../../../../testing/emitted-css';

describe('UniDialogButtonsComponent', () => {
  let fixture: ComponentFixture<UniDialogButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDialogButtonsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDialogButtonsComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the Confirm/Cancel pair when nothing is projected', () => {
    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).map(
      (b) => b.textContent?.trim()
    );
    expect(labels).toEqual(['Confirm', 'Cancel']);
  });
});

@Component({
  imports: [UniDialogComponent, UniDialogButtonsComponent],
  template: `
    <dialog uni-dialog [show]="true">
      <p>body</p>
      @if (custom()) {
        <footer dialog-buttons [closeOnConfirm]="closeOnConfirm()" [loading]="loading()" (confirmed)="onConfirmed()">
          @if (footnote()) {
            <span dialog-footnote id="note">The item opens for your review.</span>
          }
          <button id="discard">Discard</button>
          <button id="keep">Keep</button>
        </footer>
      } @else {
        <footer dialog-buttons [closeOnConfirm]="closeOnConfirm()" [loading]="loading()" (confirmed)="onConfirmed()">
          @if (footnote()) {
            <span dialog-footnote id="note">The item opens for your review.</span>
          }
        </footer>
      }
    </dialog>
  `,
})
class FooterHost {
  custom = signal(false);
  footnote = signal(false);
  closeOnConfirm = signal(true);
  loading = signal(false);
  confirmed = 0;
  onConfirmed() {
    this.confirmed++;
  }
}

describe('UniDialogButtonsComponent in a dialog', () => {
  let fixture: ComponentFixture<FooterHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FooterHost] }).compileComponents();
    fixture = TestBed.createComponent(FooterHost);
    fixture.detectChanges();
  });

  const host = () => fixture.nativeElement as HTMLElement;
  const dialog = () => host().querySelector('dialog')!;
  const footer = () => host().querySelector<HTMLElement>('footer')!;
  const buttons = () => Array.from(footer().querySelectorAll('button')).map((b) => b.textContent?.trim());
  const confirm = () =>
    Array.from(footer().querySelectorAll('button')).find((b) => b.textContent?.includes('Confirm'))!;

  it('projected actions replace the pair', () => {
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    expect(buttons()).toEqual(['Discard', 'Keep']);
  });

  it('a projected row keeps the chrome: the padded, justified row', () => {
    fixture.componentInstance.custom.set(true);
    fixture.detectChanges();
    const row = footer().firstElementChild as HTMLElement;
    expect(emittedRuleFor(row)).toContain('justify-content:center');
    expect(emittedRuleFor(row)).toMatch(/padding/);
  });

  it('Confirm closes the dialog by default, as before', () => {
    confirm().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.confirmed).toBe(1);
    expect(dialog().hasAttribute('closing')).toBe(true);
  });

  it('closeOnConfirm=false emits and leaves the dialog open for the caller', () => {
    fixture.componentInstance.closeOnConfirm.set(false);
    fixture.detectChanges();
    confirm().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.confirmed).toBe(1);
    expect(dialog().hasAttribute('closing')).toBe(false);
    expect(dialog().open).toBe(true);
  });

  it('loading marks Confirm busy and disabled', () => {
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(confirm().getAttribute('aria-busy')).toBe('true');
    expect(confirm().disabled).toBe(true);
  });

  describe('footnote', () => {
    const cell = () => footer().querySelector<HTMLElement>('span')!;

    it('projects on the leading edge, before the actions', () => {
      fixture.componentInstance.footnote.set(true);
      fixture.detectChanges();
      expect(cell().querySelector('#note')).not.toBeNull();
      expect(emittedRuleFor(cell())).toContain('order:-1');
      expect(emittedRuleFor(cell())).toContain('flex:11auto');
      expect(emittedRuleFor(cell())).toContain(':empty{display:none');
    });

    it('leaves an empty cell when there is none, so the row renders as it did', () => {
      // The host's `@if` leaves its comment anchor in the cell; `:empty`
      // ignores comments, so the cell still collapses.
      expect(cell().children.length).toBe(0);
      expect(cell().textContent?.trim()).toBe('');
    });

    it('rides along with projected actions', () => {
      fixture.componentInstance.custom.set(true);
      fixture.componentInstance.footnote.set(true);
      fixture.detectChanges();
      expect(cell().querySelector('#note')).not.toBeNull();
      expect(buttons()).toEqual(['Discard', 'Keep']);
    });
  });
});
