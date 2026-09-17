# Gaps reported while generating Divider for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:31 — round 1

- Divider: schema says label is 'optional text in the middle of a horizontal divider' but doesn't forbid it on a vertical divider or define layout for that case; I render label between two line segments in a flex column for vertical too, same as horizontal, rather than rejecting the combination.
- Divider: the `semantic` prop and `label` both drive the same role/aria-orientation exposure (guidance text says a labelled divider 'becomes semantic'); I implemented `effectiveSemantic = semantic || Boolean(label)` since the schema gives no separate visual/AT toggle for a labelled-but-not-announced divider.
- Divider: labelSize/fontFamily overrides are wired into the composed `<ds-text>` by targeting its own public override hooks (`--ds-text-font-size`, `--ds-text-font-family`) from a `.label` class rule in Divider's shadow styles, rather than passing Text's `overrides` property object, since that avoids fighting Lit's property/attribute timing and stays within Text's documented CSS-variable contract; labelColor is left to Text's own locked `tone="muted"` default since it's excluded from Divider's overridable set.
- Divider: no keyboard model, form-field interface, or events apply to this component (purely presentational/APG separator), so none were implemented — confirming there was nothing ambiguous there, just absent by design.

## 2026-09-10 17:29 — round 1

- Divider: doc says label is 'ignored on a vertical divider, with a development warning' but doesn't specify whether that also suppresses the implied `semantic`; I chose to fully ignore the label (no render, no implied semantic) on vertical, only honoring an explicit `semantic` prop there, since the label truly has nowhere to render.

## 2026-09-16 04:31 — round 1

- Divider: the Lit platform notes and guidance say role and aria-orientation go on the host through ElementInternals, but the package convention says names and roles that tests must read are plain host attributes (dom-accessibility-api ignores ElementInternals). I chose plain attributes: role, aria-orientation, aria-hidden.
- Divider: the lit notes say 'Host is the line (:host { display: block })' but a labelled divider must lay out line, label, line. I kept display: block with the host drawing the line when unlabelled, and switch the host to flex through an internal data-labelled host attribute when a label is in effect.
- Divider: the guidance says labelled separators 'read their text', but ARIA separator children are presentational, so text inside the shadow root may not be announced. I also set aria-label to the label on the host. The doc should say whether the label is the separator's accessible name.
- Divider: spacing none has no token (layout.gap.{spacing} with none does not resolve), and the binding says none is the off state. I render no margin for none, not a token, and the override hook applies only when spacing is tight, normal or loose.
- Divider: the doc does not say which axis spacing applies to. I chose margin-block for horizontal and margin-inline for vertical.
- Divider: label composition says Text takes fontSize and fontFamily via overrides but does not say what text size or tone to pass. I used size=sm and tone=muted (labelColor is color.foreground.muted, locked) with element=span, and forwarded labelSize and fontFamily through Text's documented --ds-text-font-size and --ds-text-font-family hooks.
- Divider: the behavior list given to Lit omits decorative-divider-is-hidden-from-assistive-technology and semantic-divider-is-a-separator (their expectations are tagged web only), so Lit has no test for aria-hidden or role=separator even though the Lit notes require both. The doc should tag those expectations for lit as well.
- Divider: the label scenario's name says the label 'makes the divider semantic', but for Lit its then has only 'text: or' (role is web only), so the test asserts the text alone.
- Divider: a vertical divider stretches only when its parent is a flex or grid row. The doc does not say what happens in block flow, where it has no height. The ToolbarGroups and OrientationVertical stories place it in a horizontal ds-stack with align=stretch.

## 2026-09-17 04:46 — round 1

- Divider: the `fontFamily` binding says 'the root sets no font hook' and `labelSize` says 'Divider writes no label … size rule of its own', but the Overrides section says every overridable binding becomes a `--ds-divider-*` hook on :host. I kept `--ds-divider-label-size` and `--ds-divider-font-family` on :host, passed to ds-text's own `--ds-text-font-size` / `--ds-text-font-family` hooks so page CSS can still set them. The `overrides` property is also passed to Text's `overrides` (fontSize, fontFamily), and only the bindings the author actually overrode are passed on.
- Divider: `orientation` says a vertical divider uses 'block-size 100% and align-self stretch'. In CSS, flex stretch only applies when the cross size is `auto`, so `block-size: 100%` inside a flex row with no set height (like the ToolbarGroups example in a horizontal Stack) would give height 0. I used `block-size: auto; align-self: stretch; min-block-size: 100%`, which stretches in a flex/grid row and fills a parent with a set height. The doc should say this instead of block-size 100%.
- Divider: the Lit platform note says '`label` is a property', but the Lit guidance shows `<ds-divider semantic label="or">` as markup. I made it a property that also reads the attribute (`@property({ type: String })`, not reflected).
- Divider: the doc names the parts (`line`, `label`) but does not say whether the Lit shadow elements carry `part` as well as `data-part`, while the conventions say 'No ::part for styling'. I kept both, set to the anatomy names, as before.
- Divider: `spacing` renders nothing and sets no hook at `none`, but the doc does not say whether `overrides.spacing` given while spacing is `none` should still be written to the host. I always write it to `--ds-divider-spacing`; it does nothing because no margin rule reads the hook at `none`.
