# Gaps reported while generating Divider for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:30 — round 1

- Divider: label is documented as text for a horizontal divider only ("Optional text in the middle of a horizontal divider"). When orientation is vertical and label is set, I render a plain vertical line (no label text, since there's no described layout for a vertical labelled divider) but still treat it as semantic (role=separator, aria-orientation=vertical) since a label was explicitly given — the doc doesn't cover this combination.
- Divider: labelSize and fontFamily are listed as overridable bindings using the standard --ds-divider-* CSS hook convention, but the label is rendered via the composed Text component, which already owns fontSize/fontFamily as its own overridable bindings. Rather than adding a parallel --ds-divider-label-size/--ds-divider-font-family hook that no rule would read, I forward overrides.labelSize/overrides.fontFamily into Text's own overrides prop (fontSize/fontFamily). Net effect for consumers is the same (the token applies), but there is no literal --ds-divider-label-size custom property to set from plain CSS as the generic override docs describe — only Text's own --ds-text-font-size hook, reachable by targeting Text's default class from outside, which isn't documented either.
- Divider: platform notes describe the vertical line as 'inline-size: var(--border-width-thin)' and the schema's thickness token is named border.width.thin, suggesting a CSS border. I implemented the line (both orientations, and both the plain-<hr> and labelled-<div> forms) as an explicit block-size/inline-size box with background-color instead of a border, so the single thickness/color hook pair works identically across the <hr> and the two line spans in the labelled layout without doubled-border rendering differences.

## 2026-09-10 17:35 — round 1

- Divider: the schema requires a development warning when `label` is set on a `vertical` divider ('no room for centered text'), but the existing implementation silently dropped the label with no warning and also incorrectly forced `isSemantic=true` from the ignored label (making a plain vertical <hr> announce role=separator with no visible/accessible text driving that semantics). Fixed both: added the console.warn gated on isDev, and changed isSemantic to derive from `showLabel` (label only takes effect when horizontal) rather than raw `Boolean(label)`.
- No story or test exercises the vertical+label combination (the dev-warning path) since it isn't an enum value in the behavior scenarios; left untested per the 'render every scenario, don't invent new ones' instruction — flagging in case a dedicated story/test is wanted for that guard.

## 2026-09-16 04:29 — round 1

- Divider: role=separator makes its children presentational in ARIA, so 'the label text is what gets read' is not guaranteed by containment alone; chose aria-labelledby on the separator pointing at the label Text (id from useId) so the text is its accessible name without duplicating it in aria-label.
- Divider: platforms.web.element is `hr` but the notes make every semantic divider a div; unclear whether an unlabelled semantic divider may stay <hr> (implicit separator role). Chose <div role=separator aria-orientation> for all semantic/labelled cases, <hr aria-hidden> only for decorative.
- Divider: anatomy lists `line` and `label`, but the unlabelled divider has no separate line element (the root paints itself); chose data-part="line" only on the two flanking spans of a labelled divider, and data-part="label" on the composed Text.
- Divider: `fontFamily` has no `part` and the root has no text of its own; the labelSize description says it travels 'along with fontFamily' to Text, so chose to forward fontFamily to Text's overrides only, never setting a root hook.
- Divider: `labelColor` is locked and `labelSize` defaults to font.size.sm, but the Web notes express them as Text `size="sm" tone="muted"` props rather than bindings; chose the Text props (no Divider CSS for label color/size).
- Divider: `spacing: none` resolves to layout.gap.none (a token that exists) yet is described as the off state; chose to emit no hook and no margin for `none`, so the spacing override is a no-op there, instead of var(--layout-gap-none).
- Divider: labelGap override when no label is shown is not stated either way; applied the 'overrides change values, never presence' rule and ignore it.
- Divider: 'block-size: 100% / align-self stretch' for vertical leaves display unspecified; chose inline-block with both block-size: 100% and align-self: stretch so it works in flex rows and in inline flow with a sized parent.
- Divider: the dev warning for an ignored vertical label doesn't say 'once'; chose a useEffect keyed on the ignored state so it warns per change rather than per render.
- Divider: ToolbarGroups/OrientationVertical stories need a sized flex row to show a vertical line; the spec gives no demo wrapper, so the stories use a decorator with an inline flex row style (blockSize: '3rem').

## 2026-09-17 04:44 — round 1

- Divider: the composition says the label Text receives exactly `size`, `tone`, `element` (plus forwards), but the web platform notes also require an `id` on it for `aria-labelledby` and `data-part="label"`; I pass `id` and `data-part` as platform necessities.
- Divider: the `toolbar-groups` example says to show the divider in a horizontal Stack with align stretch, but it doesn't say what the siblings are or what gives the row its height; I used two `Text` siblings ('Bold Italic', 'Align left') and gap `tight`, and applied the same wrapper to `OrientationVertical`.
- Divider: the label scenario only checks the text and the separator role, not that the separator's accessible name is the label, which is the point of the `aria-labelledby` note; the test doesn't check the name.
- Divider: the spec doesn't say which element the root `ref` is typed to when the root switches between `<hr>` and `<div>`; I typed it `Ref<HTMLElement>`.
- Divider: `...rest` takes div attributes but a decorative divider renders an `<hr>`; the spec doesn't say which attributes belong on the decorative root. I forward the same rest to both.
- Divider: the spec never says whether a labelled horizontal divider's lines should be vertically centered on the label or sit on the text baseline; I used `align-items: center`.
