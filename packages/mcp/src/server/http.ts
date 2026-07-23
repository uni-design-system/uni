/**
 * HTTP entry — Streamable HTTP transport for a shared, always-current team
 * endpoint. Runs stateless (a fresh server+transport per request) so it scales
 * horizontally and is trivial to host on Render.
 *
 * Env:
 *   PORT               port to bind (Render sets this)               default 8080
 *   HOST               bind address                                  default 0.0.0.0
 *   UNI_MCP_TOKEN      if set, require `Authorization: Bearer <it>`  default none
 *   UNI_ALLOWED_HOSTS  comma list for DNS-rebinding protection       default none
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createUniServer } from './core.js';
import { meta } from './store.js';

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';
const TOKEN = process.env.UNI_MCP_TOKEN;
const ALLOWED_HOSTS = process.env.UNI_ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean);

function send(res: ServerResponse, status: number, body: unknown) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json' });
  res.end(payload);
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c as Buffer));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function authorized(req: IncomingMessage): boolean {
  if (!TOKEN) return true;
  const header = req.headers.authorization ?? '';
  return header === `Bearer ${TOKEN}`;
}

/** JSON-RPC error envelope for pre-transport failures. */
function rpcError(res: ServerResponse, status: number, message: string) {
  send(res, status, { jsonrpc: '2.0', error: { code: -32000, message }, id: null });
}

async function handleMcp(req: IncomingMessage, res: ServerResponse) {
  if (!authorized(req)) return rpcError(res, 401, 'Unauthorized');

  // Stateless: isolate each request in its own server+transport instance.
  const server = createUniServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    ...(ALLOWED_HOSTS?.length ? { enableDnsRebindingProtection: true, allowedHosts: ALLOWED_HOSTS } : {}),
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    const body = await readBody(req);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    console.error('[uni-mcp] request error:', err);
    if (!res.headersSent) rpcError(res, 500, 'Internal server error');
  }
}

const httpServer = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
    return send(res, 200, { status: 'ok', service: 'uni-mcp', uniRelease: meta.version, ...meta.counts });
  }
  if (url.pathname === '/mcp') return void handleMcp(req, res);
  return send(res, 404, { error: 'Not found. POST JSON-RPC to /mcp; GET /health for status.' });
});

httpServer.listen(PORT, HOST, () => {
  console.error(`[uni-mcp] HTTP server on http://${HOST}:${PORT}/mcp (Uni v${meta.version})`);
  if (!TOKEN) console.error('[uni-mcp] WARNING: no UNI_MCP_TOKEN set - endpoint is unauthenticated.');
});
