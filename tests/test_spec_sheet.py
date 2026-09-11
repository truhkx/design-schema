"""tools/spec_sheet.py — the generated spec-sheet page over a token dist and components.json."""
from __future__ import annotations

import json

import pytest

import spec_sheet as ss


PROPS = {
    "variant": {"type": "enum", "values": ["primary", "ghost"], "description": "Emphasis."},
    "surface": {"type": "enum", "values": ["default", "subtle"], "description": "Background."},
    "label": {"type": "string", "description": "Text."},
}

LIGHT = {
    "color.palette.brand.500": "#496ded",
    "color.foreground": "#2a2b2f",
    "color.foreground.muted": "#767676",  # 4.54:1 on white — passes AA
    "color.background": "#ffffff",
    "color.background.subtle": "#f6f7f8",
    "color.link": "#3553d2",
    "color.action.primary.background": "#3553d2",
    "color.action.primary.foreground": "#ffffff",
    "color.action.ghost.background": "transparent",
    "color.action.ghost.foreground": "#3553d2",
    "color.status.info.background": "#f1f5ff",
    "color.status.info.foreground": "#405bb6",
    "color.status.info.icon": "#99b5ff",  # 1.85:1 — fails even the 3.0 graphic floor
    "color.inverse.surface": "#17181b",
    "color.inverse.foreground": "#f6f7f8",
    "font.family.body": ["system-ui", "Segoe UI", "sans-serif"],
    "font.weight.regular": 400,
    "font.size.md": "16px",
    "font.size.lg": "19px",
    "font.lineHeight.normal": 1.5,
    "space.1": "4px",
    "space.10": "40px",
    "space.sm": "8px",
    "layout.gap.normal": "8px",
    "layout.maxWidth.page": "1280px",
    "radius.md": "4px",
    "shadow.raised": {"color": "#0000001a", "offsetX": "0px", "offsetY": "1px", "blur": "3px", "spread": "0px"},
    "motion.easing.standard": [0.2, 0, 0, 1],
}
DARK = {**LIGHT, "color.foreground": "#ecedee", "color.background": "#17181b", "color.action.primary.foreground": "#17181b"}

COMPONENTS = [
    {"id": "widget", "title": "Widget", "component": {"name": "Widget", "props": PROPS, "styles": {
        "background": {"token": "color.action.{variant}.background", "locked": False},
        "surface": {"token": "color.background.{surface}", "locked": True, "description": "Page | subtle."},
        "shadow": {"token": "shadow.raised", "locked": False},
        "missing": {"token": "color.nope", "locked": False},
        "badSlot": {"token": "color.{label}.x", "locked": False},
    }}},
    {"id": "plain", "title": "Plain", "component": {"name": "Plain", "props": {}, "styles": {}}},
]


@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    """A fake dist with two themes, a components.json, and an output path, all under tmp_path."""
    dist = tmp_path / "dist"
    for theme in ("fake", "other"):
        (dist / theme / "json").mkdir(parents=True)
        (dist / theme / "json" / "tokens.light.json").write_text(json.dumps(LIGHT), encoding="utf-8")
        (dist / theme / "json" / "tokens.dark.json").write_text(json.dumps(DARK), encoding="utf-8")
    generated = tmp_path / "components.json"
    generated.write_text(json.dumps(COMPONENTS), encoding="utf-8")
    out = tmp_path / "site" / "spec-sheet.md"
    monkeypatch.setattr(ss, "DIST", dist)
    monkeypatch.setattr(ss, "GENERATED", generated)
    monkeypatch.setattr(ss, "OUT", out)
    monkeypatch.setattr(ss, "ROOT", tmp_path)
    return out


def page(sandbox, argv=("--theme", "fake")) -> str:
    assert ss.main(list(argv)) == 0
    return sandbox.read_text(encoding="utf-8")


class TestFormatting:
    def test_lookup_drops_a_trailing_default_segment(self):
        assert ss.lookup(LIGHT, "color.background.default") == "#ffffff"
        assert ss.lookup(LIGHT, "color.background.subtle") == "#f6f7f8"
        assert ss.lookup(LIGHT, "color.nope") is None

    def test_values_render_as_display_text(self):
        assert ss.fmt(None) == "—"
        assert ss.fmt(LIGHT["shadow.raised"]) == "0px 1px 3px 0px #0000001a"
        assert ss.fmt(LIGHT["motion.easing.standard"]) == "cubic-bezier(0.2, 0, 0, 1)"
        assert ss.fmt(LIGHT["font.family.body"]) == "system-ui, Segoe UI, sans-serif"
        assert ss.fmt(400) == "400"

    def test_multi_word_families_are_quoted_for_css(self):
        assert ss.css_font_family(LIGHT["font.family.body"]) == "system-ui, 'Segoe UI', sans-serif"

    def test_color_cells_carry_a_swatch_and_pipes_are_escaped(self):
        assert 'background: #3553d2"' in ss.cell("#3553d2") and "`#3553d2`" in ss.cell("#3553d2")
        assert ss.cell("4px") == "4px"
        assert ss.text_cell("a | b\nc") == "a \\| b c"


class TestContrast:
    def test_a_transparent_background_is_checked_against_the_page(self):
        assert ss.ratio(LIGHT, "color.action.ghost.foreground", "color.action.ghost.background") == pytest.approx(
            ss.ratio(LIGHT, "color.action.ghost.foreground", "color.background"))

    def test_non_color_or_missing_operands_give_none(self):
        assert ss.ratio(LIGHT, "color.nope", "color.background") is None
        assert ss.ratio(LIGHT, "space.1", "color.background") is None

    def test_pairs_use_text_and_graphic_floors(self):
        pairs = {(fg, bg): need for fg, bg, need in ss.contrast_pairs(LIGHT)}
        assert pairs[("color.action.primary.foreground", "color.action.primary.background")] == 4.5
        assert pairs[("color.foreground.muted", "color.background")] == 4.5
        assert pairs[("color.link", "color.background")] == 4.5
        assert pairs[("color.status.info.foreground", "color.status.info.background")] == 4.5
        assert pairs[("color.status.info.icon", "color.status.info.background")] == 3.0
        assert pairs[("color.inverse.foreground", "color.inverse.surface")] == 4.5
        assert ("color.palette.brand.500", "color.background") not in pairs


class TestMain:
    def test_writes_the_page_and_prints_the_summary(self, sandbox, capsys):
        assert ss.main(["--theme", "fake"]) == 0
        assert sandbox.exists()
        out = capsys.readouterr().out
        assert out.startswith(f"✔ spec sheet: {len(LIGHT)} tokens, 2 components → site/spec-sheet.md")

    def test_defaults_to_the_calm_precise_theme(self, sandbox, capsys):
        assert ss.main([]) == 1  # not in the fake dist
        assert "calm-precise" in capsys.readouterr().err

    def test_frontmatter_and_generated_marker(self, sandbox):
        text = page(sandbox)
        assert text.startswith("---\ntitle: Spec sheet\n")
        assert "sidebar:\n  order: 9\n---\n<!-- generated by tools/spec_sheet.py" in text

    def test_other_themes_are_mentioned_in_the_intro(self, sandbox):
        text = page(sandbox)
        assert "**fake**" in text and "`other`" in text
        assert "`fake`" not in text.split("## Spacing scale")[0].split("theme and")[1]  # not listed as an "other"

    def test_sections_come_in_order(self, sandbox):
        text = page(sandbox)
        idx = [text.index(h) for h in ("## Spacing scale", "## Layout rhythm", "## Type scale", "## Color roles",
                                       "## Components", "## Widget", "## Plain")]
        assert idx == sorted(idx)

    def test_spacing_bars_are_sized_by_pixel_value_and_sorted_numerically(self, sandbox):
        text = page(sandbox)
        assert '>space.1</span><div style="inline-size: 4px;' in text
        assert '>space.10</span><div style="inline-size: 40px;' in text
        assert text.index("space.1<") < text.index("space.10<") < text.index("space.sm<")
        assert '>layout.maxWidth.page</span><div style="inline-size: 1280px;' in text

    def test_type_scale_renders_each_size_at_its_value(self, sandbox):
        text = page(sandbox)
        assert "font-size: 19px; line-height: 1.5" in text and "<code>font.size.lg</code> 19px" in text
        assert "<code>font.lineHeight.normal</code>" in text
        assert "| `font.weight.regular` | 400 |" in text

    def test_color_table_has_light_dark_and_contrast(self, sandbox):
        text = page(sandbox)
        row = next(l for l in text.splitlines() if l.startswith("| `color.foreground` |"))
        assert "`#2a2b2f`" in row and "`#ecedee`" in row
        assert "on `color.background` (needs 4.5): light 14.14:1 AA pass; dark" in row
        icon = next(l for l in text.splitlines() if l.startswith("| `color.status.info.icon` |"))
        assert "(needs 3.0): light 1.85:1 AA fail" in icon
        assert "color.palette.brand.500" not in text.split("## Components")[0]

    def test_interpolated_bindings_expand_and_default_collapses(self, sandbox):
        text = page(sandbox)
        assert "| `background` | `color.action.primary.background` |" in text
        assert "| `background` | `color.action.ghost.background` |" in text
        assert "| `surface` | `color.background` |" in text          # {surface}=default → the group itself
        assert "| `surface` | `color.background.subtle` |" in text
        assert "color.background.default" not in text

    def test_locked_and_description_columns(self, sandbox):
        text = page(sandbox)
        surface = next(l for l in text.splitlines() if l.startswith("| `surface` | `color.background` |"))
        assert surface.endswith("| yes | Page \\| subtle. |")
        assert "| `shadow` | `shadow.raised` | 0px 1px 3px 0px #0000001a | 0px 1px 3px 0px #0000001a | no |  |" in text

    def test_unresolvable_tokens_show_a_dash_rather_than_crashing(self, sandbox):
        text = page(sandbox)
        assert "| `missing` | `color.nope` | — | — | no |  |" in text
        assert "| `badSlot` | `color.{label}.x` | — | — | no |  |" in text

    def test_a_component_without_styles_still_gets_a_section(self, sandbox):
        text = page(sandbox)
        assert "## Plain\n\n[Component doc](/components/plain/)\n\n*No style bindings.*" in text

    def test_missing_components_json_is_a_clear_failure(self, sandbox, monkeypatch, capsys):
        monkeypatch.setattr(ss, "GENERATED", sandbox.parent / "nope.json")
        assert ss.main(["--theme", "fake"]) == 1
        assert "run tools/parse.ts first" in capsys.readouterr().err
