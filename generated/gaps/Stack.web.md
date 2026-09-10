# Gaps reported while generating Stack for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:47 — round 1

- Stack: the schema changes `gap` from the old raw spacing scale ('0'-'12') to a layout-rhythm enum (none/tight/normal/loose/section mapping to layout.gap.*), a breaking prop-type change. I updated only Stack itself per scope, but this leaves stale literal gap values ('0'-'6') in other already-generated files that consume Stack — packages/react/src/AlertDialog.tsx, Card.stories.tsx, Dialog.tsx, Dialog.stories.tsx, Disclosure.stories.tsx, Form.stories.tsx, Landmark.stories.tsx, and demo/Preferences.tsx, demo/SignIn.tsx — which now fail typecheck against StackGap and need fixing in those components' own regeneration passes.
- Stack: spec's 'Overridable: gap' section doesn't specify whether a Storybook story should demonstrate `overrides`; I omitted one since sibling layout components (Box, Container) that also support overrides don't have an Overrides story either, for consistency.
- Stack: added Stack.test.tsx (not explicitly requested by this job but required by the behavior-scenarios rollout already applied to Switch/Box/Card/Container) covering all 21 scenarios verbatim as render-only assertions, matching the Box.test.tsx pattern.

## 2026-09-10 00:49 — round 2

- Stack: the round-1 gap enum migration (raw spacing scale → none/tight/normal/loose/section) broke typecheck in 9 consumer files that still passed old numeric gap strings. Fixed by remapping each literal to the closest enum value using the spec's own semantics ('tight for related controls, normal for fields in a form, loose for groups, section between page sections') rather than raw px proximity, since several old values (e.g. '6' at 24px) sit exactly between two presets and the semantic role of the Stack (button row vs. form fields vs. top-level page regions) was the deciding factor. Button/action rows → tight; form-field stacks → normal; zero-gap lists (checkbox group, disclosure accordion) → none; top-level region groupings (Preferences/SignIn outer stacks, Landmark page-skeleton story) → section.
- Stack: no gap value existed for the old '3'/'8'/'10'/'12' raw-scale usages in this pass — none of the touched consumer files used those, so no mapping decision was needed for them, but any future file using those raw values will need the same semantic (not just nearest-px) judgment call.

## 2026-09-10 17:15 — round 1

- Stack was already generated for React and matched the spec except for one thing: `overrides.gap` did not no-op at `gap: none` (styles.gap.description requires the presence rule). Fixed Stack.css so the base rule and `.ds-stack--gap-none` set `gap: 0` literally instead of reading `var(--ds-stack-gap)`, mirroring Box's background/radius presence-rule pattern — the hook is only read by the tight/normal/loose/section modifier classes.
- The prompt's general convention list says enum props whose values are quoted digits (citing 'Heading level, Stack gap') accept both string and number, but Stack's actual gap values are words (none/tight/normal/loose/section), not digits — treated this as a stale/generic template line that doesn't apply to Stack and left gap as a plain string union.
