"""tools/lint_literals.py — the no-design-literals gate over generated packages.

One fixture file per rule, written to tmp_path so nothing under packages/ is read. React
Native rules key off the path (`packages/rn/`), so RN fixtures are written under that name.
"""
from __future__ import annotations

from pathlib import Path

import pytest

import lint_literals as ll


def scan(tmp_path: Path, text: str, name: str = "Widget.css", rn: bool = False) -> list[tuple[int, str, str]]:
    d = tmp_path / ("packages/rn/src" if rn else "packages/react/src")
    d.mkdir(parents=True, exist_ok=True)
    f = d / name
    f.write_text(text, encoding="utf-8")
    return ll.scan_file(f)


def kinds(findings) -> list[str]:
    return [name for _, name, _ in findings]


class TestHexColor:
    def test_six_digit_hex_is_a_finding(self, tmp_path):
        f = scan(tmp_path, ".ds-widget { color: #3B5BDB; }")
        assert f == [(1, "hex color", "#3B5BDB")]

    @pytest.mark.parametrize("hex_", ["#fff", "#ffff", "#3b5bdb80"])
    def test_short_and_alpha_forms_are_findings_too(self, tmp_path, hex_):
        assert kinds(scan(tmp_path, f"a {{ color: {hex_}; }}")) == ["hex color"]

    def test_a_token_reference_is_not_a_finding(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { color: var(--color-foreground); }") == []

    def test_an_html_entity_is_not_a_hex_color(self, tmp_path):
        assert scan(tmp_path, "const s = '&#8594;';", name="Widget.tsx") == []


class TestPixelLiteral:
    def test_a_pixel_size_is_a_finding(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { padding: 12px; }") == [(1, "pixel literal", "12px")]

    def test_zero_pixels_is_allowed(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { margin: 0px; }") == []

    def test_relative_units_are_allowed(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { inline-size: 1em; block-size: 100%; }") == []

    def test_a_negative_pixel_value_is_a_finding(self, tmp_path):
        assert kinds(scan(tmp_path, ".ds-widget { margin-inline-start: -4px; }")) == ["pixel literal"]


class TestDurationLiteral:
    @pytest.mark.parametrize("dur", ["200ms", "2s"])
    def test_a_duration_is_a_finding(self, tmp_path, dur):
        assert kinds(scan(tmp_path, f".ds-widget {{ transition: opacity {dur}; }}")) == ["duration literal"]

    def test_a_duration_token_is_not_a_finding(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { transition: opacity var(--motion-duration-fast); }") == []

    def test_a_duration_inside_an_import_line_is_tolerated(self, tmp_path):
        # Package names can look like durations; only import lines get that benefit of the doubt.
        assert scan(tmp_path, "import { wait } from 'sleep-500ms';", name="Widget.tsx") == []
        assert kinds(scan(tmp_path, "const t = '500ms';", name="Widget.tsx")) == ["duration literal"]


class TestFontStack:
    def test_a_css_font_stack_is_a_finding(self, tmp_path):
        assert kinds(scan(tmp_path, ".ds-widget { font-family: Inter, sans-serif; }")) == ["font stack literal"]

    @pytest.mark.parametrize("value", ["var(--font-family-body)", "inherit"])
    def test_token_and_inherit_are_allowed(self, tmp_path, value):
        assert scan(tmp_path, f".ds-widget {{ font-family: {value}; }}") == []

    def test_a_quoted_react_native_family_is_a_finding(self, tmp_path):
        f = scan(tmp_path, "const s = { fontFamily: 'Inter' };", name="Widget.tsx", rn=True)
        assert "font stack literal" in kinds(f)

    @pytest.mark.parametrize("value", ["'--ds-text-font-family'", '"--ds-heading-font-family"', "'var(--font-family-body)'"])
    def test_a_custom_property_name_in_a_lookup_table_is_not_a_font_stack(self, tmp_path, value):
        # Override-hook tables map bindings to their hook names: `fontFamily: '--ds-text-font-family'`.
        assert scan(tmp_path, f"const HOOKS = {{ fontFamily: {value} }};", name="Widget.tsx") == []


class TestNamedColor:
    def test_a_named_css_color_is_a_finding(self, tmp_path):
        assert kinds(scan(tmp_path, ".ds-widget { color: white; }")) == ["named color"]

    def test_the_word_inside_a_label_string_is_not_a_color(self, tmp_path):
        assert scan(tmp_path, "const label = 'Black Friday sale';", name="Widget.tsx") == []

    def test_a_quoted_color_assigned_to_a_color_prop_is_still_a_finding(self, tmp_path):
        assert kinds(scan(tmp_path, "const s = { color: 'white' };", name="Widget.tsx")) == ["named color"]


class TestReactNativeSizeNumbers:
    def test_a_bare_size_number_is_a_finding_only_under_packages_rn(self, tmp_path):
        src = "const s = { width: 20, padding: 8 };"
        assert scan(tmp_path, src, name="Widget.tsx", rn=True) == [
            (1, "RN size literal", "width: 20"), (1, "RN size literal", "padding: 8")]
        assert scan(tmp_path, src, name="Widget.tsx", rn=False) == []

    @pytest.mark.parametrize("n", sorted(ll.ALLOWED_NUMBERS))
    def test_hairline_and_half_offset_numbers_are_allowed(self, tmp_path, n):
        assert scan(tmp_path, f"const s = {{ borderWidth: {n} }};", name="Widget.tsx", rn=True) == []

    def test_a_token_lookup_is_not_a_finding(self, tmp_path):
        assert scan(tmp_path, "const s = { padding: t.spaceMd, gap: t.space2 };", name="Widget.tsx", rn=True) == []

    def test_opacity_is_not_a_size(self, tmp_path):
        assert scan(tmp_path, "const s = { opacity: 0.5 };", name="Widget.tsx", rn=True) == []

    def test_react_native_stories_are_exempt(self, tmp_path):
        assert scan(tmp_path, "const s = { width: 320 };", name="Widget.stories.tsx", rn=True) == []


class TestVisuallyHiddenExemption:
    CLIP = """.ds-widget__visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  clip-path: inset(50%);
  white-space: nowrap;
}
"""

    def test_one_pixel_boxes_in_the_clip_pattern_are_allowed(self, tmp_path):
        assert scan(tmp_path, self.CLIP) == []

    def test_one_pixel_outside_that_context_is_still_a_finding(self, tmp_path):
        f = scan(tmp_path, ".ds-widget { border-block-end: 1px solid var(--color-border); }")
        assert f == [(1, "pixel literal", "1px")]

    def test_the_exemption_does_not_cover_other_sizes(self, tmp_path):
        f = scan(tmp_path, self.CLIP.replace("margin: -1px;", "margin: -2px;"))
        assert f == [(5, "pixel literal", "-2px")]


class TestColorMixExemption:
    def test_mixing_tokens_is_allowed(self, tmp_path):
        css = ".ds-widget:hover { background: color-mix(in oklab, var(--color-action-primary-background), transparent 20%); }"
        assert scan(tmp_path, css) == []

    def test_mixing_literals_is_a_finding(self, tmp_path):
        f = scan(tmp_path, ".ds-widget { background: color-mix(in srgb, #ffffff 50%, #000000); }")
        assert "rgb/hsl/oklch color" in kinds(f) and kinds(f).count("hex color") == 2

    @pytest.mark.parametrize("fn", ["rgb(", "rgba(", "hsl(", "oklch("])
    def test_other_color_functions_are_findings(self, tmp_path, fn):
        assert kinds(scan(tmp_path, f".ds-widget {{ color: {fn}0 0 0); }}")) == ["rgb/hsl/oklch color"]


class TestLiteralOkMark:
    def test_a_css_mark_exempts_the_line(self, tmp_path):
        assert scan(tmp_path, ".ds-widget { border-width: 3px; /* literal-ok: hairline on hi-dpi */ }") == []

    def test_a_line_comment_mark_exempts_the_line(self, tmp_path):
        assert scan(tmp_path, "const s = { width: 20 }; // literal-ok: icon glyph box", name="Widget.tsx", rn=True) == []

    def test_the_mark_covers_only_its_own_line(self, tmp_path):
        f = scan(tmp_path, "a { padding: 12px; /* literal-ok: x */ }\nb { padding: 12px; }")
        assert f == [(2, "pixel literal", "12px")]


class TestComments:
    def test_line_comments_are_ignored(self, tmp_path):
        assert scan(tmp_path, "// was 12px before tokens\nconst a = 1;", name="Widget.tsx") == []

    def test_a_trailing_comment_is_stripped_before_scanning(self, tmp_path):
        assert scan(tmp_path, "const a = t.spaceMd; // not 12px", name="Widget.tsx") == []

    def test_block_comments_are_ignored_across_lines(self, tmp_path):
        css = "/* thumb travel:\n   trackWidth - 20px - 2px\n*/\n.ds-widget { color: var(--color-foreground); }"
        assert scan(tmp_path, css) == []


class TestMain:
    def test_files_flag_scans_only_the_named_files_and_fails_on_a_finding(self, tmp_path, monkeypatch, capsys):
        bad = tmp_path / "Bad.css"
        bad.write_text("a { color: #123456; }", encoding="utf-8")
        good = tmp_path / "Good.css"
        good.write_text("a { color: var(--color-foreground); }", encoding="utf-8")
        monkeypatch.setattr("sys.argv", ["lint_literals.py", "--files", str(bad), str(good)])
        assert ll.main() == 1
        out = capsys.readouterr().out
        assert "Bad.css:1: hex color `#123456`" in out
        assert "1 finding(s) in 2 file(s)" in out

    def test_a_clean_set_exits_zero(self, tmp_path, monkeypatch, capsys):
        good = tmp_path / "Good.tsx"
        good.write_text("export const a = 1;", encoding="utf-8")
        monkeypatch.setattr("sys.argv", ["lint_literals.py", "--files", str(good)])
        assert ll.main() == 0
        assert "✔ lint_literals: 0 finding(s)" in capsys.readouterr().out

    def test_declaration_files_and_other_extensions_are_skipped(self, tmp_path, monkeypatch, capsys):
        dts = tmp_path / "css.d.ts"
        dts.write_text("declare const x: '#ffffff';", encoding="utf-8")
        md = tmp_path / "README.md"
        md.write_text("padding: 12px", encoding="utf-8")
        monkeypatch.setattr("sys.argv", ["lint_literals.py", "--files", str(dts), str(md)])
        assert ll.main() == 0
