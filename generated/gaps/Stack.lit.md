# Gaps reported while generating Stack for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:48 — round 1

- Stack: the anatomy list is just `container`, and the schema doesn't say what carries that part when `element` is `div` — kept the existing convention (matching Container) where the host itself is the implicit container and only the `section`/`nav`/`ul`/`ol` wrapper elements carry `part="container"`.
- Stack: pre-existing Stack.ts used the old raw spacing scale ('0'..'12') for `gap` instead of the schema's `layout.gap.*` enum (none/tight/normal/loose/section); rewrote the enum, CSS hooks, and stories/tests to match the schema, since the old version predates this generation pass.

## 2026-09-10 17:14 — round 1

- Stack: schema says gap: none must make overrides.gap a no-op (presence rule), but the pre-existing implementation applied inline style overrides unconditionally, letting an override win over gap="none". Fixed by skipping the gap hook when gap is "none" and re-running applyOverrides when gap changes.
