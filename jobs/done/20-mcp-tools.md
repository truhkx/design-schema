Read mcp/server.py, mcp/index.py and mcp/smoke.py. Add tools to the FastMCP server, following the existing `_logged` wrapper, docstring style and error handling:

1. get_keyboard_model(component: str) → the component's keyboard rules (keys, action, when, from, expect) from generated/components.json.
2. get_layout_rules(theme: str = "calm-precise", mode: str = "light") → the resolved `layout.*` tokens plus the prose of site/src/content/docs/foundations/layout.md.
3. list_gaps(component: str | None = None) → the contents of generated/gaps/*.md (all, or one component's), so a client can see what the docs were unsure about.
4. start_theme() → the five interview questions from site/src/content/docs/process/from-vision-to-system.md, each with the allowed values/ranges taken from schema/theme.schema.json.
5. write_theme(id: str, answers: dict) → writes site/src/content/docs/themes/<id>.md in the same shape as calm-precise.md (frontmatter from the answers, body sections Feel / Not <excluded word> / References / When to use / When not to use with a first draft written from the tone words), then runs tools/theme.py and tools/check_contrast.py and returns their output. Refuse to overwrite an existing theme unless overwrite=true.

Update the server instructions text so the recommended call order mentions get_layout_rules and get_keyboard_model. Extend mcp/smoke.py to call each new tool. Do not modify anything under packages/ or generated/. Run `python mcp/smoke.py` (or `py -3`) and make it pass.
