Read tests/ to learn the existing pytest conventions, then add tests for the tools added this week:

- tools/lint_literals.py — one fixture file per rule (hex, rgb, px, ms, font stack, RN size number) plus the sanctioned exemptions (visually-hidden 1px within a rule whose context mentions hidden/clip, color-mix of tokens, `literal-ok:` marks, `0px`). Assert exit code and the finding lines.
- tools/keyboard_tests.py — given a minimal components.json entry with a keyboard block, the generated spec contains one `test(` per key with the right `from` setup and `expect` assertion, `test.skip` for `manual`, `getByRole` for roled components and `[data-ds=...]` for role none.
- tools/theme.py — layout tokens scale by density × rhythm; `layout.maxWidth.page` is 4/3 of contentWidth; `color.inverse.link` and `.foreground` meet 4.5:1 on `color.inverse.surface` in both modes; `shadow.overlay` alpha scales with `elevation` and `flat` gives zero alpha; `control_pair` picks a fill with 3:1 on both page and control surface.
- tools/parse.py — composition part must be in anatomy and name an existing doc or one marked "(planned)"; a keyboard block requires keyboard-operable; Escape requires escape-dismiss; `locked` is true for bindings whose token appears in a contrast pair and for focusRing*/minTarget.

Do not modify anything under packages/ or generated/. Run `pytest -q` and make it pass. End with a short summary of what is covered.
