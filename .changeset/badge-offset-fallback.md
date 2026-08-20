---
'@uni-design-system/uni-angular': patch
---

`uni-notification-badge`: a theme that omits the `offset` option no longer breaks badge positioning — the position values serialized as the invalid length `'undefinedpx'` and the badge lost its corner placement. Missing `offset` now falls back to `0`.
