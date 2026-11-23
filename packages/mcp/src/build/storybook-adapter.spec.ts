import { describe, expect, it } from 'vitest';
import {
  buildCode,
  extractArgs,
  extractMetaArgs,
  extractMetaTemplate,
  extractStoryTemplate,
} from './storybook-adapter.js';

/** Args-only stories beside one that brings its own render, and no meta render. */
const NO_META_RENDER = `
const meta: Meta<UniComboboxComponent<string>> = {
  title: 'Components/Forms/Combobox',
  args: { label: 'State', options: STATES },
};
export default meta;

export const Primary: Story = {
  args: { value: 'Arizona' },
};

export const Async: Story = {
  render: (args) => ({
    props: { ...args, options: [] },
    template: \`
      <uni-combobox label="Country" (query)="onQuery($event)" />
    \`,
  }),
};

export const Invalid: Story = {
  args: { invalid: true, touched: true },
};
`;

const META_RENDER = `
const meta: Meta<{ label: string }> = {
  render: (args) => ({
    props: args,
    template: \`<button uni-button>{{ label }}</button>\`,
  }),
};
export default meta;

export const Primary: Story = { args: { label: 'Save' } };

export const Icon: Story = {
  render: () => ({ template: \`<button uni-button iconName="add">Add</button>\` }),
};
`;

describe('storybook adapter extraction', () => {
  it('finds no shared template when only a sibling story declares one', () => {
    expect(extractMetaTemplate(NO_META_RENDER)).toBeUndefined();
    expect(extractStoryTemplate(NO_META_RENDER, 'Primary')).toBeUndefined();
  });

  it("reads a story's own template", () => {
    expect(extractStoryTemplate(NO_META_RENDER, 'Async')).toBe(
      '<uni-combobox label="Country" (query)="onQuery($event)" />'
    );
  });

  it('reads the meta-level template, past braces in the type annotation', () => {
    expect(extractMetaTemplate(META_RENDER)).toBe('<button uni-button>{{ label }}</button>');
    expect(extractStoryTemplate(META_RENDER, 'Icon')).toBe(
      '<button uni-button iconName="add">Add</button>'
    );
  });

  it("reads a story's own args, not the meta's", () => {
    expect(extractArgs(NO_META_RENDER, 'Primary')).toBe("{ value: 'Arizona' }");
    expect(extractArgs(META_RENDER, 'Primary')).toBe("{ label: 'Save' }");
  });

  it("does not hand a story without args the next story's", () => {
    expect(extractArgs(NO_META_RENDER, 'Async')).toBeUndefined();
    expect(extractArgs(META_RENDER, 'Icon')).toBeUndefined();
  });

  it('lists the meta args for a story rendered from args alone', () => {
    const metaArgs = extractMetaArgs(NO_META_RENDER);
    expect(metaArgs).toBe("{ label: 'State', options: STATES }");

    const code = buildCode('Primary', undefined, "{ value: 'Arizona' }", metaArgs);
    expect(code).toContain("{ label: 'State', options: STATES }");
    expect(code).toContain("{ value: 'Arizona' }");
    expect(code).not.toContain('Country');
  });

  it('leaves the meta args out when a template shows the markup', () => {
    expect(buildCode('Async', '<uni-combobox />', undefined, '{ label: 1 }')).toBe(
      '<!-- Storybook story: Async -->\n<uni-combobox />'
    );
  });
});
