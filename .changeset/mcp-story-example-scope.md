---
'@uni-design-system/uni-mcp': patch
---

Component examples no longer borrow markup or args from a neighboring story.
A story that only sets `args` was given the first template found anywhere in
its stories file, and a story without `args` was given the next story's, so
52 examples described something other than what the story renders. Templates
and args are now read from the story's own declaration, with the meta-level
`render` as the only shared fallback.

A story rendered from args alone now gets real markup: the component's
element, synthesized from its selector and the merged meta and story args.
Literal values are written into the tag; a value that refers to something in
the stories file is bound by name and its source listed underneath.
