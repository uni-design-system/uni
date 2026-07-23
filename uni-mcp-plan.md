# Uni Design System — MCP Server Plan & Architecture

**Author:** Prepared for George
**Date:** 2026-07-20
**Status:** Rev 2 — decisions incorporated (architecture first — no server code shipped yet)
**Scope covered:** component API reference · code examples/snippets · design tokens · usage guidelines (do/don't) · theme templates
**Decisions locked (see §14):** DTCG-like tokens consumed by Emotion (style *and* behavioral) · `uni-react` pre-parity → Angular first · server lives at `packages/mcp` · MDX is the authoring hub (guidance + embedded stories) · audience is internal **and** external

---

## 1. Goal

Give AI coding assistants (Claude Code, Claude Desktop, Cursor, Continue, etc.) a live, authoritative interface to the Uni Design System so that generated code uses the **right component, the right props, the right tokens, and the sanctioned patterns** — instead of hallucinated APIs.

Concretely, when a developer asks their assistant to "build a settings form with Uni," the model should be able to:

1. Discover that a `uni-input`, `uni-select`, and `uni-button` exist.
2. Read their exact inputs/outputs (Angular) or props (React), including allowed values.
3. Pull a working, on-spec example from Storybook.
4. Reference the correct design tokens and theme options rather than raw hex values.
5. Respect the "do / don't" guidance authored by your team.

The server is **framework-aware**: the same request returns Angular usage today and React usage now-or-soon, because both are first-class in your monorepo.

---

## 2. What we're building against (your actual setup)

From the public repo (`github.com/uni-design-system/uni`) and docs site, Uni is a **pnpm + Turborepo monorepo**:

| Package | npm name | Role | Build |
|---|---|---|---|
| `packages/core` | `@uni-design-system/uni-core` | Design tokens + theme logic | Vite |
| `packages/angular` | `@uni-design-system/uni-angular` | Angular 21 components | ng-packagr |
| `packages/react` | `@uni-design-system/uni-react` | React 18/19 components | Vite |
| `apps/docs` | — | Documentation (MDX) | — |
| `.storybook/` | — | **Centralized** Storybook config | Storybook |

Other relevant facts that shape the design:

- **Storybook is centralized and multi-framework** — React on `:6006`, Angular on `:6007`. This is the single most valuable ingestion source because it already spans both frameworks with the same story/arg vocabulary.
- **Tokens live in one place** (`uni-core`) and are shared across frameworks — so tokens and theme templates are framework-neutral by construction.
- **Changesets + coordinated release cadence** with unified version numbers — so there is a clean, versioned moment to (re)build the MCP index.
- **MDX (~15% of the repo)** — your written guidance already exists in machine-readable prose, ready to surface as "guidelines."

The headline consequence: **the framework-agnostic core is justified today, not "someday."** `uni-react` already exists as a package (even though it's **pre-parity** — see §14), so the per-framework `bindings` design earns its keep immediately: Angular is the first, complete adapter; React is the second adapter that fills in as the library reaches parity; Vue/others are just more adapters after that. We build Angular-first and let React coverage grow as data, not as a rewrite.

---

## 3. Design principles

1. **Normalize once, serve many.** Every framework and token source is transformed into one internal schema. Tools query the normalized model, not raw framework files.
2. **Build-time indexing, runtime read.** A build step ingests the repo/Storybook and emits a single versioned `uni-index.json`. The running server just loads and queries it — fast, deterministic, no live repo access needed at request time.
3. **Version-pinned to a release.** The index is stamped with the Uni release it was built from, so an assistant's answers match the version the developer actually installed.
4. **Framework as a parameter, not a fork.** Tools take an optional `framework: "angular" | "react"` argument; the normalized model carries per-framework bindings side by side.
5. **Local first, remote ready.** Ship stdio for individual developers immediately; the same server core runs behind Streamable HTTP for a shared team endpoint with no rewrite.
6. **Docs are the product.** The quality of `get-component` and guidelines output is only as good as the MDX/JSDoc behind it. The pipeline is designed to reward good authoring, not paper over gaps.

---

## 4. Architecture overview

```
        SOURCES (in your monorepo)                 BUILD-TIME PIPELINE                RUNTIME
 ┌───────────────────────────────┐        ┌──────────────────────────────┐    ┌──────────────────┐
 │ uni-angular  (Angular 21)     │        │  Framework adapters           │    │  Uni MCP Server  │
 │   → Compodoc documentation.json├───────►│   angular-adapter            │    │                  │
 │                               │        │   react-adapter              │    │  Tools:          │
 │ uni-react   (React 18/19)     ├───────►│   (→ common ComponentModel)  │    │   list-components│
 │   → react-docgen-typescript   │        │                              │    │   get-component  │
 │                               │        │  Storybook adapter           │    │   get-examples   │
 │ Storybook  (React+Angular)    ├───────►│   index.json + story source  │    │   list-tokens    │
 │   → index.json, stories, MDX  │        │   + MDX  (examples+guidance) │    │   get-token      │
 │                               │        │                              │    │   get-guidelines │
 │ uni-core   (tokens + theme)   ├───────►│  token adapter               ├───►│   get-theme-tmpl │
 │   → DTCG / Style Dictionary   │        │   (→ TokenModel, ThemeModel) │    │   search         │
 └───────────────────────────────┘        │                              │    │                  │
                                          │        NORMALIZER            │    │  Resources:      │
                                          │            ▼                 │    │   uni://...      │
                                          │      uni-index.json          ├───►│                  │
                                          │   (versioned, per release)   │    │  Transports:     │
                                          └──────────────────────────────┘    │   stdio (now)    │
                                                     ▲                         │   HTTP  (later)  │
                                              CI on Changesets release         └──────────────────┘
                                                                                        │
                                                                          Claude Code / Desktop / Cursor
```

Two clean halves:

- **Pipeline (build time, in CI):** reads your sources, produces `uni-index.json`. Runs on every release.
- **Server (runtime):** a small TypeScript MCP server that loads the index and answers tool/resource calls. Stateless, cache-friendly, trivially hostable.

---

## 5. The normalized data model

This is the heart of the framework-agnostic design. Illustrative TypeScript (final schema will use Zod for validation):

```ts
type Framework = "angular" | "react";

type ComponentModel = {
  id: string;                 // "button"  (stable, framework-neutral)
  name: string;               // "Button"
  status: "stable" | "beta" | "deprecated";
  summary: string;            // one-liner for list views
  description: string;        // full prose (from MDX / JSDoc)
  category: string;           // "forms" | "layout" | "feedback" ...
  version: string;            // Uni release this was built from

  // Per-framework binding — this is what makes it multi-framework
  bindings: Partial<Record<Framework, {
    importPath: string;       // "@uni-design-system/uni-angular"
    selectorOrTag: string;    // "uni-button"  |  "<Button/>"
    api: ApiMember[];         // inputs/outputs (ng) OR props/events (react)
    slots?: SlotModel[];      // content projection / children
  }>>;

  examples: ExampleModel[];   // from Storybook stories
  guidelines: GuidelineModel; // do / don't, a11y, when-to-use
  relatedTokens: string[];    // token ids this component consumes
};

type ApiMember = {
  name: string;
  kind: "input" | "output" | "prop" | "event" | "method";
  type: string;               // "'primary' | 'secondary' | 'ghost'"
  required: boolean;
  default?: string;
  description: string;
  deprecated?: string;
};

type ExampleModel = {
  title: string;              // Storybook story name
  framework: Framework;
  code: string;               // ready-to-paste snippet
  storybookUrl?: string;      // deep link to the live story
};

type GuidelineModel = {
  whenToUse: string;
  dos: string[];
  donts: string[];
  accessibility: string[];
};

type TokenValue = string | number | boolean;

type TokenModel = {
  id: string;                 // "color.brand.primary"  |  "button.behavior.elevateOnHover"
  value: TokenValue;          // resolved value
  type: string;               // "color" | "spacing" | "typography" | "boolean" | "enum" ...
  kind: "style" | "behavioral"; // style → drives Emotion CSS; behavioral → sets a component prop
  target: "emotion-css" | "component-prop"; // how it's actually consumed at runtime
  appliesTo?: string;         // for behavioral tokens: the component id it configures ("button")
  description?: string;
  aliasOf?: string;           // semantic → primitive links (DTCG-style)
  themeValues?: Record<string, TokenValue>; // per-theme (light/dark/...) overrides
};

type ThemeTemplateModel = {
  id: string;                 // "light" | "dark" | "high-contrast" | custom
  description: string;
  // A theme is a MIX of two things (your point #1):
  styleOverrides: Record<string, TokenValue>;                 // → Emotion generates CSS from these
  componentOptions: Record<string, Record<string, TokenValue>>; // behavioral prefs → optional component props
  usage: string;              // how to apply it (theme provider, per framework)
};
```

The **`bindings` map is the whole trick**: one component identity, N framework implementations, added incrementally. Adding Vue or Web Components later means writing one more adapter that populates a new key — no schema change, no tool change.

---

## 6. Data ingestion (adapters)

Each source has a dedicated adapter that emits fragments of the normalized model; the normalizer merges them by component `id`.

### 6.1 Angular API — Compodoc
Compodoc is the Angular-native documentation generator. Run it against `packages/angular` to emit `documentation.json` containing every component's `selector`, `@Input()`/`@Output()` with types, JSDoc descriptions, and methods. This is the **authoritative source for Angular API** — far more reliable than regex-parsing decorators. The `angular-adapter` maps Compodoc entries → `ApiMember[]` under `bindings.angular`.

### 6.2 React API — react-docgen-typescript
`react-docgen-typescript` extracts props (name, type union, required, default, JSDoc) directly from the TS types in `packages/react`. Maps → `ApiMember[]` under `bindings.react`. (`react-docgen` v6 is the fallback if the components aren't all typed as expected.)

### 6.3 Examples + guidelines — MDX is the hub, Storybook is the runtime
You author guidance in **MDX**, and those same MDX pages embed the **Storybook stories** used to test component interactions. So MDX is the single hub that binds prose guidance to runnable examples — the adapter parses MDX first, then resolves each story it references. Concretely:
- **`index.json`** (Storybook's built story index) enumerates every story and its component/framework — the backbone of the example catalog.
- **Story source** provides the canonical, copy-pasteable usage per story → `ExampleModel`.
- **MDX docs pages** carry the human-authored prose: when-to-use, do/don't, accessibility → `GuidelineModel`.
- **`argTypes`** cross-check and enrich the API extracted in 6.1/6.2 (descriptions, control options).

Because Storybook already spans Angular and React with a shared vocabulary, it's also the natural place to keep the two framework bindings aligned.

### 6.4 Tokens + themes — uni-core (Emotion-aware, style + behavioral)
Your tokens resemble **DTCG** but are **not** plain CSS: they're consumed by **Emotion** to generate CSS *and* to set optional properties on the components themselves. A theme is therefore a **mix of style tokens and behavioral preferences** (your point #1). Two consequences for the adapter:

- **Read the source objects, not the output CSS.** We ingest the DTCG-like token/theme objects exported from `@uni-design-system/uni-core` (the same TS/JSON input Emotion consumes), so we capture types, alias chains, and per-theme values. We do **not** scrape generated CSS — with runtime CSS-in-JS there's no static stylesheet to scrape, and the source objects are the authoritative form anyway.
- **Classify every token by `kind`.** Style tokens (`kind: "style"`, `target: "emotion-css"`) flow into a theme's `styleOverrides` — what Emotion turns into CSS. Behavioral tokens (`kind: "behavioral"`, `target: "component-prop"`) flow into `componentOptions` — optional props the component reads — and record which component they `appliesTo`.

The payoff: `get-theme-template` returns the two buckets **separately**, so an assistant applies each the right way — style via the theme provider (Emotion), behavioral options via component inputs/props — instead of trying to express a behavioral preference as CSS. This is what makes "theme templates for setting colors **and component options**" work correctly rather than approximately.

### 6.5 Normalizer
Merges all fragments by `id`, validates against the Zod schema, stamps the current Uni `version`, and writes `uni-index.json`. Fails the build loudly on schema violations or on a component that has a Storybook story but no discoverable API (a signal your docs drifted).

---

## 7. MCP surface (tools, resources, prompts)

### 7.1 Tools

| Tool | Input | Returns |
|---|---|---|
| `list-components` | `{ framework?, category?, status? }` | Compact inventory: id, name, summary, available frameworks |
| `get-component` | `{ id, framework? }` | Full `ComponentModel` (API, description, related tokens); framework-scoped bindings if `framework` given |
| `get-component-examples` | `{ id, framework? }` | Working code snippets + Storybook deep links |
| `list-tokens` | `{ type?, theme? }` | Token inventory filtered by type/theme |
| `get-token` | `{ id }` | Resolved value, type, alias chain, per-theme values |
| `get-guidelines` | `{ id }` | when-to-use, do/don't, accessibility |
| `list-themes` | `{}` | Available theme templates |
| `get-theme-template` | `{ id }` | Two buckets kept distinct: **style overrides** (→ Emotion CSS) and **component options** (behavioral props), plus how to apply each per framework |
| `search` | `{ query, kind? }` | Cross-cutting search across components, tokens, guidelines (keyword first; optional semantic later — see §11) |

Design notes:
- Every tool takes an **optional `framework`**; omitted = return all frameworks, so a React-only shop and a mixed shop both get sensible defaults.
- Outputs are **AI-optimized text/JSON**, not raw dumps — e.g. `get-component` renders a tight markdown card (signature, key props, one example, gotchas) rather than the entire model, keeping token usage low. Large payloads use `resource_link` return content.
- Keep the tool count lean (~9). Too many tools degrades model tool-selection accuracy; categories are handled by arguments, not by generating `getButtons`/`getForms`/etc.

### 7.2 Resources

Read-only, addressable content the host can browse or pin:

- `uni://components/{id}` — the component card
- `uni://tokens/{id}` — a token
- `uni://themes/{id}` — a theme template
- `uni://guidelines/{id}` — guidance page
- `uni://meta` — index version, Uni release, framework coverage, build timestamp

Resources complement tools: tools are how the model *searches/acts*; resources are stable URIs a user can attach or a client can cache.

### 7.3 Prompts (optional, phase 2)

Reusable slash-style templates, e.g. `scaffold-uni-form` or `migrate-hex-to-tokens`, that pre-wire the right tool calls. Nice-to-have, not required for v1.

---

## 8. Transports & deployment

The SDK (`@modelcontextprotocol/sdk`, `McpServer`) lets one server core expose two transports:

**Local (ship first) — `StdioServerTransport`.** The server runs as a spawned process on the developer's machine, wired into their client config. Zero infra, works offline, ideal for the initial rollout and for dogfooding inside your own team. Distribute as an npm bin (`npx @uni-design-system/uni-mcp`) that bundles the latest matching index.

**Remote (ship later) — `StreamableHTTPServerTransport`.** The same core behind an HTTP endpoint (e.g. Cloudflare Workers or a small Node service) so the whole org shares one always-current server. Use the SDK's `createMcpExpressApp` / `createMcpHonoApp` helper, which enables **Host-header validation / DNS-rebinding protection** by default. Add auth (API key or SSO/OAuth) and per-release index selection at this stage.

Recommended path given your **internal + external** audience: **start stdio for internal dogfooding, then stand up the HTTP endpoint for external consumers** — same core, no rewrite. Serving external users makes the remote endpoint a *planned* phase rather than optional, and it adds two requirements: **auth tiers** (internal callers can see unreleased/beta components; external callers see published versions only) and **per-release index selection** so an external consumer on Uni v2.3 gets v2.3 answers. A public one-line install doc rounds it out.

---

## 9. Sync & versioning strategy

This is what keeps the server honest as Uni evolves and as more frameworks land.

1. **Trigger on release.** Hook the index build into your existing **Changesets** release GitHub Action. Every coordinated version bump rebuilds `uni-index.json` and stamps it with that version.
2. **Publish the index as a versioned artifact.** Either its own npm package (`@uni-design-system/uni-mcp-index`) or a release asset. The stdio server depends on a compatible index version; the HTTP server can hold several and serve the one matching the caller's installed Uni version. **For external consumers, publish released versions only** — the build tags each entry's `status`, and the external-facing endpoint filters out `beta`/unreleased so outside users never get answers about components that aren't public yet.
3. **Framework coverage is data, not code.** When React reaches parity (or Vue arrives), the adapter populates more `bindings` keys and the index's `meta.frameworks` grows — clients automatically see the new coverage.
4. **Drift detection in CI.** The normalizer fails the build if a component ships without API docs or a story, turning "the MCP server is stale" into a caught error at release time rather than a silent wrong answer months later.
5. **Changelog surfacing (optional).** Fold Changesets entries into `get-component` output as "changed in vX.Y" so assistants can warn about recently altered APIs.

---

## 10. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript | Matches your monorepo (79.6% TS) |
| MCP | `@modelcontextprotocol/sdk` | Official SDK; `registerTool`/`registerResource`, both transports |
| Validation | `zod` | Schema for the index + tool inputs |
| Angular extraction | `@compodoc/compodoc` | Angular-native API JSON |
| React extraction | `react-docgen-typescript` | Prop extraction from TS |
| Storybook | `index.json` + story/MDX parse | Examples + guidelines |
| Dev loop | `tsx`, `@modelcontextprotocol/inspector` | Hot reload + interactive tool testing |
| Bundle | `tsup` | Ship a small npm bin |
| Repo placement | new `packages/mcp` in the monorepo | Lives beside the sources it indexes; shares CI |

Putting the server at `packages/mcp` means it rides your existing Turborepo pipeline, pnpm workspace, and release automation — the index build is just another Turbo task.

---

## 11. Search: keyword now, semantic optional later

v1 `search` is keyword/fuzzy over the index (fast, zero infra, deterministic). If discovery needs grow — "find me something for empty states" — a phase-3 upgrade adds embeddings (e.g. a small local model or a hosted vector store) for semantic search, exactly as mature design-system MCP servers do. Not needed to launch; the interface stays the same so it's a drop-in.

---

## 12. Client configuration (what developers will paste)

**Claude Code / Claude Desktop (`mcp` config), stdio:**

```json
{
  "mcpServers": {
    "uni": {
      "command": "npx",
      "args": ["-y", "@uni-design-system/uni-mcp@latest"]
    }
  }
}
```

**Remote (phase 2), HTTP:**

```json
{
  "mcpServers": {
    "uni": {
      "url": "https://mcp.uni-design-system.<yourdomain>/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

The same config shape works for Cursor, Continue, and Zed — one server, every MCP-capable client.

---

## 13. Phased rollout

**Phase 0 — Spike (½–1 day).** Wire Compodoc on `uni-angular` and dump `documentation.json`; export tokens from `uni-core`. Confirm both parse cleanly. This de-risks ingestion before any server code. *Deliverable: a sample `uni-index.json` for 3–4 components + tokens.*

**Phase 1 — Local MVP, Angular-first (2–4 days).** Build the normalizer + stdio server with `list-components`, `get-component`, `get-component-examples`, `list-tokens`, `get-token`, `get-guidelines`, plus the **Angular adapter** and the **Emotion-aware token adapter** (style/behavioral split). React is intentionally deferred — `uni-react` is pre-parity. Test in MCP Inspector and Claude Code. *Deliverable: working local server, Angular-complete, tokens live.*

**Phase 2 — Themes + MDX + React-as-it-lands (2–3 days).** Add `list-themes` / `get-theme-template` (both buckets), the MDX adapter (guidance + embedded-story resolution), `search`, and the **React adapter** wired to populate `bindings.react` for whatever has reached parity so far. *Deliverable: theme templates live, MDX-driven guidance/examples, React coverage tracking the library.*

**Phase 3 — CI + distribution (1–2 days).** Hook the index build into the **Changesets** release action, publish the index artifact, ship the `npx` package, write the "add Uni to your assistant" doc. *Deliverable: self-updating server, one-line install.*

**Phase 4 — Remote + external (planned, not optional).** Streamable HTTP endpoint with **auth tiers** (internal = full/unreleased, external = published only), per-release index selection, and a public install doc for external consumers. Semantic search added here if discovery needs warrant it.

---

## 14. Decisions — resolved

| # | Decision | Design impact |
|---|---|---|
| 1 | **Tokens are DTCG-like but Emotion-driven**, and a theme mixes **style + behavioral** preferences | Token adapter reads source objects (not CSS); every token tagged `kind: style\|behavioral`; `ThemeTemplateModel` splits `styleOverrides` (→ Emotion CSS) from `componentOptions` (→ props). §5, §6.4 |
| 2 | **`uni-react` not at parity** | Angular is the first/complete adapter (Phase 1); React coverage grows as data in Phase 2 — no core changes. §4, §13 |
| 3 | **Server lives at `packages/mcp`** in the monorepo | Rides existing Turborepo/pnpm/Changesets CI; index build is another Turbo task. §10 |
| 4 | **MDX is the authoring hub**, and MDX embeds the Storybook stories | MDX adapter is primary for guidelines *and* example discovery; it resolves referenced stories rather than crawling Storybook blindly. §6.3 |
| 5 | **Audience is internal + external** | Remote HTTP endpoint is planned (not optional); auth tiers + released-only filtering for external; per-release index selection. §8, §9, §13 |

### Smaller things worth confirming when we scaffold

- **Exact token export shape** — the concrete path/format `uni-core` exposes its token + theme objects in (e.g. a `themes/*.ts` export, a generated `tokens.json`). One quick look at the source pins the token adapter precisely.
- **Behavioral-token surface** — a short list of which properties are "behavioral" (component options) vs purely style, so the `kind` classifier starts from your intent rather than a guess.
- **External auth mechanism** — API keys vs SSO/OAuth for the eventual public endpoint (Phase 4 detail, not blocking).

None of these block starting Phase 0/1 — they're refinements we resolve by reading the actual `uni-core` source when we build.

---

## Sources

- [Your Design System Needs An MCP Server — James Ives (dev.to)](https://dev.to/jamesives/your-design-system-needs-an-mcp-server-4c7a)
- [How to build an MCP server for UI libraries + repo (dev.to)](https://dev.to/mnove/how-to-build-a-mcp-model-context-protocol-server-for-ui-libraries-repo-5ea2)
- [MCP TypeScript SDK — server guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md)
- [southleft/design-systems-mcp (prior art)](https://github.com/southleft/design-systems-mcp)
- [Design Systems and AI: Why MCP Servers Are The Unlock — Figma](https://www.figma.com/blog/design-systems-ai-mcp/)
- [Uni Design System repo](https://github.com/uni-design-system/uni) · [Angular docs](https://uni-design-system.github.io/uni/docs/angular)
