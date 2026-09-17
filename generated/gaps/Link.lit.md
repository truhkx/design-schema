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
