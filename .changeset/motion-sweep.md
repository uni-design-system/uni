---
'@uni-design-system/uni-angular': major
'@uni-design-system/uni-core': major
---

Put every remaining hardcoded animation duration on the `motion` scale. Seventeen sites across twelve components carried their own literal, so a theme could retime some of the library and not the rest.

New `motion` options, each defaulting to the token named: `button`, `iconButton`, `checkbox`, `tabs`, `tooltip`, `dataTable`, `tag`. `uni-sort-header` names `control` directly — it has no theme entry to hang an option on. `combobox`'s chevron now turns with the popup it opens, reading that component's existing `motion` option.

Timings move where the literal and the token disagreed:

| | before | after | token |
| --- | --- | --- | --- |
| button, icon-button, data-table row hover | 280ms ease | 300ms ease | `control` |
| checkbox box and dash | 200ms ease | 300ms ease | `control` |
| checkbox tick (drawn, trails the box) | 500ms ease | 350ms ease-in-out | `reveal` |
| tabs ink and indicator | 150ms ease | 120ms ease | `snap` |
| combobox chevron | 150ms ease | 100ms linear | `popup` |
| tag fill and ink | 200ms ease | 300ms ease | `control` |
| sort-header arrow | 350ms ease-in-out | 300ms ease | `control` |
| alert, snackbar dismiss | 300ms | 350ms | `notification` |
| data-table detail expand | 300ms ease | 350ms ease-in-out | `reveal` |
| tooltip fade, data-table loading overlay | 350ms | unchanged | `notification` |

Two of these lived in the theme rather than in a component: `button.fixed` and `tag.fixed` each baked a `transition`, and the button's won over the component that had already been migrated — so the button kept its old timing regardless. Both are gone; the components own their transitions and follow the token at runtime. A spec now fails if any shipped theme states a duration in a style block.

`uni-skeleton` still stays out: its shimmer is a loop, not a transition.
