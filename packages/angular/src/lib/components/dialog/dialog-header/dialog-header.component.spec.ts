/**
 * The header's two shapes. The title bar is unchanged; `rich` renders the
 * projection as a block beside the close button, and a `[dialog-title]`
 * inside it names the dialog on its own — so an eyebrow and a blurb are not
 * read out as part of the name.
 */
import { Component, input, signal } from '@angular/core';
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
    // The consumer's own id is kept and pointed at, not replaced.
    expect(dialog().getAttribute('aria-labelledby')).toBe('headline');
    expect(labelledBy()?.textContent?.trim()).toBe('Add custom work');
    expect(labelledBy()?.tagName).toBe('H2');
    // Exactly one element carries the id.
    expect(host().querySelectorAll(`#${dialog().getAttribute('aria-labelledby')}`).length).toBe(1);
  });
});

/**
 * A sheet wrapped in an app component: the header is declared in the
 * wrapper's template and the head's content is projected *through* it. A
 * content query cannot see such a node and a directive inside it cannot
 * inject the dialog, so the first cut named every wrapped sheet by its whole
 * head. The header now finds the marked title in the DOM, and defers to the
 * dialog's own `ariaLabel` when there is none.
 */
@Component({
  selector: 'app-sheet',
  imports: [UniDialogComponent, UniDialogHeaderComponent],
  template: `
    <dialog uni-dialog [show]="true" [ariaLabel]="ariaLabel()" [defaultCloseButton]="closeButton()">
      <header dialog-header rich><ng-content select="[sheet-head]" /></header>
      <p>body</p>
    </dialog>
  `,
})
class SheetWrapper {
  ariaLabel = input<string>();
  closeButton = input<boolean | undefined>(undefined);
}

@Component({
  imports: [SheetWrapper, UniDialogTitleDirective],
  template: `
    <app-sheet [ariaLabel]="ariaLabel()" [closeButton]="closeButton()">
      <div sheet-head>
        <span id="eyebrow">Presentations</span>
        @if (marked()) {
          <h2 dialog-title id="headline">New presentation</h2>
        } @else {
          <h2 id="headline">New presentation</h2>
        }
        <p>Starts with 3 of 10 board items.</p>
      </div>
    </app-sheet>
  `,
})
class WrappedHost {
  ariaLabel = signal<string | undefined>(undefined);
  closeButton = signal<boolean | undefined>(undefined);
  marked = signal(false);
}

describe('UniDialogHeaderComponent through a wrapper', () => {
  let fixture: ComponentFixture<WrappedHost>;

  const host = () => fixture.nativeElement as HTMLElement;
  const dialog = () => host().querySelector('dialog')!;
  const name = () => {
    const id = dialog().getAttribute('aria-labelledby');
    return id ? host().querySelector(`#${id}`)?.textContent?.trim() : dialog().getAttribute('aria-label');
  };
  const closeButton = () => host().querySelector('header button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WrappedHost] }).compileComponents();
    fixture = TestBed.createComponent(WrappedHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('a [dialog-title] projected through the wrapper still names the dialog alone', async () => {
    fixture.componentInstance.marked.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(name()).toBe('New presentation');
    expect(host().querySelectorAll(`#${dialog().getAttribute('aria-labelledby')}`).length).toBe(1);
  });

  it('without a marked title, the dialog\'s own ariaLabel wins over the block', async () => {
    fixture.componentInstance.ariaLabel.set('New presentation');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(dialog().getAttribute('aria-labelledby')).toBeNull();
    expect(name()).toBe('New presentation');
  });

  it('without either, the block is the name, as for a bare dialog', () => {
    expect(name()).toContain('Presentations');
    expect(name()).toContain('Starts with 3 of 10');
  });

  it('renders the close button unless the dialog says defaultCloseButton=false', async () => {
    expect(closeButton()).not.toBeNull();
    fixture.componentInstance.closeButton.set(false);
    fixture.detectChanges();
    expect(closeButton()).toBeNull();
  });
});
