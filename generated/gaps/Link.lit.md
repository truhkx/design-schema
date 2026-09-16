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
