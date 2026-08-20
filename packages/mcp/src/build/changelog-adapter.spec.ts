import { describe, expect, it } from 'vitest';
import { parseChangelog } from './changelog-adapter.js';

const SAMPLE = `# @uni-design-system/uni-angular

## 8.1.0

### Minor Changes

- [\`71bc74c\`](https://github.com/uni-design-system/uni/commit/71bc74c04) Thanks [@gaenglish](https://github.com/gaenglish)! - Calendar, date & time entry: \`uni-calendar\` and friends.

  The most-requested form control family anywhere.
  - **Values are plain ISO strings, never \`Date\`s** — timezone-free and sortable.
  - **\`uni-calendar\`** is an inline month grid.

- [\`1a6b382\`](https://github.com/uni-design-system/uni/commit/1a6b38273) Thanks [@gaenglish](https://github.com/gaenglish)! - Themable focus chrome: a shared \`focusRing\` primitive.

### Patch Changes

- Updated dependencies [[\`71bc74c\`](https://github.com/uni-design-system/uni/commit/71bc74c04), [\`1a6b382\`](https://github.com/uni-design-system/uni/commit/1a6b38273)]:
  - @uni-design-system/uni-core@8.1.0

## 8.0.0

### Major Changes

- [\`760b761\`](https://github.com/uni-design-system/uni/commit/760b761ad) Thanks [@gaenglish](https://github.com/gaenglish)! - \`uni-tag\` v2: themable, opt-in removal, two style axes

  v1 was a single hardcoded look.

### Patch Changes

- A hand-written entry with no commit preamble.
`;

describe('parseChangelog', () => {
  const cl = parseChangelog(SAMPLE)!;

  it('reads the package name and releases newest-first', () => {
    expect(cl.package).toBe('@uni-design-system/uni-angular');
    expect(cl.releases.map((r) => r.version)).toEqual(['8.1.0', '8.0.0']);
  });

  it('strips the changesets preamble into title + commit, grouped by bump', () => {
    const [minor1, minor2] = cl.releases[0].entries;
    expect(minor1.bump).toBe('minor');
    expect(minor1.title).toBe('Calendar, date & time entry: `uni-calendar` and friends.');
    expect(minor1.commit).toBe('71bc74c');
    expect(minor2.title).toBe('Themable focus chrome: a shared `focusRing` primitive.');
    expect(cl.releases[1].entries[0].bump).toBe('major');
  });

  it('keeps the dedented markdown body, nested bullets included', () => {
    const body = cl.releases[0].entries[0].body;
    expect(body).toContain('The most-requested form control family anywhere.');
    expect(body).toContain('- **Values are plain ISO strings');
    expect(body).not.toMatch(/^\s\s-/m);
  });

  it('collects Updated dependencies as dependency bumps, not entries', () => {
    expect(cl.releases[0].dependencyBumps).toEqual(['@uni-design-system/uni-core@8.1.0']);
    expect(cl.releases[0].entries).toHaveLength(2);
  });

  it('accepts hand-written bullets without a commit preamble', () => {
    const patch = cl.releases[1].entries.find((e) => e.bump === 'patch')!;
    expect(patch.title).toBe('A hand-written entry with no commit preamble.');
    expect(patch.commit).toBeUndefined();
  });

  it('returns undefined for sources that are not a changelog', () => {
    expect(parseChangelog('just some text')).toBeUndefined();
    expect(parseChangelog('# name only, no releases')).toBeUndefined();
  });
});
