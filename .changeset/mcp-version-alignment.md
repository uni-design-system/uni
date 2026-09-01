---
'@uni-design-system/uni-mcp': patch
---

The MCP server now shares the library's version number.

It used to release on its own `4.x` line while the library was on `10.x`, which
had two consequences. Pinning was impossible: the README told you to match the
server to your installed `@uni-design-system/uni-angular` version, but
`uni-mcp@10.1.0` did not exist. And staleness was silent — the index is
regenerated on every release, stamped with that release's version and **inlined
into the published bundle**, yet the package only republished when someone
remembered a changeset for it. Miss one and the server keeps describing the
previous release while reporting a version that gives no hint of it.

`uni-mcp` joins `uni-core`, `uni-react` and `uni-angular` in the changesets
`fixed` group, so it always shares their version and always republishes. The
version therefore jumps from `4.7.3` to match the current release. Nothing about
the server's behaviour, transport or tools changes.

`uni-mcp@<version>` now describes `uni-angular@<version>`, so pinning them
together does what the docs always claimed it did.
