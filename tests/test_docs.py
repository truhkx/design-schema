"""The shipped docs and the build outputs they produce.

Read-only: nothing here writes into the repository. These are the checks that
catch a doc that no longer validates, or a `generated/` tree that has drifted
away from the Markdown it came from.
"""
from __future__ import annotations

import json
import re

import pytest

import parse as p
import tokens as tk


COMPONENT_DOCS = sorted(p.DOCS.glob("*.md"))
THEME_DOCS = sorted(p.THEME_DOCS.glob("*.md"))


@pytest.fixture(scope="module")
def validator(component_schema):
    return p.Validator(component_schema)


@pytest.fixture(scope="module")
def generated_components(root):
    return json.loads((root / "generated" / "components.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def generated_themes(root):
    return json.loads((root / "generated" / "themes.json").read_text(encoding="utf-8"))


class TestComponentDocs:
    def test_there_are_component_docs_to_check(self):
        assert COMPONENT_DOCS

    @pytest.mark.parametrize("path", COMPONENT_DOCS, ids=lambda p: p.name)
    def test_frontmatter_validates(self, path, validator):
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        assert "component" in fm, "no `component:` block"
        p.validate(fm, validator, path)

    @pytest.mark.parametrize("path", COMPONENT_DOCS, ids=lambda p: p.name)
    def test_sections_are_allowed_and_complete(self, path):
        _, body = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        p.split_sections(body, path)

    @pytest.mark.parametrize("path", COMPONENT_DOCS, ids=lambda p: p.name)
    def test_every_style_token_exists_in_every_theme(self, path):
        """A style binding must resolve once its {slot}s are filled in."""
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        c = fm["component"]
        import check_contrast as cc

        for theme in tk.themes():
            for mode in tk.modes(theme):
                names = {tk.public_name(k) for k in tk.load_theme(theme, mode)}
                for prop, binding in c.get("styles", {}).items():
                    for ref in cc.expand(binding["token"], c["props"]):
                        # Tokens are addressed by their public name, so a slot that
                        # expands to `...default` resolves to the group itself.
                        assert tk.public_name(ref) in names, \
                            f"{c['name']}.{prop} → {ref} missing in {theme}/{mode}"


class TestThemeDocs:
    def test_there_are_theme_docs_to_check(self):
        assert THEME_DOCS

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_frontmatter_validates(self, path, theme_schema):
        import theme as th

        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        assert "theme" in fm
        errors = list(th.Validator(theme_schema).iter_errors(fm))
        assert not errors, "; ".join(e.message for e in errors)

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_id_matches_the_file_name(self, path):
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        assert fm["theme"]["id"] == path.stem

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_sections_are_allowed_and_complete(self, path):
        _, body = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        p.split_sections(body, path, p.THEME_HEADINGS, ["Feel", "When to use"])

    @pytest.mark.parametrize("path", THEME_DOCS, ids=lambda p: p.name)
    def test_tokens_were_derived_for_it(self, path):
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        assert fm["theme"]["id"] in tk.themes(), "run tools/theme.py"


class TestGeneratedIsInSync:
    def test_one_entry_per_component_doc(self, generated_components):
        assert [e["id"] for e in generated_components] == [d.stem for d in COMPONENT_DOCS]

    def test_one_entry_per_theme_doc(self, generated_themes):
        assert [e["theme"]["id"] for e in generated_themes] == [d.stem for d in THEME_DOCS]

    def test_component_frontmatter_matches_its_doc(self, generated_components):
        for entry in generated_components:
            path = p.DOCS / f"{entry['id']}.md"
            fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
            assert entry["component"] == fm["component"], f"{path.name} is stale — run tools/parse.py"

    def test_guidance_matches_its_doc(self, generated_components):
        for entry in generated_components:
            path = p.DOCS / f"{entry['id']}.md"
            _, body = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
            assert entry["sections"] == p.split_sections(body, path), f"{path.name} is stale"

    def test_a_generation_prompt_exists_for_every_supported_platform(self, root, generated_components):
        for entry in generated_components:
            c = entry["component"]
            for platform, notes in c["platforms"].items():
                if not notes.get("supported", True) or not (p.TEMPLATES / f"{platform}.md").exists():
                    continue
                prompt = root / "generated" / "prompts" / f"{c['name']}.{platform}.md"
                assert prompt.exists(), f"missing {prompt.name} — run tools/parse.py"

    def test_a_feel_skill_exists_for_every_theme(self, root, generated_themes):
        for entry in generated_themes:
            assert (root / "generated" / "prompts" / f"theme.{entry['theme']['id']}.md").exists()

    def test_no_prompt_still_carries_an_unreplaced_placeholder(self, root):
        # Guidance legitimately contains `{{ ... }}` in JSX/Lit samples, so look for
        # the template's own SHOUTING_CASE placeholders only.
        placeholder = re.compile(r"\{\{[A-Z_]+\}\}")
        for prompt in (root / "generated" / "prompts").glob("*.md"):
            found = placeholder.findall(prompt.read_text(encoding="utf-8"))
            assert not found, f"{prompt.name} still has {found}"
