/**
 * The header's two shapes. The title bar is unchanged; `rich` renders the
 * projection as a block beside the close button, and a `[dialog-title]`
 * inside it names the dialog on its own — so an eyebrow and a blurb are not
 * read out as part of the name.
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogHeaderComponent } from './dialog-header.component';
import { UniDialogTitleDirective } from './dialog-title.directive';
import { UniDialogComponent } from '../dialog.component';

describe('UniDialogHeaderComponent', () => {
  let fixture: ComponentFixture<UniDialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDialogHeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDialogHeaderComponent);
    fixture.detectChanges();
  });

  it('creates (dialog parent is optional)', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

@Component({
  imports: [UniDialogComponent, UniDialogHeaderComponent, UniDialogTitleDirective],
  template: `
    <dialog uni-dialog [show]="true">
      @if (rich()) {
        <header dialog-header rich>
          <span id="eyebrow">Custom work</span>
          @if (marked()) {
            <h2 dialog-title id="headline">Add custom work</h2>
          } @else {
            <h2 id="headline">Add custom work</h2>
          }
          <p id="blurb">Describe the piece and who it is for.</p>
        </header>
      } @else {
        <header dialog-header>Add custom work</header>
      }
      <p>body</p>
    </dialog>
  `,
})
class HeaderHost {
  rich = signal(false);
  marked = signal(false);
}

describe('UniDialogHeaderComponent shapes', () => {
  let fixture: ComponentFixture<HeaderHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeaderHost] }).compileComponents();
    fixture = TestBed.createComponent(HeaderHost);
    fixture.detectChanges();
  });

  const host = () => fixture.nativeElement as HTMLElement;
  const dialog = () => host().querySelector('dialog')!;
  const header = () => host().querySelector<HTMLElement>('header')!;
  const labelledBy = () => host().querySelector(`#${dialog().getAttribute('aria-labelledby')}`);

  it('title bar: one uni-text line, a balance spacer, and the dialog labelled by the line', () => {
    expect(header().querySelector('[uni-text]')?.textContent?.trim()).toBe('Add custom work');
    expect(labelledBy()?.textContent?.trim()).toBe('Add custom work');
    expect(header().querySelector('button')).not.toBeNull();
  });

  it('rich: the projection renders as a block, not inside a text span', () => {
    fixture.componentInstance.rich.set(true);
    fixture.detectChanges();
    expect(header().querySelector('[uni-text]')).toBeNull();
    expect(header().querySelector('#eyebrow')).not.toBeNull();
    expect(header().querySelector('#blurb')).not.toBeNull();
    expect(header().querySelector('button')).not.toBeNull();
  });

  it('rich without a marked title: the whole block names the dialog', () => {
    fixture.componentInstance.rich.set(true);
    fixture.detectChanges();
    const block = labelledBy()!;
    expect(block.querySelector('#eyebrow')).not.toBeNull();
    expect(block.querySelector('#blurb')).not.toBeNull();
  });

  it('rich with [dialog-title]: the headline alone names the dialog', () => {
    fixture.componentInstance.rich.set(true);
    fixture.componentInstance.marked.set(true);
    fixture.detectChanges();
    expect(labelledBy()?.id).toBe(dialog().getAttribute('aria-labelledby'));
    expect(labelledBy()?.textContent?.trim()).toBe('Add custom work');
    expect(labelledBy()?.tagName).toBe('H2');
    // Exactly one element carries the id.
    expect(host().querySelectorAll(`#${dialog().getAttribute('aria-labelledby')}`).length).toBe(1);
  });
});
