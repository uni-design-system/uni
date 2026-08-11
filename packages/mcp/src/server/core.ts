/**
 * Server core — builds a fully-wired `McpServer` (tools + resources) over the
 * in-memory Uni index. Transport-agnostic: `stdio.ts` and `http.ts` both call
 * `createUniServer()`, so local and remote share exactly one implementation.
 */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as store from './store.js';
import { formatGeneratedTheme } from './generate.js';
import { formatIconTokens } from './icons.js';
import {
  buildGeneratedTheme,
  buildStoredTheme,
  summarizeEnvelope,
  type BuildResult,
} from './theme-json.js';

const FrameworkArg = z.enum(['angular', 'react']);

/** `{ content: [text] }` — the shape every tool returns. */
function text(body: string) {
  return { content: [{ type: 'text' as const, text: body }] };
}

/** Brand-seed inputs, shared by the file and runtime theme generators. */
const ThemeGenerationInput = {
  brand: z
    .union([z.string(), z.array(z.string()).min(1).max(3)])
    .describe('Brand hex color(s), e.g. "#0052FF". 2–3 colors map to primary/secondary/tertiary.'),
  vibe: z
    .enum(['jewel', 'pastel', 'earth', 'neutral', 'florescent'])
    .optional()
    .describe('Tonal character; defaults to a category inferred from the seed chroma.'),
  scheme: z
    .enum(['monochromatic', 'analogous', 'complimentary', 'splitComplimentary', 'triadic'])
    .optional()
    .describe('Hue-wheel relationship for generated roles; auto-classified for multi-color input.'),
  name: z.string().optional().describe('Theme display name, defaults to "Brand".'),
};

/**
 * Output contract for the runtime theme tools. The theme itself is typed as an
 * opaque object on purpose: uni-core's `parseTheme` is the single source of
 * truth for theme shape, and a zod mirror here would drift from it.
 */
const RuntimeThemeOutput = {
  themes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        mode: z.enum(['light', 'dark']),
        theme: z
          .record(z.string(), z.unknown())
          .describe('A validated UniTheme with the built-in icon set elided.'),
      })
    )
    .describe('Registration-ready themes.'),
  contrast: z
    .object({
      summary: z.string(),
      pass: z.boolean(),
      worstRatio: z.number(),
      failing: z.array(
        z.object({
          mode: z.string(),
          foreground: z.string(),
          background: z.string(),
          ratio: z.number(),
          required: z.number(),
        })
      ),
    })
    .optional()
    .describe('WCAG audit of the generated colors; absent for themes that ship with Uni.'),
  apply: z
    .object({ snippet: z.string(), note: z.string() })
    .describe('How to register the theme, including the icon-hydration rule.'),
  iconsElided: z.literal(true),
};

/**
 * Structured results carry the payload; the text block is a short summary
 * rather than a duplicate serialization (the spec's SHOULD), because repeating
 * ~14 KB of theme JSON would double the cost of every call.
 */
function runtimeTheme(result: BuildResult) {
  if (!result.ok) return { content: [{ type: 'text' as const, text: result.error }], isError: true };
  return {
    content: [{ type: 'text' as const, text: summarizeEnvelope(result.envelope) }],
    structuredContent: result.envelope as unknown as Record<string, unknown>,
  };
}

function notFound(kind: string, id: string) {
  return text(
    `No ${kind} found with id \`${id}\`. Use the matching list/search tool to discover valid ids.`
  );
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
        'Use real token ids (via `list-tokens`) instead of raw hex. Theming has four tools, ' +
        'split by what you need: to brand an app permanently, call `generate-uni-theme` once ' +
        'and write the returned static `uni-theme.ts` — then change look and feel by editing ' +
        "that file's tokens directly, since shared tokens propagate everywhere; to apply a " +
        'theme immediately with no build step (previews, per-tenant theming, generated UI), ' +
        'call `generate-runtime-theme` or `get-runtime-theme` and register the JSON they ' +
        'return; to read a theme\'s token values without applying one, use `get-theme-template`. ' +
        'Never inline `<svg>` in a component: when you meet inline SVG, or a brand icon set ' +
        'to import, call `create-icon-tokens` to convert it into theme icon tokens, add them ' +
        'to `uni-theme.ts`, and render with `<uni-icon name="…" />`.',
    }
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
      text(store.formatComponentList(store.listComponents({ framework, category, status })))
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
      inputSchema: {
        id: z.string().describe('component id, e.g. "button"'),
        framework: FrameworkArg.optional(),
      },
    },
    async ({ id, framework }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatComponent(c, framework)) : notFound('component', id);
    }
  );

  // -- get-component-examples ------------------------------------------------
  server.registerTool(
    'get-component-examples',
    {
      title: 'Get component examples',
      description:
        'Working, copy-pasteable code snippets for a component (from Storybook stories), with deep links.',
      inputSchema: { id: z.string(), framework: FrameworkArg.optional() },
    },
    async ({ id, framework }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatExamples(c, framework)) : notFound('component', id);
    }
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
    async ({ type, kind, theme }) =>
      text(store.formatTokenList(store.listTokens({ type, kind, theme })))
  );

  // -- get-token -------------------------------------------------------------
  server.registerTool(
    'get-token',
    {
      title: 'Get a design token',
      description:
        'Resolved value, type, style/behavioral classification, alias chain, and per-theme values for one token.',
      inputSchema: {
        id: z.string().describe('token id, e.g. "color.primary" or "input.behavior.height"'),
      },
    },
    async ({ id }) => {
      const t = store.getToken(id);
      return t ? text(store.formatToken(t)) : notFound('token', id);
    }
  );

  // -- get-guidelines --------------------------------------------------------
  server.registerTool(
    'get-guidelines',
    {
      title: 'Get component guidelines',
      description: "Authored when-to-use, do/don't, and accessibility guidance for a component.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const c = store.getComponent(id);
      return c ? text(store.formatGuidelines(c)) : notFound('component', id);
    }
  );

  // -- list-themes -----------------------------------------------------------
  server.registerTool(
    'list-themes',
    {
      title: 'List theme templates',
      description: 'Available Uni theme templates.',
      inputSchema: {},
    },
    async () => text(store.formatThemeList(store.listThemes()))
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
    }
  );

  // -- generate-uni-theme ----------------------------------------------------
  server.registerTool(
    'generate-uni-theme',
    {
      title: 'Generate a Uni brand theme file',
      description:
        'Generate a complete, WCAG-AA light+dark Uni theme from brand hex color(s) and return ' +
        'the static `uni-theme.ts` file content (write it to `src/app/uni-theme.ts`), the ' +
        '`UNI_THEMES` provider registration snippet, and a contrast report. The file is plain ' +
        'editable data and becomes the source of truth: later restyling means editing its ' +
        'tokens (colors, named border primitives, sparse component overrides) — not calling ' +
        'this tool again. Never hardcode hex in components; reference theme tokens.',
      inputSchema: {
        ...ThemeGenerationInput,
        shape: z
          .enum(['sharp', 'modern', 'playful'])
          .optional()
          .describe('Shape language — emits a radii override into the file.'),
        darkMode: z.boolean().optional().describe('Emit the dark theme too. Defaults to true.'),
      },
    },
    async (args) => text(formatGeneratedTheme(args))
  );

  // -- generate-runtime-theme ------------------------------------------------
  server.registerTool(
    'generate-runtime-theme',
    {
      title: 'Generate a Uni brand theme as runtime JSON',
      description:
        'Generate a WCAG-AA light+dark Uni theme from brand hex color(s) and return it as ' +
        'validated JSON data, ready to register live via `ThemeService.registerTheme(theme, ' +
        '{ select: true })` — no file to write, no rebuild. Use this when a theme should apply ' +
        'immediately (previewing a brand, per-tenant theming, generated UI). To brand an app ' +
        'permanently, use `generate-uni-theme` instead: it returns an editable `uni-theme.ts` ' +
        'that becomes the source of truth. The built-in icon set is elided from the payload and ' +
        'restored on registration.',
      inputSchema: {
        ...ThemeGenerationInput,
        shape: z
          .enum(['sharp', 'modern', 'playful'])
          .optional()
          .describe('Shape language — sets the radii scale on the returned themes.'),
        darkMode: z
          .boolean()
          .optional()
          .describe('Include the dark theme too. Defaults to true.'),
      },
      outputSchema: RuntimeThemeOutput,
    },
    async (args) => runtimeTheme(buildGeneratedTheme(args))
  );

  // -- get-runtime-theme -----------------------------------------------------
  server.registerTool(
    'get-runtime-theme',
    {
      title: 'Get a built-in Uni theme as runtime JSON',
      description:
        'A theme that ships with Uni, as a complete validated `UniTheme` ready to register at ' +
        'runtime. Differs from `get-theme-template`, which returns a flat read-only projection ' +
        'of token values for inspection — this returns the real theme object. The built-in icon ' +
        'set is elided from the payload and restored on registration.',
      inputSchema: {
        id: z.string().describe('Theme id, e.g. "LightTheme" or "DarkTheme".'),
      },
      outputSchema: RuntimeThemeOutput,
    },
    async ({ id }) => runtimeTheme(buildStoredTheme(id))
  );

  // -- create-icon-tokens ----------------------------------------------------
  server.registerTool(
    'create-icon-tokens',
    {
      title: 'Convert SVGs into Uni icon tokens',
      description:
        'Convert raw SVG source into theme icon tokens and return a paste-ready `icons` map for ' +
        '`uni-theme.ts`. Use this whenever an app has inline `<svg>` in a component, or a brand ' +
        'icon set to import: move the artwork into the theme once, then render it anywhere with ' +
        '`<uni-icon name="…" />`. Encodes to a `currentColor`-masked data URI (identical to the ' +
        'built-in set), reports which names override built-ins, flags artwork that cannot be ' +
        'masked (multi-color, gradients, no viewBox, raster or external references), and warns ' +
        'when a set mixes viewBox grids. Icons are monochrome — a multi-color logo flattens to a ' +
        'silhouette. Safe to re-run: already-encoded data URIs pass through unchanged.',
      inputSchema: {
        icons: z
          .array(
            z.object({
              name: z
                .string()
                .describe('Token name, e.g. "acmeLogo". Converted to flat camelCase if needed.'),
              svg: z
                .string()
                .describe('Raw SVG source, or an already-encoded data:image/svg+xml URI.'),
              allowMultiColor: z
                .boolean()
                .optional()
                .describe(
                  'Accept multi-color artwork, knowing the mask flattens it to a silhouette.'
                ),
            })
          )
          .min(1)
          .describe('The icons to convert. Pass the whole set at once so grids can be compared.'),
      },
    },
    async ({ icons }) => text(formatIconTokens(icons))
  );

  // -- search ----------------------------------------------------------------
  server.registerTool(
    'search',
    {
      title: 'Search the design system',
      description:
        'Keyword search across components, tokens, themes, and guidelines. Narrow with `kind`.',
      inputSchema: {
        query: z.string(),
        kind: z.enum(['component', 'token', 'theme', 'guideline']).optional(),
      },
    },
    async ({ query, kind }) => text(store.formatSearch(query, store.search(query, kind)))
  );

  registerResources(server);
  return server;
}

/** Read-only, addressable content the host can browse or pin. */
function registerResources(server: McpServer): void {
  server.registerResource(
    'meta',
    'uni://meta',
    {
      title: 'Uni index metadata',
      description: 'Index version, Uni release, framework coverage, counts, build time.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(store.meta, null, 2) },
      ],
    })
  );

  server.registerResource(
    'component',
    new ResourceTemplate('uni://components/{id}', {
      list: async () => ({
        resources: store
          .listComponents()
          .map((c) => ({ uri: `uni://components/${c.id}`, name: c.name, description: c.summary })),
      }),
    }),
    {
      title: 'Uni component',
      description: 'A component reference card.',
      mimeType: 'text/markdown',
    },
    async (uri, { id }) => {
      const c = store.getComponent(String(id));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: c ? store.formatComponent(c) : `Unknown component: ${id}`,
          },
        ],
      };
    }
  );

  server.registerResource(
    'token',
    new ResourceTemplate('uni://tokens/{id}', {
      list: async () => ({
        resources: store.listTokens().map((t) => ({
          uri: `uni://tokens/${t.id}`,
          name: t.id,
          description: `${t.type} = ${t.value}`,
        })),
      }),
    }),
    { title: 'Uni token', description: 'A design token.', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const t = store.getToken(String(id));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: t ? store.formatToken(t) : `Unknown token: ${id}`,
          },
        ],
      };
    }
  );

  server.registerResource(
    'theme',
    new ResourceTemplate('uni://themes/{id}', {
      list: async () => ({
        resources: store
          .listThemes()
          .map((t) => ({ uri: `uni://themes/${t.id}`, name: t.name, description: t.description })),
      }),
    }),
    {
      title: 'Uni theme template',
      description: 'A theme template (style + component options).',
      mimeType: 'text/markdown',
    },
    async (uri, { id }) => {
      const t = store.getTheme(String(id));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: t ? store.formatTheme(t) : `Unknown theme: ${id}`,
          },
        ],
      };
    }
  );

  server.registerResource(
    'guidelines',
    new ResourceTemplate('uni://guidelines/{id}', {
      list: async () => ({
        resources: store.listComponents().map((c) => ({
          uri: `uni://guidelines/${c.id}`,
          name: `${c.name} guidelines`,
          description: c.summary,
        })),
      }),
    }),
    {
      title: 'Uni guidelines',
      description: 'Authored usage guidance for a component.',
      mimeType: 'text/markdown',
    },
    async (uri, { id }) => {
      const c = store.getComponent(String(id));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: c ? store.formatGuidelines(c) : `Unknown component: ${id}`,
          },
        ],
      };
    }
  );
}
