Write tools/spec_sheet.py that generates site/src/content/docs/foundations/spec-sheet.md (a Starlight page; mark it generated in a comment and in the description) from packages/tokens/dist/<theme>/json/tokens.light.json and tokens.dark.json and generated/components.json, for every theme found:

- Spacing: the `space.*` scale and the `layout.*` rhythm tokens as labelled horizontal bars sized to their value (inline styles are fine on this one page; use the resolved px values since it is a spec, not a component).
- Type: each `font.size.*` rendered at its size with its px value, and the weights.
- Color roles: every semantic color (foreground, background, border, link, control, status, overlay, inverse) as a swatch in light and dark with the hex, and for every contrast pair declared by any component, the ratio and pass/fail per mode (reuse tools/check_contrast.py's functions; do not duplicate the math).
- Components: one section per component listing each style binding → token → resolved light/dark value, with locked bindings marked.

Add a `spec-sheet` script to package.json (`node tools/py.mjs tools/spec_sheet.py`) and call it from the `check` script after check_contrast. Register the page under Foundations in site/astro.config (sidebar) if the sidebar is explicit; otherwise rely on autogenerate. Do not modify anything under packages/ source or generated/. Run it and confirm the page validates with `pnpm parse` (it must not carry a component: or theme: frontmatter key).
