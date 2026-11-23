import { describe, expect, it } from 'vitest';
import {
  buildArgsOnlyCode,
  extractArgs,
  splitArgs,
  synthesizeTemplate,
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

  describe('args-only stories', () => {
    const SRC = `
const meta: Meta<UniComboboxComponent<string>> = {
  args: { label: 'State', placeholder: 'Choose a state', options: STATES },
  argTypes: { unframed: { description: 'Rows to render (text shape only)' } },
};
export default meta;

export const Primary: Story = { args: { value: 'Arizona' } };
export const Disabled: Story = { args: { ...Primary.args, disabled: true, label: 'Home state' } };
export const Bare: Story = {};
export const Opaque: Story = { args: { ...shared } };
`;

    it('synthesizes the element from the selector and the merged args', () => {
      expect(buildArgsOnlyCode('Primary', SRC, 'Primary', 'uni-combobox, Combobox')).toBe(
        [
          '<!-- Storybook story: Primary -->',
          '<uni-combobox label="State" placeholder="Choose a state" [options]="options" value="Arizona" />',
          '<!-- bound values:',
          'options = STATES',
          '-->',
        ].join('\n')
      );
    });

    it("lets the story's args override the meta's and expands a sibling spread", () => {
      const code = buildArgsOnlyCode('Disabled', SRC, 'Disabled', 'uni-combobox');
      expect(code).toContain('label="Home state"');
      expect(code).not.toContain('label="State"');
      expect(code).toContain('value="Arizona"');
      expect(code).toContain('[disabled]="true"');
    });

    it('renders a story with no args of its own from the meta args', () => {
      expect(buildArgsOnlyCode('Bare', SRC, 'Bare', 'uni-combobox')).toContain(
        '<uni-combobox label="State" placeholder="Choose a state" [options]="options" />'
      );
    });

    it('falls back to the raw args when a spread cannot be resolved', () => {
      const code = buildArgsOnlyCode('Opaque', SRC, 'Opaque', 'uni-combobox');
      expect(code).not.toContain('<uni-combobox');
      expect(code).toContain('default args');
      expect(code).toContain('{ ...shared }');
    });

    it('falls back to the raw args when a render it could not read draws the story', () => {
      const src = `
const meta: Meta = { render: (args) => ({ props: args, template: wrap(args) }) };
export const Primary: Story = { args: { size: 'sm' } };
`;
      const code = buildArgsOnlyCode('Primary', src, 'Primary', 'uni-tag');
      expect(code).not.toContain('<uni-tag');
      expect(code).toContain("{ size: 'sm' }");
    });

    it('falls back to the raw args without a selector', () => {
      expect(buildArgsOnlyCode('Primary', SRC, 'Primary', undefined)).toContain(
        "<!-- args:\n{ value: 'Arizona' }\n-->"
      );
    });
  });

  describe('synthesizeTemplate', () => {
    const args = (entries: Record<string, string>) => new Map(Object.entries(entries));

    it('writes literals inline and names everything else', () => {
      const code = synthesizeTemplate(
        'uni-calendar',
        args({
          ariaLabel: "'Calendar'",
          weekStart: '1',
          range: '{ start: 50, end: 500 }',
          slots: "['09:00', '09:30']",
          value: 'dayIn(12)',
          disabledDates: '(date: string) => false',
          when: '`${TODAY}T15:00`',
        })
      )!;

      expect(code).toContain('ariaLabel="Calendar"');
      expect(code).toContain('[weekStart]="1"');
      expect(code).toContain('[range]="{ start: 50, end: 500 }"');
      expect(code).toContain(`[slots]="['09:00', '09:30']"`);
      expect(code).toContain('[value]="value"');
      expect(code).toContain('[disabledDates]="disabledDates"');
      expect(code).toContain('[when]="when"');
      expect(code).toContain('value = dayIn(12)');
      expect(code).toContain('disabledDates = (date: string) => false');
    });

    it('names a string that could not sit in an attribute', () => {
      const code = synthesizeTemplate('uni-tag', args({ label: `'say "hi"'` }))!;
      expect(code).toContain('[label]="label"');
      expect(code).toContain(`label = 'say "hi"'`);
    });

    it('breaks a long tag one attribute per line', () => {
      const code = synthesizeTemplate(
        'uni-number-range-input',
        args({
          label: "'Delivery window'",
          suffix: "' days'",
          startLabel: "'From'",
          endLabel: "'To'",
          value: '{ start: 2, end: 7 }',
        })
      )!;
      expect(code.split('\n')[0]).toBe('<uni-number-range-input');
      expect(code.split('\n').at(-1)).toBe('/>');
    });

    it('hosts an attribute selector on its tag, or a div', () => {
      expect(synthesizeTemplate('button[uni-button]', args({ size: "'sm'" }))).toBe(
        '<button uni-button size="sm"></button>'
      );
      expect(synthesizeTemplate('[uni-wrap-layout], [wrap-layout]', args({}))).toBe(
        '<div uni-wrap-layout></div>'
      );
    });

    it('binds only declared inputs, by alias, and reports the rest', () => {
      const inputs = new Map([
        ['label', 'label'],
        ['maxLength', 'max'],
        ['items', 'items'],
      ]);
      const code = synthesizeTemplate(
        'uni-tag-input',
        args({ label: "'To'", maxLength: '3', items: 'FACETS', onRemove: 'fn()', theme: "'dark'" }),
        inputs
      )!;

      expect(code.split('\n')[0]).toBe('<uni-tag-input label="To" [max]="3" [items]="items" />');
      expect(code).toContain('items = FACETS');
      expect(code).toContain(
        "<!-- story args that are not inputs of this component:\nonRemove: fn()\ntheme: 'dark'\n-->"
      );
      expect(code).not.toContain('[onRemove]');
      expect(code).not.toContain('theme="dark"');
    });

    it('binds every arg when no input list is given', () => {
      expect(synthesizeTemplate('uni-tag', args({ anything: "'x'" }))).toBe(
        '<uni-tag anything="x" />'
      );
    });

    it('declines a selector it cannot turn into an element', () => {
      expect(synthesizeTemplate('uni-a:not(.b)', args({}))).toBeUndefined();
    });
  });

  it('splits only the top-level entries of an args literal', () => {
    expect(
      splitArgs(`{
        label: 'a, b',
        items: [{ label: 'Home', href: '#' }, { label: 'Q3' }],
        options,
        ...Primary.args,
      }`)
    ).toEqual([
      { key: 'label', value: "'a, b'" },
      { key: 'items', value: "[{ label: 'Home', href: '#' }, { label: 'Q3' }]" },
      { key: 'options', value: 'options' },
      { spread: 'Primary.args' },
    ]);
  });
});
