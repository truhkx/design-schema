# Gaps reported while generating Slider for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 18:53 — round 1

- Slider: the schema's `snapToMarks`, `required`, and `invalid` props were absent from the pre-existing implementation (drag-to-marks was inferred from `step` being left `undefined`, a workaround not in the schema). Added the real `snapToMarks` boolean (step now defaults to 1 per spec, keys always use `step`, drag/click snap to marks only when `snapToMarks` is set), plus `required`/`invalid` with the schema's `error` → `required` → `invalid` precedence and `copy.required`/`copy.invalid`.
- Slider: `invalid`/`required` have no dedicated visual token in the schema's `styles` block (unlike Input's border-color treatment), so a failed slider looks identical to a valid one until `errorMessage` renders — chose not to invent an unlisted color rather than reuse a locked binding.
- Slider: no `copy.*` entry defines a visible '(required)' label suffix (only the required/invalid *messages* are specified), so — unlike Input's convention — the label text is left unmodified when `required` is set.
- Slider: PageUp/PageDown/Home/End from the keyboard table have no native gesture equivalent; exposed them as custom `accessibilityActions` ('pageup'/'pagedown'/'home'/'end') alongside `increment`/`decrement`. Only increment/decrement get the native VoiceOver swipe / TalkBack volume-key binding — the other four surface in the platform's generic 'Actions' menu, a platform ceiling rather than an implementation gap.
- Slider: mapped the Forms doc's `validate: blur` (defined explicitly only for toggles) onto a drag/interaction's end (`onSlidingComplete`) as the closest analogue to blur for a pointer-driven control; this interpretation isn't spelled out for Slider specifically.
- Slider: the Keyboard story previously combined a plain slider with a range slider (3 thumbs); corrected it to render only the range form per the doc text ('The Keyboard story renders the range form... the three-focusable rule does not apply').
