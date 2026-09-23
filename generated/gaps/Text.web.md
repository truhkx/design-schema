# Gaps reported while generating Text for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:40 — round 1

- Text: the existing committed Text.tsx predated the current package conventions (no data-ds hook, no overrides/CSS-hook system, element enum still included label/legend/htmlFor from an older schema version). Regenerated it to match the current schema (element: p|span only — labels/legends are now owned by Input/Fieldset per the schema note) and the current Card/Box/Container convention: root data-ds="Text", TextOverridableBinding (fontFamily, fontSize, fontWeight, lineHeight, color) with --ds-text-* CSS custom-property hooks, and an overrides prop using cssVar/TokenRef from @design-schema/tokens.
- Text: no Text.test.tsx existed; added one modeled on Card.test.tsx (meta.args + scenario `given`, one it() per behavior scenario) since the repo's other recently-touched components (Switch, Box, Card, Container) all ship this file alongside the component.

## 2026-09-10 00:42 — round 2

- Text: `element` is narrowed to p|span per the current spec (labels/legends now belong to Input/Fieldset), but Checkbox, Switch, and RadioGroup still relied on `<Text element="label"/"legend" htmlFor=...>` for native label association — kept the Text spec authoritative and switched those three consumers to native `<label>`/`<legend>` elements (their existing `__label`/`__legend` CSS already carries font-size/weight/color independent of Text's classes, so styling is unchanged), rather than reintroducing label/legend into TextElement.
- Text: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) matches the `fontFamily` key in the override-hook lookup table even though its value is a CSS custom-property name (`--ds-text-font-family`), not a literal font stack; marked that line `literal-ok` rather than renaming the binding key away from the schema's `fontFamily` term.

## 2026-09-16 01:51 — round 1

- Text: `color` is locked, but two composed consumers need a foreground the tone enum cannot express. Toast renders Text on `color.inverse.surface` and was passing `overrides={{color: 'color.inverse.foreground'}}`; Slider forwarded its `errorText` binding to Text's `color`. Neither is expressible: tone has no `inverse` value, and `onAction` is documented as action-backgrounds-only. Chose to lock per the contract, route Toast through the `--ds-text-color` CSS hook, and drop Slider's forward (its message is already tone=danger). The schema fix is probably a `tone: inverse` value, mirroring Button's existing `inverse` prop.
- Text: the package conventions say `...rest` never forwards `style` or `className` to the root, but ~20 sibling components (Input, Checkbox, Fieldset, Meter, ProgressBar, Dialog, AlertDialog, ActionSheet, Feed, Form, Toast, NumberInput, Slider...) pass Text a layout-only class such as `.ds-input__description { margin: 0 }`. Kept the forwarding, since removing it breaks the package; either the convention needs an exception for layout-only classes on composed children, or those components need a layout wrapper.
- Text: anatomy lists one part (`text`) but there is no parts/slots section, so it is ambiguous whether the root should carry `data-part="text"`. Chose not to emit it — siblings pass their own `data-part` (`description`, `errorMessage`, `label`) through rest, and a hardcoded value would collide.
- Text: `truncate` says the consumer passes `title` when children is not a plain string, but no dev warning is specified for the case where they pass neither — the text is then silently unreachable. No warning added (the docs do not ask for one); worth deciding.
- Text: the truncate behavior scenario asserts `attribute: title` without naming an element. Asserted it on the root (`[data-ds="Text"]`), which is the only element Text renders.
- Text: example `truncated-cell` given only `children` + `truncate: true` cannot visibly truncate — truncation needs a constrained container. Kept args exactly as given and added a narrow (`24ch`) decorator to stand in for the dense cell.
- Text: the doc guidance mentions `label` rendering ('`label` should only be used with a `for` association'), but the `element` enum is only `p | span`, so Text can never render a `<label>`. The guidance sentence describes a value that does not exist.
- Text: a11y.requires lists only `contrast-aa`, but the generic Rules section demands focus-visible / keyboard-operable / target-size treatment. Took the schema as the winner — Text is non-interactive, so no focus outline or min target was added.
- Text: the scenario list names the case `renders-tone-on-action` while the prop value is `onAction`; the previously generated test used `renders-tone-onAction`. Used the doc's kebab name. Worth pinning the casing rule for enum values that are camelCase.

## 2026-09-17 03:53 — round 1

- Text: `truncate` with `element: span` gives `display: inline-block`, but an inline-block with `overflow: hidden` sits on its bottom margin edge rather than the text baseline, which lifts it off the line next to surrounding text. The doc doesn't say how to align it; I added `vertical-align: bottom`.
- Text: `truncate` says `title` is set when children is a plain string, but not what happens when the consumer also passes `title`, or passes `title` without `truncate`. I let a consumer `title` win in both cases and forward it unchanged.
- Text: `color` is locked, but nothing says whether its internal CSS hook (`--ds-text-color`) should exist. It does, and it is set by the tone modifier class on the root. A consumer rule with higher specificity on the same element could still override it, so locking only covers the `overrides` type, not consumer CSS. The doc should say whether a locked binding gets a hook at all.
- Text: the web notes say Text merges a consumer `className` and `style` onto the root, while the package-wide convention says `...rest` never forwards `style` or `className`. I followed the component doc (Declared contracts win): I merge them, with `style` applied after the inline `overrides`, so a consumer's `style` can set the same hook and beat an override. The order between the two isn't specified.
- Text: the doc gives no `transition` binding, focus or disabled state, so the rule template's reduced-motion, focus-visible and opacity items don't apply and I added none.

## 2026-09-18 11:46 — round 1

- Text: the `styles.color` description says `TextForegroundContext` is exported from Text.tsx for sibling components, but the sentence around it is about React Native. I read it as RN-only and did not add it to the web Text.tsx; the doc should name the platform.
- Text: the Overrides section says 'Rules always read the hook, never the token directly', but the locked `color` binding reads `var(--color-foreground-*)` directly with no `--ds-text-color` hook. I followed the `styles.color` description, which says the section wins; the generic rule should exempt locked bindings.
- Text: the web notes say the consumer `title` 'always wins'. It is unclear whether an explicit `title={undefined}` with `truncate` counts as the consumer winning (no title) or falls back to the string children. I chose the fallback (`title ?? children`).
- Text: the truncate stories need a width constraint to show the ellipsis, and the spec gives no token for it. I kept the existing decorator's `maxInlineSize: '24ch'`; the doc could name a layout token or say stories may use a `ch` constraint.
- Text: nothing in the schema says what `truncate` does when the parent is wider than the text, or with `element: p` (it is display:block, so it fills the parent). This is covered only by the `span` inline-block note; I kept `display: block` for `p`.

## 2026-09-18 11:59 — round 2

- Text: the gate run under review failed on no Text story; its axe and keyboard failures are all in other components (Carousel, Feed, Listbox, Menu, Splitter, Tabs, Box, Slider for axe; Combobox, Dialog, SegmentedControl, Tabs, Toolbar, Tree and others for keyboard). The per-component round asks the Text generator to make these package-wide gates pass, but they cannot pass by editing Text, and editing other components is out of scope. I made no change. The round prompt should scope gate output to the component being regenerated.
- Text: `a11y.contrast` checks every tone only against `color.background`, but composing parents (Feed items, Box `surface`, Splitter panes, Tabs panels) place Text on raised or subtle surfaces. If any dark-mode contrast failure there turns out to be a `.ds-text` node, the doc does not say which component owns that pair (the Text tone or the parent surface). I did not change the tones, since the spec fixes them to `color.foreground.{tone}` and `color` is locked.

## 2026-09-18 12:10 — round 3

- Text: the round loop resends package-wide gate failures (axe over every story, keyboard specs for every component) to the Text generator, but no failure in rounds 2 or 3 is a Text story. Box and Splitter show it most directly: their stories that render Text pass dark-mode contrast, and only the stories that pass bare strings fail. No change to Text can make these gates pass. The round prompt should filter gate output to the component under regeneration, or the loop never converges.
- Text: Box's example stories (Highlighted Panel, Bordered Row, Hero Band, Navigation Region) and Splitter's (Sidebar And Content, Collapsible Navigation, Editor Over Preview, Never Stacking Workbench) pass plain strings for content the doc says Text should carry ('Use Text for paragraphs, labels, captions, helper text, and any inline copy'). In dark mode those strings inherit a colour that is not the foreground token and fail axe color-contrast. Either the examples' `given` values should be rendered through Text, or the Storybook preview should set the body colour to `var(--color-foreground)`. The Text doc does not say which owns it. I changed neither.
- Text: `a11y.contrast` checks tones only against `color.background`, while Box `surface: subtle|strong`, Feed items and Splitter panes put Text on other surfaces. The doc does not say whether those pairs are the Text tone's responsibility or the parent surface's. I left the tones as the spec fixes them.

## 2026-09-19 04:03 — round 1

- Text: the `onAction` tone story must paint `color.action.primary.background` 'on a wrapper holding a Box with `inset: md`', but the spec doesn't say how the wrapper paints it. No component takes an action-background surface (Box `surface` only has none/default/subtle/strong), so the wrapper is a story-only `<div>` with an inline `background: var(--color-action-primary-background)` and the padding comes from `<Box inset="md">`. The doc could say whether that inline wrapper style is sanctioned scaffolding, as it does for the truncate width.
- Text: with `truncate` on the default `p`, the spec says nothing about `display` for block-level truncation. I kept `display: block` + overflow hidden + nowrap + ellipsis, and only the `span` case gets the documented inline-block rules.
- Text: the spec says to use every enum value with a lookup rather than enumerating by hand, but the camelCase tone `onAction` needs a kebab modifier (`ds-text--tone-on-action`). I kept an explicit tone→class table instead of a runtime camel-to-kebab conversion.
- Text: the web notes say composing parents pass their `data-part` through `...rest`, but the spec doesn't say whether the `truncate`-derived `title` should also be put on a part that a parent names. I put it only on the root, which is the only element.

## 2026-09-19 04:17 — round 2

- Text: the round-2 failures (axe-web, keyboard-web) all come from other components. No Text/React story is in logs/playwright.json, Text has no keyboard block or generated spec, and axe run on only the Text/React stories passes 26 stories × light/dark with 0 violations. Both gates cover the whole Storybook, so they can't pass or fail one component on its own. A per-component axe filter (by story title) and keyboard filter would let a component's round be judged on its own stories.

## 2026-09-19 04:30 — round 3

- Text: rounds 2 and 3 failed only on axe-web and keyboard-web failures from other components. Text/React appears nowhere in logs/playwright.json, Text has no keyboard block or generated spec, and axe run on only the Text/React stories (logs/text-axe.spec.ts) passes 26 stories × light/dark with 0 violations. Text's files haven't changed since round 1, and the gate output changed between rounds (new Dialog Tab and Feed Tab failures), so the gate result doesn't depend on this component. Rounds for a single component need the gates narrowed to that component's stories and specs, or they can never pass until the rest of the package is clean.

## 2026-09-23 13:41 — round 1

- Text: `truncate` is a boolean, so the enum-story rule doesn't cover it. The spec names only `TruncateInline`, so the plain truncate-on-`p` story is called `Truncate` (with `TruncatedCell` as the example story). The doc could name it.
- Text: the spec says `ToneDanger` uses the `inline-error-wording` children, but not whether it also takes that example's `element: span`. I used only the children and kept the Default `element: p`.
- Text: the spec doesn't say whether a consumer `title=""` counts as passed. With `??` an empty string wins and suppresses the automatic title. I kept that because 'forwarded unchanged' suggests it.

## 2026-09-23 13:43 — round 2

- Text: the `styles.color` description says Text has no `--ds-text-color` hook on web or Lit and that the tone rule reads the token directly. That contradicts the package convention and the hooks gate (a locked binding keeps its hook). I followed the gate: each `.ds-text--tone-*` sets `--ds-text-color` to its token and `.ds-text` reads `color: var(--ds-text-color)`. The spec's actual requirements still hold: `color` is not in `overrides`, and the default tone still re-scopes, because the hook resolves `var(--color-foreground)` on the Text element and so picks up an inverse container's re-scoped value. The doc should drop 'has no --ds-text-color hook' and say the hook exists but `default` resolves through the bare `--color-foreground`. Lit's Text has the same gate failure and needs the same change.
- Text: the round-2 axe failure was ERR_CONNECTION_REFUSED on localhost:6007: the React Storybook wasn't running when the gate started, and nothing in Text caused it. Rerun scoped to Text, it passes in light and dark without a code change.
- Text: `ToneDanger` uses only the `inline-error-wording` children, not that example's `element: span`; the doc doesn't say which (carried over from round 1).
- Text: the doc doesn't say whether a consumer `title=""` counts as passed. It currently wins and suppresses the automatic title (carried over from round 1).

## 2026-09-23 13:43 — round 3

- Text: the round-3 typecheck failure was in packages/react/src/Carousel.test.tsx (ComponentProps not imported), not in Text. Another job is apparently regenerating Carousel in this worktree, and the file now has the import, so the rerun passes with no Text change. Gates for one component can fail on another component's work in progress when jobs share a worktree.
- Text: the `styles.color` description says Text has no `--ds-text-color` hook, but the hooks gate and package convention require one. The hook is kept (`.ds-text--tone-*` set it, `.ds-text` reads it), and the default tone still resolves `var(--color-foreground)` on the Text element, so inverse-surface re-scoping still works. Lit's Text needs the same fix (carried over from round 2).
- Text: `ToneDanger` uses only the `inline-error-wording` children, not that example's `element: span`; the doc doesn't say which (carried over from round 1).
- Text: the doc doesn't say whether a consumer `title=""` counts as passed. It currently wins and suppresses the automatic title (carried over from round 1).
