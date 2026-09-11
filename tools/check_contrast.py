"""
WCAG 2.2 contrast check for every `a11y.contrast` pair declared in component docs,
evaluated against every theme × mode. Fails the build if a pair misses its level.

    AA:  4.5:1 normal text, 3:1 large text     AAA: 7:1 normal, 4.5:1 large

Usage: python3 tools/check_contrast.py
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

import json
import re
import sys
from itertools import product
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tokens import load_theme, modes, public_name, themes  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
GENERATED = ROOT / "generated" / "components.json"
THRESHOLDS = {("AA", False): 4.5, ("AA", True): 3.0, ("AAA", False): 7.0, ("AAA", True): 4.5}


def _srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * _srgb_to_linear(r) + 0.7152 * _srgb_to_linear(g) + 0.0722 * _srgb_to_linear(b)


def contrast(fg: str, bg: str) -> float:
    l1, l2 = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def expand(token_ref: str, props: dict) -> list[str]:
    """color.action.{variant}.background → one path per enum value of `variant`."""
    slots = re.findall(r"\{([a-zA-Z]+)\}", token_ref)
    if not slots:
        return [token_ref]
    choices = []
    for s in slots:
        p = props.get(s)
        if not p or p.get("type") != "enum":
            raise ValueError(f"{token_ref}: '{{{s}}}' must name an enum prop")
        choices.append(p["values"])
    out = []
    for combo in product(*choices):
        ref = token_ref
        for s, v in zip(slots, combo):
            ref = ref.replace(f"{{{s}}}", v)
        out.append(ref[: -len(".default")] if ref.endswith(".default") else ref)  # public names drop a trailing .default
    return out


def main() -> int:
    if not GENERATED.exists():
        print("✖ generated/components.json missing — run tools/parse.ts first", file=sys.stderr)
        return 1
    components = json.loads(GENERATED.read_text())
    palettes = {
        f"{t}/{m}": {public_name(p): e["$value"] for p, e in load_theme(t, m).items()}
        for t in themes() for m in modes(t)
    }
    failures = 0
    checked = 0
    for comp in components:
        c = comp["component"]
        for pair in c.get("a11y", {}).get("contrast", []) or []:
            level, large = pair.get("level", "AA"), pair.get("large", False)
            need = THRESHOLDS[(level, large)]
            fgs = expand(pair["foreground"], c["props"])
            bgs = expand(pair["background"], c["props"])
            # Pairs expanded from the same prop slot are zipped (variant↔variant), not crossed.
            combos = zip(fgs, bgs) if len(fgs) == len(bgs) > 1 else product(fgs, bgs)
            for fg_ref, bg_ref in combos:
                for theme, tokens in palettes.items():
                    fg, bg = tokens.get(fg_ref), tokens.get(bg_ref)
                    if fg is None or bg is None:
                        print(f"✖ {c['name']}: unknown token {fg_ref if fg is None else bg_ref}")
                        failures += 1
                        continue
                    if bg == "transparent":  # ghost etc. — check against page background instead
                        bg = tokens["color.background"]
                    ratio = contrast(fg, bg)
                    checked += 1
                    ok = ratio >= need
                    failures += 0 if ok else 1
                    mark = "✔" if ok else "✖"
                    print(f"{mark} {c['name']:<8} {theme:<18} {fg_ref} on {bg_ref}: {ratio:.2f}:1 (needs {need} for {level})")
    print(f"\n{checked} pairs checked, {failures} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
