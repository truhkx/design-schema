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

## 2026-09-16 04:23 — round 1

- Card: borderWidth says an interactive card 'reserves border.width.focus instead, transparent until focused', which taken literally removes the visible border from an interactive surface:default card (contradicting 'surface: default draws a border'). Chose literal: interactive cards get a transparent focus-width border that turns color.border.focus on :focus-within, so no border shows at rest.
- Card: the docs don't say what an interactive card does when it has zero or several interactive children (only the Lit notes do). Chose the Lit behavior on web: stay non-interactive (no hit area, no hover background) and warn once in development.
- Card: 'exactly one interactive child' doesn't say how to recognise one. Chose: `children` is a single element whose type is the package's Link or Button, a native <button>, or an <a> with href; wrappers (a Stack around a Link) are not searched.
- Card: the example whole-card-is-a-link gives `children: "A Link to the invoice"` (a string), which cannot satisfy `interactive`. The WholeCardIsALink story renders `<Link href="#" label="A Link to the invoice" />` instead of the literal string.
- Card: the interactive-adds-no-focus-stop scenario runs on the Default args, whose body is not a Link or Button, so it only checks that the root isn't focusable and triggers the dev warning. It never exercises a real interactive card; a given with a Link child would test the contract.
- Card: the anatomy lists `heading` as a part, but Heading writes its own data-part="text" after spreading props, so the heading element can't carry data-part="heading". It has no heading hook.
- Card: Heading's default margin-block-end (space.sm) would add space inside the header row, and the docs don't mention it. Chose to cancel it through Heading's own contract: overrides={{ marginBlockEnd: 'space.0' }}.
- Card: the web notes put the ring on :focus-within, which also rings the card when a headerActions/footer control is focused, and on mouse focus, not only on keyboard focus. Followed the notes as written instead of :has(.target:focus-visible).
- Card: focusable says the card 'draws its own focus ring' without saying how. Chose an outline at the focus width (no offset) on :focus-visible, so non-interactive cards don't need a reserved border.
- Card: tabIndex isn't a schema prop, but Feed passes tabIndex={-1} to Card. A caller's tabIndex now passes through `...rest` unless `focusable` sets -1. The docs should say whether rest tabIndex is allowed.
- Card: examples say 'exactly its given as args', but the scenarios run on the Default story's args. Put a minimal `children` in meta.args and the full demo content in Default.args; the test merges meta.args + Default.args + given.
- Card: interactive with an empty or falsy `heading` — treated heading '' as absent (renders a <div>, no aria-labelledby).
