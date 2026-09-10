"""tools/theme.py — theme doc frontmatter to DTCG token files."""
from __future__ import annotations

import copy
import json

import pytest

import theme as th
import tokens as tk
from oklch import contrast, hex_to_oklch


def resolved(base: dict, mode_tree: dict) -> dict:
    """base + mode merged and resolved the way tokens.load_theme does on disk."""
    tree: dict = {}
    tk._deep_merge(tree, copy.deepcopy(base))
    tk._deep_merge(tree, copy.deepcopy(mode_tree))
    return {p: e["$value"] for p, e in tk.resolve(tk.flatten(tree)).items()}


class TestT:
    def test_wraps_a_value_and_carries_extras(self):
        assert th.T("8px") == {"$value": "8px"}
        assert th.T("8px", **{"$type": "dimension"}) == {"$value": "8px", "$type": "dimension"}


class TestRamp:
    def test_one_step_per_lightness_target(self):
        r = th.ramp(268, 0.19, th.RAMP_L)
        assert list(r) == list(th.RAMP_L)
        assert all(set(v) == {"$value"} for v in r.values())

    def test_pinned_ends_are_pure_white_and_black(self):
        # NEUTRAL_L pins 0 to L=1.0 and 1000 to L=0.0; both must lose all chroma.
        n = th.ramp(268, 0.03, th.NEUTRAL_L, seed_L=0.5)
        assert n["0"]["$value"] == "#ffffff"
        assert n["1000"]["$value"] == "#000000"

    def test_lightness_decreases_monotonically_down_the_ramp(self):
        r = th.ramp(268, 0.19, th.RAMP_L, seed_L=0.52)
        ls = [hex_to_oklch(r[step]["$value"])[0] for step in th.RAMP_L]
        assert ls == sorted(ls, reverse=True)

    def test_each_step_lands_on_its_lightness_target(self):
        r = th.ramp(145, 0.17, th.RAMP_L)
        for step, target in th.RAMP_L.items():
            assert hex_to_oklch(r[step]["$value"])[0] == pytest.approx(target, abs=0.02)

    def test_hue_is_stable_across_the_ramp(self):
        r = th.ramp(145, 0.17, th.RAMP_L)
        hues = [hex_to_oklch(r[s]["$value"])[2] for s in th.RAMP_L]
        assert max(hues) - min(hues) < 8

    def test_chroma_peaks_near_the_seed_lightness(self):
        r = th.ramp(268, 0.19, th.RAMP_L, seed_L=0.58)
        c = {s: hex_to_oklch(v["$value"])[1] for s, v in r.items()}
        assert c["500"] > c["50"] and c["500"] > c["900"]

    def test_zero_chroma_peak_produces_grays(self):
        r = th.ramp(268, 0.0, th.RAMP_L)
        for v in r.values():
            assert hex_to_oklch(v["$value"])[1] == pytest.approx(0, abs=1e-6)


class TestLightestPassing:
    RAMP = {"400": {"$value": "#b9c4f2"}, "500": {"$value": "#7b8fe0"},
            "600": {"$value": "#3553d2"}, "700": {"$value": "#243ab3"}}

    def test_returns_the_first_candidate_that_meets_the_floor(self):
        assert th.lightest_passing(["400", "500", "600", "700"], self.RAMP, "#ffffff", 4.5) == "600"

    def test_candidate_order_not_step_order_decides(self):
        assert th.lightest_passing(["700", "600"], self.RAMP, "#ffffff", 4.5) == "700"

    def test_falls_back_to_the_last_candidate_when_none_pass(self):
        # Nothing on this ramp reaches 21:1; the darkest listed option is returned.
        assert th.lightest_passing(["400", "500"], self.RAMP, "#ffffff", 21.0) == "500"

    def test_a_lower_floor_lets_a_lighter_step_through(self):
        assert th.lightest_passing(["400", "500", "600"], self.RAMP, "#ffffff", 3.0) == "500"


class TestDeriveBase:
    def test_palette_has_every_ramp(self, theme):
        p = th.derive_base(theme)["color"]["palette"]
        assert {"neutral", "brand", "danger", "success", "warning", "info"} <= set(p)

    def test_brand_ramp_is_built_around_the_seed_hue(self, theme):
        seed_h = hex_to_oklch(theme["seed"]["color"])[2]
        brand = th.derive_base(theme)["color"]["palette"]["brand"]
        assert hex_to_oklch(brand["500"]["$value"])[2] == pytest.approx(seed_h, abs=5)

    def test_status_hues_have_their_conventional_defaults(self, theme):
        p = th.derive_base(theme)["color"]["palette"]
        assert hex_to_oklch(p["danger"]["500"]["$value"])[2] == pytest.approx(25, abs=5)
        assert hex_to_oklch(p["success"]["500"]["$value"])[2] == pytest.approx(145, abs=5)

    def test_status_hues_can_be_overridden_in_the_doc(self, theme):
        theme["statusHues"] = {"danger": 12}
        p = th.derive_base(theme)["color"]["palette"]
        assert hex_to_oklch(p["danger"]["500"]["$value"])[2] == pytest.approx(12, abs=5)

    def test_info_defaults_to_the_seed_hue(self, theme):
        p = th.derive_base(theme)["color"]["palette"]
        assert hex_to_oklch(p["info"]["500"]["$value"])[2] == pytest.approx(
            hex_to_oklch(p["brand"]["500"]["$value"])[2], abs=5)

    def test_neutral_tint_controls_how_far_grays_lean_to_the_seed(self, theme):
        cool = th.derive_base({**theme, "neutralTint": 1.0})["color"]["palette"]["neutral"]
        flat = th.derive_base({**theme, "neutralTint": 0.0})["color"]["palette"]["neutral"]
        assert hex_to_oklch(cool["500"]["$value"])[1] > hex_to_oklch(flat["500"]["$value"])[1]
        assert hex_to_oklch(flat["500"]["$value"])[1] == pytest.approx(0, abs=1e-6)

    def test_type_scale_is_the_modular_scale_with_md_at_the_base(self, theme):
        sizes = {k: v["$value"] for k, v in th.derive_base(theme)["font"]["size"].items() if k != "$type"}
        assert sizes["md"] == "16px"          # base
        assert sizes["sm"] == "13px"          # 16 / 1.2
        assert sizes["lg"] == "19px"          # 16 * 1.2
        assert list(sizes) == th.SIZE_NAMES

    def test_a_bigger_ratio_spreads_the_scale(self, theme):
        wide = th.derive_base({**theme, "scale": {"base": 16, "ratio": 1.5}})["font"]["size"]
        assert int(wide["4xl"]["$value"].rstrip("px")) > 40

    @pytest.mark.parametrize("density,step3", [("compact", "9px"), ("comfortable", "12px"), ("roomy", "15px")])
    def test_density_scales_the_spacing_grid(self, theme, density, step3):
        space = th.derive_base({**theme, "density": density})["space"]
        assert space["3"]["$value"] == step3
        assert space["0"]["$value"] == "0px", "zero stays zero at every density"

    def test_spacing_aliases_reference_numbered_steps(self, theme):
        space = th.derive_base(theme)["space"]
        assert space["sm"]["$value"] == "{space.2}"
        assert space["md"]["$value"] == "{space.3}"
        assert space["lg"]["$value"] == "{space.4}"

    @pytest.mark.parametrize("radius,expected", [("none", "0px"), ("sm", "4px"), ("md", "8px"), ("lg", "12px"), ("full", "999px")])
    def test_radius_md_follows_the_named_radius_choice(self, theme, radius, expected):
        assert th.derive_base({**theme, "radius": radius})["radius"]["md"]["$value"] == expected

    def test_radius_full_is_always_a_pill(self, theme):
        assert th.derive_base(theme)["radius"]["full"]["$value"] == "999px"

    @pytest.mark.parametrize("motion,fast", [("none", "0ms"), ("subtle", "120ms"), ("expressive", "160ms")])
    def test_motion_choice_sets_the_durations(self, theme, motion, fast):
        assert th.derive_base({**theme, "motion": motion})["motion"]["duration"]["fast"]["$value"] == fast

    def test_system_typeface_uses_the_platform_stack_unchanged(self, theme):
        fam = th.derive_base(theme)["font"]["family"]
        assert fam["body"]["$value"] == th.SYSTEM_SANS
        assert fam["mono"]["$value"] == th.SYSTEM_MONO

    def test_a_named_typeface_is_prepended_as_the_first_choice(self, theme):
        theme["seed"] = {**theme["seed"], "typeface": "Inter", "headingTypeface": "Söhne", "mono": "JetBrains Mono"}
        fam = th.derive_base(theme)["font"]["family"]
        assert fam["body"]["$value"] == ["Inter", *th.SYSTEM_SANS]
        assert fam["heading"]["$value"] == ["Söhne", *th.SYSTEM_SANS]
        assert fam["mono"]["$value"] == ["JetBrains Mono", *th.SYSTEM_MONO]

    def test_heading_face_falls_back_to_the_body_face(self, theme):
        theme["seed"] = {**theme["seed"], "typeface": "Inter"}
        fam = th.derive_base(theme)["font"]["family"]
        assert fam["heading"]["$value"] == fam["body"]["$value"]

    def test_target_sizes_meet_the_wcag_minimums(self, theme):
        target = th.derive_base(theme)["size"]["target"]
        assert target["min"]["$value"] == "24px"           # WCAG 2.2 AA (2.5.8)
        assert target["comfortable"]["$value"] == "44px"   # touch


class TestDeriveMode:
    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_every_semantic_group_is_present(self, theme, mode):
        c = th.derive_mode(th.derive_base(theme), mode)["color"]
        assert {"foreground", "background", "border", "action"} <= set(c)
        assert {"primary", "secondary", "ghost", "danger"} == set(c["action"])

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_semantic_values_are_references_not_literals(self, theme, mode):
        c = th.derive_mode(th.derive_base(theme), mode)["color"]
        assert c["foreground"]["default"]["$value"].startswith("{color.palette.")
        assert c["action"]["ghost"]["background"]["$value"] == "transparent", "ghost is the one literal"

    @pytest.mark.parametrize("mode", ["light", "dark"])
    @pytest.mark.parametrize("variant", ["primary", "secondary", "danger"])
    def test_action_text_meets_aa_on_its_own_background(self, theme, mode, variant):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        fg = flat[f"color.action.{variant}.foreground"]
        bg = flat[f"color.action.{variant}.background"]
        assert contrast(fg, bg) >= 4.5, f"{variant} on {mode}"

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_ghost_text_meets_aa_on_the_page_background(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        assert contrast(flat["color.action.ghost.foreground"], flat["color.background.default"]) >= 4.5

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_body_and_muted_text_meet_aa_on_the_page_background(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        bg = flat["color.background.default"]
        assert contrast(flat["color.foreground.default"], bg) >= 4.5
        assert contrast(flat["color.foreground.muted"], bg) >= 4.5

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_strong_border_meets_the_non_text_ui_floor(self, theme, mode):
        # WCAG 1.4.11 asks 3:1 for meaningful non-text boundaries.
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        assert contrast(flat["color.border.strong"], flat["color.background.default"]) >= 3.0

    def test_light_and_dark_invert_the_page_background(self, theme):
        base = th.derive_base(theme)
        light = resolved(base, th.derive_mode(base, "light"))
        dark = resolved(base, th.derive_mode(base, "dark"))
        from oklch import luminance
        assert luminance(light["color.background.default"]) > luminance(dark["color.background.default"])

    def test_hover_steps_stay_inside_the_ramp(self, theme):
        base = th.derive_base(theme)
        ramp_steps = set(base["color"]["palette"]["brand"])
        for mode in ("light", "dark"):
            tree = th.derive_mode(base, mode)
            for variant in ("primary", "danger"):
                ref = tree["color"]["action"][variant]["backgroundHover"]["$value"]
                assert ref.strip("{}").split(".")[-1] in ramp_steps, f"{variant}/{mode}: {ref}"

    def test_hover_is_darker_than_rest_in_light_and_lighter_in_dark(self, theme):
        base = th.derive_base(theme)
        from oklch import luminance
        light = resolved(base, th.derive_mode(base, "light"))
        dark = resolved(base, th.derive_mode(base, "dark"))
        assert luminance(light["color.action.primary.backgroundHover"]) < luminance(light["color.action.primary.background"])
        assert luminance(dark["color.action.primary.backgroundHover"]) > luminance(dark["color.action.primary.background"])

    def test_a_hostile_seed_still_produces_passing_actions(self, theme):
        # Yellow is the classic case where 500 cannot carry white text.
        theme["seed"] = {**theme["seed"], "color": "#FFD400"}
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, "light"))
        assert contrast(flat["color.action.primary.foreground"], flat["color.action.primary.background"]) >= 4.5


class TestLayout:
    def test_content_width_defaults_to_960(self, theme):
        layout = th.derive_base(theme)["layout"]
        assert layout["maxWidth"]["content"]["$value"] == "960px"

    def test_max_width_page_is_four_thirds_of_content_width(self, theme):
        layout = th.derive_base({**theme, "layout": {"contentWidth": 900}})["layout"]
        assert layout["maxWidth"]["content"]["$value"] == "900px"
        assert layout["maxWidth"]["page"]["$value"] == "1200px"

    @pytest.mark.parametrize("rhythm,gap_normal", [("tight", "6px"), ("normal", "8px"), ("loose", "12px")])
    def test_rhythm_scales_the_between_component_gap(self, theme, rhythm, gap_normal):
        layout = th.derive_base({**theme, "layout": {"rhythm": rhythm}})["layout"]
        assert layout["gap"]["normal"]["$value"] == gap_normal

    @pytest.mark.parametrize("density,gap_normal", [("compact", "6px"), ("comfortable", "8px"), ("roomy", "10px")])
    def test_density_also_scales_the_same_gap(self, theme, density, gap_normal):
        layout = th.derive_base({**theme, "density": density})["layout"]
        assert layout["gap"]["normal"]["$value"] == gap_normal

    def test_density_and_rhythm_compound(self, theme):
        # 8 * 0.75 (compact) * 1.5 (loose) = 9
        layout = th.derive_base({**theme, "density": "compact", "layout": {"rhythm": "loose"}})["layout"]
        assert layout["gap"]["normal"]["$value"] == "9px"

    def test_gap_none_stays_a_reference_and_is_not_scaled(self, theme):
        layout = th.derive_base({**theme, "layout": {"rhythm": "loose"}})["layout"]
        assert layout["gap"]["none"]["$value"] == "{space.0}"


class TestShadowElevation:
    def test_flat_elevation_gives_every_shadow_zero_alpha(self):
        sh = th.shadows("#000000", th.ELEVATION["flat"], dark=False)
        assert sh["overlay"]["$value"]["color"].endswith("00")
        assert sh["raised"]["$value"]["color"].endswith("00")

    def test_overlay_alpha_increases_with_elevation(self):
        subtle = th.shadows("#000000", th.ELEVATION["subtle"], dark=False)
        pronounced = th.shadows("#000000", th.ELEVATION["pronounced"], dark=False)
        subtle_alpha = int(subtle["overlay"]["$value"]["color"][-2:], 16)
        pronounced_alpha = int(pronounced["overlay"]["$value"]["color"][-2:], 16)
        assert pronounced_alpha > subtle_alpha

    def test_overlay_blur_and_offset_scale_with_elevation_too(self):
        subtle = th.shadows("#000000", 1.0, dark=False)
        pronounced = th.shadows("#000000", 1.6, dark=False)
        assert subtle["overlay"]["$value"]["blur"] == "24px"
        assert pronounced["overlay"]["$value"]["blur"] == "38px"

    def test_dark_mode_uses_a_stronger_base_alpha_than_light_at_the_same_elevation(self):
        light = th.shadows("#000000", 1.0, dark=False)
        dark = th.shadows("#000000", 1.0, dark=True)
        light_alpha = int(light["overlay"]["$value"]["color"][-2:], 16)
        dark_alpha = int(dark["overlay"]["$value"]["color"][-2:], 16)
        assert dark_alpha > light_alpha


class TestControlPair:
    CANDIDATES = ["600", "700", "500", "800"]

    def test_the_selected_fill_meets_3_to_1_on_both_the_page_and_the_control_surface(self, theme):
        base = th.derive_base(theme)
        p = base["color"]["palette"]
        b, n = p["brand"], p["neutral"]
        page_bg = control_bg = n["0"]["$value"]
        step, _ = th.control_pair(b, n, page_bg, control_bg, self.CANDIDATES)
        fill = b[step]["$value"]
        assert contrast(fill, page_bg) >= 3.0
        assert contrast(fill, control_bg) >= 3.0

    def test_the_indicator_ink_meets_4_5_to_1_against_the_chosen_fill(self, theme):
        base = th.derive_base(theme)
        p = base["color"]["palette"]
        b, n = p["brand"], p["neutral"]
        step, ink = th.control_pair(b, n, n["0"]["$value"], n["0"]["$value"], self.CANDIDATES)
        assert contrast(n[ink]["$value"], b[step]["$value"]) >= 4.5

    def test_candidate_order_not_ramp_order_decides(self, theme):
        base = th.derive_base(theme)
        p = base["color"]["palette"]
        b, n = p["brand"], p["neutral"]
        # 600 and 700 both clear every floor against white; listing 700 first must win.
        step, _ = th.control_pair(b, n, n["0"]["$value"], n["0"]["$value"], ["700", "600"])
        assert step == "700"

    def test_a_candidate_that_fails_the_control_surface_is_skipped_even_if_it_passes_the_page(self, theme):
        base = th.derive_base(theme)
        p = base["color"]["palette"]
        b, n = p["brand"], p["neutral"]
        page_bg, control_bg = n["0"]["$value"], n["800"]["$value"]
        # 600 clears 3:1 against the white page but not against the darker control surface.
        assert contrast(b["600"]["$value"], control_bg) < 3.0
        assert contrast(b["600"]["$value"], page_bg) >= 3.0
        step, _ = th.control_pair(b, n, page_bg, control_bg, ["600", "500"])
        assert step == "500"
        assert contrast(b[step]["$value"], control_bg) >= 3.0

    def test_falls_back_to_the_last_candidate_with_white_ink_when_none_pass(self, theme):
        base = th.derive_base(theme)
        p = base["color"]["palette"]
        b, n = p["brand"], p["neutral"]
        # A control surface as dark as the candidate itself never clears 3:1.
        assert th.control_pair(b, n, n["0"]["$value"], b["500"]["$value"], ["500"]) == ("500", "0")


class TestInverseColors:
    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_foreground_and_link_meet_aa_on_the_inverse_surface(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        surface = flat["color.inverse.surface"]
        assert contrast(flat["color.inverse.foreground"], surface) >= 4.5
        assert contrast(flat["color.inverse.link"], surface) >= 4.5

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_muted_also_meets_aa_on_the_inverse_surface(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        assert contrast(flat["color.inverse.muted"], flat["color.inverse.surface"]) >= 4.5

    def test_the_inverse_surface_is_the_opposite_of_the_page_background_in_each_mode(self, theme):
        base = th.derive_base(theme)
        from oklch import luminance
        light = resolved(base, th.derive_mode(base, "light"))
        dark = resolved(base, th.derive_mode(base, "dark"))
        assert luminance(light["color.inverse.surface"]) < luminance(light["color.background.default"])
        assert luminance(dark["color.inverse.surface"]) > luminance(dark["color.background.default"])


class TestApplyOverrides:
    def test_replaces_an_existing_leaf(self):
        tree = {"color": {"foreground": {"default": {"$value": "{color.palette.neutral.800}"}}}}
        th.apply_overrides(tree, {"color.foreground.default": "#123456"})
        assert tree["color"]["foreground"]["default"] == {"$value": "#123456"}

    def test_creates_missing_intermediate_groups(self):
        tree = {}
        th.apply_overrides(tree, {"color.action.primary.background": "#abcdef"})
        assert tree["color"]["action"]["primary"]["background"]["$value"] == "#abcdef"

    def test_empty_overrides_change_nothing(self):
        tree = {"color": {"fg": {"$value": "#000"}}}
        th.apply_overrides(tree, {})
        assert tree == {"color": {"fg": {"$value": "#000"}}}

    def test_a_reference_can_be_used_as_the_override_value(self):
        tree = {}
        th.apply_overrides(tree, {"color.border.focus": "{color.palette.brand.700}"})
        assert tree["color"]["border"]["focus"]["$value"] == "{color.palette.brand.700}"


class TestMain:
    """main() reads theme docs from DOCS and writes token files to OUT."""

    def _run(self, tmp_path, monkeypatch, docs_text, name="test-theme.md"):
        docs, out = tmp_path / "docs", tmp_path / "out"
        docs.mkdir()
        (docs / name).write_text(docs_text, encoding="utf-8")
        monkeypatch.setattr(th, "DOCS", docs)
        monkeypatch.setattr(th, "OUT", out)
        monkeypatch.setattr(th, "ROOT", tmp_path)
        return th.main(), out

    def _doc(self, theme_dict, body="\nSome prose.\n"):
        import yaml
        return "---\n" + yaml.safe_dump({"title": "Test", "theme": theme_dict}, sort_keys=False) + "---\n" + body

    def test_writes_base_modes_and_the_source_decisions(self, tmp_path, monkeypatch, theme):
        code, out = self._run(tmp_path, monkeypatch, self._doc(theme))
        assert code == 0
        for f in ("base.json", "light.json", "dark.json", "theme.json"):
            assert (out / "test-theme" / f).exists(), f
        assert json.loads((out / "test-theme" / "theme.json").read_text())["id"] == "test-theme"

    def test_only_declared_modes_are_written(self, tmp_path, monkeypatch, theme):
        theme["modes"] = {"default": "light", "supports": ["light"]}
        _, out = self._run(tmp_path, monkeypatch, self._doc(theme))
        assert (out / "test-theme" / "light.json").exists()
        assert not (out / "test-theme" / "dark.json").exists()

    def test_id_must_match_the_file_name(self, tmp_path, monkeypatch, theme, capsys):
        code, _ = self._run(tmp_path, monkeypatch, self._doc(theme), name="other-name.md")
        assert code == 1
        assert "should match file name" in capsys.readouterr().err

    def test_schema_violations_fail_the_build(self, tmp_path, monkeypatch, theme, capsys):
        theme["density"] = "cavernous"
        code, _ = self._run(tmp_path, monkeypatch, self._doc(theme))
        assert code == 1
        assert "density" in capsys.readouterr().err

    def test_docs_without_a_theme_block_are_ignored(self, tmp_path, monkeypatch):
        code, out = self._run(tmp_path, monkeypatch, "---\ntitle: Just a page\n---\n\nProse.\n", name="page.md")
        assert code == 0
        assert not out.exists() or not any(out.iterdir())

    def test_overrides_are_applied_to_the_written_mode(self, tmp_path, monkeypatch, theme):
        theme["overrides"] = {"light": {"color.border.focus": "#ff00ff"}}
        _, out = self._run(tmp_path, monkeypatch, self._doc(theme))
        light = json.loads((out / "test-theme" / "light.json").read_text())
        assert light["color"]["border"]["focus"]["$value"] == "#ff00ff"

    def test_output_is_loadable_by_the_resolver(self, tmp_path, monkeypatch, theme):
        _, out = self._run(tmp_path, monkeypatch, self._doc(theme))
        monkeypatch.setattr(tk, "THEMES_DIR", out)
        flat = tk.load_theme("test-theme", "light")
        assert flat["color.action.primary.background"]["$value"].startswith("#")
