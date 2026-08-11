/**
 * HTTP entry — Streamable HTTP transport for a shared, always-current team
 * endpoint. Runs stateless (a fresh server+transport per request) so it scales
 * horizontally and is trivial to host on Render.
 *
 * Also serves the theme registry (`GET /themes`, `GET /themes/:id.json`) for
 * apps that fetch a theme without speaking MCP. Those routes are public,
 * read-only and CORS-enabled — they exist to be fetched from a browser —
 * whereas `/mcp` stays token-guarded and same-origin. Like the index, the
 * themes served are the snapshot of uni-core bundled at build time.
 *
 * Env:
 *   PORT               port to bind (Render sets this)               default 8080
 *   HOST               bind address                                  default 0.0.0.0
 *   UNI_MCP_TOKEN      if set, require `Authorization: Bearer <it>`  default none
 *                      (applies to /mcp only; /health and /themes are public)
 *   UNI_ALLOWED_HOSTS  comma list for DNS-rebinding protection       default none
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createUniServer } from './core.js';
import { meta } from './store.js';
import { buildStoredTheme, listRuntimeThemes } from './theme-json.js';

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';
const TOKEN = process.env.UNI_MCP_TOKEN;
const ALLOWED_HOSTS = process.env.UNI_ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean);

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json',
    ...headers,
  });
  res.end(payload);
}

/**
 * Theme JSON is public, read-only data meant for browser apps, so it opts into
 * cross-origin reads. Deliberately scoped to the theme routes: `/mcp` carries
 * the token-guarded RPC surface and must not become reachable from any page.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'public, max-age=300',
};

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

/** `GET /themes` (index) and `GET /themes/:id.json` (one registerable theme). */
function handleThemes(res: ServerResponse, pathname: string) {
  if (pathname === '/themes') {
    return send(res, 200, { themes: listRuntimeThemes() }, CORS);
  }

  const id = pathname.slice('/themes/'.length).replace(/\.json$/, '');
  const result = buildStoredTheme(id);
  return result.ok
    ? send(res, 200, result.envelope, CORS)
    : send(res, 404, { error: result.error }, CORS);
}

const httpServer = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const isThemeRoute = url.pathname === '/themes' || url.pathname.startsWith('/themes/');

  if (req.method === 'OPTIONS' && isThemeRoute) return send(res, 204, '', CORS);

  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
    return send(res, 200, { status: 'ok', service: 'uni-mcp', uniRelease: meta.version, ...meta.counts });
  }
  if (req.method === 'GET' && isThemeRoute) return handleThemes(res, url.pathname);
  if (url.pathname === '/mcp') return void handleMcp(req, res);
  return send(res, 404, {
    error: 'Not found. POST JSON-RPC to /mcp; GET /health for status; GET /themes for theme JSON.',
  });
});

httpServer.listen(PORT, HOST, () => {
  console.error(`[uni-mcp] HTTP server on http://${HOST}:${PORT}/mcp (Uni v${meta.version})`);
  if (!TOKEN) console.error('[uni-mcp] WARNING: no UNI_MCP_TOKEN set - endpoint is unauthenticated.');
});
