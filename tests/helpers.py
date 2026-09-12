"""Helpers shared by the pytest modules that still cover Python tools.

`expand` used to live in tools/spec_sheet.py, the last Python copy of it; job 303 ported that tool to
TypeScript (`tools/spec_sheet.ts` takes it from `tools/check_contrast.ts`). One module here still needs
it in-process — tests/test_docs.py, which reads the token dist through tools/tokens.py — so the copy
lives here until step 6 of process/typescript-and-currency.md ports mcp/server.py, the last importer of
that module, and this suite becomes a Vitest one.
"""
from __future__ import annotations

import re
from itertools import product


def expand(token_ref: str, props: dict) -> list[str]:
    """color.action.{variant}.background → one path per enum value of `variant`."""
    slots = re.findall(r"\{([a-zA-Z]+)\}", token_ref)
    if not slots:
        return [token_ref]
    choices = []
    for s in slots:
        p = props.get(s)
        if not p or p.get("type") != "enum":
            raise ValueError(f"{token_ref}: '{{{s}}}' must name an enum prop")
        choices.append(p["values"])
    out = []
    for combo in product(*choices):
        ref = token_ref
        for s, v in zip(slots, combo):
            ref = ref.replace(f"{{{s}}}", v)
        out.append(ref[: -len(".default")] if ref.endswith(".default") else ref)  # public names drop a trailing .default
    return out
