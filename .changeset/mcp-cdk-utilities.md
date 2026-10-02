---
'@uni-design-system/uni-mcp': minor
---

The MCP now covers the CDK — the non-visual half of `uni-angular`.

Until now the index held components only, so `copyToClipboard`, `PermissionService`, the decimal helpers, the datasources and every other CDK export were invisible to an assistant: nothing in them has a selector. A new `cdk-adapter` walks the CDK barrel (`cdk/index.ts`) and indexes every exported function, injectable service, class, interface, type and const with its signature and JSDoc — read from the TypeScript AST, so arrow-function consts, generics and multi-line parameter lists come through as written. Each CDK module's docs page ships alongside as markdown.

- **`list-utilities`** — the inventory, grouped by module; filter by `module` or `kind`.
- **`get-utility`** — one export by id (`copy-to-clipboard`) or name (`copyToClipboard`): import line, signature, members, the other symbols in its module, and the module's docs page with usage examples.
- **`search`** gains a `utility` kind, and **`uni://utilities/{id}`** serves the same card as a resource.

The server's instructions point assistants at these before they hand-roll a browser API call.
