# Tooling gaps

Gaps a fold cannot answer because they are about the tools, not the docs.

## 2026-09-16

- gap_digest: `TEST-FAILURES.md` is treated as a component and given the doc path `components/test-failures.md`, which does not exist.
- gap_digest: `Pattern.SettingsPage` is given the doc path `components/pattern.settingspage.md`; the real file is `patterns/settings-page.md`.
- Behavior tests: several rounds reported that scenarios imply test files while the Output section asks only for `.tsx`/`.stories.tsx`, so no test file was written (ActionSheet, Button, BottomSheet, Checkbox). The rollout is per-component and needs its own pass.
- Derived scenario names: the doc's `renders-inset-block-none` does not match the generator's `renders-insetblock-none` (Box, lit).
- Behavior harness: `has-accessible-name` asserts `toHaveAccessibleName(props.label)` for components whose name comes from another prop (Disclosure's `summary`, Icon's `label` when decorative), so it compares against undefined.
- Behavior harness: scenario `given` is applied to "the Default story's args", but several docs define no Default example, so what `renders-size-*` renders is generator-chosen (Heading).
- Literals gate: the duration-shaped-token regex matches plain prose in warning strings, so a dev warning cannot name `5000ms` (Carousel, rn); and `fontFamily: '<quote>'` is flagged as a font-stack literal whatever the content (Heading, lit).
- Keyboard story convention asks for three focusable children, which AlertDialog cannot have — its anatomy is two buttons.
- Icon (lit): the generated behavior test reads role and aria-hidden off the shadow `<svg>` while the package convention asks for plain attributes on the host. The doc now says the svg wins; the convention text should be reconciled.
