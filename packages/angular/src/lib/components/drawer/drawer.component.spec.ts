import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDrawerComponent } from './drawer.component';

describe('UniDrawerComponent', () => {
  let fixture: ComponentFixture<UniDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDrawerComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDrawerComponent);
  });

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  it('side mode renders an aside, hidden from AT while closed', () => {
    fixture.detectChanges();
    const aside = host().querySelector('aside')!;
    expect(aside).not.toBeNull();
    expect(aside.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(aside.getAttribute('aria-hidden')).toBeNull();
  });

  it('over mode renders a native dialog with the accessible name', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.detectChanges();
    const dialog = host().querySelector('dialog')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-label')).toBe('Navigation');
  });

  it('routes Escape through the animated close and syncs open state', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const dialog = host().querySelector('dialog')!;
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    fixture.detectChanges();

    expect(cancel.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(dialog.hasAttribute('closing')).toBe(true);
  });

  it('closes when the backdrop (the dialog element itself) is clicked', () => {
    fixture.componentRef.setInput('mode', 'over');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    host().querySelector('dialog')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
