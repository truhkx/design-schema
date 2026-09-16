# Gaps reported while generating Tabs for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:25 — round 1

- Tabs: `activation` (automatic/manual) has no native equivalent — RN's Pressable has no generic key-event API, so there is no arrow-key focus movement to distinguish from selection (the same limit already documented on Menu and RadioGroup). The prop is accepted and typed for parity but is a no-op: touching a tab always selects it immediately regardless of value.
- Tabs: web's roving-tabindex / arrow-navigation / Home-End keyboard model is not implemented; each tab is its own accessibility stop (the platform convention used elsewhere in this package), and 'Tab from the list into the panel' has no native analogue since panels aren't separately focusable stops.
- Tabs: the schema's `listBorder`/`listBorderWidth` ('the rule under the whole tab list') is horizontal-specific language; for `orientation: vertical` I placed the rule on the side adjacent to the panel (same edge as the indicator) since there's no literal 'under' on a side-by-side layout. Flagging in case a different edge was intended.
- Tabs: panels are plain Views with no RN accessibility role/labelledby equivalent to web's `role=tabpanel`/`aria-labelledby`, matching the platform note's minimalism ('panels are Views') rather than inventing a cross-platform substitute.
- Tabs: the web note 'the selected tab scrolled into view' is approximated on native by measuring each tab's onLayout rect and calling ScrollView.scrollTo to bring it into the visible viewport (nearest-edge, not centered) — a reasonable native analogue, not dictated by the schema.
- Tabs: badge text is merged into the tab's accessibilityLabel ("Label, badge") and the visual badge Text is hidden from assistive technology to avoid double-announcement, since the schema doesn't specify how a badge should be exposed to screen readers.
- Tabs: exported `TabPanel` is a plain identity wrapper (`{children}`) that `Tabs` locates via `React.Children` + `child.type === TabPanel`, matching the doc's 'wrapped in the exported TabPanel with a matching id' — this runtime-introspection pattern is new to the rn package (no prior composite component parses its `children` this way) since Tabs is the first component whose panels come through slotted children rather than a data array.

## 2026-09-10 18:32 — round 1

- Tabs: `activation` (automatic/manual) has no native equivalent since Pressable exposes no key-event API — every tab is its own accessibility stop and touch always selects immediately, so the prop is accepted/typed for parity but has no observable effect on RN; documented in the component doc comment rather than reported as a fresh gap since the spec's own platform notes anticipate this.
- Tabs: the keyboard table's Tab-into-panel and arrow/Home/End movement are web-only per the spec's own 'keyboard rules describe the web keyboard model' clause; no native substitute exists beyond making the panel itself a normal focusable region, so nothing further was implemented.

## 2026-09-16 08:01 — round 1

- Tabs: `activation` and the whole keyboard table have no iOS/Android equivalent (View/Pressable have no key events); implemented through an untyped `onKeyDown` on the tablist that only react-native-web delivers, and a touch always selects regardless of activation. The platform notes should state what `manual` means on native.
- Tabs: the roving tab stop (one Tab stop per list) is web-only; chose `focusable={isSelected}` on react-native-web and left every tab focusable on native, per the rn notes ('each tab is its own accessibility stop'). The Guidance says disabled tabs are 'not tab stops' while the rn rules forbid `disabled` on Pressable; chose focusable=false for disabled tabs on web only.
- Tabs: examples give `children: "One TabPanel per tab, matching ids"` as prose, which cannot be passed as an arg; the stories' meta `render` builds one TabPanel per `args.tabs` entry and ignores `children`.
- Tabs: behavior scenario `has-accessible-name` cannot use RNTL `getByRole('tablist')`: the tablist is not `accessible` (making it so merges the tabs into one stop on iOS); the test asserts `accessibilityRole` and the accessible name on `testID="Tabs.tablist"` instead.
- Tabs: `click: tab` doesn't say which tab; the tests use the first tab, which makes all three click scenarios meaningful with the Default story's tabs.
- Tabs: `copy.position` has no stated use on rn (only the swiftui notes say `.accessibilityValue`); used `accessibilityValue={{ text }}` on each tab.
- Tabs: the doc gives no way to link a panel to its tab on rn (web uses `aria-labelledby`); gave each panel View `accessibilityLabel={tab.label}`.
- Tabs: `badgeSize` has no line-height binding; the badge reuses `lineHeight` (the label's multiplier) times `badgeSize`.
- Tabs: `badgeColor`, `badgeSize`, `listBorder`, `listBorderWidth`, `listGap`, `fontFamily`/`fontSize`/`fontWeight`/`lineHeight`, `radius`, `minTarget`, `focusRing` and `disabledOpacity` have no `part`; applied the list ones to the tablist and the rest to the tab/label/badge by reading.
- Tabs: the icon size inside a tab is unspecified; chose Icon `size="sm"` with the tab's foreground color.
- Tabs: for `orientation: vertical` with `fit: start` the rn notes only describe a horizontal ScrollView; used a vertical ScrollView so a long vertical list also scrolls with the selected tab kept in view.
- Tabs: `tabs` shape `icon?: IconName` is used verbatim, so under exactOptionalPropertyTypes callers cannot pass an explicit `undefined` for icon/disabled/badge, unlike the package's usual `?: T | undefined`.
