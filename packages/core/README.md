# @uni-design-system/uni-core

The single source of truth for the **Uni Design System**. This package contains foundational design tokens, branding themes, layout dimensions, and global styling variables.

It is structured as a pure, dependency-free library designed to be consumed by any framework implementation.

## 📦 Installation

```bash
# Using npm
npm install @uni-design-system/uni-core

# Using pnpm
pnpm add @uni-design-system/uni-core
```

## 🚚 Distribution Formats

This package is compiled using **Vite** as a dual-package distribution to ensure broad ecosystem compatibility with no strict ESM extension path errors:
- **ESM (`dist/esm/index.js`)**: For modern, tree-shakable environments.
- **CommonJS (`dist/cjs/index.cjs`)**: Explicit fallback extensions for legacy bundlers (like Webpack 5).
- **Types (`dist/types/`)**: Pre-isolated TypeScript definitions.

## 🧩 Usage Example

```typescript
import { Theme, ColorToken, Size } from '@uni-design-system/uni-core';

// Accessing standard token primitives
const brandColor = ColorToken.BrandPrimary;
const paddingSize = Size.Medium;
```
