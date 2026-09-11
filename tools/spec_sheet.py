"""
Spec sheet: one generated docs page that shows every token value and every component
style binding for a theme, resolved in light and dark, with the WCAG contrast of the
color pairs that matter.

Reads packages/tokens/dist/<theme>/json/tokens.{light,dark}.json (values already
resolved, public dotted names) and generated/components.json; writes
site/src/content/docs/foundations/spec-sheet.md as plain Markdown + inline-styled HTML
that Starlight renders without scripts or extra CSS.

Usage: python3 tools/spec_sheet.py [--theme calm-precise]
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import argparse
import json
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_contrast import contrast, expand  # noqa: E402
from tokens import public_name, shadow_css  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "packages" / "tokens" / "dist"
GENERATED = ROOT / "generated" / "components.json"
OUT = ROOT / "site" / "src" / "content" / "docs" / "foundations" / "spec-sheet.md"
DEFAULT_THEME = "calm-precise"
MODES = ("light", "dark")
AA_TEXT, AA_GRAPHIC = 4.5, 3.0  # WCAG 1.4.3 normal text / 1.4.11 non-text (icons, borders, focus rings)

DASH = "—"
BAR_STYLE = "inline-size: {px}px; max-inline-size: 100%; block-size: 12px; background: var(--sl-color-accent, #888)"
NAME_STYLE = "display: inline-block; min-inline-size: 13rem; font-family: var(--sl-font-mono, monospace); font-size: 0.85em"
SWATCH_STYLE = ("display: inline-block; inline-size: 1.1em; block-size: 1.1em; vertical-align: -0.2em; "
                "border-radius: 3px; border: 1px solid #88888880; background: {value}")


# ---------------------------------------------------------------- inputs

def dist_themes() -> list[str]:
    """Theme ids that have a built token dist (a json/tokens.light.json)."""
    if not DIST.exists():
        return []
    return sorted(p.name for p in DIST.iterdir() if (p / "json" / "tokens.light.json").exists())


def load_tokens(theme: str, mode: str) -> dict:
    path = DIST / theme / "json" / f"tokens.{mode}.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def lookup(tokens: dict, ref: str) -> object | None:
    """Resolve a public dotted name; `x.default` is the group itself (mirrors tokens.public_name)."""
    return tokens.get(public_name(ref))


# ---------------------------------------------------------------- formatting

def px(value: object) -> int | None:
    if isinstance(value, str) and value.endswith("px"):
        try:
            return round(float(value[:-2]))
        except ValueError:
            return None
    return None


def is_color(value: object) -> bool:
    return isinstance(value, str) and (value.startswith("#") or value == "transparent")


def fmt(value: object) -> str:
    """A token value as display text; None → em dash."""
    if value is None:
        return DASH
    if isinstance(value, dict) and "offsetX" in value:
        return shadow_css(value)
    if isinstance(value, list):
        if value and all(isinstance(x, (int, float)) for x in value):
            return f"cubic-bezier({', '.join(str(x) for x in value)})"
        return ", ".join(str(x) for x in value)
    return str(value)


def css_font_family(value: object) -> str:
    """A fontFamily list as a CSS value usable inside a double-quoted style attribute."""
    if isinstance(value, list):
        return ", ".join(f"'{f}'" if " " in f else f for f in value)
    return str(value)


def swatch(value: object) -> str:
    return f'<span style="{SWATCH_STYLE.format(value=value)}"></span>' if is_color(value) else ""


def cell(value: object) -> str:
    """Table cell: swatch + value for colors, plain value otherwise, pipes escaped."""
    text = fmt(value)
    if is_color(value):
        text = f"{swatch(value)} `{text}`"
    return text.replace("|", "\\|")


def text_cell(s: str | None) -> str:
    return (s or "").replace("\r", "").replace("\n", " ").replace("|", "\\|").strip()


def table(headers: list[str], rows: list[list[str]]) -> list[str]:
    out = ["| " + " | ".join(headers) + " |", "|" + "|".join(" --- " for _ in headers) + "|"]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return out


# ---------------------------------------------------------------- sections

def bar_row(name: str, value: object) -> str:
    n = px(value)
    bar = f'<div style="{BAR_STYLE.format(px=n)}"></div>' if n is not None else ""
    return (f'<div style="display: flex; align-items: center; gap: 0.75rem; margin-block: 0.25rem">'
            f'<span style="{NAME_STYLE}">{name}</span>{bar}<span>{fmt(value)}</span></div>')


def bars(tokens: dict, names: list[str]) -> list[str]:
    # One contiguous HTML block: a blank line would end it and hand the rest to Markdown.
    return [bar_row(n, tokens[n]) for n in names] + [""]


def spacing_section(light: dict) -> list[str]:
    numbered = [k for k in light if re.fullmatch(r"space\.\d+", k)]
    numbered.sort(key=lambda k: int(k.split(".")[1]))
    aliases = [k for k in light if k.startswith("space.") and k not in numbered]
    groups = [("Gaps", "layout.gap"), ("Sections", "layout.section"), ("Insets", "layout.inset"),
              ("Gutters", "layout.gutter"), ("Max widths", "layout.maxWidth")]
    out = ["## Spacing scale", "",
           "Bars are drawn at the token's pixel value (wide values clip to the column). "
           "Components bind to the numbered steps or the `sm`/`md`/`lg` aliases; layout rhythm below is what goes *between* components.", ""]
    out += ["### Steps", ""] + bars(light, numbered)
    out += ["### Aliases", ""] + bars(light, aliases)
    out += ["## Layout rhythm", ""]
    for label, prefix in groups:
        names = [k for k in light if k == prefix or k.startswith(prefix + ".")]
        if names:
            out += [f"### {label}", ""] + bars(light, names)
    return out


def type_section(light: dict) -> list[str]:
    sizes = [k for k in light if k.startswith("font.size.")]
    line_heights = [k for k in light if k.startswith("font.lineHeight.")]
    families = [k for k in light if k.startswith("font.family.")]
    weights = [k for k in light if k.startswith("font.weight.")]
    body = css_font_family(light.get("font.family.body", "inherit"))
    normal = light.get("font.lineHeight.normal", 1.5)
    lh_text = ", ".join(f"{k.split('.')[-1]} {fmt(light[k])}" for k in line_heights)
    out = ["## Type scale", "",
           f"Each size is rendered at its own value in `font.family.body`, at `font.lineHeight.normal` ({fmt(normal)}). "
           f"Line-height tokens: {lh_text}.", ""]
    for k in sizes:
        v = light[k]
        out.append(f'<div style="margin-block: 0.5rem">'
                   f'<div style="font-family: {body}; font-size: {fmt(v)}; line-height: {fmt(normal)}">The quick brown fox jumps over the lazy dog</div>'
                   f'<div style="font-size: 0.8em; opacity: 0.8"><code>{k}</code> {fmt(v)} '
                   f'&middot; line height: {" / ".join(f"<code>{lh}</code>" for lh in line_heights)}</div></div>')
    out.append("")
    out += ["### Families and weights", ""]
    out += table(["Token", "Value"], [[f"`{k}`", cell(light[k])] for k in families + weights + line_heights])
    out.append("")
    return out


def contrast_pairs(light: dict) -> list[tuple[str, str, float]]:
    """(foreground, background, AA floor) for the pairs that matter, drawn from the tokens present."""
    pairs: list[tuple[str, str, float]] = []
    variants = sorted({k.split(".")[2] for k in light if re.fullmatch(r"color\.action\.\w+\.foreground", k)})
    for v in variants:
        pairs.append((f"color.action.{v}.foreground", f"color.action.{v}.background", AA_TEXT))
    for fg in ("color.foreground", "color.foreground.muted", "color.foreground.strong", "color.foreground.danger", "color.link"):
        if fg in light:
            pairs.append((fg, "color.background", AA_TEXT))
    if "color.border.focus" in light:
        pairs.append(("color.border.focus", "color.background", AA_GRAPHIC))
    tones = sorted({k.split(".")[2] for k in light if re.fullmatch(r"color\.status\.\w+\.background", k)})
    for t in tones:
        for part, need in (("foreground", AA_TEXT), ("icon", AA_GRAPHIC), ("border", AA_GRAPHIC)):
            if f"color.status.{t}.{part}" in light:
                pairs.append((f"color.status.{t}.{part}", f"color.status.{t}.background", need))
    if "color.control.selectedForeground" in light and "color.control.selectedBackground" in light:
        pairs.append(("color.control.selectedForeground", "color.control.selectedBackground", AA_TEXT))
    if "color.inverse.surface" in light:
        for k in light:
            if not k.startswith("color.inverse.") or k == "color.inverse.surface":
                continue
            graphic = k == "color.inverse.focus" or k.startswith("color.inverse.status.")
            pairs.append((k, "color.inverse.surface", AA_GRAPHIC if graphic else AA_TEXT))
    return pairs


def ratio(tokens: dict, fg: str, bg: str) -> float | None:
    f, b = tokens.get(fg), tokens.get(bg)
    if b == "transparent":  # ghost etc. — check against the page background, as check_contrast does
        b = tokens.get("color.background")
    if not (is_color(f) and is_color(b)) or f == "transparent" or b is None:
        return None
    try:
        return contrast(f[:7], b[:7])  # alpha channel, if any, is ignored
    except ValueError:
        return None


def contrast_text(modes: dict[str, dict], fg: str, bg: str, need: float) -> str:
    parts = []
    for mode, tokens in modes.items():
        r = ratio(tokens, fg, bg)
        if r is None:
            parts.append(f"{mode} {DASH}")
        else:
            parts.append(f"{mode} {r:.2f}:1 {'AA pass' if r >= need else 'AA fail'}")
    return f"on `{bg}` (needs {need}): " + "; ".join(parts)


def color_section(modes: dict[str, dict]) -> list[str]:
    light = modes["light"]
    names = [k for k in light if k.startswith("color.") and not k.startswith("color.palette.")]
    by_fg: dict[str, list[str]] = {}
    for fg, bg, need in contrast_pairs(light):
        by_fg.setdefault(fg, []).append(contrast_text(modes, fg, bg, need))
    rows = [[f"`{k}`", cell(light.get(k)), cell(modes["dark"].get(k)), "<br>".join(by_fg.get(k, [DASH]))] for k in names]
    out = ["## Color roles", "",
           "Semantic colors only (the `color.palette.*` ramps are raw material components never reference). "
           f"The contrast column checks text pairs against WCAG AA {AA_TEXT}:1 and icon/border/focus pairs against {AA_GRAPHIC}:1; "
           "a `transparent` background is checked against `color.background`.", ""]
    out += table(["Token", "Light", "Dark", "Contrast"], rows) + [""]
    return out


def style_rows(comp: dict, modes: dict[str, dict]) -> list[list[str]]:
    props = comp.get("props") or {}
    rows = []
    for binding, spec in (comp.get("styles") or {}).items():
        token = spec.get("token", "")
        try:
            refs = expand(token, props)
        except ValueError:
            refs = [token]  # slot names no enum prop: show it verbatim, values unresolved
        for ref in refs:
            rows.append([f"`{binding}`", f"`{ref}`",
                         cell(lookup(modes["light"], ref)), cell(lookup(modes["dark"], ref)),
                         "yes" if spec.get("locked") else "no", text_cell(spec.get("description"))])
    return rows


def components_section(components: list[dict], modes: dict[str, dict]) -> list[str]:
    out = ["## Components", "",
           "Every style binding per component, in `generated/components.json` order. Bindings with a `{prop}` slot are "
           "listed once per enum value. *Locked* bindings cannot be overridden per instance.", ""]
    for entry in components:
        comp = entry["component"]
        title = entry.get("title") or comp["name"]
        out += [f"## {title}", ""]
        if entry.get("id"):
            out += [f"[Component doc](/components/{entry['id']}/)", ""]
        rows = style_rows(comp, modes)
        if rows:
            out += table(["Binding", "Token", "Light", "Dark", "Locked", "Description"], rows)
        else:
            out.append("*No style bindings.*")
        out.append("")
    return out


# ---------------------------------------------------------------- page

def render(theme: str, all_themes: list[str], modes: dict[str, dict], components: list[dict]) -> str:
    others = [t for t in all_themes if t != theme]
    intro = (f"Generated from the built tokens of the **{theme}** theme and `generated/components.json`. "
             "Every value is the resolved light and dark value a component receives on every platform.")
    if others:
        intro += (f" Other built themes: {', '.join(f'`{t}`' for t in others)} — regenerate for one of them with "
                  f"`pnpm spec-sheet --theme <id>`.")
    lines = [
        "---",
        "title: Spec sheet",
        f"description: Every token value and every component style binding for the {theme} theme, resolved in light and dark, with contrast ratios for the color pairs that matter.",
        "sidebar:",
        "  order: 9",
        "---",
        "<!-- generated by tools/spec_sheet.py — do not edit by hand -->",
        "",
        intro,
        "",
    ]
    lines += spacing_section(modes["light"])
    lines += type_section(modes["light"])
    lines += color_section(modes)
    lines += components_section(components, modes)
    return "\n".join(lines).rstrip() + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--theme", default=DEFAULT_THEME, help=f"theme id under packages/tokens/dist/ (default {DEFAULT_THEME})")
    args = ap.parse_args(argv)

    available = dist_themes()
    if args.theme not in available:
        print(f"✖ theme '{args.theme}' has no built tokens under {DIST.relative_to(ROOT)}/ "
              f"(available: {', '.join(available) or 'none'}) — run `pnpm themes` first", file=sys.stderr)
        return 1
    if not GENERATED.exists():
        print("✖ generated/components.json missing — run tools/parse.ts first", file=sys.stderr)
        return 1

    modes = {m: load_tokens(args.theme, m) for m in MODES}
    components = json.loads(GENERATED.read_text(encoding="utf-8"))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render(args.theme, available, modes, components), encoding="utf-8")
    print(f"✔ spec sheet: {len(modes['light'])} tokens, {len(components)} components → {OUT.relative_to(ROOT).as_posix()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
