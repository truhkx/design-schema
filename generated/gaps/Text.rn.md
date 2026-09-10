# Gaps reported while generating Text for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:46 — round 1

- Text (rn): platforms.rn.props lists only numberOfLines/ellipsizeMode/allowFontScaling, not overrides — added overrides?: Partial<Record<TextOverridableBinding, TokenRef>> anyway per the general Overrides contract (fontFamily, fontSize, fontWeight, lineHeight, color), matching how Box/Card/Container/Dialog implement it despite the same omission in their platform notes.
- Text (rn): could not run the test suite in this session (jest invocation via Bash/PowerShell was blocked pending approval) — Text.test.tsx is unverified by an actual test run, though it follows Box.test.tsx's established pattern exactly.

## 2026-09-10 17:16 — round 1

- Text: platform notes say the boolean TextNestingContext is replaced by TextStyleContext ({ fontSize, color, nested }), but that context is consumed directly by Link.tsx and Icon.tsx (not just Text.tsx). Renaming it required editing both consumers too, beyond the single Text.tsx file, to keep the package compiling — Link now reads `.nested` instead of the raw boolean, and Icon now inherits the surrounding Text's actual fontSize/color when `inline` and nested, resolving Icon's own previously-documented gap.
- Icon: the schema doesn't define precedence between an explicit `overrides.color`/`overrides.size` and the new inherited-from-Text value when `inline` is nested. Chose: explicit `color` prop > `overrides` > inherited Text context > default token — i.e. an override still wins over inheritance, since overrides are the system's one per-instance styling surface and inheritance is only a fallback.
