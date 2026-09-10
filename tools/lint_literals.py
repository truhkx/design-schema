"""
Deterministic gate: generated components may not carry design literals.

Scans packages/{react,lit,rn}/src for hard-coded colors, pixel sizes, durations and
font stacks. Everything visual must come from a token (CSS custom property or the RN
token object). This is the rule the prompts state; this script is what enforces it.

Sanctioned literals (documented in the templates):
  - 0, 1em / 1lh style relative units, percentages, `currentColor`, `transparent`, `inherit`
  - the visually-hidden clip pattern (1px / -1px), only on a line that also says "visually"/"hidden"/"clip"
  - opacity values 0..1 and unitless numbers (line-height multipliers are tokens, but math on them is not)
  - anything on a line ending with `// literal-ok: <reason>` or `/* literal-ok: <reason> */`

Usage:  python3 tools/lint_literals.py [--platform web|lit|rn] [--files a.tsx b.css ...]
Exit 1 on any finding.
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = {"web": "react", "lit": "lit", "rn": "rn"}

RULES = [
    ("hex color", re.compile(r"(?<![\w&])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")),
    ("rgb/hsl/oklch color", re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(")),
    ("pixel literal", re.compile(r"(?<![\w.-])-?\d+(?:\.\d+)?px\b")),
    ("duration literal", re.compile(r"(?<![\w.-])\d+(?:\.\d+)?m?s\b")),
    ("font stack literal", re.compile(r"font-family\s*:(?!\s*(?:var\(|inherit))[^;]+;|fontFamily\s*:\s*['\"]")),
    ("named color", re.compile(r"(?<![\w-])(?:white|black|red|blue|green|gray|grey|silver|orange|yellow)(?![\w-])")),
]
# Numbers that look like sizes in RN style objects: `width: 20,` `padding: 8` — but not 0/1/-1, indices, or opacity.
RN_NUMBER = re.compile(r"\b(?:width|height|min(?:Width|Height)|max(?:Width|Height)|padding\w*|margin\w*|gap|borderRadius|borderWidth|fontSize|lineHeight|top|left|right|bottom|size)\s*:\s*(-?\d+(?:\.\d+)?)\b")
ALLOWED_NUMBERS = {"0", "1", "-1", "2", "-2"}  # 1/2 for hairlines and half-offsets in math; everything else is a token
OK_MARK = re.compile(r"literal-ok:")
HIDDEN_CONTEXT = re.compile(r"visually|hidden|clip", re.I)
COLOR_MIX_OK = re.compile(r"color-mix\([^;]*?var\(--", re.S)  # mixing tokens (with transparent) is fine


def scan_file(path: Path) -> list[tuple[int, str, str]]:
    findings = []
    is_rn = "packages/rn/" in path.as_posix()
    in_comment = False
    lines = path.read_text(encoding="utf-8").splitlines()
    for n, line in enumerate(lines, 1):
        stripped = line.strip()
        context = "\n".join(lines[max(0, n - 8) : n + 3])  # the surrounding rule, for the clip-pattern and color-mix exemptions
        if stripped.startswith("/*"):
            in_comment = "*/" not in stripped
            continue
        if in_comment:
            in_comment = "*/" not in stripped
            continue
        if stripped.startswith(("//", "*")) or OK_MARK.search(line):
            continue
        code = line.split("//")[0] if not line.lstrip().startswith("http") else line
        for name, rx in RULES:
            for m in rx.finditer(code):
                tok = m.group(0)
                if name == "pixel literal" and tok.lstrip("-") == "1px" and HIDDEN_CONTEXT.search(context):
                    continue
                if name == "pixel literal" and tok in ("0px",):
                    continue
                if name == "rgb/hsl/oklch color" and tok.startswith("color-mix") and COLOR_MIX_OK.search(context):
                    continue
                if name == "named color" and re.search(r"['\"`][^'\"`]*\b" + re.escape(tok) + r"\b[^'\"`]*['\"`]", code) and "color" not in code.lower():
                    continue  # a word in a label string, not a color
                if name == "duration literal" and re.search(r"\d+(?:ms|s)\b", tok) and ("import" in code or "story" in path.name):
                    continue
                findings.append((n, name, tok))
        if is_rn and ".stories." not in path.name:
            for m in RN_NUMBER.finditer(code):
                if m.group(1) not in ALLOWED_NUMBERS:
                    findings.append((n, "RN size literal", m.group(0)))
    return findings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--platform", choices=list(PKG))
    ap.add_argument("--files", nargs="*")
    a = ap.parse_args()
    files: list[Path] = []
    if a.files:
        files = [Path(f) if Path(f).is_absolute() else ROOT / f for f in a.files]
    else:
        for plat, pkg in PKG.items():
            if a.platform and plat != a.platform:
                continue
            files += sorted((ROOT / "packages" / pkg / "src").glob("*"))
    total = 0
    for f in files:
        if not f.is_file() or f.suffix not in {".ts", ".tsx", ".css"} or f.name.endswith(".d.ts"):
            continue
        for n, name, tok in scan_file(f):
            rel = f.relative_to(ROOT) if f.is_relative_to(ROOT) else f
            print(f"✖ {rel}:{n}: {name} `{tok}` — use a token (or mark `literal-ok: <reason>`)")
            total += 1
    print(f"{'✖' if total else '✔'} lint_literals: {total} finding(s) in {len(files)} file(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
