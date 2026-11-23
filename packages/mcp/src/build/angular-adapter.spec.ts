import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { firstTypeArg, parseMembers, readCall } from '../../../angular/scripts/signal-members.mjs';
import { ingestAngular } from './angular-adapter.js';

describe('readCall', () => {
  const read = (source: string) => readCall(source, 0);

  it('reads a function type, whose arrow closes no bracket', () => {
    expect(read('<(option: Option<T>, query: string) => boolean>();')).toEqual({
      type: '(option: Option<T>, query: string) => boolean',
      args: [],
    });
  });

  it('splits only top-level arguments', () => {
    expect(read("<number | undefined>(undefined, { alias: 'max' });")).toEqual({
      type: 'number | undefined',
      args: ['undefined', "{ alias: 'max' }"],
    });
    expect(read('((a, b) => a === b)')?.args).toEqual(['(a, b) => a === b']);
    expect(read("('a, b)')")?.args).toEqual(["'a, b)'"]);
  });

  it('follows a call that wraps across lines', () => {
    const call = read(
      '<boolean | undefined, unknown>(undefined, {\n    transform: optional,\n  });'
    );
    expect(call?.type).toBe('boolean | undefined, unknown');
    expect(call?.args[0]).toBe('undefined');
  });

  it('returns null for something that is not a call', () => {
    expect(read('<T>;')).toBeNull();
    expect(read('(unclosed')).toBeNull();
  });
});

describe('firstTypeArg', () => {
  it('keeps a single argument whole, commas inside brackets included', () => {
    expect(firstTypeArg('(a: T, b: T) => boolean')).toBe('(a: T, b: T) => boolean');
    expect(firstTypeArg('Map<string, number>')).toBe('Map<string, number>');
    expect(firstTypeArg('{ key: string; index: number }')).toBe('{ key: string; index: number }');
  });

  it('drops the transform type of a two-argument input', () => {
    expect(firstTypeArg('boolean | undefined, unknown')).toBe('boolean | undefined');
    expect(firstTypeArg('(row: T) => string, unknown')).toBe('(row: T) => string');
  });
});

describe('parseMembers', () => {
  const only = (declaration: string) => parseMembers(`export class X {\n  ${declaration}\n}`)[0];

  it('infers the type from a boolean or number transform', () => {
    expect(only('fill = input(undefined, { transform: booleanAttribute });').type).toBe('boolean');
    expect(only('rows = input(undefined, { transform: numberAttribute });').type).toBe('number');
  });

  it('reads the options bag from the right argument for each kind', () => {
    expect(only("label = input.required<string>({ alias: 'name' });")).toMatchObject({
      alias: 'name',
      default: undefined,
    });
    expect(only("changed = output<string>({ alias: 'change' });").alias).toBe('change');
    // An object default is a default, not an options bag.
    expect(only("range = input({ alias: 'not-an-alias' });")).toMatchObject({
      default: "{ alias: 'not-an-alias' }",
      alias: undefined,
    });
  });

  it('carries the preceding JSDoc', () => {
    const [member] = parseMembers('  /** Shown above the field. */\n  label = input("");\n');
    expect(member.doc).toBe('Shown above the field.');
  });
});

describe('ingestAngular members', () => {
  const root = mkdtempSync(join(tmpdir(), 'uni-angular-adapter-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  mkdirSync(join(root, 'components/sample'), { recursive: true });
  writeFileSync(
    join(root, 'components/sample/sample.component.ts'),
    `@Component({
  selector: 'uni-sample',
})
export class UniSampleComponent {
  label = input.required<string>();
  compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  rowClass = input<(row: T) => string>();
  maxLength = input<number | undefined>(undefined, { alias: 'max' });
  fullWidth = input(false, { transform: booleanAttribute });
  readonly underline = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  stepChanged = output<{ key: string; index: number }>();
  protected readonly hidden = input(false);
}
`
  );

  const api = ingestAngular(root)[0].binding.api;
  const member = (name: string) => api.find((m) => m.name === name);

  it('finds members whose type or default holds an arrow', () => {
    expect(member('compareWith')).toMatchObject({
      kind: 'input',
      type: '(a: T, b: T) => boolean',
      default: '(a, b) => a === b',
    });
    expect(member('rowClass')?.type).toBe('(row: T) => string');
  });

  it('finds members declared across several lines', () => {
    expect(member('underline')).toMatchObject({
      kind: 'input',
      // `input<T, TransformT>` reports T alone.
      type: 'boolean | undefined',
      default: 'undefined',
    });
  });

  it('finds an output with an object type', () => {
    expect(member('stepChanged')).toMatchObject({
      kind: 'output',
      type: '{ key: string; index: number }',
    });
    expect(member('stepChanged')?.default).toBeUndefined();
  });

  it('keeps the options bag out of the default and records the alias', () => {
    expect(member('maxLength')).toMatchObject({ default: 'undefined', alias: 'max' });
    expect(member('fullWidth')).toMatchObject({ type: 'boolean', default: 'false' });
    expect(member('fullWidth')?.alias).toBeUndefined();
  });

  it('marks required inputs and skips non-public members', () => {
    expect(member('label')).toMatchObject({ required: true });
    expect(member('hidden')).toBeUndefined();
  });
});
