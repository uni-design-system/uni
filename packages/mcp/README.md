# @uni-design-system/uni-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI
coding assistants (Claude Code, Claude Desktop, Cursor, Continue, …) an
authoritative, version-pinned interface to the **Uni Design System** — the right
component, the right props, the right tokens, and the sanctioned patterns instead
of hallucinated APIs.

It answers from a **built index** (`src/data/uni-index.json`) that is normalized
from the monorepo's own sources at build time, then read at runtime:

| Source | Adapter | Feeds |
|---|---|---|
| `packages/angular` component sources (signals API) | `angular-adapter` | per-framework component API |
| `@uni-design-system/uni-core` themes/tokens | `token-adapter` | tokens (style + behavioral) & theme templates |
| `packages/angular/storybook-static/index.json` + story sources | `storybook-adapter` | copy-pasteable examples |

The model is **framework-aware by construction**: each component carries a
`bindings` map (`angular` today; `react` fills in as `uni-react` reaches parity)
so the same tool call returns the right usage per framework with no schema change.

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
| `search` | keyword search across components, tokens, themes, guidelines |

Resources: `uni://meta`, `uni://components/{id}`, `uni://tokens/{id}`,
`uni://themes/{id}`, `uni://guidelines/{id}`.

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

## Use it — local (stdio)

Claude Code / Claude Desktop / Cursor / Continue all share the same config shape:

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

Or run the built bin directly: `node packages/mcp/dist/stdio.js`.

## Use it — remote (Streamable HTTP, hosted on Render)

The same server core runs behind HTTP for a shared, always-current team endpoint.

- `GET /health` → status + index counts (used by Render's health check)
- `POST /mcp` → JSON-RPC (Streamable HTTP, stateless)

Environment:

| Var | Purpose | Default |
|---|---|---|
| `PORT` | bind port (Render sets this) | `8080` |
| `HOST` | bind address | `0.0.0.0` |
| `UNI_MCP_TOKEN` | if set, require `Authorization: Bearer <token>` | _(none)_ |
| `UNI_ALLOWED_HOSTS` | comma list enabling DNS-rebinding protection | _(none)_ |

Deploy with the repo-root [`render.yaml`](../../render.yaml) blueprint. Client config:

```jsonc
{
  "mcpServers": {
    "uni": {
      "url": "https://uni-mcp.onrender.com/mcp",
      "headers": { "Authorization": "Bearer <UNI_MCP_TOKEN>" }
    }
  }
}
```

## How answers stay current

The index is stamped with the Uni release it was built from (from
`packages/angular`'s version), so an assistant's answers match the version the
developer installed. Regenerate and commit `src/data/uni-index.json` on each
release — ideally wired into the Changesets release action (Phase 3).
