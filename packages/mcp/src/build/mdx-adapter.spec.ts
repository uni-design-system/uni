import { describe, expect, it } from 'vitest';
import { parseMdxGuidelines } from './mdx-adapter.js';

const SAMPLE = `import { Meta, Title } from '@storybook/addon-docs/blocks';
import * as Stories from './tabs.stories';
import { StoryUsage } from '../../../stories/blocks/StoryUsage';

<Meta of={Stories} />
<Title />

\`import { UniTabsComponent } from '@uni-design-system/uni-angular';\`

## Overview

Tabs organize peer views behind a single switcher. Only the selected panel is
instantiated, so heavy tab content costs nothing until visited.

Every visual aspect resolves from the theme's \`tabs\` options.

## Usage

<StoryUsage of={Stories.Default} />

## Do

- Use for peer views of the same subject
- Keep labels to one or two words

## Don't

- Nest tabs inside tabs

## Accessibility

- Arrow keys move between tabs; selection follows focus
`;

describe('parseMdxGuidelines', () => {
  it('maps Overview prose to whenToUse, stripping JSX and import lines', () => {
    const g = parseMdxGuidelines(SAMPLE)!;
    expect(g.whenToUse).toContain('Tabs organize peer views');
    expect(g.whenToUse).toContain("theme's `tabs` options");
    expect(g.whenToUse).not.toContain('import');
    expect(g.whenToUse).not.toContain('<');
  });

  it('collects Do / Don\'t / Accessibility bullets', () => {
    const g = parseMdxGuidelines(SAMPLE)!;
    expect(g.dos).toEqual([
      'Use for peer views of the same subject',
      'Keep labels to one or two words',
    ]);
    expect(g.donts).toEqual(['Nest tabs inside tabs']);
    expect(g.accessibility).toEqual(['Arrow keys move between tabs; selection follows focus']);
  });

  it('ignores non-guideline sections and returns undefined for empty pages', () => {
    const g = parseMdxGuidelines(SAMPLE)!;
    expect(JSON.stringify(g)).not.toContain('StoryUsage');
    expect(parseMdxGuidelines('<Meta of={Stories} />\n## Usage\n<Story />')).toBeUndefined();
  });
});
