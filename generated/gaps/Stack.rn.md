# Gaps reported while generating Stack for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:50 — round 1

- Stack: the existing Stack.tsx predated this spec's rewrite of `gap` from a raw spacing-scale enum ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section). Regenerated it against `layout.gap.*` tokens (layoutGapNone/Tight/Normal/Loose/Section) per the spec's explicit contrast with 'the raw spacing scale'. This breaks type-checking in consumers still passing old numeric gap values (AlertDialog.tsx, AlertDialog.stories.tsx, Dialog.tsx, Dialog.stories.tsx, FocusScope.stories.tsx, Form.stories.tsx, and demo/Preferences.tsx, demo/ProfileSettings.tsx, demo/SignIn.tsx) — out of scope for this Stack-only job; those components need their own regeneration pass to adopt the new gap enum.
- Stack: overrides contract lists only `gap` as overridable with no presence-toggle prop (unlike Box's surface/border/radius), so the override is applied unconditionally regardless of the `gap` value (including `gap: none`) rather than gated behind another prop.
- Stack: spec gives no `testID` guidance beyond the general package convention; added `testID="Stack"` on the root View per the package-wide testability-hook rule, matching Box/Card/Container.
- Stack: no story previously existed for overrides or wrap as 'notable states'; added `Wrap` and `WithOverrides` stories (using `space.lg` as an example override token) since the spec requires overrides support but the scenario list only covers the enum props.

## 2026-09-10 00:52 — round 2

- Stack: Round 1's spec-correct rewrite of `gap` from the raw spacing scale ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section) broke nine consumers still on the old numeric values, which the typecheck gate caught. Fixed the consumers rather than weakening Stack's type, mapping each usage by matching pixel value where an old spacing-scale token equals a new layout-gap token exactly (space0=layoutGapNone=0, space1=layoutGapTight=4, space2=layoutGapNormal=8, space4=layoutGapLoose=16) and by semantic role for the one value with no exact match: '6' (space6=24px) was always used as the outermost Stack wrapping a whole screen's major sections, so it became 'section' (32px) per the spec's own definition ('section between page sections') even though it's not the closest pixel match to loose (16px).
- Stack: no spec guidance on how a spacing-scale-to-rhythm-enum migration should be handled for existing call sites; treated it as this job's responsibility since the gate blocks the whole package build, but flagging that other in-flight component jobs (AlertDialog, Dialog, FocusScope, Form, and the three demo screens) had their Stack usages touched as a side effect and may want to double-check the chosen gap value reads correctly in their own visual review.

## 2026-09-16 02:34 — round 1

- Stack: the rule list says "Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number", but Stack's `gap` values are `none|tight|normal|loose|section` — no digits. Treated as a stale reference and typed `gap` as the string union only.
- Stack: the `gap: none` binding is contradictory — the global rule says an enum value of `none` "renders nothing rather than a token", but a `layoutGapNone` token exists and the binding's own description says `none` "renders no gap and makes `overrides.gap` a no-op". Chose to read `t.layoutGapNone` (a real token, resolves to 0) and to ignore `overrides.gap` when `gap` is `none`.
- Stack: `element` is declared `platforms: [web, lit]` and the rn notes say to use `accessibilityRole` on the content instead, but the doc gives no guidance for the two `element` behaviors (`nav-element-is-a-navigation-landmark`, `list-element-is-a-list`) on native. They are absent from the 16 rn scenarios so nothing was skipped, but RN callers have no documented way to get list semantics from a Stack — the doc should say so explicitly.
- Stack: the examples' `children` are prose ("The form fields", "A submit Button and a Cancel Button", "The regions of the page", "A row of filters"), not renderable nodes, and RN cannot render a bare string inside a View. Chose concrete package components for each example story: three `Input`s, a secondary Cancel + submit `Button`, three level-2 `Heading`s, and five secondary `Button`s plus a `Text` count.
- Stack: `justify` has no visible effect on a vertical stack unless the View has a bounded main-axis size, and the schema gives Stack no height/flex binding. Left it to the caller (the `Justify*` stories use `direction: horizontal`); the doc should say `justify` needs a constrained main axis.
- Stack: `ref` is not in the schema or in `platforms.rn.props`, but the package convention requires a root-exposing component to accept one. Added `ref?: React.Ref<ViewInstance>` on the root `View`; if Stack is meant to have no ref surface, the convention and the schema need to agree.
- Stack: `overrides.gap` is typed as the whole `TokenRef` union, so `{ gap: 'color.border' }` type-checks and reaches `gap` as a color string. Cast the resolved value to `number` as every other component in the package does; the overrides contract has no way to constrain a binding to a token category.
- Stack: the `wrap` a11y note ("content reflows at 320px and 400% zoom") is a web/CSS concern with no native equivalent — there is no viewport width or browser zoom on iOS/Android. Recorded it in the component JSDoc as guidance rather than implementing anything; the doc should state the native reading (large text settings / `allowFontScaling`).

## 2026-09-17 04:02 — round 1

- Stack: the generic rule says enum props whose values are quoted digits (naming 'Stack gap') accept both string and number, but Stack's gap values are now names (none|tight|normal|loose|section); the rule's example is stale. Chose names only.
- Stack: examples give `children` as prose ('A submit Button and a Cancel Button', 'A row of filters', 'The regions of the page') rather than content, so the stories invent the children (Buttons, Inputs, Headings); the Default story's children are also unspecified. For button-row the prose lists submit before cancel, and I rendered Cancel then Submit (the usual order for an end-aligned row).
- Stack: the button-row and wrapping-filters examples leave `align` at its default `stretch`, so on a horizontal row children stretch to the tallest item's height; the previous stories added align: center to avoid that. Removed it to match 'exactly its given'. The doc should say whether rows should set align.
- Stack: platforms.rn.props lists `style`, but the overrides contract says no `style` prop is accepted; read as the View's internal style, not a public prop.
- Stack: every behavior scenario is `renders: true`; the two semantic scenarios (nav, ul) are web/lit-only and `element` is excluded on rn, so nothing tests direction, gap, align or justify on native. The rn notes say to use `accessibilityRole` on the content, but the element prop's own description says RN's counterparts are Landmark (navigation) and a plain View (list); the two notes should agree.

## 2026-09-18 16:02 — round 1

- Stack: the wrapping-filters example needs a 'width-bounded container' decorator but names no width or token. I bounded it with `layout.maxWidth.prose` and used eight filter Buttons so the row wraps at that width; a small, named story width (or a `layout.column.*` token, which the guidance already suggests) would make this deterministic.
- Stack: the `children` prop says the Default story renders 'three Text children' but gives no content. I used placeholder text ('First item', 'Second item', 'Third item'). The copy isn't specified, so each platform may choose different words.
- Stack: example children are described in words only ('The form fields', 'The regions of the page', 'A row of filters'). I picked the components and labels myself: three Inputs (Full name/Email/Password), three level-2 Headings for page sections, and secondary Buttons for filters. The doc doesn't say whether filters should be Buttons or a toggle component.
- Stack: the `justify` stories only show distribution on a bounded main axis. The doc says the caller supplies that size but gives no story guidance, so the Justify* stories use `direction: horizontal` (with `align: start`) so the effect is visible. A vertical justify story would look the same for every value.
- Stack: the `platforms.rn.props` list names `style` and says it is internal. The rules also say there is no `style` prop, so none is exposed. The doc should drop `style` from the rn props list, or mark it internal in the schema, so the two don't appear to contradict each other.
- Stack: every behavior scenario is `renders: true`. Nothing tests the resolved gap token, the `gap: none` override no-op, or the direction, align and justify mapping on rn. Adding style-assertion scenarios, e.g. that `gap: none` with `overrides.gap` resolves `layout.gap.none`, would make the overrides contract testable.

## 2026-09-18 16:10 — round 2

- Stack: the axe gate runs over every story in the rn Storybook and fails the whole project if any component has a violation. This round's failures are all in other components (Select, Slider, Splitter, Stepper, Switch, Toolbar, Tree, TreeGrid, and the Preferences/Profile settings/Sign in demos and Patterns/SettingsPage), and none are Stack stories. Fixing the rn code for one component can't make this gate pass. The gate needs to be scoped to the stories of the component under generation, or baselined against the violations that already exist, before it can judge Stack.
- Stack: I couldn't run a Stack-only axe check (the script is at logs/stack-axe.mjs; running it needs approval). Stack's clean result rests on the gate's own report in logs/playwright.json, which has no Stack entries in light or dark mode.

## 2026-09-18 16:18 — round 3

- Stack: the axe-rn gate's latest report (logs/playwright.json, written 16:17:55, after the Stack files' last edit at 16:01) has no Stack/React Native entries in light or dark mode. Every violation belongs to other components or demos (Select, Slider, Splitter, Stepper, Switch, Toolbar, Tree, TreeGrid, Preferences/Profile settings/Sign in demos, Patterns/SettingsPage). The gate runs axe over the whole rn Storybook and fails on any violation, so no change to Stack can make it pass. Re-running Stack rounds against it only repeats this result. Scope the gate to the stories of the component under generation (filter index.json entries by title) or diff against a baseline of existing violations, and file the listed violations against their own components.

## 2026-09-19 07:11 — round 1

- Stack: the generic rules say 'Enum props whose values are quoted digits (Heading level, Stack gap) accept both the string and the number', but Stack's gap values are named presets (none/tight/normal/loose/section), not digits; the rule is stale for Stack and I ignored it.
- Stack: the button-row example gives 'a primary submit Button' but no label for it; the story keeps 'Submit' (type="submit"), which is invented scaffolding text.
- Stack: the doc says the `Wrap` story is 'horizontal, in the same width-bounded decorator as wrapping-filters' but not which children it renders; the Default story's three short Texts never wrap inside layout.maxWidth.prose, so I reused the eight filter Buttons and align: start. The doc should name Wrap's children.
- Stack: the doc says 'an example story has exactly its given', but the meta args (align: stretch, justify: start, wrap: false) still merge into the example stories in CSF3. Every value is the default, so rendering is unchanged, but 'exactly' cannot be met literally without dropping meta args.
- Stack: `direction: horizontal` should follow writing direction; on RN, `flexDirection: 'row'` flips under I18nManager.isRTL only when the app enables RTL. The spec doesn't say whether Stack should force it; I left it to the platform.
- Stack: the item anatomy part and the element prop (web/lit only) have no RN counterpart. The rn notes say so, but the anatomy list doesn't mark `item` as web/lit-only, so no `Stack.item` testID exists on RN.

## 2026-09-19 07:17 — round 2

- Stack: the axe gate runs every React Native story, and it failed only on other components' stories (27 components plus Demo/Preferences and Patterns/SettingsPage); no Stack/React Native story appears in logs/playwright.json. Stack has no role or ARIA attributes, so it cannot cause these rules to fail, and changing Stack cannot make the gate pass. I changed no code. The gate should run on the job's own component, or compare against a baseline, before it counts as a rejection of Stack.

## 2026-09-19 07:22 — round 3

- Stack: the axe gate failed again with the same list as round 2. logs/playwright.json (07:22) lists only failing stories, and no Stack/React Native story is in it, in either mode, so Stack passes axe. All the failures come from 27 other components and the Demo/Preferences and Patterns/SettingsPage pages. Stack has no role or ARIA attributes, so it cannot cause them, and changing Stack cannot make this gate pass. I changed no code. The gate should run on the job's own stories, or compare against a baseline, or this job will be rejected every round.

## 2026-09-23 13:41 — round 1

- Stack: the `justify` description says its enum stories 'may add the args that make its value visible (direction: horizontal, align: start)', but a horizontal Stack with no bounded width only shows justify if its parent is wider than the content; I kept the stories unbounded and relied on the Storybook canvas width, without adding a decorator the doc does not name.
- Stack: `wrapping-filters` says 'layout.maxWidth.prose × 0.5' but not how to write the 0.5 under the literal gate; I wrote `t.layoutMaxWidthProse / 2`, since 2 is an allowed literal.
- Stack: the `Wrap` story is described as 'horizontal, align: start' in the same decorator, while its example twin `WrappingFilters` uses `align: center` and `gap: tight`; I kept `Wrap` at the default `gap: normal` with `align: start`, as the doc says for `Wrap`.
- Stack: the `list-element-is-a-list` and `nav-element-is-a-navigation-landmark` behaviors are web/lit only and `element` is not an RN prop, so this platform has no test for them; nothing in the doc says whether RN should get a test proving `element` is absent from the props.
- Stack: `resolveToken` returns a general token value, and the doc does not say how RN should narrow it for a numeric binding like `gap`; the component casts it to `number`.

## 2026-09-23 13:41 — round 1

- Stack: the rn notes say `element` does not apply and the prop is web/lit-only, and the two behavior scenarios (nav landmark, list with three listitems) are also web/lit-only, so RN has no test for either. The doc could say outright that RN drops `element` from its props.
- Stack: the `item` part is in the anatomy but has no home on RN (children are not wrapped), so no `Stack.item` testID exists. The anatomy could mark `item` as web/lit only.
- Stack: `justify` says an enum-value story 'may add' `direction: horizontal, align: start`, but doesn't say whether that is required. The Justify* stories add both, and the Align* stories stay vertical with no extra args.
- Stack: the button-row example says 'a primary submit Button', and the children text says the submit Button is labelled "Submit". I took that to mean `type="submit"` with the default primary variant. The doc doesn't say whether `type: submit` is part of the scaffolding.
- Stack: `resolveToken(t, overrides.gap)` returns a general token value, so it is cast to `number` for the `gap` style. The overrides contract doesn't say how to narrow a TokenRef to a dimension; a gap override that points at a color token would type-check but break layout.
- Stack: the spec lists no stories beyond the enum values, `Wrap` and the examples. The existing `WithOverrides` story (`overrides.gap: 'space.lg'`) was kept as a 'notable state', but the doc names no overrides story.
