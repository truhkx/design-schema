# Gaps reported while generating Fieldset for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:07 — round 1

- Fieldset: schema's props list has no `required`/`invalid` prop, yet `copy.requiredIndicator` and the behavior note say the indicator appears 'when every field inside is required' — implemented by inspecting each direct child's own `required` prop (Children.toArray + every), since there's no group-level flag to key off.
- Fieldset: composition maps `fields: Stack`, but the platform note only says 'a Stack for the children' without specifying whether Fieldset itself renders the Stack or the consumer is expected to pass one as children. Chose: Fieldset renders the Stack internally (children are the raw field elements), matching how `gap` naturally maps onto Stack's own gap prop — consistent with Card/Dialog precedent of composing Stack directly rather than documenting it as a no-op.
- Fieldset: disabled propagation says 'pass disabled down through a FieldsetContext... until then, the fieldset clones direct children with disabled' — implemented the clone-children fallback only (no FieldsetContext), since Input/Checkbox/Switch/RadioGroup don't read such a context yet and adding an unused context would be speculative; a real FieldsetContext should land when those components regenerate to read it.
- Fieldset: `fieldsGap` is listed as overridable, but forwarding an arbitrary token into the composed Stack without restyling it isn't possible (Stack only exposes a fixed `gap` enum, not an arbitrary token prop). Followed the existing Dialog/AlertDialog/Card precedent for this exact situation: declared the `--ds-fieldset-fields-gap` hook and included `fieldsGap` in the overridable type for API consistency, but it only takes effect through Stack's own closest-preset gap value (a comment in Fieldset.css notes this, matching Dialog.css's `footerGap` comment).
