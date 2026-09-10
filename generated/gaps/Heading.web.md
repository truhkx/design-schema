# Gaps reported while generating Heading for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:44 — round 1

- Heading: pre-existing implementation predated the overrides/testability-hook conventions (no data-ds, no CSS custom-property hooks, no overrides prop, no test file). Brought it in line with current conventions rather than treating it as net-new: added overrides for fontFamily/fontWeight/fontSize/lineHeight/marginBlockEnd (color stays locked but still gets a hook, matching Card's pattern for locked bindings), and added Heading.test.tsx mirroring Text.test.tsx's per-scenario structure since the doc's Behavior scenarios section wasn't previously covered by a test file for this component.
- Heading: spec's Output section only asked for Heading.tsx + stories, but the Behavior scenarios section explicitly says to emit one test per scenario, and every sibling component in the current rollout (Text, Card, Box, Switch, Container) has a matching .test.tsx — added Heading.test.tsx on that basis rather than skip it.
