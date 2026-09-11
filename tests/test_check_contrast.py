"""tools/check_contrast.py — the WCAG gate over every declared contrast pair."""
from __future__ import annotations

import json

import pytest

import check_contrast as cc
import oklch


PROPS = {
    "variant": {"type": "enum", "values": ["primary", "danger"], "description": "Emphasis."},
    "size": {"type": "enum", "values": ["sm", "md"], "description": "Size."},
    "label": {"type": "string", "description": "Text."},
}


class TestLuminanceAndContrast:
    def test_matches_the_shared_oklch_implementation(self):
        # The two modules carry their own copy; they must not drift apart.
        for h in ("#ffffff", "#000000", "#3b5bdb", "#767676", "#abc"):
            assert cc.luminance(h) == pytest.approx(oklch.luminance(h))

    def test_shorthand_hex_is_accepted(self):
        assert cc.luminance("#fff") == pytest.approx(1.0)

    def test_endpoints_and_range(self):
        assert cc.contrast("#ffffff", "#000000") == pytest.approx(21.0)
        assert cc.contrast("#123456", "#123456") == pytest.approx(1.0)

    def test_contrast_is_symmetric(self):
        assert cc.contrast("#3b5bdb", "#ffffff") == pytest.approx(cc.contrast("#ffffff", "#3b5bdb"))


class TestThresholds:
    def test_the_four_wcag_levels(self):
        assert cc.THRESHOLDS[("AA", False)] == 4.5
        assert cc.THRESHOLDS[("AA", True)] == 3.0
        assert cc.THRESHOLDS[("AAA", False)] == 7.0
        assert cc.THRESHOLDS[("AAA", True)] == 4.5


class TestExpand:
    def test_a_reference_without_slots_is_returned_as_is(self):
        assert cc.expand("color.foreground.muted", PROPS) == ["color.foreground.muted"]

    def test_one_slot_expands_to_one_reference_per_enum_value(self):
        assert cc.expand("color.action.{variant}.background", PROPS) == [
            "color.action.primary.background", "color.action.danger.background"]

    def test_two_slots_expand_to_the_cartesian_product(self):
        out = cc.expand("a.{variant}.{size}", PROPS)
        assert out == ["a.primary.sm", "a.primary.md", "a.danger.sm", "a.danger.md"]

    def test_a_repeated_slot_is_substituted_everywhere(self):
        assert cc.expand("a.{variant}.b.{variant}", PROPS)[0] == "a.primary.b.primary"

    def test_a_slot_naming_a_non_enum_prop_is_rejected(self):
        with pytest.raises(ValueError, match="'\\{label\\}' must name an enum prop"):
            cc.expand("color.{label}.background", PROPS)

    def test_a_slot_naming_no_prop_is_rejected(self):
        with pytest.raises(ValueError, match="must name an enum prop"):
            cc.expand("color.{tone}.background", PROPS)


class TestMain:
    @pytest.fixture
    def sandbox(self, tmp_path, monkeypatch):
        """Point main() at a components.json and a palette we control."""
        generated = tmp_path / "components.json"
        monkeypatch.setattr(cc, "GENERATED", generated)
        monkeypatch.setattr(cc, "themes", lambda: ["fake"])
        monkeypatch.setattr(cc, "modes", lambda t: ["light"])

        palette = {
            "color.background.default": "#ffffff",
            "color.foreground.muted": "#767676",   # 4.54:1 on white — passes AA, fails AAA
            "color.action.primary.background": "#3553d2",
            "color.action.primary.foreground": "#ffffff",
            "color.action.danger.background": "#b51d26",
            "color.action.danger.foreground": "#ffffff",
            "color.action.ghost.background": "transparent",
            "color.action.ghost.foreground": "#3553d2",
        }
        monkeypatch.setattr(cc, "load_theme",
                            lambda t, m: {p: {"$value": v, "$type": "color"} for p, v in palette.items()})

        def write(component: dict) -> None:
            generated.write_text(json.dumps([{"component": component}]), encoding="utf-8")
        return write

    def _component(self, contrast_pairs, props=None):
        return {"name": "Widget", "props": props if props is not None else PROPS,
                "a11y": {"role": "button", "requires": [], "contrast": contrast_pairs}}

    def test_missing_generated_file_is_a_clear_failure(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr(cc, "GENERATED", tmp_path / "nope.json")
        assert cc.main() == 1
        assert "run tools/parse.ts first" in capsys.readouterr().err

    def test_a_passing_pair_returns_zero(self, sandbox, capsys):
        sandbox(self._component([{"foreground": "color.foreground.muted",
                                  "background": "color.background", "level": "AA"}]))
        assert cc.main() == 0
        assert "0 failures" in capsys.readouterr().out

    def test_the_same_pair_fails_at_aaa(self, sandbox, capsys):
        sandbox(self._component([{"foreground": "color.foreground.muted",
                                  "background": "color.background", "level": "AAA"}]))
        assert cc.main() == 1
        assert "1 failures" in capsys.readouterr().out

    def test_large_text_uses_the_lower_floor(self, sandbox):
        sandbox(self._component([{"foreground": "color.foreground.muted",
                                  "background": "color.background", "level": "AAA", "large": True}]))
        assert cc.main() == 0

    def test_level_defaults_to_aa(self, sandbox, capsys):
        sandbox(self._component([{"foreground": "color.foreground.muted",
                                  "background": "color.background"}]))
        assert cc.main() == 0
        assert "needs 4.5 for AA" in capsys.readouterr().out

    def test_matching_slots_are_zipped_not_crossed(self, sandbox, capsys):
        # variant↔variant: primary-on-primary and danger-on-danger, never primary-on-danger.
        sandbox(self._component([{"foreground": "color.action.{variant}.foreground",
                                  "background": "color.action.{variant}.background"}]))
        assert cc.main() == 0
        out = capsys.readouterr().out
        assert "2 pairs checked" in out
        assert "color.action.primary.foreground on color.action.primary.background" in out
        assert "primary.foreground on color.action.danger" not in out

    def test_a_transparent_background_is_checked_against_the_page(self, sandbox, capsys):
        sandbox(self._component([{"foreground": "color.action.ghost.foreground",
                                  "background": "color.action.ghost.background"}],
                                props={"variant": PROPS["variant"]}))
        assert cc.main() == 0
        assert "1 pairs checked" in capsys.readouterr().out

    def test_an_unknown_token_is_a_failure_not_a_crash(self, sandbox, capsys):
        sandbox(self._component([{"foreground": "color.nope", "background": "color.background"}]))
        assert cc.main() == 1
        assert "unknown token color.nope" in capsys.readouterr().out

    def test_a_component_with_no_declared_pairs_is_skipped(self, sandbox, capsys):
        sandbox({"name": "Widget", "props": PROPS, "a11y": {"role": "none", "requires": []}})
        assert cc.main() == 0
        assert "0 pairs checked" in capsys.readouterr().out

    def test_a_null_contrast_list_is_treated_as_empty(self, sandbox):
        sandbox({"name": "Widget", "props": PROPS, "a11y": {"role": "none", "requires": [], "contrast": None}})
        assert cc.main() == 0


class TestRealDocs:
    """The gate as the build runs it: every declared pair in every shipped theme."""

    def test_the_repository_passes_its_own_contrast_gate(self, capsys):
        assert cc.main() == 0, capsys.readouterr().out

    def test_something_was_actually_checked(self, capsys):
        cc.main()
        out = capsys.readouterr().out
        checked = int(out.rsplit("\n", 2)[-2].split(" pairs")[0])
        assert checked > 0
