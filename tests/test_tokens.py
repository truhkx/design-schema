"""tools/tokens.py — the DTCG resolver mcp/server.py reads through (the last Python importer of it).

The dist writers this module used to hold are gone: `tokens/build.mjs` (Style Dictionary) is the only
token build. tools/__tests__/*.test.ts covers the TypeScript port of the reader, tools/lib/tokens.ts.
"""
from __future__ import annotations

import json

import pytest

import tokens as tk


class TestDeepMerge:
    def test_later_wins_at_the_leaf(self):
        a = {"color": {"fg": {"$value": "#000"}}}
        tk._deep_merge(a, {"color": {"fg": {"$value": "#fff"}}})
        assert a["color"]["fg"]["$value"] == "#fff"

    def test_nested_branches_are_merged_not_replaced(self):
        a = {"color": {"fg": {"$value": "#000"}}}
        tk._deep_merge(a, {"color": {"bg": {"$value": "#fff"}}})
        assert set(a["color"]) == {"fg", "bg"}

    def test_non_dict_replaces_dict(self):
        a = {"x": {"y": 1}}
        tk._deep_merge(a, {"x": 5})
        assert a["x"] == 5

    def test_returns_the_mutated_target(self):
        a = {}
        assert tk._deep_merge(a, {"k": 1}) is a


class TestFlatten:
    def test_paths_are_dotted_and_values_kept(self):
        flat = tk.flatten({"color": {"$type": "color", "foreground": {"default": {"$value": "#111"}}}})
        assert flat["color.foreground.default"] == {"$value": "#111", "$type": "color"}

    def test_type_is_inherited_from_the_nearest_ancestor(self):
        flat = tk.flatten({
            "space": {"$type": "dimension", "sm": {"$value": "8px"}},
            "font": {"$type": "dimension", "weight": {"$type": "fontWeight", "bold": {"$value": 700}}},
        })
        assert flat["space.sm"]["$type"] == "dimension"
        assert flat["font.weight.bold"]["$type"] == "fontWeight"

    def test_untyped_tokens_get_none(self):
        assert tk.flatten({"a": {"b": {"$value": 1}}})["a.b"]["$type"] is None

    def test_reserved_keys_are_not_walked_into(self):
        flat = tk.flatten({"color": {"$description": "note", "$extensions": {"x": {"$value": "nope"}},
                                     "fg": {"$value": "#000"}}})
        assert list(flat) == ["color.fg"]

    def test_non_dict_branches_are_skipped(self):
        assert tk.flatten({"a": {"junk": "string", "b": {"$value": 1}}}) == {"a.b": {"$value": 1, "$type": None}}

    def test_a_group_that_has_a_value_stops_descending(self):
        flat = tk.flatten({"a": {"$value": "#000", "b": {"$value": "#fff"}}})
        assert list(flat) == ["a"]


class TestResolve:
    def test_plain_values_pass_through_with_raw_preserved(self):
        out = tk.resolve({"space.sm": {"$value": "8px", "$type": "dimension"}})
        assert out["space.sm"] == {"$value": "8px", "$type": "dimension", "raw": "8px"}

    def test_reference_is_followed(self):
        flat = {"a": {"$value": "#111", "$type": "color"}, "b": {"$value": "{a}", "$type": "color"}}
        out = tk.resolve(flat)
        assert out["b"]["$value"] == "#111"
        assert out["b"]["raw"] == "{a}", "the unresolved reference stays available"

    def test_reference_chains_are_followed_to_the_end(self):
        flat = {n: {"$value": v, "$type": "color"} for n, v in
                [("a", "#111"), ("b", "{a}"), ("c", "{b}"), ("d", "{c}")]}
        assert tk.resolve(flat)["d"]["$value"] == "#111"

    def test_unknown_reference_raises_key_error_naming_the_token(self):
        with pytest.raises(KeyError, match="missing.token"):
            tk.resolve({"a": {"$value": "{missing.token}", "$type": "color"}})

    def test_circular_reference_raises_value_error(self):
        flat = {"a": {"$value": "{b}", "$type": "color"}, "b": {"$value": "{a}", "$type": "color"}}
        with pytest.raises(ValueError, match="Circular"):
            tk.resolve(flat)

    def test_self_reference_raises(self):
        with pytest.raises(ValueError, match="Circular"):
            tk.resolve({"a": {"$value": "{a}", "$type": "color"}})

    def test_non_string_values_are_never_treated_as_references(self):
        out = tk.resolve({"e": {"$value": [0.2, 0, 0, 1], "$type": "cubicBezier"}})
        assert out["e"]["$value"] == [0.2, 0, 0, 1]

    def test_a_string_that_merely_contains_braces_is_not_a_reference(self):
        out = tk.resolve({"a": {"$value": "calc({x} + 1)", "$type": "dimension"}})
        assert out["a"]["$value"] == "calc({x} + 1)"


class TestNames:
    @pytest.mark.parametrize("path,expected", [
        ("color.foreground.default", "color.foreground"),
        ("color.background.default", "color.background"),
        ("color.foreground.muted", "color.foreground.muted"),
        ("space.default.sm", "space.default.sm"),
    ])
    def test_public_name_drops_only_a_trailing_default(self, path, expected):
        assert tk.public_name(path) == expected

    @pytest.mark.parametrize("path,expected", [
        ("color.foreground.default", "--color-foreground"),
        ("color.action.primary.backgroundHover", "--color-action-primary-background-hover"),
        ("font.size.2xl", "--font-size-2xl"),
        ("motion.duration.fast", "--motion-duration-fast"),
    ])
    def test_css_name(self, path, expected):
        assert tk.css_name(path) == expected

    @pytest.mark.parametrize("path,expected", [
        ("color.foreground.default", "colorForeground"),
        ("color.action.primary.backgroundHover", "colorActionPrimaryBackgroundHover"),
        ("size.target.min", "sizeTargetMin"),
        ("font.size.2xl", "fontSize2xl"),
    ])
    def test_camel_name(self, path, expected):
        assert tk.camel_name(path) == expected

    def test_css_and_camel_names_are_unique_across_a_real_theme(self):
        flat = tk.load_theme("calm-precise", "light")
        for namer in (tk.css_name, tk.camel_name):
            names = [namer(p) for p in flat]
            assert len(names) == len(set(names)), f"{namer.__name__} collides"


class TestRealTheme:
    def test_themes_and_modes_are_discovered(self):
        assert "calm-precise" in tk.themes()
        assert tk.modes("calm-precise") == ["light", "dark"]

    def test_every_token_resolves_in_every_theme_and_mode(self):
        for theme in tk.themes():
            for mode in tk.modes(theme):
                resolved = tk.load_theme(theme, mode)
                assert resolved, f"{theme}/{mode} resolved to nothing"
                for path, entry in resolved.items():
                    assert not (isinstance(entry["$value"], str) and entry["$value"].startswith("{")), \
                        f"{theme}/{mode} {path} still holds a reference"

    def test_light_and_dark_expose_the_same_token_names(self):
        light, dark = tk.load_theme("calm-precise", "light"), tk.load_theme("calm-precise", "dark")
        assert set(light) == set(dark)

    def test_mode_overrides_the_base_layer(self):
        # base.json has no color.foreground; the mode file supplies it.
        base = tk.flatten(json.loads((tk.THEMES_DIR / "calm-precise" / "base.json").read_text()))
        assert "color.foreground.default" not in base
        assert "color.foreground.default" in tk.load_theme("calm-precise", "light")
