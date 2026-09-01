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

Versioning happens **locally**, so you review the version bumps and changelog text
before they exist rather than after:

```bash
GITHUB_TOKEN=$(gh auth token) pnpm version-packages
```

The token is not optional. `@changesets/changelog-github` resolves commit and author
links through the GitHub API and **throws** without `GITHUB_TOKEN` — previously the
Actions runner supplied it. Any token with `read:user` and `repo:status` works.

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

### Pushing to `main` does not release

A changeset is not required to push safely, and no ordinary push publishes anything.
The only thing that triggers a publish is a version in `package.json` that npm does
not have yet — and only `pnpm version-packages` produces one.

| You push | What the publish step does |
| --- | --- |
| Work with a changeset attached | **Skipped** — the guard sees the pending changeset |
| A fix or refactor with no changeset | Runs, finds nothing unpublished, exits 0 |
| A `pnpm version-packages` commit | **Publishes**, tags, and creates the GitHub Releases |

So the step being skipped is normal, and the step running green is not evidence that
anything shipped. The guard on it exists only to stop `changesets/action` opening a
"Version Packages" PR while changesets are still pending — not to decide whether a
release happens.
