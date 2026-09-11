"""tools/theme.py — two-seed palettes (`seed.neutral`) and the achromatic "ink" brand rule."""
from __future__ import annotations

import copy
import json
from itertools import product

import pytest

import check_contrast as cc
import theme as th
import tokens as tk
from oklch import contrast, hex_to_oklch

SAND, INK = "#C9B99C", "#1E1A16"


def resolved(base: dict, mode_tree: dict) -> dict:
    tree: dict = {}
    tk._deep_merge(tree, copy.deepcopy(base))
    tk._deep_merge(tree, copy.deepcopy(mode_tree))
    return {tk.public_name(p): e["$value"] for p, e in tk.resolve(tk.flatten(tree)).items()}


def two_seed(theme: dict) -> dict:
    return {**theme, "seed": {**theme["seed"], "color": INK, "neutral": SAND}}


class TestUnchangedWithoutTheNewFields:
    @pytest.mark.parametrize("theme_id", ["calm-precise", "warm-sleek"])
    def test_the_committed_tokens_are_what_the_code_derives(self, root, theme_id):
        """The on-disk tokens for the one-seed themes must not move: derive them again and compare."""
        folder = root / "tokens" / "themes" / theme_id
        if not (folder / "theme.json").exists():
            pytest.skip("run tools/theme.py first")
        t = json.loads((folder / "theme.json").read_text(encoding="utf-8"))
        assert "neutral" not in t["seed"]
        assert th.derive_base(t) == json.loads((folder / "base.json").read_text(encoding="utf-8"))
        for mode in t["modes"]["supports"]:
            tree = th.derive_mode(th.derive_base(t), mode, th.ELEVATION[t.get("elevation", "subtle")], ink=th.is_ink(t["seed"]["color"]))
            th.apply_overrides(tree, (t.get("overrides") or {}).get(mode) or {})
            assert tree == json.loads((folder / f"{mode}.json").read_text(encoding="utf-8")), f"{theme_id}/{mode} drifted"

    def test_a_chromatic_seed_is_not_ink(self, theme):
        assert th.is_ink(theme["seed"]["color"]) is False
        assert th.is_ink(INK) is True


class TestNeutralSeed:
    def test_targets_compress_the_light_end_and_lift_the_dark_end(self):
        t = th.neutral_targets(hex_to_oklch(SAND)[0])
        assert t["0"] == pytest.approx(min(hex_to_oklch(SAND)[0] + 0.15, 0.96), abs=1e-3)
        assert t["0"] > t["50"] > t["100"] > t["200"] > t["300"] == 0.80, "order kept, 300 untouched"
        assert t["1000"] == th.NEUTRAL_BOTTOM and t["900"] > t["1000"]
        assert t["500"] == th.NEUTRAL_L["500"]

    def test_a_dark_neutral_seed_still_gets_a_light_page(self):
        assert th.neutral_targets(0.3)["0"] == th.NEUTRAL_TOP_MIN

    def test_the_page_is_sand_not_white(self, theme):
        n = th.derive_base(two_seed(theme))["color"]["palette"]["neutral"]
        L, C, H = hex_to_oklch(n["0"]["$value"])
        assert n["0"]["$value"] != "#ffffff"
        assert L == pytest.approx(min(hex_to_oklch(SAND)[0] + 0.15, 0.96), abs=0.02)
        assert C > 0.005 and abs(H - hex_to_oklch(SAND)[2]) < 10, "the page carries the sand hue"

    def test_the_darkest_step_is_a_warm_black_not_pure_black(self, theme):
        n = th.derive_base(two_seed(theme))["color"]["palette"]["neutral"]
        L, C, H = hex_to_oklch(n["1000"]["$value"])
        assert n["1000"]["$value"] != "#000000"
        assert L < 0.15 and 0 < C < 0.02 and abs(H - hex_to_oklch(SAND)[2]) < 25

    def test_chroma_is_capped(self, theme):
        loud = {**theme, "seed": {**theme["seed"], "neutral": "#E0A040"}}  # a saturated 'neutral'
        n = th.derive_base(loud)["color"]["palette"]["neutral"]
        assert max(hex_to_oklch(v["$value"])[1] for v in n.values()) <= th.NEUTRAL_CHROMA_MAX + 1e-6

    def test_neutral_tint_no_longer_matters_when_a_neutral_seed_is_set(self, theme):
        a = th.derive_base({**two_seed(theme), "neutralTint": 0.1})["color"]["palette"]["neutral"]
        b = th.derive_base({**two_seed(theme), "neutralTint": 0.9})["color"]["palette"]["neutral"]
        assert a == b


class TestInkBrand:
    @pytest.fixture
    def flat(self, theme):
        base = th.derive_base(two_seed(theme))
        return {mode: resolved(base, th.derive_mode(base, mode, ink=True)) for mode in ("light", "dark")}, base

    def test_light_primary_is_the_darkest_neutral_with_light_ink(self, flat):
        f, base = flat
        n = base["color"]["palette"]["neutral"]
        assert f["light"]["color.action.primary.background"] == n["1000"]["$value"]
        assert f["light"]["color.action.primary.foreground"] == n["0"]["$value"]

    def test_dark_primary_is_the_inverse(self, flat):
        f, base = flat
        n = base["color"]["palette"]["neutral"]
        assert f["dark"]["color.action.primary.background"] == n["0"]["$value"]
        assert f["dark"]["color.action.primary.foreground"] == n["1000"]["$value"]

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_links_are_the_text_color(self, flat, mode):
        f, _ = flat
        assert f[mode]["color.link"] == f[mode]["color.foreground"]

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_focus_ring_reads_on_page_and_control(self, flat, mode):
        f, _ = flat
        control = f[mode]["color.control.background"]
        assert contrast(f[mode]["color.border.focus"], f[mode]["color.background"]) >= 3.0
        assert contrast(f[mode]["color.border.focus"], control) >= 3.0

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_selected_control_follows_the_inversion(self, flat, mode):
        f, base = flat
        n = base["color"]["palette"]["neutral"]
        fill, ink = ("0", "1000") if mode == "dark" else ("1000", "0")
        assert f[mode]["color.control.selectedBackground"] == n[fill]["$value"]
        assert f[mode]["color.control.selectedForeground"] == n[ink]["$value"]

    def test_status_hues_are_untouched(self, theme):
        plain = th.derive_base(theme)["color"]["palette"]
        ink = th.derive_base(two_seed(theme))["color"]["palette"]
        for tone in ("danger", "success", "warning"):
            assert plain[tone] == ink[tone]

    @pytest.mark.parametrize("mode", ["light", "dark"])
    def test_primary_and_danger_text_still_meet_aa(self, flat, mode):
        f, _ = flat
        for variant in ("primary", "secondary", "danger"):
            assert contrast(f[mode][f"color.action.{variant}.foreground"], f[mode][f"color.action.{variant}.background"]) >= 4.5, f"{variant}/{mode}"

    def test_the_rule_is_detected_from_the_ramp_when_not_told(self, theme):
        base = th.derive_base(two_seed(theme))
        assert th.derive_mode(base, "light") == th.derive_mode(base, "light", ink=True)
        chromatic = th.derive_base(theme)
        assert th.derive_mode(chromatic, "light") == th.derive_mode(chromatic, "light", ink=False)


class TestEveryDeclaredPairPassesOnSand:
    """The same loop as tools/check_contrast.py, in-process, over the sand-and-ink palette for every component."""

    def test_all_components(self, root, theme):
        components_json = root / "generated" / "components.json"
        if not components_json.exists():
            pytest.skip("run tools/parse.ts first")
        components = json.loads(components_json.read_text(encoding="utf-8"))
        base = th.derive_base(two_seed(theme))
        palettes = {mode: resolved(base, th.derive_mode(base, mode, ink=True)) for mode in ("light", "dark")}
        failures, checked = [], 0
        for entry in components:
            c = entry["component"]
            for pair in c.get("a11y", {}).get("contrast", []) or []:
                need = cc.THRESHOLDS[(pair.get("level", "AA"), pair.get("large", False))]
                fgs, bgs = cc.expand(pair["foreground"], c["props"]), cc.expand(pair["background"], c["props"])
                combos = zip(fgs, bgs) if len(fgs) == len(bgs) > 1 else product(fgs, bgs)
                for fg_ref, bg_ref in combos:
                    for mode, tokens in palettes.items():
                        fg, bg = tokens.get(fg_ref), tokens.get(bg_ref)
                        if fg is None or bg is None:
                            continue  # the token-existence test elsewhere owns this
                        if bg == "transparent":
                            bg = tokens["color.background"]
                        checked += 1
                        ratio = contrast(fg, bg)
                        if ratio < need:
                            failures.append(f"{c['name']} {mode}: {fg_ref} on {bg_ref} {ratio:.2f} < {need}")
        assert checked > 100
        assert not failures, "\n".join(failures)
