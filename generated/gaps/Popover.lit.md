# Gaps reported while generating Popover for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:06 — round 1

- heading: no level is specified in the schema for the composed <ds-heading>; chose level=3 (Popover sits one step below a typical Dialog's level 2). A future 'headingLevel' prop would remove the guess.
- trigger accessible-name fallback: since aria-controls can't cross the shadow boundary and the trigger is arbitrary slotted content, the panel's aria-label (when heading is unset) is read from the trigger's aria-label/label/textContent attributes in that order. This works for <ds-button label="..."> authored via attribute syntax (as in the stories) but not for a trigger whose accessible name is set only via a JS property binding (`.label=`) or is entirely composed inside another element's shadow root — no generic cross-shadow-boundary way to read an arbitrary element's computed accessible name exists from outside.
- trigger activation (keyboard 'Enter/Space toggles from the trigger') is implemented via a native `click` listener on the slotted trigger, matching the web platform note's 'onClick toggle' — this covers any native-activatable element (button, link) but not a non-native focusable trigger (e.g. a plain <div tabindex="0">) that doesn't itself convert Enter/Space to a click.
- 'has-accessible-name' scenario is ambiguous for a closed-by-default Popover: the host `ds-popover` itself carries no role/aria-label (only the trigger and, once open, the panel do). Implemented so the trigger always has its own accessible name; flagging in case the scenario expects the host element itself to expose one.
- arrow (showArrow): rendered as a single rotated square with a border only on its top+left edges (a common CSS shortcut for a diamond pointer), so it doesn't perfectly blend into the panel border for every placement side — a pixel-perfect per-side border was out of scope for the described 'small pointer'.
- 'inset' token governs the panel's own padding (matching Dialog's precedent for its 'inset' binding); the anatomy's separate 'body: Box' composition is used for the default-slot wrapper without setting Box's own `inset` attribute, mirroring how Dialog.ts composes its body Box.
- dismissible defaults to true and the schema's platforms.lit.reflect list does not include it, but the generic 'booleans that default to true' rule requires a negated, reflected attribute (`no-dismiss`) — implemented via a custom Lit converter since it's not in the reflect list and no existing component demonstrates this exact pattern (Dialog.ts's own `dismissible` does NOT follow this rule, reflecting a plain, non-negatable boolean instead).

## 2026-09-10 18:06 — round 1

- Popover: the existing generated Popover.ts had `heading-level` listed under platforms.lit.reflect and headingLevel in the schema (enum '2'|'3'|'4', default '3'), but the class had no headingLevel property and the panel heading was hardcoded to level="3" — added the missing @property (reflected, attribute heading-level), wired it into the <ds-heading level> binding, exported PopoverHeadingLevel from index.ts, and added the HeadingLevel2/3/4 stories plus the headingLevel arg/argType that were also missing.
