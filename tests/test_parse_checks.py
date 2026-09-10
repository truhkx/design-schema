"""tools/parse.py — the cross-field checks added with composition, keyboard and locked bindings."""
from __future__ import annotations

from pathlib import Path

import pytest

import parse as p
from parse import DocError


@pytest.fixture
def validator(component_schema):
    return p.Validator(component_schema)


@pytest.fixture
def docs(tmp_path, monkeypatch):
    """A stand-in docs folder with a few real-looking component docs, for the composition check."""
    d = tmp_path / "components"
    d.mkdir()
    for name in ("button", "heading", "text"):
        (d / f"{name}.md").write_text("---\n---\n", encoding="utf-8")
    monkeypatch.setattr(p, "DOCS", d)
    return d


def check(component: dict, validator, tmp_path: Path) -> None:
    p.validate({"component": component}, validator, tmp_path / "widget.md")


class TestComposition:
    def test_a_part_that_names_an_existing_doc_passes(self, component, validator, tmp_path, docs):
        component["composition"] = {"label": "Text"}
        check(component, validator, tmp_path)

    def test_the_lookup_is_case_insensitive_on_the_file_name(self, component, validator, tmp_path, docs):
        component["anatomy"].append("closeButton")
        component["composition"] = {"closeButton": "Button"}
        check(component, validator, tmp_path)

    def test_the_part_must_be_in_anatomy(self, component, validator, tmp_path, docs):
        component["composition"] = {"closeButton": "Button"}
        with pytest.raises(DocError, match="composition.closeButton is not in anatomy"):
            check(component, validator, tmp_path)

    def test_a_component_with_no_doc_is_rejected(self, component, validator, tmp_path, docs):
        component["composition"] = {"label": "Gadget"}
        with pytest.raises(DocError, match="names 'Gadget', which has no doc \\(mark it '\\(planned\\)'\\)"):
            check(component, validator, tmp_path)

    def test_a_planned_component_is_allowed_without_a_doc(self, component, validator, tmp_path, docs):
        component["composition"] = {"label": "Gadget (planned)"}
        check(component, validator, tmp_path)

    def test_planned_still_needs_the_part_in_anatomy(self, component, validator, tmp_path, docs):
        component["composition"] = {"icon": "Icon (planned)"}
        with pytest.raises(DocError, match="is not in anatomy"):
            check(component, validator, tmp_path)

    def test_no_composition_block_is_fine(self, component, validator, tmp_path, docs):
        component.pop("composition", None)
        check(component, validator, tmp_path)


class TestKeyboard:
    RULE = {"keys": ["ArrowDown"], "action": "Moves to the next item.", "expect": "focus-next"}
    ESCAPE = {"keys": ["Escape"], "action": "Closes.", "expect": "closes"}

    def test_a_keyboard_block_requires_keyboard_operable(self, component, validator, tmp_path):
        component["keyboard"] = [self.RULE]
        with pytest.raises(DocError, match="has a keyboard block but a11y.requires lacks 'keyboard-operable'"):
            check(component, validator, tmp_path)

    def test_a_keyboard_block_passes_once_keyboard_operable_is_declared(self, component, validator, tmp_path):
        component["keyboard"] = [self.RULE]
        component["a11y"]["requires"].append("keyboard-operable")
        check(component, validator, tmp_path)

    def test_escape_requires_escape_dismiss(self, component, validator, tmp_path):
        component["keyboard"] = [self.ESCAPE]
        component["a11y"]["requires"].append("keyboard-operable")
        with pytest.raises(DocError, match="keyboard uses Escape but a11y.requires lacks 'escape-dismiss'"):
            check(component, validator, tmp_path)

    def test_escape_passes_once_escape_dismiss_is_declared(self, component, validator, tmp_path):
        component["keyboard"] = [self.ESCAPE]
        component["a11y"]["requires"] += ["keyboard-operable", "escape-dismiss"]
        check(component, validator, tmp_path)

    def test_escape_anywhere_in_a_multi_key_rule_counts(self, component, validator, tmp_path):
        component["keyboard"] = [{"keys": ["Enter", "Escape"], "action": "Ends editing."}]
        component["a11y"]["requires"].append("keyboard-operable")
        with pytest.raises(DocError, match="escape-dismiss"):
            check(component, validator, tmp_path)

    def test_keyboard_operable_is_checked_before_escape(self, component, validator, tmp_path):
        component["keyboard"] = [self.ESCAPE]
        with pytest.raises(DocError, match="keyboard-operable"):
            check(component, validator, tmp_path)

    def test_an_empty_keyboard_block_needs_nothing(self, component, validator, tmp_path):
        component["keyboard"] = []
        check(component, validator, tmp_path)

    def test_an_unknown_expect_is_a_schema_error(self, component, validator, tmp_path):
        component["keyboard"] = [{**self.RULE, "expect": "explodes"}]
        component["a11y"]["requires"].append("keyboard-operable")
        with pytest.raises(DocError, match="failed schema validation"):
            check(component, validator, tmp_path)


class TestLockedBindings:
    def test_a_binding_whose_token_is_in_a_contrast_pair_is_locked(self, component, validator, tmp_path):
        # VALID_COMPONENT's contrast pair names color.action.{variant}.background, which `background` binds.
        check(component, validator, tmp_path)
        assert component["styles"]["background"]["locked"] is True

    def test_a_binding_outside_every_pair_stays_overridable(self, component, validator, tmp_path):
        check(component, validator, tmp_path)
        assert component["styles"]["radius"]["locked"] is False
        assert component["styles"]["paddingInline"]["locked"] is False

    def test_the_foreground_side_of_a_pair_locks_too(self, component, validator, tmp_path):
        component["styles"]["color"] = {"token": "color.action.{variant}.foreground"}
        check(component, validator, tmp_path)
        assert component["styles"]["color"]["locked"] is True

    def test_the_match_is_on_the_unexpanded_token_string(self, component, validator, tmp_path):
        # The pair says color.action.{variant}.background; a binding to one concrete step is a different token.
        component["styles"]["primaryOnly"] = {"token": "color.action.primary.background"}
        check(component, validator, tmp_path)
        assert component["styles"]["primaryOnly"]["locked"] is False

    @pytest.mark.parametrize("name", ["focusRing", "focusRingWidth", "focusRingOffset", "minTarget", "dismissTarget"])
    def test_focus_rings_and_targets_lock_by_name(self, component, validator, tmp_path, name):
        component["styles"][name] = {"token": "space.1"}
        check(component, validator, tmp_path)
        assert component["styles"][name]["locked"] is True

    def test_an_explicit_lock_is_kept(self, component, validator, tmp_path):
        component["styles"]["radius"]["locked"] = True
        check(component, validator, tmp_path)
        assert component["styles"]["radius"]["locked"] is True

    def test_an_explicit_false_cannot_unlock_a_contrast_bearing_binding(self, component, validator, tmp_path):
        component["styles"]["background"]["locked"] = False
        check(component, validator, tmp_path)
        assert component["styles"]["background"]["locked"] is True

    def test_every_binding_ends_up_with_a_boolean_locked_flag(self, component, validator, tmp_path):
        check(component, validator, tmp_path)
        assert all(isinstance(b["locked"], bool) for b in component["styles"].values())

    def test_no_contrast_pairs_locks_only_the_named_bindings(self, component, validator, tmp_path):
        component["a11y"].pop("contrast")
        component["styles"]["focusRing"] = {"token": "color.border.focus"}
        check(component, validator, tmp_path)
        assert component["styles"]["background"]["locked"] is False
        assert component["styles"]["focusRing"]["locked"] is True

    def test_the_prompt_lists_locked_and_overridable_bindings_separately(self, component, validator, tmp_path, monkeypatch):
        import yaml

        check(component, validator, tmp_path)
        templates = tmp_path / "templates"
        templates.mkdir()
        (templates / "web.md").write_text("O={{OVERRIDABLE}}\nL={{LOCKED}}")
        monkeypatch.setattr(p, "TEMPLATES", templates)
        out = p.render_prompt(component, {"When to use": "x", "Accessibility": "y"}, "web",
                              yaml.safe_dump({"component": component}))
        assert "L=`background`" in out
        assert "O=`paddingInline`, `radius`" in out


class TestInterpolationTargets:
    """Every value an interpolated binding can take must name a built token (a trailing `.default` dropped)."""

    NAMES = {"font.size.sm", "font.size.md", "font.size.lg", "color.action.primary.background", "color.action.danger.background",
             "color.background", "color.background.subtle", "space.sm", "space.md", "radius.md"}

    @pytest.fixture(autouse=True)
    def built_tokens(self, monkeypatch):
        monkeypatch.setattr(p, "token_names", lambda: set(self.NAMES))

    def test_every_enum_value_resolving_passes(self, component, validator, tmp_path):
        component["styles"]["fontSize"] = {"token": "font.size.{size}"}  # size: [sm, md]
        check(component, validator, tmp_path)

    def test_an_enum_value_with_no_token_is_named_in_the_error(self, component, validator, tmp_path):
        component["props"]["size"]["values"] = ["sm", "huge"]
        component["styles"]["paddingInline"]["token"] = "space.md"  # the fixture's own {size} binding would trip first
        component["styles"]["fontSize"] = {"token": "font.size.{size}"}
        with pytest.raises(DocError) as err:
            check(component, validator, tmp_path)
        assert str(err.value).endswith("Widget: styles.fontSize 'font.size.{size}' → 'font.size.huge' is not a token")

    def test_a_non_enum_interpolation_target_is_an_error(self, component, validator, tmp_path):
        component["styles"]["fontSize"] = {"token": "font.size.{label}"}
        with pytest.raises(DocError, match="'label' is not an enum prop"):
            check(component, validator, tmp_path)

    def test_a_trailing_default_segment_is_dropped_before_the_lookup(self, component, validator, tmp_path):
        component["props"]["surface"] = {"type": "enum", "values": ["default", "subtle"], "description": "x"}
        component["styles"]["background"] = {"token": "color.background.{surface}"}
        check(component, validator, tmp_path)

    @pytest.mark.parametrize("value", sorted(p.NO_TOKEN_VALUES))
    def test_the_no_op_values_need_no_token(self, component, validator, tmp_path, value):
        component["props"]["surface"] = {"type": "enum", "values": ["subtle", value], "description": "x"}
        component["styles"]["background"] = {"token": "color.background.{surface}"}
        check(component, validator, tmp_path)

    def test_two_slots_are_checked_as_a_product(self, component, validator, tmp_path):
        component["props"]["tone"] = {"type": "enum", "values": ["primary", "danger"], "description": "x"}
        component["styles"]["bg"] = {"token": "color.action.{tone}.background"}
        check(component, validator, tmp_path)
        component["props"]["tone"]["values"].append("info")
        with pytest.raises(DocError, match="'color.action.info.background' is not a token"):
            check(component, validator, tmp_path)

    def test_the_check_is_skipped_before_tokens_are_built(self, component, validator, tmp_path, monkeypatch):
        monkeypatch.setattr(p, "token_names", lambda: None)
        component["props"]["size"]["values"] = ["sm", "huge"]
        component["styles"]["fontSize"] = {"token": "font.size.{size}"}
        check(component, validator, tmp_path)
