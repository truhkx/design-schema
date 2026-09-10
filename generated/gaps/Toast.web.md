# Gaps reported while generating Toast for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:30 — round 1

- Escape-dismiss has no matching value in the `onDismiss` reason enum (timeout/dismiss-button/action/replaced); mapped Escape to reason 'dismiss-button' as the closest semantic match.
- dismissColor (color.inverse.foreground) can't be independently expressed: both action and dismiss buttons are composed via Button's `inverse` ghost variant, which always renders ghost text in color.inverse.link (Button has no foreground-color override slot), so per the 'never restyle a child' rule both buttons end up the same color rather than dismiss reading as the more neutral color.inverse.foreground.
- focusRing/focusRingWidth (locked, color.border.focus/border.width.focus) have no locus of application: Toast's own root isn't focusable, and its only focusable children (the composed Buttons) already use focusRingInverse via Button's `inverse` prop, so these two bindings are declared in the schema but not wired to any CSS.
- duration's schema default stays `short` even though the guidance says persistent is 'required' when there's an action or tone is danger; rather than silently overriding the documented default, added a dev-only console.warn nudging the consumer instead.
- Same-id replacement and 3-toast overflow eviction remove the old/evicted entry synchronously from the store and call its onDismiss('replaced') immediately, without playing that toast's own exit transition (only UI-triggered dismissal — timeout/button/action — waits for the fade-out).
- short/long duration timings (~5s/~10s, 'computed from motion.duration.loop × 6/×12 so themes without motion still get sensible times') are hardcoded ms constants (5000/10000) rather than read from the active theme at runtime, since a component has no way to measure a resolved CSS custom property synchronously (same precedent as Tooltip's DEFAULT_DELAY_MS) — exact timing won't track a theme's actual motion.duration.loop value.
- The `id` prop on a directly-rendered `<Toast>` (outside the `toast()`/`ToastRegion` store) is just the native DOM id attribute; the 'same id replaces the previous toast' de-duplication only happens inside the store, so standalone Toast usage gets no replace semantics from `id` alone.
- F6 focus-restore keeps only one `previousFocusRef` at the ToastRegion level; if focus moves around by mouse between an F6 entry and a second F6 press, 'return to where focus was' returns to the most recent F6-recorded origin rather than tracking arbitrary intermediate focus changes.
