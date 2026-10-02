import { describe, expect, it } from 'vitest';
import { mdxToMarkdown, parseUtilities } from './cdk-adapter.js';

const SOURCE = `import { Injectable } from '@angular/core';

/**
 * How a copy ended:
 * - \`copied\` — the content is on the clipboard.
 */
export type CopyResult = 'copied' | 'denied';

export type Reason =
  | 'unparseable'
  | 'min';

/**
 * Copies text. Never rejects.
 *
 * Call it from the gesture.
 */
export async function copyToClipboard(content: string | Record<string, Blob>): Promise<CopyResult> {
  return 'copied';
}

/** Rounds to \`fractionDigits\`. */
export const roundDecimal = (
  value: string,
  fractionDigits: number,
  mode: 'half-up' | 'floor' = 'half-up',
): string => value;

export const FOCUSABLE = 'button, [href]';
export const names = memoize((locale: string) => new Intl.DateTimeFormat(locale).formatToParts(new Date()).map((p) => p.value));
const internal = 1;

/** Keyboard bookkeeping. */
export interface Nav {
  /** Whether the popup is showing. */
  readonly open: Signal<boolean>;
  show(): void;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private cache = new Map();
  alert = signal<Alert | undefined>(undefined);
  showAlert = (alert: Alert) => this.alert.set(alert);
  records = computed(() => { const a = this.alert(); return a ? [a, a, a, a, a, a, a, a, a, a, a, a] : []; });
  /** The current state. */
  getPermissionState(permission: Permission): Promise<PermissionState> {
    return queryPermission(permission);
  }
  protected hidden(): void {}
}

export class Plain<T> extends Base<T> {
  override firstPage() {}
}

@Component({ selector: 'uni-demo', template: '' })
export class DemoComponent {}
`;

describe('parseUtilities', () => {
  const utilities = parseUtilities(SOURCE, 'clipboard');
  const byName = Object.fromEntries(utilities.map((u) => [u.name, u]));

  it('indexes every exported symbol and nothing else', () => {
    expect(Object.keys(byName).sort()).toEqual(
      [
        'CopyResult',
        'FOCUSABLE',
        'Nav',
        'PermissionService',
        'Plain',
        'Reason',
        'copyToClipboard',
        'names',
        'roundDecimal',
      ].sort()
    );
  });

  it('reads function heads without their bodies, and arrow consts as functions', () => {
    expect(byName.copyToClipboard.kind).toBe('function');
    expect(byName.copyToClipboard.signature).toBe(
      'async function copyToClipboard(content: string | Record<string, Blob>): Promise<CopyResult>'
    );
    expect(byName.roundDecimal.kind).toBe('function');
    expect(byName.roundDecimal.signature).toBe(
      "function roundDecimal(value: string, fractionDigits: number, mode: 'half-up' | 'floor' = 'half-up'): string"
    );
  });

  it('keeps the JSDoc as description and its first sentence as summary', () => {
    expect(byName.copyToClipboard.summary).toBe('Copies text.');
    expect(byName.copyToClipboard.description).toBe(
      'Copies text. Never rejects. Call it from the gesture.'
    );
    expect(byName.FOCUSABLE.description).toBe('');
  });

  it('derives kebab ids and stamps the module and import path', () => {
    expect(byName.copyToClipboard.id).toBe('copy-to-clipboard');
    expect(byName.PermissionService.id).toBe('permission-service');
    expect(byName.FOCUSABLE.id).toBe('focusable');
    expect(byName.Nav.module).toBe('clipboard');
    expect(byName.Nav.importPath).toBe('@uni-design-system/uni-angular');
  });

  it('flattens multi-line unions and shows short initializers for consts', () => {
    expect(byName.Reason.signature).toBe("type Reason = 'unparseable' | 'min'");
    expect(byName.FOCUSABLE.signature).toBe("const FOCUSABLE = 'button, [href]'");
    expect(byName.names.signature).toBe('const names = memoize(…)');
  });

  it('tells services from classes and lists their public surface only', () => {
    expect(byName.PermissionService.kind).toBe('service');
    expect(byName.Plain.kind).toBe('class');
    expect(byName.Plain.signature).toBe('class Plain<T> extends Base<T>');
    expect(byName.PermissionService.members).toEqual([
      {
        name: 'alert',
        kind: 'property',
        signature: 'alert = signal<Alert | undefined>(undefined)',
        description: '',
      },
      { name: 'showAlert', kind: 'method', signature: 'showAlert(alert: Alert)', description: '' },
      { name: 'records', kind: 'property', signature: 'records = computed(…)', description: '' },
      {
        name: 'getPermissionState',
        kind: 'method',
        signature: 'getPermissionState(permission: Permission): Promise<PermissionState>',
        description: 'The current state.',
      },
    ]);
    expect(byName.Plain.members.map((m) => m.signature)).toEqual(['firstPage()']);
  });

  it('reads interface members with their docs', () => {
    expect(byName.Nav.members).toEqual([
      {
        name: 'open',
        kind: 'property',
        signature: 'readonly open: Signal<boolean>',
        description: 'Whether the popup is showing.',
      },
      { name: 'show', kind: 'method', signature: 'show(): void', description: '' },
    ]);
  });

  it('leaves components to the Angular adapter', () => {
    expect(byName.DemoComponent).toBeUndefined();
  });
});

describe('mdxToMarkdown', () => {
  const MDX = `import { Meta, Story } from '@storybook/addon-docs/blocks';
import * as Stories from './clipboard.stories';

<Meta of={Stories} name="Clipboard" />

# Clipboard

Copies text. Call it from the gesture.

<Story of={Stories.Primary} />

## Copying rich content

\`\`\`typescript
await copyToClipboard({
  'text/html': '<a href="https://example.com">Report</a>',
});
\`\`\`

<DocsTable
  head={['Result', 'Meaning']}
  rows={[
    ['copied', 'Done.'],
  ]}
/>

## Resources

- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
`;

  it('keeps headings, prose, bullets and code; drops imports and JSX blocks', () => {
    const { title, markdown } = mdxToMarkdown(MDX);
    expect(title).toBe('Clipboard');
    expect(markdown).toBe(`# Clipboard

Copies text. Call it from the gesture.

## Copying rich content

\`\`\`typescript
await copyToClipboard({
  'text/html': '<a href="https://example.com">Report</a>',
});
\`\`\`

## Resources

- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)`);
  });
});
