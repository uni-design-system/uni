---
'@uni-design-system/uni-angular': patch
'@uni-design-system/uni-core': patch
'@uni-design-system/uni-react': patch
'@uni-design-system/uni-mcp': patch
---

Ship `CHANGELOG.md` in the published packages. The release notes existed only in the repo; an installed package carried no record of what changed, so upgrade questions couldn't be answered from `node_modules`. uni-angular copies it into the ng-packagr `dist` via `assets`; the rest add it to `files`.
