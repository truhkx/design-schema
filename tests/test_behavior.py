"""tools/parse.py — behavior scenarios: reference validation, platform narrowing, derived scenarios."""
from __future__ import annotations

import copy
from pathlib import Path

import pytest

import parse as p
from parse import DocError

PATH = Path("widget.md")


def with_behavior(component: dict, *scenarios: dict) -> dict:
    c = copy.deepcopy(component)
    c["behavior"] = list(scenarios)
    c["platforms"]["lit"] = {"tag": "ds-widget"}
    c["events"]["onPress"]["platforms"]["lit"] = "press"
    return c


CLICK = {"name": "click-fires", "when": {"click": "container"}, "then": [{"event": "onPress"}]}


class TestValidateBehavior:
    def test_a_valid_scenario_passes(self, component):
        p.validate_behavior(with_behavior(component, CLICK), PATH)

    def test_unknown_prop_in_given(self, component):
        c = with_behavior(component, {**CLICK, "given": {"colour": "red"}})
        with pytest.raises(DocError, match="unknown prop 'colour'"):
            p.validate_behavior(c, PATH)

    def test_enum_value_must_be_declared(self, component):
        c = with_behavior(component, {**CLICK, "given": {"variant": "tertiary"}})
        with pytest.raises(DocError, match="not one of"):
            p.validate_behavior(c, PATH)

    def test_boolean_prop_needs_a_boolean(self, component):
        component["props"]["disabled"] = {"type": "boolean", "description": "x"}
        c = with_behavior(component, {**CLICK, "given": {"disabled": "yes"}})
        with pytest.raises(DocError, match="must be a boolean"):
            p.validate_behavior(c, PATH)

    def test_unknown_anatomy_part(self, component):
        c = with_behavior(component, {**CLICK, "when": {"click": "thumb"}})
        with pytest.raises(DocError, match="unknown anatomy part 'thumb'"):
            p.validate_behavior(c, PATH)

    def test_unknown_event(self, component):
        c = with_behavior(component, {**CLICK, "then": [{"event": "onToggle"}]})
        with pytest.raises(DocError, match="unknown event 'onToggle'"):
            p.validate_behavior(c, PATH)

    def test_with_on_an_event_that_must_not_fire(self, component):
        c = with_behavior(component, {**CLICK, "then": [{"event": "onPress", "fired": False, "with": True}]})
        with pytest.raises(DocError, match="`with` on an event that must not fire"):
            p.validate_behavior(c, PATH)

    def test_focus_accepts_parts_and_the_three_words(self, component):
        for target in ("container", "none", "moved", "unchanged"):
            p.validate_behavior(with_behavior(component, {**CLICK, "then": [{"focus": target}], "platforms": ["web", "lit"]}), PATH)
        with pytest.raises(DocError, match="unknown anatomy part 'elsewhere'"):
            p.validate_behavior(with_behavior(component, {**CLICK, "then": [{"focus": "elsewhere"}], "platforms": ["web"]}), PATH)

    def test_unknown_copy_key(self, component):
        component["copy"] = {"required": "{label} is required."}
        c = with_behavior(component, {**CLICK, "then": [{"copy": "optional"}]})
        with pytest.raises(DocError, match="unknown copy key 'optional'"):
            p.validate_behavior(c, PATH)

    def test_undeclared_platform(self, component):
        c = with_behavior(component, {**CLICK, "platforms": ["swiftui"]})
        with pytest.raises(DocError, match="does not declare"):
            p.validate_behavior(c, PATH)

    def test_expectation_cannot_widen_beyond_the_scenario(self, component):
        c = with_behavior(component, {**CLICK, "platforms": ["web"], "then": [{"event": "onPress", "platforms": ["rn"]}]})
        with pytest.raises(DocError, match="outside the scenario's platforms"):
            p.validate_behavior(c, PATH)

    def test_duplicate_names(self, component):
        with pytest.raises(DocError, match="duplicate behavior scenario"):
            p.validate_behavior(with_behavior(component, CLICK, CLICK), PATH)

    def test_derived_is_reserved_for_the_parser(self, component):
        with pytest.raises(DocError, match="only the parser may set"):
            p.validate_behavior(with_behavior(component, {**CLICK, "derived": "me"}), PATH)


class TestReactNativeLimits:
    """What the RN harness cannot express must be narrowed away explicitly, not left to the generator."""

    def test_key_interaction_must_exclude_rn(self, component):
        c = with_behavior(component, {**CLICK, "when": {"key": "Space"}})
        with pytest.raises(DocError, match="no keyboard"):
            p.validate_behavior(c, PATH)
        p.validate_behavior(with_behavior(component, {**CLICK, "when": {"key": "Space"}, "platforms": ["web", "lit"]}), PATH)

    def test_focus_expectations_must_exclude_rn(self, component):
        with pytest.raises(DocError, match="cannot observe focus"):
            p.validate_behavior(with_behavior(component, {**CLICK, "then": [{"focusable": True}]}), PATH)
        # narrowing the single expectation is enough
        p.validate_behavior(with_behavior(component, {**CLICK, "then": [{"focusable": True, "platforms": ["web"]}]}), PATH)

    def test_invalid_state_must_exclude_rn(self, component):
        with pytest.raises(DocError, match="no invalid accessibility state"):
            p.validate_behavior(with_behavior(component, {**CLICK, "then": [{"state": "invalid", "is": True}]}), PATH)


class TestDeriveBehavior:
    def test_role_enum_values_and_requirements(self, component):
        component["a11y"]["requires"] = ["accessible-name", "keyboard-operable"]
        names = [sc["name"] for sc in p.derive_behavior(component)]
        assert names[:1] == ["renders"]
        assert {"renders-variant-primary", "renders-variant-danger", "renders-size-sm", "renders-size-md"} <= set(names)
        assert "has-accessible-name" in names and "control-is-focusable" in names
        assert all(sc.get("derived") for sc in p.derive_behavior(component))

    def test_focusable_never_targets_rn(self, component):
        component["a11y"]["requires"] = ["keyboard-operable"]
        sc = next(s for s in p.derive_behavior(component) if s["name"] == "control-is-focusable")
        assert "rn" not in sc["platforms"]

    def test_roleless_components_only_check_rendering(self, component):
        component["a11y"] = {"role": "none", "requires": []}
        for sc in p.derive_behavior(component):
            assert sc["then"] == [{"renders": True}]

    def test_error_identification_needs_an_error_prop(self, component):
        component["a11y"]["requires"] = ["error-identification"]
        assert not any(sc["name"] == "error-is-identified" for sc in p.derive_behavior(component))
        component["props"]["error"] = {"type": "string", "description": "x"}
        sc = next(s for s in p.derive_behavior(component) if s["name"] == "error-is-identified")
        assert sc["given"] == {"error": "Fix this before continuing."}
        assert sc["then"][1]["platforms"] == ["web", "lit"]

    def test_platform_limited_enum_props_limit_their_scenarios(self, component):
        component["props"]["size"]["platforms"] = ["web"]
        sizes = [sc for sc in p.derive_behavior(component) if sc["name"].startswith("renders-size-")]
        assert all(sc["platforms"] == ["web"] for sc in sizes)


class TestBehaviorFor:
    def test_narrows_scenarios_and_expectations_to_the_platform(self, component):
        c = with_behavior(
            component,
            {**CLICK, "name": "web-only", "platforms": ["web"]},
            {**CLICK, "name": "mixed", "then": [{"event": "onPress"}, {"focusable": True, "platforms": ["web", "lit"]}]},
        )
        rn = p.behavior_for(c, [], "rn")
        assert [sc["name"] for sc in rn] == ["mixed"]
        assert rn[0]["then"] == [{"event": "onPress"}]
        web = p.behavior_for(c, [], "web")
        assert [sc["name"] for sc in web] == ["web-only", "mixed"]
        assert web[1]["then"][1] == {"focusable": True}

    def test_authored_come_before_derived(self, component):
        c = with_behavior(component, CLICK)
        names = [sc["name"] for sc in p.behavior_for(c, p.derive_behavior(c), "web")]
        assert names[0] == "click-fires" and "renders" in names[1:]

    def test_a_scenario_with_no_applicable_expectation_is_dropped(self, component):
        c = with_behavior(component, {**CLICK, "then": [{"focusable": True, "platforms": ["web"]}]})
        assert p.behavior_for(c, [], "rn") == []


class TestPromptRendering:
    def test_prompt_carries_the_scenarios(self, component, tmp_path, monkeypatch):
        import yaml

        c = with_behavior(component, CLICK)
        fm_yaml = yaml.safe_dump({"component": c}, sort_keys=False)
        out = p.render_prompt(c, {"When to use": "x", "Accessibility": "y"}, "web", fm_yaml)
        assert "## Behavior scenarios (" in out
        assert "- name: click-fires" in out and "- name: renders" in out
        assert "{{BEHAVIOR_YAML}}" not in out and "{{BEHAVIOR_COUNT}}" not in out


class TestShippedDocs:
    """The two docs that author scenarios today must keep validating, and their tests exist on every platform."""

    @pytest.mark.parametrize("name", ["switch", "checkbox"])
    def test_doc_declares_scenarios(self, name, component_schema):
        path = p.DOCS / f"{name}.md"
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        assert fm["component"].get("behavior"), f"{name}.md has no behavior block"
        p.validate(fm, p.Validator(component_schema), path)

    @pytest.mark.parametrize("path", [
        "packages/react/src/Switch.test.tsx", "packages/lit/src/Switch.test.ts", "packages/rn/src/Switch.test.tsx",
    ])
    def test_switch_exemplar_tests_exist(self, root, path):
        assert (root / path).exists()


class TestAccessibleNameGiven:
    """has-accessible-name must render with the prop that carries the name when that prop is optional."""

    def test_an_optional_prop_whose_a11y_note_names_the_accessible_name_is_supplied(self, component):
        component["a11y"]["requires"] = ["accessible-name"]
        component["props"]["label"]["required"] = False
        component["props"]["label"]["a11y"] = "The accessible name (aria-label / accessibilityLabel) when there is no visible text."
        sc = next(s for s in p.derive_behavior(component) if s["name"] == "has-accessible-name")
        assert sc["given"] == {"label": p.ACCESSIBLE_NAME_PLACEHOLDER}

    def test_a_required_label_needs_no_given(self, component):
        component["a11y"]["requires"] = ["accessible-name"]
        assert component["props"]["label"]["required"] is True
        sc = next(s for s in p.derive_behavior(component) if s["name"] == "has-accessible-name")
        assert "given" not in sc

    def test_an_intrinsic_name_is_left_alone(self, component):
        component["a11y"]["requires"] = ["accessible-name"]
        component["props"] = {"children": {"type": "content", "required": True, "description": "Heading text."}}
        component["styles"] = {}
        component["a11y"]["contrast"] = []
        sc = next(s for s in p.derive_behavior(component) if s["name"] == "has-accessible-name")
        assert "given" not in sc

    def test_the_a11y_note_wins_over_a_required_title(self, component):
        component["props"]["title"] = {"type": "string", "required": True, "description": "x"}
        component["props"]["name"] = {"type": "string", "description": "x", "a11y": "Read as the accessible name."}
        assert p.accessible_name_prop(component) == "name"

    def test_an_enum_naming_prop_uses_its_first_value(self, component):
        component["props"]["icon"] = {"type": "enum", "values": ["check", "close"], "description": "x", "a11y": "Announced as the accessible name."}
        assert p.accessible_name_given(component) == {"icon": "check"}

    def test_the_shipped_icon_doc_gets_a_label(self, root, component_schema):
        path = p.DOCS / "icon.md"
        if not path.exists():
            pytest.skip("no Icon doc")
        fm, _ = p.split_frontmatter(path.read_text(encoding="utf-8"), path)
        sc = next(s for s in p.derive_behavior(fm["component"]) if s["name"] == "has-accessible-name")
        assert sc.get("given", {}).get("label"), "Icon's name comes from its optional label"


class TestFocusableDerivation:
    """control-is-focusable only where the role names something that itself takes focus."""

    @pytest.mark.parametrize("role", ["button", "switch", "textbox", "link", "menuitem"])
    def test_widget_roles_get_the_scenario(self, component, role):
        component["a11y"] = {"role": role, "requires": ["keyboard-operable"]}
        assert "control-is-focusable" in [s["name"] for s in p.derive_behavior(component)]

    @pytest.mark.parametrize("role", ["form", "navigation", "status", "dialog", "menu", "radiogroup", "separator", "none"])
    def test_containers_and_regions_do_not(self, component, role):
        component["a11y"] = {"role": role, "requires": ["keyboard-operable"]}
        assert "control-is-focusable" not in [s["name"] for s in p.derive_behavior(component)]
