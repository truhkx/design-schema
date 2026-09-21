# Gaps reported while generating Alert for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:57 — round 1

- Alert: the styles.icon description says the leading glyph is 'drawn as a 1em inline shape until an Icon component exists', but this package's Icon component already exists (and its own docblock names Alert's status shape as a documented use case, referring to a 'retired Unicode-glyph implementation'). Replaced the Unicode-glyph tone icon and the '×' dismiss glyph with `<Icon name={tone} .../>` and `<Icon name="close" .../>`, matching how Dialog's close button is built — this is a doc/reality mismatch, not an ambiguity in the schema itself.
- Alert: the schema's Overrides section lists 12 overridable bindings (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) but the file on disk before this change had no `overrides` prop at all — added `AlertOverridableBinding` and wired every binding through `resolveToken`, following the pattern used by Button/Disclosure/RadioGroup, and exported the new type from index.ts.
- Alert: the file on disk was also missing the package-wide `testID="<Name>"` convention on the root View; added `testID="Alert"`.
- Alert: heading and body share a single `fontSize`/`fontFamily`/`lineHeight` binding set per the schema (no separate heading-size token), so overriding `fontSize` resizes both the heading and, when the body is a plain string, the Text body; a non-string body (composed Text/Link children) does not receive the override since Alert cannot reach into a child's props, consistent with 'never restyle a child.'

## 2026-09-10 17:54 — round 1

- Alert.tsx already existed and matched the spec almost entirely, except it was missing the `headingSize` overridable binding entirely — the heading reused the body's `fontSize` override, so overriding `fontSize` alone would incorrectly resize the heading too, and there was no way to size the heading independently. Added `headingSize` (default `font.size.md`) to `AlertOverridableBinding`, used it for the heading's font size and line height, and sized the icon-alignment cell off the heading's line height when a heading is present (falling back to the body's line height otherwise) since the schema doesn't specify which line the icon should align to when both exist.

## 2026-09-10 20:45 — round 1

- Alert (rn): spec's a11y notes describe moving focus to the next/previous focusable element when the alert is dismissed; React Native has no API to move focus to an arbitrary element, so this is left as an acknowledged limitation (documented in the component's JSDoc), matching the platform note's own admission that this is not possible on native.
- Alert (rn): iconSize default (font.size.lg) is applied via Icon's `size="lg"` enum rather than always routing through `overrides.size`, since the two are equivalent by default and only the override path needs to win — same pattern already used in AlertDialog.tsx for its status icon.

## 2026-09-16 05:11 — round 1

- Alert: the RN dismiss Button's close glyph has no named token — the web notes say 'a 1em × glyph', the RN guidance says 'a × glyph as leadingIcon'. I used <Icon name="close" color={t.colorActionGhostForeground} />, matching Dialog, because RN has no currentColor; the spec should say which Icon name and color token to use.
- Alert: the `icon` binding says to pass it as `overrides.color`, but the RN digest says to pass the foreground token to Icon's `color` prop. I used overrides.color with a per-tone token-name lookup, since the composition forwards section wins; the digest and the rn notes should agree.
- Alert: `bodyColor` (color.foreground on part body) and the body typography bindings have no stated RN mechanism. I wrapped a string body in the system Text, relying on its default tone for color and passing fontFamily/fontSize/lineHeight into its overrides only when they're set. Non-string bodies get nothing, which matches 'a composite never restyles a child', but the spec never says whether a string body should be wrapped in Text.
- Alert: the heading is a raw RN Text (web says a raw element rather than Text or Heading), and no heading role is set because the web notes say it must not disturb the outline. The RN notes never say whether it should have accessibilityRole="header".
- Alert: the RN notes say to call announceForAccessibility 'with live≠off', while the guidance says 'iOS does not honour live regions'. I call it only when Platform.OS === 'ios' (so Android doesn't announce twice), but the notes don't say whether it's iOS-only.
- Alert: when the body isn't a string and there's no heading, accessibilityLabel is left unset, so the region has no name on native. The web version names it by the body element, which RN can't reference. I left this unstated case as it is.
- Alert: the scenario live-status-renders-the-status-role only lists web/lit, and RN has no status role. The notes map status to polite only, so I set no role; the spec could say whether RN should use role="status" (react-native-web supports it).
- Alert: 'Every example is a story with exactly its given' conflicts with the required `children` living in the Default args. I put children (plus the enum defaults) in meta.args with no heading, so examples without a heading don't pick one up; the Default story therefore has no heading.
- Alert: the icon sits next to the first line, but nothing says how to line them up. I gave the icon a box as tall as the first line (heading or body line height, or the icon size if that's bigger) and centered the icon in it — my own choice.
- Alert: dismissMargin is described as a 'negative block/inline-end margin', but the RN digest says siblings are never spaced with margins. I followed the spec (marginTop/marginEnd = -space.1 on a wrapper View) and didn't restyle the Button; the digest should list this as an exception.

## 2026-09-17 05:19 — round 1

- Alert: the RN notes say the accessibilityLabel is 'heading + body when body is a string' but also that a 'string or number body' is wrapped in Text; I treat a number body as text for the label and the iOS announcement too.
- Alert: the separator for accessibilityLabel is only given for the iOS announcement ('joined by a full stop'); I use the same '. ' join for the label so the two read the same.
- Alert: the conventions say to pass the foreground token to Icon's `color` prop because there is no currentColor, but the RN notes require `overrides.color` for both the tone icon and the dismiss close icon; I followed the component notes and used overrides everywhere.
- Alert: the icon part is decorative, but the spec doesn't say whether Icon hides itself or the Alert must; I set accessibilityElementsHidden and importantForAccessibility='no' on the Alert-owned icon View.
- Alert: behavior scenario live-off-renders-no-role only lists web and lit, and the spec gives no RN check (e.g. accessibilityLiveRegion unset); no RN test was written for it beyond renders-live-off.
- Alert: the conventions list a `role` prop as the preferred form on RN 0.87, but the notes name accessibilityRole='alert'; I kept accessibilityRole and did not add `role`.

## 2026-09-21 03:21 — round 1

- Alert: the `heading` prop's description says an empty string renders no heading and the name falls back to the body, but no behavior scenario covers it, so the bug (an empty heading Text plus a heading-sized icon box) survived the previous generation with a green suite. A scenario like `empty-heading-falls-back-to-the-body` would pin it on all three platforms.
- Alert: the `icon` style binding says the Alert-owned box 'adds no accessibility props on any platform', while the package convention is to hide decorative glyphs with `accessibilityElementsHidden`/`importantForAccessibility="no"`. I followed the schema and left the box bare, relying on Icon self-hiding when it has no `label` — but the doc never states that the box may omit them *because* Icon sets them, so the two readings look contradictory in isolation.
- Alert: the `iconSize` box math is specified only for web/Lit (hooks, `data-has-heading`, CSS line-box). On RN I read it as `max(lineHeight of the first line, iconSize)` with the glyph centred — heading line-height when there is a heading, body line-height otherwise. The doc does not say whether the RN box should also clamp to `iconSize` when the icon is larger than the line, which is what I chose.
- Alert: `bodyColor` is locked to `color.foreground` and the RN notes say a string/number body is wrapped in the system Text at its default tone. That silently drops the binding for a ReactNode body (Text/Link children keep their own color), which is intended per 'a composite never restyles a child' — but it means the locked binding is unenforceable for the common case of a body containing a Link, and the doc does not acknowledge that.
- Alert: the schema declares `live` values `status | alert | off` with `a11y: Maps to role=status, role=alert, or a plain region`, while `platforms.rn.notes` says status maps to no role at all. I followed the platform notes (the declared-contracts precedence rule), but the `a11y` line reads as if RN should carry a status role, which react-native-web would happily render.
- Alert: `accessibilityLabel` is specified as heading + body joined by '. ' — with no rule for a heading that already ends in punctuation, so `heading: 'Payment failed.'` announces 'Payment failed.. Your card was declined.' I joined verbatim rather than normalising, since copy guidance forbids inventing user-facing text.
- Alert: the iOS announcement effect is specified as 'on mount and again whenever heading or body change'. I keyed the effect on the joined announcement string and `live`, which also re-announces when `live` flips from `off` to `status`/`alert` on an already-mounted alert. The doc does not say whether a live change alone should announce.
- Alert: no story exercises `dismissible` on its own (only the `dismissible-notice` example does, bundled with `tone: info`), and `dismissible` is a boolean so the 'one story per enum value' rule produces none. The dismiss Button's ghost-foreground-on-tinted-background contrast pair from `a11y.contrast` therefore has no story showing it against `warning` or `danger`.
