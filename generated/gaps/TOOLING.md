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
- Story generator: example `children` written as prose need one rule for every platform (render the string as Text plus the controls it names); on Lit `children` cannot go in meta.args because the harness assigns args as properties and Element.children is read-only (FocusScope, Tooltip; all).
- Story rules: whether a boolean-false state needs its own story (TrappedFalse, ActiveFalse, RestoreFocusFalse) is unstated (FocusScope, lit).
- RN behavior tests: `role: alert` cannot use getByRole when the root must stay non-accessible to keep its buttons separate; the harness needs an accessibilityRole/testID fallback (Toast, rn).
- Story generator: example `given` children/footer/trigger written as prose need the one shared convention; each overlay realized them differently (Dialog, AlertDialog, BottomSheet, Popover, SidePanel; all).
- Story generator: whether an example story's "exactly its given" layers over the Default story's meta args or replaces them (ActionSheet needed `heading: undefined`; Dialog kept a stray description) (ActionSheet, Dialog; web, rn).
- Package digest (rn): shows `toLineHeight(lineHeight, fontSize)` but theme.tsx's signature is `(fontSize, multiplier)` (ActionSheet, Menu; rn).
- RN behavior tests: getByRole cannot find a non-accessible `role="menu"` container (making it accessible merges its rows); tests read the role prop by testID (ActionSheet, Menu; rn).
- RN behavior tests: `a-scrim-click-does-nothing` presses a View with no handler and cannot catch a regression to a no-op Pressable; assert the scrim has no press responder (AlertDialog, rn).
- Keyboard-story rule "at least three focusable children" should exempt overlays with a fixed pair of controls, or count the whole story page (AlertDialog; web, lit).
- Behavior `when` vocabulary has no drag action, so `gesture: true` events (onDragDismiss) have no scenario (BottomSheet, lit).
- Generator: schema constants (dismissDistance, dismissVelocity, dragSlop) have no generated constant export, so code uses local module constants (BottomSheet, web).
- Behavior tests run below every overlay breakpoint, so wide presentations (ActionSheet→Menu, BottomSheet→Dialog) have no scenario coverage (ActionSheet, lit).
- Test environment: jsdom does not turn Escape into `cancel` on <dialog>, and has no stylesheet, so token-read timings (typeaheadReset) resolve to nothing (Dialog, Menu; web).
- `forwards` is a one-to-one map, so `inset` → body Box paddingBlock and paddingInline is structural for one target only; a list-valued forward would cover both (Dialog; all).
- tools/__tests__/composition-forwards.test.ts corpus counts change after regenerating components.json with the new overlay composition props and forwards (Dialog et al.; all).
- RN: resolveToken has no typed result for composite tokens (shadow), so generated code casts; Jest has no key event for the native Escape path (Menu, rn).
- Browser tests: Playwright won't click an aria-disabled element, so `a-disabled-item-does-nothing` needs a forced click (Menu, lit).
- TS: under exactOptionalPropertyTypes the `items` shape needs `| undefined` on optional fields for callers passing `icon: undefined` (Menu, web).
- TS: the same `| undefined` widening recurs for SegmentedControl `options`; the generator template should widen optional shape fields instead of each doc (SegmentedControl, web).
- Prompt assembly: the Keyboard section lists only the arrow rules while the schema keyboard block also has wrap, Home and End (SegmentedControl, web/lit).
- RN conventions summary shows `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.ts is `toLineHeight(fontSize, multiplier)` (Listbox, rn).
- Keyboard story gate: unclear whether options reached via aria-activedescendant count toward the "three focusable children" (Select, web).
- `copy.position` in tabs.md is the first copy entry to use `description`/`platforms`; confirm consumers honor them (Tabs; all).
