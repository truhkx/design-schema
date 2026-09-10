# Gaps reported while generating Fieldset for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:07 — round 1

- Fieldset: schema's props list has no `required`/`invalid` prop, yet `copy.requiredIndicator` and the behavior note say the indicator appears 'when every field inside is required' — implemented by inspecting each direct child's own `required` prop (Children.toArray + every), since there's no group-level flag to key off.
- Fieldset: composition maps `fields: Stack`, but the platform note only says 'a Stack for the children' without specifying whether Fieldset itself renders the Stack or the consumer is expected to pass one as children. Chose: Fieldset renders the Stack internally (children are the raw field elements), matching how `gap` naturally maps onto Stack's own gap prop — consistent with Card/Dialog precedent of composing Stack directly rather than documenting it as a no-op.
- Fieldset: disabled propagation says 'pass disabled down through a FieldsetContext... until then, the fieldset clones direct children with disabled' — implemented the clone-children fallback only (no FieldsetContext), since Input/Checkbox/Switch/RadioGroup don't read such a context yet and adding an unused context would be speculative; a real FieldsetContext should land when those components regenerate to read it.
- Fieldset: `fieldsGap` is listed as overridable, but forwarding an arbitrary token into the composed Stack without restyling it isn't possible (Stack only exposes a fixed `gap` enum, not an arbitrary token prop). Followed the existing Dialog/AlertDialog/Card precedent for this exact situation: declared the `--ds-fieldset-fields-gap` hook and included `fieldsGap` in the overridable type for API consistency, but it only takes effect through Stack's own closest-preset gap value (a comment in Fieldset.css notes this, matching Dialog.css's `footerGap` comment).

## 2026-09-10 17:54 — round 1

- Fieldset: platforms.web.attributes lists only aria-describedby/aria-disabled, but the notes prose says error sets aria-invalid too — treated the prose as authoritative and added it, since the error-is-identified behavior scenario requires state:invalid.
- Fieldset: styles.disabledOpacity is marked locked: false (overridable) but had no corresponding entry in the component's own overridable-binding union in the existing file — added it; flagging in case the omission was intentional and disabledOpacity was meant to be handled some other way.
- Fieldset: FieldsetContext (for propagating disabled/legend to Input/Checkbox/Switch/RadioGroup, and the derived required-indicator convention) is described in the guidance but not present in the existing implementation, which instead clones direct children with `disabled` only — left as-is since the doc says 'until a field reads the context, Fieldset also clones direct children with disabled', and adding the context plus updating four other components was out of scope for this pass.
