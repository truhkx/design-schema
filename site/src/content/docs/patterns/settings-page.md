---
title: Settings page
description: The first dogfood page — a settings screen built entirely from generated components under the layout rhythm, in both themes, on all three platforms. What it must contain, how it is laid out, and what counts as the components not fitting.
sidebar:
  order: 1
---

A pattern is a page made only of system components. It exists to find the seams: the places where two components, each correct on its own, do not sit well together — a gap that doubles, a heading that is too big for a Card, a Toast that covers the Save button. A pattern is generated the same way a component is (a doc in, code out, gates in between) and lives in each package's `demo/` folder, not in `src/`, so adopters can copy it and owners can change it.

The settings page goes first because it uses a broad, mostly Tier 0–1 set — the components that already exist — plus Tabs, Fieldset, SegmentedControl and Toast from Tier 3, and because it looks different enough between calm-precise and warm-sleek to be the second theme's first comparison.

## What the page is

A signed-in user's account settings: profile, notifications, appearance, and a danger zone. It is the page every product has and nobody designs carefully, which makes it a fair test of the defaults.

## Structure

```
Landmark main
  Container width=content
    Stack gap=section
      Heading level=1  "Settings"
      Tabs label="Settings sections" fit=fill  (Profile | Notifications | Appearance | Account; ids profile, notifications, appearance, account — the labels are Tabs' own `tabs` array of {id,label}, and each TabPanel below carries only its id)
        TabPanel profile
          Form name=profile onSubmit   (no label: it is the page's only form)
            Stack gap=loose
              Fieldset legend="Your details" gap=normal
                Input name=name label="Name" required
                Input name=email label="Email" type=email required description="We send receipts here."
              Fieldset legend="Public profile" gap=normal
                Input name=displayName label="Display name"
                Input name=website label="Website" type=url
              Stack direction=horizontal gap=tight justify=end   (given to Form's `actions` prop or named slot, never as a trailing child)
                Button variant=primary type=submit "Save changes"
                Button variant=secondary "Cancel"
        TabPanel notifications
          Stack gap=loose
            Fieldset legend="Email me about" gap=normal
              Checkbox name=productUpdates "Product updates" description="About once a month."
              Checkbox name=securityAlerts "Security alerts" defaultChecked
              Checkbox name=tips "Tips and tutorials"
            Fieldset legend="Push notifications" gap=normal
              Switch label="Enable push notifications"   (the page holds its state, so it can disable the RadioGroup)
              RadioGroup name=pushFrequency label="Frequency" (immediately "Immediately" | daily "Daily digest" | weekly "Weekly digest") defaultValue=immediately  disabled unless the Switch is on
        TabPanel appearance
          Stack gap=loose
            Fieldset legend="Theme" gap=normal description="A preview only: the app sets the color mode, and System means no override."
              SegmentedControl label="Color mode" (system "System" | light "Light" | dark "Dark")  value starts at system
            Fieldset legend="Density" gap=normal description="A preview only: the theme has no density setting yet."
              RadioGroup name=density label="Layout density" (comfortable "Comfortable" | compact "Compact") description="Affects tables and lists."  value starts at comfortable
        TabPanel account
          Stack gap=loose
            Card surface=subtle inset=lg heading="Export your data" headingLevel=2
              Stack gap=normal align=start
                Text "Download everything we store about you as a ZIP."
                Button variant=secondary "Request export"   (no handler: the page has no export to run)
            Card surface=subtle inset=lg heading="Delete account" headingLevel=2
              Stack gap=normal align=start
                Alert tone=warning live=off "This cannot be undone."
                Button variant=danger "Delete account…"  → AlertDialog
  AlertDialog   (a sibling after Container, inside Landmark main)
```

A successful submit raises the Toast "Changes saved" with `toast()`, at the default tone. It is not a node in the tree above: the provider owns the region and where it sits, so nothing Toast-related is authored on the page. A second save raises a second toast — no id, no dedupe, and the promise `toast()` returns is ignored.

The Toast provider is not the page's. On web and Lit `toast()` creates its region on first call. On React Native `toast()` needs a `ToastProvider`, which an adopter mounts at the app root; the page does not mount one, and its story adds one in a decorator inside `withTheme()`. On React Native the page's one allowed primitive, a ScrollView, wraps Landmark main, so the landmark is inside the scroll content, and the page root carries `testID="SettingsPage"` so the gates can target the screen. The AlertDialog's place in the tree is a reading order, not a DOM one: it portals to the document body on web and Lit and is a Modal on native, so writing it after Container changes nothing rendered.

Every option's `value` is the slug shown in the tree, never the label: `defaultValue=immediately` is the slug. The three Notifications and Appearance groups are not all the same kind of control, deliberately: `pushFrequency` is uncontrolled with a `defaultValue`, because nothing on the page reads it, while the Switch and the two Appearance controls are page state the page holds — the Switch because it disables the RadioGroup, the other two because the page shows them working. The behaviour is what matters, not the prop: React's Switch reports through `onChange` and React Native's through `onValueChange`. The `name` on every control outside the Form (`productUpdates`, `securityAlerts`, `tips`, `pushFrequency`, `density`) is inert — a Form collects only within its own subtree — and is kept for parity across the three platforms. Form leaves `validate` unset, since the package default is already `submit`, and takes no label; an unnamed form is deliberately not a landmark, which is right for the page's only form. The actions row follows Form's action-order rule — the primary submit first, Cancel after it — and the row is end-justified, so Save sits to the left of Cancel. The five Fieldsets all take `gap=normal`. Tabs set `keepMounted` for cross-platform parity; on Lit it is a no-op, because ds-tabs never detaches a panel and only toggles `hidden`.

Every gap is a `Stack` gap or a Card inset; no margins. The page column is `Container width=content` so tables in other patterns line up with it later. Tabs are the horizontal, automatic-activation kind; below the prose width they scroll, not stack, because settings sections are few and short.

## Behaviors the page must show

Saving the profile form validates on submit (the Form contract: required first; there is no built-in email or URL format check, so a format rule is the page's own business logic and this pattern does not add one), focuses the first invalid field — set `errorSummary={false}`, since the default focuses the summary instead — and on success shows a Toast "Changes saved" without moving focus. Cancel resets the form to its saved values and does nothing else; with no seed data the fields return to empty. Form has no reset contract, so the page keeps the four Inputs controlled and Cancel restores their saved copy; any error messages already showing stay until the next submit. The Notifications and Appearance controls sit outside the Form, so they are page state that is neither saved nor reset. The Notifications tab's frequency RadioGroup is disabled while push is off — a real disabled-but-readable control, not hidden. The Appearance tab's color-mode and density controls are presentational here: the page may not read the theme or branch on it, the mode is set by an ancestor, and there is no density in the theme at all — so both are real, controlled inputs that drive nothing, and the page says so in each Fieldset's `description`. "System" is not a third mode the system has; it means no override. The Delete button opens an AlertDialog with `tone: danger`, heading "Delete your account?", description "This permanently deletes your account and everything in it. This cannot be undone." and confirm label "Delete account"; the cancel label is left unset, so AlertDialog's own copy applies. Confirm only closes it, like Cancel: there is no account to delete, and no follow-up Toast is faked. Its initial focus is AlertDialog's own — Cancel on web and Lit, the heading on native, which has no way to focus a Button first. Escape closes it. Switching tabs keeps each panel's unsaved state (Tabs with `keepMounted`).

## Themes and platforms

The page renders in calm-precise and warm-sleek, light and dark, and the difference must come only from tokens: no branching on theme in the page. On React Native the same tree renders as a screen; Tabs become the native segmented style at the top, Cards stack, the AlertDialog is the native one, and the Toast is the RN Toast. On Lit it is the same page as custom elements.

## Seams to look for

These are the questions the dogfood answers; each becomes a doc change, not a page hack.

Does `Stack gap=section` between the Heading and the Tabs read as one page, or as two? Does a Fieldset legend inside a TabPanel compete with the tab label? Is the Card heading at `level 2` too heavy beside a Fieldset legend at the same visual size — do we need a `size` on Fieldset's legend, or should Card's heading default smaller? The danger Card: is a `tone` on Card warranted (a red-bordered surface)? For now the answer is no — the Alert inside carries the signal and the Card stays plain. Does the Toast region overlap the Form's action row at phone width, and if so, does Toast need a "clear of the bottom action bar" rule? Does the disabled RadioGroup read as disabled at the theme's `opacity.disabled` in dark mode? Does the SegmentedControl look like a control or like Tabs when they sit on the same page — is the distinction visible without reading? Does `warm-sleek` change the page's rhythm at all, or only its colors — if only colors, the theme schema's `layout.rhythm` is not doing enough.

## Acceptance

The page passes the same gates as a component (parse is moot; contrast, literals, typecheck, keyboard on the Tabs and Dialog, axe on the page story), renders in both themes and modes with no theme branching, and has a Storybook story `Patterns/SettingsPage` per platform. The findings list above is answered in writing in `process/generation-log.md`, and each answer that changed a doc links the doc.
