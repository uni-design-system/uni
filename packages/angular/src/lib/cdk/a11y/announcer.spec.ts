import { createAnnouncer } from './a11y';

describe('createAnnouncer', () => {
  it('starts silent, so nothing is read on first render', () => {
    expect(createAnnouncer().message()).toBe('');
  });

  it('carries the announced text', () => {
    const announcer = createAnnouncer();
    announcer.announce('Alabama selected.');

    expect(announcer.message()).toBe('Alabama selected.');
  });

  it('re-announces a repeat by breaking string equality', () => {
    // The reason this helper exists. Assistive tech reads a live region when
    // its content *changes*, so setting the identical string is a no-op and a
    // second "No match." would be silent — precisely when the user most needs
    // to hear that their entry was refused again.
    const announcer = createAnnouncer();
    announcer.announce('No match.');
    const first = announcer.message();

    announcer.announce('No match.');

    expect(announcer.message()).not.toBe(first);
    expect(announcer.message().trim()).toBe('No match.');
  });

  it('alternates on repeats instead of accumulating padding', () => {
    const announcer = createAnnouncer();
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      announcer.announce('Time cleared.');
      seen.push(announcer.message());
    }

    // Two forms, alternating — never "Time cleared.      ".
    expect(new Set(seen).size).toBe(2);
    expect(Math.max(...seen.map((text) => text.length))).toBe('Time cleared.'.length + 1);
  });

  it('reads identically to a screen reader whichever form is current', () => {
    const announcer = createAnnouncer();
    announcer.announce('Date cleared.');
    announcer.announce('Date cleared.');

    expect(announcer.message().trim()).toBe('Date cleared.');
  });

  it('switches cleanly between different messages', () => {
    const announcer = createAnnouncer();
    announcer.announce('4 results.');
    announcer.announce('No match.');

    expect(announcer.message()).toBe('No match.');
  });

  it('gives each control its own region text', () => {
    const a = createAnnouncer();
    const b = createAnnouncer();
    a.announce('Alabama selected.');

    expect(b.message()).toBe('');
  });
});
