/**
 * Server wiring: a tool that formats correctly but was never registered is
 * invisible to every agent. These drive a real client over an in-memory
 * transport, so registration, schema and dispatch are all exercised.
 */
import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
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
