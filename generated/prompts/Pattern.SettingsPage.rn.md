# Generate pattern: Settings page for React Native

You are generating a **pattern page** for the **Design Schema** design system: a whole screen built only from the system's generated components, so the seams between them show. The structure and behaviors below are the contract; the component definitions are in the package you are writing into.

## Output

Write `packages/rn/demo/SettingsPage.tsx` exporting a function component named `SettingsPage` (the screen), plus `packages/rn/demo/SettingsPage.stories.tsx` with `title: 'Patterns/SettingsPage'`, the package's `withTheme()` decorator, and a `Default` story. Do not add anything to `src/index.ts`; the screen lives in `demo/`, where adopters copy it from.

## Rules

- Compose only system components, imported from `../src`. The only React Native primitive allowed is a `ScrollView` around the page (the screen must scroll); no `View` with styles, no `Text` from react-native, no `StyleSheet`. If the screen needs something no component provides, use the closest component and report the gap.
- No tokens directly: no `useTheme()` in the page, no numbers for size or color, no `style` props except a component's documented `overrides`. The screen must render identically in every theme and both modes with **no branching on theme or mode**.
- No margins anywhere. Spacing between siblings comes from `Stack` (`gap`), around content from `Box`/`Card` (`inset`), at the screen edge from `Container`. The structure says which.
- Follow the structure exactly, including nesting, props and copy. Quoted strings are the visible copy, verbatim. A prop written as `prop=value?` is an open question — leave it out and mention it in the gap list. Where the structure names a web-only element (a `<main>` landmark, an `<h1>`), use the component's React Native mapping.
- Implement every behavior in "Behaviors the page must show" with the components' own props and events (Form validation, Toast on submit, disabled-until-on, the AlertDialog). Local screen state is fine; business logic is not (fake the save with a resolved Promise).
- The story renders the screen as is, under `withTheme()`, no args.
- Accessibility comes from the components; the screen adds only heading order and a sensible focus order, which the structure already fixes.

## Components used

Every one exists in `packages/rn/src`; import from there and read a file only when a prop's behaviour is unclear.

- `Landmark` — `packages/rn/src/Landmark.*` (View)
- `Container` — `packages/rn/src/Container.*` (View)
- `Stack` — `packages/rn/src/Stack.*` (View)
- `Heading` — `packages/rn/src/Heading.*` (Text)
- `Tabs` — `packages/rn/src/Tabs.*` (View)
- `Form` — `packages/rn/src/Form.*` (View)
- `Fieldset` — `packages/rn/src/Fieldset.*` (View)
- `Input` — `packages/rn/src/Input.*` (TextInput)
- `Button` — `packages/rn/src/Button.*` (Pressable)
- `Checkbox` — `packages/rn/src/Checkbox.*` (Pressable)
- `Switch` — `packages/rn/src/Switch.*` (Switch)
- `RadioGroup` — `packages/rn/src/RadioGroup.*` (View)
- `SegmentedControl` — `packages/rn/src/SegmentedControl.*` (View)
- `Card` — `packages/rn/src/Card.*` (View)
- `Text` — `packages/rn/src/Text.*` (Text)
- `Alert` — `packages/rn/src/Alert.*` (View)
- `Toast` — `packages/rn/src/Toast.*` (View)
- `AlertDialog` — `packages/rn/src/AlertDialog.*` (Modal)

## Structure

```
Landmark main
  Container width=content
    Stack gap=section
      Heading level=1  "Settings"
      Tabs label="Settings sections"  (Profile | Notifications | Appearance | Account; ids profile, notifications, appearance, account)
        TabPanel "Profile"
          Form name=profile onSubmit   (no label: it is the page's only form)
            Stack gap=loose
              Fieldset legend="Your details"
                Input name=name label="Name" required
                Input name=email label="Email" type=email required description="We send receipts here."
              Fieldset legend="Public profile"
                Input name=displayName label="Display name"
                Input name=website label="Website" type=url
              Stack horizontal gap=tight justify=end   (given to Form's `actions` prop or named slot, never as a trailing child)
                Button variant=secondary "Cancel"
                Button variant=primary type=submit "Save changes"
        TabPanel "Notifications"
          Stack gap=loose
            Fieldset legend="Email me about"
              Checkbox name=productUpdates "Product updates" description="About once a month."
              Checkbox name=securityAlerts "Security alerts" defaultChecked
              Checkbox name=tips "Tips and tutorials"
            Fieldset legend="Push notifications"
              Switch label="Enable push notifications"   (controlled, so it can disable the RadioGroup)
              RadioGroup name=pushFrequency label="Frequency" (Immediately | Daily digest | Weekly digest) defaultValue=Immediately  disabled unless the Switch is on
        TabPanel "Appearance"
          Stack gap=loose
            Fieldset legend="Theme" description="A preview only: the app sets the color mode, and System means no override."
              SegmentedControl label="Color mode" (System | Light | Dark)  value starts at System
            Fieldset legend="Density" description="A preview only: the theme has no density setting yet."
              RadioGroup name=density label="Layout density" (Comfortable | Compact) description="Affects tables and lists."  value starts at Comfortable
        TabPanel "Account"
          Stack gap=loose
            Card surface=subtle inset=lg heading="Export your data" headingLevel=2
              Stack gap=normal align=start
                Text "Download everything we store about you as a ZIP."
                Button variant=secondary "Request export"   (no handler: the page has no export to run)
            Card surface=subtle inset=lg heading="Delete account" headingLevel=2
              Stack gap=normal align=start
                Alert tone=warning "This cannot be undone."
                Button variant=danger "Delete account…"  → AlertDialog
      Toast "Changes saved" on successful submit   (raised with toast(), default tone; the provider owns the region and where it sits, so no region is authored here)
  AlertDialog   (a sibling after Container, inside Landmark main)
```

## Behaviors the page must show

Saving the profile form validates on submit (the Form contract: required first; there is no built-in email or URL format check, so a format rule is the page's own business logic and this pattern does not add one), focuses the first invalid field — set `errorSummary={false}`, since the default focuses the summary instead — and on success shows a Toast "Changes saved" without moving focus. Cancel resets the form to its saved values and does nothing else; with no seed data the fields return to empty. Form has no reset contract, so the page keeps the four Inputs controlled and Cancel restores their saved copy; any error messages already showing stay until the next submit. The Notifications and Appearance controls sit outside the Form, so they are page state that is neither saved nor reset. The Notifications tab's frequency RadioGroup is disabled while push is off — a real disabled-but-readable control, not hidden. The Appearance tab's color-mode and density controls are presentational here: the page may not read the theme or branch on it, the mode is set by an ancestor, and there is no density in the theme at all — so both are real, controlled inputs that drive nothing, and the page says so in each Fieldset's `description`. "System" is not a third mode the system has; it means no override. The Delete button opens an AlertDialog with `tone: danger`, heading "Delete your account?", description "This permanently deletes your account and everything in it. This cannot be undone." and confirm label "Delete account". Confirm only closes it, like Cancel: there is no account to delete, and no follow-up Toast is faked. Its initial focus is AlertDialog's own — Cancel on web and Lit, the heading on native, which has no way to focus a Button first. Escape closes it. Switching tabs keeps each panel's unsaved state (Tabs with `keepMounted`).

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

Does `Stack gap=section` between the Heading and the Tabs read as one page, or as two? Does a Fieldset legend inside a TabPanel compete with the tab label? Is the Card heading at `level 2` too heavy beside a Fieldset legend at the same visual size — do we need a `size` on Fieldset's legend, or should Card's heading default smaller? The danger Card: is a `tone` on Card warranted (a red-bordered surface)? For now the answer is no — the Alert inside carries the signal and the Card stays plain. Does the Toast region overlap the Form's action row at phone width, and if so, does Toast need a "clear of the bottom action bar" rule? Does the disabled RadioGroup read as disabled at the theme's `opacity.disabled` in dark mode? Does the SegmentedControl look like a control or like Tabs when they sit on the same page — is the distinction visible without reading? Does `warm-sleek` change the page's rhythm at all, or only its colors — if only colors, the theme schema's `layout.rhythm` is not doing enough.

## Acceptance

The page passes the same gates as a component (parse is moot; contrast, literals, typecheck, keyboard on the Tabs and Dialog, axe on the page story), renders in both themes and modes with no theme branching, and has a Storybook story `Patterns/SettingsPage` per platform. The findings list above is answered in writing in `process/generation-log.md`, and each answer that changed a doc links the doc.
