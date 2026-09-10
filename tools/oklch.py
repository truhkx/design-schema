"""
Minimal sRGB ⇄ OKLCH color math (Björn Ottosson's OKLab), no dependencies.

OKLCH is used for ramp generation because equal steps in L look equal to the eye,
and hue stays stable as lightness changes — which HSL famously does not.
"""
from __future__ import annotations

import math

# ---------- sRGB <-> linear ----------

def _to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _to_srgb(c: float) -> float:
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def hex_to_rgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def rgb_to_hex(rgb: tuple[float, float, float]) -> str:
    return "#" + "".join(f"{round(min(1, max(0, c)) * 255):02x}" for c in rgb)


# ---------- linear sRGB <-> OKLab ----------

def linear_to_oklab(r: float, g: float, b: float) -> tuple[float, float, float]:
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def oklab_to_linear(L: float, a: float, b: float) -> tuple[float, float, float]:
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    return (
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )


# ---------- OKLCH ----------

def hex_to_oklch(h: str) -> tuple[float, float, float]:
    r, g, b = (_to_linear(c) for c in hex_to_rgb(h))
    L, a, bb = linear_to_oklab(r, g, b)
    C = math.hypot(a, bb)
    H = math.degrees(math.atan2(bb, a)) % 360
    return L, C, H


def oklch_to_hex(L: float, C: float, H: float) -> str:
    """Convert, reducing chroma until the color fits in sRGB (hue and lightness preserved)."""
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    lo, hi = 0.0, 1.0
    rgb = None
    for _ in range(24):  # binary search on a chroma scale factor
        k = (lo + hi) / 2
        lin = oklab_to_linear(L, a * k, b * k)
        if all(-0.0005 <= c <= 1.0005 for c in lin):
            rgb, lo = lin, k
        else:
            hi = k
    if rgb is None:
        rgb = oklab_to_linear(L, 0, 0)
    return rgb_to_hex(tuple(_to_srgb(min(1, max(0, c))) for c in rgb))  # type: ignore[arg-type]


# ---------- WCAG ----------

def luminance(h: str) -> float:
    r, g, b = (_to_linear(c) for c in hex_to_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg: str, bg: str) -> float:
    l1, l2 = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)
