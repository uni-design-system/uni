/**
 * Stdio entry — the local transport. Runs as a spawned process wired into a
 * client's MCP config (Claude Code/Desktop, Cursor, ...). Zero infra, offline.
 *
 *   npx @uni-design-system/uni-mcp
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createUniServer } from './core.js';

async function main() {
  const server = createUniServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Never write to stdout here — stdout is the JSON-RPC channel.
  console.error('[uni-mcp] stdio server ready');
}

main().catch((err) => {
  console.error('[uni-mcp] fatal:', err);
  process.exit(1);
});
