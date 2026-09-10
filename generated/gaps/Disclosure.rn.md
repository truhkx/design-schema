# Gaps reported while generating Disclosure for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:54 — round 1

- The rn platform notes only say the trigger contains "the chevron and a Text" without naming a component; the general icon rule ("never draw an inline SVG... by hand") and Icon's own docstring (which lists "the chevron in a Disclosure" as a usage example) make clear it should be the system Icon, so I render `<Icon name="chevron-right">` rotated 90deg via Animated for the open state, since chevron-right's path rotated 90deg matches chevron-down exactly — the file previously hand-drew the chevron with bordered Views, which I replaced.
- The spec's overridable-bindings table (triggerFontSize etc.) applies to the trigger text, but Icon only accepts an enum `size` (xs/sm/md/lg/xl) tied to fixed tokens, not an arbitrary resolved number. To keep the 1em chevron in sync with an overridden triggerFontSize, I forward the same TokenRef to Icon's own `overrides.size`; the schema doesn't spell this out.
- Web platform notes call for mirroring the chevron under `[dir=rtl]`; RN platform notes say nothing about RTL, and there's a `chevron-left` glyph available but no guidance on when to use it on native. I left the chevron unmirrored (matches the RN notes as given) — flagging in case RTL support is expected there too.
- The previously-generated file was missing `overrides`/`DisclosureOverridableBinding` entirely and the root `testID="Disclosure"` hook required by package convention; both were added to match the other generated components.
