---
title: Stepper
description: Shows where the user is in a multi-step flow — checkout, onboarding, a wizard — as an ordered list of steps with the current one marked, and lets them go back to steps they have completed.
component:
  name: Stepper
  category: navigation
  status: review
  anatomy: [list, step, indicator, connector, label, description, count]
  composition:
    label: { component: Text, props: { element: span, size: sm }, forwards: { labelSize: fontSize, labelWeight: fontWeight, labelCurrentWeight: fontWeight, fontFamily: fontFamily } }
    description: { component: Text, props: { element: span, size: xs, tone: muted }, forwards: { descriptionSize: fontSize, fontFamily: fontFamily } }
    count: { component: Text, props: { element: span, size: sm, tone: muted }, forwards: { countSize: fontSize, fontFamily: fontFamily } }
  props:
    label:
      type: string
      description: 'Accessible name of the navigation landmark. Defaults to `copy.navLabel`, which an empty string also falls back to (`label || copy.navLabel`), so the landmark is never unnamed.'
    steps:
      type: array
      required: true
      shape: '{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[]'
      description: 'The steps in order. `status` is derived from `current` when omitted: before it complete, the step it names current, after it upcoming. An explicit `status` sets only the indicator, its colours and the status word; position (not status) decides the selected state, navigability, the connector colour and the compact reveal.'
    current:
      type: string
      required: true
      description: 'The id of the current step. The step whose id matches is the selected one (`aria-current="step"` / selected state) and the one compact reveals, whatever its `status`. When no id matches, nothing is selected, every step without an explicit status is upcoming, no step is navigable under `completed` (all still are under `all`), the count reads "Step 1 of m", compact reveals the first step''s label (so a compact stepper is never label-less), and development builds log a warning — a developer-only English message, not copy, worded identically on every platform: `Stepper: current "<id>" matches no step id; nothing is selected.` The warning needs a non-empty `current`: an empty one (the Lit property''s initial `''''`) is treated as not yet set and does not warn.'
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: 'Vertical shows descriptions under each label and suits a side column; horizontal does not render descriptions at all (not clipped, and no aria-describedby) and collapses to `compact` below the prose width.'
    navigable:
      type: enum
      values: [none, completed, all]
      default: completed
      description: 'Which steps can be activated: none (display only), completed steps (the usual — you can go back, not skip ahead), or all (a settings-style flow where order does not matter). "Completed" means visited — any step before the current one by position, including one marked `error`, which is exactly the step a user most needs to return to. The control is the component''s own native button, not the Button component, whose single-label API cannot hold an indicator, a label and a description.'
    compact:
      type: boolean
      default: false
      description: 'Show only the current step''s label and "Step 2 of 5"; the indicators stay. Horizontal only, set by hand or automatically below the prose width — a vertical stepper has the room, so the prop does nothing there, including the `count`, which a vertical stepper never renders. On web and Lit the labels of the other steps, with their status words, are visually clipped (the visually-hidden technique), not removed, so they stay reachable by a screen reader; on React Native they are not rendered, because each step''s accessibilityLabel already carries the label and status. "Step n of m" (`copy.stepOf`) is the `count` part: one muted Text after the list, not in any step and not replacing a description. On web and Lit, where automatic compact is a container query, it is always rendered and `display: none` outside the query (applied through Text''s layout-only className); on React Native it is rendered only while compact is in effect. The count follows the list, `stepGap` after it — as the root''s own flex/column gap, never a margin, so the gap collapses with the count when it is hidden instead of leaving dead space under every non-compact stepper.'
  events:
    onStepSelect:
      description: Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself.
      platforms: { web: onStepSelect, lit: step-select, rn: onStepSelect, swiftui: onStepSelect }
      payload:
        - { name: id, type: string, description: The id of the chosen step. }
      fires: [user]
      timing: { phase: request }
  keyboard:
    - { keys: [Tab], action: 'Moves between navigable steps in order; non-navigable steps are not focusable.', from: first, expect: focus-next }
    - { keys: [Enter, ' '], action: Selects the focused step., from: first, expect: manual, native: true }
  styles:
    indicatorSize: { token: space.6, part: indicator }
    indicatorColor: { token: color.foreground, part: indicator, description: 'The numeral on an upcoming or current step; the complete and error states have their own foregrounds.' }
    indicatorBackground: { token: color.control.background, part: indicator }
    indicatorBorder: { token: color.border.strong, part: indicator }
    indicatorBorderWidth: { token: border.width.focus, part: indicator }
    indicatorCompleteBackground: { token: color.control.selectedBackground, part: indicator }
    indicatorCompleteForeground: { token: color.control.selectedForeground, part: indicator, description: 'The check Icon on a complete step, passed as the Icon''s color override.' }
    indicatorCompleteBorder: { token: color.control.selectedBackground, part: indicator, description: 'The ring of a complete indicator, the same colour as its fill.' }
    indicatorRadius: { token: radius.full, part: indicator, description: 'Makes the indicator a circle.' }
    indicatorCurrentBorder: { token: color.control.selectedBackground, part: indicator, description: 'The ring of a step whose resolved status is `current`; an error on the id-matched step shows the error ring instead.' }
    indicatorErrorBackground: { token: color.status.danger.background, part: indicator }
    indicatorErrorForeground: { token: color.status.danger.foreground, part: indicator, description: 'The danger Icon on an error step, passed as the Icon''s color override, as indicatorCompleteForeground is for the check.' }
    indicatorErrorBorder: { token: color.status.danger.icon, part: indicator, description: 'The ring; the danger icon step is the one guaranteed 3:1 against the page.' }
    indicatorFontSize: { token: font.size.sm, part: indicator, description: 'The numeral. The check and danger Icons take `size="sm"` and receive this as their `size` override, so glyph and numeral match. A font-size token driving an icon box is intended here (both resolve to a length, and the point is that the glyph tracks the numeral); because an override always wins over the prop, `size="sm"` on those two Icons is decorative.' }
    indicatorFontWeight: { token: font.weight.semibold, part: indicator }
    connector: { token: color.border, part: connector }
    connectorComplete: { token: color.control.selectedBackground, part: connector, description: 'The connector after step i when step i is before the current step by position; explicit statuses (error included) do not change it. Every other connector uses `connector`.' }
    connectorWidth: { token: border.width.focus, part: connector }
    labelColor: { token: color.foreground, part: label, description: 'Realised by the label Text''s tone default on every step that is not upcoming; no --ds-stepper-* hook.' }
    labelUpcomingColor: { token: color.foreground.muted, part: label, description: 'Realised by the label Text''s tone muted on a step whose resolved status is upcoming (an explicit `status: upcoming` is muted, an explicit `current` after the id match is not); no --ds-stepper-* hook. The label''s `tone` is passed per step, alongside the listed props.' }
    labelWeight: { token: font.weight.medium, part: label, description: 'Forwarded to the label Text''s fontWeight override on every step but the current one.' }
    labelCurrentWeight: { token: font.weight.semibold, part: label, description: 'Forwarded to the label Text''s fontWeight override on the current step (the id match).' }
    labelSize: { token: font.size.sm, part: label, description: 'Forwarded to the label Text''s fontSize override.' }
    descriptionColor: { token: color.foreground.muted, part: description, description: 'Realised by the description Text''s tone muted; no --ds-stepper-* hook.' }
    descriptionSize: { token: font.size.xs, part: description, description: 'Forwarded to the description Text''s fontSize override.' }
    countColor: { token: color.foreground.muted, part: count, description: 'Realised by the count Text''s tone muted; no --ds-stepper-* hook.' }
    countSize: { token: font.size.sm, part: count, description: 'Forwarded to the count Text''s fontSize override.' }
    stepHover: { token: color.action.ghost.backgroundHover, part: step, state: hover, description: 'Hover and press background of a navigable step (on React Native while the Pressable is pressed or hovered).' }
    stepRadius: { token: radius.sm, part: step }
    stepPadding: { token: space.2, part: step, description: 'Inline padding of a step control (block padding too when vertical), so the hover background has room around the indicator and label. The `step` part is the list item (web/Lit `<li>`); stepHover, stepRadius, stepPadding, minTarget and the focus ring style the control inside it.' }
    stepGap: { token: layout.gap.normal, part: step, description: 'Between steps along the orientation axis (the connector fills it). Horizontally the connector grows with free inline space from a minimum of stepGap; vertically there is no free space in a column of auto-height steps, so a vertical connector is exactly stepGap tall. It is centred on the indicator''s axis, and the offset takes stepPadding only on the axis the padding is on: horizontally calc((indicatorSize − connectorWidth) / 2) as the block offset, vertically calc(stepPadding + (indicatorSize − connectorWidth) / 2) as the inline offset. It does not extend into stepPadding along the orientation axis, so the line stops short of the neighbouring indicators. Where the calc has no equivalent (React Native), the connector track is made exactly indicatorSize on the cross axis and inset by the focus border instead, which lands on the same centre line.' }
    partGap: { token: space.2, part: step, description: 'Inside the step control, between the indicator and its label (and between label and description). Not the control''s padding; that is `stepPadding`.' }
    fontFamily: { token: font.family.body, part: list, description: 'Set on the root and forwarded to each composed Text''s fontFamily override. On React Native a View carries no text style and nothing inherits, so there it is set on the indicator numeral — the only text Stepper draws itself — and reaches every other string through the forwards.' }
    minTarget: { token: size.target.min, part: step, description: 'Minimum block and inline size of a navigable step control. Scoped to the navigable control, as focusRing and stepHover are: a display-only step is not a target and carries no floor. Both kinds of step still carry the transparent focusRingWidth border, so navigable and display-only steps occupy the same box and stay aligned in one list.' }
    focusRing: { token: color.border.focus, part: step, description: 'Focus-visible ring on a navigable step control. Drawn outside the control on web and Lit; on React Native, which has no outline, it is a border inside the box, so every step control reserves focusRingWidth as a transparent border and the connector geometry compensates for it.' }
    focusRingWidth: { token: border.width.focus, part: step, description: 'Width of the focus-visible ring on a navigable step control.' }
    transition: { token: motion.duration.fast, part: connector }
  copy:
    navLabel: Progress
    stepOf:
      text: 'Step {current} of {total}'
      params:
        current: { type: number, description: The current step's position in the flow. }
        total: { type: number, description: How many steps the flow has. }
    complete: completed
    current: current step
    error: has an error
    stepLabel:
      text: 'Step {n}: {label}'
      params:
        n: { type: number, description: The step's position in the flow. }
        label: { type: string, description: The step's own label. }
  a11y:
    role: navigation
    requires: [accessible-name, keyboard-operable, focus-visible, contrast-aa, target-24px, selected-state]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
      - { foreground: color.status.danger.foreground, background: color.status.danger.background, level: AA }
      - { foreground: color.status.danger.icon, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: nav
      attributes: [aria-label, aria-current=step, aria-describedby, data-ds=Stepper]
      notes: 'The root is a <nav> carrying data-ds and aria-label (`label` || copy.navLabel), with the ref typed to it; the `list` part is the <ol> inside, followed by the `count` Text. Each <li> holds either Stepper''s own native <button type="button"> (navigable; not the Button component) or a <div> with the same content. aria-current="step" on the current item''s control. The control''s accessible name is its content: the plain label plus a visually-hidden span reading ", " and the status word (no aria-label; copy.stepLabel is not used on web, since the <ol> gives the ordinal). Upcoming steps have no status word. The indicator shows the step number, a check Icon when complete, or the danger Icon on error. The root has container-type: inline-size and a container query switches a horizontal stepper to `compact` below layout.maxWidth.prose; a container condition cannot read a custom property, so the generator emits the built (resolved) value of that token as the breakpoint, marked literal-ok.'
    lit:
      tag: ds-stepper
      reflect: [orientation, navigable, compact, current]
      notes: '`steps` as a property; shadow <nav aria-label><ol> then the `count` <ds-text>; composed `step-select`. Navigable steps are native <button>s in the shadow root, named exactly as on web (plain label plus visually-hidden ", " and status word; copy.stepLabel unused); aria-describedby to a description only in vertical orientation, within the same shadow root. Label, description and count are <ds-text> with tone props and `overrides` (fontSize, fontWeight, fontFamily) from the forwards, not --ds-stepper-label-* hooks. The host has container-type: inline-size; the compact container query uses the built value of layout.maxWidth.prose emitted by the generator (literal-ok), as on web. `orientation` is reflected and defaults to horizontal, but a Lit default is not reliably on the element before the first update, so every horizontal rule is written `:host(:not([orientation=''vertical'']))` rather than `:host([orientation=''horizontal''])` — the package rule for any reflected enum prop with a default.'
    rn:
      element: View
      props: [accessibilityRole=list, role=listitem, accessibilityLabel]
      notes: 'A plain root View holding the list View (accessibilityRole="list") and, after it, the count Text spaced by `stepGap`, so the count is never inside the list. `ref` is that plain root View (list plus count), not the list View, so it measures the whole component. A role=list whose children are buttons is an unowned-children failure, so each step sits in a `role="listitem"` View — the `role` prop, since React Native''s AccessibilityRole union has no listitem — which is the `step` part and carries `testID="Stepper.step"`, matching the web `<li>`. The listitem supplies no ordinal, which is exactly what `copy.stepLabel` compensates for. The connector is a sibling of the steps rather than a child of one: a horizontal connector has to flex-grow in the list row and centre on the indicator''s axis, which it cannot do from inside a step laid out as a column. It is hidden from the accessibility tree, so it is not an unowned child of the list, but the anatomy differs from web, where the connector lives inside the `<li>`. Each step a Pressable (navigable) or View with accessibilityState={{ selected: current }} and an accessibilityLabel of copy.stepLabel, then ", " and the status word when the step has one (upcoming steps have none): "Step 2: Payment, current step". React Native has no navigation landmark role, so there is no landmark: `label` || copy.navLabel goes on the list View''s accessibilityLabel instead. Composed Text takes no testID, so the label, description and count Texts are each wrapped in a View carrying the part''s testID. `stepHover` applies while the Pressable is pressed or hovered (onHoverIn/onHoverOut). Automatic compact measures the stepper''s own width with onLayout (not the window) against layout.maxWidth.prose, rendering non-compact until the first layout; the root View stretches to its parent (alignSelf: stretch), so the measured width is the space offered, not the content width, and switching to compact cannot narrow it further; in compact the other steps'' label Texts are not rendered, since their accessibilityLabels still carry them. Horizontal steppers use `compact` on phones; vertical is preferred for long flows.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Button, .accessibilityAddTraits=isSelected, .accessibilityValue, Icon, ViewThatFits]
      notes: 'A `.contain` element labelled `copy.navLabel` holding the ordered steps (`HStack`/`VStack` by `orientation`): navigable steps are `Button`s whose accessibility label is `copy.stepLabel` plus the status word, the current step carries `.isSelected` and `.accessibilityValue(copy.current)`; non-navigable steps are plain elements with the same label. Indicators draw the number or the `check`/`danger` Icon; `compact` switches through `ViewThatFits` below the prose width. Not SwiftUI''s `Stepper` (a numeric control).'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    # The indicator is inside the step's control, so clicking it is how a step is activated.
    - name: click-on-a-completed-step-reports-it
      description: A navigable step fires onStepSelect with its id; the container decides whether to move.
      given:
        navigable: 'completed'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
          - { id: 'confirm', label: 'Confirmation' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, with: 'shipping' }
    - name: the-current-step-is-not-navigable
      description: navigable completed means every step before the current one, so the current step itself reports nothing.
      given:
        navigable: 'completed'
        current: 'shipping'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, fired: false }
    - name: display-only-steps-report-nothing
      description: With navigable none the steps are inert text.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, fired: false }
    - name: step-status-is-said-in-words
      description: The status is carried by a word from copy, not by color or glyph alone.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      then:
        - { copy: complete, platforms: [web, lit] }
        - { copy: current, platforms: [web, lit] }
    - name: an-errored-step-says-so
      description: A step marked error is named with copy.error, so the danger glyph is not the only signal.
      given:
        navigable: 'none'
        current: 'review'
        steps:
          - { id: 'shipping', label: 'Shipping address', status: 'complete' }
          - { id: 'payment', label: 'Payment', status: 'error' }
          - { id: 'review', label: 'Review order' }
      then:
        - { copy: error, platforms: [web, lit] }
    - name: compact-shows-the-step-count
      description: Below the prose width the stepper shows only the current label and "Step n of m".
      given:
        compact: true
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
          - { id: 'confirm', label: 'Confirmation' }
      then:
        - { text: 'Step 2 of 4' }
  examples:
    - name: checkout
      description: The usual horizontal flow, where a completed step can be revisited.
      given:
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
    - name: onboarding-with-descriptions
      description: A vertical stepper whose steps each need a line of explanation.
      given:
        orientation: 'vertical'
        current: 'verify'
        steps:
          - { id: 'account', label: 'Create account', description: 'Takes about a minute.' }
          - { id: 'verify', label: 'Verify identity', description: 'Takes about 2 minutes.' }
          - { id: 'plan', label: 'Choose a plan', description: 'Compare features and pricing.' }
    - name: display-only
      description: A flow the user cannot jump around in.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
    - name: a-step-with-an-error
      description: Validation failed on a step the user has already left.
      given:
        current: 'review'
        steps:
          - { id: 'shipping', label: 'Shipping address', status: 'complete' }
          - { id: 'payment', label: 'Payment', status: 'error' }
          - { id: 'review', label: 'Review order' }
---

A stepper is a map of a journey with a "you are here". It sets expectations (five steps, not fifteen), shows progress without a bar, and gives people a way back to a step they finished. It is navigation, not a form control; the number-stepping field is NumberInput.

## When to use

Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).

## When not to use

Do not use a Stepper for two steps (a Button that says "Continue" is enough) or for more than about eight (group them). Do not use it as Tabs — steps have an order and a current position, tabs do not. Do not use it to show task progress (ProgressBar) or to let users jump anywhere in a settings area (a `nav` of Links).

## Behavior

Steps before `current` render complete (check), the current one is marked, later ones are upcoming. A step can be marked `error` explicitly (validation failed on a step the user left). Navigable steps are native buttons that fire `onStepSelect`; the container decides whether to move. Non-navigable steps are inert text. Below the prose width a horizontal stepper shows only the current label and "Step n of m" (`compact`), keeping the row of indicators; the count is the `count` part, one muted Text after the list. A navigable step is its own native `<button>` (Pressable on native) owned by Stepper — not the Button component, whose single-label API cannot hold an indicator, label and description. The status word always joins the name after ", " ("Payment, current step"); upcoming steps have no status word. An explicit `status: 'current'` on a step `current` does not name gives that step the current indicator and the word `copy.current`, but not the selected state. The mirror case is legal too and reads oddly, so prefer not to write it: an explicit `status: 'upcoming'` on the step `current` does name keeps `aria-current="step"` and the selected state while showing the upcoming indicator and, because upcoming has no status word, no status word at all — the selected state is then announced by `aria-current` alone. Connectors take `connectorComplete` by position — the connector after each step before the current one — regardless of explicit statuses. Label and description colors are passed to the composed Text as `tone`/overrides. Every forward (labelWeight, labelCurrentWeight, labelSize, fontFamily and the rest) always carries its binding's token, overridden or not, because the Text's own `weight` prop is not set; the check and danger Icons (size sm) always receive their `size` and `color` overrides the same way. In a horizontal stepper each step is a column (indicator above label) and the label Text is passed `align: center`; vertical labels are start-aligned. Inside the control the order is label, then the visually-hidden status word, then the description, so compact clips label and status word together and the (vertical-only) description never comes between them. The two status-word scenarios are scoped to web and Lit because they assert rendered text: on React Native the status word exists only inside each step's accessibilityLabel, which that package's own tests assert instead. In vertical orientation the description sits inside the control but is aria-hidden there and referenced by the control's aria-describedby (web and Lit), so it is not read twice — that pairing is for the navigable `<button>` only, whose name is computed from its content; a non-navigable step's control is a plain `<div>` with no role, where aria-describedby is not exposed and aria-hiding the description would silence it, so there the description stays ordinary visible text and is read once; the visually-hidden status span follows the label directly, and in compact it is clipped with it. `navigable: completed` means every step before the current one, including one marked `error`. `compact` applies to horizontal steppers only. On web and Lit the list is an `<ol>`, which already announces "item 2 of 5", so the control shows its plain label and adds only the status word as visually hidden text, with no `aria-label` — `copy.stepLabel` is native-only (React Native and SwiftUI), where there is no list ordinal and the accessibility label is `copy.stepLabel` plus that word. When a step carries `status: 'error'` and is also the one `current` names, the error wins for the indicator, its colour and the status word, while the selected state and the compact reveal still follow the id — the user is on that step, and it has a problem. `transition` times the connector's cross-fade between `connector` and `connectorComplete`; the indicator has four discrete states and switches between them at once, as every other multi-state indicator here does.

## Content guidelines

Labels are two or three words in sentence case naming the step's content ("Shipping address", "Review order"), parallel across the list. Descriptions, when used, say what happens or how long it takes. Number the steps only through the indicator; never write "Step 1:" in the label — the component adds it for assistive technology.

## Accessibility

The stepper is a `nav` (named "Progress" or by the flow) containing an ordered list, and the current step carries `aria-current="step"` (WCAG 1.3.1, 4.1.2). Each step's name includes its status from copy and its position — from the list ordinal on web ("Payment, current step", item 2 of 5) and from `copy.stepLabel` on native ("Step 2: Payment, current step") (1.3.3). React Native has no navigation landmark, so there the list itself carries the name. State is conveyed by the check/number/danger glyph and the status word, not by color alone (1.4.1), and the indicator ring meets 3:1 (1.4.11). Navigable steps are native buttons with visible focus and 24px targets; non-navigable ones are not focusable so Tab does not stop on decoration (2.4.3).

## Platform notes

### Web
Render `<nav aria-label={label ?? "Progress"} data-ds="Stepper"><ol>` with an `<li>` per step containing the indicator `<span aria-hidden>` (number, `Icon name="check"`, or `Icon name="danger"`), a connector `<span aria-hidden>` after all but the last, and the label/description `Text`s wrapped in Stepper's own native `<button type="button">` when navigable (with `aria-current="step"` for the current step; not the Button component) or a `<div>` otherwise. A visually-hidden `<span>` inside the control adds ", " and the status word; there is no `aria-label`. After the `<ol>`, the `count` Text renders `copy.stepOf`, shown only in compact. `@container (max-width: <prose px>)` switches to compact for horizontal orientation (the generator emits the built value of `layout.maxWidth.prose`, `literal-ok: breakpoint from layout.maxWidth.prose`, since a container condition cannot read a custom property).

### Lit
`<ds-stepper current="payment" .steps=${steps}></ds-stepper>`; shadow `<nav><ol>`; `step-select` composed; `container-type: inline-size` on the host for the compact switch.

### React Native
A root `View` holding the list `View` (`accessibilityRole="list"`, laid out in a row or column) and the count; each step a `Pressable` (navigable) or `View` with `accessible`, `accessibilityLabel` from `copy.stepLabel` + status word, `accessibilityState.selected` for the current step. Connectors are `View`s with `connectorWidth`. Use `compact` on phones for horizontal steppers (decided by the stepper's own `onLayout` width against `layout.maxWidth.prose`, not the window). No landmark role exists, so the list View carries the name; label, description and count Texts sit in Views that carry their testIDs.

## Related

ProgressBar, Tabs, Breadcrumb, Form, Button.
