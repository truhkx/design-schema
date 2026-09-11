"""mcp/server.py — the tools AI clients call.

The tools are exercised through their plain functions (FastMCP keeps the original
callable on `.fn`), so these tests cover behavior rather than the wire protocol.
"""
from __future__ import annotations

import json

import pytest

fastmcp = pytest.importorskip("fastmcp", reason="fastmcp is not installed")
import server as s  # noqa: E402


def fn(tool):
    return getattr(tool, "fn", tool)


search_guidance = fn(s.search_guidance)
list_components = fn(s.list_components)
get_component = fn(s.get_component)
lookup_code = fn(s.lookup_code)
list_themes = fn(s.list_themes)
get_theme_skill = fn(s.get_theme_skill)
get_tokens = fn(s.get_tokens)
check_contrast = fn(s.check_contrast)
get_generation_prompt = fn(s.get_generation_prompt)


@pytest.fixture(autouse=True)
def quiet_call_log(tmp_path, monkeypatch):
    """Keep the dogfooding log out of the repo while tests run."""
    monkeypatch.setattr(s, "CALL_LOG", tmp_path / "mcp-calls.jsonl")


class TestCallLog:
    def test_a_tool_call_is_recorded(self, tmp_path):
        list_components()
        lines = (tmp_path / "mcp-calls.jsonl").read_text(encoding="utf-8").strip().splitlines()
        entry = json.loads(lines[-1])
        assert entry["tool"] == "list_components"
        assert entry["resultChars"] > 0

    def test_arguments_are_recorded_and_none_values_dropped(self, tmp_path):
        list_components(platform="rn")
        entry = json.loads((tmp_path / "mcp-calls.jsonl").read_text(encoding="utf-8").strip().splitlines()[-1])
        assert entry["args"] == {"platform": "rn"}

    def test_logging_failure_never_breaks_the_tool(self, monkeypatch):
        monkeypatch.setattr(s, "CALL_LOG", None)  # attribute access inside _log will raise
        assert list_components(), "the tool must still answer"


class TestFindComponent:
    def test_lookup_is_case_insensitive(self):
        assert s._find_component("button")["component"]["name"] == "Button"
        assert s._find_component("BUTTON")["component"]["name"] == "Button"

    def test_an_unknown_name_lists_what_is_available(self):
        with pytest.raises(ValueError, match="Unknown component 'Nope'. Known: "):
            s._find_component("Nope")


class TestListComponents:
    def test_returns_every_component_with_its_summary_fields(self):
        out = list_components()
        assert out
        for c in out:
            assert {"name", "category", "status", "apg", "description", "platforms"} == set(c)

    def test_sorted_by_name(self):
        names = [c["name"] for c in list_components()]
        assert names == sorted(names)

    def test_platform_filter_keeps_only_components_supporting_it(self):
        for c in list_components(platform="rn"):
            assert "rn" in c["platforms"]

    def test_an_unused_platform_yields_nothing(self):
        assert list_components(platform="compose") == []

    def test_status_filter(self):
        assert all(c["status"] == "review" for c in list_components(status="review"))
        assert list_components(status="deprecated") == []


class TestGetComponent:
    def test_returns_schema_and_guidance_together(self):
        out = get_component("Button")
        assert out["name"] == "Button"
        assert out["schema"]["props"]["variant"]["type"] == "enum"
        assert "When to use" in out["guidance"]
        assert out["source"].endswith("button.md")

    def test_without_a_platform_every_platform_is_present(self):
        assert len(get_component("Button")["schema"]["platforms"]) > 1

    def test_with_a_platform_only_that_mapping_survives(self):
        out = get_component("Button", platform="rn")
        assert list(out["schema"]["platforms"]) == ["rn"]

    def test_events_are_annotated_with_their_name_on_the_platform(self):
        events = get_component("Button", platform="web")["schema"]["events"]
        assert events["onPress"]["nameOnPlatform"] == "onClick"
        assert get_component("Button", platform="rn")["schema"]["events"]["onPress"]["nameOnPlatform"] == "onPress"

    def test_props_missing_on_the_platform_are_flagged(self):
        out = get_component("Button", platform="swiftui")["schema"]["props"]
        restricted = [p for p in out.values() if p.get("platforms")]
        assert restricted, "Button has at least one platform-restricted prop"
        assert all(p.get("availableOnPlatform") is False for p in restricted)

    def test_an_unmapped_platform_is_reported_as_unsupported(self):
        out = get_component("Button", platform="compose")
        assert out["schema"]["platforms"]["compose"]["supported"] is False

    def test_platform_notes_are_narrowed_to_that_platform(self):
        web = get_component("Button", platform="web")["guidance"]["Platform notes"]
        rn = get_component("Button", platform="rn")["guidance"]["Platform notes"]
        assert web and rn and web != rn

    def test_the_cached_component_data_is_not_mutated_between_calls(self):
        get_component("Button", platform="rn")
        assert len(get_component("Button")["schema"]["platforms"]) > 1


class TestLookupCode:
    def test_returns_the_generated_source_for_the_platform(self):
        out = lookup_code("Button", "rn")
        assert out["supported"] is True
        assert out["platformLabel"] == "React Native"
        assert any(f.endswith("Button.tsx") for f in out["files"])
        assert "export function Button" in "".join(out["files"].values())

    def test_web_also_returns_the_stylesheet(self):
        files = lookup_code("Button", "web", include=["source", "styles"])["files"]
        assert any(f.endswith(".css") for f in files)

    def test_include_selects_what_comes_back(self):
        out = lookup_code("Button", "rn", include=["notes"])
        assert out["files"] == {}
        assert out["platformNotes"]
        assert "tokenBindings" not in out

    def test_notes_carry_the_platform_mapping_events_and_copy(self):
        out = lookup_code("Button", "web", include=["notes"])
        assert out["platformMapping"]["element"] == "button"
        assert out["events"]["onPress"] == "onClick"
        assert "copy" in out

    def test_the_generation_prompt_can_be_included(self):
        out = lookup_code("Button", "web", include=["prompt"])
        assert out["generationPrompt"] and "Button" in out["generationPrompt"]

    def test_token_bindings_are_named_for_the_web_platform(self):
        b = lookup_code("Button", "web", include=["tokens"])["tokenBindings"]
        assert b["radius"]["name"] == "var(--radius-md)"
        assert b["background"]["name"] == "var(--color-action-{variant}-background)"

    def test_token_bindings_are_named_for_react_native(self):
        b = lookup_code("Button", "rn", include=["tokens"])["tokenBindings"]
        assert b["radius"]["name"] == "radiusMd"
        assert b["background"]["name"] == "colorAction{Variant}Background"

    def test_bindings_keep_the_original_token_path(self):
        b = lookup_code("Button", "rn", include=["tokens"])["tokenBindings"]
        assert b["background"]["token"] == "color.action.{variant}.background"

    def test_a_platform_with_no_generated_package_returns_no_files(self):
        out = lookup_code("Button", "swiftui")
        assert out["files"] == {}
        assert out["platformLabel"] == "SwiftUI"

    def test_an_unknown_component_raises(self):
        with pytest.raises(ValueError, match="Unknown component"):
            lookup_code("Nope", "web")


class TestThemes:
    def test_list_themes_describes_each_theme(self):
        themes = list_themes()
        assert themes
        for t in themes:
            assert {"id", "title", "description", "tone", "not", "modes", "status"} == set(t)

    def test_the_theme_skill_carries_the_identity_and_resolved_tokens(self):
        skill = get_theme_skill("calm-precise")
        assert "calm" in skill and "playful" in skill
        assert "--color-action-primary-background" in skill

    def test_an_unknown_theme_lists_the_known_ones(self):
        with pytest.raises(ValueError, match="Unknown theme 'nope'. Known: "):
            get_theme_skill("nope")


class TestGetTokens:
    def test_web_tokens_are_css_custom_properties(self):
        out = get_tokens("calm-precise", "light", "web")
        assert out["count"] == len(out["tokens"]) > 0
        assert "--color-action-primary-background" in out["tokens"]
        entry = out["tokens"]["--color-action-primary-background"]
        assert entry["value"].startswith("#")
        assert entry["path"] == "color.action.primary.background"

    def test_rn_tokens_are_camel_case_with_numeric_dimensions(self):
        out = get_tokens("calm-precise", "light", "rn")
        assert out["tokens"]["spaceMd"]["value"] == 12
        assert isinstance(out["tokens"]["radiusMd"]["value"], (int, float))

    def test_rn_font_families_collapse_to_a_native_name(self):
        assert get_tokens("calm-precise", "light", "rn")["tokens"]["fontFamilyBody"]["value"] == "System"

    def test_web_font_families_are_css_stacks(self):
        v = get_tokens("calm-precise", "light", "web")["tokens"]["--font-family-body"]["value"]
        assert v.startswith("system-ui,") and '"Segoe UI"' in v

    def test_web_easing_is_a_css_function(self):
        v = get_tokens("calm-precise", "light", "web")["tokens"]["--motion-easing-standard"]["value"]
        assert v.startswith("cubic-bezier(")

    def test_group_filters_by_token_path_prefix(self):
        out = get_tokens("calm-precise", "light", "web", group="color.action.primary")
        assert out["count"] == 3
        assert all(e["path"].startswith("color.action.primary") for e in out["tokens"].values())

    def test_a_group_that_matches_nothing_is_empty_not_an_error(self):
        assert get_tokens("calm-precise", "light", "web", group="nope.nothing")["count"] == 0

    def test_light_and_dark_differ(self):
        light = get_tokens("calm-precise", "light")["tokens"]["--color-background"]["value"]
        dark = get_tokens("calm-precise", "dark")["tokens"]["--color-background"]["value"]
        assert light != dark

    def test_an_unknown_theme_is_rejected(self):
        with pytest.raises(ValueError, match="Unknown theme 'nope'"):
            get_tokens("nope")

    def test_a_mode_the_theme_does_not_support_is_rejected(self, monkeypatch):
        monkeypatch.setattr(s, "theme_modes", lambda theme: ["light"])
        with pytest.raises(ValueError, match="has no 'dark' mode"):
            get_tokens("calm-precise", "dark")


class TestCheckContrast:
    def test_hex_pairs(self):
        out = check_contrast("#ffffff", "#000000")
        assert out["ratio"] == 21.0 and out["passes"] is True

    def test_token_paths_resolve_through_the_theme(self):
        out = check_contrast("color.foreground.muted", "color.background")
        assert out["foreground"].startswith("#") and out["background"].startswith("#")
        assert out["passes"] is True

    def test_a_transparent_token_falls_back_to_the_page_background(self):
        out = check_contrast("color.action.ghost.foreground", "color.action.ghost.background")
        assert out["background"] == check_contrast("#000", "color.background")["background"]

    def test_the_literal_word_transparent_is_accepted(self):
        assert check_contrast("color.foreground", "transparent")["passes"] is True

    @pytest.mark.parametrize("level,large,need", [("AA", False, 4.5), ("AA", True, 3.0),
                                                  ("AAA", False, 7.0), ("AAA", True, 4.5)])
    def test_the_required_ratio_follows_level_and_text_size(self, level, large, need):
        assert check_contrast("#000000", "#ffffff", level=level, large_text=large)["required"] == need

    def test_a_failing_pair_is_reported_as_failing(self):
        out = check_contrast("#ffffff", "#f6f7f8")
        assert out["passes"] is False and out["ratio"] < 4.5

    def test_dark_mode_resolves_different_colors(self):
        light = check_contrast("color.foreground", "color.background", mode="light")
        dark = check_contrast("color.foreground", "color.background", mode="dark")
        assert light["foreground"] != dark["foreground"]

    def test_an_unknown_token_is_rejected_with_a_useful_message(self):
        with pytest.raises(ValueError, match="neither a hex color nor a known color token"):
            check_contrast("color.nope", "#ffffff")

    def test_a_non_color_token_is_rejected(self):
        with pytest.raises(ValueError, match="neither a hex color"):
            check_contrast("space.md", "#ffffff")


class TestGetGenerationPrompt:
    def test_returns_the_prompt_for_the_platform(self):
        prompt = get_generation_prompt("Button", "web")
        assert "Button" in prompt and len(prompt) > 200

    def test_the_component_name_is_matched_case_insensitively(self):
        assert get_generation_prompt("button", "web") == get_generation_prompt("Button", "web")

    def test_a_platform_without_a_prompt_raises(self):
        with pytest.raises(ValueError, match="No generation prompt"):
            get_generation_prompt("Button", "compose")


class TestResources:
    def test_components_resource_is_json(self):
        assert isinstance(json.loads(s.components_resource()), list)

    def test_component_resource_is_json_for_one_component(self):
        assert json.loads(s.component_resource("Button"))["name"] == "Button"

    def test_theme_skill_resource(self):
        assert "Calm" in s.theme_skill_resource("calm-precise")

    def test_component_schema_resource_is_the_json_schema(self):
        assert json.loads(s.component_schema_resource())["title"] == "Component frontmatter"


@pytest.mark.skipif(not s.indexer.DB_PATH.exists(), reason="vector index not built (run: python mcp/index.py)")
class TestSearchGuidance:
    def test_results_carry_score_text_and_provenance(self):
        out = search_guidance("when should I use a button", limit=3)
        assert 0 < len(out) <= 3
        for r in out:
            assert {"score", "component", "theme", "platform", "section", "kind",
                    "granularity", "source", "text"} == set(r)
            assert r["text"]

    def test_results_come_back_ranked(self):
        scores = [r["score"] for r in search_guidance("focus ring", limit=5)]
        assert scores == sorted(scores, reverse=True)

    def test_limit_is_honoured(self):
        assert len(search_guidance("form validation", limit=2)) <= 2

    def test_a_platform_filter_excludes_other_platforms_notes(self):
        for r in search_guidance("platform notes", platform="rn", limit=8):
            assert r["platform"] in ("all", "rn")

    def test_a_component_filter_pins_the_component(self):
        for r in search_guidance("accessibility", component="Input", limit=5):
            assert r["component"] == "Input"

    def test_the_component_filter_accepts_any_casing(self):
        assert search_guidance("accessibility", component="input", limit=1)

    def test_kinds_selects_what_is_searched(self):
        for r in search_guidance("focus ring outline", kinds=["code"], limit=3):
            assert r["kind"] == "code"

    def test_the_default_kinds_exclude_generated_code(self):
        assert all(r["kind"] != "code" for r in search_guidance("button", limit=10))

    def test_a_section_and_its_paragraphs_are_not_both_returned(self):
        out = search_guidance("how do I announce a validation error", limit=8)
        parents = [r["source"] + r["section"] for r in out]
        assert len(parents) == len(set(parents))
