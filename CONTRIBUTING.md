# 🦋 Contributing to Uni Design System

Thank you for contributing to the Uni Design System! This document outlines the engineering standards, local workflows, and release guidelines required to keep our cross-framework monorepo healthy, stable, and highly automated.

---

## 🏗️ System Prerequisites

Every machine must align to these foundational environment constraints to satisfy our installation criteria:

- **Node.js:** `>=22.13.0` (Mandatory for native `node:sqlite` store indexing).
- **Package Manager:** `pnpm@11.0.8` strictly enforced. Do **not** use `npm` or `yarn` in this workspace.

---

## 🛠️ Local Development Cycle

### 1. Initialize the Workspace

Clone the repository and spin up your local environment:

```bash
# Install isolated workspace dependencies
pnpm install

# Run the master build in dependency order
pnpm run build

# Start parallel development Storybook instances
pnpm run dev
```

### 2. Port Architecture Maps

When testing layouts locally, use our dedicated workspace environments:

- **React Sandbox (Storybook):** `http://localhost:6006`
- **Angular Sandbox (Storybook):** `http://localhost:6007`

---

## 🎨 Token & Component Engineering Principles

Our architecture relies on a strict **Framework-Agnostic Core** flow. Follow these steps when introducing new styles or components:

### Phase 1: Core Primitives (`packages/core`)

All design tokens (colors, typography metrics, dimensions) must be declared in the core package first.

- **Vite Bundler Compliance:** Do **not** use unextended relative paths (like `./concepts`). Vite bundles everything into clean single-entry points (`esm/index.js` and `cjs/index.cjs`), keeping compilation error-free for strict consumer environments.

### Phase 2: Native Implementations (`packages/react` & `packages/angular`)

Once tokens live in core, implement the matching component natively in both framework workspaces:

- **React Stack:** Built via Vite. Keep `react`, `react-dom`, and `@uni-design-system/uni-core` marked as `external`. Complex helper hooks (e.g., `@dnd-kit`) are safely bundled _inside_ the artifact.
- **Angular Stack:** Built via `ng-packagr` using modern standalone APIs compliant with Angular 21. Keep things performant and future-proof—**do not** import the deprecated `@angular/animations` library. Use native CSS custom properties mapped directly to our core tokens.

---

### Angular Package Standards

The Angular workspace has additional, CI-enforced quality gates:

- **Conventions:** read [packages/angular/AGENTS.md](./packages/angular/AGENTS.md)
  — signals-only API (legacy decorators are lint **errors**), Emotion-only
  styling via memoized `computed()` classes, `OnPush` everywhere, no rxjs.
- **Accessibility:** the library targets WCAG 2.2 AA. Per-component keyboard
  maps and ARIA contracts live in
  [packages/angular/ACCESSIBILITY.md](./packages/angular/ACCESSIBILITY.md);
  template a11y lint rules are errors. A11y regressions are bugs.
- **API docs:** after changing any public input/output/selector, regenerate the
  machine-readable reference: `pnpm docs:api` (writes `llms.txt`).

---

## 📦 Verifying Builds Locally

A `pre-push` hook runs `build`, `lint` and `test` for you on every push, so the
first two commands below are automatic — GitHub Actions cannot block a push, so
this is the only gate that catches a problem before it reaches `main`. It is
enabled by `pnpm install` (via `core.hooksPath`), takes seconds once turbo's cache
is warm, and `git push --no-verify` skips it.

The Storybook builds are deliberately **not** in the hook — they take minutes and
run on CI. Run them yourself when you have touched stories or core exports:

```bash
# Verify type emission and compilation across all three layers
pnpm turbo run build

# Lint + unit tests (Angular: eslint + vitest)
pnpm turbo run lint test

# Verify your specific framework component sandbox compiles
pnpm turbo run build-storybook --filter=@uni-design-system/uni-react
pnpm turbo run build-storybook --filter=@uni-design-system/uni-angular
```

---

## 🚀 The Release & Versioning Pipeline

We use `@changesets/cli` to automate versioning and generate professional changelogs. **Our design system operates on a synchronized release cadence;** all three packages share identical version numbers controlled by a `"fixed"` group configuration.

### Step-by-Step Versioning Protocol

When your feature or bug fix is complete and tested, you must log your intent for a version bump:

1. **Generate a Changeset File:**
   ```bash
   pnpm exec changeset
   ```
2. **Select Packages:** Choose _only_ the specific package(s) you modified using the spacebar. Do not worry about selecting all three; our global configuration will automatically scale the versions of the other locked dependencies behind the scenes.
3. **Choose Bump Type:** Select `patch` for bug fixes, `minor` for backwards-compatible features, or `major` for breaking API changes.
4. **Write the Summary:** Write a brief, user-facing summary of your changes. This text will feed directly into the package's `CHANGELOG.md`.
5. **Commit & Push:** Commit your code changes _along with_ the newly generated `.changeset/xxxx-xxxx.md` file and push your branch to GitHub.

### Cutting a Release

Push a changeset to `main`. That is the whole ritual — a changeset on `main` means
"this is releasable", and the pipeline does the rest: it versions the packages,
writes the CHANGELOGs, regenerates the MCP index, commits the bump back to `main`,
publishes over OIDC, tags, and cuts the GitHub Releases.

Versioning runs on the runner rather than on your machine because that is where the
credentials are — `@changesets/changelog-github` needs a `GITHUB_TOKEN` to resolve
commit links and throws without one, and the runner is handed one automatically.

To stage work without releasing it, land the code first and add its changeset in a
later commit; the release happens on the push that carries the changeset.

That consumes every pending changeset, bumps the `package.json` versions, writes the
`CHANGELOG.md` entries, and regenerates `packages/mcp/src/data/uni-index.json`
(which is why it also builds the Angular Storybook — the index reads its examples).
Read the diff, then commit and push it.

### What Happens in CI/CD (GitHub Actions)

One workflow, [`main.yml`](.github/workflows/main.yml), handles every push to `main`
as a single ordered job: install → build → lint → test → both Storybooks → publish →
deploy docs. Publishing uses **Zero-Secret OIDC Trusted Publishing**.

The ordering is the guarantee. Nothing reaches NPM until the whole suite is green,
because the publish step runs after it in the same job rather than in a workflow of
its own racing alongside.

### What a push does

The changeset decides. A push carrying one releases; a push without one does not.

| You push | What happens |
| --- | --- |
| Work **with** a changeset | Verifies, versions, publishes, tags, releases, deploys docs |
| A fix or refactor **without** one | Verifies and deploys docs; nothing is published |

Every run writes which of the two it did to its summary, so a green tick is never
ambiguous. The version bump lands on `main` as a "Version Packages" commit made by
the runner — expect to pull it before your next push.
