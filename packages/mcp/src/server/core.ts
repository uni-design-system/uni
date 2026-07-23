/**
 * Server core — builds a fully-wired `McpServer` (tools + resources) over the
 * in-memory Uni index. Transport-agnostic: `stdio.ts` and `http.ts` both call
 * `createUniServer()`, so local and remote share exactly one implementation.
 */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as store from './store.js';

const FrameworkArg = z.enum(['angular', 'react']);

/** `{ content: [text] }` — the shape every tool returns. */
function text(body: string) {
  return { content: [{ type: 'text' as const, text: body }] };
}

function notFound(kind: string, id: string) {
  return text(`No ${kind} found with id \`${id}\`. Use the matching list/search tool to discover valid ids.`);
}

export function createUniServer(): McpServer {
  const server = new McpServer(
    { name: 'uni-design-system', version: store.meta.version },
    {
      instructions:
        'Authoritative interface to the Uni Design System. Prefer these tools over ' +
        'recalling component APIs or token values from memory: names, props, and tokens ' +
        'here match the exact Uni release the developer installed. Start with ' +
        '`list-components` or `search`, then `get-component` / `get-component-examples`. ' +
        'Use real token ids (via `list-tokens`) instead of raw hex; apply themes with ' +
        '`get-theme-template` (style overrides go through Emotion, component options are props).',
    },
  );

  // -- list-components -------------------------------------------------------
  server.registerTool(
    'list-components',
    {
      title: 'List Uni components',
      description:
        'Compact inventory of Uni components: id, name, summary, category, and which ' +
        'frameworks each supports. Filter by framework, category, or status.',
      inputSchema: {
        framework: FrameworkArg.optional(),
        category: z.string().optional().describe('e.g. forms, layout, feedback, data, primitives'),
        status: z.enum(['stable', 'beta', 'deprecated']).optional(),
      },
    },
    async ({ framework, category, status }) =>
      text(store.formatComponentList(store.listComponents({ framework, category, status }))),
  );

  // -- get-component ---------------------------------------------------------
  server.registerTool(
    'get-component',
    {
      title: 'Get a Uni component',
      description:
        'Full reference for one component: description, per-framework import + selector/tag, ' +
        'complete API (inputs/outputs or props/events), related tokens, and a sample. ' +
        'Pass `framework` to scope to Angular or React.',
      inputSchema: { id: z.string().describe('component id, e.g. "button"'), framework: FrameworkArg.optional() },
    },
    async ({ id, framework }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatComponent(c, framework)) : notFound('component', id);
    },
  );

  // -- get-component-examples ------------------------------------------------
  server.registerTool(
    'get-component-examples',
    {
      title: 'Get component examples',
      description: 'Working, copy-pasteable code snippets for a component (from Storybook stories), with deep links.',
      inputSchema: { id: z.string(), framework: FrameworkArg.optional() },
    },
    async ({ id, framework }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatExamples(c, framework)) : notFound('component', id);
    },
  );

  // -- list-tokens -----------------------------------------------------------
  server.registerTool(
    'list-tokens',
    {
      title: 'List design tokens',
      description:
        'Inventory of Uni design tokens. Filter by `type` (color, spacing, radius, shadow, ' +
        'border, thickness, typography, ...), `kind` (style|behavioral), or `theme`.',
      inputSchema: {
        type: z.string().optional(),
        kind: z.enum(['style', 'behavioral']).optional(),
        theme: z.string().optional(),
      },
    },
    async ({ type, kind, theme }) => text(store.formatTokenList(store.listTokens({ type, kind, theme }))),
  );

  // -- get-token -------------------------------------------------------------
  server.registerTool(
    'get-token',
    {
      title: 'Get a design token',
      description: 'Resolved value, type, style/behavioral classification, alias chain, and per-theme values for one token.',
      inputSchema: { id: z.string().describe('token id, e.g. "color.primary" or "input.behavior.height"') },
    },
    async ({ id }) => {
      const t = store.getToken(id);
      return t ? text(store.formatToken(t)) : notFound('token', id);
    },
  );

  // -- get-guidelines --------------------------------------------------------
  server.registerTool(
    'get-guidelines',
    {
      title: 'Get component guidelines',
      description: 'Authored when-to-use, do/don\'t, and accessibility guidance for a component.',
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatGuidelines(c)) : notFound('component', id);
    },
  );

  // -- list-themes -----------------------------------------------------------
  server.registerTool(
    'list-themes',
    { title: 'List theme templates', description: 'Available Uni theme templates.', inputSchema: {} },
    async () => text(store.formatThemeList(store.listThemes())),
  );

  // -- get-theme-template ----------------------------------------------------
  server.registerTool(
    'get-theme-template',
    {
      title: 'Get a theme template',
      description:
        'A theme in two distinct buckets: style overrides (apply via the Emotion theme provider) ' +
        'and component options (pass as component inputs/props). Kept separate so each is applied correctly.',
      inputSchema: { id: z.string().describe('theme id, e.g. "LightTheme"') },
    },
    async ({ id }) => {
      const t = store.getTheme(id);
      return t ? text(store.formatTheme(t)) : notFound('theme', id);
    },
  );

  // -- search ----------------------------------------------------------------
  server.registerTool(
    'search',
    {
      title: 'Search the design system',
      description: 'Keyword search across components, tokens, themes, and guidelines. Narrow with `kind`.',
      inputSchema: {
        query: z.string(),
        kind: z.enum(['component', 'token', 'theme', 'guideline']).optional(),
      },
    },
    async ({ query, kind }) => text(store.formatSearch(query, store.search(query, kind))),
  );

  registerResources(server);
  return server;
}

/** Read-only, addressable content the host can browse or pin. */
function registerResources(server: McpServer): void {
  server.registerResource(
    'meta',
    'uni://meta',
    { title: 'Uni index metadata', description: 'Index version, Uni release, framework coverage, counts, build time.', mimeType: 'application/json' },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(store.meta, null, 2) }],
    }),
  );

  server.registerResource(
    'component',
    new ResourceTemplate('uni://components/{id}', {
      list: async () => ({
        resources: store.listComponents().map((c) => ({ uri: `uni://components/${c.id}`, name: c.name, description: c.summary })),
      }),
    }),
    { title: 'Uni component', description: 'A component reference card.', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const c = store.getComponent(String(id));
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: c ? store.formatComponent(c) : `Unknown component: ${id}` }] };
    },
  );

  server.registerResource(
    'token',
    new ResourceTemplate('uni://tokens/{id}', {
      list: async () => ({
        resources: store.listTokens().map((t) => ({ uri: `uni://tokens/${t.id}`, name: t.id, description: `${t.type} = ${t.value}` })),
      }),
    }),
    { title: 'Uni token', description: 'A design token.', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const t = store.getToken(String(id));
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: t ? store.formatToken(t) : `Unknown token: ${id}` }] };
    },
  );

  server.registerResource(
    'theme',
    new ResourceTemplate('uni://themes/{id}', {
      list: async () => ({
        resources: store.listThemes().map((t) => ({ uri: `uni://themes/${t.id}`, name: t.name, description: t.description })),
      }),
    }),
    { title: 'Uni theme template', description: 'A theme template (style + component options).', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const t = store.getTheme(String(id));
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: t ? store.formatTheme(t) : `Unknown theme: ${id}` }] };
    },
  );

  server.registerResource(
    'guidelines',
    new ResourceTemplate('uni://guidelines/{id}', {
      list: async () => ({
        resources: store.listComponents().map((c) => ({ uri: `uni://guidelines/${c.id}`, name: `${c.name} guidelines`, description: c.summary })),
      }),
    }),
    { title: 'Uni guidelines', description: 'Authored usage guidance for a component.', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const c = store.getComponent(String(id));
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: c ? store.formatGuidelines(c) : `Unknown component: ${id}` }] };
    },
  );
}
