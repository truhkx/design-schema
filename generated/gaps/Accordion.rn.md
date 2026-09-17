# Gaps reported while generating Accordion for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 10:03 — round 1

- Accordion: `onChange` payload shape is unspecified beyond "the open ids"; I emit `string[]` always (0/1 entries under `exclusive`) since the wording is plural, while `value`/`defaultValue` still accept a bare `string` for exclusive controlled convenience per the `value` prop's own description — the two props use slightly different shapes by design.
- Accordion: styles.minTarget is size.target.comfortable (44px, locked) but the composed Disclosure hardcodes size.target.min (24px) with no exposed override, and the composition rule forbids restyling a child — targets stay at 24px until Disclosure's own schema grows a comfortable-target option.
- Accordion: a11y.requires lists `arrow-navigation`, and the `keyboard` block specifies ArrowUp/Down/Home/End focus movement among triggers, but RN's `Pressable` has no key-event API (same acknowledged limit as Tabs/RadioGroup) — not implemented; every trigger is still reachable via ordinary tab/swipe order.
- Accordion: `onOpenChange`'s `keyboard` reason can never fire natively since `Pressable` can't distinguish a hardware Enter/Space press from a touch — toggling always reports `trigger`.
- Accordion: `exclusive` + multi-id `defaultValue`/`value` isn't addressed by the spec; I open only the first id and warn in `__DEV__` for the uncontrolled case.

## 2026-09-10 18:47 — round 1

- Accordion: `onChange` payload shape is unspecified beyond "the open ids"; emit `string[]` always (0/1 entries under `exclusive`) since the wording is plural, while `value`/`defaultValue` still accept a bare `string` for exclusive controlled convenience per the `value` prop's own description — the two props use slightly different shapes by design.
- Accordion: styles.minTarget is size.target.comfortable (44px, locked) but the composed Disclosure hardcodes size.target.min (24px) with no exposed override, and the composition rule forbids restyling a child — targets stay at 24px until Disclosure's own schema grows a comfortable-target option.
- Accordion: a11y.requires lists `arrow-navigation`, and the `keyboard` block specifies ArrowUp/Down/Home/End focus movement among triggers, but RN's `Pressable` has no key-event API (same acknowledged limit as Tabs/RadioGroup) — not implemented; every trigger is still reachable via ordinary tab/swipe order.
- Accordion: `onOpenChange`'s `keyboard` reason can never fire natively since `Pressable` can't distinguish a hardware Enter/Space press from a touch — toggling always reports `trigger`.
- Accordion: `exclusive` + multi-id `defaultValue`/`value` isn't addressed by the spec; only the first id opens and a `__DEV__` warning fires for the uncontrolled case.

## 2026-09-16 09:02 — round 1

- Accordion: the event timing order is not declared; I fire onChange first, then onOpenChange for the toggled section, then one onOpenChange(id, false, 'exclusive') per section it closed. This follows the order of the behavior `then` lists and matches the web package.
- Accordion: the spec doesn't say how Accordion should treat Disclosure's own `onToggle(open, 'controlled')`, which fires whenever Accordion changes a Disclosure's `open` (for example when exclusive closes another section). I ignore it, so Accordion reports `exclusive` or `controlled` itself and nothing is reported twice.
- Accordion: Disclosure's reasons are `pointer | keyboard | controlled`, but Accordion's are `trigger | keyboard | exclusive | controlled`. The doc says the reasons 'come from Disclosure's onToggle' without giving the `pointer` → `trigger` mapping, so I wrote that mapping myself.
- Accordion: `fontFamily` has no Disclosure binding of the same name; I forward it to Disclosure's `triggerFontFamily`. `divider`/`dividerWidth` go to Divider's `color`/`thickness`. The spec lists no forwards for these composed children.
- Accordion: `itemGap` (part `item`) can't be applied to the item itself on RN without restyling Disclosure, so it becomes the list View's `gap`. Because Dividers sit in the same list, that gap also lands between each item and its divider. The spec doesn't say whether that's intended.
- Accordion: `minTarget`, `focusRing` and `focusRingWidth` are locked bindings that Disclosure's trigger already applies, so Accordion adds nothing. The a11y section says 'Targets meet 44px in the accordion form', but the styles give `size.target.min` plus `space.md` padding and never name `size.target.comfortable`, so I only add the padding override.
- Accordion: RN has no heading levels, so `headingLevel` only makes Disclosure's summary `accessibilityRole="header"`. All five renders-heading-level scenarios therefore produce the same tree.
- Accordion: the Keyboard rules (arrows, Home/End) are explicitly not implemented on native, and the rn notes say arrow keys apply 'only with a hardware keyboard on react-native-web'. Pressable has no key events, so I added no web-only handler. The Keyboard story renders one section open with four triggers (one disabled but still focusable).
- Accordion: the `exclusive-still-reports-both-events` scenario gives only `exclusive: true` with nothing open beforehand, so the test can't observe the 'closes the others' half. It checks both events and the expanded state only.
- Accordion: `click-on-a-trigger-reports-the-open-set` doesn't say which trigger to press; the test presses the first one and asserts onChange([firstId]) and onOpenChange(firstId, true, 'trigger').

## 2026-09-17 12:06 — round 1

- Accordion: a `value` change whose set matches the current open set but whose raw input differs (e.g. several ids trimmed under `exclusive`) — the doc doesn't say whether that counts as a change the accordion 'did not itself just emit'; I report per-section `controlled` only for ids whose open state actually changed, and nothing when `exclusive` alone trims the set.
- Accordion: the just-emitted set is 'compared only with the next `value` change and then cleared' — unspecified whether a change caused only by toggling `exclusive` (value unchanged) consumes it; I leave it pending until `value` itself changes.
- Accordion: turning `exclusive` on in uncontrolled mode 'trims the open set' — unclear whether it's permanent (turning `exclusive` off again doesn't restore the others) or only for display; I made it permanent in local state.
- Accordion: the `divider`/`dividerWidth` bindings have no `part` and Divider's own defaults are the same tokens, so it's unspecified whether Accordion forwards its defaults or only overrides; I always forward the Accordion defaults (same for the four Disclosure forwards).
- Accordion: the Keyboard story rule asks for 'open with its trigger and at least three focusable children'; the RN Keyboard story opens one section of four (4 triggers as focus stops, plain-text panel), since panel content in the Default items isn't focusable.
- Accordion: Divider between items keeps its default `spacing: none`; the doc says itemGap falls on both sides of the divider but doesn't say whether the Divider should add spacing of its own; I left it at none.
