"""
Gap digest — what the generator had to guess, sorted by who has to act on it.

regen.ps1 pauses between phases so the gaps can be folded into the docs before the next phase composes
those components. This reads every generated/gaps/<Name>.<platform>.md (the per-round bullet lists the
generator reports) and every generated/generate.lock*.json (gate results) and writes
generated/gaps/SUMMARY.md: one section per component, newest round first, each line classified as

  DOC      the doc was ambiguous or silent — fix site/src/content/docs/components/<name>.md
  CODE     a pre-existing bug the model fixed or worked around — review the fix, then encode the rule
  TOOLING  the environment got in the way (permission denied, missing node_modules, a gate that could not run)
  NOISE    a repeat of an earlier line in the same file, or "no changes were needed" — collapsed to a count

DOC lines come first, with the doc path the fix belongs in. The digest ends with a checklist of every
target whose gates failed, and which gate, from the lockfiles.

Usage:  python3 tools/gap_digest.py [--phase Core] [--out generated/gaps/SUMMARY.md]
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse
import datetime as dt
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAPS = ROOT / "generated" / "gaps"
LOCK_DIR = ROOT / "generated"
DOCS_REL = "site/src/content/docs/components"

ROUND = re.compile(r"^## (.+?) — round (\d+)\s*$", re.M)
KEYWORDS = {
    "TOOLING": ["denied", "could not run", "no node_modules", "typecheck could not", "not installed", "permission"],
    "CODE": ["pre-existing", "already existed", "bug"],
    "DOC": ["spec does not say", "unspecified", "ambiguous", "chose", "assumed", "not stated", "not specified",
            "spec is silent", "does not specify", "interpretation", "guess"],
}
NOISE_PHRASES = ["no changes were needed", "no changes needed", "nothing to change", "no gaps"]
ORDER = ["DOC", "CODE", "TOOLING"]


def classify(line: str, seen: set[str]) -> str:
    """One category per line. A repeat of an earlier line in the same file is NOISE regardless of its words."""
    key = re.sub(r"\s+", " ", line.strip().lower())
    if key in seen:
        return "NOISE"
    seen.add(key)
    if any(p in key for p in NOISE_PHRASES):
        return "NOISE"
    for cat in ("TOOLING", "CODE", "DOC"):
        if any(k in key for k in KEYWORDS[cat]):
            return cat
    return "DOC"  # the doc is the default owner of an unexplained guess


def parse_gap_file(path: Path) -> dict:
    """{component, platform, rounds: [{when, round, lines: [(category, text)]}]} newest round first."""
    stem = path.stem
    component, platform = stem.rsplit(".", 1) if "." in stem else (stem, "")
    text = path.read_text(encoding="utf-8")
    seen: set[str] = set()
    rounds = []
    matches = list(ROUND.finditer(text))
    for i, m in enumerate(matches):
        body = text[m.end(): matches[i + 1].start() if i + 1 < len(matches) else len(text)]
        lines = [(classify(ln[2:], seen), ln[2:].strip()) for ln in body.splitlines() if ln.startswith("- ")]
        rounds.append({"when": m.group(1).strip(), "round": int(m.group(2)), "lines": lines})
    rounds.sort(key=lambda r: (r["when"], r["round"]), reverse=True)
    return {"component": component, "platform": platform, "rounds": rounds}


def failed_gates(lock_dir: Path) -> list[tuple[str, list[str]]]:
    """[(target, [gate, ...])] for every lock entry with a gate that is false, across every lockfile."""
    out = {}
    for f in sorted(lock_dir.glob("generate.lock*.json")):
        for target, entry in json.loads(f.read_text(encoding="utf-8")).items():
            bad = sorted(g for g, ok in (entry.get("gates") or {}).items() if ok is False)
            if bad:
                out[target] = bad
    return sorted(out.items())


def digest(gap_files: list[dict], failures: list[tuple[str, list[str]]], phase: str | None, now: str) -> str:
    title = f"# Gap digest — phase {phase}" if phase else "# Gap digest"
    lines = [title, "", f"Generated {now} by tools/gap_digest.py. DOC lines belong in the named doc; fold them, run `node tools/py.mjs tools/parse.py`, and the affected targets become stale by prompt hash.", ""]
    by_component: dict[str, list[dict]] = {}
    for g in gap_files:
        by_component.setdefault(g["component"], []).append(g)
    totals = {c: 0 for c in ORDER + ["NOISE"]}
    for component in sorted(by_component):
        doc = f"{DOCS_REL}/{component.lower()}.md"
        lines += [f"## {component}", "", f"Doc: `{doc}`", ""]
        rounds = sorted(((r, g["platform"]) for g in by_component[component] for r in g["rounds"]),
                        key=lambda x: (x[0]["when"], x[0]["round"]), reverse=True)
        for r, platform in rounds:
            counts = {c: 0 for c in ORDER + ["NOISE"]}
            for cat, _ in r["lines"]:
                counts[cat] += 1
                totals[cat] += 1
            lines.append(f"### {r['when']} — {platform} round {r['round']}")
            lines.append("")
            for cat in ORDER:
                items = [t for c, t in r["lines"] if c == cat]
                if not items:
                    continue
                for t in items:
                    suffix = f" → `{doc}`" if cat == "DOC" else ""
                    lines.append(f"- **{cat}** {t}{suffix}")
            if counts["NOISE"]:
                lines.append(f"- NOISE: {counts['NOISE']} repeated or empty line(s) collapsed")
            if not r["lines"]:
                lines.append("- (no gaps reported)")
            lines.append("")
    lines += ["## Totals", "", " · ".join(f"{c}: {n}" for c, n in totals.items()), ""]
    lines += ["## Gates to fix", ""]
    if failures:
        lines += [f"- [ ] {target} — {', '.join(gates)}" for target, gates in failures]
    else:
        lines.append("- none: every recorded target passed its gates")
    lines.append("")
    return "\n".join(lines)


def build(gaps_dir: Path = GAPS, lock_dir: Path = LOCK_DIR, phase: str | None = None, now: str | None = None) -> str:
    files = [parse_gap_file(f) for f in sorted(gaps_dir.glob("*.md")) if f.name != "SUMMARY.md"] if gaps_dir.exists() else []
    return digest(files, failed_gates(lock_dir), phase, now or dt.datetime.now().isoformat(timespec="minutes"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", help="goes in the heading, e.g. the regen.ps1 phase that just finished")
    ap.add_argument("--out", default=str(GAPS / "SUMMARY.md"))
    a = ap.parse_args()
    text = build(GAPS, LOCK_DIR, phase=a.phase)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    n_doc = text.count("- **DOC**")
    n_gates = len([ln for ln in text.splitlines() if ln.startswith("- [ ] ")])
    print(f"✔ gap digest: {n_doc} DOC line(s), {n_gates} failed target(s) → {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
