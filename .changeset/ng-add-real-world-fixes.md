---
'@uni-design-system/uni-core': patch
'@uni-design-system/uni-angular': patch
'@uni-design-system/uni-mcp': patch
---

Fix `ng add` against real published packages (found by fresh `ng new` e2e):

- The schematic bundle is CJS, but ng-packagr stamps `"type": "module"` into the
  published package.json, so Node loaded it as ESM and the CLI reported "no ng add
  actions". A nested `schematics/package.json` (`"type": "commonjs"`) scopes the
  bundle back to CJS.
- The emitted `uni-theme.ts` used dot access on `Colors` (which has an index
  signature), failing under `ng new`'s strict `noPropertyAccessFromIndexSignature`.
  The emitter (and the MCP tool's guidance) now uses bracket access throughout.
