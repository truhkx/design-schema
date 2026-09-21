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
- Keyboard-story rule ("open with its trigger and at least three focusable children") doesn't fit single-tab-stop fields or components without `open` (NumberInput, Search; web, lit, rn).
- Interaction scenarios limited to `platforms: [web, lit]` leave rn onKeyPress / accessibility-action paths untested (NumberInput, Slider, Search; rn).
- Example stories must render exactly their given props, but meta args leak into args-only stories (Slider, rn).
- Scenarios start from Default story args, so a given that depends on an omitted prop can't be exercised (Slider, rn).
- Generator platform rule asks for a disabled accessibilityState and keyboard stories on components with neither (ProgressBar, rn).
- `focusable: false` scenario has no concrete assertion shape on Lit (ProgressBar, lit).
- `click: indicator` names no step, and the aria-hidden indicator needs `includeHiddenElements` on rn (Stepper, rn).
- Story name for a boolean prop comes out as `CompactTrue`; keyboard block has no `given` for the Keyboard story (Stepper, rn).
- `copy:` scenarios on visually hidden words read shadow textContent, and jsdom can't verify container queries (Stepper, lit).
- tools/__tests__/composition-forwards.test.ts corpus counts go stale with the new Stepper/Slider/Search/ProgressBar composition forwards (all).
- Derived `error-is-identified` scenario resolves to anatomy[0] (`label`) instead of the input; derived scenarios need a target (DatePicker, lit).
- `has-accessible-name` is skipped when a11y.role is `none`; it can't target a child input (DatePicker, lit).
- rn scenarios press Buttons by copy label and `click: day` resolves to the 18th cell because no cell is named (DatePicker, rn).
- All DatePicker grid keyboard rules are `expect: manual`, so no generated test covers them (DatePicker, web).
- Keyboard story has no `given` to follow, so the generator invents autoplay and slide content for it (Carousel, rn).
- Example stories must render exactly their given, but meta.args (caption/columns/data) still merge in (Table, rn).
- Array `shape` strings are used verbatim (`abbr?: string`), which under exactOptionalPropertyTypes forbids an explicit undefined where the props convention adds `| undefined` (Table, rn).
- Keyboard story rule asks for "its trigger"; a Tree has none, so the generator picked showLabel plus an expanded node (Tree, rn).
- Events contract renderer: a payload entry named `ids`/`id` reads as an object key, but Tree and TreeGrid send bare detail values on Lit; the renderer needs a bare-payload form (Tree, TreeGrid; lit).
- Generator Constants rule says to read constants through token expressions, which a documented `literal-ok` number cannot follow; DataGrid's 160 is now the `columnWidth` binding, but the rule should name `literal-ok` as the exception (DataGrid, rn).
- tools/__tests__/composition-forwards.test.ts corpus counts go stale with the new DataGrid (caption, sortButton, statusBar) and Tree (icon, label) forwards (all).
- Keyboard story rule ("open with its trigger and at least three focusable children") has no given for a component with no open state; the generator picked newItemsCount plus the default items' actions (Feed, web and rn).

## 2026-09-17

- Refs rule names `Ref<ViewInstance>`; it should say "the root's instance type" (TextInstance for Text and Heading) (Text, Heading; rn).
- The package digest shows `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`; the real signature is `toLineHeight(fontSize, multiplier)` (Text, Heading; rn).
- RN rules say to import tokens from `@design-schema/tokens/<theme>/rn/light|dark`, but the package reads them through `useTheme()` (Text, rn).
- The quoted-digit enum rule still cites Stack `gap` as its example; gap values are names now (Stack, web and rn).
- The story-naming rule covers only enum values: no name for a boolean prop's story (`Wrap`, `Border`) or a digit-led value (`Size4xl`) (Stack, Box, Heading; web).
- No precedent for asserting a computed role across a Lit shadow root; the Stack nav test checks the native `<nav>` instead, and exposure under the host is untested (Stack, lit).
- RN `resolveToken` returns a general token value, so every component casts overrides by hand; a typed resolver per binding kind would remove the casts (Box, rn).
- Blocked-activation scenarios (`disabled-does-not-fire`, `click: container`) cannot run as written under Playwright, whose actionability check rejects an aria-disabled button; the scenario schema or harness should force such clicks (Button, lit).
- The rn package digest disagrees with the docs on how native Icon is colored (`overrides.color` versus the `color` prop); icon.md's order is the `color` prop first (Button, rn).
- Derived `renders-tone-*` scenarios carry only `renders: true`, so tests cannot tell tones apart (Link, lit).
- The rn package digest still names `TextNestingContext` and the old `toLineHeight` argument order (Link, rn).
- Link's Animated pressed-color crossfade logs React act() warnings under Jest; the rn test template should say fake timers or reduced motion (Link, rn).
- "Logic reads each constant through its token expression" cannot apply to a constant with a plain value and unit (`longPressDelay: 500 ms`); the rule should exempt non-token constants (Input, rn).
- FormContext.ts is shared by every field but is not named as an output file of the Form job (Form, web).
- The Lit package digest types `DsFormField.currentValue` as `string | boolean | null`; form.md's contract is wider (Form, lit).
- The Lit test harness has no accessible-name helper, so `name` expectations are checked through host role/aria-label attributes (Form, lit).
- Container `renders` scenarios assert only existence; jsdom and RNTL cannot evaluate max-width, the gutter media queries or window-width breakpoints, so the style contract is untested (Container, web/lit/rn).
- No rn behavior scenario covers Card `interactive` or `focusable`, so the native target logic has no test (Card, rn).
- Fold jobs cannot run `node`, `pnpm parse`, the contrast check or `pnpm commit` headless (approval required); the Controls-phase fold was left uncommitted and unvalidated (fold, all).
- The rn conventions digest says pass the token to Icon's `color` prop, while alert.md says `overrides.color` (Alert, rn).
- Story-naming rule for boolean props is still unstated (`Dismissible` vs `DismissibleTrue/False`) (Alert, lit).
- The scenario vocabulary cannot render focusables outside the component, so focus-onward-on-dismiss cannot be a scenario (Alert, web).
- Story rules: Keyboard story only with a keyboard block, so Breadcrumb and Disclosure (rn-web axe check) get none; "every enum value" has nothing to cover; no story for the no-href focus fallback (Breadcrumb, Disclosure; web/lit/rn).
- The schema has no per-platform `cancelable`; native `onNavigate` has nothing to cancel (Breadcrumb, rn).
- The conventions digest's FormFieldRegistration shape omits `isDisabled()` (Checkbox, web).
- The rn package digest still shows `toLineHeight` arguments in the wrong order (Disclosure, rn).
- Examples give children as prose, and scenarios cannot express structured children (required child fields) or assert an accessible description (Fieldset, lit).
- The package convention "every binding is a hook" is wrong for bindings a composite only forwards; component docs now say no hook (Fieldset, Meter, RadioGroup, Switch; web/lit).
- No scenario assertion for development warnings, and derived `renders-role-*`/`renders-as-*` scenarios merge Default args into mismatched role/element pairs (Landmark, web/rn).
- The scenario runner skips accessibilityValue on rn, so "announced" is untestable (Meter, rn).
- The Keyboard-story rule ("a trigger plus three focusable children") does not fit a one-tab-stop radio group (RadioGroup, lit/rn).
- The conventions digest's ":focus-visible outline" rule does not fit drawn controls that thicken their border (RadioGroup, web).
- The rn prompt contradicts switch.md: Overridable list includes track/thumb bindings, the generic rules say `onChange` and Pressable focus-visible styling, and stories use ThemeProvider instead of withTheme() (Switch, rn).
- The React/rn conventions digest says every component declares `ref`, overriding docs that say a component exposes none (Tooltip; web, rn).
- A fold session cannot run `node logs/*.mjs` (approval required), so gap-file staleness against folded.json was read from `ls -lt` by hand (fold, all).
- The generator's controlled-state template says `open` is "uncontrolled from its initial state when omitted", contradicting every overlay doc whose `open` is controlled only; the template should defer to the prop (Dialog, AlertDialog, BottomSheet, ActionSheet; web/lit/rn).
- The "a composed part receives exactly the listed props" rule has no exception for wiring (ids, refs, tabindex, copy labels, glyphs, handlers); docs now name it in Behavior, but the rule should say so (Dialog, Popover, SidePanel, BottomSheet; web).
- The scenario vocabulary's `focused: <part>` should mean focus within when the part is a wrapper around a composed control (Dialog, lit).
- Escape scenarios stay web/lit because the rn runner has no mapping from `key: Escape` to onRequestClose/onAccessibilityEscape (Dialog, Menu; rn).
- The rules template says "wrap in ThemeProvider"; the rn package uses the withTheme decorator (AlertDialog, rn).
- The scenario format doesn't say that `given: { open: true }` renders through the wrapper that owns `open` (Menu, web).
- The has-accessible-name scenario the parser derives runs on the closed Default story, so the named region is hidden; for overlays it should use `open: true` (SidePanel, web).
- Persistent mode reads the breakpoint token through getComputedStyle, so without the token stylesheet (jsdom) the renders-persistent scenarios only exercise the overlay path (SidePanel, web).
- The parser's prose-forward check matches any composed child named anywhere in a binding description, so mentioning the body Box inside `footerGap` raised a false "Box has no gap binding" error (BottomSheet, fold).
- The resolved Keyboard section the parser renders drops the Home/End rows the schema's keyboard block declares, so generators see two conflicting keyboard lists (SegmentedControl, web and lit).
- The rn package digest documents `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.tsx takes `toLineHeight(fontSize, multiplier)`; the digest example has the arguments reversed (Combobox, rn).
- CSF3 merges meta default args into every story, while the example rule says a story's args are "exactly its given"; the rule should say "given on top of the meta defaults" (Tabs, lit).
- The generic Keyboard-story rule ("at least three focusable children", "render it open") does not fit single-stop fields or components without an `open` prop; docs now state their story, but the rule should defer to the doc (NumberInput web/lit, Slider, Search rn).
- Lit anatomy parts carry `part` attributes although the package forbids ::part styling; the Lit rules should say whether `part` is emitted at all (ProgressBar, lit).
- The rn package digest says to pass an Icon foreground through the `color` prop, while docs forward locked colours to `overrides.color`; the digest should match (Stepper, Search; rn).
- Scenario coverage gaps the scenario vocabulary cannot express: range sliders (two role=slider elements), rn accessibility actions (increment, custom actions), and `focusable: false` on rn (Slider, ProgressBar; rn/web).
- A fold session could not run `node logs/fold-latest-rounds.mjs` or a `grep` with alternation through Bash (approval required); latest rounds were found with the Grep tool (fold, Numeric phase).
- More scenario coverage the vocabulary cannot express: the separator appearing only between two adjacent groups, groupGap's clamped separator padding, and `size` applied by child identity — all three are counts or style values, and `then` has no clause for either (Toolbar, rn).
- The rn digest's reversed `toLineHeight` arguments (recorded above for Combobox) hit a second generation (Carousel, rn).
- A fold session still cannot run `node logs/*.mjs` (approval required); gap-file mtimes were listed with `Get-ChildItem -Path generated/gaps -Filter *.md` instead (fold, Rows phase).
- The generated keyboard gate cannot express a tree's arrow navigation: tools/keyboard_tests.ts builds its focusable list from `a[href], button:not([disabled]), ..., [tabindex]:not([tabindex="-1"]), [role=menuitem|option|radio]`, which has no `[role="treeitem"]`. With the roving tabindex the doc mandates, exactly one treeitem is ever in that list, so the ArrowDown/ArrowUp/Home/End rules (focus-next/prev/first/last) compare indices over one treeitem plus the chevron buttons and cannot pass. Fix is `expect: manual` on those four rules or `[role="treeitem"]` in the gate's selector (Tree, lit).
- A fold session still cannot run `node logs/*.mjs`, `awk` or a piped `ls` through Bash (approval required); gap-file mtimes were read with a bare `ls --time-style` and compared by hand against folded.json (fold, Grids phase).
- The Lit behavior gate resolves `container` with `deep(el.shadowRoot, '[role=...]')` and never inspects the host, so a component that carries its role and name on the host falls back to the nameless `[part=container]` and `has-accessible-name` fails; the locator should consider the host, as the web one now considers the document (Feed, lit).
- `generated/behavior/Feed.lit.test.ts` omits the `loading-marks-the-feed-busy` scenario although the doc declares it for `[web, lit]` (Feed, lit).
- The generated behavior harness clicks the part element itself for `when.click`, but Button writes its own data-part after the rest props, so the hook lives on the wrapper row and the click never reaches the button; `pressing-show-new-asks-for-the-newer-items` fails in the generated gate while passing in the hand-written test. Fix is for the harness to click the first interactive descendant of a part (Feed, web).
- The derived `has-accessible-name` scenario generates `getByRole(a11y.role)` on every platform, so rn gets `getByRole('separator')` although `platforms.rn` maps the role to `adjustable`; the generator should read the platform role, which the doc now states plainly (Splitter, rn).
- A fold session still cannot run `node logs/*.mjs` through either Bash or PowerShell (approval required); stale gap files were found by reading `ls -la generated/gaps` and comparing against folded.json by hand (fold, Streams phase).

## 2026-09-18

- The repair loop hands every component round the package-wide axe and keyboard-run verdicts, so a clean component is sent back for other components' failures and rounds 2–3 repeat identical logs. Scope the verdict to the regenerated component's story titles (`<Name>/<Platform>`) and spec file (`generated/keyboard/<Name>.<platform>.spec.ts`), or diff against a pre-job baseline. Reported by every Primitives round 2/3 (Box, Heading, Icon, Stack, Text; web, lit, rn).
- The keyboard-run gate is flaky at full parallelism: AlertDialog, BottomSheet, Dialog, Feed and FocusScope failures from a Heading round all pass alone at `--workers 1` (Heading, web).
- Generation sessions cannot run their own scoped checks (logs/box-axe.mjs, heading-axe.mjs, icon-axe.mjs, stack-axe.mjs, text-axe-rn.mjs, text-gate-ab.mjs; Vitest re-runs): each needs approval, so the "component is clean" verdicts rest on reading the gate artifacts (Primitives, all platforms).
- react-native-svg 15.15.5's web build imports `parse` by name from two CommonJS PEG.js parsers that the rn Storybook leaves out of Vite's pre-bundle; packages/rn/.storybook/main.ts now wraps them as ES modules, and the rn conventions digest should record that as part of the react-native-svg web setup (Icon, rn).
- The lit conventions digest still says Lit's glyph table predates tools/icon-paths.json and redraws several glyphs; Icon.ts already carries the JSON verbatim, so that note is stale (Icon, lit).
- The generic prompt rules (Keyboard story, `opacity.disabled`, transitions on `motion.duration.fast`, focus-visible, delegatesFocus for `a11y.requires`, "rules always read the hook") should say they apply only to interactive components and unlocked bindings; Icon and Text had to argue their way past them (Icon, Text; web, lit).
- rn prompt rules disagree with the package: they say to import tokens from `@design-schema/tokens/<theme>/rn/light|dark` (the package reads `useTheme()`), give `toLineHeight(multiplier, fontSize)` (theme.tsx has `(fontSize, multiplier)`), and still name `TextNestingContext` (replaced by `TextStyleContext.nested`) (Text, rn).
- The Storybook previews do not set the body colour to `var(--color-foreground)`, so a story that passes a bare string inherits a non-token colour and fails dark-mode contrast (Text, web).
- The derived `renders` scenarios assert only that something rendered; for slot-only or style-only primitives (Box, Stack, Text) they pass trivially and test no binding. Style assertions need a browser gate; jsdom computes no cascaded custom properties (Box, Stack, Text).
- A fold session still cannot run `node logs/*.mjs` or a chained `git diff | grep`; the stale sections were read from `git diff -U0 generated/gaps/SUMMARY.md` (fold, Primitives phase).

## 2026-09-19

- Every round 2/3 of the Primitives rerun and of Button, Link, Input and Form is again the whole-Storybook axe / keyboard-run verdict (plus an axe webServer 120s start-up timeout and a 900s whole-Lit-Storybook timeout); still unscoped, see 2026-09-18 (all nine components, all platforms).
- The axe gate ran against a Storybook built before the round's edit (packages/react/storybook-static from 2026-09-17), so it never tested the regenerated code; the gate should rebuild or check the build is newer than the component (Form, Button; web).
- The axe gate checks only each story's first render; states reached by interaction (Form's error summary) need a play function or a post-interaction pass (Form; web, lit, rn).
- Generic prompt rules conflict with component docs: "disabled uses aria-disabled on the root" (Form's role forbids it), "disabled sets accessibilityState.disabled in addition to `disabled`" (TextInput has none), the `disabled`/accessibilityState template for components with no `disabled` (Link), "Enum props with quoted digits (Heading level, Stack gap) accept numbers" (Stack gap is named presets), and a Lit convention that role/aria-label sit on the host (Icon's are on the shadow svg) (Form, Input, Link, Stack, Icon).
- The generated "Style bindings" / Overrides sections render computed bindings with the ×factor inside the hook value (Button inverseHoverOpacity) and list forwarded-only bindings as `--ds-*` hooks (Form errorSummaryGap), contradicting the binding descriptions (Button, Form; lit).
- The rn conventions digest should require mirroring `accessibilityState` as `aria-*` props for react-native-web 0.21, which drops accessibilityState (and Pressable overwrites a passed aria-disabled), and still has `toLineHeight` arguments reversed and names `TextNestingContext` (Button, Input, Link, Heading, Text; rn).
- Link's animated press colour raises an act() warning in the RN Jest tests; the rn test conventions give no pattern for animated state (Link, rn).
- A fold session still cannot run `node logs/*.mjs`; stale gap files were found by grepping round headings dated after folded.json and `ls --time-style` (fold, Primitives rerun).

## 2026-09-21

- `tools/behavior_tests.ts` resolves `then.role` and `then.attribute` inside the shadow root on Lit, while Card, Divider, Landmark and Toolbar put role/tabindex/aria-* on the host because tests read them there; the harness needs a host fallback, or those scenarios stay red (Card, Divider; lit).
- Blocked-activation scenarios need a forced click: Playwright's actionability check rejects an `aria-disabled` or natively disabled control, so `disabled-does-not-fire` and `disabled-option-cannot-be-selected` time out unless the generator emits `{ force: true }`; it does so only when the scenario's own `given` disables the whole component (Button, RadioGroup; web, lit).
- `keyboard-run` scoped to a component still needs `--pass-with-no-tests`: Button, Card, Form, Link and every other component with no `keyboard` block has no generated spec and Playwright exits 1 on "No tests found". Form's doc could carry the block but `a11y.requires` would need `keyboard-operable`, which a fold may not add — the fix stays in the harness (Button, Card, Form, Link; web, lit).
- The generated behavior harness emits a bare `vi.fn()` for cancelable events, so Link's click scenario logs jsdom's "Not implemented: navigation"; it should emit a preventDefault for a scenario whose description asks for one (Link; web).
- The rn behavior harness fires `fireEvent.press` on real timers, so any component with a `transition` binding logs act() warnings after the test body; it needs the fake-timer press helper the hand-written tests use (Link, Button, Disclosure; rn).
- The generated Style-bindings section still renders `computed` with the factor inside the hook value (Button inverseHoverOpacity) and lists forwarded-only bindings as hooks; both contradict the binding descriptions the docs now fix (Button; web, lit).
- Story-level conventions have no home in a component doc: `given` content shorthand ("Icon name=close"), which non-example stories a platform must export and under what names, and how a Lit story clears an inherited string arg. Parity breaks are only caught by hand (Button, Card, Divider, Landmark, RadioGroup, Switch; all).
- The generated JSDoc takes a prop's whole description, so four platforms' clauses land in one `.d.ts`; a per-platform or web-only short form would help (Link; web).
- A fold session still cannot run `node logs/*.mjs`; stale gap files were again found with `ls --time-style` against folded.json (fold, Controls phase).
- `tools/docs_snippets.ts` maps a Lit property binding to its declared attribute name without negating it, so the spec-mandated `.trapped=${args.trapped}` publishes `<ds-focus-scope no-trapped>` for a *trapped* scope and publishes nothing for `trapped: false`; system-wide, not FocusScope-specific — generated/examples/Accordion.json renders a bare `<ds-accordion>` with `no-divided` silently dropped (FocusScope, Accordion; lit).
- The generated Lit behavior harness searches only the shadow root, so Tooltip's `role="tooltip"` node is unreachable: platforms.lit requires it in the LIGHT DOM for the idref to cross the boundary, and a second copy inside would break "exactly one role=tooltip". Its `trigger()` fallback also resolves to the shadow `<slot>` and times out on hover, because `children` cannot be expressed in lit story args; 2 of 9 fail (Tooltip; lit).
- The generated keyboard spec pins its subject with `getByRole(...).first()`, which re-resolves after a dismissal and promotes the next instance into the same slot, so a multi-instance component can never assert "Escape dismisses the focused one" while two are present; it should capture the element handle once, or by `data-ds` + nth (Toast; web, lit).
- `focus-unchanged` is vacuous when the component root has no focusable descendants: `focusIndex` is scoped to root, so before and after are both -1 whatever focus does. It should compare `document.activeElement` identity, or scope the focusables to the story container (Tooltip; web, lit).
- The generation prompt is written as if generating from scratch and gives no reconciliation guidance when the component, its CSS, stories, tests and index export already exist and largely conform; every regeneration job has to invent the rule (treat the spec as authoritative, change only contradictions) for itself (FocusScope; web, lit).
- The generic prompt rules require a native element for `a11y.requires`, `delegatesFocus: true`, an accessible name, a `:focus-visible` ring and a heading per `heading-hierarchy`. None can apply to a component whose schema declares `role: none`, no label prop, no level prop and `styles: {}`, and whose platform notes forbid `delegatesFocus` — the boilerplate reads as contradictory (FocusScope; lit).
- A fold session still cannot run `node logs/*.mjs` (denied in both Bash and PowerShell), so the stale set was found by diffing `generated/gaps/SUMMARY.md` against HEAD rather than by comparing mtimes to folded.json (fold, Focus phase).
- FIXED this phase: `focusables()` in tools/keyboard_tests.ts walked with querySelectorAll plus shadow-root descent and never followed `<slot>` assignments, so every slotted Lit overlay was measured on its shadow-side controls alone (Popover saw one element, which made `from: first` and `from: last` the same node and demanded opposite outcomes). Replaced with a flat-tree walk; keyboard-lit went 65/30 → 72/23 (Popover Tab, Dialog ×3, BottomSheet ×2, Stepper Tab, Tree ArrowDown/ArrowUp) with keyboard-web byte-identical. The Dialog and BottomSheet rounds earlier in the phase that reported the Tab rules as unsatisfiable were describing this, not a doc gap (Popover, Dialog, BottomSheet; lit).
- Surfaced by that fix, not caused by it: Toolbar's keyboard gate was already red on `Home` and now adds `ArrowLeft` and `End` — `End` lands on index 6 of 8 focusables, so its roving set and the panel's tabbable set disagree, most likely because the overflow control is tabbable but outside the roving order. For Toolbar's own pass (Toolbar; lit).
- The generated behavior harness resolves a part hook and then acts on that element, so for a composed child whose part lives on an overlay-owned wrapper it clicks the wrapper (the click never reaches the inner button) and compares the wrapper against `document.activeElement`. On Lit it also matches copy against `shadowRoot.textContent`, which a label passed as a property never reaches. Both locators need to descend to the interactive element and read its accessible name (AlertDialog, ActionSheet; web, lit).
- `tools/behavior_tests.ts` has no way to express Playwright's `{ force: true }`, so any scenario that clicks an element the doc requires to carry `aria-disabled="true"` fails the actionability check rather than the assertion — the hand-written test passes the same scenario (Menu; lit).
- The generated behavior test writes a doc prop straight onto the element (`el.role = 'complementary'`), which on a custom element hits the native `Element.role` reflection rather than the per-platform property rename the doc declares (`landmark`), so the `renders-role-*` scenarios pass without exercising the choice. The rename needs to reach the generator (SidePanel; lit).

## 2026-09-21 — fold, Selection phase

- The keyboard harness cannot focus an activedescendant composite whose root *is* the focusable element: `focusAt()` takes `root = getByRole('combobox')` (the `<input>` itself) and walks its element children, of which an input has none, so keys land on `document.body` and every `expect: closes` rule fails whatever the component does. Either fall back to focusing the root when it is itself focusable, or carve out activedescendant composites (Combobox; web).
- The "a Keyboard story ships at least three focusable children" rule is unmeetable for the two patterns that deliberately have one tab stop: an activedescendant composite (options non-focusable, the toggle at `tabIndex=-1`) and a roving-tabindex composite (only one tab is tabbable). Whether the gate counts `tabIndex=-1` elements or tab stops is unstated (Combobox, Tabs; web, lit).
- `tools/behavior_tests.ts` again: a scenario whose own `given` marks the *clicked option* disabled (not the whole component) still emits a plain click, which Playwright's actionability check refuses on `aria-disabled`, so `a-disabled-option-cannot-be-selected` and `a-disabled-tab-cannot-be-selected` time out rather than assert. The hand-written tests pass with `{ force: true }` (Listbox, Tabs, SegmentedControl; lit).
- The gate's `beforeEach` precondition ("has the story rendered") shares the 5s expect timeout with the assertions, so a cold Vite compile under a full-suite run fails every test in the file with "element(s) not found" — blamed on whichever component was being generated. Raised to 15s for the precondition only; 4 of 6 failures in a Listbox round came from this (Listbox; web).
- The "Declared contracts → Keyboard" section of the generated prompt is a truncated view of the schema `keyboard` block (SegmentedControl: 2 of 5 rules; Tabs: the two vertical arrows only) while the surrounding text says to implement "the listed rules and none the section excludes". Two components resolved it by implementing the full schema table; the section should either carry every rule or stop claiming completeness (SegmentedControl, Tabs; web, rn).
- Story parity is keyed by React export name (`tools/docs_examples.ts`), so a platform-only story cannot exist: Accordion's Lit page has no snippet of the light-DOM `<ds-disclosure>` form its own platform notes call primary, because that form cannot be a same-named, same-args story (Accordion; lit).
- Cross-component conventions that keep being rediscovered per doc and belong in `prompts/conventions/` (a fold may not edit outside `site/src/content/docs/`): (1) an empty-string `error` is not a message — Input/Select/Listbox/DatePicker/NumberInput treat it as absent, Checkbox/RadioGroup/Slider do not; (2) a part that wraps a composed Button carries the handler on the wrapper, so a scenario click on the wrapper and a real click on the button each fire once; (3) every prop a keyboard rule names in `given` needs an explicit enum argType in the Keyboard story's meta, or Storybook drops the URL arg and the gate silently tests the default (Combobox, Tabs; web, lit).
