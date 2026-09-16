# Gaps reported while generating Stack for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:48 — round 1

- Stack: the anatomy list is just `container`, and the schema doesn't say what carries that part when `element` is `div` — kept the existing convention (matching Container) where the host itself is the implicit container and only the `section`/`nav`/`ul`/`ol` wrapper elements carry `part="container"`.
- Stack: pre-existing Stack.ts used the old raw spacing scale ('0'..'12') for `gap` instead of the schema's `layout.gap.*` enum (none/tight/normal/loose/section); rewrote the enum, CSS hooks, and stories/tests to match the schema, since the old version predates this generation pass.

## 2026-09-10 17:14 — round 1

- Stack: schema says gap: none must make overrides.gap a no-op (presence rule), but the pre-existing implementation applied inline style overrides unconditionally, letting an override win over gap="none". Fixed by skipping the gap hook when gap is "none" and re-running applyOverrides when gap changes.

## 2026-09-16 02:31 — round 1

- Stack: anatomy names one part, `container`, but `platforms.lit` says the host itself is the flex container with a default slot. A host element cannot carry a `part`, so `container` only exists for `element` = section/nav/ul/ol; for `div` the shadow root is a bare `<slot>` and the host is the container. The doc should say which element is `container` when `element: div`.
- Stack: 'the host is the flex container' and 'for ul/ol each child is wrapped in an li' can only both hold if the `ul`/`li` wrappers are `display: contents`, so the slotted children stay the host's flex items. I did that and added explicit `role="list"`/`role="listitem"` so the semantics do not depend on browser `display: contents` a11y behaviour. React solved the same requirement the other way (real `.ds-stack__item` boxes inside a `ul.ds-stack--list`). The doc does not say which is intended, so the two platforms differ in box structure.
- Stack: the doc does not say whether children may be added or removed after mount, but `ul`/`ol` needs exactly one `<li>` per child. I re-render from a `childList` MutationObserver and use `slotAssignment: 'manual'` so the light DOM is never reparented; the obvious alternative (a `slotchange` handler that moves children into `li` wrappers) would be an infinite loop. Worth stating in the doc as the required approach.
- Stack: `styles.gap` says `gap: none` 'renders no gap', but `layout.gap.none` is a real token (`var(--space-0)`). I used `var(--layout-gap-none)` to avoid a literal, and made `overrides.gap` a no-op while `gap="none"` per the presence rule. The React build emits a bare `gap: 0` for the same case, so the platforms disagree on whether the `none` token is read; the doc should pick one.
- Stack: `wrap` is described as 'Allow horizontal stacks to wrap' but is not scoped to `direction: horizontal`. I apply `flex-wrap: wrap` unconditionally (matching React), which also wraps a vertical stack into columns when its block size is bounded. The doc should say whether `wrap` is ignored when `direction: vertical`.
- Stack: `children` is a required `content` prop, but on Lit it is a slot and cannot be a story arg — `Element.children` is readonly, so adding it to `meta.args` would make the generated behavior test throw when it assigns every arg as a property. The four example stories therefore carry only the non-content `given` keys in `args` and slot their children from `render`, which is a deviation from 'exactly its `given` as args'. The `given.children` values are prose ('The form fields'), not renderable content, so I chose concrete children: ds-input fields, ds-button rows, ds-text regions.
- Stack: examples `button-row` and `wrapping-filters` omit `align`, so they inherit the default `stretch` and the buttons stretch to the row height, which is not what the descriptions depict. I added `align: center` to those two stories (React added `align: start` to its equivalents). Either the examples should set `align` explicitly or the doc should say the default is intended.
- Stack: the prompt's standard rules for `a11y.requires`, `accessible-name`, `focus-visible`, `heading-hierarchy`, `delegatesFocus`, `disabled`/`opacity.disabled`, `transition`/`motion.*` and the `Keyboard` story do not apply — Stack declares `role: none`, an empty `requires`, no keyboard block, no events and no state. I implemented none of them, and `shadowRootOptions` carries `slotAssignment: 'manual'` rather than `delegatesFocus`.
