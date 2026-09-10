"""tools/theme.py — layout rhythm, inverse surfaces and shadows (the parts test_theme.py does not cover)."""
from __future__ import annotations

import copy

import pytest

import theme as th
import tokens as tk
from oklch import contrast, luminance


def resolved(base: dict, mode_tree: dict) -> dict:
    """base + mode merged and resolved the way tokens.load_theme does on disk."""
    tree: dict = {}
    tk._deep_merge(tree, copy.deepcopy(base))
    tk._deep_merge(tree, copy.deepcopy(mode_tree))
    return {p: e["$value"] for p, e in tk.resolve(tk.flatten(tree)).items()}


def px(v: str) -> int:
    return int(v.rstrip("px"))


class TestLayoutRhythm:
    @pytest.mark.parametrize("density,rhythm,section_md,gap_loose", [
        ("comfortable", "normal", 48, 16),   # 1.0 × 1.0
        ("compact", "tight", 27, 9),         # 0.75 × 0.75
        ("roomy", "loose", 90, 30),          # 1.25 × 1.5
        ("compact", "loose", 54, 18),        # 0.75 × 1.5 — rhythm can undo density
    ])
    def test_between_component_steps_scale_by_density_times_rhythm(self, theme, density, rhythm, section_md, gap_loose):
        layout = th.derive_base({**theme, "density": density, "layout": {"rhythm": rhythm}})["layout"]
        assert px(layout["section"]["md"]["$value"]) == section_md
        assert px(layout["gap"]["loose"]["$value"]) == gap_loose

    def test_section_and_gap_keep_their_proportions_at_every_rhythm(self, theme):
        for rhythm in th.RHYTHM:
            layout = th.derive_base({**theme, "layout": {"rhythm": rhythm}})["layout"]
            sm, md, lg = (px(layout["section"][k]["$value"]) for k in ("sm", "md", "lg"))
            assert sm < md < lg
            tight, normal, loose = (px(layout["gap"][k]["$value"]) for k in ("tight", "normal", "loose"))
            assert tight < normal < loose

    def test_within_component_spacing_is_untouched_by_rhythm(self, theme):
        # Density scales `space`; rhythm must not, or a loose page would also loosen every button.
        tight = th.derive_base({**theme, "layout": {"rhythm": "tight"}})["space"]
        loose = th.derive_base({**theme, "layout": {"rhythm": "loose"}})["space"]
        assert tight == loose

    def test_gutter_and_inset_are_references_into_space(self, theme):
        layout = th.derive_base(theme)["layout"]
        assert layout["gutter"]["default"]["$value"] == "{space.6}"
        assert layout["inset"]["md"]["$value"] == "{space.md}"
        assert layout["gap"]["none"]["$value"] == "{space.0}"

    def test_a_missing_layout_block_means_normal_rhythm_at_960(self, theme):
        theme.pop("layout", None)
        layout = th.derive_base(theme)["layout"]
        assert layout["maxWidth"]["content"]["$value"] == "960px"
        assert px(layout["gap"]["normal"]["$value"]) == 8


class TestMaxWidth:
    @pytest.mark.parametrize("content,page", [(960, 1280), (1040, 1387), (720, 960)])
    def test_page_is_four_thirds_of_content(self, theme, content, page):
        mw = th.derive_base({**theme, "layout": {"contentWidth": content}})["layout"]["maxWidth"]
        assert mw["content"]["$value"] == f"{content}px"
        assert mw["page"]["$value"] == f"{page}px"

    def test_prose_is_a_65_character_measure_at_the_body_size(self, theme):
        mw = th.derive_base({**theme, "scale": {"base": 16, "ratio": 1.2}})["layout"]["maxWidth"]
        assert mw["prose"]["$value"] == f"{round(16 * 0.55 * 65)}px"
        bigger = th.derive_base({**theme, "scale": {"base": 20, "ratio": 1.2}})["layout"]["maxWidth"]
        assert px(bigger["prose"]["$value"]) > px(mw["prose"]["$value"])

    def test_widths_are_absolute_pixels_so_react_native_can_use_them(self, theme):
        mw = th.derive_base(theme)["layout"]["maxWidth"]
        for k in ("prose", "content", "page"):
            assert mw[k]["$value"].endswith("px") and "{" not in mw[k]["$value"]


class TestInverse:
    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_link_meets_aa_on_the_inverse_surface(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        assert contrast(flat["color.inverse.link"], flat["color.inverse.surface"]) >= 4.5, mode

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_foreground_and_muted_meet_aa_on_the_inverse_surface(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        surface = flat["color.inverse.surface"]
        assert contrast(flat["color.inverse.foreground"], surface) >= 4.5
        assert contrast(flat["color.inverse.muted"], surface) >= 4.5

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_status_icons_meet_the_non_text_floor_on_the_inverse_surface(self, theme, mode):
        base = th.derive_base(theme)
        flat = resolved(base, th.derive_mode(base, mode))
        surface = flat["color.inverse.surface"]
        for tone in ("info", "success", "warning", "danger"):
            assert contrast(flat[f"color.inverse.status.{tone}"], surface) >= 3.0, f"{tone}/{mode}"

    def test_the_inverse_surface_flips_the_page(self, theme):
        base = th.derive_base(theme)
        for mode in ("light", "dark"):
            flat = resolved(base, th.derive_mode(base, mode))
            page, inv = luminance(flat["color.background.default"]), luminance(flat["color.inverse.surface"])
            assert (page > inv) if mode == "light" else (page < inv), mode

    def test_focus_ring_on_the_inverse_surface_reuses_the_link_step(self, theme):
        base = th.derive_base(theme)
        for mode in ("light", "dark"):
            inv = th.inverse_colors(base["color"]["palette"], mode)
            assert inv["focus"]["$value"] == inv["link"]["$value"]

    def test_a_hostile_seed_still_yields_a_readable_inverse_link(self, theme):
        theme["seed"] = {**theme["seed"], "color": "#FFEBBA"}  # nearly colorless, very light
        base = th.derive_base(theme)
        for mode in ("light", "dark"):
            flat = resolved(base, th.derive_mode(base, mode))
            assert contrast(flat["color.inverse.link"], flat["color.inverse.surface"]) >= 4.5, mode


class TestAlphaHex:
    def test_appends_the_alpha_byte(self):
        assert th.alpha_hex("#3b5bdb", 0.4) == "#3b5bdb66"
        assert th.alpha_hex("#000000", 0.0) == "#00000000"
        assert th.alpha_hex("#000000", 1.0) == "#000000ff"

    def test_an_existing_alpha_is_replaced_not_stacked(self):
        assert th.alpha_hex("#00000080", 0.5) == "#00000080"


class TestShadows:
    INK = "#000000"

    def test_two_steps_as_dtcg_shadow_objects(self):
        s = th.shadows(self.INK, 1.0, dark=False)
        assert s["$type"] == "shadow" and set(s) == {"$type", "raised", "overlay"}
        raised = s["raised"]["$value"]
        assert set(raised) == {"color", "offsetX", "offsetY", "blur", "spread"}
        assert raised["offsetX"] == "0px" and raised["spread"] == "0px"

    def test_subtle_elevation_gives_the_base_geometry_and_opacity(self):
        s = th.shadows(self.INK, th.ELEVATION["subtle"], dark=False)
        assert s["raised"]["$value"] == {"color": "#0000001a", "offsetX": "0px", "offsetY": "1px", "blur": "3px", "spread": "0px"}
        assert s["overlay"]["$value"]["offsetY"] == "8px" and s["overlay"]["$value"]["blur"] == "24px"
        assert s["overlay"]["$value"]["color"] == "#0000002e"

    def test_pronounced_elevation_scales_offset_blur_and_opacity(self):
        base = th.shadows(self.INK, 1.0, dark=False)["overlay"]["$value"]
        big = th.shadows(self.INK, th.ELEVATION["pronounced"], dark=False)["overlay"]["$value"]
        assert px(big["offsetY"]) > px(base["offsetY"])
        assert px(big["blur"]) > px(base["blur"])
        assert int(big["color"][7:], 16) > int(base["color"][7:], 16)
        assert big["blur"] == f"{round(24 * th.ELEVATION['pronounced'])}px"

    def test_flat_elevation_has_zero_alpha_and_no_geometry(self):
        s = th.shadows(self.INK, th.ELEVATION["flat"], dark=False)
        for step in ("raised", "overlay"):
            v = s[step]["$value"]
            assert v["color"].endswith("00"), "fully transparent"
            assert v["offsetY"] == "0px" and v["blur"] == "0px"

    def test_opacity_is_capped_at_fully_opaque(self):
        s = th.shadows(self.INK, 10.0, dark=True)
        assert s["overlay"]["$value"]["color"] == "#000000ff"

    def test_dark_mode_shadows_are_stronger_than_light(self):
        light = th.shadows(self.INK, 1.0, dark=False)
        dark = th.shadows(self.INK, 1.0, dark=True)
        for step in ("raised", "overlay"):
            assert int(dark[step]["$value"]["color"][7:], 16) > int(light[step]["$value"]["color"][7:], 16)

    def test_shadows_are_cast_in_the_darkest_neutral(self):
        s = th.shadows("#1a1814", 1.0, dark=False)
        assert s["raised"]["$value"]["color"].startswith("#1a1814")

    @pytest.mark.parametrize("elevation", list(th.ELEVATION))
    def test_derive_mode_carries_the_shadow_group_for_every_elevation(self, theme, elevation):
        base = th.derive_base(theme)
        tree = th.derive_mode(base, "light", th.ELEVATION[elevation])
        expected = th.shadows(base["color"]["palette"]["neutral"]["1000"]["$value"], th.ELEVATION[elevation], dark=False)
        assert tree["shadow"] == expected

    def test_derive_mode_defaults_to_subtle_elevation(self, theme):
        base = th.derive_base(theme)
        assert th.derive_mode(base, "dark")["shadow"] == th.derive_mode(base, "dark", th.ELEVATION["subtle"])["shadow"]
