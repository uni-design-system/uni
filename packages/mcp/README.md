# @uni-design-system/uni-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI
coding assistants (Claude Code, Claude Desktop, Cursor, Continue, …) an
authoritative, version-pinned interface to the **Uni Design System** — the right
component, the right props, the right tokens, and the sanctioned patterns instead
of hallucinated APIs.

## Getting started

You need a project that already uses Uni (e.g. `@uni-design-system/uni-angular`)
and an MCP-capable assistant. The server runs locally over stdio via `npx` — no
install, no build step, no API key.

### Claude Code

From your project root:

```bash
claude mcp add --scope project uni -- npx -y @uni-design-system/uni-mcp@latest
```

`--scope project` writes the config to a `.mcp.json` you can commit, so the
whole team gets the server. Equivalent `.mcp.json`:

```jsonc
{
  "mcpServers": {
    "uni": {
      "command": "npx",
      "args": ["-y", "@uni-design-system/uni-mcp@latest"]
    }
  }
}
```

### Cursor / Claude Desktop / Continue

All share the same config shape as the `.mcp.json` above — put it in
`.cursor/mcp.json` (Cursor), `claude_desktop_config.json` (Claude Desktop), or
your client's MCP settings.

### Pin it to your installed Uni version

All Uni packages release under one coordinated version number, this server
included. It answers from an index stamped with the release it was built from,
so for answers that exactly match the APIs you have installed, replace
`@latest` with the version of `@uni-design-system/uni-angular` in your
`package.json` — they are the same number:

```jsonc
"args": ["-y", "@uni-design-system/uni-mcp@10.2.0"]
```

`@latest` is fine when you track current Uni releases.

> **Versions before 10.2.0.** This server used to release on its own `4.x` line
> while the library was on `10.x`, so pinning it to your installed version was
> impossible and the index could go stale whenever a release did not happen to
> bump it. It now moves with the rest of the packages, and every release
> republishes it — so `uni-mcp@10.2.0` describes `uni-angular@10.2.0`, exactly.

### Verify and try it

In Claude Code, `/mcp` should list **uni** as connected. Then ask things like:

- *"What Uni components are available for collecting user input?"*
- *"Show me the props and a working example for `uni-button`."*
- *"Which Uni theme tokens should style a card's background and border?"*
- *"When should I use a drawer vs a dialog? Any accessibility requirements?"*
- *"Generate a Uni theme from our brand color `#0052FF` and wire it up."*

That last one uses the `generate-uni-theme` tool: it returns a complete
WCAG-AA light + dark `uni-theme.ts` file (plus the `UNI_THEMES` provider
snippet and a contrast report). The generated file is plain, editable data and
becomes your app's styling source of truth — restyle later by editing its
tokens, never by hardcoding hex values in components.

## Tools

| Tool | Returns |
|---|---|
| `list-components` | inventory (id, name, summary, category, frameworks) |
| `get-component` | full API card for one component (framework-scoped) |
| `get-component-examples` | working snippets + Storybook links |
| `list-tokens` | tokens filtered by type / kind / theme |
| `get-token` | resolved value, style/behavioral kind, per-theme values |
| `get-guidelines` | when-to-use, do/don't, accessibility |
| `list-themes` | theme templates |
| `get-theme-template` | **style overrides** (→ Emotion CSS) and **component options** (→ props), kept distinct |
| `generate-uni-theme` | complete WCAG-AA light+dark `uni-theme.ts` from brand hex color(s), with vibe/scheme/shape options, provider registration snippet, and contrast report |
| `generate-runtime-theme` | the same generated theme as validated JSON for `registerTheme()` — applies immediately, no file, no rebuild |
| `get-runtime-theme` | a theme that ships with Uni (`LightTheme`, `DarkTheme`) as a registerable `UniTheme` |
| `export-dtcg-tokens` | a built-in theme's color/radius/spacing scales as W3C DTCG JSON (Style Dictionary compatible) |
| `create-icon-tokens` | convert raw SVG into `currentColor`-masked theme icon tokens |
| `get-changelog` | release notes per package/version — how a coding agent answers "what changed since the version I have installed" |
| `search` | keyword search across components, tokens, themes, guidelines |

### Which theme tool?

`generate-uni-theme` brands an app **permanently**: it returns an editable
`uni-theme.ts` that becomes the source of truth, so later restyling means
editing that file. The two `*-runtime-theme` tools return theme **data** for
`ThemeService.registerTheme(theme, { select: true })` — use them when a theme
should apply immediately with no build step (brand previews, per-tenant
theming, generated UI). `get-theme-template` neither brands nor applies: it
reports a theme's token values for inspection.

Runtime theme payloads omit the 61 built-in icons — ~71% of a serialized
theme, and bytes every uni-core consumer already ships. `ThemeService` restores
them on registration; outside Angular, call `hydrateTheme()` from uni-core.

Resources: `uni://meta`, `uni://components/{id}`, `uni://tokens/{id}`,
`uni://themes/{id}`, `uni://guidelines/{id}`.

## Hosted endpoint (currently dormant)

> **Status:** no hosted deployment is currently running — the stdio server via
> `npx` (Getting started above) is the canonical way to use this package. The
> HTTP mode below is kept, documented, and deployable (repo-root
> [`render.yaml`](../../render.yaml)) for when a consumer that can't spawn
> processes appears: browser-based MCP clients (e.g. claude.ai custom
> connectors) or apps fetching theme JSON by URL. stdio also has the property
> a shared endpoint can't offer: pin the package version and answers match the
> Uni release you actually have installed.

The same server core runs behind HTTP for a shared, always-current team
endpoint — useful when you'd rather not run node processes per client.

- `GET /health` → status + index counts (used by Render's health check)
- `POST /mcp` → JSON-RPC (Streamable HTTP, stateless)
- `GET /themes` → the ids available as runtime theme JSON
- `GET /themes/{id}.json` → one registerable theme, same payload as `get-runtime-theme`

The theme routes are the registry channel for apps that fetch a theme without
speaking MCP. They are public, read-only and CORS-enabled so a browser can
fetch them directly; `/mcp` stays token-guarded and same-origin.

```ts
// When a deployment is live, replace <host> with its origin:
const { themes } = await fetch('https://<host>/themes/DarkTheme.json').then((r) => r.json());
themeService.registerTheme(themes[0].theme, { select: true });
```

Client config (when deployed):

```jsonc
{
  "mcpServers": {
    "uni": {
      "url": "https://<host>/mcp",
      "headers": { "Authorization": "Bearer <UNI_MCP_TOKEN>" }
    }
  }
}
```

Environment:

| Var | Purpose | Default |
|---|---|---|
| `PORT` | bind port (Render sets this) | `8080` |
| `HOST` | bind address | `0.0.0.0` |
| `UNI_MCP_TOKEN` | if set, require `Authorization: Bearer <token>` | _(none)_ |
| `UNI_ALLOWED_HOSTS` | comma list enabling DNS-rebinding protection | _(none)_ |

Deploy with the repo-root [`render.yaml`](../../render.yaml) blueprint.

## How it's built

The server answers from a **built index** (`src/data/uni-index.json`) that is
normalized from the monorepo's own sources at build time, then read at runtime:

| Source | Adapter | Feeds |
|---|---|---|
| `packages/angular` component sources (signals API) | `angular-adapter` | per-framework component API |
| `@uni-design-system/uni-core` themes/tokens | `token-adapter` | tokens (style + behavioral) & theme templates |
| component `.mdx` docs pages (`## Overview` / `## Do` / `## Don't` / `## Accessibility`) | `mdx-adapter` | authored guidelines |
| `packages/angular/storybook-static/index.json` + story sources | `storybook-adapter` | copy-pasteable examples |

The model is **framework-aware by construction**: each component carries a
`bindings` map (`angular` today; `react` fills in as `uni-react` reaches parity)
so the same tool call returns the right usage per framework with no schema change.

## Develop

```bash
pnpm --filter @uni-design-system/uni-mcp build-index   # regenerate the index from sources
pnpm --filter @uni-design-system/uni-mcp dev           # stdio server, hot reload
pnpm --filter @uni-design-system/uni-mcp inspect       # open the MCP Inspector
pnpm --filter @uni-design-system/uni-mcp serve:http    # local HTTP server
```

`build` runs `build-index` then bundles with `tsup`. Examples require
`packages/angular/storybook-static/index.json` to exist (`pnpm build-storybook`);
without it the index still builds, just with no examples.

## How answers stay current

The index is stamped with the Uni release it was built from (from
`packages/angular`'s version), so an assistant's answers match the version the
developer installed. Regenerate and commit `src/data/uni-index.json` on each
release — ideally wired into the Changesets release action (Phase 3).
