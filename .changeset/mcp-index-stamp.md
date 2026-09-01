---
'@uni-design-system/uni-mcp': patch
---

The published MCP server carries the index for its own release.

`uni-mcp@10.2.0` shipped a bundle whose index was stamped `meta.version:
10.1.0`. The data itself was current, but the one field a consumer reads to
check which release the server describes said the previous one — the same drift
the version alignment had just been made to end.

The cause was ordering, not data. `tsup` **inlines** `uni-index.json` into the
bundle, so the dist built during the verify step was stamped before
`changeset version` ran; publishing then shipped that stale bundle even though
the regenerated index was correctly committed to the repo. `version-packages`
now rebuilds `uni-mcp` after regenerating the index, so the artifact and its
source agree.

The general rule, for anything added later: a package whose dist embeds
release-time data has to be rebuilt *after* the version bump, not before.
