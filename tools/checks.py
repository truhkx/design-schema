"""
The deterministic gates a generated component must pass. Used by tools/generate.py after
every model round, and runnable on its own as a build step:

    python3 tools/checks.py --platform web            # all gates for one platform
    python3 tools/checks.py --platform rn --skip typecheck

Each gate is a (name, argv, cwd) triple. A gate passes when its process exits 0. The
model never sees the gate definitions, only their output — the docs are the spec, these
are the rubric.

Gates today:
  literals   tools/lint_literals.py            no hex/px/ms/font literals in the package
  typecheck  pnpm --filter <pkg> typecheck     the real TypeScript typings (needs node_modules)
  keyboard   tools/keyboard_tests.py + Playwright   every `keyboard` rule with an `expect`, against the Keyboard story  (--with keyboard)
  axe        tests/gates/axe.spec.ts + Playwright   axe over every story, light and dark                                (--with axe)
  behavior   tools/behavior_tests.py + pnpm test    every `behavior` scenario, against the real component module        (--with behavior)
  contrast   tools/check_contrast.py           every declared pair, every theme × mode (doc-level, cheap, run anyway)
  parse      tools/parse.py                    the docs still validate (a generator may not edit docs, but be sure)

Planned (see process/generation-pipeline.md): axe over Storybook stories; Playwright keyboard tests
derived from a11y.requires; a "no new dependencies" diff on package.json.
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import argparse
import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = {"web": "react", "lit": "lit", "rn": "rn"}
PY = sys.executable or "python3"


@dataclass
class Gate:
    name: str
    argv: list[str]
    cwd: Path = ROOT
    shell: bool = False


@dataclass
class GateResult:
    name: str
    ok: bool
    output: str


def pnpm() -> str:
    return shutil.which("pnpm") or shutil.which("pnpm.cmd") or "pnpm"


BROWSER_GATES = {"keyboard", "axe"}  # need Playwright + browsers; opt in with --with


def gates_for(platform: str, skip: set[str] | None = None, extra: set[str] | None = None) -> list[Gate]:
    skip = skip or set()
    extra = extra or set()
    pkg = PKG[platform]
    all_gates = [
        Gate("parse", [PY, str(ROOT / "tools" / "parse.py")]),
        Gate("contrast", [PY, str(ROOT / "tools" / "check_contrast.py")]),
        Gate("literals", [PY, str(ROOT / "tools" / "lint_literals.py"), "--platform", platform]),
        Gate("typecheck", [pnpm(), "--filter", f"@design-schema/{pkg}", "typecheck"]),
    ]
    if "keyboard" in extra and platform in ("web", "lit"):
        all_gates.append(Gate("keyboard", [PY, str(ROOT / "tools" / "keyboard_tests.py")]))
        all_gates.append(Gate("keyboard-run", [pnpm(), "exec", "playwright", "test", f"--project=keyboard-{platform}"]))
    if "axe" in extra:
        all_gates.append(Gate("axe", [pnpm(), "exec", "playwright", "test", f"--project=axe-{platform}"]))
    if "behavior" in extra:
        all_gates.append(Gate("behavior", [PY, str(ROOT / "tools" / "behavior_tests.py")]))
        # `pnpm --filter <pkg> test -- <pattern>` forwards a literal "--" into vitest/jest on this
        # pnpm (10.17), which then ignores the pattern and runs every test file; `run test <pattern>`
        # (no "--") forwards the pattern alone and filters correctly on all three runners.
        all_gates.append(Gate("behavior-run", [pnpm(), "--filter", f"@design-schema/{pkg}", "run", "test", "generated/behavior"]))
    return [g for g in all_gates if g.name not in skip]


def run_gate(g: Gate) -> GateResult:
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1", "FORCE_COLOR": "0"}
    try:
        p = subprocess.run(g.argv if not g.shell else " ".join(g.argv), cwd=g.cwd, shell=g.shell, env=env,
                           capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=900)
        out = (p.stdout or "") + (p.stderr or "")
        return GateResult(g.name, p.returncode == 0, out.strip())
    except FileNotFoundError as e:
        return GateResult(g.name, False, f"{g.argv[0]} not found: {e}")
    except subprocess.TimeoutExpired:
        return GateResult(g.name, False, "timed out after 900s")


def run_all(platform: str, skip: set[str] | None = None, verbose: bool = True, extra: set[str] | None = None) -> list[GateResult]:
    results = []
    for g in gates_for(platform, skip, extra):
        r = run_gate(g)
        results.append(r)
        if verbose:
            tail = r.output.splitlines()[-1] if r.output else ""
            print(f"  {'✔' if r.ok else '✖'} {r.name:<10} {tail[:110]}")
    return results


def failures_as_prompt(results: list[GateResult], limit: int = 6000) -> str:
    """The text handed back to the model: only failing gates, trimmed."""
    parts = []
    for r in results:
        if r.ok:
            continue
        out = r.output
        if len(out) > limit:
            out = out[-limit:]
        parts.append(f"### Gate `{r.name}` FAILED\n```\n{out}\n```")
    return "\n\n".join(parts)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--platform", required=True, choices=list(PKG))
    ap.add_argument("--skip", action="append", default=[], help="gate name to skip (repeatable)")
    ap.add_argument("--with", dest="extra", action="append", default=[], help="browser gate to add: keyboard, axe (repeatable)")
    a = ap.parse_args()
    print(f"== gates for {a.platform}")
    rs = run_all(a.platform, set(a.skip), extra=set(a.extra))
    bad = [r for r in rs if not r.ok]
    for r in bad:
        print(f"\n--- {r.name}\n{r.output[-3000:]}")
    sys.exit(1 if bad else 0)
