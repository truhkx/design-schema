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
