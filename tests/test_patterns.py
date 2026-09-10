"""tools/parse.py — pattern docs (site/src/content/docs/patterns/*.md): the Structure tree is validated against
the component schemas and turned into one generation prompt per platform."""
from __future__ import annotations

import json

import pytest
import yaml

import parse as p
from parse import DocError

STRUCTURE = """Landmark main
  Container width=content
    Stack gap=section
      Heading level=1  "Settings"
      Form onSubmit
        Stack horizontal gap=tight justify=end   (the action row)
          Button variant=secondary "Cancel"
          Button variant=primary type=submit "Save changes"
      Card surface=subtle inset=lg heading="Delete account" tone=danger? (see seams)
        Button variant=danger "Delete account…"  → AlertDialog
      Toast region (bottom-end)  "Changes saved" on successful submit
"""

BODY = """
A page.

## Structure

```
{structure}
```

## Behaviors the page must show

Saving validates on submit.

## Seams to look for

Does it read as one page?
"""


def component_named(name: str, **extra) -> dict:
    c = {"name": name, "category": "layout", "anatomy": ["container"], "props": {}, "events": {},
         "a11y": {"role": "none", "requires": []}, "platforms": {"web": {"element": "div"}, "lit": {"tag": f"ds-{name.lower()}"}, "rn": {"element": "View"}}}
    c.update(extra)
    return c


COMPONENTS = [
    component_named("Landmark", anatomy=["region"], props={"role": {"type": "enum", "values": ["banner", "main"], "description": "x"}, "children": {"type": "content", "description": "x"}}),
    component_named("Container", anatomy=["column"], props={"width": {"type": "enum", "values": ["prose", "content"], "description": "x"}}),
    component_named("Stack", props={"direction": {"type": "enum", "values": ["vertical", "horizontal"], "description": "x"},
                                    "gap": {"type": "enum", "values": ["tight", "section"], "description": "x"},
                                    "justify": {"type": "enum", "values": ["start", "end"], "description": "x"}}),
    component_named("Heading", anatomy=["text"], props={"level": {"type": "enum", "values": ["1", "2"], "description": "x"}}),
    component_named("Form", anatomy=["container", "actions"], events={"onSubmit": {"description": "x", "platforms": {"web": "onSubmit", "lit": "submit", "rn": "onSubmit"}}}),
    component_named("Button", props={"variant": {"type": "enum", "values": ["primary", "secondary", "danger"], "description": "x"},
                                     "type": {"type": "enum", "values": ["button", "submit"], "description": "x"}}),
    component_named("Card", anatomy=["surface"], props={"surface": {"type": "enum", "values": ["default", "subtle"], "description": "x"},
                                                        "inset": {"type": "enum", "values": ["md", "lg"], "description": "x"},
                                                        "heading": {"type": "string", "description": "x"}}),
    component_named("Toast", anatomy=["region", "toast"], props={"message": {"type": "string", "description": "x"}}),
    component_named("Tabs", anatomy=["tablist", "tab", "panel"], props={"label": {"type": "string", "description": "x"}}),
]


class TestParseStructure:
    def test_lines_become_nodes_with_props_flags_and_copy(self):
        nodes = p.parse_structure(STRUCTURE)
        assert [n["component"] for n in nodes[:4]] == ["Landmark", "Container", "Stack", "Heading"]
        assert nodes[0]["flags"] == ["main"] and nodes[0]["depth"] == 0
        assert nodes[1]["props"] == {"width": "content"} and nodes[1]["depth"] == 1
        assert nodes[3]["props"] == {"level": "1"} and nodes[3]["copy"] == ["Settings"]
        form = nodes[4]
        assert form["flags"] == ["onSubmit"]
        row = nodes[5]
        assert row["flags"] == ["horizontal"] and row["props"] == {"gap": "tight", "justify": "end"} and row["notes"] == ["the action row"]

    def test_a_question_mark_prop_is_recorded_not_applied(self):
        card = next(n for n in p.parse_structure(STRUCTURE) if n["component"] == "Card")
        assert card["props"] == {"surface": "subtle", "inset": "lg", "heading": "Delete account"}
        assert card["questions"] == {"tone": "danger"}

    def test_arrows_and_prose_are_kept_as_notes(self):
        button = [n for n in p.parse_structure(STRUCTURE) if n["component"] == "Button"][-1]
        assert button["copy"] == ["Delete account…"] and button["notes"] == ["→ AlertDialog"]
        toast = next(n for n in p.parse_structure(STRUCTURE) if n["component"] == "Toast")
        assert toast["flags"] == ["region"] and "bottom-end" in toast["notes"]


class TestValidateStructure:
    def test_the_settings_shape_validates(self):
        assert p.validate_structure(p.parse_structure(STRUCTURE), {c["name"]: c for c in COMPONENTS}, "settings-page.md") == ["Landmark", "Container", "Stack", "Heading", "Form", "Button", "Card", "Toast"]

    def test_an_unknown_component(self):
        with pytest.raises(DocError, match="settings-page.md: line 1: unknown component 'Gadget'"):
            p.validate_structure(p.parse_structure("Gadget width=content\n"), {c["name"]: c for c in COMPONENTS}, "settings-page.md")

    def test_an_unknown_prop(self):
        with pytest.raises(DocError, match="Container has no prop or event 'widht'"):
            p.validate_structure(p.parse_structure("Container widht=content\n"), {c["name"]: c for c in COMPONENTS}, "settings-page.md")

    def test_an_enum_value_outside_the_declared_values(self):
        with pytest.raises(DocError, match="Container.width: 'huge' is not one of"):
            p.validate_structure(p.parse_structure("Container width=huge\n"), {c["name"]: c for c in COMPONENTS}, "settings-page.md")

    def test_a_camel_case_flag_must_be_a_prop_or_event(self):
        with pytest.raises(DocError, match="Form has no prop or event 'onSubmitted'"):
            p.validate_structure(p.parse_structure("Form onSubmitted\n"), {c["name"]: c for c in COMPONENTS}, "settings-page.md")

    def test_lowercase_prose_flags_are_ignored(self):
        p.validate_structure(p.parse_structure("Button disabled unless the Switch is on\n"), {c["name"]: c for c in COMPONENTS}, "x.md")

    def test_a_component_part_name_is_accepted(self):
        # `TabPanel "Profile"` names Tabs' `panel` part (singular component + capitalised part).
        used = p.validate_structure(p.parse_structure('Tabs label="Sections"\n  TabPanel "Profile"\n'), {c["name"]: c for c in COMPONENTS}, "x.md")
        assert used == ["Tabs"]


@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    docs, patterns, out, templates = (tmp_path / n for n in ("components", "patterns", "generated", "templates"))
    for d in (docs, patterns, out, templates, out / "prompts"):
        d.mkdir(exist_ok=True)
    for t in ("web", "rn"):
        (templates / f"pattern-{t}.md").write_text("{{NAME}}|{{TITLE}}|{{PLATFORM}}|{{KEBAB}}\n{{COMPONENTS}}\n{{STRUCTURE}}\n{{BEHAVIORS}}\n{{GUIDANCE}}", encoding="utf-8")
    monkeypatch.setattr(p, "PATTERN_DOCS", patterns)
    monkeypatch.setattr(p, "OUT", out)
    monkeypatch.setattr(p, "TEMPLATES", templates)
    monkeypatch.setattr(p, "ROOT", tmp_path)
    comps = [{"id": c["name"].lower(), "title": c["name"], "component": c, "sections": {}} for c in COMPONENTS]

    def write(name: str, body: str, title: str = "Settings page"):
        (patterns / f"{name}.md").write_text(f"---\ntitle: {title}\ndescription: A page.\n---\n{body}", encoding="utf-8")

    return {"patterns": patterns, "out": out, "write": write, "components": comps}


class TestParsePatterns:
    def test_a_pattern_emits_one_prompt_per_platform_with_a_template(self, sandbox):
        sandbox["write"]("settings-page", BODY.format(structure=STRUCTURE))
        patterns, errors = p.parse_patterns(sandbox["components"])
        assert errors == []
        assert [pt["name"] for pt in patterns] == ["SettingsPage"]
        assert sorted(f.name for f in (sandbox["out"] / "prompts").glob("Pattern.*")) == ["Pattern.SettingsPage.rn.md", "Pattern.SettingsPage.web.md"]
        web = (sandbox["out"] / "prompts" / "Pattern.SettingsPage.web.md").read_text(encoding="utf-8")
        assert web.startswith("SettingsPage|Settings page|web|settings-page")
        assert "Landmark main" in web and "Saving validates on submit." in web
        assert "## Seams to look for" in web, "other sections ride along as guidance"
        assert "`Landmark`" in web and "packages/react" in web, "the components section names each component and its package"

    def test_the_name_is_the_title_without_spaces(self, sandbox):
        sandbox["write"]("settings-page", BODY.format(structure="Button variant=primary\n"), title="Account settings page")
        patterns, _ = p.parse_patterns(sandbox["components"])
        assert patterns[0]["name"] == "AccountSettingsPage"

    def test_a_missing_structure_is_an_error(self, sandbox):
        sandbox["write"]("settings-page", "\n## Behaviors the page must show\n\nx\n")
        _, errors = p.parse_patterns(sandbox["components"])
        assert errors and "required section '## Structure'" in errors[0]

    def test_a_structure_error_names_the_pattern_file(self, sandbox):
        sandbox["write"]("settings-page", BODY.format(structure="Gadget\n"))
        _, errors = p.parse_patterns(sandbox["components"])
        assert errors == ["settings-page.md: line 1: unknown component 'Gadget'"]

    def test_a_doc_with_a_component_block_is_not_a_pattern(self, sandbox):
        (sandbox["patterns"] / "oops.md").write_text("---\ntitle: X\ncomponent:\n  name: X\n---\n", encoding="utf-8")
        _, errors = p.parse_patterns(sandbox["components"])
        assert errors and "is not a pattern" in errors[0]

    def test_no_patterns_folder_is_fine(self, sandbox, monkeypatch):
        monkeypatch.setattr(p, "PATTERN_DOCS", sandbox["patterns"] / "missing")
        assert p.parse_patterns(sandbox["components"]) == ([], [])


class TestTheRepository:
    def test_the_settings_page_parses_against_the_real_components(self, root):
        cj = root / "generated" / "components.json"
        if not cj.exists() or not (p.PATTERN_DOCS / "settings-page.md").exists():
            pytest.skip("run tools/parse.py first")
        patterns, errors = p.parse_patterns(json.loads(cj.read_text(encoding="utf-8")))
        assert errors == []
        assert "SettingsPage" in [pt["name"] for pt in patterns]
        for platform in ("web", "lit", "rn"):
            assert (root / "generated" / "prompts" / f"Pattern.SettingsPage.{platform}.md").exists()
