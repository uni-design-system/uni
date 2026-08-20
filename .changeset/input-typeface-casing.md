---
'@uni-design-system/uni-core': minor
'@uni-design-system/uni-angular': minor
---

Input options: `typeFace` → `typeface`, matching the tooltip/button/tabs casing. The base theme now writes `typeface`, and the input box reads the new key with the old one as a deprecated fallback, so themes that still set `typeFace` render unchanged. The `typeFace` key is deprecated and will be removed in the next major.
