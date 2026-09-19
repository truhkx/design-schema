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
