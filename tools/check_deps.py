"""
Deterministic gate: the generated packages may not grow runtime dependencies.

The system's promise is that a component is tokens plus platform primitives. Every runtime
dependency a package carries is one an adopter carries too, so the allowed set is fixed here
and the generator cannot widen it (a model that adds a package to package.json fails this gate).

Allowed runtime dependencies (`dependencies` + `peerDependencies`; devDependencies are free):
  tokens   none
  react    react, react-dom, @design-schema/tokens
  lit      lit, @design-schema/tokens
  rn       react, react-native, react-native-svg (decision 2026-09-10: the one third-party runtime
           dependency, for Icon), @design-schema/tokens

Usage:  python3 tools/check_deps.py            # every package
        python3 tools/check_deps.py --platform rn
Exit 1 on any finding.
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = ROOT / "packages"
PKG = {"web": "react", "lit": "lit", "rn": "rn"}

TOKENS = "@design-schema/tokens"
ALLOWED: dict[str, set[str]] = {
    "tokens": set(),
    "react": {"react", "react-dom", TOKENS},
    "lit": {"lit", TOKENS},
    "rn": {"react", "react-native", "react-native-svg", TOKENS},
}
RUNTIME_FIELDS = ("dependencies", "peerDependencies", "optionalDependencies")


def check_package(name: str, manifest: dict) -> list[str]:
    """Findings for one package.json (already parsed). Unknown packages are not checked."""
    if name not in ALLOWED:
        return []
    findings = []
    for field in RUNTIME_FIELDS:
        for dep in sorted(manifest.get(field) or {}):
            if dep not in ALLOWED[name]:
                findings.append(f"packages/{name}: {field} has '{dep}', which is not an allowed runtime dependency "
                                f"(allowed: {', '.join(sorted(ALLOWED[name])) or 'none'})")
    return findings


def check_all(packages_dir: Path = PACKAGES, only: str | None = None) -> list[str]:
    findings = []
    for name in sorted(ALLOWED):
        if only and name != only:
            continue
        manifest = packages_dir / name / "package.json"
        if not manifest.exists():
            continue
        findings += check_package(name, json.loads(manifest.read_text(encoding="utf-8")))
    return findings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--platform", choices=list(PKG), help="check only this platform's package")
    a = ap.parse_args()
    findings = check_all(PACKAGES, only=PKG[a.platform] if a.platform else None)
    for f in findings:
        print(f"✖ {f}")
    print(f"{'✖' if findings else '✔'} check_deps: {len(findings)} finding(s)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
