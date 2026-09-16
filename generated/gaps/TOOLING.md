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
- Behavior scenarios (rn): scenarios only check that the component renders, so maxWidth and the responsive gutter are never tested; the main-landmark scenario cannot run because `element` does not exist on rn (Container, rn).
- Behavior scenario vocabulary: no way to assert an element has no role; `{ attribute: role, is: null }` proves nothing when Lit sets the role through ElementInternals (Container, lit).
- Lit test harness: the accessibility lookup cannot read ElementInternals roles, so role scenarios stay web-only (Container, lit).
- Story/example args: examples say "exactly their given", but scenarios and stories merge the Default story's args, so an example without a heading inherits Default's; no convention defines Default args (Card, all; Input, rn saw meta args leak the same way).
- Behavior scenario givens: a `given` cannot hold a component child, so interactive-adds-no-focus-stop never runs with a real Link child (Card, web).
- Package conventions: the rule says `...rest` never forwards style/className, but every existing React component (Icon, Meter, Button) merges both; needs a package-wide decision (Button, web).
- Package digest: the `toLineHeight` signature has its arguments reversed against theme.tsx's `toLineHeight(fontSize, multiplier)` (Link, rn).
- Behavior harness: the `copy:` expectation has no defined matcher; Link's scenario now says text content, but the harness should define it for every component (Link, web).
- Generator conventions: "every style binding becomes a hook" contradicts "locked bindings excluded" (Input, lit).
- Story/example args (again): Default args merge into examples and no doc field names the Default story. Landmark and RadioGroup now state theirs in Behavior ("The Default story is …"); the generator should read that sentence (Alert, Landmark, Meter, RadioGroup; all platforms).
- Story rules: "one story per enum value" has nothing to apply to without enums; boolean CollapseTrue/CollapseFalse stories duplicate the deep-trail example (Breadcrumb, web/rn).
- Keyboard story "three focusable children" conflicts with a one-tab-stop radio group; the Default three-option group should satisfy it (RadioGroup, all).
- TypeScript convention: schema `shape` fields written `x?: T` should be emitted as `x?: T | undefined` under exactOptionalPropertyTypes (Breadcrumb, RadioGroup; web).
- Lit test harness: reading text across a nested ds-link shadow root (Breadcrumb, lit); Playwright needs `{ force: true }` to click an aria-disabled trigger (Disclosure, lit).
- Behavior scenario vocabulary: cannot express an event payload field (Disclosure `reason`), a controlled prop change, `hidden` on a part, or focus returning to a trigger (Disclosure, lit); cannot assert rn accessibilityValue.text, and rn has-accessible-name has no defined check method (Meter, rn).
- RN behavior tests: a control hidden from accessibility (the Checkbox box) must be queried through its row or with includeHiddenElements (Checkbox, rn).
- Landmark rn scenarios now check `role`/`accessibilityRole` props through `attribute:`; confirm the rn harness reads props that way (Landmark, rn).
- Package digest (rn): `useNativeDriver: false` is for layout props; transform-only animations keep the native driver (Disclosure, rn).
- Lit story/test generator: skip examples and scenarios whose `platforms` exclude lit without the doc restating it; validate Stack `gap` values in stories (Landmark, lit).
- Generator conventions: the browser caveat for a pseudo-element on an appearance:none input belongs in shared conventions (RadioGroup, lit).
