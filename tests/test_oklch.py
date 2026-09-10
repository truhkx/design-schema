"""tools/oklch.py — the color math every derived palette and contrast check rests on."""
from __future__ import annotations

import math

import pytest

from oklch import (contrast, hex_to_oklch, hex_to_rgb, linear_to_oklab, luminance,
                   oklab_to_linear, oklch_to_hex, rgb_to_hex)


class TestHexRgb:
    def test_six_digit_with_and_without_hash(self):
        assert hex_to_rgb("#ffffff") == (1.0, 1.0, 1.0)
        assert hex_to_rgb("ffffff") == (1.0, 1.0, 1.0)
        assert hex_to_rgb("#000000") == (0.0, 0.0, 0.0)

    def test_three_digit_shorthand_expands(self):
        assert hex_to_rgb("#abc") == hex_to_rgb("#aabbcc")

    def test_channel_order_is_rgb(self):
        r, g, b = hex_to_rgb("#804020")
        assert r > g > b

    def test_rgb_to_hex_round_trips(self):
        for h in ("#000000", "#ffffff", "#3b5bdb", "#123456"):
            assert rgb_to_hex(hex_to_rgb(h)) == h

    def test_rgb_to_hex_clamps_out_of_gamut_channels(self):
        assert rgb_to_hex((1.5, -0.2, 0.5)) == "#ff0080"


class TestOklab:
    def test_linear_oklab_round_trip(self):
        for rgb in [(0.1, 0.5, 0.9), (1.0, 0.0, 0.0), (0.5, 0.5, 0.5)]:
            back = oklab_to_linear(*linear_to_oklab(*rgb))
            assert back == pytest.approx(rgb, abs=1e-6)

    def test_gray_has_no_chroma(self):
        L, a, b = linear_to_oklab(0.25, 0.25, 0.25)
        assert math.hypot(a, b) == pytest.approx(0, abs=1e-6)

    def test_negative_components_keep_their_sign(self):
        # The cube root uses copysign, so a slightly-out-of-gamut negative input
        # must not become NaN (Python raises on (-x) ** (1/3) for floats).
        L, a, b = linear_to_oklab(-0.01, 0.5, 0.5)
        assert all(math.isfinite(v) for v in (L, a, b))


class TestOklch:
    @pytest.mark.parametrize("hex_color", ["#3b5bdb", "#ff0000", "#123456", "#808080", "#ffffff", "#000000"])
    def test_hex_oklch_round_trip_is_exact_for_in_gamut_colors(self, hex_color):
        assert oklch_to_hex(*hex_to_oklch(hex_color)) == hex_color

    def test_lightness_ordering_matches_perception(self):
        assert hex_to_oklch("#000000")[0] == pytest.approx(0.0, abs=1e-6)
        assert hex_to_oklch("#ffffff")[0] == pytest.approx(1.0, abs=1e-6)
        assert hex_to_oklch("#111111")[0] < hex_to_oklch("#eeeeee")[0]

    def test_grays_have_zero_chroma(self):
        assert hex_to_oklch("#808080")[1] == pytest.approx(0.0, abs=1e-6)

    def test_hue_is_degrees_in_zero_to_360(self):
        for h in ("#ff0000", "#00ff00", "#0000ff", "#3b5bdb"):
            assert 0 <= hex_to_oklch(h)[2] < 360

    def test_out_of_gamut_chroma_is_reduced_not_rejected(self):
        # ramp() asks for chroma the sRGB cube cannot hold at some lightnesses;
        # the binary search must still return a usable color.
        out = oklch_to_hex(0.5, 5.0, 250)
        assert len(out) == 7 and out.startswith("#")
        L, C, _ = hex_to_oklch(out)
        assert L == pytest.approx(0.5, abs=0.02)
        assert C < 5.0

    def test_lightness_survives_chroma_clamping(self):
        # Hue and lightness are what the ramp promises to preserve.
        for hue in (25, 145, 268):
            L, C, H = hex_to_oklch(oklch_to_hex(0.68, 0.4, hue))
            assert L == pytest.approx(0.68, abs=0.02)
            assert H == pytest.approx(hue, abs=3)

    def test_zero_chroma_ends_are_pure_black_and_white(self):
        assert oklch_to_hex(0.0, 0.0, 200) == "#000000"
        assert oklch_to_hex(1.0, 0.0, 200) == "#ffffff"


class TestWcag:
    def test_luminance_endpoints(self):
        assert luminance("#ffffff") == pytest.approx(1.0)
        assert luminance("#000000") == pytest.approx(0.0)

    def test_luminance_weights_green_highest(self):
        assert luminance("#00ff00") > luminance("#ff0000") > luminance("#0000ff")

    def test_max_contrast_is_21(self):
        assert contrast("#ffffff", "#000000") == pytest.approx(21.0)

    def test_contrast_is_symmetric_and_self_is_one(self):
        assert contrast("#3b5bdb", "#ffffff") == pytest.approx(contrast("#ffffff", "#3b5bdb"))
        assert contrast("#3b5bdb", "#3b5bdb") == pytest.approx(1.0)

    def test_known_ratio(self):
        # #767676 on white is the canonical "just passes AA" gray.
        assert contrast("#767676", "#ffffff") == pytest.approx(4.54, abs=0.01)
