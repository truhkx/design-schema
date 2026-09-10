# Gaps reported while generating NumberInput for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:06 — round 1

- NumberInput: schema says the Form-collected value is a number, but FormContext's FormFieldValue type only allows string|string[]|boolean|undefined. Followed Slider's precedent of stringifying the committed number in getValue() — Form consumers get a numeric string, not a number.
- NumberInput: copy.outOfRange's wording ('when the field is required and the user typed out of range') is ambiguous about whether it's gated on the `required` prop. Implemented it as firing whenever a blur-time clamp actually changed the value and both `min` and `max` are defined, regardless of `required`, since 'the field clamps and reports' reads as general behavior; only emit the message when both bounds exist since the template needs both {min} and {max}.
- NumberInput: format:'percent' — the doc says 'the underlying value is always a plain number' but doesn't say whether that number is the percentage as typed (25) or a fraction (0.25). Chose 25-as-typed, dividing by 100 only when calling Intl's percent formatter (which itself expects a fraction).
- NumberInput: format:'currency' with no `currency` prop has no specified default; defaulted to 'USD' since Intl.NumberFormat requires a currency code.
- NumberInput: format:'unit' with a `unit` string that isn't a valid Intl unit identifier throws in Intl.NumberFormat; caught it and fell back to plain decimal formatting (no literal unit text appended), per the unit prop's 'or a literal shown as suffix' hint, but didn't auto-populate `suffix` in that fallback since that would conflict with an explicit `suffix` prop — left unresolved.
- NumberInput: parsing accepts both '.' and the environment's locale decimal separator per the doc, but in locales where '.' is the grouping separator (e.g. de-DE) this can misparse a grouped integer as having a fraction — an inherent tension in the spec's own dual-acceptance rule, not something I could fully resolve.
- NumberInput: hold-to-repeat initial delay/interval (motion.duration.base/fast) can't be read from the resolved theme at runtime (same limitation noted in Tooltip's DEFAULT_DELAY_MS); hardcoded to 400ms/80ms.
- NumberInput: Enter 'commits, and inside a Form, submits' — implemented by running commit() synchronously on keydown without preventDefault so a native form submit follows, relying on React's synchronous ref updates; not verified end-to-end against real browser submit timing.
- NumberInput: the platform note says steppers use tabIndex=-1 plus aria-hidden, meaning the component intentionally has exactly one tab stop (the input). The general 'Keyboard story needs ≥3 focusable children' convention doesn't apply here (same as Slider's precedent); the Keyboard story just renders the field.
- NumberInput: onChange is typed as `(value: number | undefined) => void` with no event argument, unlike Input's `(value, event)`, since the doc fires it from three different origins (keystroke, stepper press, blur-commit) with no single consistent native event type to pass.
