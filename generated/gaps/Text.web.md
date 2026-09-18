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
