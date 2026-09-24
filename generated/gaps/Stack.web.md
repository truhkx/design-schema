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

## 2026-09-12 06:10 — round 1

- Stack: the home page's feature section (job 504) is the first real use of the "a wrapped Stack, not a grid primitive" interim answer website-plan.md settled on, and unaided it does not hold up. A wrapped Stack is a flex row whose items are sized by their content, so four Cards of body copy shrink toward their longest word and the row never reaches the point of wrapping: at a phone width the four pillars render as four columns one word wide instead of one card per row. `wrap` alone cannot express "cards about this wide, then break", because the preferred width is a property of the items and Stack has no per-item prop, no `columns`, and no `itemBasis`. The page supplies the missing piece itself in apps/website/src/styles/home.css (`flex: 1 1 <preferred column width>` on the Stack's children — flex sizing only, no appearance), and this is the foundations question the plan asked to have flagged once the section was built. The better answer is a real grid primitive (`Grid(minItemWidth, gap)` over one `repeat(auto-fit, minmax(…))` rule) rather than a new prop on Stack: the docs site's component gallery and any adopter's card collection want the same shape, and a grid that states its own column rule also fixes the ragged last row a flex wrap leaves behind.
- Stack: a smaller, related gap the same section exposed — there is no token for "the narrowest a card of prose should get", so the preferred column width above had to be derived by arithmetic (half of `layout.max-width.prose`) instead of named. A `layout.min-width.card`, or a `layout.column.*` group alongside `layout.max-width.*`, would let the grid primitive above state its minimum in tokens the way every other layout decision already does.

## 2026-09-16 02:23 — round 1

- Stack: the four `examples` give `children` as prose describing the content ("The form fields", "A submit Button and a Cancel Button"), not a value, but the contract says every example is a story with 'exactly its given as args'. Chose representative children matching each description (Inputs for form-fields, Cancel+Submit Buttons for button-row, Texts for page-sections, six ghost Buttons for wrapping-filters) and kept every other arg literally as given. If a gate ever diffs story args against example givens, `children` will not match.
- Stack: `wrapping-filters` only reflows inside a constrained width, and the example's `given` has no way to say so; added a max-inline-size story decorator (as the pre-existing `Wrap` story does). That decorator is not part of the example's given.
- Stack: `element: ul/ol` says 'each child is wrapped in an li', but React's `Children.map` does not descend into a fragment, so `<Stack element="ul"><>{a}{b}</></Stack>` yields one `li`. Kept standard React child semantics (arrays flatten, fragments do not) rather than inventing fragment flattening, and changed the stories to pass an array. The doc should say which one it means.
- Stack: `a11y.role` is `none`, but the `list-element-is-a-list` scenario requires role list and the CSS drops `list-style` (which strips list semantics in some browsers). Set `role="list"` explicitly on `ul`/`ol` only; the doc's a11y section does not mention this attribute.
- Stack: the anatomy lists only `container`, so the generated `li` wrapper for `ul`/`ol` has no anatomy name and got no `data-part`. If tests are ever meant to locate items by part, the anatomy needs an `item`.
- Stack: the generic rule 'Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number' names Stack `gap`, but this schema's gap values are `none|tight|normal|loose|section`. Ignored the rule; either the rule or the schema is out of date.
- Stack: the convention 'rest never forwards style or className to the root' conflicts with every existing component in the package, all of which destructure `className`/`style` and merge them onto the root. Kept the package-wide behavior so Stack is not the lone exception; if the convention is the intent, this needs a package-wide change, not a Stack-only one.
- Stack: `wrap`'s description scopes it to horizontal stacks, but nothing says what it does on a vertical one. Applied `flex-wrap: wrap` regardless of direction (it is inert on a column that is not height-constrained) rather than silently ignoring the prop.
- Stack: the swiftui platform notes reference `direction: responsive` and a `divider: true` prop, neither of which exists in `props`. Treated them as stale notes and generated nothing for them, but they read as a spec for props the schema is missing.
- Stack: `justify` omits `around`/`evenly`, which flexbox has and which the docs do not mention as a deliberate exclusion. Generated only the four listed values.

## 2026-09-17 03:59 — round 1

- Stack: the generic rules say quoted-digit enums like 'Stack gap' accept numbers, but Stack gap's values are none/tight/normal/loose/section — no digit strings, so gap takes only the string union. The rule's example is stale.
- Stack: the platform notes say Stack merges consumer className/style, while the package convention says `...rest` never forwards style/className and the override contract is the only per-instance styling. I followed the component notes (merged, with `overrides` hooks applied first and consumer style after); the ordering between the two isn't specified.
- Stack: examples give `children` as prose ('The form fields', 'A submit Button and a Cancel Button', 'A row of filters') rather than values, so 'exactly its given as args' can't be literal. I realised them as arrays of Input/Button/Text elements.
- Stack: WrappingFilters needs a narrow container to show wrapping; the example has no width, so the story keeps a decorator with an inline maxInlineSize (story-only, not in args).
- Stack: `wrap` is a boolean, so it doesn't fit the one-story-per-enum-value rule. The story is named `Wrap` rather than `WrapTrue`; the doc doesn't name it.
- Stack: `ref` is typed Ref<HTMLElement> because the root tag varies with `element` (div/section/nav/ul/ol); the spec doesn't say whether the type should narrow per element.
- Stack: `element` is web/lit only, but the doc doesn't say whether a consumer `role` on a ul/ol Stack should win over the forced role="list". The list role wins; for other elements a consumer role passes through.
- Stack: the doc says 'one li per child as the platform counts children' but not how null/boolean children count. React.Children.map skips them (no empty li), which I kept.

## 2026-09-18 14:55 — round 1

- Stack: `wrap` is a boolean, and the 'one story per enum value' rule doesn't say whether booleans get stories; I kept the existing `Wrap` story (horizontal, inside a width-bounded decorator), which overlaps the `WrappingFilters` example story.
- Stack: the Default story is fixed at three Text children but the text isn't specified; I used 'First item' / 'Second item' / 'Third item'.
- Stack: examples describe children in words only ('The form fields', 'A row of filters', 'The regions of the page'); I chose three Inputs (name/email/phone), six small secondary/ghost filter Buttons, and three Text regions. The spec doesn't say which Button variant or size a filter should use.
- Stack: the enum-value stories for horizontal-only effects (DirectionHorizontal, Justify*) add `align: 'start'` and `direction: 'horizontal'` beyond the single prop the story is named after, so the effect is visible; the spec says an example story has exactly its `given` as args but doesn't say whether that also applies to enum-value stories.
- Stack: `justify` on the Default (vertical, unbounded) Stack shows nothing, as the doc warns; the Justify* stories are shown horizontally, not inside a bounded-height decorator. The spec doesn't say which it wants.
- Stack: the root also carries `min-inline-size: 0` so a horizontal Stack can shrink inside a parent flex container; the spec doesn't mention it (kept from the existing file).

## 2026-09-18 15:04 — round 2

- Stack: the round-2 gate failures don't involve Stack. keyboard-run has no Stack spec (Stack declares no `keyboard` block), and in the 15:03 axe report (logs/playwright.json) every violation is in another component (Carousel scrollable-region-focusable, Feed/Listbox aria-required-children, Slider/Tabs/Menu/Splitter/Listbox color-contrast, Splitter target-size, among others). No Stack story appears, so I made no Stack change. The gates don't separate per-component results from failures elsewhere in the package, so a clean component still gets a FAILED verdict; I left the other components' failures for their own jobs.
- Stack: the round-1 gaps still stand: the `wrap` boolean has no enum-value story rule (I kept `Wrap`); the Default story's Text wording isn't given; the example children are described only in words; horizontal-only enum stories add `direction`/`align` args; Justify* stories are horizontal rather than height-bounded; the root carries an unspecified `min-inline-size: 0`.

## 2026-09-18 15:13 — round 3

- Stack: round 3 fails the same way as round 2. keyboard-run has no Stack spec (the doc declares no `keyboard` block), and the 15:13 axe report (logs/playwright.json) has no `Stack/React/*` violation; every failure is in another component. I made no Stack change. The gate runs every story in the package and turns one pass/fail into a verdict for the component being generated, so Stack can't pass until those components are fixed. The gate should filter to the component under generation, or compare against a baseline of known package failures.
- Stack: the round-1 gaps still stand: the `wrap` boolean has no enum-value story rule (I kept `Wrap`); the Default story's Text wording isn't given; the example children are described only in words; horizontal-only enum stories add `direction`/`align` args; Justify* stories are horizontal rather than height-bounded; the root carries an unspecified `min-inline-size: 0`.

## 2026-09-19 06:25 — round 1

- Stack: the generation rules say 'Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number', but Stack `gap` is now named presets (none/tight/normal/loose/section) with no digit values; the rule's Stack example is stale. I typed gap as the name union only.
- Stack: the `wrapping-filters` decorator caps the container at `layout.maxWidth.prose` (572px in the built themes). Eight small Buttons ('All'…'Archived') at `gap: tight` come close to that width, so whether they actually wrap depends on the theme's button padding and type size; the doc asserts that they wrap but no token guarantees it. I used the prose cap as specified and did not check the wrap visually.
- Stack: 'an example story has exactly its `given`' conflicts with CSF3, where story args merge over `meta.args` (align: stretch, wrap: false, element: div). The examples therefore inherit the defaults for props their `given` leaves out. Those defaults equal the schema defaults, so nothing visible changes, but the docs should say that inherited defaults count as 'exactly its given'.
- Stack: the `Wrap` story rule says 'horizontal, in the same width-bounded decorator as `wrapping-filters`' but does not name its children. I reused the eight filter Buttons, since the three-Text Default row never overflows 572px and would not show wrapping.
- Stack: the `list-element-is-a-list` scenario has only `then: role: list`, while its description says the test also asserts three listitems. I kept the listitem count and the `data-part="item"` check. The scenario's `then` should list the count so the other platforms assert it too.
- Stack: the `Wrap` and `DirectionHorizontal` stories add `align: start`, following the justify note that an enum-value story may add args to make its value visible. The doc doesn't say whether `Wrap` should use `start` or `center`; I chose `start`.

## 2026-09-19 06:33 — round 2

- Stack: both failed gates (keyboard-run, axe) run over the whole Storybook and fail only on other components (axe: Carousel, Feed, Listbox, Slider, Splitter, Menu, Tabs; keyboard: ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip, Tree). Stack has no keyboard block, and its 21 stories pass axe in light and dark with 0 violations. A per-component round can't pass these gates, so the gates should be scoped to the component being generated. I changed no Stack code.
- Stack: the round-1 gaps still apply: the stale 'Stack `gap` accepts numbers' rule, the prose-width cap that may not make eight small filters wrap, example stories inheriting meta.args defaults, unnamed children for the Wrap story, the listitem count missing from the list-element-is-a-list `then`, and `align: start` vs `center` on the Wrap story.

## 2026-09-19 06:39 — round 3

- Stack: rounds 2 and 3 got the same whole-Storybook failures from keyboard-run and axe, and none of them are in Stack. The axe report (logs/playwright.json, 06:39) has no Stack/React entries, and Stack has no keyboard block. The failures are in Carousel, Feed, Listbox, Slider, Splitter, Menu, Tabs, ActionSheet, Combobox, DatePicker, Search, Toast, Tooltip and Tree. A per-component round can't clear them, so the gates should be scoped to the generated component or baselined against existing failures. I changed no Stack code.
- Stack: the round-1 gaps still stand: the stale 'Stack `gap` accepts numbers' rule, the prose-width cap that may not make eight small filters wrap, example stories inheriting meta.args defaults, unnamed children for the Wrap story, the listitem count missing from the list-element-is-a-list `then`, and `align: start` vs `center` on the Wrap story.

## 2026-09-23 13:47 — round 1

- Stack: `wrapping-filters` asks for a container capped at `layout.maxWidth.prose × 0.5`, but no token holds the 0.5. I wrote it as `calc(var(--layout-max-width-prose) * 0.5)` in the decorator's inline style; lint_literals accepts it. A `layout.maxWidth.*` step at half of prose would remove the bare multiplier.
- Stack: the general convention says `...rest` never forwards `style` or `className` to the root, but platforms.web.notes says Stack merges both. The notes win: `className` is appended to the root classes, and `style` is merged after the `overrides` hooks, so a consumer `style` setting `--ds-stack-gap` beats `overrides.gap`. The doc does not say whether that ordering is intended.
- Stack: the rule that an enum-value story 'may add the args that make its value visible' appears only in the `justify` description. I also applied it to `ElementNav` (horizontal, `align: start`) and left `ElementDiv`, `ElementSection`, `ElementUl` and `ElementOl` vertical with only `element`. The doc names the `Gap*` stories as vertical-only but says nothing about the `Element*` stories.
- Stack: 'One `li` per child as the platform counts children' is implemented with `Children.map`. It counts a fragment as one child, skips null and boolean children, and re-keys the children, so a consumer's keys get a prefix inside the `li`. The doc does not say whether keys must be preserved.
- Stack: the only authored list scenario uses `ul`. The test checks `role=list`, three `listitem`s and `data-part=item`; `ol` is covered only by the derived renders test. The doc could add an `ol` list scenario, since the role-wins rule applies to both.
- Stack: the doc does not say whether `ul`/`ol` should reset the user-agent margin and padding. The root sets `margin: 0; padding: 0` on every element, which stops the list indent from shifting the gap layout.

## 2026-09-23 13:48 — round 2

- Stack: not a spec gap, a gate-infrastructure conflict. playwright.config.ts reuses any server already on port 6007 (`reuseExistingServer: true`), so in a worktree the axe gate can run against another checkout's Storybook and fail with ERR_CONNECTION_REFUSED when that server stops. Nothing in the component caused it. The same spec, run against this worktree's own Storybook on a private port (logs/stack-axe.config.ts, DS_GATE_COMPONENT=Stack), passes axe in light and dark. I changed no component code for this round.
- Stack: the `wrapping-filters` × 0.5 multiplier is still a bare number, `calc(var(--layout-max-width-prose) * 0.5)`, because no `layout.maxWidth` token is half of prose.
- Stack: the round-1 gaps still stand. A consumer `style` beats `overrides` (the notes say style merges after the hooks). The `Element*` stories are not told which extra args they may add, and I made only ElementNav horizontal. `Children.map` re-keys children inside the `li` wrappers. `ol` has no list scenario of its own. The doc does not say whether the root should reset the user-agent margin and padding on ul/ol.

## 2026-09-23 18:54 — round 1

- Stack: `overrides.gap` is a no-op under `gap: none` because the `none` rule reads `--layout-gap-none` directly; the spec states this and I followed it, but it means a consumer's `--ds-stack-gap` on that root is silently ignored.
- Stack: the spec does not say whether `ul`/`ol` items get a `key` or how nested arrays or fragments are flattened; I used `Children.map`, which counts a fragment as one child and keys the `li` wrappers itself.
- Stack: the `Keyboard` story requirement does not apply (no keyboard block, no interactive behavior); none was written.
- Stack: `ref` is typed `Ref<HTMLElement>` for every `element` value, as the doc says, so callers cannot get a `HTMLUListElement` ref without a cast.
