# 🦋 Uni Design System: Monorepo Context Capsule

> **Last Synced:** May 2026
> **Architecture State:** Production-Ready & Verified

This document serves as the absolute "Source of Truth" for the architecture, build pipelines, and publishing workflows of the Uni Design System monorepo. Attach or copy-paste this file into future AI prompts to instantly resume development with zero context drift.

---

## 📐 Monorepo Blueprint

- **Package Manager:** `pnpm@11.0.8` (Enforces strict workspace boundaries, requires Node v22.13.0+ due to the `node:sqlite` internal store index).
- **Monorepo Engine:** `Turborepo 2.9+` (Task orchestration via `pnpm dev` and `pnpm turbo run build`).
- **Release Strategy:** Coordinated `fixed` versioning via `@changesets/cli`.
- **Security Protocol:** Zero-Secret **OIDC Trusted Publishing** (No `NPM_TOKEN` needed; authenticated via GitHub workflow permissions).

---

## 📦 Package Matrix & Build Footprints

### 1. `@uni-design-system/uni-core` (The Foundation)

- **Role:** Design tokens, global theme variables, and shared core logic.
- **Build Engine:** `Vite` + `vite-plugin-dts`.
- **Footprint:** Bundles source into single-file outputs to eliminate strict ESM relative-path file extension errors inside consumers (like Webpack 5).
  - `dist/esm/index.js` (Strict ESM)
  - `dist/cjs/index.cjs` (CommonJS Fallback)
  - `dist/types/` (Isolated Declaration Trees)

### 2. `@uni-design-system/uni-react` (React Library)

- **Role:** React component implementations (Vite + React 18/19).
- **Build Engine:** `Vite` + `@vitejs/plugin-react` + `vite-plugin-dts`.
- **Footprint:** Bundles internal helper dependencies (like `@dnd-kit` and `use-ripple-hook`) directly inside the library artifact to keep consumer applications fast and lean. React and Core tokens are kept strictly `external`.
  - `dist/esm/index.js`
  - `dist/cjs/index.cjs`
  - `dist/types/`

### 3. `@uni-design-system/uni-angular` (Angular Library)

- **Role:** Angular 21 component implementations.
- **Build Engine:** `ng-packagr` (Bypasses global Angular CLI binaries in favor of isolated local `pnpm run` execution).
- **Footprint:** Flat Angular Package Format (APF) with all source debris and testing frameworks completely stripped out.
  - `dist/fesm2022/uni-design-system-uni-angular.mjs`
  - `dist/types/`
  - `dist/package.json` (Main entryway sitting safely at the distribution root)

---

## 🛠️ Critical Configurations & "Gotchas" Fixed

### 1. The Changeset Lock (`.changeset/config.json`)

Forced into a synchronized release cadence using the `fixed` property. Bumping any single package automatically bumps **all three** packages to the exact same version and writes clean changelogs.

```json
"fixed": [
  [
    "@uni-design-system/uni-core",
    "@uni-design-system/uni-react",
    "@uni-design-system/uni-angular"
  ]
]
```

### 2. The Angular Double-Package Root Fix

`ng-packagr` builds inside a nested `dist/` subfolder, which causes Changesets to accidentally publish raw source files if run from the workspace root. Fixed permanently by adding the directory pointer inside the source **`packages/angular/package.json`**:

```json
"publishConfig": {
  "access": "public",
  "provenance": true,
  "directory": "dist"
}
```

### 3. Shared Storybook Assets & Themes

- Shared favicons and images live in a single root `/public` folder.
- Framework packages reference it using: `staticDirs: [join(__dirname, "../../../public")]`.
- Sidebar branding is driven by a single central `.storybook/shared-theme.ts` file imported via `@storybook/core/manager`.

---

## 🚀 Future Development Directives

When picking up from this capsule, the system is primed to expand into:

1. **Token Proliferation:** Expanding typography, spacing, or dark-mode maps inside `uni-core`.
2. **Component Synchronization:** Building layouts (Grids, Modals, Dropdowns) and exporting them identically to both React and Angular.
3. **Automated Visual Regression:** Connecting the current GitHub Pages documentation deploy jobs to tools like Chromatic.
