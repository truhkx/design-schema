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

## 2026-09-21 14:33 — round 1

- Accordion: the `exclusive` prop says turning it on while several sections are open trims 'without firing any event or the development warning', but Behavior says 'With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest.' These collide for a controlled `value` holding several ids while `exclusive` flips on. Chose: warn whenever `exclusive` is on and the resolved `value`/`defaultValue` holds >1 id (deduped per distinct id list), treating a standing controlled `value` as a declaration rather than a one-time trim; the uncontrolled user-opened trim never warns.
- Accordion: the whole `keyboard` block (Enter/Space, ArrowDown/Up with wrap, Home, End, Tab) is unimplementable on this platform per platforms.rn.notes — `Pressable` has no key events, so arrows/Home/End do nothing even on react-native-web, and Enter/Space cannot be told from a tap, so `onOpenChange` reports `trigger` for every activation and `keyboard` is dead in the reason union. Kept `keyboard` in `AccordionOpenChangeReason` for API parity across platforms; no keyboard tests were written because no scenario can express them here.
- Accordion: the anatomy lists `trigger`, `triggerIcon` and `panel` as Accordion parts, but Behavior says Disclosure tags them. Chose Disclosure's existing hooks (`Disclosure.trigger`, `Disclosure.triggerIcon`, `Disclosure.panel`) and added no Accordion-prefixed testID for them; likewise `list` is the root `testID="Accordion"` (not `Accordion.list`) and `item` is each Disclosure root (not `Accordion.item`), since the doc forbids a wrapper element to carry one. A doc that wants `Accordion.*` part hooks needs to say so, or say these are inherited.
- Accordion: the doc gives item order for the `controlled` diff but never says whether opens and closes interleave or group. Chose one pass over `items`, firing each changed section in item order regardless of direction. Consequence not stated in the doc: an id present in `value` that matches no item reports nothing at all (previously it would have).
- Accordion: `a11y.requires` lists `target-24px` while the generation rules also describe `target-44px`/`size.target.comfortable`; `minTarget` is locked to `size.target.min` and applied by Disclosure. Accordion adds no target rule, so the 44px touch floor in the theme guidance is not met — and because Disclosure's trigger is `alignSelf: 'flex-start'`, the hit area ends at the summary text rather than spanning the row. Making the row a full-width target needs a new Disclosure prop, as the doc itself notes.
- Accordion: `styles.itemGap` is `layout.gap.none`, and its description explains that when `divided` the gap 'falls between each item and its Divider — intended: the divider sits centred in the space between items'. With the default token that space is 0, so no shipped configuration exercises the described behavior; it is only observable via an `itemGap` override. Left as specified.
- Accordion: item-level `disabled` has no documented RN-specific effect. On web it matters because arrows skip disabled triggers; with no arrow navigation here it reduces to Disclosure's press guard plus `accessibilityState.disabled`. Passed straight through to Disclosure; the doc should say whether a disabled item is expected to differ at all on native.
- Accordion: `keepMounted` and `headingLevel` are accordion-wide with no per-item override in the `items` shape, so a form-sections accordion cannot keep only the field-bearing panels mounted. Implemented as documented (applied to every Disclosure).

## 2026-09-23 14:34 — round 1

- Accordion: the RN notes say `headingLevel` gives each Disclosure summary `accessibilityRole="header"`, but Disclosure only does that when `headingLevel` is set. Because Accordion defaults it to '3', every summary is always a header and there is no way to opt out. Chose: always pass it, and the heading-level tests check that there is one header per item.
- Accordion: the dev warning's key is the requested id list, including ids that match no item. The spec says unknown ids are 'silently ignored' but also that the warning fires when the resolved `value`/`defaultValue` 'holds more than one id'. It doesn't say whether an unmatched id counts towards that. Chose: it counts, because the raw list is what gets checked.
- Accordion: a `keyboard` block exists, so the rules require a `Keyboard` story, but the RN notes say no keyboard scenario is generated for this platform. Chose: keep the story, open, with three enabled triggers and no disabled item, so it stays usable for the axe gate on react-native-web.
- Accordion: the spec doesn't say whether switching between controlled and uncontrolled mode (`value` appearing or disappearing) should fire any events. Chose: nothing fires, and any pending just-emitted set is cleared while uncontrolled.
- Accordion: the `items` shape is written out inline in the props, as the schema requires, and is also exported as `AccordionItem`, which the stories use. The schema names no item type, so the export name is my choice.

## 2026-09-23 14:34 — round 1

- Accordion: the warning's 'once per distinct id list' could mean compared with the last list only, or with every list seen; I chose every list seen (a Set), so a value going A → B → A warns for A only once.
- Accordion: a controlled `value` that echoes the just-emitted set is matched as an unordered set, not by array order; the spec says 'a set the accordion did not itself just emit' but never says whether order matters (it matters for which id survives the `exclusive` trim).
- Accordion: the `Keyboard` story is required to have 'at least three focusable children', and the Behavior section says a keyboard scenario must not include disabled items. The Default items include a disabled one, so the Keyboard story filters it out; the spec doesn't say whether the Keyboard story should reuse Default's items.
- Accordion: `platforms.rn.props` is empty, yet the RN notes and Disclosure rely on `aria-expanded`/`aria-disabled` for react-native-web. Accordion adds no accessibility props of its own and relies entirely on Disclosure; the spec doesn't say whether the `list` root should carry any role (a11y.role is `none`, so none was added).
- Accordion: 'Divider keeps its default spacing: none' is assumed to be the RN Divider's default too; Accordion passes no `spacing` prop, as the spec says it adds nothing beyond the listed props.

## 2026-09-23 14:35 — round 2

- Accordion: the spec names an overridable binding `fontFamily`, and the literals gate flags any `fontFamily: '…'` string as a hard-coded font, including a token name like 'font.family.body' in the default-token table. Keeping the spec's binding name as the table key trips the gate, so I marked the line `literal-ok` (it is a token name resolved through the theme). Either the gate should skip strings that are token names, or the binding should be named `triggerFontFamily` to match Disclosure's.

## 2026-09-23 14:35 — round 2

- Accordion: the literals gate flags any `fontFamily: '…'` as a font-stack literal, including a token path such as 'font.family.body'. The schema names this binding `fontFamily`, so its entry in the default-token table has that key. Chose: keep the spec's binding name and mark the line `literal-ok` as a token path. The gate could skip quoted values that are dotted token paths.
- Accordion: the RN notes say `headingLevel` gives each Disclosure summary `accessibilityRole="header"`, but Disclosure only does that when `headingLevel` is set. Because Accordion defaults it to '3', every summary is always a header and there is no way to opt out. Chose: always pass it, and the heading-level tests check that there is one header per item.
- Accordion: the dev warning's key is the requested id list, including ids that match no item. The spec says unknown ids are 'silently ignored' but also that the warning fires when the resolved `value`/`defaultValue` 'holds more than one id'. It doesn't say whether an unmatched id counts towards that. Chose: it counts, because the raw list is what gets checked.
- Accordion: a `keyboard` block exists, so the rules require a `Keyboard` story, but the RN notes say no keyboard scenario is generated for this platform. Chose: keep the story, open, with three enabled triggers and no disabled item.
- Accordion: the spec doesn't say whether switching between controlled and uncontrolled mode (`value` appearing or disappearing) should fire any events. Chose: nothing fires, and any pending just-emitted set is cleared while uncontrolled.
