"""tools/parse.py — component docs to generated/components.json and the prompts."""
from __future__ import annotations

import json

import pytest
import yaml

import parse as p
from parse import DocError


@pytest.fixture
def validator(component_schema):
    return p.Validator(component_schema)


def fm_text(component: dict, **top) -> str:
    return yaml.safe_dump({**top, "component": component}, sort_keys=False, allow_unicode=True)


BODY = """
Intro prose before any heading.

## When to use

Use it when you need it.

## Accessibility

It is accessible.
"""


class TestSplitFrontmatter:
    def test_splits_frontmatter_from_body(self, tmp_path):
        f = tmp_path / "x.md"
        f.write_text("---\ntitle: Button\n---\nBody text\n", encoding="utf-8")
        fm, body = p.split_frontmatter(f.read_text(encoding="utf-8"), f)
        assert fm == {"title": "Button"}
        assert body == "Body text\n"

    def test_missing_frontmatter_is_an_error(self, tmp_path):
        f = tmp_path / "x.md"
        with pytest.raises(DocError, match="missing YAML frontmatter"):
            p.split_frontmatter("# Just a heading\n", f)

    def test_invalid_yaml_is_reported_with_the_file_name(self, tmp_path):
        f = tmp_path / "broken.md"
        with pytest.raises(DocError, match="broken.md: invalid YAML"):
            p.split_frontmatter("---\na: [1, 2\n---\nbody\n", f)

    def test_empty_frontmatter_becomes_an_empty_mapping(self, tmp_path):
        fm, _ = p.split_frontmatter("---\n\n---\nbody\n", tmp_path / "x.md")
        assert fm == {}

    def test_body_may_itself_contain_a_horizontal_rule(self, tmp_path):
        _, body = p.split_frontmatter("---\ntitle: X\n---\nbefore\n\n---\n\nafter\n", tmp_path / "x.md")
        assert "before" in body and "after" in body


class TestSplitSections:
    def test_text_before_the_first_heading_becomes_overview(self, tmp_path):
        s = p.split_sections(BODY, tmp_path / "x.md")
        assert s["Overview"] == "Intro prose before any heading."
        assert s["When to use"] == "Use it when you need it."

    def test_empty_sections_are_dropped(self, tmp_path):
        body = "## When to use\n\nyes\n\n## Accessibility\n\nyes\n"
        assert "Overview" not in p.split_sections(body, tmp_path / "x.md")

    def test_unknown_heading_is_rejected_and_lists_the_allowed_ones(self, tmp_path):
        body = BODY + "\n## Vibes\n\nnope\n"
        with pytest.raises(DocError, match="'## Vibes' is not allowed"):
            p.split_sections(body, tmp_path / "x.md")

    def test_duplicate_heading_is_rejected(self, tmp_path):
        body = BODY + "\n## When to use\n\nagain\n"
        with pytest.raises(DocError, match="duplicate section"):
            p.split_sections(body, tmp_path / "x.md")

    @pytest.mark.parametrize("missing", ["When to use", "Accessibility"])
    def test_required_sections_must_be_present(self, tmp_path, missing):
        body = BODY.replace(f"## {missing}", "## Behavior")
        with pytest.raises(DocError, match=f"required section '## {missing}'"):
            p.split_sections(body, tmp_path / "x.md")

    def test_a_required_section_that_is_present_but_empty_still_fails(self, tmp_path):
        body = "## When to use\n\nyes\n\n## Accessibility\n\n"
        with pytest.raises(DocError, match="required section '## Accessibility'"):
            p.split_sections(body, tmp_path / "x.md")

    def test_a_heading_may_be_qualified_with_a_suffix(self, tmp_path):
        body = BODY + "\n## Examples with icons\n\nsome\n"
        assert "Examples with icons" in p.split_sections(body, tmp_path / "x.md")

    def test_a_prefix_that_is_not_a_word_boundary_is_still_rejected(self, tmp_path):
        body = BODY + "\n## Behaviors\n\nsome\n"
        with pytest.raises(DocError, match="not allowed"):
            p.split_sections(body, tmp_path / "x.md")

    def test_hashes_inside_a_fenced_code_block_are_not_headings(self, tmp_path):
        body = BODY + "\n## Examples\n\n```md\n## Not A Heading\n```\n"
        s = p.split_sections(body, tmp_path / "x.md")
        assert "Not A Heading" not in s
        assert "## Not A Heading" in s["Examples"]

    def test_sub_headings_are_kept_inside_their_section(self, tmp_path):
        body = BODY + "\n## Platform notes\n\n### Web\n\nweb text\n"
        assert "### Web" in p.split_sections(body, tmp_path / "x.md")["Platform notes"]

    def test_the_allowed_and_required_lists_are_configurable(self, tmp_path):
        body = "## Feel\n\nquiet\n\n## When to use\n\nalways\n"
        s = p.split_sections(body, tmp_path / "t.md", p.THEME_HEADINGS, ["Feel", "When to use"])
        assert s["Feel"] == "quiet"


class TestValidate:
    def _check(self, component, validator, tmp_path, stem="widget"):
        p.validate({"component": component}, validator, tmp_path / f"{stem}.md")

    def test_a_well_formed_component_passes(self, component, validator, tmp_path):
        self._check(component, validator, tmp_path)

    def test_schema_errors_are_reported_with_their_path(self, component, validator, tmp_path):
        component["category"] = "vibes"
        with pytest.raises(DocError, match="component.category"):
            self._check(component, validator, tmp_path)

    def test_missing_required_frontmatter_key_fails(self, component, validator, tmp_path):
        del component["a11y"]
        with pytest.raises(DocError, match="failed schema validation"):
            self._check(component, validator, tmp_path)

    def test_name_must_match_the_file_name(self, component, validator, tmp_path):
        with pytest.raises(DocError, match="should match file name"):
            self._check(component, validator, tmp_path, stem="gadget")

    def test_hyphens_in_the_file_name_are_ignored_when_matching(self, component, validator, tmp_path):
        component["name"] = "TextField"
        component["styles"] = {"radius": {"token": "radius.md"}}
        self._check(component, validator, tmp_path, stem="text-field")

    def test_a_token_slot_must_name_an_enum_prop(self, component, validator, tmp_path):
        component["styles"]["background"] = {"token": "color.action.{label}.background"}
        with pytest.raises(DocError, match="'label' is not an enum prop"):
            self._check(component, validator, tmp_path)

    def test_a_token_slot_naming_no_prop_at_all_is_rejected(self, component, validator, tmp_path):
        component["styles"]["background"] = {"token": "color.action.{tone}.background"}
        with pytest.raises(DocError, match="interpolates '\\{tone\\}'"):
            self._check(component, validator, tmp_path)

    def test_a_gesture_event_requires_a_non_gesture_alternative(self, component, validator, tmp_path):
        component["events"]["onSwipe"] = {"description": "Swiped.", "gesture": True,
                                          "platforms": {"web": "onSwipe", "rn": "onSwipe"}}
        with pytest.raises(DocError, match="gesture-alternative"):
            self._check(component, validator, tmp_path)

    def test_a_gesture_event_passes_once_the_alternative_is_declared(self, component, validator, tmp_path):
        component["events"]["onSwipe"] = {"description": "Swiped.", "gesture": True,
                                          "platforms": {"web": "onSwipe", "rn": "onSwipe"}}
        component["a11y"]["requires"].append("gesture-alternative")
        self._check(component, validator, tmp_path)

    def test_every_event_must_map_on_every_supported_platform(self, component, validator, tmp_path):
        del component["events"]["onPress"]["platforms"]["rn"]
        with pytest.raises(DocError, match="no mapping for platform 'rn'"):
            self._check(component, validator, tmp_path)

    def test_an_unsupported_platform_needs_no_event_mapping(self, component, validator, tmp_path):
        component["platforms"]["lit"] = {"supported": False, "notes": "Not mapped yet."}
        self._check(component, validator, tmp_path)


class TestRenderPrompt:
    def test_every_placeholder_is_substituted(self, component, tmp_path, monkeypatch):
        templates = tmp_path / "templates"
        templates.mkdir()
        (templates / "web.md").write_text(
            "# {{NAME}} for {{PLATFORM}}\n\n{{SCHEMA_YAML}}\n\n{{GUIDANCE}}\n\n{{PLATFORM_NOTES}}\n")
        monkeypatch.setattr(p, "TEMPLATES", templates)
        out = p.render_prompt(component, {"When to use": "Use it.", "Accessibility": "A11y."},
                              "web", fm_text(component))
        assert "# Widget for web" in out
        assert "name: Widget" in out
        assert "## When to use\n\nUse it." in out
        assert "element: button" in out
        assert "{{" not in out

    def test_guidance_follows_the_canonical_section_order(self, component, tmp_path, monkeypatch):
        templates = tmp_path / "templates"
        templates.mkdir()
        (templates / "web.md").write_text("{{GUIDANCE}}")
        monkeypatch.setattr(p, "TEMPLATES", templates)
        out = p.render_prompt(component, {"Accessibility": "A.", "Overview": "O.", "When to use": "W."},
                              "web", fm_text(component))
        assert out.index("## Overview") < out.index("## When to use") < out.index("## Accessibility")


class TestMain:
    """main() reads DOCS + THEME_DOCS and writes generated/."""

    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch, component_schema):
        docs, themes, out, templates = (tmp_path / n for n in ("components", "themes", "generated", "templates"))
        for d in (docs, themes, out, templates):
            d.mkdir()
        (templates / "web.md").write_text("{{NAME}}|{{PLATFORM}}|{{SCHEMA_YAML}}|{{GUIDANCE}}|{{PLATFORM_NOTES}}")
        (templates / "rn.md").write_text("{{NAME}}|{{PLATFORM}}|{{SCHEMA_YAML}}|{{GUIDANCE}}|{{PLATFORM_NOTES}}")
        (templates / "theme.md").write_text("{{NAME}}|{{TONE}}|{{NOT}}|{{THEME_YAML}}|{{TOKENS_LIGHT}}|{{GUIDANCE}}")
        monkeypatch.setattr(p, "DOCS", docs)
        monkeypatch.setattr(p, "THEME_DOCS", themes)
        monkeypatch.setattr(p, "OUT", out)
        monkeypatch.setattr(p, "TEMPLATES", templates)
        monkeypatch.setattr(p, "ROOT", tmp_path)
        return docs, out

    def test_writes_components_json_and_a_prompt_per_platform(self, sandbox, component):
        docs, out = sandbox
        (docs / "widget.md").write_text("---\n" + fm_text(component, title="Widget",
                                                          description="A widget.") + "---\n" + BODY, encoding="utf-8")
        assert p.main() == 0
        entries = json.loads((out / "components.json").read_text(encoding="utf-8"))
        assert [e["id"] for e in entries] == ["widget"]
        assert entries[0]["title"] == "Widget"
        assert entries[0]["published"] is True, "status review counts as published"
        assert entries[0]["sections"]["When to use"] == "Use it when you need it."
        assert (out / "prompts" / "Widget.web.md").exists()
        assert (out / "prompts" / "Widget.rn.md").exists()

    def test_draft_components_are_marked_unpublished(self, sandbox, component):
        docs, out = sandbox
        component["status"] = "draft"
        (docs / "widget.md").write_text("---\n" + fm_text(component) + "---\n" + BODY, encoding="utf-8")
        p.main()
        assert json.loads((out / "components.json").read_text())[0]["published"] is False

    def test_no_prompt_is_written_for_a_platform_without_a_template(self, sandbox, component):
        docs, out = sandbox
        component["platforms"]["lit"] = {"tag": "ds-widget"}
        component["events"]["onPress"]["platforms"]["lit"] = "press"
        (docs / "widget.md").write_text("---\n" + fm_text(component) + "---\n" + BODY, encoding="utf-8")
        assert p.main() == 0
        assert not (out / "prompts" / "Widget.lit.md").exists()

    def test_no_prompt_is_written_for_an_unsupported_platform(self, sandbox, component):
        docs, out = sandbox
        component["platforms"]["rn"] = {"supported": False, "notes": "Later."}
        (docs / "widget.md").write_text("---\n" + fm_text(component) + "---\n" + BODY, encoding="utf-8")
        assert p.main() == 0
        assert not (out / "prompts" / "Widget.rn.md").exists()

    def test_a_doc_without_a_component_block_is_an_error(self, sandbox, capsys):
        docs, _ = sandbox
        (docs / "widget.md").write_text("---\ntitle: Widget\n---\n" + BODY, encoding="utf-8")
        assert p.main() == 1
        assert "no `component:` block" in capsys.readouterr().err

    def test_one_bad_doc_does_not_stop_the_others(self, sandbox, component):
        docs, out = sandbox
        (docs / "widget.md").write_text("---\n" + fm_text(component) + "---\n" + BODY, encoding="utf-8")
        (docs / "broken.md").write_text("no frontmatter at all\n", encoding="utf-8")
        assert p.main() == 1
        assert [e["id"] for e in json.loads((out / "components.json").read_text())] == ["widget"]

    def test_zero_docs_is_not_a_failure(self, sandbox):
        _, out = sandbox
        assert p.main() == 0
        assert json.loads((out / "components.json").read_text()) == []


class TestParseThemes:
    def test_a_theme_without_derived_tokens_is_reported(self, tmp_path, monkeypatch, theme):
        themes, out, templates = (tmp_path / n for n in ("themes", "generated", "templates"))
        for d in (themes, out, templates):
            d.mkdir()
        (templates / "theme.md").write_text("{{NAME}}|{{TOKENS_LIGHT}}")
        (themes / "test-theme.md").write_text(
            "---\n" + yaml.safe_dump({"title": "T", "theme": theme}) + "---\n\n## Feel\n\nq\n\n## When to use\n\na\n",
            encoding="utf-8")
        monkeypatch.setattr(p, "THEME_DOCS", themes)
        monkeypatch.setattr(p, "OUT", out)
        monkeypatch.setattr(p, "TEMPLATES", templates)
        monkeypatch.setattr(p, "ROOT", tmp_path)
        themes_out, errors = p.parse_themes()
        assert themes_out == []
        assert any("run tools/theme.py first" in e for e in errors)
