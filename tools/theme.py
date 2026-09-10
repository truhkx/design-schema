"""
Theme generator: theme doc frontmatter → DTCG token files.

For every site/src/content/docs/themes/*.md with a `theme:` block:
  1. validate against schema/theme.schema.json
  2. derive ramps in OKLCH (neutral tinted toward the seed hue, brand around the seed, status hues)
  3. derive type scale, spacing, radius, target sizes from scale/density/radius
  4. choose semantic mappings per mode so declared contrast floors hold (then check_contrast.py proves it)
  5. apply `overrides`
  6. write tokens/themes/<id>/{base,light,dark}.json

Usage: python3 tools/theme.py
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import json
import re
import sys
from pathlib import Path

import yaml

try:
    from jsonschema import Draft202012Validator as Validator
except ImportError:
    from jsonschema import Draft7Validator as Validator

sys.path.insert(0, str(Path(__file__).resolve().parent))
from oklch import contrast, hex_to_oklch, oklch_to_hex  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "site" / "src" / "content" / "docs" / "themes"
SCHEMA = ROOT / "schema" / "theme.schema.json"
OUT = ROOT / "tokens" / "themes"
FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)

# OKLCH lightness targets. Equal perceptual steps; ends pinned to white/black.
NEUTRAL_L = {"0": 1.0, "50": 0.975, "100": 0.945, "200": 0.89, "300": 0.80, "400": 0.67, "500": 0.55,
             "600": 0.46, "700": 0.38, "800": 0.29, "900": 0.21, "1000": 0.0}
RAMP_L = {"50": 0.97, "100": 0.93, "200": 0.87, "300": 0.78, "400": 0.68, "500": 0.58, "600": 0.50,
          "700": 0.42, "800": 0.34, "900": 0.26}
SYSTEM_SANS = ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"]
SYSTEM_MONO = ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
RADIUS = {"none": (0, 0, 0, 0), "sm": (2, 4, 6, 999), "md": (4, 8, 12, 999), "lg": (8, 12, 16, 999), "full": (999, 999, 999, 999)}
DENSITY = {"compact": 0.75, "comfortable": 1.0, "roomy": 1.25}
RHYTHM = {"tight": 0.75, "normal": 1.0, "loose": 1.5}
ELEVATION = {"flat": 0.0, "subtle": 1.0, "pronounced": 1.6}  # multiplier on overlay shadow blur and opacity
MOTION = {"none": {"fast": "0ms", "base": "0ms"}, "subtle": {"fast": "120ms", "base": "200ms"}, "expressive": {"fast": "160ms", "base": "320ms"}}
SIZE_NAMES = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"]


def T(v, **extra):  # DTCG token
    return {"$value": v, **extra}


def ramp(hue: float, chroma_peak: float, L_targets: dict[str, float], seed_L: float | None = None) -> dict:
    """Chroma peaks near the seed lightness and tapers toward both ends so tints and shades stay clean."""
    out = {}
    for step, L in L_targets.items():
        if L in (0.0, 1.0):
            c = 0.0
        else:
            center = seed_L if seed_L is not None else 0.58
            falloff = 1 - min(1, abs(L - center) / 0.55) ** 2
            c = chroma_peak * max(0.15, falloff)
        out[step] = T(oklch_to_hex(L, c, hue))
    return out


# Two-seed palettes. With `seed.neutral` the grays take that color's hue and (capped) chroma instead of a faint
# cast of the brand hue, the light-mode page is that color lifted rather than white, and the darkest step stays
# warm rather than pure black. Without it nothing below runs and the output is byte-identical to before.
NEUTRAL_CHROMA_MAX = 0.06
NEUTRAL_TOP_LIFT = 0.15
NEUTRAL_TOP_MAX = 0.96
NEUTRAL_TOP_MIN = 0.86   # a dark "neutral" seed still needs a light page to sit on
NEUTRAL_BOTTOM = 0.10    # the darkest step: near-black with the hue kept, never #000
# Below this chroma the brand is "ink": the darkest neutral is the action fill in light mode, the lightest in dark.
INK_CHROMA = 0.03


def neutral_targets(neutral_L: float) -> dict[str, float]:
    """NEUTRAL_L with the light end compressed under min(L + 0.15, 0.96) and the dark end lifted off 0.0."""
    top = max(NEUTRAL_TOP_MIN, min(neutral_L + NEUTRAL_TOP_LIFT, NEUTRAL_TOP_MAX))
    out = {}
    for step, L in NEUTRAL_L.items():
        if L >= 0.80:
            out[step] = round(0.80 + (L - 0.80) * (top - 0.80) / 0.20, 4)
        elif L <= 0.21:
            out[step] = round(NEUTRAL_BOTTOM + (L / 0.21) * (0.21 - NEUTRAL_BOTTOM), 4)
        else:
            out[step] = L
    return out


def is_ink(seed_color: str) -> bool:
    return hex_to_oklch(seed_color)[1] < INK_CHROMA


def lightest_passing(candidates: list[str], ramp_: dict, against: str, floor: float) -> str:
    """First step (in the given order) whose contrast against `against` meets the floor."""
    for step in candidates:
        if contrast(ramp_[step]["$value"], against) >= floor:
            return step
    return candidates[-1]


def derive_base(t: dict) -> dict:
    seed_L, seed_C, seed_H = hex_to_oklch(t["seed"]["color"])
    tint = t.get("neutralTint", 0.2)
    hues = {"danger": 25, "success": 145, "warning": 80, "info": None, **t.get("statusHues", {})}
    neutral_seed = t["seed"].get("neutral")
    if neutral_seed:
        n_L, n_C, n_H = hex_to_oklch(neutral_seed)
        neutral = ramp(n_H, min(n_C, NEUTRAL_CHROMA_MAX), neutral_targets(n_L), seed_L=n_L)
    else:
        neutral = ramp(seed_H, 0.03 * tint, NEUTRAL_L, seed_L=0.5)
    palette = {
        "$description": "Derived by tools/theme.py — edit the theme doc, not this file.",
        "neutral": neutral,
        "brand": ramp(seed_H, seed_C, RAMP_L, seed_L=seed_L),
        "danger": ramp(hues["danger"], 0.19, RAMP_L),
        "success": ramp(hues["success"], 0.17, RAMP_L),
        "warning": ramp(hues["warning"], 0.16, RAMP_L),
        "info": ramp(hues["info"] if hues["info"] is not None else seed_H, 0.15, RAMP_L),
    }
    # Typography
    face = t["seed"].get("typeface", "system")
    heading_face = t["seed"].get("headingTypeface", face)
    mono = t["seed"].get("mono", "system")
    stack = lambda f, base: base if f == "system" else [f, *base]  # noqa: E731
    base_px, ratio = t["scale"]["base"], t["scale"]["ratio"]
    sizes = {name: T(f"{round(base_px * ratio ** (i - 2))}px") for i, name in enumerate(SIZE_NAMES)}
    # Spacing on a 4px grid scaled by density
    mult = DENSITY[t["density"]]
    steps = {"0": 0, "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32, "10": 40, "12": 48, "16": 64, "20": 80}
    space = {k: T(f"{round(v * mult)}px") for k, v in steps.items()}
    space.update({"sm": T("{space.2}"), "md": T("{space.3}"), "lg": T("{space.4}")})
    # Layout rhythm: BETWEEN components and at page level. Density already scales `space`; rhythm scales the
    # between-component steps again so a compact tool and a loose marketing page can share one density.
    layout_d = t.get("layout") or {}
    rhythm = RHYTHM[layout_d.get("rhythm", "normal")]
    content_w = int(layout_d.get("contentWidth", 960))
    px = lambda v: T(f"{round(v)}px")  # noqa: E731
    layout = {
        "$type": "dimension",
        "gutter": {"$description": "Horizontal page padding at each breakpoint.",
                   "narrow": T("{space.4}"), "default": T("{space.6}"), "wide": T("{space.8}")},
        "section": {"$description": "Vertical space between page sections (a Landmark, a heading group, a card row).",
                    "sm": px(32 * mult * rhythm), "md": px(48 * mult * rhythm), "lg": px(64 * mult * rhythm)},
        "gap": {"$description": "Gap between siblings in either direction — the presets Stack, Card and Container expose. Scaled by density and rhythm.",
                "none": T("{space.0}"), "tight": px(4 * mult * rhythm), "normal": px(8 * mult * rhythm), "loose": px(16 * mult * rhythm), "section": px(32 * mult * rhythm)},
        "inset": {"$description": "Padding presets surfaces expose (Box, Card): sm/md/lg map to the space aliases.",
                  "none": T("{space.0}"), "sm": T("{space.sm}"), "md": T("{space.md}"), "lg": T("{space.lg}"), "xl": T("{space.8}")},
        "maxWidth": {"$description": "Column widths. prose is a 65-character measure at the body size (px, so React Native can use it).",
                     "prose": px(base_px * 0.55 * 65), "content": px(content_w), "page": px(content_w * 4 / 3)},
    }
    r_sm, r_md, r_lg, r_full = RADIUS[t["radius"]]
    motion = MOTION[t.get("motion", "subtle")]
    return {
        "color": {"$type": "color", "palette": palette},
        "font": {
            "family": {"$type": "fontFamily",
                       "body": T(stack(face, SYSTEM_SANS)),
                       "heading": T(stack(heading_face, SYSTEM_SANS)),
                       "mono": T(stack(mono, SYSTEM_MONO))},
            "weight": {"$type": "fontWeight", "regular": T(400), "medium": T(500), "semibold": T(600), "bold": T(700)},
            "size": {"$type": "dimension", **sizes},
            "lineHeight": {"$type": "number", "tight": T(1.2), "normal": T(1.5), "loose": T(1.7)},
        },
        "space": {"$type": "dimension", **space},
        "layout": layout,
        "size": {"$type": "dimension", "target": {"min": T("24px"), "comfortable": T("44px")}},
        "radius": {"$type": "dimension", "none": T("0px"), "sm": T(f"{r_sm}px"), "md": T(f"{r_md}px"), "lg": T(f"{r_lg}px"), "full": T(f"{r_full}px")},
        "border": {"width": {"$type": "dimension", "thin": T("1px"), "focus": T("2px")}},
        "opacity": {"$type": "number", "disabled": T(0.5)},
        # Stacking order for overlays. Numbers, not dimensions; the same on every platform (zIndex on RN).
        "layer": {"$type": "number", "base": T(0), "raised": T(1), "dropdown": T(100), "sheet": T(200), "dialog": T(300), "toast": T(400)},
        "motion": {
            "duration": {"$type": "duration", "fast": T(motion["fast"]), "base": T(motion["base"]), "loop": T("800ms")},
            "easing": {"$type": "cubicBezier", "standard": T([0.2, 0, 0, 1]), "exit": T([0.4, 0, 1, 1])},
        },
    }


def status_colors(p: dict, mode: str, bg: str) -> dict:
    """color.status.<tone>.{background, foreground, border} for info/success/warning/danger.
    Light: tinted 50 background with the darkest-passing text; dark: 900 background with a light tint as text."""
    out = {}
    ref = lambda path: f"{{{path}}}"  # noqa: E731
    for tone in ("info", "success", "warning", "danger"):
        ramp_ = p[tone]
        if mode == "light":
            surface = "50"
            text = lightest_passing(["600", "700", "800", "900"], ramp_, ramp_[surface]["$value"], 4.5)
            border = "300"
            icon = lightest_passing(["600", "700"], ramp_, bg, 3.0)
        else:
            surface = "900"
            text = lightest_passing(["200", "100", "50"], ramp_, ramp_[surface]["$value"], 4.5)
            border = "700"
            icon = lightest_passing(["300", "200"], ramp_, bg, 3.0)
        out[tone] = {"background": T(ref(f"color.palette.{tone}.{surface}")), "foreground": T(ref(f"color.palette.{tone}.{text}")),
                     "border": T(ref(f"color.palette.{tone}.{border}")), "icon": T(ref(f"color.palette.{tone}.{icon}"))}
    return out


def control_pair(b: dict, n: dict, bg: str, control_bg: str, candidates: list[str]) -> tuple[str, str]:
    """(selectedBackground step, selectedForeground neutral step) for checks/radios/switch tracks.
    The fill must read as a UI boundary (3:1 against both the page and the control surface, WCAG 1.4.11)
    and its indicator must read as text (4.5:1). Dark modes usually need a lighter brand step with dark ink."""
    for step in candidates:
        fill = b[step]["$value"]
        if contrast(fill, bg) < 3.0 or contrast(fill, control_bg) < 3.0:
            continue
        for ink in ("0", "1000"):
            if contrast(n[ink]["$value"], fill) >= 4.5:
                return step, ink
    return candidates[-1], "0"


def focus_step(b: dict, page_bg: str, control_bg: str, candidates: list[str]) -> str:
    """The brand step that reads as a boundary (3:1, WCAG 1.4.11) against both the page and the control surface."""
    for step in candidates:
        if contrast(b[step]["$value"], page_bg) >= 3.0 and contrast(b[step]["$value"], control_bg) >= 3.0:
            return step
    return candidates[-1]


def apply_ink(semantic: dict, b: dict, n: dict, mode: str, bg: str, control_bg: str) -> None:
    """The achromatic brand rule. An ink seed has no hue to carry an action, so the fill is the darkest neutral on
    a light page and the lightest neutral on a dark one (the inverse), with the opposite end as its text; links are
    the text color (Link always underlines, so color was never the only cue); the focus ring is the brand step that
    passes 3:1 on both surfaces; the selected control fill follows the same inversion. Status hues are untouched."""
    ref = lambda path: f"{{{path}}}"  # noqa: E731
    dark = mode == "dark"
    fill, ink, hover = ("0", "1000", "100") if dark else ("1000", "0", "800")
    semantic["action"]["primary"] = {"background": T(ref(f"color.palette.neutral.{fill}")),
                                     "backgroundHover": T(ref(f"color.palette.neutral.{hover}")),
                                     "foreground": T(ref(f"color.palette.neutral.{ink}"))}
    semantic["link"] = {"default": T(ref("color.foreground.default")), "hover": T(ref("color.foreground.strong")),
                        "visited": T(ref("color.foreground.muted"))}
    candidates = ["300", "400", "200", "500"] if dark else ["500", "600", "700", "400"]
    semantic["border"]["focus"] = T(ref(f"color.palette.brand.{focus_step(b, bg, control_bg, candidates)}"))
    semantic["control"]["selectedBackground"] = T(ref(f"color.palette.neutral.{fill}"))
    semantic["control"]["selectedForeground"] = T(ref(f"color.palette.neutral.{ink}"))


def alpha_hex(hex_color: str, alpha: float) -> str:
    return f"{hex_color[:7]}{round(alpha * 255):02x}"


def shadows(ink: str, elevation: float, dark: bool) -> dict:
    """Two elevation steps as DTCG shadow objects. Dark modes need stronger shadows to read at all."""
    a_raised, a_overlay = (0.35, 0.5) if dark else (0.10, 0.18)
    def sh(y, blur, a):
        return T({"color": alpha_hex(ink, min(1.0, a * elevation)), "offsetX": "0px", "offsetY": f"{round(y * elevation)}px",
                  "blur": f"{round(blur * elevation)}px", "spread": "0px"})
    return {"$type": "shadow", "raised": sh(1, 3, a_raised), "overlay": sh(8, 24, a_overlay)}


def inverse_colors(p: dict, mode: str) -> dict:
    """color.inverse.* — the flipped surface used by Tooltip and Toast (dark on light, light on dark).
    Every step is chosen for contrast against the inverse surface, so text, links and status icons read on it."""
    n, b = p["neutral"], p["brand"]
    ref = lambda path: f"{{{path}}}"  # noqa: E731
    if mode == "light":
        surface_step, fg, muted_cands, link_cands, icon_cands = "900", "50", ["300", "200"], ["300", "200", "100"], ["300", "200"]
    else:
        surface_step, fg, muted_cands, link_cands, icon_cands = "100", "900", ["600", "700"], ["700", "800"], ["600", "700"]
    surface = n[surface_step]["$value"]
    muted = lightest_passing(muted_cands, n, surface, 4.5)
    link = lightest_passing(link_cands, b, surface, 4.5)
    status = {"neutral": T(ref(f"color.palette.neutral.{fg}"))}
    for tone in ("info", "success", "warning", "danger"):
        status[tone] = T(ref(f"color.palette.{tone}.{lightest_passing(icon_cands, p[tone], surface, 3.0)}"))
    return {"surface": T(ref(f"color.palette.neutral.{surface_step}")), "foreground": T(ref(f"color.palette.neutral.{fg}")),
            "muted": T(ref(f"color.palette.neutral.{muted}")), "link": T(ref(f"color.palette.brand.{link}")),
            "focus": T(ref(f"color.palette.brand.{link}")), "status": status}


def derive_mode(base: dict, mode: str, elevation: float = 1.0, ink: bool | None = None) -> dict:
    p = base["color"]["palette"]
    n, b, d = p["neutral"], p["brand"], p["danger"]
    if ink is None:  # detect from the ramp when the caller does not know the seed
        ink = hex_to_oklch(b["500"]["$value"])[1] < INK_CHROMA
    white = n["0"]["$value"]
    ref = lambda path: f"{{{path}}}"  # noqa: E731
    if mode == "light":
        bg = n["0"]["$value"]
        primary = lightest_passing(["500", "600", "700"], b, white, 4.5)
        ghost = lightest_passing(["600", "700", "800"], b, bg, 4.5)
        danger = lightest_passing(["600", "700"], d, white, 4.5)
        muted = lightest_passing(["500", "600", "700"], n, n["100"]["$value"], 4.5)  # must read on background.strong too (Box/Card surfaces)
        border_strong = lightest_passing(["400", "500"], n, bg, 3.0)  # non-text UI boundary: 3:1 (WCAG 1.4.11)
        selected, selected_ink = control_pair(b, n, bg, n["0"]["$value"], ["600", "700", "500", "800"])
        semantic = {
            "foreground": {"default": T(ref("color.palette.neutral.800")), "strong": T(ref("color.palette.neutral.1000")),
                           "muted": T(ref(f"color.palette.neutral.{muted}")), "onAction": T(ref("color.palette.neutral.0")),
                           "danger": T(ref(f"color.palette.danger.{danger}"))},
            "background": {"default": T(ref("color.palette.neutral.0")), "subtle": T(ref("color.palette.neutral.50")),
                           "strong": T(ref("color.palette.neutral.100"))},
            "border": {"default": T(ref("color.palette.neutral.200")), "strong": T(ref(f"color.palette.neutral.{border_strong}")),
                       "focus": T(ref("color.palette.brand.500")), "danger": T(ref(f"color.palette.danger.{danger}"))},
            "link": {"default": T(ref(f"color.palette.brand.{ghost}")), "hover": T(ref(f"color.palette.brand.{min(900, int(ghost) + 100)}")),
                     "visited": T(ref(f"color.palette.brand.{min(900, int(ghost) + 200)}"))},
            "control": {"background": T(ref("color.palette.neutral.0")), "border": T(ref(f"color.palette.neutral.{border_strong}")),
                        "selectedBackground": T(ref(f"color.palette.brand.{selected}")), "selectedForeground": T(ref(f"color.palette.neutral.{selected_ink}")),
                        "trackOff": T(ref(f"color.palette.neutral.{border_strong}"))},
            "status": status_colors(p, "light", bg),
            "overlay": {"scrim": T(alpha_hex(n["1000"]["$value"], 0.4)), "surface": T(ref("color.palette.neutral.0"))},
            "inverse": inverse_colors(p, "light"),
            "action": {
                "primary": {"background": T(ref(f"color.palette.brand.{primary}")),
                            "backgroundHover": T(ref(f"color.palette.brand.{int(primary) + 100}")),
                            "foreground": T(ref("color.foreground.onAction"))},
                "secondary": {"background": T(ref("color.background.strong")), "backgroundHover": T(ref("color.palette.neutral.200")),
                              "foreground": T(ref("color.foreground.strong"))},
                "ghost": {"background": T("transparent"), "backgroundHover": T(ref("color.background.subtle")),
                          "foreground": T(ref(f"color.palette.brand.{ghost}"))},
                "danger": {"background": T(ref(f"color.palette.danger.{danger}")),
                           "backgroundHover": T(ref(f"color.palette.danger.{min(900, int(danger) + 100)}")),
                           "foreground": T(ref("color.foreground.onAction"))},
            },
        }
    else:
        bg = n["900"]["$value"]
        primary = lightest_passing(["500", "600", "700"], b, white, 4.5)
        ghost = lightest_passing(["300", "200", "100"], b, bg, 4.5)
        danger = lightest_passing(["500", "600"], d, white, 4.5)
        danger_fg = lightest_passing(["300", "200"], d, bg, 4.5)
        muted = lightest_passing(["400", "300", "200"], n, n["700"]["$value"], 4.5)  # must read on background.strong (neutral.700) too
        border_strong = lightest_passing(["500", "400"], n, bg, 3.0)
        selected, selected_ink = control_pair(b, n, bg, n["800"]["$value"], ["500", "400", "300", "600"])
        semantic = {
            "foreground": {"default": T(ref("color.palette.neutral.100")), "strong": T(ref("color.palette.neutral.0")),
                           "muted": T(ref(f"color.palette.neutral.{muted}")), "onAction": T(ref("color.palette.neutral.0")),
                           "danger": T(ref(f"color.palette.danger.{danger_fg}"))},
            "background": {"default": T(ref("color.palette.neutral.900")), "subtle": T(ref("color.palette.neutral.800")),
                           "strong": T(ref("color.palette.neutral.700"))},
            "border": {"default": T(ref("color.palette.neutral.700")), "strong": T(ref(f"color.palette.neutral.{border_strong}")),
                       "focus": T(ref("color.palette.brand.300")), "danger": T(ref(f"color.palette.danger.{danger_fg}"))},
            "link": {"default": T(ref(f"color.palette.brand.{ghost}")), "hover": T(ref(f"color.palette.brand.{max(50, int(ghost) - 100)}")),
                     "visited": T(ref(f"color.palette.brand.{max(50, int(ghost) - 200)}"))},
            "control": {"background": T(ref("color.palette.neutral.800")), "border": T(ref(f"color.palette.neutral.{border_strong}")),
                        "selectedBackground": T(ref(f"color.palette.brand.{selected}")), "selectedForeground": T(ref(f"color.palette.neutral.{selected_ink}")),
                        "trackOff": T(ref(f"color.palette.neutral.{border_strong}"))},
            "status": status_colors(p, "dark", bg),
            "overlay": {"scrim": T(alpha_hex(n["1000"]["$value"], 0.6)), "surface": T(ref("color.palette.neutral.800"))},
            "inverse": inverse_colors(p, "dark"),
            "action": {
                "primary": {"background": T(ref(f"color.palette.brand.{primary}")),
                            "backgroundHover": T(ref(f"color.palette.brand.{max(400, int(primary) - 100)}")),
                            "foreground": T(ref("color.foreground.onAction"))},
                "secondary": {"background": T(ref("color.background.strong")), "backgroundHover": T(ref("color.palette.neutral.600")),
                              "foreground": T(ref("color.foreground.strong"))},
                "ghost": {"background": T("transparent"), "backgroundHover": T(ref("color.background.subtle")),
                          "foreground": T(ref(f"color.palette.brand.{ghost}"))},
                "danger": {"background": T(ref(f"color.palette.danger.{danger}")),
                           "backgroundHover": T(ref(f"color.palette.danger.{min(900, int(danger) + 100)}")),
                           "foreground": T(ref("color.foreground.onAction"))},
            },
        }
    if ink:
        apply_ink(semantic, b, n, mode, bg, n["0"]["$value"] if mode == "light" else n["800"]["$value"])
    return {"color": {"$type": "color", "$description": f"Semantic layer ({mode}) — derived by tools/theme.py.", **semantic},
            "shadow": shadows(n["1000"]["$value"], elevation, dark=mode == "dark")}


def apply_overrides(tree: dict, overrides: dict) -> None:
    for path, value in overrides.items():
        node = tree
        parts = path.split(".")
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = T(value)


def main() -> int:
    validator = Validator(json.loads(SCHEMA.read_text()))
    errors, built = [], []
    for path in sorted(DOCS.glob("*.md")):
        m = FRONTMATTER.match(path.read_text(encoding="utf-8"))
        fm = yaml.safe_load(m.group(1)) if m else {}
        if "theme" not in fm:
            continue
        errs = sorted(validator.iter_errors(fm), key=lambda e: list(e.path))
        if errs:
            errors.append(f"{path.name}:\n" + "\n".join(f"  - {'.'.join(map(str, e.path)) or '(root)'}: {e.message}" for e in errs))
            continue
        t = fm["theme"]
        if t["id"] != path.stem:
            errors.append(f"{path.name}: theme.id '{t['id']}' should match file name")
            continue
        out = OUT / t["id"]
        out.mkdir(parents=True, exist_ok=True)
        base = derive_base(t)
        (out / "base.json").write_text(json.dumps(base, indent=2) + "\n")
        for mode in t["modes"]["supports"]:
            tree = derive_mode(base, mode, ELEVATION[t.get('elevation', 'subtle')], ink=is_ink(t["seed"]["color"]))
            apply_overrides(tree, (t.get("overrides") or {}).get(mode) or {})
            (out / f"{mode}.json").write_text(json.dumps(tree, indent=2) + "\n")
        (out / "theme.json").write_text(json.dumps(t, indent=2) + "\n")
        built.append(f"{t['id']} ({', '.join(t['modes']['supports'])})")
    for e in errors:
        print(f"✖ {e}", file=sys.stderr)
    print(f"{'✖' if errors else '✔'} themes: {', '.join(built) or 'none'} → {OUT.relative_to(ROOT)}/")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
