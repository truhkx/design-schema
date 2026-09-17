# Gaps reported while generating Text for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:46 — round 1

- Text (rn): platforms.rn.props lists only numberOfLines/ellipsizeMode/allowFontScaling, not overrides — added overrides?: Partial<Record<TextOverridableBinding, TokenRef>> anyway per the general Overrides contract (fontFamily, fontSize, fontWeight, lineHeight, color), matching how Box/Card/Container/Dialog implement it despite the same omission in their platform notes.
- Text (rn): could not run the test suite in this session (jest invocation via Bash/PowerShell was blocked pending approval) — Text.test.tsx is unverified by an actual test run, though it follows Box.test.tsx's established pattern exactly.

## 2026-09-10 17:16 — round 1

- Text: platform notes say the boolean TextNestingContext is replaced by TextStyleContext ({ fontSize, color, nested }), but that context is consumed directly by Link.tsx and Icon.tsx (not just Text.tsx). Renaming it required editing both consumers too, beyond the single Text.tsx file, to keep the package compiling — Link now reads `.nested` instead of the raw boolean, and Icon now inherits the surrounding Text's actual fontSize/color when `inline` and nested, resolving Icon's own previously-documented gap.
- Icon: the schema doesn't define precedence between an explicit `overrides.color`/`overrides.size` and the new inherited-from-Text value when `inline` is nested. Chose: explicit `color` prop > `overrides` > inherited Text context > default token — i.e. an override still wins over inheritance, since overrides are the system's one per-instance styling surface and inheritance is only a fallback.

## 2026-09-16 02:07 — round 1

- Text: `color` is locked, but four of the system's own components must draw Text on a surface with its own foreground — Toast, Tooltip and Slider's bubble on `color.inverse.foreground`, DatePicker's selected day on `color.control.selectedForeground` — and no `tone` value covers either (`onAction` is #ffffff in dark mode where those are #17181b / #000000, so it is not a substitute). Web and Lit re-scope `--color-foreground`; RN has no cascade. Chose a package-internal `TextForegroundContext` that Text honours only when `tone` is `default`. The schema should either add an inverse/on-surface tone or state how a locked color binding reaches a composed Text on native.
- Text: `align: start|end` are specified as following writing direction, but RN's `textAlign` has no logical values. Chose `I18nManager.isRTL` resolved at render time; the direction is read once per render and RN does not re-render on a direction change, so a live locale switch needs a remount. The doc does not say whether that is acceptable.
- Text: the `truncate` behavior scenario (`title` carries the full string) is web-only and cannot be expressed on rn — the doc says native has no equivalent affordance but not what native should do instead. Chose `numberOfLines={1}` + `ellipsizeMode="tail"` and nothing else; a sighted user cannot reach the clipped text, so the 18 rn tests are all `renders: true` and nothing covers truncation.
- Text: the schema declares no ref, but the RN conventions require a component that exposes its root to take one. Added `ref?: React.Ref<TextInstance> | undefined`; if Text is meant to have no ref surface, the prop list should say so.
- Text: `a11y.role: generic` has no RN equivalent, so no `accessibilityRole` is set. The doc does not qualify the role per platform, and the derived `renders` scenario (from a11y.role) therefore only asserts a render on rn.
- Text: `font.weight.*` tokens are numbers and RN wants a string union, so `toFontWeight` snaps to the nearest hundred; `font.lineHeight.normal` × fontSize is rounded to a whole pixel by `toLineHeight`. Neither rounding rule is in the doc — a theme with a weight like 550 or a fractional line height silently changes.
- Text: `tone: onAction` is only contrast-checked against 'action backgrounds' without naming one, so the `ToneOnAction` story picks `color.action.primary.background`. If the intended background is a different action surface, the story is checking the wrong pair.
- Text: `TextStyleContext` has no documented value outside a Text — chose `{ fontSize: 0, color: '', nested: false }`, so every consumer (Icon, Link) must branch on `nested` rather than use the numbers. The platform note defines the nested case only.

## 2026-09-17 03:55 — round 1

- Text: the Rules say to import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark`, but the package conventions (and every existing component) read them from `useTheme()`; kept `useTheme()`.
- Text: the Refs rule says a component exposing its root declares `ref?: Ref<ViewInstance>`, but Text's root is RN `Text`, whose instance type is `TextInstance`; kept `React.Ref<TextInstance>`. The rule should say 'the root's instance type (TextInstance for Text)'.
- Text: the digest's helper example `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)` has the arguments in the wrong order; the real signature is `toLineHeight(fontSize, multiplier)`, which is what Text calls.
- Text: the only doc behavior (`truncated-text-keeps-the-full-string-reachable`) is web-only and RN has no `title`, so there is no RN test for it; the TruncatedCell story's comment and the `truncate` JSDoc record that there is no sighted affordance.
- Text: `ToneOnAction` needs an action-coloured background to make sense, and the spec doesn't say where it comes from; the story wraps Text in a View painted with `colorActionPrimaryBackground`, padded with `spaceMd`/`spaceSm` and rounded with `radiusMd`. The `ToneDanger` story swaps in the error wording from the web-only `inline-error-wording` example so danger is never shown on neutral text.
- Text: `TextForegroundContext` is named in the `styles.color` description but has no RN export guidance beyond 'package-internal'; kept it exported from Text.tsx for sibling components but not re-exported from index.ts.
- Text: behavior scenario name `renders-tone-on-action` kebab-cases the enum value `onAction`; the existing test used `renders-tone-onAction`, now renamed to match the doc.
