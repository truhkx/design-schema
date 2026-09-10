# Gaps reported while generating Card for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:45 — round 1

- Interactive hit-area: the spec says the single Link/Button child gets a `::after` covering the card. I implemented this by cloning the sole child element and adding a class via `cloneElement`, since both Link and Button already merge a passed `className` into their own class list — this works, but it's a form of reaching into the child that the 'never restyle a child' rule is meant to prevent; flagging the tension rather than silently doing it. If either component ever stops forwarding `className`, this breaks silently.
- Spec's platform note calls header/footer 'a horizontal Stack', but Stack's `gap` prop only accepts the numeric `space.*` scale, not the named `layout.gap.{tight,normal,loose}` tokens the schema binds to partGap/headerGap/footerGap, nor does Stack expose per-instance override hooks. Implemented header/body/footer layout directly with Card's own flex CSS and its own `--ds-card-*-gap` hooks instead of composing the Stack component, to satisfy the overrides contract and the exact token bindings.
- 'renders' scenarios only assert `container.firstChild` is non-null per the platform contract (no role on Card), so they don't verify heading level, inset, or surface actually applied — kept them literal to the schema-derived scenario list rather than expanding scope.
- No demo file was requested/added; Card composes Button/Link/Stack/Text/Heading only inside stories, not a dedicated demo under packages/react/demo/.
- Dev-only warning for `interactive` (wrong child count/type) checks `Children.count(children) !== 1 || !isValidElement(children)`; it doesn't verify the child is actually a Link or Button (can't reliably introspect arbitrary child types), so a single non-interactive child passes silently.

## 2026-09-09 21:45 — round 1

- Card: spec says headerActions is 'At most two' controls with no enforcement mechanism specified; existing implementation renders whatever is passed without a dev-time warning, consistent with how other composite components in the package handle non-enumerable content constraints.
- Card: package-wide convention doc calls for a `data-ds="<Name>"` root attribute as a testability hook, but no existing component (Box, Switch, etc.) implements this, and Card follows that same precedent — flagging in case the convention doc and implementation are meant to reconcile.

## 2026-09-09 21:45 — round 2

- parse gate: failure is in checkbox.md and switch.md frontmatter ('behavior' key not allowed by the component schema), not in card.md or any React output — out of scope for the React/Card generator and off-limits to edit (site/ is docs); needs a fix in the docs-authoring/schema pass, either by removing 'behavior' from those two docs or adding it to the allowed component frontmatter schema.

## 2026-09-09 21:45 — round 3

- parse gate: unchanged from Round 2 — failure is in checkbox.md and switch.md frontmatter ('behavior' key not allowed by the component schema), not in card.md or any React output. This is out of scope for the React/Card generator and off-limits to edit (site/ is docs); it needs a fix in the docs-authoring/schema pass (either remove 'behavior' from those two docs or add it to the allowed component frontmatter schema) before this gate can pass for any component, including Card.

## 2026-09-09 22:19 — round 1

- Card: pre-existing implementation reused headerGap for both the header row gap and the headerActions internal gap, silently dropping the actionsGap binding (layout.gap.tight) that the schema lists separately and marks overridable — added --ds-card-actions-gap and wired it to .ds-card__header-actions.
- Card: pre-existing implementation was missing the data-ds="Card" testability hook on the root element required by the package conventions — added it.

## 2026-09-10 01:21 — round 1

- Card: root and header/headerActions/body/footer parts had no `data-part` hook even though role is `none` (so none of them are locatable by role) and only `heading` matches a string prop; per the package's testability convention I added `data-part="surface"` to the root and `data-part` to header/headerActions/body/footer. No behavior scenario currently exercises these locators (all 11 are bare `renders` checks against `data-ds`), so this is forward-looking compliance with the convention doc rather than something the current gate required.

## 2026-09-10 17:33 — round 1

- Card: the existing Card.tsx/Card.css (generated in an earlier round) omitted the `focusable` prop entirely — added tabIndex={focusable ? -1 : undefined}, a `ds-card--focusable` modifier class, and a `:focus-visible` ring rule reusing the same locked focusRing/focusRingWidth hooks as `interactive`; no story existed to demonstrate it either, so I added `Focusable`.
- Card: spec doesn't say whether `interactive` and `focusable` can be combined (e.g. a Feed item that is both a link-card and scriptable-focus target); left them orthogonal (independent classes/attributes) since nothing forbids it, but didn't add a dev warning for the combination.
