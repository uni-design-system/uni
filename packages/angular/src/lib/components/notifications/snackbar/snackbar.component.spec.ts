import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniSnackbarComponent as SnackbarComponent } from './snackbar.component';

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;
  let host: HTMLElement;

  /** jsdom implements neither method; record the calls the component makes. */
  const popoverCalls: string[] = [];
  const originals = {
    show: HTMLElement.prototype.showPopover,
    hide: HTMLElement.prototype.hidePopover,
  };

  beforeAll(() => {
    HTMLElement.prototype.showPopover = function () {
      popoverCalls.push('show');
    };
    HTMLElement.prototype.hidePopover = function () {
      popoverCalls.push('hide');
    };
  });

  afterAll(() => {
    HTMLElement.prototype.showPopover = originals.show;
    HTMLElement.prototype.hidePopover = originals.hide;
  });

  const bar = () => host.querySelector<HTMLElement>('[role="status"]')!;

  beforeEach(async () => {
    popoverCalls.length = 0;
    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('top layer', () => {
    it('is a manual popover, not a dialog', () => {
      // A snackbar is never modal, and it must not light-dismiss: it is closed
      // by its own button or its timer, not by a click elsewhere on the page.
      expect(bar().getAttribute('popover')).toBe('manual');
      expect(host.querySelector('dialog')).toBeNull();
    });

    it('announces politely without stealing focus', () => {
      expect(bar().getAttribute('role')).toBe('status');
    });

    it('enters the top layer when opened', () => {
      component.open();
      expect(popoverCalls).toContain('show');
    });

    it('survives being opened while already open', () => {
      component.open();
      expect(() => component.open()).not.toThrow();
    });
  });

  describe('closing', () => {
    it('marks the bar closing rather than hiding it outright', () => {
      component.open();
      popoverCalls.length = 0;

      component.close();

      // The fade has to run first — leaving the top layer here would cut it off.
      expect(bar().getAttribute('closing')).toBe('true');
      expect(popoverCalls).not.toContain('hide');
    });

    it('leaves the top layer once the fade has finished', () => {
      component.open();
      component.close();
      popoverCalls.length = 0;

      let hidden: boolean | undefined;
      component.showing.subscribe((value) => (hidden = value));
      bar().dispatchEvent(
        Object.assign(new Event('animationend'), { animationName: component.fadeOut })
      );

      expect(popoverCalls).toContain('hide');
      expect(hidden).toBe(false);
    });

    it('ignores an unrelated animation finishing', () => {
      component.open();
      component.close();
      popoverCalls.length = 0;

      bar().dispatchEvent(
        Object.assign(new Event('animationend'), { animationName: 'something-else' })
      );

      expect(popoverCalls).not.toContain('hide');
    });

    it('clears the closing mark when reopened', () => {
      component.open();
      component.close();
      expect(bar().getAttribute('closing')).toBe('true');

      component.open();
      expect(bar().hasAttribute('closing')).toBe(false);
    });
  });
});
