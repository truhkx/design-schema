# Gaps reported while generating Stack for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:47 — round 1

- Stack: the schema changes `gap` from the old raw spacing scale ('0'-'12') to a layout-rhythm enum (none/tight/normal/loose/section mapping to layout.gap.*), a breaking prop-type change. I updated only Stack itself per scope, but this leaves stale literal gap values ('0'-'6') in other already-generated files that consume Stack — packages/react/src/AlertDialog.tsx, Card.stories.tsx, Dialog.tsx, Dialog.stories.tsx, Disclosure.stories.tsx, Form.stories.tsx, Landmark.stories.tsx, and demo/Preferences.tsx, demo/SignIn.tsx — which now fail typecheck against StackGap and need fixing in those components' own regeneration passes.
- Stack: spec's 'Overridable: gap' section doesn't specify whether a Storybook story should demonstrate `overrides`; I omitted one since sibling layout components (Box, Container) that also support overrides don't have an Overrides story either, for consistency.
- Stack: added Stack.test.tsx (not explicitly requested by this job but required by the behavior-scenarios rollout already applied to Switch/Box/Card/Container) covering all 21 scenarios verbatim as render-only assertions, matching the Box.test.tsx pattern.
