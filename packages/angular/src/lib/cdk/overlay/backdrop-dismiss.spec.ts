import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BackdropDismiss } from './backdrop-dismiss';

/**
 * jsdom has no `::backdrop` and synthetic clicks skip the common-ancestor
 * rule, so the gestures are reproduced by dispatching the events a real drag
 * would produce: `pointerdown` where the press began, `click` where the
 * browser would retarget it.
 */
describe('BackdropDismiss', () => {
  let dialog: HTMLDialogElement;
  let field: HTMLInputElement;
  let tracker: BackdropDismiss;
  let hits: boolean[];

  beforeEach(() => {
    dialog = document.createElement('dialog');
    field = document.createElement('input');
    dialog.appendChild(field);
    document.body.appendChild(dialog);

    tracker = new BackdropDismiss();
    hits = [];
    dialog.addEventListener('pointerdown', (e) => tracker.press(e));
    dialog.addEventListener('click', (e) => hits.push(tracker.isBackdropClick(e)));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const press = (on: Element) => on.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  const click = (on: Element) => on.dispatchEvent(new Event('click', { bubbles: true }));

  it('counts a press and release on the scrim', () => {
    press(dialog);
    click(dialog);
    expect(hits).toEqual([true]);
  });

  it('ignores a selection dragged from a field and released on the scrim', () => {
    press(field);
    // The click lands on the common ancestor of press and release: the dialog.
    click(dialog);
    expect(hits).toEqual([false]);
  });

  it('ignores a press on the scrim released inside the panel', () => {
    press(dialog);
    click(field);
    expect(hits).toEqual([false]);
  });

  it('ignores a click with no press recorded', () => {
    click(dialog);
    expect(hits).toEqual([false]);
  });

  it('does not carry a press over to the next click', () => {
    press(dialog);
    click(field);
    click(dialog);
    expect(hits).toEqual([false, false]);
  });

  it('does not treat a nested dialog as its own backdrop', () => {
    const nested = document.createElement('dialog');
    dialog.appendChild(nested);
    press(nested);
    click(nested);
    expect(hits).toEqual([false]);
  });
});
