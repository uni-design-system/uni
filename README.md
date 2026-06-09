<p align="center">
  <a href="https://uni-design-system.github.io/uni/" target="_blank">
    <img src="https://github.com/uni-design-system/uni-react/raw/v0.0.17/.github/uni-logo.png" alt="UNI Design System">
  </a>
</p>

<p align="center">
  UNI Design System is a themed based component library designed to support brand uniformity across 
<a href="https://github.com/uni-design-system/uni/tree/main/packages/angular/"><strong>Angular</strong></a> and 
<a href="https://github.com/uni-design-system/uni/tree/main/packages/react/"><strong>React</strong></a> projects.
<p>

<p align="center">
  <a href="https://uni-design-system.github.io/uni/docs/react/"><strong>Browse the React component library &rarr;</strong></a>
</p>

<p align="center">
  <a href="https://uni-design-system.github.io/uni/docs/angular/"><strong>Browse the Angular (v21) component library &rarr;</strong></a>
</p>

# Uni Design System Monorepo

Welcome to the unified home of the **Uni Design System**. This monorepo houses our core design tokens and their native implementations for both React and Angular frameworks.

## 🏗️ Architecture Blueprint

This workspace leverages **pnpm workspaces** for strict, blazing-fast dependency isolation and **Turborepo** for optimized task orchestration.

```
uni/
├── packages/
│   ├── core/       # Pure Design Tokens & Theme Logic (Vite)
│   ├── react/      # React 18/19 Component Library (Vite)
│   └── angular/    # Angular 21 Component Library (ng-packagr)
├── public/         # Shared assets (Favicons, Brand Logos)
└── .storybook/     # Centralized Storybook configuration & themes
```

### ⚡ Quick Start

#### Requirements

- **Node.js:** `>=22.13.0` (Required due to pnpm 11's internal native SQLite index)
- **Package Manager:** `pnpm@11.0.8`

#### Local Setup

```bash
# Install dependencies across all workspaces
pnpm install

# Build all packages in correct dependency order
pnpm run build

# Start local parallel Storybook environments
pnpm run dev
```

- **React Storybook:** `http://localhost:6006`
- **Angular Storybook:** `http://localhost:6007`

---

## 🚀 Release & Versioning Pipeline

We use `@changesets/cli` to manage versioning and changelogs under a **coordinated release cadence**. All packages are locked to share the exact same version number.

### Developer Flow

1. Make your code changes in a package.
2. Run `pnpm exec changeset` in the project root.
3. Select the package(s) you modified, choose a bump type (`patch`, `minor`, `major`), and document your changes.
4. Commit the generated markdown file and push to `main`.
5. GitHub Actions will handle opening a "Version Packages" PR and securely publishing packages via **OIDC Trusted Publishing** upon merge.
