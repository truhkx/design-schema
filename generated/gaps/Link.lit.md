# Gaps reported while generating Link for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:10 — round 1

- Link.ts/.stories.ts pre-existed from an earlier pass and were already spec-complete except for the overrides contract (hooks, `overrides` property, `data-ds`) and the `LinkOverridableBinding` type export, which I added; no ambiguity in the schema itself.
- download: not in `platforms.lit.reflect`, so left unreflected (a plain non-reflected boolean attribute) even though `external` and `tone` are reflected — the spec only lists the latter two under `reflect`.
- has-accessible-name scenario doesn't specify whether the external suffix is included in the assertion; used the plain `label` for the default (non-external) case, matching the scenario's default `given` (no `external: true`).

## 2026-09-16 04:00 — round 1

- Link: styles.colorHover's description says 'Pointer hover and active state' but its declared state is only `hover`; the declared contract won, so Lit applies color.link.hover on :hover only. The doc should either add an active state or drop 'and active' from the description.
- Link: href and label are `required: true` with no default, but a Lit property needs an initial value; both default to '' and nothing warns when either is missing. The doc could say whether an empty href should trigger a dev warning, since the guidance says a link with no href should be rendered as Text instead.
- Link: the `external-link-announces-that-it-leaves` scenario marks the `name` expectation web-only and gives Lit only `copy: externalSuffix`, so it's unclear whether Lit must reach the same accessible name through the shadow root. The Lit test checks both the suffix text and the full accessible name, and both pass.
- Link: examples give only props, but `inline-in-a-paragraph` and `inside-muted-text` describe a surrounding paragraph (muted text for the second). The doc has no copy for that paragraph, so the stories wrap the link in `<ds-text>` with short made-up sentences ('Invoices from the last year are listed.', 'For details, read …'). The doc should supply that text.
- Link: the underline on tone=inherit links has no color binding, so it follows currentColor; the doc doesn't say whether that is intended.
- Link: `tone: inherit` makes visited and hover inherit too, so an inherited link has no visited or hover color change. The doc implies this ('the underline alone marks it') but doesn't say it outright.
- Link: externalIcon's color isn't bound; it follows the anchor's currentColor, which gives it the hover and visited colors. The RN notes say the icon uses the link color, but nothing is declared for Lit or web.
- Link: onPress lists `fires: [user]` and cancelable, but on Lit it is the native click, which a script calling `.click()` also fires; there is no way to limit it to user clicks, so none was attempted.

## 2026-09-17 04:21 — round 1

- Link: the Overrides section says 'No ::part is exposed for styling' while the package convention says 'part and data-part values are the anatomy names verbatim'; kept part="anchor"/"label"/"externalIcon" alongside data-part, which does technically expose ::part to consumers.
- Link: `label` is in the anatomy but no style binding or platform note says what element carries it; rendered a <span data-part="label"> inside the anchor.
- Link: the focus ring's outline-offset has no binding (focusRing, focusRingWidth, focusRingRadius cover color, width, radius only); used var(--border-width-focus) as the offset.
- Link: focusRingRadius is described as applying to the ring, but a radius on an inline anchor also rounds its background/hit area at rest; applied border-radius only under :focus-visible.
- Link: the doc asks for one story per enum value plus notable states, but external and download are booleans with only example stories (ExternalDestination, DownloadableFile) covering them; did not add separate External/Download stories.
- Link: the web note's visually hidden pattern lists 'absolute, 1px box, clip-path inset 50%, white-space nowrap' but not margin/overflow/border; kept the standard margin:-1px, overflow:hidden, border:0 and dropped the legacy clip:rect.
- Link: the `renders`/`renders-tone-*` derived scenarios say only `renders: true` with no observable to assert for tone; the tests check the anchor part exists, which cannot distinguish tones.

## 2026-09-18 19:33 — round 1

- Link: the spec requires a story per enum value plus one per example, but doesn't say whether ExternalDestination and DownloadableFile also sit inside a Text paragraph like the other two examples; I render them standalone.
- Link: the click-fires-on-press scenario would navigate the test page with the Default href '/billing/history'; the spec doesn't say how a test stops that, so the test calls preventDefault on the retargeted click.
- Link: the `tone: inherit` enum story must use the muted wrapper, but the spec doesn't say whether it keeps the Default args or takes the inside-muted-text args; ToneInherit keeps the Default href and label inside the muted sentence.
- Link: whether the decorative ds-icon (no label) is hidden from assistive technology depends on Icon's own contract; the Link spec says 'no label (so it hides itself)' but doesn't state the attribute Lit's Icon uses, so Link passes only name and inline.

## 2026-09-18 19:40 — round 2

- Link: `label` is a required string prop and Link has no slot, so the common web-component form `<ds-link href>text</ds-link>` renders an unnamed anchor with no error; Feed and SidePanel stories did that and failed axe link-name. The doc should say plainly that Lit takes no slotted label content (and whether it should warn in development when label is empty, since the platform notes say it does not warn). I fixed the callers to use `label` and added no slot.
- Link: the SidePanel stories put `aria-current="page"` on the ds-link host for a nav drawer's current item, but Link has no current prop and doesn't forward it to its shadow anchor, so the state never reached assistive technology. I removed the attribute. The doc should say whether Link supports a current-page state (as Breadcrumb's last item and navigation drawers need) or whether consumers render Text for the current item.
- Link: the gate failures handed to this round were almost all other components (keyboard-run: Combobox, Tabs, Tree and others; axe: Tabs color-contrast, TreeGrid aria-hidden-focus and target-size); Link has no keyboard block and no Link story appears in either failure list, so I changed nothing for those.
- Link: I couldn't re-run axe in this session (running the check needs approval I couldn't get), so the Feed and SidePanel link-name fix is untested in a browser; logs/link-axe.mjs runs axe over the Link, Feed and SidePanel stories only.

## 2026-09-18 19:47 — round 3

- Link: the gates run over the whole Lit package, so their red status can't be cleared by changes to Link alone. This round's axe and keyboard-run failures are all in other components (Tabs color-contrast, TreeGrid aria-hidden-focus and target-size, Feed aria-required-children, and the keyboard specs of 18 other components); none names Link. The last Link-related failure, Feed and SidePanel link-name, is gone after round 2's story fix. The gate harness should scope each component's round to that component's stories and specs, or say that other components' failures are out of scope.

## 2026-09-19 10:12 — round 1

- Link: the reflect list names tone, external and download, but the Lit guidance says to 'reflect tone and external'; all three are reflected, as the reflect list is the declared contract.
- Link: the tone description scopes the link colours to 'the tone: default modifier' only for web; for Lit I scoped them with :host(:not([tone='inherit'])), so an unknown tone value falls back to the link colours rather than inherit.
- Link: the has-accessible-name and control-is-focusable scenarios don't say whether to assert on the host or the shadow anchor; the tests check the anchor's name and assert that focusing the host lands on the anchor through delegatesFocus.
- Link: externalIconGap says an override 'is written only while external is true', but not whether a stored override should be re-applied when external goes back to true later; the element re-applies it on any change to external or overrides.
- Link: the Lit notes say an empty href is the consumer's error and Link does not warn, so an empty href still renders <a href=""> (a link to the current page) rather than a non-link; left as written.

## 2026-09-19 10:21 — round 2

- Link: gates keyboard-run and axe run over the whole Lit Storybook and failed only on other components (keyboard: Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip, Tree; axe: Tabs color-contrast in dark mode, TreeGrid aria-hidden-focus and target-size, among others). Link has no keyboard block so it has no keyboard spec, and all 7 Link/Lit stories pass axe in light and dark (checked with logs/link-axe.spec.ts). No Link change can make these gates pass; I left the code as it was rather than change another component's files in a Link job.
- Link: carried over from round 1: tone scoping on Lit uses :host(:not([tone='inherit'])), so an unknown tone value falls back to the link colours; the spec states the scoping only for web.

## 2026-09-19 10:30 — round 3

- Link: round 3 gave the same keyboard-run and axe output as round 2, and none of it is Link's. Link has no keyboard block, so there's no keyboard spec for it, and all 7 Link/Lit stories pass axe in light and dark (logs/link-axe.spec.ts, re-run this round). Both gates check the whole Lit Storybook, so Tabs' dark-mode color-contrast failures, TreeGrid's aria-hidden-focus and target-size failures, and the keyboard failures in 18 other components fail every job. The job loop should limit these gates to the component being generated (filter stories by title, as logs/link-axe.spec.ts does) or accept failures already in the baseline; no Link code change can make them pass.
- Link: carried over from round 1: tone scoping on Lit uses :host(:not([tone='inherit'])), so an unknown tone value falls back to the link colours; the spec states the scoping only for web.
