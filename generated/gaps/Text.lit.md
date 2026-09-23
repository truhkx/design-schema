# Gaps reported while generating Text for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:42 — round 1

- (model did not return the JSON report block)

## 2026-09-16 01:58 — round 1

- Text: `color` is locked, but three components need Text on an inverse surface (Toast message, Tooltip popup, Slider value bubble) where the binding is `color.inverse.foreground`, and `tone` has no `inverse` value. `onAction` is not a substitute: in dark mode `--color-foreground-on-action` is neutral-0 while `--color-inverse-foreground` is neutral-900, so swapping it would put white text on a light inverse surface. Chose to drop the color forward in those three and re-scope `--color-foreground: var(--color-inverse-foreground)` on the parent's container, which keeps the pixels and touches no part of the child. Text's `tone` should gain an `inverse` value (or those three should own their text).
- Text: the overrides contract says locked bindings are 'not in the type and are ignored', but those two clauses conflict — excluding `color` from `TextOverridableBinding` makes a forwarded `{ color: … }` a compile error, not a silent no-op. That is exactly how the three components above broke. Chose 'not in the type'; the doc should say which one wins for composed parents.
- Text: `platforms.lit.notes` asks the host to be `display: contents` for `span` and block otherwise, but `element` is not in `platforms.lit.reflect`, so the display can only be set as an inline style on the host. An inline `display: contents` beats `:host([hidden]) { display: none }`, so `hidden` does not hide a `<ds-text element="span">`. Chose the inline style (and removed it for `p`); the doc should either add `element` to `reflect` so a `:host([element='span'])` rule can do it, or drop the `display: contents` requirement.
- Text: the doc does not say how `truncate` behaves with `element: span`. A one-line ellipsis needs a block-ish box, so chose `display: inline-block; max-inline-size: 100%; vertical-align: bottom` for the truncated span — which means the clipping width comes from the parent's box, not from the span's inline run.
- Text: `truncate` says the full text goes to `title` 'when children is a plain string; otherwise the consumer passes `title`'. A Lit slot has no 'plain string' state — chose to derive `title` from the host's flattened `textContent` on `slotchange` (whitespace-collapsed) and to omit `title` when that is empty, so a slot containing elements still gets a `title`, unlike web. Worth stating for lit explicitly.
- Text: the `truncated-text-keeps-the-full-string-reachable` scenario is scoped `platforms: [web]`, so no lit test asserts it, even though `ds-text` is a web platform and implements `title` identically. Left untested rather than inventing a scenario; the doc should add `lit` to that scenario's platforms if the assertion is meant to hold here.
- Text: `children` is a required `content` prop, which on lit is the default slot and cannot be an arg. The stories model it as a separate `text` arg and the behavior-test harness skips that key when assigning properties — so the derived scenarios never exercise slot content. A slot-content convention for `content` props would make these tests mean something.

## 2026-09-17 03:54 — round 1

- Text: the Lit platform note says to render `part="text"`, the Lit guidance says it is 'for outside styling', but the package rule is that no `::part` is exposed for styling. I kept `part="text"` as an anatomy name only and ship no part-based styling; the guidance sentence should drop 'for outside styling'.
- Text: the behavior scenario `truncated-text-keeps-the-full-string-reachable` is limited to `platforms: [web]`, but the `truncate` description gives Lit its own title rule (flattened, whitespace-collapsed textContent, omitted when empty). So Lit has no test for a behavior it is required to have. I implemented it and wrote no test; the scenario should list `lit` too.
- Text: the spec says `title` comes from the host's textContent but not when it must update. `slotchange` does not fire when the text inside an existing node changes. I added a MutationObserver (childList + characterData, subtree) that only updates state; the doc should say the title follows live text edits.
- Text: `align` says start/end follow writing direction and describes Native's I18nManager limitation, but says nothing for Lit. I used CSS `text-align: start|end`, which follows `dir` live.
- Text: `styles.color` is interpolated (`color.foreground.{tone}`) and locked, but the doc doesn't give a hook name or say that `default` resolves to the bare `--color-foreground` custom property, the one inverse surfaces re-scope. I read the token directly with no `--ds-text-color` hook, and `default` reads `var(--color-foreground)`.
- Text: the doc doesn't say how `onAction` maps to a CSS custom property. I used `--color-foreground-on-action` (camelCase to kebab-case).

## 2026-09-18 12:23 — round 1

- Text: `truncate` says 'A consumer `title` always wins and is forwarded unchanged' right before 'On Lit there is no plain string state', so it is unclear whether the consumer-title rule applies to Lit. `title` is also a native HTMLElement member, and the conventions forbid it as a prop name. Chose: no `title` property; a `title` attribute the consumer puts on the host is observed and copied unchanged to the `part="text"` element, where it wins over the textContent-derived title with or without truncate. The host keeps its own attribute too, so the native tooltip is the same either way.
- Text: the behavior scenario `truncated-text-keeps-the-full-string-reachable` says `attribute: title` but doesn't say which element carries it. On Lit it goes on the shadow `part="text"` element (per the truncate description), not the host, so the test asserts on `[data-part="text"]`. The scenario could name the part.
- Text: `anatomy: [text]` and the web notes say the React root has no `data-part` (composing parents pass their own), but the Lit notes only mention `part="text"`. Chose: the Lit shadow element carries both `part="text"` and `data-part="text"`. It is inside the shadow root, so it can't collide with a parent's part name on the host.
- Text: the `onAction` tone description says its story paints `color.action.primary.background` behind the Text, but gives no inset for that surface. Chose `<ds-box inset="md">` inside a wrapper painted with that token.
- Text: the examples' `given` uses `children`, which is a slot on Lit. The story arg is named `children` and rendered as the slotted text, so each example's args match its `given` exactly.

## 2026-09-18 12:33 — round 2

- Text: the round-2 keyboard-run and axe gates fail only in other Lit components (Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip, Tree keyboard specs; DataGrid, Feed, Listbox, NumberInput, Select, SidePanel, Slider, Tabs dark, TreeGrid axe). No Text story fails axe and Text has no keyboard block. The round-1 Text changes (a host `title` forwarded to part=text, data-part=text inside Text's own shadow root) are not reachable from any composite: no Lit component sets `title` on ds-text, and none can query inside Text's shadow root. Chose: no Text code change. The failures need per-component fix jobs. logs/text-gate-ab.mjs (not run here: needed approval) A/Bs the Tree/Toast/Listbox keyboard specs against HEAD's Text.ts to confirm.
- Text: the gates run the whole Lit Storybook, so a single-component generation round cannot turn them green when other components fail. The gate report could be filtered to the stories and specs of the component being regenerated, plus the components that compose it.

## 2026-09-18 12:43 — round 3

- Text: round 3 reports the same keyboard-run and axe failures as round 2, all in other Lit components. The axe rules (aria-hidden-focus, link-name, aria-required-children, target-size, color-contrast) can't fire on Text's single non-focusable <p>/<span>, which carries no aria-hidden, link, role or target. Tabs, whose dark-mode contrast fails, doesn't compose ds-text. Text has no keyboard block. Every Text story passes axe in both modes. Chose: no Text code change, because changing the failing components is outside a Text job. `node logs/text-gate-ab.mjs` (needs approval) A/Bs the Tree/Toast/Listbox keyboard specs against HEAD's Text.ts to confirm.
- Text: the retry loop repeats the same whole-Storybook gate output each round, so a component-scoped generation job can't turn it green or prove it is unrelated. The gate could run only the regenerated component's stories and specs plus its composers, and diff against a stored baseline so failures that were already there aren't charged to this job.

## 2026-09-19 04:38 — round 1

- Text: the only story with a `given` for truncation (truncated-text-keeps-the-full-string-reachable) checks `title` alone; nothing checks that the title follows live text edits (the MutationObserver requirement) or that a consumer `title` on the host wins over the textContent. I did not add tests for these, since the scenario list is the contract.
- Text: the Lit notes say a consumer `title` on the host is copied to `part="text"`, but not whether it should also be removed from the host. Leaving it on the host means the host and the part carry the same tooltip. I kept the host attribute, so the consumer's DOM is not changed.
- Text: `truncate` on web says the React `title` comes from children only when children is a plain string. On Lit it comes from the flattened textContent, so a slotted `<em>` or link still produces a title. The docs describe this, but the two platforms behave differently for rich children, and that difference is not called out.
- Text: the doc gives no children for the enum-value stories. React's Default uses 'Use the email you signed up with.', ToneDanger adds a trailing period ('…name@example.com.') where the InlineErrorWording example has none, and ToneOnAction uses 'Text on an action background'. I copied React's values for parity; the doc should state them so the platforms cannot drift.
- Text: React has a `TruncateInline` story (truncate + element span) that the doc doesn't list as an example. I added it on Lit for parity; if span truncation is part of the contract, it should become a doc example.

## 2026-09-19 04:45 — round 2

- Text: neither failing gate has a Text/Lit entry. The axe run from 04:45 lists only Carousel, DataGrid, Feed, Listbox, NumberInput, Select, Slider, Splitter, Tabs and TreeGrid stories, and there is no generated/keyboard/Text spec. Because these gates run over the whole Storybook, they fail every job until those components are fixed. I did not change Text to answer them.
- Text: the round-1 gaps still apply (whether a consumer `title` stays on the host, rich-children title behavior differing between web and Lit, story children the doc doesn't give, the TruncateInline story the doc doesn't list, and no test for live title updates or consumer-title precedence).

## 2026-09-19 04:53 — round 3

- Text: the gates are unchanged from round 2 and still contain no Text entry. The axe output files (04:52–04:53) have zero `Text/Lit` entries and are the same size as last round's; generated/keyboard has no Text spec. Both gates run over the whole Storybook and fail on Carousel, DataGrid, Feed, Listbox, NumberInput, Select, Slider, Splitter, Tabs and TreeGrid (axe) and on 18 other components' keyboard specs. The runner should run gates for the job's own component, or this job will keep being rejected no matter what Text contains.
- Text: the round-1 gaps still stand (whether a consumer `title` stays on the host, rich-children title behavior differing between web and Lit, story children the doc doesn't give, the TruncateInline story the doc doesn't list, and no test for live title updates or consumer-title precedence).

## 2026-09-23 13:42 — round 1

- Text: the Overrides section says locked bindings still declare their `:host` hook (the CSS escape hatch), but the `color` binding's description says Text has no `--ds-text-color` hook on web or Lit and reads the token directly. I followed the binding description (no hook). The generic Overrides text should name this exception.
- Text: the React `ToneDanger` story's children end in a period ('...name@example.com.'), which contradicts the tone description ('uses the inline-error-wording children verbatim on every platform'). The Lit story now uses the exact string. React is out of step and needs regenerating.
- Text: the truncate description says the host's `title` attribute is 'observed', but not how narrowly. The MutationObserver runs over the host subtree with `attributeFilter: ['title']`, so a `title` change on a slotted descendant also triggers a (harmless) resync. The doc could say to observe only the host's own `title`.
- Text: the Truncate story (as opposed to TruncateInline and TruncatedCell) is not named anywhere in the doc. It exists on React, so Lit keeps it for parity, but its args (truncate plus the behavior scenario's sentence) are inferred rather than specified.
- Text: the doc allows the 24ch truncate-width literal as story scaffolding, but doesn't say whether it needs a `/* literal-ok */` marker in Lit stories. It is left unmarked, matching React.

## 2026-09-23 13:43 — round 2

- Text: the `color` binding description says 'it has no `--ds-text-color` hook on web or Lit: the tone rule reads the token's own custom property directly', which contradicts the general Overrides contract (locked bindings keep their `:host` hook) and the hooks gate. I followed the gate and the general contract: `:host` declares `--ds-text-color` (default `var(--color-foreground)`), each tone sets it per reflected attribute, and the text part reads the hook. The doc's reason for having no hook still holds: the hook resolves against the host's inherited `--color-foreground`, so an inverse surface that re-scopes that property on its container still recolours the default tone. The binding description should drop 'no hook' and say the hook's default is the bare `var(--color-foreground)` (and `--color-foreground-on-action` for onAction).
- Text: the React `ToneDanger` story's children still end in a period ('...name@example.com.'), contradicting the tone description (inline-error-wording children verbatim on every platform). Lit uses the exact string; React needs regenerating.
- Text: the truncate description says the host's `title` attribute is 'observed' but doesn't say how narrowly. The MutationObserver runs over the host subtree with `attributeFilter: ['title']`, so a `title` change on a slotted descendant also triggers a harmless resync. The doc could say to observe only the host's own `title`.
- Text: the `Truncate` story is named nowhere in the doc (only TruncateInline and TruncatedCell are). Lit keeps it for parity with React, with args inferred from the behavior scenario.
- Text: the doc allows the 24ch truncate-width literal as story scaffolding but doesn't say whether Lit stories need a `/* literal-ok */` marker. It is left unmarked, matching React.

## 2026-09-23 18:50 — round 1

- Text: the conventions say a locked binding keeps its `:host` hook, but the `color` styles description says a locked color has no `--ds-text-color` hook on Lit. I followed the component doc (no hook) and dropped the hook the existing element declared; the package conventions text should carve out this case.
- Text: the truncate scenario only checks the title on `part="text"`. Nothing tests that a consumer `title` attribute on the host wins or that the title follows live text edits, and both are specified, so I added no tests for them.
- Text: `TruncateInline` and `Truncate` decorators use a literal `max-inline-size: 24ch`. The doc sanctions this as story scaffolding, but the literal linter is not told, so it may need a `literal-ok` exemption.

## 2026-09-23 18:51 — round 2

- Text: gate `hooks` (tools check_hooks) requires a `--ds-text-color` hook for the locked `color` binding, but the Text doc's `styles.color` description says a locked color has no `--ds-text-color` hook on web or Lit and that the tone rule reads `var(--color-foreground)` / `var(--color-foreground-on-action)` directly. Code follows the doc, so the gate still fails. Either check_hooks needs a per-binding exemption (for example a `hook: none` field on a locked style) or the Text doc must be changed to declare the hook. The prompts/templates lit.md text ('a locked binding keeps its :host hook') has the same conflict with this doc.

## 2026-09-23 18:52 — round 3

- Text: gate `hooks` (check_hooks) still requires a `--ds-text-color` hook for the locked `color` binding, but the Text doc's `styles.color` description says a locked color has no `--ds-text-color` hook on web or Lit and the tone rule reads the token custom property directly. Code follows the doc; the gate will keep failing until check_hooks exempts locked bindings whose doc declares no hook (for example a `hook: none` field), or the doc is changed to declare the hook. prompts/templates/lit.md ('a locked binding keeps its :host hook') conflicts with the Text doc in the same way and needs the same decision.
