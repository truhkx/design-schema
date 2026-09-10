---
title: Generation log
description: What happened each time the prompts were run for React, Lit, and React Native — the gaps the code exposed in the docs, and how each was resolved.
sidebar:
  order: 3
---

The thesis of this system is that documentation good enough to generate correct code from is documentation that cannot rot. The only way to test that is to run the prompts and see what the code has to invent. This page is the record of the first run, on 2026-09-09: six components, three platforms, three independent generators working only from `generated/prompts/`. Each generator returned a numbered list of every place the spec was ambiguous, missing, or contradictory. Seventy-seven items came back. Many appeared on all three platforms independently, which is the strongest signal there is that they were real defects in the docs rather than platform quirks.

## What was wrong in the docs, and what changed

**Contradictions between prop descriptions and style bindings.** Button's `size` said it controlled font size while the styles block fixed `fontSize` to `md`. All three generators noticed and all three followed the styles block. Fixed: `fontSize` now binds `font.size.{size}` and the description matches. The lesson generalizes — the styles block is what generators trust, so descriptions must never promise what a binding does not deliver.

**Anatomy that props could not produce.** Button's anatomy listed `leadingIcon` and `trailingIcon`, and `iconOnly` said "show only the icon", but no prop delivered an icon. React added props, Lit added named slots, React Native declined to invent anything and shipped an `iconOnly` that hides the label and shows nothing. Fixed: `leadingIcon` and `trailingIcon` are content props, decorative and hidden from assistive technology; `iconOnly` specifies equal padding.

**States with no tokens.** Disabled and loading had visual descriptions but nothing to build them from, so the generators reached for `opacity: 0.5`, `150ms`, `800ms`, and a made-up ring size — exactly the literals the rules forbid. Fixed at the theme level: every theme now derives `opacity.disabled`, `motion.duration.{fast,base,loop}`, and `motion.easing.{standard,exit}` from a new `motion` decision (`none | subtle | expressive`). The prompts require them and the generated code was patched to use them.

**Copy nobody owned.** Required-field messages, invalid messages, the required indicator, the error-summary heading: each generator wrote its own words, so the same form would have said three different things on three platforms. Fixed: the schema has a `copy` block of string templates (`{label} is required.`, `{count} problems with this form`), generators must use them verbatim, and localization now has a single place to happen.

**A premise that was technically false.** The Lit note on Form claimed slotted `ds-input` children would participate in a `<form>` inside `ds-form`'s shadow root via `ElementInternals`. Form ownership is DOM-tree based; they do not. The Lit generator worked around it correctly — collect by `name`, submit on a composed `press`, handle Enter manually — and the note now describes that design instead of the wishful one. This is the kind of error only generation catches: it read fine, and it was wrong.

**Event names that collide with native events.** Input mapped `onFocus`/`onBlur` to Lit CustomEvents named `focus` and `blur`, which already exist natively and retarget through shadow roots, so listeners fired twice. Fixed: those map to the native events, and the Lit template now says never to dispatch a CustomEvent with a native event's name.

**Underspecified behavior the three platforms would have diverged on.** When does `validate: submit` re-run? Who announces errors — the Input, the Form, or both? Where does focus go on native after a failed submission (the behavior text and the RN note disagreed)? What is the Form context's shape, and which Input gets the keyboard's done key? Each was answered once in the Form doc and the platform notes now agree with the behavior section.

**Missing style bindings.** Input had no font family, no rest border width, no gap between its parts, and no size for helper text; Form's summary had no padding or radius. Each generator picked something reasonable and different. Fixed by adding the bindings. The rule that emerged: if a generator on any platform has to choose a token, the binding was missing.

**Type-shape friction the templates should have warned about.** Enum values written as quoted digits (`level: '2'`, `gap: '4'`) surprised every generator; RN's `fontWeight` wants a string while the token is a number; `lineHeight` tokens are multipliers but RN wants absolute values; the RN token import path in the template pointed nowhere. The templates now carry all of this, the tokens package has a real `exports` map with `.d.ts` files for every platform, and the digit enums are documented as accepting either form.

**Text's `element` enum overreached.** `label` and `legend` inside a shadow root cannot associate with anything, and even on React a bare `label` needs `htmlFor`, which the schema did not provide. Fixed by narrowing Text to `p | span` and stating that Input and the planned Fieldset own labels and legends.

## Dogfooding run 1 — Claude Code with the MCP server (2026-09-09)

Task given to Claude Code, unsteered: build a React Native "Profile settings" screen using only the design system, via the MCP server. Every tool call was logged.

The call sequence was `get_theme_skill` → `list_components(platform: rn)` → `search_guidance("settings form with required fields and save/cancel actions", rn)` → `lookup_code(Form, rn)` → `search_guidance("cancel button beside submit — which variant and order of actions", rn)`. That is the order the server's instructions ask for, and it held without prompting: feel first, then inventory, then guidance, then reference code, then one targeted judgment question.

The output used only system components, took every color and spacing value from `useTheme()`, labelled the Form, gave both Inputs descriptions, rendered "Save changes" as a primary submit with Cancel as `secondary` beside it, and titled the screen with a level-1 Heading at a restrained size — the theme's "hierarchy from weight, not size" showing up in a decision nobody spelled out.

Gap found: the final query asked about action *order*, and the docs only answered variant. Form's content guidelines now state the order (primary first in reading order on every platform, one secondary alternative, destructive actions in their own section) and forbid the ghost-next-to-primary pairing. The measure for the next run is the same: how many questions does the AI have to ask that the docs cannot answer.

## Run 2 — Tier 1, nine components (2026-09-09)

Same method: nine docs written first (Link, Checkbox, Switch, RadioGroup, Disclosure, Alert, Landmark, Breadcrumb, Meter), parsed, contrast-checked, then three generators working from `generated/prompts/` only, each returning a gap list. This time 157 items came back (63 React, 48 Lit, 46 React Native) — more than run 1 in absolute terms but across nine components instead of six, most of them composites, and a large share were convergent: the same defect reported by all three generators. The second pass, where each generator reconciled its code with the fixed docs, returned 16 items, most of them one-sentence clarifications.

**Before the generators ran, the contrast checker caught four failures the docs would have shipped.** The dark-mode selected control fill (`brand.600`, inherited from the primary button) was 2.8:1 against the page, and 2.2:1 against the control surface. The primary button gets away with it because its text identifies the component; a checkbox fill does not. `tools/theme.py` now picks the selected step per mode with `control_pair`: a fill that meets 3:1 against both the page and the control surface, with an ink (white or the darkest neutral) that meets 4.5:1 on it — in dark mode that lands on `brand.500` with dark ink, which is the right answer and not one anyone would have written by hand. The other failure was Meter's empty track, 1.2:1 against the page; that one is a WCAG 1.4.11 exemption (the label and value identify the component), so the pair was removed and the exemption is written into the doc rather than a token invented to pass.

**The Form value contract did not exist.** Tier 0 had only text fields, so `Form` collected `Record<string, string>` and nobody noticed that was a decision. All three generators had to invent what an unchecked checkbox, a switch and an unselected radio group contribute, and they invented three different answers (absent key, `false`, `''`). The Form doc now states it: `string | boolean`, and no key when the field is empty or disabled. The Lit doc gained the `DsFormField` interface that `ds-form` duck-types, because the Lit generator found `ds-form` hard-coded `instanceof DsInput` — the composition rule ("reuse existing components") is only true when the existing components were built to be reused.

**Restyling a child is now forbidden, in the schema.** Alert's dismiss button and Breadcrumb's ellipsis were both specified as "the system Button" while carrying their own color, radius and target bindings. React reached into `.ds-button`, Lit used `::part`, React Native overlaid a glyph because its Button had no icon prop at all. Three different escape hatches for the same underspecification. The bindings were deleted, the templates now say composites never restyle a child, the ghost foreground is checked against every status background (it passes in both modes), and the React Native Button gained the `leadingIcon`/`trailingIcon` props its own doc had promised since run 1 — a Tier 0 code drift that only a composite could expose.

**Native semantics beat system rules, once.** The RadioGroup doc said disabled options are skipped by arrow keys and, two paragraphs later, that disabled uses `aria-disabled` so options stay discoverable. Native radios cannot do both. Lit resolved it by reimplementing roving tabindex; React resolved it by letting the arrows land on disabled options. The doc now makes per-option `disabled` the one sanctioned use of the real attribute (arrows skip it, as the APG expects), while a disabled group stays focusable and inert.

**Words that are attributes.** Alert's `title` prop is a tooltip on every platform element; Landmark's `role` prop collides with `HTMLElement.role` in Lit; Meter's `showValue: true` cannot be turned off from a Lit attribute. Renamed to `heading`, `landmark` (attribute still `role`), and `hideValue`. The rule for the schema: a prop name must be safe as an attribute on every platform, and boolean defaults are `false`.

**Two contradictions of my own.** Link bound `externalIconSize` to `font.size.sm` and described it as "1em of the surrounding font" — the description was right, the binding is gone, and Link now has no typography of its own at all (it inherits), which Breadcrumb needed anyway. Alert said dismissing "removes the alert" and "the consumer removes the alert"; it is the consumer's.

**Interaction between components that no single doc could see.** A form field inside a closed Disclosure is unmounted on React and React Native and therefore not collected; on Lit it is still in the light DOM and therefore collected, validated and focused while invisible. The demo (a Checkbox under "Advanced options") tripped it on all three. Disclosure gained `keepMounted`, Form's docs say fields inside a closed Disclosure need it, and `ds-form` skips them otherwise.

**Platform limits acknowledged rather than papered over.** RN `Text` and native `Switch` have no focus events, so the focus-ring bindings do not apply there; nested inheritance in RN needs a `TextNestingContext` from the system Text; iOS VoiceOver reads a radio group's legend as preceding text, not as a group name; RN 0.73 does have `role="meter"`, so the doc that said otherwise was wrong and now uses it.

**What is still owed.** An Icon primitive — every icon in Tier 1 is a hand-drawn 1em shape and every generator said so. A `copy.invalid` string existed on Input but not on the new controls; added. The stroke width of check marks reuses `border.width.focus` for want of a better token. Development-warning conventions (`process.env.NODE_ENV`, `import.meta.env.DEV`, `__DEV__`) and the visually-hidden clip pattern are now in the templates. Type-checking against real dependencies and the Storybook run happen on the Windows machine next.

Score for the run: 157 gaps found, 141 resolved in the docs, 16 recorded as platform limits or deferred to Tier 1.5. Per component that is roughly 17 first-pass gaps against Tier 0's 13, which reflects composites and form participation more than worse docs — the second pass converging to near zero is the number that matters.

## What was left as documented gaps (run 1)

Some findings are platform limits, not doc defects, and the honest move is to say so in the platform notes rather than pretend. React Native has no affordance for a sighted user to reach truncated text; `focus-visible` on a `Pressable` has to be tracked by hand because the state callback only exposes `pressed`; a disabled `Pressable` may be skipped by hardware-keyboard focus, so "stays in the tab order" is a web-ism; a Lit boolean attribute cannot express `false`, so `errorSummary` can only be turned off through the property. Each is now written into the relevant doc.

## What this means for the process

The docs got measurably stricter without getting longer in the wrong places, and the fixes were almost all to frontmatter — bindings, copy, tokens — rather than to prose. That is the shape we want: judgment stayed in the body, enforcement moved into the schema. The next run of the prompts should produce far fewer gaps, and the number of gaps per run is now a metric worth tracking on this page.

The generated packages themselves live in `packages/react`, `packages/lit`, and `packages/rn`, each with a sign-in demo and Storybook stories, and are composed side by side by the root Storybook (`pnpm storybook`). They type-check against stubs but have not yet been type-checked against the real dependencies or run in a browser; that happens once `pnpm install` is possible.
