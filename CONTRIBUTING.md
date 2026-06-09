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

## 📦 Verifying Builds Locally

Never push your branch without confirming that the production bundlers compile correctly. Test the full matrix locally with:

```bash
# Verify type emission and compilation across all three layers
pnpm turbo run build

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

### What Happens in CI/CD (GitHub Actions)

Our backend pipeline automates the release securely using **Zero-Secret OIDC Trusted Publishing**:

- **The PR Trigger:** When your branch merges to `main`, GitHub Actions evaluates the changeset file and automatically opens a **"Version Packages" PR**. This PR contains the finalized `package.json` updates and `CHANGELOG.md` text injections.
- **The Ship Trigger:** Merging that automated "Version Packages" PR launches the final publishing runner. It compiles the assets, cryptographically attests the provenance, uploads the verified code artifacts to the NPM registry, and deploys the new static sandboxes straight to **GitHub Pages**.
