---
'@uni-design-system/uni-mcp': minor
---

`get-changelog`: release notes as a first-class MCP tool, plus a `uni://changelog/{package}` resource.

The index now ingests every published package's changesets `CHANGELOG.md` (a new build adapter parses them into structured releases — bump level, headline, full body, commit, dependency bumps). The tool answers "what changed in X?" and "what do I get by upgrading?": `version` returns one release's full notes (`"8.1"` matches every 8.1.x), `since` returns the full notes of every release after an installed version, and no scope returns a compact release digest. `package` accepts npm or short names (`uni-angular` is the default).
