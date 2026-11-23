---
'@uni-design-system/uni-mcp': patch
---

Component examples no longer borrow markup or args from a neighboring story.
A story that only sets `args` was given the first template found anywhere in
its stories file, and a story without `args` was given the next story's, so
52 examples described something other than what the story renders. Templates
and args are now read from the story's own declaration, with the meta-level
`render` as the only shared fallback. A story rendered from args alone lists
the meta's default args alongside its own.
