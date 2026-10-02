/**
 * Server wiring: a tool that formats correctly but was never registered is
 * invisible to every agent. These drive a real client over an in-memory
 * transport, so registration, schema and dispatch are all exercised.
 */
import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { parseTheme } from '@uni-design-system/uni-core';
import { createUniServer } from './core.js';

async function connect() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createUniServer();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test', version: '0' });
  await client.connect(clientTransport);
  return client;
}

const textOf = (result: unknown) =>
  ((result as { content: { type: string; text: string }[] }).content[0] ?? {}).text ?? '';

describe('createUniServer', () => {
  it('registers create-icon-tokens alongside the rest of the toolset', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);

    expect(names).toContain('create-icon-tokens');
    expect(names).toContain('generate-uni-theme');
    expect(names).toContain('generate-runtime-theme');
    expect(names).toContain('get-runtime-theme');
    await client.close();
  });

  it('advertises an output schema on the runtime theme tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();

    for (const name of ['generate-runtime-theme', 'get-runtime-theme']) {
      const tool = tools.find((t) => t.name === name);
      expect(tool?.outputSchema, name).toBeDefined();
      expect(Object.keys(tool!.outputSchema!.properties ?? {}), name).toContain('themes');
    }
    await client.close();
  });

  it('delivers a registerable theme as structured content', async () => {
    const client = await connect();
    const result = (await client.callTool({
      name: 'generate-runtime-theme',
      arguments: { brand: '#0052FF', name: 'Acme', darkMode: false },
    })) as { structuredContent?: { themes: { id: string; theme: unknown }[] } };

    const themes = result.structuredContent?.themes ?? [];
    expect(themes).toHaveLength(1);
    expect(themes[0].id).toBe('AcmeLight');
    // The promise of the tool: what arrives passes the consumer's validator.
    expect(parseTheme(themes[0].theme).issues).toEqual([]);
    await client.close();
  });

  it('surfaces an unknown theme id as a tool error', async () => {
    const client = await connect();
    const result = (await client.callTool({
      name: 'get-runtime-theme',
      arguments: { id: 'Nope' },
    })) as { isError?: boolean };

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('LightTheme');
    await client.close();
  });

  it('exposes the icon tool inputs an agent needs to call it', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === 'create-icon-tokens');

    expect(tool).toBeDefined();
    expect(Object.keys(tool!.inputSchema.properties ?? {})).toEqual(['icons']);
    // The description has to carry the monochrome constraint: it is what an
    // agent reads before deciding whether to send a multi-color logo.
    expect(tool!.description).toMatch(/monochrome/i);
    await client.close();
  });

  it('converts an SVG to a token through a live tool call', async () => {
    const client = await connect();
    const result = await client.callTool({
      name: 'create-icon-tokens',
      arguments: {
        icons: [
          {
            name: 'acme-logo',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111" d="M4 4h16v16H4z"/></svg>',
          },
        ],
      },
    });

    const body = textOf(result);
    expect(body).toContain('1 of 1 encoded');
    expect(body).toContain('acmeLogo: "data:image/svg+xml,');
    await client.close();
  });

  it('accepts the allowMultiColor opt-in over the wire', async () => {
    const client = await connect();
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E8112D" d="M0 0h9v9H0z"/><circle fill="#0052FF" r="4"/></svg>';

    const rejected = await client.callTool({
      name: 'create-icon-tokens',
      arguments: { icons: [{ name: 'brandMark', svg }] },
    });
    expect(textOf(rejected)).toContain('## Not encoded');

    const accepted = await client.callTool({
      name: 'create-icon-tokens',
      arguments: { icons: [{ name: 'brandMark', svg, allowMultiColor: true }] },
    });
    expect(textOf(accepted)).toContain('1 of 1 encoded');
    await client.close();
  });
});

describe('CDK utilities', () => {
  it('registers the utility tools and lists the CDK grouped by module', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('list-utilities');
    expect(names).toContain('get-utility');

    const list = textOf(
      await client.callTool({ name: 'list-utilities', arguments: { module: 'clipboard' } })
    );
    expect(list).toContain('## clipboard');
    expect(list).toContain('**copyToClipboard** `copy-to-clipboard`');
    expect(list).not.toContain('## number');
    await client.close();
  });

  it('answers get-utility by id or exported name, with the module docs attached', async () => {
    const client = await connect();
    const byId = textOf(
      await client.callTool({ name: 'get-utility', arguments: { id: 'copy-to-clipboard' } })
    );
    const byName = textOf(
      await client.callTool({ name: 'get-utility', arguments: { id: 'copyToClipboard' } })
    );
    expect(byName).toBe(byId);
    expect(byId).toContain("import { copyToClipboard } from '@uni-design-system/uni-angular';");
    expect(byId).toContain(
      'function copyToClipboard(content: ClipboardContent): Promise<ClipboardCopyResult>'
    );
    expect(byId).toContain('**Same module:** `ClipboardCopyResult`');
    expect(byId).toContain('## Copying rich content');

    const missing = textOf(
      await client.callTool({ name: 'get-utility', arguments: { id: 'nope' } })
    );
    expect(missing).toContain('No utility found');
    await client.close();
  });

  it('finds utilities through search and serves them as resources', async () => {
    const client = await connect();
    const hits = textOf(
      await client.callTool({ name: 'search', arguments: { query: 'clipboard', kind: 'utility' } })
    );
    expect(hits).toContain('_[utility]_ **copyToClipboard (clipboard)**');

    const resource = await client.readResource({ uri: 'uni://utilities/permission-service' });
    expect((resource.contents[0] as { text?: string }).text).toContain(
      '# PermissionService `permission-service`'
    );
    await client.close();
  });
});
