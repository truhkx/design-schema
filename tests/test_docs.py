"""The shipped docs against the Python-side tooling that still reads them: the theme schema and the token
resolver. The parser-side checks (component frontmatter validates, sections are allowed, generated/ is in sync)
live in tools/__tests__/docs.test.ts next to tools/parse.ts.

Read-only: nothing here writes into the repository.
"""
from __future__ import annotations

import re

import pytest
import yaml

import tokens as tk

ROOT = tk.ROOT
COMPONENT_DOCS = sorted((ROOT / "site" / "src" / "content" / "docs" / "components").glob("*.md"))
THEME_DOCS = sorted((ROOT / "site" / "src" / "content" / "docs" / "themes").glob("*.md"))
FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.S)


def frontmatter(path) -> dict:
    m = FRONTMATTER.match(path.read_text(encoding="utf-8"))
    assert m, f"{path.name}: missing YAML frontmatter block"
    return yaml.safe_load(m.group(1)) or {}


class TestComponentDocs:
    def test_there_are_component_docs_to_check(self):
        assert COMPONENT_DOCS

    @pytest.mark.parametrize("path", COMPONENT_DOCS, ids=lambda p: p.name)
    def test_every_style_token_exists_in_every_theme(self, path):
        """A style binding must resolve once its {slot}s are filled in."""
        c = frontmatter(path)["component"]
        import check_contrast as cc

        for theme in tk.themes():
            for mode in tk.modes(theme):
                names = {tk.public_name(k) for k in tk.load_theme(theme, mode)}
                for prop, binding in c.get("styles", {}).items():
                    for ref in cc.expand(binding["token"], c["props"]):
                        # Tokens are addressed by their public name, so a slot that
                        # expands to `...default` resolves to the group itself. A slot that
                        # expands to `none`/`full` renders nothing rather than a token
                        # (NO_TOKEN_VALUES in tools/parse.ts), so it needs none.
                        if set(ref.split(".")) & {"none", "full"}:
                            continue
                        assert tk.public_name(ref) in names, \
                            f"{c['name']}.{prop} → {ref} missing in {theme}/{mode}"


class TestThemeDocs:
    def test_there_are_theme_docs_to_check(self):
        assert THEME_DOCS

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_frontmatter_validates(self, path, theme_schema):
        import theme as th

        fm = frontmatter(path)
        assert "theme" in fm
        errors = list(th.Validator(theme_schema).iter_errors(fm))
        assert not errors, "; ".join(e.message for e in errors)

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_tokens_were_derived_for_it(self, path):
        assert frontmatter(path)["theme"]["id"] in tk.themes(), "run tools/theme.py"
