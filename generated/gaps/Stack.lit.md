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

## 2026-09-17 04:01 — round 1

- Stack: the Lit guidance paragraph says `element="ul"` wraps each node in an `<li>` 'via slotchange', but platforms.lit.notes requires manual slot assignment rebuilt from a childList observer and warns that slotchange-driven moves loop; I followed platforms.lit.notes.
- Stack: examples give `children` as prose ('A submit Button and a Cancel Button', 'The form fields'), which a Lit story cannot take as an arg since children are slotted; the example stories pass only the other `given` keys as args and render representative ds-button / ds-input / ds-text content in `render`.
- Stack: `gap: none` makes `overrides.gap` a no-op, but the doc doesn't say whether a consumer CSS hook (`ds-stack { --ds-stack-gap: … }`) should also be ignored at `gap="none"`; the element ignores the `overrides` property there but still reads the hook, so CSS on the hook still applies.
- Stack: `element` isn't in platforms.lit.reflect, so it is a non-reflected attribute/property; the doc doesn't say whether `ds-stack[element=nav]` should be styleable from outside.
- Stack: nav-element-is-a-navigation-landmark asserts `role: navigation`, but the doc doesn't say how a Lit test should read a computed role across the shadow root (no getByRole precedent in packages/lit tests); the test checks the native `<nav>` in the shadow root instead of the computed accessible role, and whether Chromium still exposes the landmark under `display: contents` is untested.
- Stack: Related names Form and Button; Stack composes neither itself (it only slots children), so they appear only as story content.

## 2026-09-18 15:26 — round 1

- Stack: the element prop says 'the list role wins over a consumer role on ul/ol; on the other elements a consumer role passes through', but in Lit the list is inside the shadow root and a consumer role lands on the host, which wraps the list rather than competing with it. Neither case is addressed for Lit; I left the host's role alone, so a host role on ul/ol gives a nested role-over-list structure.
- Stack: 'Null and boolean children are skipped' has no Lit counterpart (children are DOM nodes). I chose to give no li to comments or whitespace-only text nodes, and one li to each element and each non-empty text node; the doc should say what counts as a child for Lit.
- Stack: the nav/section wrappers in the shadow root need display: contents so the host stays the flex container. The doc names this only for the li wrappers; I applied it to section, nav, ul, ol and li.
- Stack: the renders-* derived scenarios only say 'renders: true'. For the reflected props I assert the reflected attribute, and for element I assert the shadow structure; the doc doesn't define what 'renders' means for a slot-only layout element.
- Stack: the list-element-is-a-list scenario says assistive technology 'counts its items' but its then only asserts role: list. The test also asserts one li per Default child (3); the doc could add an item-count expectation.
- Stack: the examples give children in words ('The form fields', 'The regions of the page', 'A row of filters'), so the concrete content (three Inputs, three Text regions, six small secondary/ghost Buttons as filters) is my choice.
- Stack: WrappingFilters needs a width-bounded decorator, but the doc names no token for the bound; the story uses a 16rem max-inline-size inline style (story-only, carried over from the previous version).

## 2026-09-18 15:38 — round 2

- Stack: the keyboard-run and axe gates run across the whole package and fail on other components (keyboard: Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip, Tree; axe: Tabs dark-mode color-contrast, TreeGrid aria-hidden-focus and target-size). Stack has no keyboard block, and all 26 of its Lit stories pass axe in light and dark. So a Stack job can't turn these gates green, and I changed no Stack code. The gates would need to be scoped to the generated component for a per-component round to be actionable.
- Stack: the gaps from round 1 still stand (consumer role on the host versus the list role in the shadow root; what counts as a child in Lit; display: contents on the nav/section wrappers; what 'renders' means for the derived scenarios; no item-count expectation in list-element-is-a-list; the example children are given only in words; no token for the WrappingFilters width bound).

## 2026-09-18 15:48 — round 3

- Stack: rounds 2 and 3 got the same package-wide keyboard-run and axe failures, all from other components (keyboard: Combobox, DatePicker, Dialog, Feed, Listbox, Menu, Popover, Search, SegmentedControl, Select, SidePanel, Slider, Stepper, Tabs, Toast, Toolbar, Tooltip, Tree; axe: Tabs dark-mode color-contrast, TreeGrid aria-hidden-focus and target-size). Stack's only runtime change is the gap='none' rule, and no other Lit component or story uses gap='none', so the Stack consumers among those (Dialog, Feed, Popover, SidePanel, Tooltip) are unaffected. Stack has no keyboard spec, and its 26 stories pass axe in light and dark. The gates should be scoped to the generated component, or those failures fixed in their own jobs; I changed no Stack code.
- Stack: the gaps from round 1 still stand (consumer role on the host versus the list role in the shadow root; what counts as a child in Lit; display: contents on the nav/section wrappers; what 'renders' means for the derived scenarios; no item-count expectation in list-element-is-a-list; the example children are given only in words; no token for the WrappingFilters width bound).
