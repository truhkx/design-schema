# Generate pattern: Settings page as Lit (web components)

You are generating a **pattern page** for the **Design Schema** design system: a whole page built only from the system's custom elements, so the seams between them show. The structure and behaviors below are the contract; the element definitions are in the package you are writing into.

## Output

Write `packages/lit/demo/SettingsPage.ts` defining `<ds-pattern-settings-page>` (a `LitElement` whose `render()` returns the page as a light-DOM-free tree of system elements), plus `packages/lit/demo/SettingsPage.stories.ts` with `title: 'Patterns/SettingsPage'` and a `Default` story. Do not add anything to `src/index.ts`; the page lives in `demo/`, where adopters copy it from.

## Rules

- Compose only system elements (`<ds-…>`), side-effect imported from `../src/<Name>.js`. Do not define styling of your own: the page element has no `static styles` beyond `:host { display: block }`. If the page needs something no element provides, use the closest element and report the gap.
- No tokens directly: no `var(--…)`, no inline styles except a component's documented `overrides` property. The page inherits the theme from the document; it must render identically in every theme and both modes with **no branching on theme or mode**.
- No margins anywhere. Spacing between siblings comes from `<ds-stack gap>`, around content from `<ds-box>`/`<ds-card inset>`, at the page edge from `<ds-container>`. The structure says which.
- Follow the structure exactly, including nesting, attributes and copy. Quoted strings are the visible copy, verbatim. A prop written as `prop=value?` is an open question — leave it out and mention it in the gap list.
- Implement every behavior in "Behaviors the page must show" with the elements' own attributes, properties and events (form validation through `<ds-form>`, the toast on submit, disabled-until-on, the alert dialog). Local element state is fine; business logic is not (fake the save with a resolved Promise).
- The story renders the page element as is: no decorators beyond the package's usual ones, no args.
- Accessibility comes from the elements; the page adds only landmarks, heading order and a sensible tab order, which the structure already fixes.

## Components used

Every one exists in `packages/lit/src`; import from there and read a file only when a prop's behaviour is unclear.

- `Landmark` — `packages/lit/src/Landmark.*` (ds-landmark)
- `Container` — `packages/lit/src/Container.*` (ds-container)
- `Stack` — `packages/lit/src/Stack.*` (ds-stack)
- `Heading` — `packages/lit/src/Heading.*` (ds-heading)
- `Tabs` — `packages/lit/src/Tabs.*` (ds-tabs)
- `Form` — `packages/lit/src/Form.*` (ds-form)
- `Fieldset` — `packages/lit/src/Fieldset.*` (ds-fieldset)
- `Input` — `packages/lit/src/Input.*` (ds-input)
- `Button` — `packages/lit/src/Button.*` (ds-button)
- `Checkbox` — `packages/lit/src/Checkbox.*` (ds-checkbox)
- `Switch` — `packages/lit/src/Switch.*` (ds-switch)
- `RadioGroup` — `packages/lit/src/RadioGroup.*` (ds-radio-group)
- `SegmentedControl` — `packages/lit/src/SegmentedControl.*` (ds-segmented-control)
- `Card` — `packages/lit/src/Card.*` (ds-card)
- `Text` — `packages/lit/src/Text.*` (ds-text)
- `Alert` — `packages/lit/src/Alert.*` (ds-alert)
- `Toast` — `packages/lit/src/Toast.*` (ds-toast)

## Structure

```
Landmark main
  Container width=content
    Stack gap=section
      Heading level=1  "Settings"
      Tabs label="Settings sections"  (Profile | Notifications | Appearance | Account)
        TabPanel "Profile"
          Form onSubmit
            Stack gap=loose
              Fieldset legend="Your details"
                Input label="Name" required
                Input label="Email" type=email required description="We send receipts here."
              Fieldset legend="Public profile"
                Input label="Display name"
                Input label="Website" type=url
              Stack horizontal gap=tight justify=end   (Form's action row)
                Button variant=secondary "Cancel"
                Button variant=primary type=submit "Save changes"
        TabPanel "Notifications"
          Fieldset legend="Email me about"
            Checkbox "Product updates" description="About once a month."
            Checkbox "Security alerts" defaultChecked
            Checkbox "Tips and tutorials"
          Fieldset legend="Push notifications"
            Switch label="Enable push notifications"
            RadioGroup label="Frequency" (Immediately | Daily digest | Weekly digest)  disabled unless the Switch is on
        TabPanel "Appearance"
          Fieldset legend="Theme"
            SegmentedControl label="Color mode" (System | Light | Dark)
          Fieldset legend="Density"
            RadioGroup label="Layout density" (Comfortable | Compact) description="Affects tables and lists."
        TabPanel "Account"
          Card surface=subtle inset=lg heading="Export your data" headingLevel=2
            Text "Download everything we store about you as a ZIP."
            Button variant=secondary "Request export"
          Card surface=subtle inset=lg heading="Delete account" headingLevel=2 tone=danger? (see seams)
            Alert tone=warning "This cannot be undone."
            Button variant=danger "Delete account…"  → AlertDialog
      Toast region (bottom-end)  "Changes saved" on successful submit
```

## Behaviors the page must show

Saving the profile form validates on submit (the Form contract: required, then type), focuses the first invalid field, and on success shows a Toast "Changes saved" without moving focus. Cancel resets the form to its saved values and does nothing else. The Notifications tab's frequency RadioGroup is disabled while push is off — a real disabled-but-readable control, not hidden. The Appearance tab's color-mode control changes the theme mode live (this is the Storybook theme switcher, in product form) and the density control changes `density` on the theme. The Delete button opens an AlertDialog whose confirm is `danger` and whose cancel is the initial focus. Escape closes it. Switching tabs keeps each panel's unsaved state (Tabs with `keepMounted`).

## Guidance

## Overview

A pattern is a page made only of system components. It exists to find the seams: the places where two components, each correct on its own, do not sit well together — a gap that doubles, a heading that is too big for a Card, a Toast that covers the Save button. A pattern is generated the same way a component is (a doc in, code out, gates in between) and lives in each package's `demo/` folder, not in `src/`, so adopters can copy it and owners can change it.

The settings page goes first because it uses a broad, mostly Tier 0–1 set — the components that already exist — plus Tabs, Fieldset, SegmentedControl and Toast from Tier 3, and because it looks different enough between calm-precise and warm-sleek to be the second theme's first comparison.

## What the page is

A signed-in user's account settings: profile, notifications, appearance, and a danger zone. It is the page every product has and nobody designs carefully, which makes it a fair test of the defaults.

## Themes and platforms

The page renders in calm-precise and warm-sleek, light and dark, and the difference must come only from tokens: no branching on theme in the page. On React Native the same tree renders as a screen; Tabs become the native segmented style at the top, Cards stack, the AlertDialog is the native one, and the Toast is the RN Toast. On Lit it is the same page as custom elements.

## Seams to look for

These are the questions the dogfood answers; each becomes a doc change, not a page hack.

Does `Stack gap=section` between the Heading and the Tabs read as one page, or as two? Does a Fieldset legend inside a TabPanel compete with the tab label? Is the Card heading at `level 2` too heavy beside a Fieldset legend at the same visual size — do we need a `size` on Fieldset's legend, or should Card's heading default smaller? The danger Card: is a `tone` on Card warranted (a red-bordered surface), or is the Alert inside enough? Does the Toast region overlap the Form's action row at phone width, and if so, does Toast need a "clear of the bottom action bar" rule? Does the disabled RadioGroup read as disabled at the theme's `opacity.disabled` in dark mode? Does the SegmentedControl look like a control or like Tabs when they sit on the same page — is the distinction visible without reading? Does `warm-sleek` change the page's rhythm at all, or only its colors — if only colors, the theme schema's `layout.rhythm` is not doing enough.

## Acceptance

The page passes the same gates as a component (parse is moot; contrast, literals, typecheck, keyboard on the Tabs and Dialog, axe on the page story), renders in both themes and modes with no theme branching, and has a Storybook story `Patterns/Settings` per platform. The findings list above is answered in writing in `process/generation-log.md`, and each answer that changed a doc links the doc.
