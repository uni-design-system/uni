---
'@uni-design-system/uni-core': minor
---

`createTheme` accepts a sparse `typography` override, deep-merged over the base type scale — restate only the roles (or the individual `TextStyle` fields within a role) that change, and add product-specific roles under any name. Closes the gap where a derived theme (e.g. the Carbon experiment) had to spread `typography` over the created theme by hand.
