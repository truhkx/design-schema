---
title: FocusScope
description: The focus-confinement primitive. Moves focus in on mount, keeps Tab inside while trapped, and returns focus to where it was on unmount — the piece every modal overlay is built on.
component:
  name: FocusScope
  category: primitive
  status: review
  anatomy: [scope]
  props:
    children:
      type: content
      required: true
      description: The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced.
    trapped:
      type: boolean
      default: true
      description: 'Tab and Shift+Tab wrap within the scope''s focusable descendants, and focus that lands outside is pulled back in. False turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels.'
    autoFocus:
      type: enum
      values: [first, last, container, none]
      default: first
      description: 'Where focus goes on mount: the first focusable descendant, the last, the scope''s own wrapper (made focusable with tabindex -1, for reading-first dialogs), or nowhere.'
    restoreFocus:
      type: boolean
      default: true
      description: 'On unmount, focus returns to the element that was focused when the scope mounted, or to the next focusable element in the document if that one is gone.'
    returnFocusTo:
      type: object
      shape: 'RefObject<HTMLElement | View>'
      description: 'Explicit element to restore focus to instead of the recorded opener. Required on native when the opener is not a TextInput (React Native exposes no generic "currently focused element"), so every overlay passes its trigger ref. The shape names the platforms together; each types it with its own instance: `RefObject<HTMLElement | null>` on web, `HTMLElement | Ref<HTMLElement>` (lit/directives/ref.js) as a non-attribute property on Lit, `RefObject<ViewInstance | null>` on React Native.'
    active:
      type: boolean
      default: true
      description: 'Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is open, so the innermost active scope owns Tab.'
  events:
    onEscapeAttempt:
      description: 'Fired when trapped focus would have left the scope (Tab from the last element, Shift+Tab from the first) just before it wraps, with the direction. Diagnostic; components do not need it.'
      platforms: { web: onEscapeAttempt, lit: escape-attempt, rn: onEscapeAttempt, swiftui: onEscapeAttempt }
      payload:
        - { name: direction, type: enum, values: [forward, backward], description: 'forward for Tab from the last element, backward for Shift+Tab from the first.' }
      fires: [user]
      timing: { phase: before-change }
  keyboard:
    - { keys: [Tab], action: 'From the last focusable descendant, wraps to the first.', from: last, expect: focus-wraps-to-first, platforms: [web, lit, swiftui] }
    - { keys: [Shift+Tab], action: 'From the first focusable descendant, wraps to the last.', from: first, expect: focus-wraps-to-last, platforms: [web, lit, swiftui] }
    - { keys: [Tab], action: Ordinary forward movement inside the scope., from: first, expect: focus-next }
  styles: {}
  a11y:
    role: none
    requires: [focus-trap, focus-restore, keyboard-operable]
  platforms:
    web:
      element: div
      attributes: [tabindex=-1, data-focus-scope]
      notes: 'A <div data-focus-scope> wrapper. Focusable descendants are collected in DOM order including across open shadow roots and assigned slot nodes (the same walker the keyboard gate uses); disabled and aria-hidden subtrees are excluded, as are elements with tabindex=-1 except the container itself. "Disabled" means native `:disabled` controls and everything inside a `fieldset[disabled]`, plus `inert` subtrees; `aria-disabled` elements stay in, because the system keeps them focusable. The wrapper carries tabindex=-1 only while `autoFocus` is `container`; otherwise it has no tabindex. Keydown on Tab at the edges calls preventDefault and focuses the other edge. A focusin listener on document pulls focus back to the last focused descendant if it leaves while trapped and active. Elements are not tested for visibility: one hidden by CSS but neither aria-hidden nor inert still counts as focusable, which keeps the walker cheap and matches what the browser does with tabindex. Two sentinel elements (tabindex=0, visually hidden, data-focus-sentinel so the keyboard gate ignores them) at each end catch focus arriving from the browser chrome; each continues the direction of travel rather than wrapping — the start sentinel sends focus to the first descendant, the end sentinel to the last, since wrapping is the Tab handler''s job at the real edges. The sentinels carry tabindex=0 only while the scope is trapped, active and top of the stack, and tabindex=-1 otherwise, so an untrapped or paused scope adds no tab stops; the Tab handler and the focusin pull-back likewise do nothing unless the scope is trapped, active and on top. With nothing to pull focus back to (no focusable descendant and `autoFocus` not `container`), focus is left where it went and the development warning below covers it. Restoring to "the next focusable element" when the opener is gone needs the opener''s old position, so the scope leaves an invisible marker node beside it on mount and restores to the first focusable element after that marker. Nested scopes register in a module-level stack and only the top is effective; `active: false` additionally pauses a scope wherever it sits in that stack. Stack order follows tree nesting, not effect order: an outer scope mounted in the same commit as its inner one registers below it (the parent link travels through context). Only active scopes count when picking the top, and a scope whose `active` turns back on moves to the top. The wrapper is `display: block`, not `display: contents`, because `autoFocus: container` needs a real box to carry tabindex — so the scope always adds one element to the layout. A trapped scope with no focusable descendants warns in development, since that is an inescapable trap.'
    lit:
      tag: ds-focus-scope
      reflect: [{ prop: trapped, attribute: no-trapped }, { prop: active, attribute: no-active }]
      notes: 'The host is the wrapper (display: contents is NOT used — it breaks focus delegation; the host is display: block). Same walker; slotted light-DOM children are included via assignedElements({ flatten: true }). `escape-attempt` is a composed CustomEvent. `delegatesFocus` would send a `focus()` on the host into the first focusable descendant, so `autoFocus: container` targets an invisible tabindex=-1 anchor rendered first in the shadow root: focus lands there, nothing interactive is announced, and the host stays out of the tab order. This is a stated exception to the rule that focusable Lit components use `delegatesFocus`: the host does not use it, so `host.focus()` does nothing. That anchor also carries `part` and `data-part="scope"`, since the host itself is outside the shadow root the test locator searches. `restoreFocus` is the non-reflected negated attribute `no-restore-focus`; `autoFocus` is the attribute `auto-focus`. Composing overlays set `trapped`, `active` and `restoreFocus` as properties (`.active=${open}`), never as boolean attributes, which cannot turn off a true default. Because slotted system children render their focusable internals after the scope''s first update, `autoFocus` (and the empty-scope warning) waits for the slotted elements'' `updateComplete`, and the scope''s own `updateComplete` includes that wait.'
    rn:
      element: View
      props: [accessibilityViewIsModal]
      notes: 'There is no Tab order to confine on native. `trapped && active` maps to accessibilityViewIsModal on the wrapper View (VoiceOver/TalkBack ignore siblings), so a paused outer scope does not hide a nested Menu from the screen reader. There is no way to walk arbitrary children for a focusable descendant, so `first`, `last` and `container` all call AccessibilityInfo.setAccessibilityFocus on the wrapper View and only `none` differs — the screen reader then reads the scope from its top, which is the intended result for all three. restoreFocus can only capture an opener that is a TextInput (TextInput.State.currentlyFocusedInput is the one "what is focused" native exposes), which is why `returnFocusTo` is required here for every other kind of trigger. onEscapeAttempt never fires on this platform: nothing can attempt to leave a Tab order that does not exist. Hardware-keyboard Tab wrapping is not implemented; that is a platform limit, so the two wrap keyboard rules exclude rn (on react-native-web Tab is not confined either), and screen-reader users are kept inside by accessibilityViewIsModal instead. Neither `role` nor `accessibilityRole` nor `accessibilityLabel` is set on the wrapper.'
    swiftui:
      element: VStack
      props: ['@FocusState', '@AccessibilityFocusState', .focusSection, .focusScope, .onExitCommand, .accessibilityAddTraits=isModal]
      notes: 'The engine in `Support/FocusScope.swift`: `.focusSection()` bounds Tab/Shift+Tab on iPad keyboards inside the scope (`trap`), `@AccessibilityFocusState` moves VoiceOver focus to `autoFocus`''s target on appear and back to `returnFocusTo` (or the element that opened the scope) on disappear, and `.accessibilityAddTraits(.isModal)` tells VoiceOver to ignore siblings while a modal scope is up. Escape reaches the scope through `.onExitCommand`; `onEscapeAttempt` fires when the scope is asked to close and the owner decides. Wrapping is done by tracking the first/last focusable identifiers the children register through a preference.'
  behavior:
    # Authored scenarios; the parser adds the renders/enum ones from the schema.
    # The wrap itself (Tab from the last descendant to the first) has no clause: it needs a
    # two-step focus assertion the vocabulary does not have. The Keyboard story and the keyboard gate cover it.
    - name: auto-focus-container-focuses-the-wrapper
      description: 'autoFocus container makes the wrapper focusable with tabindex -1 and puts focus on it, for reading-first dialogs.'
      given: { autoFocus: container }
      then:
        - { focused: scope }
      platforms: [web, lit]
    - name: auto-focus-none-moves-focus-nowhere
      description: 'autoFocus none leaves focus where it was; the scope never takes it on its own.'
      given: { autoFocus: none }
      then:
        - { focused: none }
      platforms: [web, lit]
    - name: the-wrapper-is-not-focusable
      description: The scope renders no element of its own beyond a wrapper that is not focusable, unless autoFocus is container.
      given: { autoFocus: none }
      then:
        - { focusable: false }
      platforms: [web, lit]
    - name: the-scope-adds-no-role
      description: The scope adds no role and no name; assistive technology never perceives it.
      then:
        - { attribute: role, is: null }
  examples:
    - name: modal-takeover
      description: A new modal surface the system does not have yet, trapped with an Escape handler of its own.
      given: { children: 'A full-screen onboarding overlay with its own close Button', trapped: true, autoFocus: first }
    - name: non-modal-drawer
      description: A panel that moves focus in and restores it on close while leaving the page usable.
      given: { children: 'A slide-in filter drawer', trapped: false, autoFocus: first }
    - name: reading-first
      description: A dialog whose text should be read from the top, so focus lands on the container rather than a control.
      given: { children: 'A long terms-of-service body with Accept and Decline Buttons', autoFocus: container }
    - name: paused-outer-scope
      description: The outer scope of a nested pair, inactive while a Menu inside owns Tab.
      given: { children: 'A dialog body with a Menu open inside it', active: false }
---

FocusScope is the smallest possible answer to the hardest accessibility bug: focus that escapes a modal, or never comes back from one. It has no appearance and no opinion about what is inside it. It moves focus in, keeps Tab inside, and puts focus back — and because it exists once, every overlay that composes it gets those three behaviors right by construction rather than by re-implementation.

## When to use

Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their composition, and that is where it should live. Render it yourself only when building a new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay), with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal panel that should still move focus in and restore it on close (a slide-in filter drawer that keeps the page usable).

## When not to use

Do not trap focus in anything that is not modal: a sidebar, a form section, a sticky toolbar. A user who cannot Tab past your panel to the rest of the page is trapped in the WCAG sense, which is a failure, not a feature. Do not use it to make a composite (a menu, a tab list); those use a roving tabindex and let Tab leave. Do not nest it inside a native `<dialog>` that already does the same work unless you are the Dialog component — one scope per modal.

## Behavior

On mount, the scope records `document.activeElement` (the opener), collects its focusable descendants, and focuses per `autoFocus`. While `trapped` and `active`, Tab from the last descendant wraps to the first and Shift+Tab from the first wraps to the last, firing `onEscapeAttempt` first; focus arriving outside the scope from any cause is returned to the last focused descendant. When a nested scope mounts, the outer one becomes inactive until the inner unmounts. On unmount with `restoreFocus`, the opener is focused if it is still in the document; otherwise the next focusable element after its former position. The scope never handles Escape and never makes anything inert — the overlay owns both. `autoFocus` runs once on mount and restore once on unmount; later changes to `active`, `trapped` or `autoFocus` do not re-run either. With `autoFocus: container`, Tab from the wrapper goes to the first descendant and Shift+Tab from it wraps to the last, firing `onEscapeAttempt` with `backward`. The wrapper is the root, carries the `scope` part, and is exposed through `ref`; FocusScope's own `data-part="scope"` wins, and a composing overlay puts its own part on an element it owns. The Default story is a trapped scope around a Text ("Confirm your changes") and two Buttons, "Cancel" and "Continue".

## Content guidelines

None; the scope renders nothing visible.

## Accessibility

A modal must keep keyboard focus within it while open and must provide a way out (WCAG 2.1.2 No Keyboard Trap: Escape, provided by the composing overlay, and the overlay's close controls); FocusScope implements the confinement half and the overlay the exit. Focus moves into the overlay on open and returns on close so sequential navigation remains meaningful (2.4.3 Focus Order). Focus is never left on `body` or on an element that has been removed. The scope adds no role and no name; assistive technology never perceives it. The `Keyboard` story and the keyboard gate verify the wrap in both directions.

## Platform notes

### Web
Render `<div data-focus-scope tabindex={autoFocus === 'container' ? -1 : undefined}>` with two visually hidden sentinels (`<span tabindex="0" data-focus-sentinel>`) at the start and end; a sentinel receiving focus continues the direction of travel (start sentinel → first descendant, end sentinel → last), which handles focus arriving from browser chrome. Keydown handler for Tab/Shift+Tab at the edges. `document.addEventListener('focusin')` while active and trapped, pulling focus back if `!scope.contains(deepActiveElement)`. The focusable walker descends open shadow roots and includes slot-assigned nodes, and skips `[inert]`, `[aria-hidden="true"]` subtrees, `disabled` and `tabindex="-1"` (except the container). Module-level scope stack for nesting.

### Lit
`<ds-focus-scope trapped>`; the host is a block wrapper with a default slot; walker uses `assignedElements({ flatten: true })` plus shadow-root descent. Sentinels live in the shadow root. Composed `escape-attempt`. `active` is reflected so the outer scope of a nested pair can be styled if needed (it usually is not).

### React Native
A `View` with `accessibilityViewIsModal={trapped}`; on mount, `setAccessibilityFocus` on the wrapper for `first`, `last` and `container` alike (children cannot be walked); on unmount, `setAccessibilityFocus` on `returnFocusTo` or the stored TextInput opener. No Tab handling; `onEscapeAttempt` never fires on native.

## Related

Dialog, AlertDialog, BottomSheet, ActionSheet, Menu.
