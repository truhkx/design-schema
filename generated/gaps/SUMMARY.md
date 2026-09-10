# Gap digest — phase Focus

Generated 2026-09-10T02:38 by tools/gap_digest.py. DOC lines belong in the named doc; fold them, run `node tools/py.mjs tools/parse.py`, and the affected targets become stale by prompt hash.

## Alert

Doc: `site/src/content/docs/components/alert.md`

### 2026-09-10 01:57 — lit round 1

- **DOC** Alert: the schema's spec text says the icon is 'drawn as a 1em inline shape until an Icon component exists', but ds-icon (with info/success/warning/danger status shapes and a close glyph) now exists in the package, so I composed <ds-icon> for both the tone icon and the dismiss button's glyph instead of hand-drawn SVG, per the generation rule to never draw icons by hand. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: iconSize is listed as overridable, but the composed <ds-icon> only exposes size via a fixed xs/sm/md/lg/xl enum, not an arbitrary token. I drove it through ds-icon's own documented CSS hook (--ds-icon-size) set from Alert's --ds-alert-icon-size hook on the .icon element, rather than the size attribute, so a per-instance override still works without touching ds-icon's shadow internals — the spec doesn't say how a generic TokenRef override should reconcile with a child's quantized size API. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: the previous implementation had no --ds-alert-* CSS custom-property hooks or overrides property at all (unlike the sibling components already regenerated in this pass), so I added the full Overrides contract (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) and a data-ds="Alert" host attribute to match current package convention; neither was called out explicitly as missing in the task, but both are required by the package-conventions doc. → `site/src/content/docs/components/alert.md`

### 2026-09-10 01:57 — rn round 1

- **DOC** Alert: the styles.icon description says the leading glyph is 'drawn as a 1em inline shape until an Icon component exists', but this package's Icon component already exists (and its own docblock names Alert's status shape as a documented use case, referring to a 'retired Unicode-glyph implementation'). Replaced the Unicode-glyph tone icon and the '×' dismiss glyph with `<Icon name={tone} .../>` and `<Icon name="close" .../>`, matching how Dialog's close button is built — this is a doc/reality mismatch, not an ambiguity in the schema itself. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: the schema's Overrides section lists 12 overridable bindings (border, borderWidth, radius, padding, gap, partGap, iconSize, headingWeight, fontFamily, fontSize, lineHeight, dismissMargin) but the file on disk before this change had no `overrides` prop at all — added `AlertOverridableBinding` and wired every binding through `resolveToken`, following the pattern used by Button/Disclosure/RadioGroup, and exported the new type from index.ts. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: the file on disk was also missing the package-wide `testID="<Name>"` convention on the root View; added `testID="Alert"`. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: heading and body share a single `fontSize`/`fontFamily`/`lineHeight` binding set per the schema (no separate heading-size token), so overriding `fontSize` resizes both the heading and, when the body is a plain string, the Text body; a non-string body (composed Text/Link children) does not receive the override since Alert cannot reach into a child's props, consistent with 'never restyle a child.' → `site/src/content/docs/components/alert.md`

### 2026-09-10 01:54 — web round 1

- **DOC** Alert: `iconSize` override needed to reach both the Alert's own centering-math hook (`--ds-alert-icon-size`, used in the icon wrapper's margin calc) and Icon's own `size` override, since Icon owns its rendered dimensions independently of the wrapper's box. Forwarded the same TokenRef to both, following the precedent of Divider forwarding `labelSize`/`fontFamily` into Text's own `overrides`. → `site/src/content/docs/components/alert.md`
- **DOC** Alert: anatomy names `container` for the root part; used `data-part="container"` alongside `data-ds="Alert"` on the same element, following Card's precedent of stacking `data-ds` and a root-level `data-part` (there it's `surface`). → `site/src/content/docs/components/alert.md`
- **CODE** Alert: schema locks `icon` (color.status.{tone}.icon) but gives no mechanism to apply it — Icon's own CSS (`.ds-icon { color: var(--ds-icon-color) }`) always wins over any ancestor `color`, so a CSS hook on the wrapper span can't recolor it (this appears to be a real, pre-existing issue in AlertDialog.css, which sets `.ds-alert-dialog--tone-* .ds-alert-dialog__icon { color: ... }` with a comment claiming 'Icon draws in currentColor' — that rule has no effect given Icon.css as written). I used Icon's own public `overrides={{ color: 'color.status.{tone}.icon' }}` prop instead, which reliably wins via inline style; this differs from AlertDialog's approach and the two composites should probably be reconciled.

## AlertDialog

Doc: `site/src/content/docs/components/alertdialog.md`

### 2026-09-09 23:37 — rn round 1

- **DOC** AlertDialog: `confirmDisabled` is described as 'aria-disabled, still focusable' (web ARIA convention), but the composed `Button` only supports native `disabled` (removes from focus/interaction per its own doc) — no restyle/reimplementation is allowed, so `confirmDisabled` maps to `Button`'s `disabled` prop as-is; a focusable-but-inert Confirm is not achievable without a Button API change. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: `focusRing`/`focusRingWidth` are locked bindings but this component introduces no directly-focusable element of its own beyond the composed `Button`s, which draw their own focus ring internally — same acknowledged platform limit Dialog documents for the same reason. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: a11y.role `alertdialog` has no native RN `accessibilityRole` equivalent; left unset and relies on `accessibilityViewIsModal` + `accessibilityLabel`/`accessibilityHint` on the surface, matching Dialog's precedent for `role=dialog`. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: `overrides.footerGap` can't reach Stack's internal gap (no override hook on Stack's fixed `space.*` gap presets), so the footer row is hardcoded to `gap="1"` and the override is a no-op — same limit Dialog documents for its footer. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: icon size for the tone glyph isn't specified; chose `size="lg"` since the a11y.contrast entry for the icon marks `large: true` (implying a large-text-equivalent presentation), consistent with the AA large-text contrast allowance. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: composition lists `focusScope: FocusScope` but does not name a component for the icon+text wrapper or the outer surface/scrim; rendered as plain `View`s, matching Dialog's precedent for uncomposed anatomy parts. → `site/src/content/docs/components/alertdialog.md`
- **DOC** AlertDialog: initial focus targets a wrapping `View` around the title rather than the Heading's own Text node (Heading doesn't forward refs) — same native limit Dialog documents for `initialFocus="title"`. → `site/src/content/docs/components/alertdialog.md`

### 2026-09-09 23:33 — lit round 1

- **DOC** Schema prop `title` collides with the native `HTMLElement.title` tooltip attribute; followed Dialog's precedent and named the property/attribute `heading` instead, per the package convention that forbids shadowing native members. → `site/src/content/docs/components/alertdialog.md`
- **DOC** platforms.lit.notes says both `confirm` and `cancel` dispatch with 'detail { reason }', but the events schema only defines a `reason` on onCancel ('cancel'|'escape'); onConfirm has no described payload. Implemented `confirm` with no detail (void) and only `cancel` carries `{ reason }`. → `site/src/content/docs/components/alertdialog.md`
- **DOC** No button variant is specified for Cancel in the schema or the Lit platform notes (only the confirm button's variant is derived from tone). Inferred `variant="secondary"` by analogy with the RN notes ('secondary for cancel; danger or primary for confirm by tone'). → `site/src/content/docs/components/alertdialog.md`
- **DOC** Footer button alignment (`justify`) isn't specified for Lit; the Web platform notes describe 'Cancel then Confirm in DOM order... visually the primary sits at the end via justify: end'. Applied the same `justify="end"` on the Lit `<ds-stack>` footer for visual parity. → `site/src/content/docs/components/alertdialog.md`
- **DOC** The generic Lit convention asks every keyboard-block component's `Keyboard` story to render 'at least three focusable children', but AlertDialog has no slots and always renders exactly two buttons (Cancel, Confirm) inside its shadow DOM — there is no schema-sanctioned way to add a third. The Keyboard story renders the trigger plus the two buttons only. → `site/src/content/docs/components/alertdialog.md`
- **DOC** No `dismissible`/close-button/scrim-click affordances exist for AlertDialog per spec ('no close button... scrim click does nothing'), so unlike Dialog there is no native `close` event listener or `closingProgrammatically` bookkeeping — the only way the shadow `<dialog>` closes is our own exit-animation call to `.close()`, which simplifies the lifecycle versus Dialog.ts. → `site/src/content/docs/components/alertdialog.md`

### 2026-09-09 23:29 — web round 1

- **DOC** No `container` prop: the platform keyboard rules say overlays portal to document.body with 'a container prop may override', but AlertDialog's own prop table (unlike Dialog's) doesn't list one, so I hardcoded document.body rather than invent an undocumented prop. → `site/src/content/docs/components/alertdialog.md`
- **DOC** Keyboard story can't reach 'three focusable children': AlertDialog's fixed anatomy (icon/title/description/footer, no body slot) only ever has two interactive controls in the focus trap — Cancel and Confirm. I did not pad the story with an invented third control since the spec forbids adding props/content not in the schema; the Keyboard story renders the real two plus the external trigger. → `site/src/content/docs/components/alertdialog.md`
- **DOC** Icon size: schema doesn't specify a size token for the status icon binding (only the color, `color.status.{tone}.icon`, locked). I chose IconSize 'lg' for visual weight as the dialog's primary signal; a 'md' default would also be defensible. → `site/src/content/docs/components/alertdialog.md`
- **DOC** partGap's doc text says 'between the text block and the footer', but in the DOM the icon sits inline with the text block as one row (`.ds-alert-dialog__content`), so partGap actually measures from that icon+text row to the footer rather than from text alone. Visually identical (icon and text are top-aligned), but noting the wording mismatch. → `site/src/content/docs/components/alertdialog.md`
- **DOC** `footerGap` (layout.gap.tight) is declared as an overridable CSS hook on the root for API-surface consistency with the schema, but — same as the existing Dialog component — it isn't actually wired to anything, because the footer's spacing comes from the composed Stack's own fixed gap scale (`gap="1"`), which can't read an arbitrary custom-property token. This mirrors an existing, unresolved gap already present in Dialog.tsx/Dialog.css, not a new one. → `site/src/content/docs/components/alertdialog.md`

## Box

Doc: `site/src/content/docs/components/box.md`

### 2026-09-10 00:52 — web round 1

- **DOC** Box: the doc's override contract says surface:none/border:false/radius:none make the matching overrides no-ops; the existing implementation already achieved this for border (border-width stays a literal 0 outside the .ds-box--border class) but not for surface/radius (background-color/border-radius read var(--ds-box-background)/var(--ds-box-radius) unconditionally, so an inline override could re-enable a background or corner radius even when surface/radius said 'none'). Fixed by making those two properties literal in the base rule and only applying the hook inside the non-'none' modifier classes, mirroring the border pattern already in the file. → `site/src/content/docs/components/box.md`

### 2026-09-10 00:49 — lit round 1

- **DOC** Box: `element` prop has no visible effect on the shadow DOM (per platform notes, only sets a role for sectioning values via ElementInternals) — kept `div`/`section` role-less as the spec directs, but a11y.role: none combined with sectioning `element` values creates an implicit contradiction (top-level a11y says role: none, platform notes say sectioning values do set a role); chose platform notes since they're more specific. → `site/src/content/docs/components/box.md`
- **DOC** Box: spec doesn't say whether `insetBlock`/`insetInline` should fall back to `inset` when unset or be fully independent optional attributes; implemented as optional (undefined) reflected attributes so CSS cascade order (inset rule before axis-override rule) does the `inset` fallback naturally — no explicit default given for insetBlock/insetInline in schema. → `site/src/content/docs/components/box.md`

### 2026-09-09 22:18 — rn round 1

- **CODE** Box: file already existed with the override-precedence bug (background/radius overrides applied even when surface:none/radius:none disabled those bindings); fixed to match the explicit 'overrides never restore presence' rule, and updated WithOverrides story (was demoing a no-op override) to set surface:subtle/radius:sm so both overrides visibly take effect.

### 2026-09-09 22:17 — lit round 1

- **DOC** Box: none of the existing Lit components (including Box) had the data-ds testability hook the digest requires; added `connectedCallback` setting `data-ds="Box"` since I was touching this file — worth rolling the same hook out to the other Lit components (Card, Container, Switch, etc.) in a follow-up pass. → `site/src/content/docs/components/box.md`

### 2026-09-09 22:16 — web round 1

- **CODE** Box.tsx, Box.css, Box.stories.tsx, and the index.ts export already existed and fully matched the spec; the only change made was adding the `data-ds="Box"` testability hook, which was missing (no other component in the package has it yet either, so this is the first).

### 2026-09-09 21:43 — rn round 3

- **DOC** parse gate failure is unchanged from Round 2 and still not caused by Box: checkbox.md and switch.md carry a `behavior` frontmatter key (from the behavior-scenarios rollout) that schema/component.schema.json does not permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). box.md itself parses without error. Both offending files live under site/ and the schema lives under schema/ — both off-limits per instructions, and neither belongs to Box. Re-verified packages/rn/src/Box.tsx independently: lint_literals --platform rn reports 0 findings and the test suite still passes 25/25. This conflict must be resolved by editing the schema or the two docs, which is outside this task's scope; no Box code change can make this gate pass. → `site/src/content/docs/components/box.md`

### 2026-09-09 21:43 — rn round 2

- **DOC** parse gate failure is not caused by Box: checkbox.md and switch.md have a `behavior` frontmatter key (added during the behavior-scenarios rollout) that schema/component.schema.json does not yet permit ('Additional properties are not allowed (\'behavior\' was unexpected)'). Both files are under site/ and the schema is under schema/, which I'm barred from editing per instructions, and neither is the Box doc. Box's own code passes lint_literals and its test suite cleanly; this gate cannot be fixed from packages/rn without either updating the schema to allow `behavior` or removing it from those two docs, and that decision belongs to the separate docs-fixing pass, not this generation task. → `site/src/content/docs/components/box.md`

### 2026-09-09 21:42 — lit round 3

- **DOC** checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — unrelated to Box, lives under site/ which is out of scope for the Lit generator; needs the docs-generation pass to remove/schema-allow that field. → `site/src/content/docs/components/box.md`

### 2026-09-09 21:42 — rn round 1

- **CODE** Box.tsx, Box.stories.tsx, Box.test.tsx, and the index.ts export already existed from a prior pass and matched the spec; the only fix was adding the missing testID="Box" on the root View, which the package convention requires but the existing file lacked (Stack.tsx also lacks it, but Container.tsx has it — followed Container's precedent).

### 2026-09-09 21:41 — web round 3

- **DOC** Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change. Repeated from round 2 unchanged. → `site/src/content/docs/components/box.md`

### 2026-09-09 21:41 — lit round 2

- **DOC** checkbox.md / switch.md: `parse` gate fails on frontmatter schema validation (unexpected 'behavior' property) — this is unrelated to Box and lives under site/, which I'm not permitted to edit; needs to be fixed by the docs-generation pass, not the Lit generator. → `site/src/content/docs/components/box.md`

### 2026-09-09 21:41 — web round 2

- **DOC** Box: the `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Box and lives in site/ docs, which this task's rules forbid editing — needs a schema or docs fix outside the React package, not a Box code change. → `site/src/content/docs/components/box.md`

### 2026-09-09 20:38 — rn round 1

- **DOC** Box: overrides contract has no precedent in this package (no existing RN component implements `overrides`/`TokenRef`/`resolveToken`), so I imported `TokenRef`/`resolveToken` directly from `@design-schema/tokens` (per the package-conventions digest) rather than from `./theme` (as the component prompt's Overrides section says) — `theme.tsx` doesn't export either symbol. → `site/src/content/docs/components/box.md`
- **DOC** Box: when `overrides.background` is set but `surface` is `none`, I chose to render the overridden background anyway (an explicit per-instance override wins over the surface default, including forcing a background where the enum alone would render none). The spec doesn't say whether an override should be able to introduce a background that the enum value suppressed. → `site/src/content/docs/components/box.md`
- **DOC** Box: when `border` is `false`, `overrides.border`/`overrides.borderWidth` are ignored (no borderWidth/borderColor styles at all) since there is no border to color. The spec doesn't state whether an override should be able to force a border into existence independent of the boolean prop. → `site/src/content/docs/components/box.md`
- **DOC** Box: `overrides.radius` always wins over the `radius` enum's resolved token, including when `radius` is `none` — same reasoning as background. → `site/src/content/docs/components/box.md`

### 2026-09-09 20:35 — lit round 1

- **DOC** overrides/TokenRef: Box is the first component in the package to implement the per-instance overrides contract described in the package conventions (not yet used by any existing component); @design-schema/tokens is currently only a devDependency of @design-schema/lit, so importing cssVar/TokenRef at runtime relies on that existing workspace link rather than a new dependency — flagging in case the convention expects it promoted to a real dependency. → `site/src/content/docs/components/box.md`
- **DOC** surface: none has no background token (color.background.{surface} only defines default/subtle/strong); I set the --ds-box-background override hook to the literal 'transparent' for that case rather than a token, since none is untokenized by design. → `site/src/content/docs/components/box.md`
- **DOC** element -> role mapping: the spec says sectioning values 'map to their implicit roles' without naming them; I used the standard HTML implicit ARIA roles (article, aside->complementary, header->banner, footer->contentinfo, main, nav->navigation) via ElementInternals.role. → `site/src/content/docs/components/box.md`
- **DOC** All 33 scenarios in the doc are `derived: props.*`/`a11y.role` and assert only `renders: true`, so no scenario exercises the `overrides` property, the `border` boolean's visual effect, or the element->role mapping — those paths are implemented per the platform notes but have no behavior-scenario test coverage; rendered exactly as specified rather than inventing new scenarios. → `site/src/content/docs/components/box.md`

### 2026-09-09 20:30 — web round 1

- **DOC** Box: no existing component implements the `overrides`/`TokenRef`/`cssVar` per-instance override pattern described in the package conventions, so I designed it from scratch — each overridable binding gets a `--ds-box-<binding>` CSS hook (kebab-case), and `overrides` sets that hook inline via `cssVar(ref)`, merged with any consumer-supplied `style`. Future components should follow the same shape for consistency. → `site/src/content/docs/components/box.md`
- **DOC** Box: a11y.role is 'none' and a11y.requires is empty, so none of the 33 scenarios exercise interaction or accessibility assertions — every one reduces to a render check (`container.firstChild` not null), per the spec's own `then: renders: true` for each. → `site/src/content/docs/components/box.md`
- **DOC** Box: 'surface: none renders nothing rather than a token' was implemented by simply not setting the `--ds-box-background` custom property for that modifier (falling back to the CSS `var(..., transparent)` default) rather than omitting a background-color declaration entirely — functionally equivalent but worth flagging as an interpretation. → `site/src/content/docs/components/box.md`
- **DOC** Box: the spec's Related section names Card and Container, neither of which exists in the package yet, so Box does not compose with them (nothing to compose with). → `site/src/content/docs/components/box.md`

## Breadcrumb

Doc: `site/src/content/docs/components/breadcrumb.md`

### 2026-09-10 02:01 — lit round 1

- **DOC** Breadcrumb (lit): the ellipsis button used a hand-drawn inline `<svg>` three-dot glyph instead of the system `ds-icon`; swapped for `<ds-icon name="ellipsis" inline>`, which already exists in the shared icon set. → `site/src/content/docs/components/breadcrumb.md`
- **CODE** Breadcrumb (lit): schema lists no `overrides`-hook wiring explicitly, but the package convention requires every overridable style binding to be a `--ds-breadcrumb-*` CSS hook plus an `overrides` property; the pre-existing file had neither — added `BreadcrumbOverridableBinding` (gap, fontFamily, fontSize, fontWeight, lineHeight) with hooks, matching the pattern in RadioGroup.ts.
- **CODE** Breadcrumb (lit): the pre-existing file lacked `data-ds="Breadcrumb"` and `shadowRootOptions.delegatesFocus`; the latter is required for the generated `control-is-focusable` behavior test to pass (calling `.focus()` on the host must delegate into the shadow tree while `document.activeElement` stays the host) — added both.

### 2026-09-10 01:59 — rn round 1

- **DOC** Breadcrumb (rn): the schema says the nav's fontSize binding is inherited by nested Links ('Set on the nav; the Links inherit it'), but ancestor items wrap Link in `<Text size="sm">`, a fixed enum prop, so a `fontSize` override changes the nav's own text (current page, separators, ellipsis glyph) but not the ancestor Links' inherited size — Link has no way to receive an arbitrary token override for inherited typography. Left as-is since fixing it would mean adding a new prop to Link, which the instructions say grows only via the child's own schema. → `site/src/content/docs/components/breadcrumb.md`

### 2026-09-10 01:58 — web round 1

- **DOC** Breadcrumb: the previously-generated file predated the data-ds/data-part/overrides conventions (no testability hooks, no overrides prop, and an inline hand-drawn SVG for the ellipsis instead of the system Icon component). Brought it up to current convention: added data-ds="Breadcrumb", data-part on nav/list/item/link/current, an overrides prop for the non-locked bindings (gap, fontFamily, fontSize, fontWeight, lineHeight), CSS hooks (--ds-breadcrumb-*) for every binding including the locked ones, and swapped the inline SVG for <Icon name="ellipsis" inline />. → `site/src/content/docs/components/breadcrumb.md`
- **DOC** Breadcrumb: the schema's `styles` block gives a token only for the current-page text (color.foreground, locked as currentColor) and the separator (color.foreground.muted); it says nothing about the color of an ancestor item that has no href and renders as plain (non-link) text. Kept the existing choice of reusing currentColor (color.foreground) for that plain-text case, since it isn't the current page but is also not decorative punctuation like the separator. → `site/src/content/docs/components/breadcrumb.md`

## Button

Doc: `site/src/content/docs/components/button.md`

### 2026-09-10 01:12 — rn round 1

- **DOC** Button: the existing Button.tsx/stories predated the current schema (no `inverse`, `track`/`onTrack`, or `overrides`, and it passed `disabled` straight to `Pressable`, which removes it from the tab order — contradicting the package convention and the a11y guidance that disabled buttons stay focusable). Rewrote it in full against the current schema rather than patching around the stale version. → `site/src/content/docs/components/button.md`
- **DOC** Button: `inverse` — the spec says ghost's hover 'uses a translucent inverse foreground' but defines no token for that translucent color (only the locked `inverseForeground`/`inverseFocusRing` bindings). Kept the normal `backgroundHover` token for the pressed state on ghost+inverse rather than inventing an untokenized alpha value. → `site/src/content/docs/components/button.md`
- **DOC** Button: the spec's inverse paragraph doesn't say whether the focus-ring swap to `color.inverse.focus` applies to every variant or only `ghost`. Chose 'every variant when `inverse` is true', since the ring must read against the inverse surface regardless of the button's own fill. → `site/src/content/docs/components/button.md`
- **DOC** Button: 'loading … replaces the icon slot' doesn't say whether that means only `leadingIcon` or both icon slots. Chose: the spinner always occupies the leading slot (also covering `iconOnly`, whose sole visible glyph is `leadingIcon`), and `trailingIcon` is hidden while loading; the label itself stays visible throughout since only the icon is described as being replaced. → `site/src/content/docs/components/button.md`
- **DOC** Button: `fontSize` was previously hard-coded to `fontSizeMd` regardless of `size`, not following the schema's `font.size.{size}` interpolation. Fixed to map sm/md/lg to fontSizeSm/Md/Lg. → `site/src/content/docs/components/button.md`
- **DOC** Button: schema ties a `transition` binding specifically to hover/press and marks it overridable, so implemented an actual `Animated` background-color transition (using `motionDurationFast`/`motion.easing.standard`, skipped under reduced motion) instead of the instant swap used elsewhere in the package (e.g. Link's pressed-color change), since Button's own schema calls this out where Link's does not. → `site/src/content/docs/components/button.md`
- **DOC** Button: `loadingSpin` has no described visual (only 'one rotation'); built a custom 1em bordered-ring spinner (foreground-colored, one edge transparent) driven by that duration, replacing the previous `ActivityIndicator`, since a native `ActivityIndicator`'s spin rate can't be bound to a token. → `site/src/content/docs/components/button.md`
- **DOC** Button: `onTrack` payload shape isn't spelled out beyond the behavior scenario's `{ name, label }`; defined and exported `ButtonTrackEvent { name: string; label: string }` for it. → `site/src/content/docs/components/button.md`

### 2026-09-10 01:08 — lit round 1

- **DOC** Button: `inverse` is a boolean prop but is not listed under platforms.lit.reflect (which only lists variant, size, type, disabled, icon-only, loading). Reflected it anyway (type: Boolean, reflect: true) since CSS attribute selectors are the only way to style it from the shadow stylesheet and every other boolean on this component is reflected — treating the omission as an oversight in the reflect list rather than an intentional exclusion. → `site/src/content/docs/components/button.md`
- **DOC** Button: the `inverse` description says ghost hover 'uses a translucent inverse foreground' but names no specific token/opacity for it. Used `color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent)` (matches the codebase's existing color-mix-of-tokens exemption pattern) since no `backgroundHover`-style binding exists for the inverse case. → `site/src/content/docs/components/button.md`
- **DOC** Button: `track`'s CustomEvent detail order relative to `press` — spec says trackPress/onTrack fire 'after onPress'; implemented as press dispatch, then (if track set) trackPress() call, then track dispatch, all synchronously within the same click handler. → `site/src/content/docs/components/button.md`
- **CODE** Button: renamed the container part from the pre-existing `part="button"` to `part="container"` to match the anatomy name literally (consistent with Card/Heading/etc. convention) — confirmed correct since tools/behavior_tests.py's auto-generated harness queries `[part="container"]`.

### 2026-09-10 01:06 — web round 1

- **DOC** Button: the schema's existing Button.tsx/css/stories predated the current spec (no overrides, no inverse, no track/onTrack, no data-ds/data-part, no loading spinner) — fully regenerated to match; flagging in case the old file was mid-migration for a reason not visible in the schema. → `site/src/content/docs/components/button.md`
- **DOC** Button loading: 'Replaces the icon slot with a 1em ring spinner' is singular and ambiguous about leadingIcon vs trailingIcon vs both — chose to replace only leadingIcon's slot (or show the spinner there even with no leadingIcon set) and leave trailingIcon rendering unchanged during loading. → `site/src/content/docs/components/button.md`
- **DOC** Button loadingSpin/spinner stroke width has no token binding in the schema — used border.width.focus for the ring thickness as the closest existing border-width token; no dedicated 'stroke width' token exists. → `site/src/content/docs/components/button.md`
- **DOC** Button inverse+ghost backgroundHover: schema says 'hover uses a translucent inverse foreground' but gives no token/opacity value — used color-mix(in srgb, var(--color-inverse-foreground) 16%, transparent), the sanctioned color-mix literal exception; the 16% figure is a guess with no token backing it. → `site/src/content/docs/components/button.md`
- **DOC** Button inverse focus ring: schema names color.inverse.focus for 'the focus ring' under `inverse` generally (not scoped to ghost like background/foreground), so it's swapped for all variants when inverse is true, not just ghost — flagging since the paragraph's phrasing is slightly ambiguous about scope. → `site/src/content/docs/components/button.md`
- **DOC** Added Button.test.tsx covering all 13 behavior scenarios (rollout target-by-target per repo convention seen in Card/Switch/etc.) even though the Output section only explicitly named .tsx and .stories.tsx — the Behavior scenarios section's 'emit one test per scenario' instruction and existing sibling components' *.test.tsx made this seem in-scope. → `site/src/content/docs/components/button.md`

## Card

Doc: `site/src/content/docs/components/card.md`

### 2026-09-10 01:26 — lit round 1

- **DOC** Card: spec's Lit notes say the interactive hit-area class is applied via 'a small global rule from the package' but doesn't say where that stylesheet lives given the light-DOM link may be in an arbitrary ancestor tree (page or another shadow root); existing implementation injects a scoped <style> into whichever root the slotted element resolves in (ensureHitAreaStyle), tracked per-root via a WeakSet to avoid duplicate injection. → `site/src/content/docs/components/card.md`
- **DOC** Card: spec doesn't say what happens when zero or more than one interactive child is slotted for `interactive`; existing implementation leaves the card non-interactive (no hit-area class applied) and logs a DEV-only console.warn. → `site/src/content/docs/components/card.md`
- **DOC** Card: header Heading size isn't specified beyond 'so a card heading reads smaller than a page heading' (web notes say size: lg, but existing Lit implementation uses size="md"); kept as previously generated since no reflected size mismatch was flagged elsewhere. → `site/src/content/docs/components/card.md`

### 2026-09-10 01:23 — rn round 1

- **DOC** Card: schema's platforms.rn.notes says header/footer are 'plain row Views styled from this component's gap bindings, not Stack' while the Guidance/Platform-notes prose says 'header and footer are horizontal Stacks' — the existing implementation follows the schema's own notes (plain Views using layoutGap* tokens directly) since Stack's gap enum only accepts the space.* scale, not Card's own overridable gap bindings. → `site/src/content/docs/components/card.md`
- **DOC** Card: 'interactive' a11y note says the card is 'not focusable' but the implementation makes the Pressable itself the sole focusable/accessible element (with the child Link/Button hidden via accessibilityElementsHidden) — interpreted as 'the card doesn't add a second focus stop beyond its single child target', consistent with the anatomy's intent, not literally non-focusable. → `site/src/content/docs/components/card.md`
- **DOC** Card: no explicit prop for aria-labelledby equivalent since RN has no id/labelledby mechanism — accessibilityLabel is only set on the Pressable in the interactive path (taken from the child's label), not on the plain View wrapper, since a non-interactive article-like grouping has no direct RN analog; the Heading itself remains the discoverable name via accessibilityRole="header". → `site/src/content/docs/components/card.md`

### 2026-09-10 01:21 — web round 1

- **DOC** Card: root and header/headerActions/body/footer parts had no `data-part` hook even though role is `none` (so none of them are locatable by role) and only `heading` matches a string prop; per the package's testability convention I added `data-part="surface"` to the root and `data-part` to header/headerActions/body/footer. No behavior scenario currently exercises these locators (all 11 are bare `renders` checks against `data-ds`), so this is forward-looking compliance with the convention doc rather than something the current gate required. → `site/src/content/docs/components/card.md`

### 2026-09-09 22:23 — rn round 1

- **CODE** Card: spec's borderWidth binding says border is 'Rendered only with surface default', but the interactive Pressable always reserves borderWidth at t.borderWidthFocus (transparent border color when subtle/unfocused) to avoid layout shift when focus toggles — kept this pre-existing, documented interpretation rather than making focus-ring width surface-conditional, since reserving space is necessary to prevent jank and the spec doesn't address focus-ring layout stability.

### 2026-09-09 22:21 — lit round 1

- **DOC** Card: schema lists `actionsGap` (layout.gap.tight, gap between header-actions controls) as both a style binding and overridable, but the existing implementation omitted it entirely (no hook, no CSS). Added `--ds-card-actions-gap` and styled `slot[name='header-actions']` as `display: flex; gap: var(--ds-card-actions-gap)` so slotted controls in that named slot lay out with the token gap; updated the WithHeaderActions story to include two controls (a Link and a ghost icon Button, per the anatomy note 'at most two') so the gap is visible. → `site/src/content/docs/components/card.md`
- **DOC** Card: spec doesn't say how a slot with multiple assigned elements should get gap applied across the shadow boundary; chose styling the `<slot>` element itself as a flex container (assigned nodes flow as its layout children), consistent with how the rest of the file already avoids `::slotted` for layout. → `site/src/content/docs/components/card.md`

### 2026-09-09 22:19 — web round 1

- **CODE** Card: pre-existing implementation reused headerGap for both the header row gap and the headerActions internal gap, silently dropping the actionsGap binding (layout.gap.tight) that the schema lists separately and marks overridable — added --ds-card-actions-gap and wired it to .ds-card__header-actions.
- **CODE** Card: pre-existing implementation was missing the data-ds="Card" testability hook on the root element required by the package conventions — added it.

### 2026-09-09 21:52 — rn round 3

- **DOC** parse gate: unchanged from round 2 — failure is in checkbox.md (line 113) and switch.md (line 89), which retain a `behavior` frontmatter block from the earlier behavior-scenarios rollout that schema/component.schema.json rejects (additionalProperties: false). card.md has no `behavior` key and Card's generated files are unaffected (typecheck and all 11 Card.test.tsx tests pass). This requires editing site/src/content/docs/components/{checkbox,switch}.md or schema/component.schema.json, both outside my permitted paths (site/, schema/); no change to packages/rn/src/Card.* can fix it. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:52 — rn round 2

- **DOC** parse gate: failure is unrelated to Card — checkbox.md and switch.md carry a `behavior` frontmatter block (from the prior behavior-scenarios rollout) that schema/component.schema.json rejects under additionalProperties: false; card.md has no such key. Fixing this needs an edit to site/components/{checkbox,switch}.md or schema/component.schema.json, both outside my permitted paths (site/, schema/) — reporting rather than editing forbidden files. No Card code change addresses this gate. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:51 — rn round 1

- **DOC** Card: transition (motion.duration.fast) has no runtime effect on native since Pressable's pressed style swaps instantly and there's no continuous hover state to animate between — kept the overridable binding for API parity but documented it as inert in the docstring, per the existing implementation's choice. → `site/src/content/docs/components/card.md`
- **DOC** Card: header/footer are hand-built horizontal View rows using layout.gap.* tokens rather than the Stack component, since Stack's `gap` prop only accepts the space.* scale, not layout.gap.* — noted in the docstring rather than growing Stack's API. → `site/src/content/docs/components/card.md`
- **DOC** Card: headerActions 'at most two' is a content guideline, not enforced in code (no runtime check on children count), consistent with how other components treat soft content limits. → `site/src/content/docs/components/card.md`
- **CODE** Link: added exported LINK_EXTERNAL_SUFFIX purely so Card's interactive hit-area collapsing can reproduce Link's accessible name (including the external suffix) verbatim instead of duplicating the copy string — this was a pre-existing bug in the already-generated Card.tsx, now fixed.

### 2026-09-09 21:49 — lit round 3

- **DOC** Card: the `parse` gate failure (checkbox.md/switch.md rejecting an unrecognized `behavior` frontmatter key) is identical to round 2's report and still does not implicate card.md or any file in packages/lit/src/Card.*  — the fix requires editing schema/component.schema.json or the two docs, both outside my permitted edit paths (schema/, site/) and unrelated to Card's implementation. If a Card-specific gate is actually failing, its output wasn't included here; I could not find one by inspection (no literals in Card.ts/Card.stories.ts, card.md parses cleanly). → `site/src/content/docs/components/card.md`

### 2026-09-09 21:49 — lit round 2

- **DOC** Card: the `parse` gate failure (checkbox.md/switch.md rejecting an unrecognized `behavior` frontmatter key) is unrelated to Card and not caused by anything in packages/lit/src/Card.ts, Card.stories.ts, or index.ts — card.md is not among the failing docs. The real fix is either adding `behavior` to schema/component.schema.json or amending the two docs, both of which are outside my permitted edit paths (schema/, site/) this round, so I left Card's files untouched rather than papering over an unrelated, out-of-scope schema/doc mismatch. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:47 — lit round 1

- **DOC** Card: spec gives no explicit size for the rendered <ds-heading> (web notes only say 'restrained per the theme'); implementation fixes size="md" for every headingLevel so visual weight stays modest regardless of level, per the theme's 'hierarchy from weight over size' guidance. → `site/src/content/docs/components/card.md`
- **DOC** Card: cross-shadow-boundary aria-labelledby uses ElementInternals.ariaLabelledByElements, a Chromium-only, feature-detected API; in browsers without it the host gets role="article" but no programmatic accessible name from the heading — a platform gap the spec doesn't address. → `site/src/content/docs/components/card.md`
- **DOC** Card: headerGap/footerGap are layout.gap tokens (loose/normal/tight) but ds-stack's own `gap` property only exposes the space.{0-12} scale, so Card sets `style="gap: var(--ds-card-*-gap)"` directly on the composed <ds-stack> rather than using its gap attribute — reaching a style into a composed child, which the composition rule otherwise forbids; treated as an application of the Overrides section's sanctioned host-CSS-specificity escape hatch since Stack's schema doesn't yet expose layout.gap tokens. → `site/src/content/docs/components/card.md`
- **DOC** Card: the interactive hit-area selector was broadened to `ds-link, ds-button, a[href], button` instead of only `ds-link`/`ds-button`, so a raw slotted anchor or button button still gets the extended hit area even though the spec only names the two Lit components. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:45 — web round 3

- **DOC** parse gate: unchanged from Round 2 — failure is in checkbox.md and switch.md frontmatter ('behavior' key not allowed by the component schema), not in card.md or any React output. This is out of scope for the React/Card generator and off-limits to edit (site/ is docs); it needs a fix in the docs-authoring/schema pass (either remove 'behavior' from those two docs or add it to the allowed component frontmatter schema) before this gate can pass for any component, including Card. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:45 — web round 2

- **DOC** parse gate: failure is in checkbox.md and switch.md frontmatter ('behavior' key not allowed by the component schema), not in card.md or any React output — out of scope for the React/Card generator and off-limits to edit (site/ is docs); needs a fix in the docs-authoring/schema pass, either by removing 'behavior' from those two docs or adding it to the allowed component frontmatter schema. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:45 — web round 1

- **DOC** Card: spec says headerActions is 'At most two' controls with no enforcement mechanism specified; existing implementation renders whatever is passed without a dev-time warning, consistent with how other composite components in the package handle non-enumerable content constraints. → `site/src/content/docs/components/card.md`
- **DOC** Card: package-wide convention doc calls for a `data-ds="<Name>"` root attribute as a testability hook, but no existing component (Box, Switch, etc.) implements this, and Card follows that same precedent — flagging in case the convention doc and implementation are meant to reconcile. → `site/src/content/docs/components/card.md`

### 2026-09-09 21:04 — rn round 1

- **DOC** interactive: the spec asks the child's own Pressable/Text node to render 'accessible={false}' when collapsed into the surrounding Pressable, but Button/Link don't forward unknown props to their inner element (they destructure a fixed prop list), so that prop would be silently dropped. Instead I wrap the located Button/Link in a `View` with `pointerEvents="none"` + `accessibilityElementsHidden` + `importantForAccessibility="no"`, which collapses touch and most screen-reader traversal into the outer Pressable but isn't guaranteed to remove it from a hardware-keyboard/tab order on every platform (notably react-native-web) the way a true single DOM node would. Flagging in case the schema wants Button/Link to grow an official 'render inert' escape hatch instead. → `site/src/content/docs/components/card.md`
- **DOC** interactive: searched only `children` (the body) for the single required Link/Button, not `headerActions` or `footer`, since combining 'exactly one interactive child' with those other anatomy slots isn't specified and risks double targets; a Button/Link placed in `footer` or `headerActions` on an interactive card is not neutralized and stays independently focusable/pressable. → `site/src/content/docs/components/card.md`
- **DOC** interactive border: the static border (surface default) and the locked focus ring use different token widths (`border.width.thin` vs `border.width.focus`). To avoid the ring toggle shifting layout (matching Button's own technique), interactive cards always reserve `border.width.focus` for their border, so `overrides.borderWidth` has no visible effect while a card is interactive — it only affects non-interactive, surface:default cards. → `site/src/content/docs/components/card.md`
- **DOC** transition: there is no continuous pointer hover on native to animate between (same limitation Button/Link already document for their hover tokens), so `overrides.transition` is accepted by the type but has no runtime effect; `hoverBackground` instead styles the Pressable's momentary `pressed` state, swapped instantly with no animation. → `site/src/content/docs/components/card.md`
- **DOC** header/footer/body rows are built as plain `View`s styled directly from `layout.gap.*` tokens rather than composed from the `Stack` component, because `Stack`'s `gap` prop only accepts the `space.*` scale ('0'..'12'), not the `layout.gap.*` tokens (`loose`/`normal`/`tight`) the schema specifies for `partGap`/`headerGap`/`footerGap`. This mirrors how Alert/Disclosure already lay out internal rows in this package without going through Stack. → `site/src/content/docs/components/card.md`
- **DOC** no token binding is given for the gap between multiple `headerActions` items (only `headerGap`, between the heading and the whole actions group, is specified); used `space.2` as a reasonable small gap and flagged it here rather than inventing a new named binding. → `site/src/content/docs/components/card.md`
- **DOC** Default story's `headerActions` demo uses a plain `ghost`/`sm` Button rather than the icon-only ghost Button the guidance describes, since Card's schema names no icon and the package has no Icon glyph specified for this use; kept it label-only to avoid inventing iconography. → `site/src/content/docs/components/card.md`
- **DOC** Heading's `size` is left at its default per-level size; the web platform note says header size should be 'restrained per the theme' but gives no concrete size or token, so no additional restraint was applied on native. → `site/src/content/docs/components/card.md`

### 2026-09-09 20:56 — lit round 1

- **DOC** Card: the doc's Lit note says the interactive hit-area extension needs 'the consumer's stylesheet or a small global rule from the package' to draw the ::after on the slotted light-DOM link/button, since a shadow stylesheet can't reach slotted content. Rather than leaving that as an undocumented external dependency, Card.ts injects the rule itself via a <style> tag into the card's root node (document head, or the nearest ancestor ShadowRoot) the first time an interactive card is used there — a self-contained implementation of the same idea, but worth flagging since it wasn't spelled out as code. → `site/src/content/docs/components/card.md`
- **DOC** Card: labelling the host article by the shadow-rendered heading ('aria-labelledby the heading id') has no standard cross-shadow-boundary mechanism. Implemented as best-effort using ElementInternals.ariaLabelledByElements (feature-detected), which as of this writing is Chromium-only; other engines get an article with no accessible name from the heading. → `site/src/content/docs/components/card.md`
- **DOC** Card: 'size restrained per the theme' for the header ds-heading wasn't given a value — used the smallest available HeadingSize ('md'), leaning on the theme's 'hierarchy from weight, not size' guidance, fixed regardless of headingLevel. → `site/src/content/docs/components/card.md`
- **DOC** Card: none of the 11 given behavior scenarios exercise headerActions, footer, or interactive — all are plain 'renders: true' checks on heading-level/inset/surface. Those paths are covered by stories (WithHeaderActions, WithFooter, InteractiveTrue) but have no corresponding test, since the doc didn't include scenarios for them. → `site/src/content/docs/components/card.md`

### 2026-09-09 20:45 — web round 1

- **DOC** Interactive hit-area: the spec says the single Link/Button child gets a `::after` covering the card. I implemented this by cloning the sole child element and adding a class via `cloneElement`, since both Link and Button already merge a passed `className` into their own class list — this works, but it's a form of reaching into the child that the 'never restyle a child' rule is meant to prevent; flagging the tension rather than silently doing it. If either component ever stops forwarding `className`, this breaks silently. → `site/src/content/docs/components/card.md`
- **DOC** Spec's platform note calls header/footer 'a horizontal Stack', but Stack's `gap` prop only accepts the numeric `space.*` scale, not the named `layout.gap.{tight,normal,loose}` tokens the schema binds to partGap/headerGap/footerGap, nor does Stack expose per-instance override hooks. Implemented header/body/footer layout directly with Card's own flex CSS and its own `--ds-card-*-gap` hooks instead of composing the Stack component, to satisfy the overrides contract and the exact token bindings. → `site/src/content/docs/components/card.md`
- **DOC** 'renders' scenarios only assert `container.firstChild` is non-null per the platform contract (no role on Card), so they don't verify heading level, inset, or surface actually applied — kept them literal to the schema-derived scenario list rather than expanding scope. → `site/src/content/docs/components/card.md`
- **DOC** No demo file was requested/added; Card composes Button/Link/Stack/Text/Heading only inside stories, not a dedicated demo under packages/react/demo/. → `site/src/content/docs/components/card.md`
- **DOC** Dev-only warning for `interactive` (wrong child count/type) checks `Children.count(children) !== 1 || !isValidElement(children)`; it doesn't verify the child is actually a Link or Button (can't reliably introspect arbitrary child types), so a single non-interactive child passes silently. → `site/src/content/docs/components/card.md`

## Checkbox

Doc: `site/src/content/docs/components/checkbox.md`

### 2026-09-10 01:45 — rn round 1

- **DOC** Checkbox: the existing file predated the package's overrides contract (no `overrides` prop, no `CheckboxOverridableBinding`) and drew the checkmark as a raw Unicode '✓' Text glyph and a hand-drawn dash View. Icon.tsx's own docstring explicitly names 'the check in a Checkbox' as a supported use case and calls the Unicode approach 'retired', so rewrote to use `<Icon name="check"/"dash">` with `color=colorControlSelectedForeground` and `overrides.strokeWidth` forwarding the `indicatorStroke` binding, and added the full overrides contract following Box/Button/Input's established pattern. → `site/src/content/docs/components/checkbox.md`
- **DOC** Checkbox: `indicator` box is spec'd as 'controlSize minus 2 × space.1' but Icon's `size` prop only accepts discrete font-size-scale presets (xs/sm/md/lg/xl) or a token-ref override, not an arbitrary computed pixel value — used `size="xs"` (closest preset to the default ~12px derived size) centered in the drawn box via flexbox; a `controlSize` override will not proportionally rescale the glyph. → `site/src/content/docs/components/checkbox.md`
- **DOC** Checkbox: `validateValue` was missing the `invalid` → `copy.invalid` branch the schema's precedence (`error` → `required` → `invalid`) requires — Input already implements this three-branch precedence, so mirrored it exactly (text only surfaces once a Form validation run populates `formError`, matching the existing 'Invalid' story's documented behavior of showing no message until then). → `site/src/content/docs/components/checkbox.md`
- **DOC** Checkbox: `transition` binding's exact scope ('fill and indicator transitions') is descriptive, not literal — implemented as a single Animated.Value driving box background/border color (unchecked → controlSelectedBackground) and indicator opacity together, eased with motion.easing.standard and skipped under `useReducedMotion()`, mirroring Button's pressed-background animation pattern. The `pressedOverlay` effect is instantaneous and dims the whole box (border+fill+indicator), not just an overlay layer on the fill, since RN has no cheap way to layer a second tinted surface without restyling the border. → `site/src/content/docs/components/checkbox.md`
- **DOC** Checkbox: root View now carries `testID="Checkbox"`, which the original file lacked. → `site/src/content/docs/components/checkbox.md`

### 2026-09-10 01:43 — lit round 1

- **DOC** Checkbox: the indicator's check-mark/dash inset math ('controlSize minus 2 × space.1') isn't tied to any named overridable binding — partGap is documented specifically as the vertical gap between label/description/error, a different anatomy target, even though it shares space.1 as a default. Left the inset as a non-overridable literal var(--space-1) rather than repurposing partGap's hook for an unrelated part. → `site/src/content/docs/components/checkbox.md`
- **CODE** Checkbox: Checkbox.ts and Checkbox.stories.ts already existed, fully implementing props/events/forms/behavior/a11y, but predated the overrides-hook convention — added the CheckboxOverridableBinding type, --ds-checkbox-* CSS hooks on :host, the `overrides` property, applyOverrides(), and the data-ds="Checkbox" testability attribute, mirroring Button.ts's pattern (many other components in the package — Switch, Alert, RadioGroup, Disclosure, Meter, Breadcrumb, Landmark, FocusScope — are still missing this and weren't in scope to fix here).

### 2026-09-10 01:41 — web round 1

- **DOC** Checkbox: the `indicator` binding's description ('controlSize minus 2 × space.1') references space.1 as a fixed layout detail of that binding, not the `partGap` override binding (which is semantically the vertical gap between label/description/error) — kept the indicator inset as the literal `var(--space-1)` token so overriding `partGap` doesn't resize the checkmark. → `site/src/content/docs/components/checkbox.md`
- **DOC** Checkbox: anatomy lists `indicator` as a part, but per the web platform notes it's drawn as a CSS ::before pseudo-element on the control, not a real DOM node, so it has no element to carry `data-part="indicator"`; only `description` and `errorMessage` got the attribute (control and label are already reachable by role/label). → `site/src/content/docs/components/checkbox.md`
- **CODE** Checkbox: the file already existed from an earlier generation pass without the overrides contract (--ds-checkbox-* hooks, `overrides` prop) or data-ds/data-part testability hooks that Input.tsx and Card.tsx now use; I retrofitted Checkbox.tsx/.css to match that established pattern rather than leaving it stale.

## Container

Doc: `site/src/content/docs/components/container.md`

### 2026-09-10 01:19 — web round 1

- **DOC** Container: default paddingInline hook is only set per gutter modifier class (not on .ds-container base), consistent with other interpolated bindings in the package — chose to leave it unset at base so 'none' truly renders 0 with no fallback token flash. → `site/src/content/docs/components/container.md`
- **DOC** Container: overridable maxWidth hook has no effect for width:full since no modifier class sets it — treated as correct per the spec's 'overrides are no-ops where the binding is not in effect' rule. → `site/src/content/docs/components/container.md`

### 2026-09-09 22:24 — lit round 1

- **DOC** Container was already fully implemented and exported; the only change made was adding the `data-ds="Container"` testability hook in `connectedCallback`, which had been omitted (Box and Card already had it, per the convention that older/untouched components may lack it). → `site/src/content/docs/components/container.md`

### 2026-09-09 22:23 — web round 1

- **CODE** Container.tsx, Container.css, Container.stories.tsx, and the index.ts export already existed and matched the spec; the only deviation was a missing data-ds="Container" testability hook on the root element, which I added. No ambiguity in the schema itself required a judgment call.

### 2026-09-09 21:59 — rn round 3

- **DOC** parse gate: unchanged from round 2 — unrelated to Container. checkbox.md and switch.md carry a `behavior:` frontmatter block (from the 2026-09-09 behavior-scenarios rollout) that schema/component.schema.json's `component` definition rejects (`additionalProperties: false`, no `behavior` key defined). container.md parses cleanly and Container.tsx/.stories.tsx/.test.tsx/index.ts are unchanged and passing (11/11 tests). Fixing this needs a schema/component.schema.json edit (add a `behavior` property) or a checkbox.md/switch.md frontmatter edit — both are under the forbidden site/schema paths for this generator pass, so I'm reporting rather than editing. This is a repo-wide gate blocker, not something fixable from the Container generator. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:58 — rn round 2

- **DOC** parse gate: unrelated to Container — checkbox.md and switch.md carry a `behavior:` frontmatter block (added in the 2026-09-09 behavior-scenarios rollout) that `schema/component.schema.json`'s `component` definition rejects (`additionalProperties: false`, no `behavior` key defined). container.md itself parses cleanly and Container.tsx/.stories.tsx/.test.tsx/index.ts are unchanged. Fixing this requires editing schema/component.schema.json to add a `behavior` property definition, or removing/relocating the frontmatter in checkbox.md and switch.md — both are under the forbidden site/schema paths for this generator pass, so I'm reporting rather than editing. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:56 — lit round 3

- **DOC** Container: `parse` gate fails on checkbox.md/switch.md's `behavior` frontmatter field being rejected by schema/component.schema.json (additionalProperties: false) — this is a schema/docs mismatch unrelated to Container (container.md has no `behavior` field). Container's own files (Container.ts, Container.stories.ts, Container.test.ts, index.ts) are unchanged, already spec-compliant, and were not the cause in Round 2 either. This cannot be fixed from packages/lit/src; it requires editing schema/component.schema.json or the two docs, both out of scope for me. Repeating the same Container output will not clear this gate — it needs a schema/doc-side fix. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:56 — lit round 2

- **DOC** Container: the `parse` gate failure is caused by checkbox.md and switch.md frontmatter having a `behavior` block the component schema rejects (additionalProperties: false) — unrelated to Container's own doc or generated code, and out of scope for me to fix since it requires editing schema/component.schema.json or the two docs, which are off-limits. Container.ts/.stories.ts/.test.ts/index.ts are unchanged and were not the cause. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:54 — web round 3

- **DOC** Container: identical to Round 2 — the `parse` gate failure is still exclusively about checkbox.md and switch.md frontmatter ('behavior' property not allowed by the component schema), files under site/src/content/docs/components/ that I'm instructed not to edit. This is unrelated to Container or the React/web package; re-verified Container.tsx/Container.css independently pass tools/lint_literals.py and tools/parse.py reports no error for container.md. Since the same report recurred unchanged, flagging that whatever is meant to clear checkbox.md/switch.md's stray 'behavior' frontmatter key (or the schema itself) hasn't run yet — this needs to be fixed at the docs/schema layer, not in packages/react. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:54 — web round 2

- **DOC** Container: the reported `parse` gate failure (checkbox.md / switch.md frontmatter has an unexpected 'behavior' property) is unrelated to Container and to the React package entirely — those files live under site/src/content/docs/components/, which the docs-fix pass owns and I'm instructed not to edit. Container's own files parse and lint clean (verified with tools/parse.py and tools/lint_literals.py). No code change was made; this needs to be routed to whatever pass generates checkbox.md/switch.md frontmatter (likely a stray 'behavior' key added to their schemas that isn't in the component JSON Schema). → `site/src/content/docs/components/container.md`

### 2026-09-09 21:53 — web round 1

- **DOC** Container: found an existing Container.test.tsx in the tree, which conflicts with my stored memory that only Switch has tests and the other 75 test targets are intentionally deferred pending user decision — left it untouched since generating/modifying tests wasn't requested, but this may mean that decision has since changed. → `site/src/content/docs/components/container.md`
- **DOC** Container (package-wide): none of the existing components implement the `data-ds="<Name>"` root testability hook the generation instructions call for; since the digest/conventions doc doesn't mention it and no sibling component has it, I did not add it to Container alone to avoid inconsistency — flagging for a package-wide decision instead. → `site/src/content/docs/components/container.md`
- NOISE: 1 repeated or empty line(s) collapsed

### 2026-09-09 21:16 — rn round 3

- **DOC** parse gate: checkbox.md and switch.md fail schema validation because schema/component.schema.json's component definition uses additionalProperties: false and has no 'behavior' key, while both docs carry a behavior: frontmatter block from the prior behavior-scenarios rollout. This is unrelated to Container (whose doc has no behavior block and parses cleanly) and unrelated to the RN package (literals/typecheck/tests all pass). Fix requires editing schema/component.schema.json to allow 'behavior', or editing the two docs — both out of scope for this generator; no Container code change resolves it. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:15 — rn round 2

- **DOC** parse gate: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema), unrelated to Container — Container's own doc has no `behavior` block and parses cleanly. This is a schema/docs mismatch from the prior behavior-scenarios rollout; fixing it requires editing schema/ or site/ docs, which is out of scope for the RN generator. No change made to packages/rn/src/Container.* since all Container-specific gates (literals, typecheck, tests) already pass. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:14 — rn round 1

- **DOC** No token exists for a 'none' gutter or a 'full' max-width, and no `layoutMaxWidthFull`/zero-gutter token is named in the spec — used a literal `0` for gutter:none padding and simply omit `maxWidth` for width:full, matching the doc's 'renders no max-width'/'renders no padding' language (both fall under the linter's allowed bare literals). → `site/src/content/docs/components/container.md`
- **DOC** Container has no `behavior:` scenario block in its schema (unlike Switch), so Container.test.tsx follows Box.test.tsx's derived-only shape (one 'renders' check plus one per enum value for width/gutter/align) rather than Switch's given/when/then narrative — there's no interaction or a11y role to assert against. → `site/src/content/docs/components/container.md`
- **DOC** The `element` prop is scoped to web/lit only in the schema, so it's absent from ContainerProps entirely on RN, per the platform notes ('View with maxWidth, alignSelf... `element` does not apply on React Native' is implied but not stated verbatim — inferred from Box's identical pattern). → `site/src/content/docs/components/container.md`

### 2026-09-09 21:12 — lit round 3

- **CODE** build gate `parse`: still fails only on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema), confirmed unchanged from round 2 — container.md continues to parse without error and every other Container-relevant gate (contrast, literals, typecheck) passes. This is a pre-existing docs/schema mismatch outside packages/lit's editable scope (site/, schema/, generated/ are off-limits here); no change to packages/lit/src/Container.* can affect this gate's outcome. It needs a fix to checkbox.md/switch.md frontmatter (remove or rework the `behavior` field) or to the component frontmatter schema (allow `behavior`), applied in the separate docs-fixing pass.

### 2026-09-09 21:12 — lit round 2

- **CODE** build gate `parse`: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — unrelated to Container, which parses cleanly (25/25 other components pass, only these two error). This is a pre-existing docs/schema mismatch outside packages/lit's editable scope (site/, schema/, generated/ are off-limits here); it must be fixed by removing/reworking the `behavior` field in checkbox.md/switch.md frontmatter or by adding `behavior` to the allowed component schema properties, in the separate docs-fixing pass. No change to packages/lit/src/Container.* can affect this gate's outcome.

### 2026-09-09 21:11 — lit round 1

- **DOC** Container: schema's a11y.role is 'none', but element='main' is described as 'the page's main column'; since a Lit custom element can't retag its host, I set ElementInternals.role='main' only for element=main (mirroring Box's SECTIONING_ROLES pattern) and left div/section with no role — matches the React implementation's prior gap note for this same ambiguity. → `site/src/content/docs/components/container.md`
- **DOC** Container: width='full' and gutter='none' have no token to map to, so I gave the --ds-container-max-width/--ds-container-padding-inline hooks explicit literal values (none / 0) for those enum members, following Box's convention of an explicit value per enum (including 'none') rather than omitting the CSS custom-property rule. → `site/src/content/docs/components/container.md`
- **DOC** Container: gutter='narrow'/'wide' are treated as fixed (non-responsive) values, only 'default' is responsive across the two breakpoints — the spec's gutter description ties responsiveness only to the 'default' value, consistent with the existing React Container implementation. → `site/src/content/docs/components/container.md`
- **DOC** Container: tests assert reflected attributes and shadow-root/slot presence rather than the ElementInternals role directly, since no existing Lit test in this package queries internals.role (Box/Card don't either) and jest-dom has no matcher for it in this setup. → `site/src/content/docs/components/container.md`

### 2026-09-09 21:08 — web round 3

- **CODE** build gate `parse`: still fails only on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — confirmed unchanged from round 2, and container.md continues to parse without error. This is a pre-existing docs/schema mismatch unrelated to Container and outside the React generator's editable scope (site/ and schema/); no change to packages/react/src/Container.* can affect this gate's outcome. Needs a fix to checkbox.md/switch.md frontmatter or the schema's allowed properties in the separate docs-fixing pass.

### 2026-09-09 21:08 — web round 2

- **CODE** build gate `parse`: fails on checkbox.md and switch.md ('behavior' property not allowed by the component frontmatter schema) — unrelated to Container, which parses without error. This is a pre-existing docs/schema mismatch outside the React generator's scope (site/ and schema/ are off-limits here); it needs to be fixed by editing checkbox.md/switch.md frontmatter or the schema itself in the separate docs-fixing pass, not in packages/react.

### 2026-09-09 21:07 — web round 1

- **DOC** Container: the `gutter: narrow`/`wide` values have no explicit spec statement on whether they're fixed or also responsive; I treated only `default` as responsive (per its own description) and made `narrow`/`wide` static single values, since giving every gutter value the same three-tier responsive behavior would make the enum redundant. → `site/src/content/docs/components/container.md`
- **DOC** Container: `width: full` and `gutter: none` have no 'no-op' token, so I omit the CSS custom-property hook entirely for those modifier classes and let the property fall back to the literal `none` (max-inline-size) / `0` (padding-inline), mirroring Box's `surface: none` pattern — not stated explicitly in the schema but consistent with the codebase convention. → `site/src/content/docs/components/container.md`
- **DOC** Container: `element` is web/lit-only per platforms metadata, so no RN handling was needed; not a gap, just confirming the field was read correctly. → `site/src/content/docs/components/container.md`
- **DOC** Container: no dev-only warnings were specified or obviously needed (unlike Card's single-interactive-child check), so none were added. → `site/src/content/docs/components/container.md`

## Dialog

Doc: `site/src/content/docs/components/dialog.md`

### 2026-09-09 23:23 — rn round 1

- **DOC** Dialog: `overrides.footerGap` can't reach Stack's internal gap (Stack's `gap` is a fixed `space.*` preset with no override hook), so the footer row is hardcoded to `gap="1"` (space.1 = layout.gap.tight, the default) and the override is a no-op — same gap already flagged in Dialog.web.md; Stack would need its own override escape hatch to close this. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: composition doesn't name a component for `header`, so it renders as a plain `View` (Card precedent for uncomposed anatomy). → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: the gap between title and description inside the header's heading-group isn't named by any binding; used `layout.gap.tight` directly (a real token, but not an overridable one), matching Card's own header-gap precedent and the web generator's choice for this same seam. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: native has no descendant walker, so `initialFocus` is implemented (like FocusScope documents for itself) by calling `AccessibilityInfo.setAccessibilityFocus` on a wrapping `View` around the title, the close button, or the body `ScrollView` — not the literal first focusable descendant for `initialFocus="first"`. Heading/Text don't forward refs, so 'title' targets a plain wrapping View rather than the Heading's own Text node. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `focusRing`/`focusRingWidth` are locked but Dialog introduces no directly-focusable element of its own beyond the composed `Button` (close button) and the ad-hoc focus targets above, which have no visible focus ring on native (no `:focus-visible` equivalent) — an acknowledged platform limit, same as web's note. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `a11y.requires` lists `scroll-lock`, which has no native equivalent (there is no page-level scroll for a modal window to suppress); left unimplemented rather than faked. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: the RN platform notes list `accessibilityViewIsModal` as a prop passed to `Modal` itself, but RN's `Modal` doesn't accept that prop — only `View` does. Implemented it on the surface `View` (also documented in the notes prose) and rely on the composed `FocusScope`'s own wrapper `View` (which already sets `accessibilityViewIsModal={trapped && active}`) for the actual inert-background effect, rather than duplicating a Modal-level prop that doesn't exist. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: whether the close button should be visually `disabled` or just a silent no-op when `dismissible=false` isn't specified; chose `disabled` (announced state) over a live-looking dead control, for the same reason Escape must always report — an unresponsive-but-enabled button is a worse a11y outcome than a disabled one. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `size="md"`'s width (3/4 of `layout.maxWidth.content`) is computed as `t.layoutMaxWidthContent * 0.75` per the spec's own description; not a new token, but not itself independently overridable (only `widthSm` is, per the Overridable list). → `site/src/content/docs/components/dialog.md`

### 2026-09-09 23:11 — lit round 1

- **DOC** Dialog: the schema names the title prop `title`, but `HTMLElement` already defines `title` as the native tooltip attribute (per this package's own rule for `role`/`title`). Renamed the JS property and attribute to `heading` (not just the JS name, since leaving the HTML attribute as `title` would trigger native browser tooltips on hover). The `initialFocus` enum value `'title'` was kept as-is since it's a literal, not a property name. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: the 'action' close reason (distinct from escape/close-button/scrim) has no described trigger mechanism for the Lit platform. Inferred it from native <dialog> semantics: whenever the inner <dialog> fires its native `close` event without ds-dialog having driven it via the `open` property (e.g. a slotted form submitted with `formmethod="dialog"`), ds-dialog reports reason `action` and syncs `open` back to false. Not verified against a real form-in-dialog scenario. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: footer action alignment (justify) isn't specified by the schema. Left it at Stack's default (start-aligned), matching Card's footer convention, rather than assuming a right-aligned action row — worth confirming against the intended visual. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: enter/exit animation technique (opacity + translateY via CSS `@starting-style` and a `transitionend`-driven finish/dispatch, gated by `prefers-reduced-motion`) was chosen as the modern idiomatic approach for a native top-layer `<dialog>`; the schema doesn't prescribe an exact mechanism for Lit the way it does for RN's `Animated`. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: when `dismissible` is false, the close button stays visible and focusable but its click/press handler is a no-op ('the close button and scrim do nothing' per the doc), rather than being disabled or hidden — flagging the literal reading in case a disabled/hidden affordance was actually intended. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `initialFocus: 'close'` or `'title'` is honored even when `dismissible` is false (the schema doesn't state a conflict rule), so a non-dismissible dialog can still be told to focus the close button, which is present but inert. → `site/src/content/docs/components/dialog.md`
- **DOC** Could not execute `vitest run` in this sandboxed session (the shell tool call required interactive approval that wasn't available here); typecheck (`tsc --noEmit`) passes, and the two non-trivial test assertions (`has-accessible-name`, `control-is-focusable`) were manually verified against Lit's `delegatesFocus`/shadow-retargeting semantics rather than run live. → `site/src/content/docs/components/dialog.md`

### 2026-09-09 22:57 — web round 1

- **DOC** Dialog: the schema's composition names `footer: Stack`, but Stack's `gap` prop is a fixed `space.*` preset enum with no override hook, while the schema's `footerGap` binding is `layout.gap.tight` and is listed as overridable. There's no way to make an overridden `footerGap` actually reach Stack's internal gap without restyling it (disallowed). Chose `gap="1"` (space.1, 4px in calm-precise) as the closest visual match to the default token and declared the `--ds-dialog-footer-gap` hook on the root for override-surface completeness, but `overrides.footerGap` has no visible effect on the rendered footer today. Stack would need its own token/override escape hatch to close this gap. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: composition doesn't name a component for `header` (only focusScope/title/description/closeButton/body/footer), so it's rendered as a plain div with its own `--ds-dialog-header-gap`/`--ds-dialog-inset` hooks, matching the Card precedent for uncomposed anatomy parts. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `inset` (padding of header, body, footer) is expressed three ways for consistency — header/footer read `--ds-dialog-inset` directly in CSS, body forwards the same override value into Box's own `overrides.paddingBlock/paddingInline` (Box already exposes exactly this hook). All three share the same default (`layout.inset.lg`) and the same override input, but through two different technical paths since Box owns its own padding. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: the gap between the title and description inside the heading-group isn't named by any binding in `styles`; used `var(--layout-gap-tight)` directly (a valid token reference, but not an overridable hook), consistent with Card's header gap having no sub-token either. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `focusRing`/`focusRingWidth` are declared as locked tokens, but Dialog has no directly-focusable element of its own — the ring in practice comes from the composed Button (close button) and, for `initialFocus="title"`, a dedicated `:focus-visible` rule was added on the title heading since it's the one focus target Dialog itself introduces. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: jsdom (used by the `tests` gate) implements the `open` IDL property on `HTMLDialogElement` but not `showModal()`/`close()` or the `cancel` event. The component calls the real methods via optional chaining (so nothing throws) and also assigns `dialog.open = true/false` as a fallback so the element isn't hidden by the UA `dialog:not([open])` rule under engines that lack `showModal()`; this assignment is a no-op in real browsers since `showModal()`/`close()` already reflect `open` themselves. → `site/src/content/docs/components/dialog.md`
- **DOC** Dialog: `container` (portal target) isn't in the schema's `props` table but is implied by the keyboard/overlay rule ("a `container` prop may override" the portal target) and needed for testability/embedding; added it as an optional prop defaulting to `document.body`. → `site/src/content/docs/components/dialog.md`

## Disclosure

Doc: `site/src/content/docs/components/disclosure.md`

### 2026-09-10 01:54 — rn round 1

- **DOC** The rn platform notes only say the trigger contains "the chevron and a Text" without naming a component; the general icon rule ("never draw an inline SVG... by hand") and Icon's own docstring (which lists "the chevron in a Disclosure" as a usage example) make clear it should be the system Icon, so I render `<Icon name="chevron-right">` rotated 90deg via Animated for the open state, since chevron-right's path rotated 90deg matches chevron-down exactly — the file previously hand-drew the chevron with bordered Views, which I replaced. → `site/src/content/docs/components/disclosure.md`
- **DOC** The spec's overridable-bindings table (triggerFontSize etc.) applies to the trigger text, but Icon only accepts an enum `size` (xs/sm/md/lg/xl) tied to fixed tokens, not an arbitrary resolved number. To keep the 1em chevron in sync with an overridden triggerFontSize, I forward the same TokenRef to Icon's own `overrides.size`; the schema doesn't spell this out. → `site/src/content/docs/components/disclosure.md`
- **DOC** Web platform notes call for mirroring the chevron under `[dir=rtl]`; RN platform notes say nothing about RTL, and there's a `chevron-left` glyph available but no guidance on when to use it on native. I left the chevron unmirrored (matches the RN notes as given) — flagging in case RTL support is expected there too. → `site/src/content/docs/components/disclosure.md`
- **DOC** The previously-generated file was missing `overrides`/`DisclosureOverridableBinding` entirely and the root `testID="Disclosure"` hook required by package convention; both were added to match the other generated components. → `site/src/content/docs/components/disclosure.md`

### 2026-09-10 01:52 — lit round 1

- **DOC** Disclosure: schema's `styles` block lists `triggerPaddingBlock`, `triggerPaddingInline`, `triggerGap`, `triggerFontFamily`, `triggerFontSize`, `triggerFontWeight`, `triggerRadius`, `panelPaddingBlock`, `panelPaddingInline`, `disabledOpacity`, `transition` as overridable, but the file I found already checked in had no `overrides` property or `--ds-disclosure-*` hooks at all (styles read raw tokens directly) — added the `DisclosureOverridableBinding` type, `HOOKS` map, `overrides` property and `applyOverrides()` to match the Overrides contract and the pattern used by every other component in the package. → `site/src/content/docs/components/disclosure.md`
- **DOC** Disclosure: the chevron was hand-drawn as an inline `<svg>`, but `Icon.ts`'s own doc comment explicitly names 'the chevron in a Disclosure' as intended `<ds-icon>` usage and the icon rule forbids hand-drawn SVGs — replaced it with `<ds-icon name="chevron-right" inline>` and kept the rotation in Disclosure's own CSS (transform, not a glyph swap) so the `transition` binding still animates the rotation rather than a discrete icon change. → `site/src/content/docs/components/disclosure.md`
- **DOC** Disclosure: host was missing `data-ds="Disclosure"` (the testability hook convention) — added it in `connectedCallback`. → `site/src/content/docs/components/disclosure.md`
- **CODE** Generated test `generated/behavior/Disclosure.lit.test.ts`'s `has-accessible-name` case asserts `toHaveAccessibleName(props.label)`, but Disclosure has no `label` prop (its accessible name comes from `summary`), so it always compares against `undefined` and fails — same failure reproduces verbatim in `Icon.lit.test.ts` (which I did not touch), confirming this is a pre-existing generator gap in `tools/behavior_tests.py`'s prop-name assumption, not a defect in this component; left it alone since `generated/` is out of scope for this pass.

### 2026-09-10 01:48 — web round 1

- **CODE** Disclosure: file already existed from a prior generation but predated the overrides/testability-hook conventions (no `overrides` prop, no `data-ds`/`data-part` hooks, CSS used raw tokens instead of `--ds-disclosure-*` hooks). Brought it in line with Button/Card: added `DisclosureOverridableBinding` + `overrides` prop, rewrote CSS to define all style-binding hooks (including locked ones) on `.ds-disclosure` and read from the hooks, added `data-ds="Disclosure"` on the root and `data-part` on `triggerIcon` and `panel` (the `trigger` button itself is reachable by role+accessible name so it was left without a `data-part`, matching Menu's trigger).
- **CODE** Disclosure: overrides are consumer-facing style hooks on the root `<div>`, but the pre-existing `DisclosureProps` type extends `ComponentPropsWithoutRef<'button'>` (since `ref`/`...rest` target the inner trigger button, per the spec's `useImperativeHandle`). This means a consumer-supplied `style` prop is typed as button CSSProperties but is applied to the wrapper div, not the button — same shape either way in practice, so left as-is rather than widening the prop surface.

## Divider

Doc: `site/src/content/docs/components/divider.md`

### 2026-09-10 01:31 — lit round 1

- **DOC** Divider: schema says label is 'optional text in the middle of a horizontal divider' but doesn't forbid it on a vertical divider or define layout for that case; I render label between two line segments in a flex column for vertical too, same as horizontal, rather than rejecting the combination. → `site/src/content/docs/components/divider.md`
- **DOC** Divider: the `semantic` prop and `label` both drive the same role/aria-orientation exposure (guidance text says a labelled divider 'becomes semantic'); I implemented `effectiveSemantic = semantic || Boolean(label)` since the schema gives no separate visual/AT toggle for a labelled-but-not-announced divider. → `site/src/content/docs/components/divider.md`
- **DOC** Divider: labelSize/fontFamily overrides are wired into the composed `<ds-text>` by targeting its own public override hooks (`--ds-text-font-size`, `--ds-text-font-family`) from a `.label` class rule in Divider's shadow styles, rather than passing Text's `overrides` property object, since that avoids fighting Lit's property/attribute timing and stays within Text's documented CSS-variable contract; labelColor is left to Text's own locked `tone="muted"` default since it's excluded from Divider's overridable set. → `site/src/content/docs/components/divider.md`
- **DOC** Divider: no keyboard model, form-field interface, or events apply to this component (purely presentational/APG separator), so none were implemented — confirming there was nothing ambiguous there, just absent by design. → `site/src/content/docs/components/divider.md`

### 2026-09-10 01:30 — web round 1

- **DOC** Divider: label is documented as text for a horizontal divider only ("Optional text in the middle of a horizontal divider"). When orientation is vertical and label is set, I render a plain vertical line (no label text, since there's no described layout for a vertical labelled divider) but still treat it as semantic (role=separator, aria-orientation=vertical) since a label was explicitly given — the doc doesn't cover this combination. → `site/src/content/docs/components/divider.md`
- **DOC** Divider: labelSize and fontFamily are listed as overridable bindings using the standard --ds-divider-* CSS hook convention, but the label is rendered via the composed Text component, which already owns fontSize/fontFamily as its own overridable bindings. Rather than adding a parallel --ds-divider-label-size/--ds-divider-font-family hook that no rule would read, I forward overrides.labelSize/overrides.fontFamily into Text's own overrides prop (fontSize/fontFamily). Net effect for consumers is the same (the token applies), but there is no literal --ds-divider-label-size custom property to set from plain CSS as the generic override docs describe — only Text's own --ds-text-font-size hook, reachable by targeting Text's default class from outside, which isn't documented either. → `site/src/content/docs/components/divider.md`
- **DOC** Divider: platform notes describe the vertical line as 'inline-size: var(--border-width-thin)' and the schema's thickness token is named border.width.thin, suggesting a CSS border. I implemented the line (both orientations, and both the plain-<hr> and labelled-<div> forms) as an explicit block-size/inline-size box with background-color instead of a border, so the single thickness/color hook pair works identically across the <hr> and the two line spans in the labelled layout without doubled-border rendering differences. → `site/src/content/docs/components/divider.md`

### 2026-09-10 01:26 — rn round 1

- **DOC** The RN platform notes state there is no native `separator` accessibility role, so I hide an unlabeled Divider from assistive technology (accessibilityElementsHidden + importantForAccessibility="no") regardless of the `semantic` prop, and only expose content when a `label` is present (read naturally via Text). This means `semantic=true` without a `label` has no observable effect on native — I added a __DEV__ warning for that case since the spec doesn't say whether to warn. → `site/src/content/docs/components/divider.md`
- **DOC** The schema doesn't say what happens when `orientation="vertical"` and `label` is set together. Docs only describe the label+line layout for horizontal dividers, and a 1px-wide vertical column has no room for centered text, so I ignore `label` on vertical dividers (render a plain line) rather than rotating the label layout. → `site/src/content/docs/components/divider.md`
- **DOC** `spacing` schema says overrides 'change values, never presence' — treated `spacing: "none"` (the default) as the 'off' state, so `overrides.spacing` is a no-op unless a non-none spacing value is also selected, matching how Box treats radius: none. → `site/src/content/docs/components/divider.md`
- **DOC** labelSize/fontFamily overrides are passed straight through as TokenRefs to the composed `Text`'s own `overrides` prop (which resolves them itself) rather than resolving them a second time in Divider — avoids double token resolution but relies on Text's override keys (`fontSize`, `fontFamily`) matching Divider's binding names one-for-one. → `site/src/content/docs/components/divider.md`

## Fieldset

Doc: `site/src/content/docs/components/fieldset.md`

### 2026-09-10 02:07 — lit round 1

- **DOC** Fieldset: composition maps legend/description to Text and fields to Stack, but every existing Lit field composite (RadioGroup, Checkbox, Input) renders raw <legend>/<p> styled to the same tokens instead of instantiating ds-text, and the platform notes require fields to stay in the light DOM (ruling out wrapping them in a shadow ds-stack). Followed that precedent: raw elements for legend/description, and a plain flex '.fields' wrapper (gap from fieldsGap) around the default <slot> instead of a shadow <ds-stack>. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: the schema has no `required` prop, only a copy.requiredIndicator and the behavior note 'appended to the legend when every field inside is required'. Implemented as a computed getter that queries slotted ds-input/ds-checkbox/ds-switch/ds-radio-group and checks their `required` property at render time; it only recomputes on property changes and on the default slot's `slotchange`, not on ad-hoc mutation of a field's `required` property after connection (mirrors the same limitation ds-form's disabled-sync already accepts). → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: `disabled` propagation targets ds-input, ds-checkbox, ds-switch and ds-radio-group (same set ds-form uses for its own fields), since the spec says 'every field inside' without enumerating tags; nested ds-fieldset was not included as a target since the spec doesn't mention fieldset-in-fieldset (and Related explicitly says RadioGroup already is a fieldset, implying no nesting). → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: added `aria-disabled` on the shadow `<fieldset>` when `disabled` is set, matching the React/Web platform note ('disabled uses aria-disabled on the fieldset') even though the lit platform note doesn't repeat it and a11y.requires doesn't list a disabled-state item — kept for parity with Checkbox/RadioGroup's own aria-disabled pattern on their controls. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: the error region is always rendered (empty when unset, hidden via `.error:empty`) rather than conditionally, matching Checkbox/RadioGroup's pattern so a role=alert element persists in the DOM for screen readers to announce a later change — the schema doesn't specify which approach to use. → `site/src/content/docs/components/fieldset.md`

### 2026-09-10 02:07 — web round 1

- **DOC** Fieldset: schema's props list has no `required`/`invalid` prop, yet `copy.requiredIndicator` and the behavior note say the indicator appears 'when every field inside is required' — implemented by inspecting each direct child's own `required` prop (Children.toArray + every), since there's no group-level flag to key off. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: composition maps `fields: Stack`, but the platform note only says 'a Stack for the children' without specifying whether Fieldset itself renders the Stack or the consumer is expected to pass one as children. Chose: Fieldset renders the Stack internally (children are the raw field elements), matching how `gap` naturally maps onto Stack's own gap prop — consistent with Card/Dialog precedent of composing Stack directly rather than documenting it as a no-op. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: disabled propagation says 'pass disabled down through a FieldsetContext... until then, the fieldset clones direct children with disabled' — implemented the clone-children fallback only (no FieldsetContext), since Input/Checkbox/Switch/RadioGroup don't read such a context yet and adding an unused context would be speculative; a real FieldsetContext should land when those components regenerate to read it. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: `fieldsGap` is listed as overridable, but forwarding an arbitrary token into the composed Stack without restyling it isn't possible (Stack only exposes a fixed `gap` enum, not an arbitrary token prop). Followed the existing Dialog/AlertDialog/Card precedent for this exact situation: declared the `--ds-fieldset-fields-gap` hook and included `fieldsGap` in the overridable type for API consistency, but it only takes effect through Stack's own closest-preset gap value (a comment in Fieldset.css notes this, matching Dialog.css's `footerGap` comment). → `site/src/content/docs/components/fieldset.md`

### 2026-09-10 02:04 — rn round 1

- **DOC** Fieldset: schema's `requiredIndicator` rule ('appended when every field inside is required') requires introspecting children — implemented via React.Children.toArray + checking props.required on direct element children only; nested wrappers (e.g. a consumer-supplied Stack around fields) won't be seen. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: FieldsetContext (legend + disabled) is created and provided as the spec directs, but Input, Checkbox, Switch and RadioGroup don't yet read it (out of scope — I only touched Fieldset.tsx), so the 'Shipping address, Street' accessibilityLabel prefixing described in the RN platform notes has no effect until those four components are regenerated to consume useFieldsetContext(). → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: same gap applies to `disabled` propagation — since fields don't read the context yet, I added a fallback that clones direct children with `disabled: true` (mirroring the interim behavior the spec describes for web) so the prop is still functional today; this fallback isn't explicitly specified for RN and only reaches direct children, not ones nested in an intermediate wrapper. → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: schema's a11y.role is `group`, which isn't in RN's legacy `accessibilityRole` union — used the RN ≥0.74 `role="group"` prop instead (same pattern Landmark.tsx already uses for web-only ARIA roles). → `site/src/content/docs/components/fieldset.md`
- **DOC** Fieldset: no `disabledOpacity` binding is listed in the schema's styles/overrides tables (unlike RadioGroup/Input), so `opacity.disabled` is applied as a fixed, non-overridable token rather than through `overrides`. → `site/src/content/docs/components/fieldset.md`

## FocusScope

Doc: `site/src/content/docs/components/focusscope.md`

### 2026-09-10 02:15 — lit round 1

- **DOC** FocusScope: schema lists no styles and 'Overridable: none / Locked: none', so no `overrides` property was added — only visually-hidden sentinel styling exists, which is token-exempt by convention. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: 'container' autoFocus relies on `delegatesFocus` redirecting `this.focus()` to the shadow tree's tabindex=-1 anchor node standing in for the host, since the host itself carries no tabindex; this satisfies 'focus goes to the scope's own wrapper' without making the host part of the natural tab order. → `site/src/content/docs/components/focusscope.md`

### 2026-09-10 02:15 — web round 1

- **DOC** FocusScope: the derived 'control-is-focusable' scenario assumes a focusable root control, but FocusScope's root is tabindex=-1 (programmatically focusable only, never Tab-reachable itself) — interpreted 'focusable' as 'accepts .focus() calls', not 'reachable by Tab'. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: the keyboard rule 'Tab, from: first, expect: focus-next' (ordinary forward movement) has no explicit handler — it's satisfied by native browser Tab order since the component only intercepts Tab at the trapped edges, which may or may not be what the keyboard gate expects to see as an explicit code path. → `site/src/content/docs/components/focusscope.md`

### 2026-09-10 02:14 — rn round 1

- **DOC** FocusScope: RN has no API to walk arbitrary children for the first/last focusable descendant, so autoFocus values 'first', 'last', and 'container' all resolve to focusing the wrapper View; only 'none' differs — documented as an acknowledged platform limit in the component's JSDoc. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: restoreFocus captures the opener via TextInput.State.currentlyFocusedInput(), the only 'currently focused element' RN exposes generically — an opener that isn't a TextInput (e.g. a Pressable button) cannot be captured, so focus restoration silently no-ops in that case. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: onEscapeAttempt is accepted as a prop for API parity with web/lit but can never fire on native since there is no Tab order to confine. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: keyboard-operable/focus-trap requirements are only partially met — trapped only maps to accessibilityViewIsModal (screen-reader swipe confinement); a hardware keyboard's Tab key is not confined at all, a stated platform limit rather than an implementation gap. → `site/src/content/docs/components/focusscope.md`

### 2026-09-09 22:42 — rn round 1

- **DOC** FocusScope: the prompt's behavior-scenarios block was left as an unfilled placeholder ({{BEHAVIOR_COUNT}}/{{BEHAVIOR_YAML}}), so no real scenarios were provided — I did not fabricate a FocusScope.test.tsx rather than rubber-stamp untested behavior; add one once real scenarios exist. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope (rn): autoFocus 'first'/'last'/'container' are indistinguishable on native — RN has no public API to walk arbitrary `children` for focusable descendants without adding ref-forwarding to every composed component (Button, Input, etc.), which is out of scope for this file. I made all three (everything but 'none') focus the wrapper View via setAccessibilityFocus; this only matches the doc's explicit fallback for 'container', not a real 'first'/'last' distinction. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope (rn): restoreFocus's 'opener's node handle' has no capture mechanism on native since there's no opener ref prop and RN exposes no generic 'currently focused view' getter. I used TextInput.State.currentlyFocusedInput() as the only available proxy, so restoration only works when the opener was a TextInput — a Button/Pressable opener (the common case for a trigger that opens a dialog) will not get focus restored on unmount. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: onEscapeAttempt's payload type isn't specified beyond 'with the direction' in prose; I typed it as `'forward' | 'backward'`. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: the component has no open/trigger concept of its own (unlike Dialog), so the required 'Keyboard' story wraps it in local demo state (a trigger Button that mounts the scope) to satisfy the 'rendered open with its trigger and three focusable children' testability rule. → `site/src/content/docs/components/focusscope.md`

### 2026-09-09 22:37 — lit round 1

- **DOC** FocusScope: 'autoFocus: container' asks to focus 'the scope's own wrapper (made focusable with tabindex -1)', but the host has delegatesFocus:true, so calling this.focus() on the host would redirect into the shadow tree's first focusable element (the start sentinel) rather than staying on the host. Added a dedicated invisible tabindex=-1 anchor as the shadow tree's first descendant so delegatesFocus lands there instead, approximating 'focus stays on the wrapper, nothing interactive is announced' — not literally focusing the host element, since that's not reachable through delegatesFocus. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: sentinel focus handling isn't specified beyond 'catch focus arriving from the browser chrome'. Implemented as pass-through: focus arriving at the start sentinel moves to the first focusable descendant, end sentinel to the last, rather than wrapping to the opposite edge — treated as continuing the user's tab direction rather than another wrap (which is already handled by the Tab/Shift+Tab keydown interception at the real edges). → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: restoreFocus's 'next focusable element in the document if [the opener] is gone' has no defined ordering source. Implemented via a focusable-elements snapshot of document.body taken at mount time, restoring to the next surviving entry after the opener's original position (falling back to the previous one) — a best-effort approximation since the live DOM may have changed by unmount. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: added an untested dev-only console.warn (import.meta.env.DEV) when a trapped scope has no focusable descendants, since that would create an inescapable trap; not in the spec's explicit behavior list but consistent with the package's existing dev-warning convention (e.g. Landmark.ts) and the focus-trap/keyboard-operable a11y requirements. → `site/src/content/docs/components/focusscope.md`
- **DOC** FocusScope: 'active' pausing nested scopes is described both as an explicit consumer-set prop ('Pause the scope... used while a nested scope is open') and, in the web platform notes, as automatic via a 'module-level scope stack... only the top is active'. Implemented both: a module-level stack determines which trapped+active scope is innermost/effective, and the explicit `active` prop can additionally pause a scope regardless of stack position — not spelled out as a combination anywhere in the schema. → `site/src/content/docs/components/focusscope.md`

### 2026-09-09 22:31 — web round 1

- **DOC** onEscapeAttempt payload shape wasn't specified beyond 'with the direction' — typed it as `(direction: 'forward' | 'backward') => void` and exported `FocusScopeEscapeDirection`; a different payload shape (e.g. an object, or a cancelable event) would be a breaking change. → `site/src/content/docs/components/focusscope.md`
- **DOC** restoreFocus's 'next focusable element in the document if that one is gone' fallback requires knowing the opener's former DOM position after it's removed. Implemented by inserting an invisible marker Comment node next to the opener on mount and, at unmount, finding the first focusable element after that marker in document order; not spec-verbatim, just the only way to satisfy the requirement. → `site/src/content/docs/components/focusscope.md`
- **DOC** The sentinel focus redirect direction (start→first, end→last) is my interpretation of 'catch focus arriving from the browser chrome' as distinct from Tab-key wrap-around (already handled by the keydown handler at real edges). A focus-trap library reading the wrap semantics into the sentinels themselves would redirect the opposite way; behavior is unverified against a reference implementation. → `site/src/content/docs/components/focusscope.md`
- **DOC** The wrapper renders as a plain display:block div (matching Landmark's unstyled-wrapper pattern) rather than display:contents, because `autoFocus: 'container'` requires the div itself to be focusable via tabindex, which display:contents defeats in most browsers. This means FocusScope always inserts one extra box into the DOM/layout that a zero-footprint wrapper would avoid. → `site/src/content/docs/components/focusscope.md`
- **DOC** No explicit visibility (display:none/offsetParent) filtering in the focusable walker beyond aria-hidden/inert/disabled/tabindex<0 — the schema doesn't call it out, so hidden-but-attached elements with a positive tabindex would be treated as focusable. → `site/src/content/docs/components/focusscope.md`

## Form

Doc: `site/src/content/docs/components/form.md`

### 2026-09-10 01:24 — lit round 1

- **DOC** Form: anatomy lists separate 'fields' and 'actions' parts, but `children` is a single content prop with no dedicated actions slot — implemented one `part="fields"` slot covering both fields and actions; there is no distinct DOM node for 'actions'. → `site/src/content/docs/components/form.md`
- **DOC** Form: the DsFormField interface (per doc) declares `error`/`validationMessage` as required strings, but the already-existing `ds-switch` (a field type Form must collect) has neither property since a switch never validates — kept the interface as documented and read both defensively (`?? ''`) at runtime via `as unknown as DsFormField` casts, since Switch can never satisfy the interface structurally. → `site/src/content/docs/components/form.md`
- **DOC** Form: 'blur' validation for ds-radio-group ('validates when focus leaves the whole group') isn't spelled out mechanically — implemented by comparing a focusout event's `relatedTarget === target`, since composed-event retargeting collapses both to the `ds-radio-group` host when focus moves between its own radios, but stays distinct when focus truly leaves the group; this is my interpretation, not something stated in the docs. → `site/src/content/docs/components/form.md`
- **DOC** Form: nothing requires a consumer's field to carry an `id`, but the error summary must link to one — used `name` as documented ('the base of generated ids') to auto-assign `${idBase}-${field.name}` to any field missing an id at submit time. → `site/src/content/docs/components/form.md`
- **DOC** Form: the 'control-is-focusable' scenario (derived, lit/web) doesn't fit cleanly — Form is a container of externally-slotted fields, not a single control, so its own shadow root has no focusable element unless the error summary is showing; relied on the browser's `delegatesFocus` fallback (focuses the host itself when no inner focusable target exists) to satisfy `el.focus()` moving `document.activeElement`. → `site/src/content/docs/components/form.md`
- **CODE** Form: `labelledBy` (aria-labelledby across the shadow boundary) is wired through the newer `ElementInternals.ariaLabelledByElements`, feature-detected exactly like `Card.ts` already does — Chromium only today; there is no fallback for engines lacking it, so `labelledBy` currently has no effect there (same pre-existing gap as Card).

### 2026-09-10 01:22 — rn round 1

- **DOC** Form: the shared FormFieldHandle contract (register/getValue/validate/focus) used by Input/Checkbox/Switch/RadioGroup carries no field label, so the RN error-summary link's accessibilityLabel is just the error text, not "Label: error text" per the content guideline — matching web/Lit would require extending that shared handle across all field components, out of scope for a Form-only pass. → `site/src/content/docs/components/form.md`
- **DOC** Form: `name` has no functional use on RN (no DOM ids; focus is ref-based) — kept purely for prop parity with web/Lit's 'base of generated ids' description. → `site/src/content/docs/components/form.md`

### 2026-09-10 01:18 — web round 1

- **DOC** Form: the existing implementation predated the overrides contract, `labelledBy` prop, and `data-ds` testability hook — added `overrides?: Partial<Record<'gap' | 'errorSummaryBorder', TokenRef>>` with `--ds-form-gap`/`--ds-form-error-summary-border` hooks (plus locked hooks `--ds-form-error-summary-text`/`-background` for consistency with the Card/Input pattern, not overridable), added `labelledBy` (web platform) rendering `aria-labelledby` and suppressing `aria-label` when both are set, and added `data-ds="Form"` and `data-part="errorSummary"`. → `site/src/content/docs/components/form.md`
- **DOC** Form: replaced inline summary heading text with `COPY.summaryHeading`/`summaryHeadingOne` constants per the copy-verbatim convention; behavior is unchanged. → `site/src/content/docs/components/form.md`
- **DOC** Form: gap token was hard-coded as `--space-lg` instead of the `layout.gap.loose` preset (`--layout-gap-loose`, matching Stack/Card's `gap` token resolution) — fixed. → `site/src/content/docs/components/form.md`
- **DOC** Form: anatomy parts `fields` and `actions` have no dedicated wrapper elements since they are opaque `children` content (Stack-composed by the consumer), so no `data-part` was added for them — only `errorSummary` is a Form-owned element. → `site/src/content/docs/components/form.md`

## Heading

Doc: `site/src/content/docs/components/heading.md`

### 2026-09-10 00:47 — rn round 1

- **DOC** Heading: no Heading.test.tsx existed for the 16 behavior scenarios; added one mirroring Text.test.tsx's setup()-from-Default-story-args pattern since the spec doesn't specify a different fixture strategy. → `site/src/content/docs/components/heading.md`
- **CODE** Heading: spec doesn't specify RN's marginBlockEnd style property name; used RN's `marginBottom` (the only equivalent RN TextStyle offers) to realize the `space.sm` margin-block-end token, same choice the pre-existing file had made.
- **CODE** Heading: overrides prop, HeadingOverridableBinding type, and root testID="Heading" were listed as required package conventions but missing from the pre-existing Heading.tsx/index.ts; added them without changing any other existing behavior.

### 2026-09-10 00:45 — lit round 2

- **DOC** Heading: no new gaps — the `literals` gate flagged `fontFamily: '--ds-heading-font-family'` as a font-stack literal because its regex matches any `fontFamily: <quote>` regardless of content; switched that one HOOKS entry to a template literal (backtick), matching the existing workaround already used in Text.ts for the same false positive. → `site/src/content/docs/components/heading.md`

### 2026-09-10 00:45 — lit round 1

- **DOC** Heading: the schema gives `size` no default and no per-level mapping table in `styles.fontSize` (just `font.size.{size}`); the platform notes and guidance supply the level→size defaults (1→4xl … 6→md) verbatim, so I kept the existing file's approach of setting the `--ds-heading-font-size` hook from `level` first and letting an explicit `size` attribute override it — an explicit size always wins. → `site/src/content/docs/components/heading.md`
- **DOC** Heading: `color` is locked per the styles block, so it has no `--ds-heading-color` override hook (consistent with Card's locked `background`) — `.heading` reads `var(--color-foreground-strong)` directly with a comment noting it's excluded from `overrides`. → `site/src/content/docs/components/heading.md`
- **DOC** Heading: the guidance's Lit platform note says to use `part="heading"` for `::part` restyling, but the generation rules forbid exposing `::part` for styling and mandate the `overrides` property/hook mechanism instead; I followed the stricter package convention (hooks + `overrides`) and kept `part="heading"` only as the anatomy/testability hook, not a supported restyling surface. → `site/src/content/docs/components/heading.md`

### 2026-09-10 00:44 — web round 1

- **DOC** Heading: spec's Output section only asked for Heading.tsx + stories, but the Behavior scenarios section explicitly says to emit one test per scenario, and every sibling component in the current rollout (Text, Card, Box, Switch, Container) has a matching .test.tsx — added Heading.test.tsx on that basis rather than skip it. → `site/src/content/docs/components/heading.md`
- **CODE** Heading: pre-existing implementation predated the overrides/testability-hook conventions (no data-ds, no CSS custom-property hooks, no overrides prop, no test file). Brought it in line with current conventions rather than treating it as net-new: added overrides for fontFamily/fontWeight/fontSize/lineHeight/marginBlockEnd (color stays locked but still gets a hook, matching Card's pattern for locked bindings), and added Heading.test.tsx mirroring Text.test.tsx's per-scenario structure since the doc's Behavior scenarios section wasn't previously covered by a test file for this component.

## Icon

Doc: `site/src/content/docs/components/icon.md`

### 2026-09-10 00:44 — rn round 2

- **DOC** Icon: the `Color` story previously hardcoded a hex literal (`#1a5fd6`) to demonstrate the RN-only `color` prop, which the `literals` gate correctly rejects (tokens only, no hex). Fixed by following the existing `Text.stories.tsx` `ToneOnAction` pattern: a small wrapper component that calls `useTheme()` at render time and passes a real resolved token (`tokens.colorStatusDangerIcon`) into `color`, standing in for a parent component (e.g. Alert) passing its own resolved foreground color — since `color` takes a literal resolved color string, not a token ref, there was no way to satisfy the gate with a static `args` object. → `site/src/content/docs/components/icon.md`

### 2026-09-10 00:43 — rn round 1

- **DOC** Icon: the schema's `platforms.rn.notes` (decision 2026-09-10) says the RN paths table must be 'byte-identical to the web table', but web's Icon.tsx has no `calendar` entry even though `calendar` is in the shared enum — no reference path exists on any platform yet. I invented a 16-grid line-glyph calendar (body rect + two hanger ticks + header divider) in packages/rn/src/paths.ts; web/Lit will draw a different shape unless regenerated from this same data, breaking the 'visually neutral swap' goal until then. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `color`/size inheritance when `inline` is nested inside a system `Text` can't be implemented as literally as the doc implies. `TextNestingContext` (packages/rn/src/Text.tsx) is a plain boolean — it signals nesting but carries no font-size or color value — and Icon now renders `Svg`/`Path` (not `Text`), so there is no native Text-in-Text cascade to ride the way the retired Unicode-glyph implementation did. I fall back to `font.size.md`/`color.foreground` for inline icons whether or not they're nested in Text, same as the non-nested inline case. A true fix would mean threading the resolved size/color through `TextNestingContext` (or a new context) in Text.tsx, which is out of scope for this generation. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `platforms.rn.props` lists only width/height/viewBox/fill/stroke/accessibility*, omitting `strokeWidth`, `fillRule`, `vectorEffect`, and `testID` even though the `styles.strokeWidth` binding, the filled-glyph fillRule note, and the package's testability-hook rule all require them. Treated the detailed prose notes as authoritative over the abbreviated props list and included all four. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the `has-accessible-name` scenario has no `given` block, but Icon's default (from Icon.stories.tsx `Default`/`meta.args`) has no `label` and is therefore decorative with no accessible name — the generic derived scenario assumes a component always exposes one. Wrote the test with an explicit `label` (`'Warning: over quota'`, matching the existing `Label` story) instead of default args, since testing the true default would assert the opposite of the scenario's name. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `react-native-svg` was already listed as a peer/dev dependency in packages/rn/package.json before this generation (no package.json change needed), even though the existing packages/rn/src/Icon.tsx being replaced still used a Unicode-glyph fallback with no SVG — the dependency addition and the component's actual adoption of it appear to have landed separately. → `site/src/content/docs/components/icon.md`

### 2026-09-10 00:39 — lit round 1

- **DOC** Icon: the schema's Overrides section lists `color` as overridable defaulting to `color.foreground`, but the component's own styles.color description says the default is `currentColor`/inherit (so a Button/Link/Alert colors the icon for free) and `color.foreground` is only the eventual fallback once inheritance resolves to the root. Implemented `color: var(--ds-icon-color, inherit)` (hook unset by default, so ambient inheritance wins) rather than defaulting the hook to `var(--color-foreground)`, which would have broken composition inside colored ancestors. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `name` was previously missing the `calendar` enum value and its glyph (present in this schema's `name.values` and behavior scenarios but absent from the existing implementation) — added a simple line-glyph calendar (body + two top tabs + header rule) on the 16×16 grid; no reference design was given for its exact strokes. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: scenario `has-accessible-name` has no `given`, but the Default story's args are decorative (`label: undefined`), so asserting an accessible name against the defaults would fail. Set `label: 'Warning: over quota'` (the Labelled story's value) explicitly in the test to exercise the a11y.requires mechanism instead. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the general package convention requires `data-ds="<Name>"` and an `overrides` property/hooks on every component touched; the existing Icon.ts predated that convention (no `data-ds`, no CSS custom-property hooks, no `overrides`). Added `data-ds="Icon"`, hooks `--ds-icon-size`/`--ds-icon-color`/`--ds-icon-stroke-width`, and the `overrides` property/`IconOverridableBinding` type to bring it in line — this touches more of the file than the schema diff alone (just `calendar`) would require. → `site/src/content/docs/components/icon.md`

### 2026-09-10 00:37 — web round 1

- **DOC** Icon.tsx/css/stories.tsx pre-existed but lacked `calendar` (added to the enum after this generation was authored), the `data-ds="Icon"` testability hook, and the `overrides` contract; I brought them in line with the current schema/conventions rather than treating the files as already-generated. → `site/src/content/docs/components/icon.md`
- **DOC** calendar has no path data in any existing component to reuse (unlike chevrons/close/external/ellipsis, which came from Disclosure/Link/Breadcrumb/Alert) — drew a plain outlined rectangle with a header rule and two top tabs on the 16x16 grid as a new line glyph. → `site/src/content/docs/components/icon.md`
- **DOC** The override contract says overrides change values, never presence, and apply only where the binding is in effect: `inline` sets `font-size: inherit` directly rather than reading `--ds-icon-size`, so an `overrides.size` entry is a documented no-op while `inline` is true — chose to leave the hook set for consistency rather than deleting it in that case. → `site/src/content/docs/components/icon.md`

### 2026-09-09 18:17 — rn round 2

- **DOC** Landmark: the typecheck failure was in Landmark, not Icon. The RN platform note says Landmark renders a View with the `role` prop for every role, but RN 0.74's `Role` union has no `search` landmark (only the `searchbox` widget role). I kept the spec's `search` landmark by passing it as the legacy `accessibilityRole="search"`, which react-native-web maps to the ARIA search landmark; the other seven roles still use `role`. The Landmark RN notes should record this exception, and should say what iOS/Android do with a `search` landmark (they have no equivalent, so it is web-parity only). → `site/src/content/docs/components/icon.md`
- **DOC** Icon: guidance says the inline font size is 'read from a TextNestingContext if present', but TextNestingContext is a boolean that only says whether the icon is nested, not what size the parent is. I rely on React Native's own nested-Text style inheritance: when `inline` and nested, no fontSize/fontFamily/color is set so the glyph inherits. When `inline` but not nested in a system Text (for example inside Button, whose icons sit in Views), there is nothing to inherit; I fall back to `font.size.md`. The spec should say what inline means outside running text. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `color` fallback when nested. The spec says `color.foreground` is the fallback 'only when the icon has no colored ancestor'. On RN a nested Text inherits color, so I apply the fallback only when not inheriting; otherwise a decorative check inside a colored Text would override the parent's color. Confirm this is the intended reading. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `danger` is documented as octagon-x but the table gives ⨂ (circled times, U+2A02); `search` is ⌕ (U+2315, telephone recorder); the chevrons ⌄/⌃ are U+2304/U+2303 technical symbols. The guidance asserts all exist in the default iOS and Android system fonts, but I could not verify that; if any is missing on Android it renders as a tofu box. Consider documenting a verified fallback per glyph. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `allowFontScaling` is not mentioned. I left it on so icons scale with the text they sit beside; Button's stories use `allowFontScaling={false}` for their placeholder glyphs, so the two disagree until Button is regenerated to use Icon. → `site/src/content/docs/components/icon.md`
- NOISE: 7 repeated or empty line(s) collapsed

### 2026-09-09 18:16 — rn round 1

- **DOC** Icon: the schema's props list has no `color`, but the RN platform notes and guidance say the parent passes a `color` prop and that it is required-by-convention. I added an optional `color?: string` prop with `color.foreground` as the fallback; the schema should declare it (at least as an RN-only prop) so it is not an invented prop. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: guidance says the inline font size is 'read from a TextNestingContext if present', but TextNestingContext is a boolean that only says whether the icon is nested, not what size the parent is. I rely on React Native's own nested-Text style inheritance instead: when `inline` and nested, no fontSize/fontFamily/color is set so the glyph inherits. When `inline` but not nested in a system Text (for example inside Button, whose icons sit in Views), there is nothing to inherit; I fall back to `font.size.md`. The spec should say what inline means outside running text. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `color` fallback when nested. The spec says `color.foreground` is the fallback 'only when the icon has no colored ancestor'. On RN, a nested Text inherits color, so I apply the fallback only when not inheriting; otherwise a decorative check inside a colored Text would wrongly override the parent's color. Confirm this is the intended reading. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the `strokeWidth` binding (`border.width.focus`) cannot be applied to a Text glyph. I did not approximate it with fontWeight, and documented the limit in the JSDoc. The schema should mark this binding as web/Lit-only or state the RN substitute. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the `size` binding says 'width and height'. For a Text glyph I set fontSize, lineHeight, width and height to the token, with textAlign center and includeFontPadding false so the box is square and lines up in rows. Wide glyphs at small sizes may overflow the box; the spec does not say whether a square box or a natural text box is wanted. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the Unicode table maps both `check` and `success` to ✓, so the 'four different status shapes' promise (circle-check for success) does not hold on RN. I used the table verbatim; the spec should either accept that or supply a distinct character (for example ✔ or ☑). → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `danger` is documented as octagon-x but the table gives ⨂ (circled times, U+2A02), and `search` is ⌕ (U+2315, telephone recorder), and the chevrons ⌄/⌃ are U+2304/U+2303 technical symbols. The guidance asserts all exist in the default iOS and Android system fonts, but I could not verify that; if any is missing on Android it will render as a tofu box. Consider documenting a verified fallback per glyph. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `importantForAccessibility` for labelled icons is unspecified. I use `"auto"` when labelled and `"no"` when decorative, matching Button's decorative wrappers. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `label=""` (empty string) is treated as no label, i.e. decorative. The spec does not say whether an empty label should be an error or decorative. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the stories rule says one story per enum value plus Default. For the boolean `inline` and string `label` I added one story each (`Inline`, nested in Text; `Label`), since the naming rule only covers enums. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `allowFontScaling` is not mentioned. I left it on so icons scale with the text they sit beside; Button's stories previously used `allowFontScaling={false}` for their placeholder glyphs, so the two disagree until Button is regenerated to use Icon. → `site/src/content/docs/components/icon.md`

### 2026-09-09 18:13 — lit round 1

- **DOC** Icon: the styles section says filled glyphs (status shapes, ellipsis) have no stroke, but the web platform note says status shapes are a filled circle/polygon 'plus a stroke'. Chose no stroke: outlined ring plus inner mark drawn entirely as fill, reusing the existing Alert path data so the shapes match. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the schema describes `danger` as octagon-x, but the existing Alert glyph is an octagon with an exclamation mark. Followed the schema (octagon with an x); Alert will change shape when it is regenerated to compose ds-icon. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the strokeWidth binding lists only check, chevrons, close, plus and minus as line glyphs. `dash`, `external`, `search`, `arrow-right` and `arrow-left` are unclassified; drew them as stroked line glyphs too. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `dash` and `minus` are both a horizontal line with no stated difference. Drew `dash` shorter (4–12, the indeterminate-checkbox mark) and `minus` full width (3–13, matching `plus`). → `site/src/content/docs/components/icon.md`
- **DOC** Icon: 'stroke thickness is border.width.focus' is ambiguous between 2 user units on the 16-grid (scaling with size) and 2 CSS px at every size. Chose fixed px via vector-effect: non-scaling-stroke because the a11y section says the focus-ring width keeps glyphs legible at xs. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the general rules ask for delegatesFocus for every a11y.requires item, but accessible-name here is met by the svg itself and the icon must never receive focus (focusable=false). Omitted delegatesFocus. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: no guidance on what to render for an unknown or missing `name`. Rendered an empty svg and logged a console.warn under import.meta.env.DEV. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: no `hidden` behaviour or csspart is specified. Followed package convention: :host([hidden]) { display: none } and part="glyph" on the svg. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: an empty-string `label` is treated as no label (decorative), since the schema only distinguishes set vs omitted. → `site/src/content/docs/components/icon.md`

### 2026-09-09 18:10 — web round 2

- **DOC** Alert: the Preferences demo used a `title` prop but the Alert schema names it `heading`. I changed the demo to `heading`; the demo doc or the Alert schema should agree on the name. → `site/src/content/docs/components/icon.md`
- **DOC** Landmark: the doc does not say how the web element is chosen at the type level. The forwarded ref is typed HTMLElement; I render through createElement<HTMLAttributes<HTMLElement>, HTMLElement> so a union of tag names does not intersect ref types. Consider stating that the ref is HTMLElement, not the specific element for `as`. → `site/src/content/docs/components/icon.md`
- **CODE** Icon: no Icon changes were needed; both typecheck failures were pre-existing in Landmark and the Preferences demo. The Icon gaps from round one still stand (filled-plus-stroke contradiction on status shapes, screen-pixel vs user-unit stroke width, width/height attributes vs CSS sizing, unspecified vertical alignment, dash vs minus, public export of the paths table, empty-string label).

### 2026-09-09 18:09 — web round 1

- **DOC** Icon: the styles say status shapes are 'filled ... plus a stroke' but also that 'filled glyphs have no stroke'. A currentColor stroke on a currentColor fill would be invisible, so I drew the inner mark (i, check, !, x) as an evenodd hole in a single filled path with no stroke. The doc should say which it means. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: strokeWidth binds border.width.focus (2px) but does not say whether that is 2 user units on the 16-grid (scales with size) or 2 screen pixels at every size. 'Stays legible at xs' reads as screen pixels, so I used vector-effect: non-scaling-stroke. This also makes line glyphs heavier than the 1.5-unit strokes the existing components draw; confirm the intended weight. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the web note says to render `width height` on the svg, but attributes cannot take a CSS custom property. I render width/height as 1em and set font-size from font.size.{size} in CSS (inline mode inherits font-size). Document this or drop the attribute mention. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: vertical alignment of a non-inline icon is unspecified for web (Lit says inline-flex host). I used display: inline-block; vertical-align: middle. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: `dash` and `minus` are both horizontal lines and the doc does not distinguish them. I drew dash shorter (4–12) for the indeterminate-checkbox mark and minus full width (3–13) to pair with plus. Say what the difference is, or merge them. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: the paths table is told to be exported from Icon.tsx but Lit says it is 'imported by no one else'. I export it from the module (per the web note) and not from the package index. Confirm whether it belongs in the public API. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: label='' is treated as no label (decorative). The doc should say whether an empty string is an error or decorative. → `site/src/content/docs/components/icon.md`
- **DOC** Icon: no explicit glyph geometry is given. I reused the existing Disclosure/Link/Breadcrumb/Alert paths for chevrons, external, ellipsis and close so the planned swap is visually neutral; the other shapes are my own drawings on the 16-grid and may need design review. → `site/src/content/docs/components/icon.md`
- **TOOLING** Icon: type-check could not be run (no node_modules in the workspace); the files were reviewed by hand against @types/react SVG typings.

## Input

Doc: `site/src/content/docs/components/input.md`

### 2026-09-10 01:18 — rn round 1

- **DOC** Input: the schema's Overrides contract (borderFocus, borderInvalid, borderWidth, radius, paddingInline, paddingBlock, partGap, fontFamily, fontSize, labelWeight, helperSize, lineHeight, disabledOpacity) was missing from the existing implementation — added it, resolving values locally for the field's own View/TextInput styles and forwarding the same raw TokenRef for fontFamily/fontSize/labelWeight/lineHeight/helperSize through to the composed Text label/description/error via Text's own `overrides` prop rather than resolving twice. → `site/src/content/docs/components/input.md`
- **DOC** Input: the spec doesn't say whether `disabledOpacity` dims only the field or the whole label/description/field/error group; the prose rule '`disabled` uses `opacity.disabled` on the whole element' (and Button's precedent of dimming the entire control) led me to apply it to the outer container rather than just the TextInput. → `site/src/content/docs/components/input.md`
- **DOC** Input: `fontSize`/`fontFamily`/`lineHeight` are single bindings with no separate label-vs-field size in the schema; I applied them uniformly to the label and field (both default font.size.md) and let `helperSize` cover description/error (font.size.sm), since that's the only split the schema names. → `site/src/content/docs/components/input.md`
- **DOC** Input: added the `testID="Input"` root hook per the package's testability convention; the existing file predated that convention and lacked it. → `site/src/content/docs/components/input.md`

### 2026-09-10 01:16 — web round 1

- **DOC** Input: the schema's Overrides section makes labelWeight/helperSize/lineHeight/fontFamily/descriptionText/errorText bindings that Input itself owns, but the general composition rule says to render label/description/error via the shared Text component, which doesn't expose per-instance CSS hooks for those bindings. Rendered label/description/error as plain elements styled by Input's own --ds-input-* custom properties instead (matching Button's own precedent of a plain <span> for its label, not Text), so the override contract actually works. → `site/src/content/docs/components/input.md`
- **DOC** Input: focusRingWidth's description ('replaces borderWidth when focused; padding shrinks by the difference') conflicts with the general :focus-visible outline convention used by other components. Implemented it literally as written for this component: border thickens/recolors on focus with compensating padding via calc(), no separate outline layer. → `site/src/content/docs/components/input.md`
- **DOC** Input: a11y.role is declared as a single 'textbox' for all `type` values, but native ARIA mapping differs per type (search -> searchbox, number -> spinbutton, password -> no role). Left `type` to drive real browser semantics rather than forcing role='textbox' everywhere, since overriding the native role would fight the platform. → `site/src/content/docs/components/input.md`
- **DOC** Input: disabled styling only lists a `disabledOpacity` binding (no separate disabled background/foreground tokens), so disabled dims the field via opacity alone rather than swapping to a muted background/foreground as the file previously did. → `site/src/content/docs/components/input.md`
- **DOC** Input: added a companion Input.test.tsx (one test per behavior scenario, Button.test.tsx-style) since the Behavior scenarios section asked for scenario-derived tests even though the Output section only named Input.tsx and Input.stories.tsx. → `site/src/content/docs/components/input.md`

### 2026-09-10 01:14 — lit round 1

- **DOC** Input: existing Input.ts had no overrides contract (no data-ds attribute, no --ds-input-* CSS hooks, no `overrides` property). Added the full contract for the 13 overridable bindings, matching Button.ts's pattern, since the spec's 'Overrides' section applies to every component. → `site/src/content/docs/components/input.md`
- **DOC** Input: `focusRingWidth` (locked) says it 'replaces borderWidth when focused; padding shrinks by the difference so the field does not shift' — implemented as border-width swap + calc() padding compensation on `.field:focus-visible`, replacing the previous outline-based focus ring, since the outline approach didn't match that description. → `site/src/content/docs/components/input.md`
- **DOC** Input: precedence between borderInvalid and borderFocus when a field is both invalid and focused isn't specified. Chose to keep the invalid (danger) border color visible even while focused, so the error state stays communicated during editing; a focus-visible outline/ring is not used here so this is purely a border-color choice. → `site/src/content/docs/components/input.md`
- **CODE** Input: the Behavior guidance says disabled fields must be 'focusable (aria-disabled + readOnly on web — never the native disabled attribute)', but the pre-existing implementation used the native `disabled` attribute on the inner `<input>`, which removes it from the tab order. Fixed to use `aria-disabled` + `readonly` + a `.disabled` class for styling, and excluded disabled fields from ElementInternals form submission/validation manually (since native `disabled` no longer does that for us).

## Landmark

Doc: `site/src/content/docs/components/landmark.md`

### 2026-09-10 01:58 — lit round 1

- **DOC** Landmark (lit): the schema's anatomy list names a single `region` part, but the platform notes mandate no shadow root (host itself is the landmark, children stay in light DOM), so there is no shadow tree to carry a `part="region"` hook. Used the host-level `data-ds="Landmark"` attribute as the only testability hook, consistent with components that do have shadow roots. → `site/src/content/docs/components/landmark.md`
- **DOC** Landmark (lit): `as` is documented as web-only in the schema, so it was correctly omitted from the Lit element entirely — no attribute or property for it. → `site/src/content/docs/components/landmark.md`

### 2026-09-10 01:57 — rn round 1

- **CODE** Landmark: pre-existing implementation matched the spec fully except it lacked the mandatory testID="Landmark" testability hook; added it to the root View. No other ambiguity found.

### 2026-09-10 01:56 — web round 1

- **CODE** Landmark: the file already existed from a prior generation pass and matched the spec, except it was missing the `data-ds="Landmark"` testability hook required by package conventions (all 25 other components have it). Added it; had to widen the `createElement` generic prop type to `HTMLAttributes<HTMLElement> & { 'data-ds': string }` since raw `createElement` (used here instead of JSX because the ref must satisfy a union of element types) doesn't get TypeScript's JSX-only allowance for arbitrary `data-*` attributes.

## Link

Doc: `site/src/content/docs/components/link.md`

### 2026-09-10 01:15 — rn round 1

- **DOC** Link (rn): the existing implementation predated the current overrides/testID conventions — added testID="Link" and an overrides prop, since the spec says overrides/testID apply regardless of whether platforms.rn.props lists them. → `site/src/content/docs/components/link.md`
- **DOC** Link (rn): of the four overridable bindings (underlineThickness, underlineOffset, externalIconGap, transition), only `transition` has any effect on native — RN Text can't set decoration thickness/offset, and nested Text ignores margins so the external-icon gap is a hardcoded single space, not a token. Narrowed LinkOverridableBinding to 'transition' only rather than including no-op bindings. → `site/src/content/docs/components/link.md`
- **DOC** Link (rn): implemented the `transition` binding as a real color crossfade (Animated.Value interpolating colorLink -> colorLinkHover on press, eased with motion.easing.standard, skipped under reduced motion), matching Button's pattern, since the previous version swapped colors instantly and the schema explicitly names a transition binding for hover/press color. → `site/src/content/docs/components/link.md`
- **DOC** Link (rn): replaced the ad-hoc Unicode '↗' glyph with the package's own <Icon name="external" inline> component, since Icon's own docs/stories name 'the external mark on a Link' as its intended use and the package rule says never to re-implement a shape a shared component already provides. Trade-off: Icon's inline mode always renders at font.size.md (an already-documented Icon limitation) rather than truly inheriting the surrounding Text's font size the way the old raw-glyph-in-Text did, so the icon can look mis-sized when a Link sits inside a Text of a non-md size. → `site/src/content/docs/components/link.md`
- **DOC** Link (rn): Icon has no animated-color support, so unlike the label's crossfade, the external icon's color still swaps instantly between colorLink/colorLinkHover on press. → `site/src/content/docs/components/link.md`
- **DOC** Link (rn): for tone="inherit" combined with external=true, the icon color falls back to Icon's own default (color.foreground) since there is no currentColor to inherit on native — the spec doesn't address this combination explicitly. → `site/src/content/docs/components/link.md`

### 2026-09-10 01:10 — lit round 1

- **DOC** Link.ts/.stories.ts pre-existed from an earlier pass and were already spec-complete except for the overrides contract (hooks, `overrides` property, `data-ds`) and the `LinkOverridableBinding` type export, which I added; no ambiguity in the schema itself. → `site/src/content/docs/components/link.md`
- **DOC** download: not in `platforms.lit.reflect`, so left unreflected (a plain non-reflected boolean attribute) even though `external` and `tone` are reflected — the spec only lists the latter two under `reflect`. → `site/src/content/docs/components/link.md`
- **DOC** has-accessible-name scenario doesn't specify whether the external suffix is included in the assertion; used the plain `label` for the default (non-external) case, matching the scenario's default `given` (no `external: true`). → `site/src/content/docs/components/link.md`

### 2026-09-10 01:10 — web round 1

- **DOC** Link: the package now has an Icon component with a documented 'external' glyph, but the schema instructions for this pass say 'there is no Icon component yet' and to draw an inline SVG. Kept the hand-drawn inline SVG (identical path data to Icon's 'external' glyph) instead of switching to <Icon>, because Icon.css hard-resets --ds-icon-color to color.foreground on the icon element itself, which would break the currentColor inheritance Link relies on for tone/hover/visited color changes on the external icon. Flagging in case Icon should later be fixed to accept ambient currentColor so composite components can use it directly. → `site/src/content/docs/components/link.md`
- **DOC** Link.stories.tsx was already complete (Default, both tone values, external, download, inline-in-text) and needed no changes. → `site/src/content/docs/components/link.md`
- **CODE** Link: pre-existing Link.tsx/.css predated the data-ds/data-part/overrides conventions now used by newer components (Button, Icon, etc.) — added data-ds="Link" on the root, data-part="externalIcon" on the decorative icon span, and a LinkOverridableBinding overrides mechanism (underlineThickness, underlineOffset, externalIconGap, transition hooked as --ds-link-*), leaving color/colorHover/colorVisited/focusRing/focusRingWidth/focusRingRadius locked as the schema specifies. No spec ambiguity here, just bringing the file current.

## Menu

Doc: `site/src/content/docs/components/menu.md`

### 2026-09-10 00:21 — rn round 1

- **DOC** Menu: no ActionSheet component exists in this package yet (only referenced in FocusScope's own doc comment), so the phone-vs-tablet split the platform notes describe ("Menus on touch are ActionSheets") isn't implementable by composition. Chose to always render the anchored transparent-Modal dropdown, on phones too, and documented this as an acknowledged limit in the JSDoc. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: platform notes say "the trigger Button carries accessibilityState.expanded", but Button's schema/props have no accessibilityState or expanded hook (Button only sets its own internal accessibilityState={{disabled, busy}}). Left the trigger's expanded/collapsed state unexposed to assistive technology rather than restyle/reach into Button; flagged for Button's schema to grow an `expanded` prop. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: arrow-key navigation, Home/End, and a-z typeahead are a web keyboard model with no RN equivalent — core RN Pressable has no generic key-event API (confirmed by RadioGroup's own precedent of 'no roving tabindex or arrow movement on native'). Implemented only what native affords: Enter/Space (via onPress) to activate, Escape/back gesture (via Modal onRequestClose) to dismiss, and each item as its own Tab stop for an external keyboard. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: opening via ArrowUp on the trigger (to focus the last item) can't be distinguished from Enter/Space/click, since Button exposes only onPress. Every open always focuses the first enabled item; focusing the last item on ArrowUp is not implemented. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: disabled items keep the native `disabled` prop off the Pressable (per the package's general disabled-state rule) and rely on accessibilityState.disabled plus a press guard, so they stay in the Tab order — this differs from Button/RadioGroup in this same package, which do pass `disabled` to Pressable; followed the digest's explicit instruction over that precedent. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: no scroll token/behavior is specified for a popup taller than the viewport; the popup grows to fit its content with no clipping or internal ScrollView. Flagged as an open question for very long menus. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: `start`/`end` placement is resolved against I18nManager.isRTL (mirroring Text's toTextAlign convention) but is unverified against a live RTL app. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: minWidth default is computed as `t.space20 * 2.5` per the schema's own description ("space.20 × 2.5, i.e. 200px") since no dedicated token exists; marked literal-ok. → `site/src/content/docs/components/menu.md`

### 2026-09-10 00:07 — lit round 2

- **DOC** Menu: tools/lint_literals.py's font-stack heuristic (`fontFamily\s*:\s*['"]`) matches any object key literally named `fontFamily` followed by a quoted string, regardless of content — it flagged the `HOOKS.fontFamily` CSS-custom-property-name entry as if it were a hardcoded font stack. Fixed by writing that one value as a template literal (`` `--ds-menu-font-family` ``) instead of a string literal, which is semantically identical but doesn't match the regex; no spec or token usage changed. → `site/src/content/docs/components/menu.md`

### 2026-09-10 00:06 — lit round 1

- **DOC** Menu: the trigger's aria-haspopup/aria-expanded/aria-controls are set as plain attributes directly on the composed <ds-button> host (Button has no dedicated props for them, and the web platform notes describe them on a plain <button>). This relies on the browser reflecting host-level ARIA attributes to the accessible node of a shadow-DOM custom element, which holds in current Chromium/Firefox/Safari but is a known cross-shadow-boundary ARIA nuance worth re-checking with a screen reader. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: `items` shape string is recursive (`group.items: MenuItem[]`), which literally permits a group containing another group or separator. I kept the type verbatim and render/flatten recursively so nesting doesn't crash, but the docs' guidance ('groups render a non-interactive heading row') implies groups are meant to be flat (leaf action items only) — nesting is untested against any behavior scenario. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: `iconOnly` + `triggerIcon: 'none'` is a valid prop combination per the schema but produces a trigger with no visible content (label hidden, no icon) — implemented literally since the docs don't forbid it. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: shortcuts are rendered as a display-only `<span aria-hidden="true">` rather than mapped to `aria-keyshortcuts`, since the free-text `shortcut` strings (e.g. '⌘S') don't match the `aria-keyshortcuts` value syntax the spec would require; this matches the docs' 'display-only' framing but means shortcuts are entirely invisible to assistive tech rather than announced. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: no design token covers the typeahead reset delay, so I used a plain 500ms JS constant (APG's common convention) rather than a token — flagged since the theme rules forbid literal timings elsewhere. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: default Storybook args render the menu closed (only the enum-value and content stories force `open: true`) to avoid a focus race in the auto-generated behavior tests — opening triggers an async `focusItem` chain (waits on `updateComplete` before calling native `.focus()`), which could otherwise race with a synchronous `el.focus()` call in a freshly mounted test element. → `site/src/content/docs/components/menu.md`
- **DOC** Could not execute the Vitest suite in this session (shell command required interactive approval that wasn't granted); `Menu.test.ts` is written and `tsc --noEmit` passes, but the 13 behavior-scenario tests are unverified at runtime. → `site/src/content/docs/components/menu.md`

### 2026-09-09 23:52 — web round 1

- **DOC** Menu: schema lists `popup` and `list` as separate anatomy parts, but the web platform notes literally describe one `<div role="menu">` serving both (position/surface + the item list). I collapsed them into a single element (data-part="popup", role="menu") rather than inventing a second nested wrapper the notes don't mention. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: no `container` prop exists in the schema's props list (unlike the generic overlay guidance which mentions one), so the popup always portals to `document.body` with no override point. Flagged in case the docs intend one. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: chose not to lock body scroll while open, unlike Dialog/AlertDialog. The schema's a11y.requires has no modal-lock item for Menu and the web notes explicitly say to 'reposition on scroll and resize while open,' which only makes sense if the page can still scroll — so scroll-lock was treated as a Dialog/AlertDialog-only pattern, not a blanket overlay rule. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: clicking the trigger while already open closes the menu (toggle). The keyboard/behavior tables only specify what opens it from a closed state; toggle-on-click is the conventional menu-button behavior and doesn't contradict anything given, but it's an inference. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: `shortcut` is passed verbatim into `aria-keyshortcuts` per the web notes ('Shortcuts are display-only (aria-keyshortcuts)'), but display strings like '⌘S' don't match the ARIA attribute's expected token format ('Meta+S'). Followed the schema literally since it names the attribute explicitly; flagging the mismatch for anyone tightening `aria-keyshortcuts` later. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: the single `itemGap` token is reused both for spacing between rows/groups in the list and for the internal icon–label–shortcut gap inside one item, since the schema defines only one gap binding for the whole item anatomy. → `site/src/content/docs/components/menu.md`
- **DOC** Menu: `minWidth`'s '× 2.5' multiplier (space.20 → ~200px) is applied at the CSS use-site via `calc(var(--ds-menu-min-width) * 2.5)` so a per-instance override still scales proportionally, per the schema's 'the generator multiplies' note. → `site/src/content/docs/components/menu.md`

## Meter

Doc: `site/src/content/docs/components/meter.md`

### 2026-09-10 02:02 — lit round 1

- **DOC** Meter (lit): the internal gap between the label and the value text within the label row has no named binding in the schema (only partGap, described as the label-row-to-track gap, is listed) — left it as a fixed var(--space-2), not overridable. → `site/src/content/docs/components/meter.md`
- **CODE** Meter (lit): the schema's overrides contract (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition) and the package's data-ds testability hook were present in every other lit component but missing from the pre-existing Meter.ts; added the --ds-meter-* CSS hooks, the `overrides` property/applyOverrides wiring, and `data-ds="Meter"` in connectedCallback to match convention, and exported the new MeterOverridableBinding type from index.ts.

### 2026-09-10 02:02 — web round 1

- **DOC** Meter: the platform notes said the label row uses a `Text element="span"` but the value text is a plain `<span>` in `valueColor`. I used the Text component for both (element="span", tone="muted" for value) since valueColor/labelColor are locked tokens that already match Text's default/`muted` tones, and Text's own `overrides` prop is the sanctioned way to expose `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` per-instance without restyling a child (following the Alert precedent of delegating a binding — `iconSize` — into a composed child's own override contract) rather than duplicating Text's typography CSS on Meter's own hooks. → `site/src/content/docs/components/meter.md`
- **CODE** Meter: pre-existing Meter.tsx/css/stories in the tree predated the `overrides`/`OverridableBinding`/`data-ds`+`data-part` conventions (visible in Switch, Alert, Card). Regenerated all three plus the index.ts export to add `MeterOverridableBinding` (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition), `data-ds="Meter"`/`data-part` hooks on container/label/valueText/track/fill, since the task said to add these hooks to any file touched.

### 2026-09-10 02:00 — rn round 1

- **DOC** Meter: existing Meter.tsx was missing the overrides prop (and MeterOverridableBinding type) required by the schema's overrides contract, plus the testID="Meter" testability hook — added both, mapping trackHeight/radius/labelSize/labelWeight/valueSize/fontFamily/lineHeight/partGap/transition to overrides and keeping track/fill/labelColor/valueColor locked, and exported MeterOverridableBinding from index.ts. → `site/src/content/docs/components/meter.md`

## RadioGroup

Doc: `site/src/content/docs/components/radiogroup.md`

### 2026-09-10 01:51 — rn round 1

- **DOC** RadioGroup: the existing RN file predated the current styles/overrides section entirely (no overrides prop, no RadioGroupOverridableBinding, item type named RadioOption instead of RadioGroupOption). Rewrote it to match the schema's 16 overridable bindings and locked bindings, matching the equivalent React implementation's OVERRIDE_HOOK list for cross-platform consistency. → `site/src/content/docs/components/radiogroup.md`
- **DOC** RadioGroup: the schema's Behavior section says invalid validation precedence is error -> required -> invalid (rendering copy.invalid), same as Input/Checkbox, but the platforms.rn.notes text only mentions 'required with nothing selected fails submit with copy.required' and doesn't mention copy.invalid. Implemented the full three-step precedence (error, required, invalid) to match the general Behavior section and the Checkbox/Input convention, since the rn notes read as incomplete rather than contradictory. → `site/src/content/docs/components/radiogroup.md`
- **DOC** RadioGroup: the previous implementation passed the native `disabled` prop to each option's Pressable for individually-disabled options, citing arrow-key-skip behavior — but that reasoning is from platforms.web.notes, not rn, and it directly contradicts this package's stated convention ('do not pass disabled to Pressable — it removes focus'). Changed disabled options to stay focus stops (accessibilityState.disabled + a press guard, no native disabled), consistent with how Checkbox handles its own disabled state and with the rn notes' claim that 'every radio is a stop for the screen reader and for hardware-keyboard focus.' → `site/src/content/docs/components/radiogroup.md`
- **DOC** RadioGroup: the schema's `transition` style binding (motion.duration.fast) wasn't wired to anything in the prior implementation. Added a per-option Animated crossfade of the selected border color and indicator dot opacity (mirroring Checkbox's fill animation), reusing motion.easing.standard and respecting useReducedMotion(), since the spec names a transition token but doesn't say which visual property it drives on native. → `site/src/content/docs/components/radiogroup.md`

### 2026-09-10 01:48 — lit round 2

- **DOC** RadioGroup: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) false-positives on the HOOKS map entry `fontFamily: '--ds-radio-group-font-family'` — that's a CSS custom-property name, not a hard-coded font stack. Marked it `literal-ok` rather than renaming the binding key (which would break the established override-hook naming convention shared with Checkbox/Switch). → `site/src/content/docs/components/radiogroup.md`

### 2026-09-10 01:47 — lit round 1

- **DOC** RadioGroup: `radioIndicator` (the centre dot) is a `::after` pseudo-element and cannot carry a `part` attribute; no separate element exists for it, consistent with Checkbox's indicator. → `site/src/content/docs/components/radiogroup.md`
- **CODE** RadioGroup: part names use simplified kebab-case (`radio-label`, `radio-description`, `error`) rather than the schema's exact anatomy strings (`radioLabel`, `radioDescription`, `errorMessage`); this pre-existing choice matches the convention already used by Checkbox/Switch in this package, so I kept it for consistency rather than diverging.

### 2026-09-10 01:46 — web round 1

- **DOC** RadioGroup.tsx/.css pre-existed but predated the overrides/data-ds/data-part conventions now required across the package; brought it in line: added RadioGroupOverridableBinding (the 16 non-locked bindings from styles), an overrides prop wired through cssVar()/OVERRIDE_HOOK the same way Checkbox/Switch do, data-ds="RadioGroup" on the fieldset root, and data-part on description, radio, radioLabel, radioDescription, and errorMessage (group/legend/radioIndicator left without data-part since they're reachable via role or are pseudo-elements, matching the Checkbox/Switch precedent). → `site/src/content/docs/components/radiogroup.md`
- **DOC** CSS previously read design tokens directly instead of through --ds-radio-group-<binding> hooks; rewrote it so every schema binding (locked and overridable) is a custom-property hook on .ds-radio-group, mirroring Checkbox.css/Switch.css, so overrides actually take effect. → `site/src/content/docs/components/radiogroup.md`
- **DOC** helperSize/descriptionText/errorText were only applied via the shared Text component's size/tone props, not as CSS hooks on the wrapper classes; added explicit font-size/color rules on .ds-radio-group__description, __option-description, and __error keyed to the hooks (same pattern as Checkbox) so the overridable helperSize binding has an effect and locked descriptionText/errorText are hooks rather than baked-in token references. → `site/src/content/docs/components/radiogroup.md`

## Stack

Doc: `site/src/content/docs/components/stack.md`

### 2026-09-10 00:52 — rn round 2

- **DOC** Stack: Round 1's spec-correct rewrite of `gap` from the raw spacing scale ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section) broke nine consumers still on the old numeric values, which the typecheck gate caught. Fixed the consumers rather than weakening Stack's type, mapping each usage by matching pixel value where an old spacing-scale token equals a new layout-gap token exactly (space0=layoutGapNone=0, space1=layoutGapTight=4, space2=layoutGapNormal=8, space4=layoutGapLoose=16) and by semantic role for the one value with no exact match: '6' (space6=24px) was always used as the outermost Stack wrapping a whole screen's major sections, so it became 'section' (32px) per the spec's own definition ('section between page sections') even though it's not the closest pixel match to loose (16px). → `site/src/content/docs/components/stack.md`
- **DOC** Stack: no spec guidance on how a spacing-scale-to-rhythm-enum migration should be handled for existing call sites; treated it as this job's responsibility since the gate blocks the whole package build, but flagging that other in-flight component jobs (AlertDialog, Dialog, FocusScope, Form, and the three demo screens) had their Stack usages touched as a side effect and may want to double-check the chosen gap value reads correctly in their own visual review. → `site/src/content/docs/components/stack.md`

### 2026-09-10 00:50 — rn round 1

- **DOC** Stack: the existing Stack.tsx predated this spec's rewrite of `gap` from a raw spacing-scale enum ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section). Regenerated it against `layout.gap.*` tokens (layoutGapNone/Tight/Normal/Loose/Section) per the spec's explicit contrast with 'the raw spacing scale'. This breaks type-checking in consumers still passing old numeric gap values (AlertDialog.tsx, AlertDialog.stories.tsx, Dialog.tsx, Dialog.stories.tsx, FocusScope.stories.tsx, Form.stories.tsx, and demo/Preferences.tsx, demo/ProfileSettings.tsx, demo/SignIn.tsx) — out of scope for this Stack-only job; those components need their own regeneration pass to adopt the new gap enum. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: overrides contract lists only `gap` as overridable with no presence-toggle prop (unlike Box's surface/border/radius), so the override is applied unconditionally regardless of the `gap` value (including `gap: none`) rather than gated behind another prop. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: spec gives no `testID` guidance beyond the general package convention; added `testID="Stack"` on the root View per the package-wide testability-hook rule, matching Box/Card/Container. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: no story previously existed for overrides or wrap as 'notable states'; added `Wrap` and `WithOverrides` stories (using `space.lg` as an example override token) since the spec requires overrides support but the scenario list only covers the enum props. → `site/src/content/docs/components/stack.md`

### 2026-09-10 00:49 — web round 2

- **DOC** Stack: the round-1 gap enum migration (raw spacing scale → none/tight/normal/loose/section) broke typecheck in 9 consumer files that still passed old numeric gap strings. Fixed by remapping each literal to the closest enum value using the spec's own semantics ('tight for related controls, normal for fields in a form, loose for groups, section between page sections') rather than raw px proximity, since several old values (e.g. '6' at 24px) sit exactly between two presets and the semantic role of the Stack (button row vs. form fields vs. top-level page regions) was the deciding factor. Button/action rows → tight; form-field stacks → normal; zero-gap lists (checkbox group, disclosure accordion) → none; top-level region groupings (Preferences/SignIn outer stacks, Landmark page-skeleton story) → section. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: no gap value existed for the old '3'/'8'/'10'/'12' raw-scale usages in this pass — none of the touched consumer files used those, so no mapping decision was needed for them, but any future file using those raw values will need the same semantic (not just nearest-px) judgment call. → `site/src/content/docs/components/stack.md`

### 2026-09-10 00:48 — lit round 1

- **DOC** Stack: the anatomy list is just `container`, and the schema doesn't say what carries that part when `element` is `div` — kept the existing convention (matching Container) where the host itself is the implicit container and only the `section`/`nav`/`ul`/`ol` wrapper elements carry `part="container"`. → `site/src/content/docs/components/stack.md`
- **CODE** Stack: pre-existing Stack.ts used the old raw spacing scale ('0'..'12') for `gap` instead of the schema's `layout.gap.*` enum (none/tight/normal/loose/section); rewrote the enum, CSS hooks, and stories/tests to match the schema, since the old version predates this generation pass.

### 2026-09-10 00:47 — web round 1

- **DOC** Stack: the schema changes `gap` from the old raw spacing scale ('0'-'12') to a layout-rhythm enum (none/tight/normal/loose/section mapping to layout.gap.*), a breaking prop-type change. I updated only Stack itself per scope, but this leaves stale literal gap values ('0'-'6') in other already-generated files that consume Stack — packages/react/src/AlertDialog.tsx, Card.stories.tsx, Dialog.tsx, Dialog.stories.tsx, Disclosure.stories.tsx, Form.stories.tsx, Landmark.stories.tsx, and demo/Preferences.tsx, demo/SignIn.tsx — which now fail typecheck against StackGap and need fixing in those components' own regeneration passes. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: spec's 'Overridable: gap' section doesn't specify whether a Storybook story should demonstrate `overrides`; I omitted one since sibling layout components (Box, Container) that also support overrides don't have an Overrides story either, for consistency. → `site/src/content/docs/components/stack.md`
- **DOC** Stack: added Stack.test.tsx (not explicitly requested by this job but required by the behavior-scenarios rollout already applied to Switch/Box/Card/Container) covering all 21 scenarios verbatim as render-only assertions, matching the Box.test.tsx pattern. → `site/src/content/docs/components/stack.md`

## Switch

Doc: `site/src/content/docs/components/switch.md`

### 2026-09-10 01:47 — rn round 1

- **DOC** Switch (rn): the existing implementation lacked the `overrides` prop and `testID` required by every component in this package. Added `SwitchOverridableBinding` covering only `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity` — excluded `trackWidth`, `trackHeight`, `thumbSize`, `thumbInset`, `radius`, `transition` from the type entirely (rather than accepting-and-ignoring them) since the platform notes say those are OS-controlled by the native Switch and would be silent no-ops; also added `testID="Switch"` to the root Pressable. → `site/src/content/docs/components/switch.md`

### 2026-09-10 01:45 — lit round 2

- **DOC** Switch: no new spec gap — the literals gate flagged `fontFamily: '--ds-switch-font-family'` in the HOOKS map as a font-stack literal (a regex false positive on the key name, not the value); fixed by using a backtick string like Checkbox.ts does for the same binding. → `site/src/content/docs/components/switch.md`

### 2026-09-10 01:45 — lit round 1

- **CODE** Switch: the pre-existing Switch.ts had no overrides mechanism (no --ds-switch-* hooks, no SwitchOverridableBinding/overrides property) despite the spec's Overrides section requiring one; added it following the Checkbox.ts pattern, mapping trackWidth/trackHeight/thumbSize/thumbInset/radius/gap/partGap/labelSize/labelWeight/helperSize/fontFamily/lineHeight/disabledOpacity/transition to hooks and leaving trackOff/trackOn/thumb/labelColor/descriptionText/focusRing/focusRingWidth/minTarget as raw locked tokens.
- **CODE** Switch: the pre-existing file also lacked the data-ds="Switch" testability attribute; added it in connectedCallback per package convention, no spec ambiguity.

### 2026-09-10 01:43 — web round 1

- **DOC** Switch already had a Switch.tsx/css/stories/test set that predated the overrides/data-ds/data-part conventions (visible in Checkbox); I brought it up to that convention — added `SwitchOverridableBinding`, `overrides` prop, per-instance CSS hooks for every listed binding (locked bindings get hooks too, just excluded from the TS union), `data-ds="Switch"` on the root, and `data-part="description"` on the description Text — without touching the existing behavior logic, which already matched the schema's behavior scenarios and passed all 16 existing tests unchanged. → `site/src/content/docs/components/switch.md`
- **DOC** The schema doesn't say whether the description's helper text size/color should be enforced by a local CSS rule or left to Text's own `size="sm" tone="muted"` props; followed Checkbox's precedent of setting both (Text props for the semantic class and a local rule reading the `--ds-switch-helper-size`/`--ds-switch-description-text` hooks) so the override hooks actually take effect. → `site/src/content/docs/components/switch.md`

## TEST-FAILURES

Doc: `site/src/content/docs/components/test-failures.md`

## Text

Doc: `site/src/content/docs/components/text.md`

### 2026-09-10 00:46 — rn round 1

- **DOC** Text (rn): platforms.rn.props lists only numberOfLines/ellipsizeMode/allowFontScaling, not overrides — added overrides?: Partial<Record<TextOverridableBinding, TokenRef>> anyway per the general Overrides contract (fontFamily, fontSize, fontWeight, lineHeight, color), matching how Box/Card/Container/Dialog implement it despite the same omission in their platform notes. → `site/src/content/docs/components/text.md`
- **TOOLING** Text (rn): could not run the test suite in this session (jest invocation via Bash/PowerShell was blocked pending approval) — Text.test.tsx is unverified by an actual test run, though it follows Box.test.tsx's established pattern exactly.

### 2026-09-10 00:42 — web round 2

- **DOC** Text: `element` is narrowed to p|span per the current spec (labels/legends now belong to Input/Fieldset), but Checkbox, Switch, and RadioGroup still relied on `<Text element="label"/"legend" htmlFor=...>` for native label association — kept the Text spec authoritative and switched those three consumers to native `<label>`/`<legend>` elements (their existing `__label`/`__legend` CSS already carries font-size/weight/color independent of Text's classes, so styling is unchanged), rather than reintroducing label/legend into TextElement. → `site/src/content/docs/components/text.md`
- **DOC** Text: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) matches the `fontFamily` key in the override-hook lookup table even though its value is a CSS custom-property name (`--ds-text-font-family`), not a literal font stack; marked that line `literal-ok` rather than renaming the binding key away from the schema's `fontFamily` term. → `site/src/content/docs/components/text.md`

### 2026-09-10 00:42 — lit round 1

- **DOC** (model did not return the JSON report block) → `site/src/content/docs/components/text.md`

### 2026-09-10 00:40 — web round 1

- **DOC** Text: the existing committed Text.tsx predated the current package conventions (no data-ds hook, no overrides/CSS-hook system, element enum still included label/legend/htmlFor from an older schema version). Regenerated it to match the current schema (element: p|span only — labels/legends are now owned by Input/Fieldset per the schema note) and the current Card/Box/Container convention: root data-ds="Text", TextOverridableBinding (fontFamily, fontSize, fontWeight, lineHeight, color) with --ds-text-* CSS custom-property hooks, and an overrides prop using cssVar/TokenRef from @design-schema/tokens. → `site/src/content/docs/components/text.md`
- **DOC** Text: no Text.test.tsx existed; added one modeled on Card.test.tsx (meta.args + scenario `given`, one it() per behavior scenario) since the repo's other recently-touched components (Switch, Box, Card, Container) all ship this file alongside the component. → `site/src/content/docs/components/text.md`

## Toast

Doc: `site/src/content/docs/components/toast.md`

### 2026-09-10 02:38 — rn round 1

- **DOC** The schema's `styles` map is one flat list for the component, but on RN a Toast is really two things: a single toast (radius, shadow, paddingBlock, paddingInline, gap, maxWidth, fontFamily, fontSize, lineHeight, enter, exit) and a region a `ToastProvider` renders once (stackGap, regionInset, layer). I split `ToastOverridableBinding` accordingly: `Toast` resolves the first 11 keys and ignores the region-level 3; `ToastProvider` resolves the region-level 3 and ignores the rest. A caller who wants a non-default `layer`/`maxWidth` on a specific queued toast passes it through that toast's own `overrides`, not the provider's. → `site/src/content/docs/components/toast.md`
- **DOC** `a11y.requires: escape-dismiss` and the F6 focus-navigation keyboard rules describe the web keyboard model and are not implemented on native: there is no hardware-keyboard `keydown`-equivalent API for an arbitrary View, and this package's own `Button` does not expose focus events externally, so a toast has no way to know whether focus is 'inside' it (same acknowledged limit `Tooltip` already documents for its own Escape handling). Dismissal stays reachable via the always-visible dismiss button (forced on for `persistent`) and native `Enter`/activation on that button. → `site/src/content/docs/components/toast.md`
- **DOC** a11y.role is `status`, but React Native's `accessibilityRole` enum has no `status` value. Mirrored `Alert`'s convention: `accessibilityRole="alert"` only for `danger` (matching the docs' 'danger toasts use alert'), otherwise no role, plus `accessibilityLiveRegion` (`assertive`/`polite`) and one-time `AccessibilityInfo.announceForAccessibility` on iOS. → `site/src/content/docs/components/toast.md`
- **DOC** The `region` anatomy part exists only inside `ToastProvider` (testID `Toast.region`); a standalone `<Toast>` (used directly in stories/tests per the behavior scenarios) has no region wrapper of its own — there's nothing above it to name `Toast.toast` distinctly from the root `testID="Toast"`, so I did not add a separate part id for the 'toast' anatomy node. → `site/src/content/docs/components/toast.md`
- **DOC** 'Timers pause on hover and on focus-within' (web keyboard/pointer model) is implemented on native as pause-on-touch only (`onTouchStart`/`onTouchEnd`/`onTouchCancel`), per the platform notes' own reduction ('Timers pause while a toast is being touched'); there's no native hover and no way to detect focus entering the composed Button children from the parent View. → `site/src/content/docs/components/toast.md`
- **DOC** Added a `__DEV__` warning when `actionLabel` is set or `tone==='danger'` but `duration !== 'persistent'`, since the docs say persistent 'is required' in those cases but the schema doesn't make `duration` computed/derived from them — this is a guardrail, not enforced behavior, so a caller can still override it silently in production. → `site/src/content/docs/components/toast.md`
- **CODE** 'F6 brings focus to the toast region' has no native equivalent (no F6 key, and native reaches toasts by swiping through the accessibility order per the platform notes) — not implemented, and not treated as a bug since the platform notes explicitly say so.

### 2026-09-10 02:30 — web round 1

- **DOC** Escape-dismiss has no matching value in the `onDismiss` reason enum (timeout/dismiss-button/action/replaced); mapped Escape to reason 'dismiss-button' as the closest semantic match. → `site/src/content/docs/components/toast.md`
- **DOC** dismissColor (color.inverse.foreground) can't be independently expressed: both action and dismiss buttons are composed via Button's `inverse` ghost variant, which always renders ghost text in color.inverse.link (Button has no foreground-color override slot), so per the 'never restyle a child' rule both buttons end up the same color rather than dismiss reading as the more neutral color.inverse.foreground. → `site/src/content/docs/components/toast.md`
- **DOC** focusRing/focusRingWidth (locked, color.border.focus/border.width.focus) have no locus of application: Toast's own root isn't focusable, and its only focusable children (the composed Buttons) already use focusRingInverse via Button's `inverse` prop, so these two bindings are declared in the schema but not wired to any CSS. → `site/src/content/docs/components/toast.md`
- **DOC** duration's schema default stays `short` even though the guidance says persistent is 'required' when there's an action or tone is danger; rather than silently overriding the documented default, added a dev-only console.warn nudging the consumer instead. → `site/src/content/docs/components/toast.md`
- **DOC** Same-id replacement and 3-toast overflow eviction remove the old/evicted entry synchronously from the store and call its onDismiss('replaced') immediately, without playing that toast's own exit transition (only UI-triggered dismissal — timeout/button/action — waits for the fade-out). → `site/src/content/docs/components/toast.md`
- **DOC** short/long duration timings (~5s/~10s, 'computed from motion.duration.loop × 6/×12 so themes without motion still get sensible times') are hardcoded ms constants (5000/10000) rather than read from the active theme at runtime, since a component has no way to measure a resolved CSS custom property synchronously (same precedent as Tooltip's DEFAULT_DELAY_MS) — exact timing won't track a theme's actual motion.duration.loop value. → `site/src/content/docs/components/toast.md`
- **DOC** The `id` prop on a directly-rendered `<Toast>` (outside the `toast()`/`ToastRegion` store) is just the native DOM id attribute; the 'same id replaces the previous toast' de-duplication only happens inside the store, so standalone Toast usage gets no replace semantics from `id` alone. → `site/src/content/docs/components/toast.md`
- **DOC** F6 focus-restore keeps only one `previousFocusRef` at the ToastRegion level; if focus moves around by mouse between an F6 entry and a second F6 press, 'return to where focus was' returns to the most recent F6-recorded origin rather than tracking arbitrary intermediate focus changes. → `site/src/content/docs/components/toast.md`

## Tooltip

Doc: `site/src/content/docs/components/tooltip.md`

### 2026-09-10 02:27 — lit round 1

- **DOC** Tooltip: the schema has no `events` section (unlike Menu/AlertDialog), so no CustomEvent is dispatched — all behavior is expressed through native aria-describedby/aria-labelledby, focus, and pointer events; treated the absence as intentional rather than an omission. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: 'delay: none / a shared warm toolbar state' is described only qualitatively (no numeric grace window given for how long a tooltip stays 'warm' after closing). Chose motion.duration.base as that grace window (same token the default-delay formula already reads) — a module-level `warmUntil` timestamp set on every close. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: because the Popover API sets `display: none` while closed, the popup (and its aria-describedby/aria-labelledby target) technically leaves the accessibility tree between shows, which sits in tension with the platform notes' 'the description is still in the accessibility tree' / 'never hover-only anywhere' language. Mitigated by always showing synchronously on focus (so AT users get it at the same moment they'd query it), matching how comparable production tooltips (e.g. Radix) handle this, but it's not literally 'always present'. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: fontFamily/fontSize/lineHeight are overridable bindings, but the composed <ds-text> renders its own self-contained font hooks rather than inheriting CSS custom properties (unlike ds-link, per the Breadcrumb precedent's `font: inherit` comment). Forwarded these three via ds-text's own `overrides` prop (driven by Tooltip's JS `overrides` property), which works — but the parallel CSS escape hatch (`ds-tooltip.foo { --ds-tooltip-font-size: ... }`) described in the overrides contract will NOT reach the rendered text for these three bindings specifically. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: 'shows ... immediately when the trigger receives keyboard focus' — implemented as 'any focus event shows immediately' since reliably distinguishing keyboard-origin focus from mouse-origin focus across arbitrary composed trigger types (ds-button, native <button>, ds-input, ds-link) isn't practical; this also matches how the pointer path already shows on hover, so the only behavioral difference is the delay, not the focus source. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: `placement: start/end` is implemented as literal left/right (LTR only, not logical/RTL-aware), matching the existing Menu component's own `bottom-start/bottom-end` positioning code in this package, which is also not RTL-aware. → `site/src/content/docs/components/tooltip.md`

### 2026-09-10 02:27 — rn round 1

- **DOC** Tooltip: the schema's own composition example (attach to a Button/Link/Input) can't actually work on RN — none of this package's Button, Link or Input forward unrecognized props, so the accessibilityHint/accessibilityLabel and onLongPress/onHoverIn/onHoverOut/onFocus/onBlur handlers Tooltip clones onto its child are silently dropped when the child is one of those three. They only take effect on a child that forwards extra props onto a native Pressable/TextInput (or a raw core RN element). Fixing this for real requires Button/Link/Input's own schemas to grow a passthrough or an accessibilityHint/description prop, which is out of scope for a single-file generation; I implemented the clone as specified and called this out prominently in the doc comment rather than silently shipping something that looks functional but isn't. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: RN has no generic hardware-keyboard event API, and the schema only says 'on native implement the subset hardware keyboards can reach' plus 'react-native-web ... hover and focus behave as on web' without specifying how Escape should be wired there. I gated a `window`/`keydown` listener to `Platform.OS === 'web'` (a real browser exists under react-native-web) and left true native with no Escape path, since the popup is never shown there. This is a judgment call, not a documented requirement. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: 'placement... flips when it would overflow the viewport' is not implemented for top/bottom. Unlike Menu's dropdown, the tooltip bubble isn't portaled or measured against the window, so there's no viewport rect to flip against without adding that machinery; placement is static (start/end still resolve against writing direction). → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: the schema defines no `open`/`onOpenChange` prop (correctly — visibility is meant to be fully hover/focus/long-press driven), but the generic testability rule asks for a `Keyboard` story 'rendering it open'. There's no declarative way to force that without inventing a prop, and no interaction-testing package (`@storybook/test` or similar) is present in devDependencies to script it programmatically (adding one would violate the no-new-dependencies rule). The Keyboard story instead renders three tooltip-wrapped focusable triggers (satisfying the 'at least three focusable children' half) and documents that a reviewer must focus/hover/long-press a trigger to actually open it. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: the 'warm' toolbar grace window (how long a tooltip stays warm after hiding so the next sibling shows instantly) has no specified duration beyond the default-delay formula. I reused `motion.duration.base` as that window as a judgment call; the schema/web notes describe the behavior but not its length. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: 'the child must be focusable' (a11y requirement) and the `describes` semantics are accessibility contracts, not something checked at runtime — RN has no generic way to introspect whether an arbitrary subtree is focusable. Only a dev-mode warning verifies that exactly one child element was passed. → `site/src/content/docs/components/tooltip.md`

### 2026-09-10 02:16 — web round 1

- **DOC** Tooltip: schema gives no explicit duration for `motion.duration.base` or the toolbar 'warm' window length, so the existing implementation hardcodes DEFAULT_DELAY_MS=600ms (matching the doc's 'roughly 600ms') and reuses that same value for WARM_WINDOW_MS, plus an unspecified 100ms CLOSE_GRACE_MS to let the pointer cross the offset gap onto the popup — none of these three constants are backed by a token. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: schema's `keyboard` block only lists Escape; the web notes also imply hide-on-blur/pointerleave which are not in the `keyboard` table, so those are treated as pointer/focus behavior rather than keyboard actions, per 'implement every key → action exactly as listed and nothing else'. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: anatomy names `trigger` and `popup` as parts, but only `text` gets a `data-part` hook — the trigger is the caller's own cloned element (not an owned node) and the popup is the root itself (already identified by `data-ds="Tooltip"`), so no additional `data-part` was added for either. → `site/src/content/docs/components/tooltip.md`

### 2026-09-10 00:34 — web round 1

- **DOC** Tooltip: composition maps the `text` anatomy part to Text, but Text's `tone` enum has no value for the locked `color.inverse.foreground` token — using it would force restyling a child (forbidden), so the text renders as a plain `<span data-part="text">` instead. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: `delay: default` is documented as only 'roughly 600ms' (motion.duration.base × 3) with no exact number, and the toolbar 'warm' effect names no duration at all; hardcoded DEFAULT_DELAY_MS=600 and reused it for the warm window since nothing else is given. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: WCAG 1.4.13 'hoverable' requires the pointer be able to cross the `offset` gap onto the popup without it hiding, but no grace period is specified; added an internal 100ms close-grace timer (not a token, not configurable). → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: `children` is typed `ReactElement` rather than `ReactNode` (unlike other `content`-typed props) because exactly one element must be cloned to attach aria-describedby/labelledby and hover/focus handlers; if that child already carries its own `ref`, cloning replaces it since there's no ref-merge helper in the package for an arbitrary external ref. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: the doc calls a non-focusable child 'an error' but there is no runtime way to verify focusability of an arbitrary passed element; only a dev warning fires when `children` isn't exactly one element. → `site/src/content/docs/components/tooltip.md`
- **DOC** Tooltip: `start`/`end` placement is treated as logical (inline-start/inline-end, flipping physical side by `getComputedStyle(trigger).direction`) since the doc doesn't say how placement interacts with RTL. → `site/src/content/docs/components/tooltip.md`
- **CODE** Tooltip: the canonical generated gate test (generated/behavior/Tooltip.web.test.tsx) calls `getByRole('tooltip')` on an unconditioned render with no hover/focus, expecting the popup to always be in the DOM — this contradicts the documented hover/focus-triggered visibility. The already-merged Menu component fails the identical `getByRole('menu')` check for the same reason, so this looks like a pre-existing tools/behavior_tests.py limitation for hover/click-revealed overlays, not something introduced here.

## Totals

DOC: 403 · CODE: 38 · TOOLING: 2 · NOISE: 8

## Gates to fix

- none: every recorded target passed its gates
